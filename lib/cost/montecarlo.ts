/**
 * Monte Carlo: N years of a portfolio at Stage 0 vs the same operators at
 * Stage 1 (paying the higher fee). Seeded, so a shared link reproduces the
 * run. Pure; the page runs it in a Web Worker.
 */
import { EPOCHS_PER_DAY } from "./protocol";
import { inactivityLeakEth } from "./rewards";
import { F_GRID, costTable, interp, stakePerOperator, type CostTable } from "./model";
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
  /** Precomputed table (the heatmap reuses one across cells). */
  table?: CostTable;
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
  const table = opts.table ?? costTable(p);
  const runs = Math.max(1, Math.round(opts.runs ?? p.runs));
  const Y = Math.max(1, Math.round(opts.years ?? p.years));
  const k = Math.max(1, Math.round(p.operators));
  const s = stakePerOperator(p);
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
  // Stage 0: k separate slices. Stage 1: one pool run by all k operators.
  const bal0 = new Float64Array(k);
  const S = p.stakeEth;

  for (let run = 0; run < runs; run++) {
    // The incident rate itself is uncertain: one draw per run (Gamma, mean λ).
    const lambda = cv > 0 && lambdaMean > 0 ? gamma(rng, 1 / (cv * cv)) * lambdaMean * cv * cv : lambdaMean;
    bal0.fill(s);
    let bal1 = S;
    let net0 = 0;
    let net1 = 0;
    let loss0 = 0;
    for (let y = 0; y < Y; y++) {
      net1 += bal1 * apr * keep1;
      for (let o = 0; o < k; o++) {
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
          // Stage 0
          const l0 = bal0[o] * (fg * keep0 + pr);
          net0 -= bal0[o] * fg * keep0;
          loss0 += l0;
          const p0 = bal0[o] * pr;
          bal0[o] -= p0;
          // Stage 1: the compromised operator holds a share of every validator,
          // so the whole pool is affected. Usually a key replacement; rarely
          // the attacker reaches a threshold too and the pool is exposed.
          if (rng() < res) {
            net1 -= bal1 * fg * keep1;
            bal1 -= bal1 * pr;
          } else {
            const c = rng() < reshare ? table.good1 : table.bad1;
            net1 -= bal1 * c.forgone * keep1;
            bal1 -= bal1 * c.principal;
          }
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
          if (rng() >= cover) net1 -= (bal1 / k) * perEth;
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
    for (let r = 0; r < runs; r++) {
      const v = diff[r * Y + y];
      col[r] = v;
      sum += v;
      if (v < 0) behind++;
    }
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
  const table = costTable(p);
  const runsByRate = HEATMAP_RATES.map((rate, i) =>
    simulate({ ...p, seed: p.seed + i + 1 }, { incidentRatePct: rate, runs, years: maxYears, table }),
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
  /** Expected loss per incident at one operator, ETH (net of fee on forgone rewards). Stage 0 hits that operator's slice; Stage 1 the whole pool. */
  perIncident0Eth: number;
  perIncident1Eth: number;
  /** Expected outage loss per year, each stage, ETH. */
  outage0PerYearEth: number;
  outage1PerYearEth: number;
  /** Expected annual advantage of Stage 1 at the chosen rate, ETH. */
  annualAdvantageEth: number;
  /** Incident rate (% per operator-year) at which Stage 1 breaks even on average. */
  breakEvenRatePct: number;
}

export function expectations(p: CostParams, table: CostTable = costTable(p)): Expectations {
  const s = stakePerOperator(p);
  const k = Math.max(1, Math.round(p.operators));
  const keep0 = 1 - p.fee0Pct / 100;
  const keep1 = 1 - p.fee1Pct / 100;
  const pSlash = p.pSlashPct / 100;
  const cost0 = (f: number) => interp(table.forgone0, f) * keep0 + interp(table.principal0, f);
  const cost0at1 = (f: number) => interp(table.forgone0, f) * keep1 + interp(table.principal0, f);
  const eSlash = betaExpectation(p.betaA, p.betaB, cost0);
  const eSlashAt1 = betaExpectation(p.betaA, p.betaB, cost0at1);
  const per0 = s * ((1 - pSlash) * cost0(0) + pSlash * eSlash);
  const res = p.s1ResidualPct / 100;
  const w = p.s1ResharePct / 100;
  const repl = w * (table.good1.forgone * keep1 + table.good1.principal) + (1 - w) * (table.bad1.forgone * keep1 + table.bad1.principal);
  // A multi-operator DV is touched as a whole by any operator's incident.
  const per1 = p.stakeEth * ((1 - res) * repl + res * ((1 - pSlash) * cost0at1(0) + pSlash * eSlashAt1));

  // E[hours] for log-normal(σ = 1) = median × e^{1/2}.
  const meanEpochs = p.outageMedianHours * Math.exp(0.5) * (EPOCHS_PER_DAY / 24);
  const outPerOp = s * table.outagePerEthPerEpoch * meanEpochs;
  const outage0 = k * p.outagesPerYear * outPerOp;
  const outage1 = outage0 * (1 - p.s1LivenessCoverPct / 100);

  const premium = (p.stakeEth * p.aprPct * (p.fee1Pct - p.fee0Pct)) / 1e4;
  const lambda = p.incidentRatePct / 100;
  const perIncDiff = per0 - per1;
  const annualAdvantageEth = k * lambda * perIncDiff + (outage0 - outage1) - premium;
  const breakEvenRatePct =
    perIncDiff > 0 ? (100 * Math.max(0, premium - (outage0 - outage1))) / (k * perIncDiff) : Infinity;
  return {
    perIncident0Eth: per0,
    perIncident1Eth: per1,
    outage0PerYearEth: outage0,
    outage1PerYearEth: outage1,
    annualAdvantageEth,
    breakEvenRatePct,
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
