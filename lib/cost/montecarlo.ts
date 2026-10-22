/**
 * Monte Carlo: N years of a portfolio at Stage 0 vs the same operators at
 * Stage 1 (paying the higher fee). Seeded, so a shared link reproduces the
 * run. Pure; the page runs it in a Web Worker.
 */
import { EPOCHS_PER_DAY } from "./protocol";
import { inactivityLeakEth } from "./rewards";
import { F_GRID, costTables, interp, operatorsOf, primaryOperatorIndex, type CostTable } from "./model";
import type { CostParams } from "./params";

// ── Seeded RNG ──────────────────────────────────────────────────────────────

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(rng: () => number): number {
  const u = 1 - rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Marsaglia–Tsang. */
export function gamma(rng: () => number, shape: number): number {
  if (shape < 1) return gamma(rng, shape + 1) * Math.pow(rng(), 1 / shape);
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number;
    let v: number;
    do {
      x = normal(rng);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng();
    if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

export function beta(rng: () => number, a: number, b: number): number {
  const x = gamma(rng, a);
  const y = gamma(rng, b);
  return x / (x + y);
}

export function poisson(rng: () => number, lambda: number): number {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L);
  return k - 1;
}

// ── Simulation ──────────────────────────────────────────────────────────────

export interface YearStats {
  year: number;
  mean: number;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  /** P(Stage 0 has earned more than Stage 1 by this year). */
  pStage0Ahead: number;
  /** In runs where Stage 0 is ahead: its average lead, as a fraction of total stake. */
  soloGainWhenAhead: number;
  /** In runs where Stage 0 is behind: its average shortfall, as a fraction of total stake. */
  soloLossWhenBehind: number;
}

export interface MonteCarloResult {
  /** Stage 1 minus Stage 0, ETH, by year (positive = Stage 1 ahead). */
  years: YearStats[];
  /** Final-year advantage per run, ETH, sorted. */
  final: Float64Array;
  /** Net Stage 0 rewards per year, ETH: the unit for "years of rewards". */
  netRewardsPerYear0: number;
  incidents: { lucky: number; partial: number; full: number; outages: number; runs: number };
  /** Worst single-run Stage 0 loss, ETH. */
  worstStage0LossEth: number;
}

export interface SimOptions {
  /** Override the incident rate (for the heatmap). */
  incidentRatePct?: number;
  runs?: number;
  years?: number;
  /** Precomputed per-operator tables (the heatmap reuses them across cells). */
  tables?: CostTable[];
}

function quantile(sorted: Float64Array, q: number): number {
  if (sorted.length === 0) return 0;
  const x = q * (sorted.length - 1);
  const i = Math.floor(x);
  const t = x - i;
  return i + 1 < sorted.length ? sorted[i] * (1 - t) + sorted[i + 1] * t : sorted[i];
}

const FULL_THRESHOLD = 0.9;

export function simulate(p: CostParams, opts: SimOptions = {}): MonteCarloResult {
  const ops = operatorsOf(p);
  const tables = opts.tables ?? costTables(p);
  // Stage 1 replacement costs are per ETH of the pool; residual slashing uses
  // the largest exposure's curve.
  const t1 = tables[primaryOperatorIndex(p)];
  const runs = Math.max(1, Math.round(opts.runs ?? p.runs));
  const Y = Math.max(1, Math.round(opts.years ?? p.years));
  const k = ops.length;
  const m = Math.max(0, Math.round(p.extraNodes));
  const apr = p.aprPct / 100;
  const keep0 = 1 - p.fee0Pct / 100;
  const keep1 = 1 - p.fee1Pct / 100;
  const lambdaMean = (opts.incidentRatePct ?? p.incidentRatePct) / 100;
  const cv = Math.max(0, p.rateUncertainty);
  const pSlash = p.pSlashPct / 100;
  const res = p.s1ResidualPct / 100;
  const reshare = p.s1ResharePct / 100;
  const cover = p.s1LivenessCoverPct / 100;
  const epochsPerHour = EPOCHS_PER_DAY / 24;
  const rng = mulberry32(p.seed);

  const diff = new Float64Array(runs * Y);
  const incidents = { lucky: 0, partial: 0, full: 0, outages: 0, runs };
  let worst = 0;
  // Stage 0: one slice per operator. Stage 1: one pool run by all of them.
  const bal0 = new Float64Array(k);
  const S = p.stakeEth;

  /** A compromise touching the Stage 1 pool: usually a replacement; rarely the threshold falls too. */
  const stage1Hit = (fg: number, pr: number, bal1: number): [number, number] => {
    if (rng() < res) return [bal1 * fg * keep1, bal1 * pr];
    const c = rng() < reshare ? t1.good1 : t1.bad1;
    return [bal1 * c.forgone * keep1, bal1 * c.principal];
  };

  for (let run = 0; run < runs; run++) {
    // The incident rate itself is uncertain: one draw per run (Gamma, mean λ).
    const lambda = cv > 0 && lambdaMean > 0 ? gamma(rng, 1 / (cv * cv)) * lambdaMean * cv * cv : lambdaMean;
    for (let o = 0; o < k; o++) bal0[o] = ops[o].stakeEth;
    let bal1 = S;
    let net0 = 0;
    let net1 = 0;
    let loss0 = 0;
    for (let y = 0; y < Y; y++) {
      net1 += bal1 * apr * keep1;
      for (let o = 0; o < k; o++) {
        const table = tables[o];
        net0 += bal0[o] * apr * keep0;

        const nInc = poisson(rng, lambda);
        for (let i = 0; i < nInc; i++) {
          const slashed = rng() < pSlash;
          const f = slashed ? beta(rng, p.betaA, p.betaB) : 0;
          if (!slashed) incidents.lucky++;
          else if (f >= FULL_THRESHOLD) incidents.full++;
          else incidents.partial++;
          const fg = interp(table.forgone0, f);
          const pr = interp(table.principal0, f);
          // Stage 0: only this operator's slice, which can be slashed.
          net0 -= bal0[o] * fg * keep0;
          loss0 += bal0[o] * (fg * keep0 + pr);
          bal0[o] -= bal0[o] * pr;
          // Stage 1: the same operator holds a share of every validator.
          const [forgone1, principal1] = stage1Hit(fg, pr, bal1);
          net1 -= forgone1;
          bal1 -= principal1;
        }

        const nOut = poisson(rng, p.outagesPerYear);
        for (let i = 0; i < nOut; i++) {
          incidents.outages++;
          const hours = p.outageMedianHours * Math.exp(normal(rng));
          const epochs = hours * epochsPerHour;
          const perEth = table.outagePerEthPerEpoch * epochs + (table.outageLeak ? inactivityLeakEth(1, epochs) : 0);
          net0 -= bal0[o] * perEth;
          loss0 += bal0[o] * perEth;
          // One operator down can't stop a threshold cluster; the uncovered
          // share are correlated failures, costed on the same slice of stake.
          if (rng() >= cover) net1 -= bal1 * (ops[o].stakeEth / S) * perEth;
        }
      }
      // Extra cluster members (e.g. your own node) can be compromised too, but
      // only on the Stage 1 side: they hold no Stage 0 stake.
      for (let j = 0; j < m; j++) {
        const nInc = poisson(rng, lambda);
        for (let i = 0; i < nInc; i++) {
          const slashed = rng() < pSlash;
          const f = slashed ? beta(rng, p.betaA, p.betaB) : 0;
          const [forgone1, principal1] = stage1Hit(interp(t1.forgone0, f), interp(t1.principal0, f), bal1);
          net1 -= forgone1;
          bal1 -= principal1;
        }
      }
      // Lost principal is lost wealth: count it in the position.
      let b0 = 0;
      for (let o = 0; o < k; o++) b0 += bal0[o];
      diff[run * Y + y] = net1 + bal1 - (net0 + b0);
    }
    if (loss0 > worst) worst = loss0;
  }

  const years: YearStats[] = [];
  const col = new Float64Array(runs);
  for (let y = 0; y < Y; y++) {
    let sum = 0;
    let behind = 0;
    let gain = 0;
    let shortfall = 0;
    for (let r = 0; r < runs; r++) {
      const v = diff[r * Y + y];
      col[r] = v;
      sum += v;
      if (v < 0) {
        behind++;
        gain -= v;
      } else if (v > 0) shortfall += v;
    }
    const ahead0 = behind;
    const behind0 = runs - behind;
    col.sort();
    years.push({
      year: y + 1,
      mean: sum / runs,
      p5: quantile(col, 0.05),
      p25: quantile(col, 0.25),
      p50: quantile(col, 0.5),
      p75: quantile(col, 0.75),
      p95: quantile(col, 0.95),
      pStage0Ahead: behind / runs,
      soloGainWhenAhead: ahead0 > 0 ? gain / ahead0 / S : 0,
      soloLossWhenBehind: behind0 > 0 ? shortfall / behind0 / S : 0,
    });
  }
  return {
    years,
    final: col.slice(),
    netRewardsPerYear0: p.stakeEth * apr * keep0,
    incidents,
    worstStage0LossEth: worst,
  };
}

// ── Heatmap: P(Stage 0 ahead) by incident rate × years ──────────────────────

export const HEATMAP_RATES = [0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12];
/** The heatmap always spans this many years, whatever the Years setting, so the grid keeps its shape. */
export const HEATMAP_YEARS = 20;
export const HEATMAP_RUNS = 1500;

export interface Heatmap {
  rates: number[];
  years: number[];
  /** cells[rateIndex][yearIndex] = P(Stage 0 ahead). */
  cells: number[][];
  /** Average Stage 1 − Stage 0, in years of Stage 0 net rewards (positive = Stage 1 ahead). */
  meanYears: number[][];
}

export function heatmap(p: CostParams, maxYears = HEATMAP_YEARS, runs = HEATMAP_RUNS): Heatmap {
  const tables = costTables(p);
  const runsByRate = HEATMAP_RATES.map((rate, i) =>
    simulate({ ...p, seed: p.seed + i + 1 }, { incidentRatePct: rate, runs, years: maxYears, tables }),
  );
  return {
    rates: HEATMAP_RATES,
    years: Array.from({ length: maxYears }, (_, i) => i + 1),
    cells: runsByRate.map((r) => r.years.map((y) => y.pStage0Ahead)),
    meanYears: runsByRate.map((r) => r.years.map((y) => y.mean / r.netRewardsPerYear0)),
  };
}

// ── Analytic expectations ───────────────────────────────────────────────────

/** E[g(f)] for f ~ Beta(a, b), by Simpson on a fine grid. */
function betaExpectation(a: number, b: number, g: (f: number) => number): number {
  const n = 400;
  let num = 0;
  let den = 0;
  for (let i = 0; i <= n; i++) {
    const f = Math.min(Math.max(i / n, 1e-6), 1 - 1e-6);
    const w = (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) * Math.pow(f, a - 1) * Math.pow(1 - f, b - 1);
    num += w * g(f);
    den += w;
  }
  return num / den;
}

export interface Expectations {
  /** Expected loss per incident at one operator, averaged over your operators, ETH (net of fee on forgone rewards). Stage 0 hits that operator's slice. */
  perIncident0Eth: number;
  /** Expected loss per incident touching the Stage 1 pool, ETH. */
  perIncident1Eth: number;
  /** Expected loss a year, incidents plus outages, each stage, ETH. */
  loss0PerYearEth: number;
  loss1PerYearEth: number;
  /** Expected outage loss per year, each stage, ETH. */
  outage0PerYearEth: number;
  outage1PerYearEth: number;
  /** Expected annual advantage of Stage 1 at the chosen rate, ETH. */
  annualAdvantageEth: number;
  /** Incident rate (% per operator-year) at which Stage 1 breaks even on average. */
  breakEvenRatePct: number;
}

/**
 * Expected values, summed over your operators. Each Stage 0 operator loses
 * its own slice (with its own share, so its own correlation penalty and exit
 * queue); the Stage 1 pool is touched by every operator's incidents, plus any
 * extra cluster members'.
 */
export function expectations(p: CostParams, tables: CostTable[] = costTables(p)): Expectations {
  const ops = operatorsOf(p);
  const k = ops.length;
  const m = Math.max(0, Math.round(p.extraNodes));
  const t1 = tables[primaryOperatorIndex(p)];
  const keep0 = 1 - p.fee0Pct / 100;
  const keep1 = 1 - p.fee1Pct / 100;
  const pSlash = p.pSlashPct / 100;
  // E[hours] for log-normal(σ = 1) = median × e^{1/2}.
  const meanEpochs = p.outageMedianHours * Math.exp(0.5) * (EPOCHS_PER_DAY / 24);

  let sumPer0 = 0;
  let outage0 = 0;
  ops.forEach((op, i) => {
    const t = tables[i];
    const cost0 = (f: number) => interp(t.forgone0, f) * keep0 + interp(t.principal0, f);
    sumPer0 += op.stakeEth * ((1 - pSlash) * cost0(0) + pSlash * betaExpectation(p.betaA, p.betaB, cost0));
    outage0 += p.outagesPerYear * op.stakeEth * t.outagePerEthPerEpoch * meanEpochs;
  });

  const res = p.s1ResidualPct / 100;
  const w = p.s1ResharePct / 100;
  const repl = w * (t1.good1.forgone * keep1 + t1.good1.principal) + (1 - w) * (t1.bad1.forgone * keep1 + t1.bad1.principal);
  const cost0at1 = (f: number) => interp(t1.forgone0, f) * keep1 + interp(t1.principal0, f);
  const eSlashAt1 = betaExpectation(p.betaA, p.betaB, cost0at1);
  // A multi-operator DV is touched as a whole by any member's incident.
  const per1 = p.stakeEth * ((1 - res) * repl + res * ((1 - pSlash) * cost0at1(0) + pSlash * eSlashAt1));
  const outage1 = outage0 * (1 - p.s1LivenessCoverPct / 100);

  const premium = (p.stakeEth * p.aprPct * (p.fee1Pct - p.fee0Pct)) / 1e4;
  const lambda = p.incidentRatePct / 100;
  const loss0 = lambda * sumPer0 + outage0;
  const loss1 = lambda * (k + m) * per1 + outage1;
  const perRateDiff = sumPer0 - (k + m) * per1;
  return {
    perIncident0Eth: sumPer0 / k,
    perIncident1Eth: per1,
    loss0PerYearEth: loss0,
    loss1PerYearEth: loss1,
    outage0PerYearEth: outage0,
    outage1PerYearEth: outage1,
    annualAdvantageEth: loss0 - loss1 - premium,
    breakEvenRatePct: perRateDiff > 0 ? (100 * Math.max(0, premium - (outage0 - outage1))) / perRateDiff : Infinity,
  };
}

export { F_GRID };

/** P(lucky / partial / full | an incident), from pSlash and the Beta severity. */
export function outcomeProbabilities(p: CostParams): { lucky: number; partial: number; full: number } {
  const pSlash = p.pSlashPct / 100;
  const pFull = betaExpectation(p.betaA, p.betaB, (f) => (f >= FULL_THRESHOLD ? 1 : 0));
  return { lucky: 1 - pSlash, partial: pSlash * (1 - pFull), full: pSlash * pFull };
}

/** Beta(a, b) density on [0, 1], normalised to max 1, for sparklines. */
export function betaShape(a: number, b: number, points = 41): number[] {
  const ys: number[] = [];
  for (let i = 0; i < points; i++) {
    const f = Math.min(Math.max(i / (points - 1), 0.005), 0.995);
    ys.push(Math.pow(f, a - 1) * Math.pow(1 - f, b - 1));
  }
  const max = Math.max(...ys);
  return ys.map((y) => y / max);
}
