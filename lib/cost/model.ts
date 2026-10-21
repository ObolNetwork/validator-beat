/**
 * The page-level model: turns `CostParams` into the numbers the page shows
 * for one incident (Stage 0 vs Stage 1, lucky / partial / full / outage),
 * the fee premium, and the per-ETH cost tables the Monte Carlo samples from.
 */
import { EPOCHS_PER_DAY } from "./protocol";
import { badLeaver, goodLeaver, safetyEvent, type EventResult, type LossBreakdown } from "./events";
import { outageCost } from "./rewards";
import { networkFromParams, type CostParams, type FocusEvent } from "./params";

export interface OutcomeCase {
  id: FocusEvent;
  label: string;
  /** Slashed fraction of the affected keys (safety cases). */
  slashedFraction: number;
  stage0: EventResult;
  /** Stage 1, the usual path (reshare/consolidation mix, or absorbed outage). */
  stage1: EventResult;
  /** Expected Stage 1 loss including the residual threshold-compromise risk. */
  stage1ExpectedEth: number;
}

export interface Economics {
  /** Gross rewards on your stake per year, ETH. */
  rewardsPerYearEth: number;
  fee0PerYearEth: number;
  fee1PerYearEth: number;
  /** Extra Stage 1 fee per year, ETH. */
  premiumPerYearEth: number;
  /** Net rewards per day at Stage 0, ETH. */
  netPerDay0Eth: number;
}

export function economics(p: CostParams): Economics {
  const rewardsPerYearEth = (p.stakeEth * p.aprPct) / 100;
  const fee0PerYearEth = (rewardsPerYearEth * p.fee0Pct) / 100;
  const fee1PerYearEth = (rewardsPerYearEth * p.fee1Pct) / 100;
  return {
    rewardsPerYearEth,
    fee0PerYearEth,
    fee1PerYearEth,
    premiumPerYearEth: fee1PerYearEth - fee0PerYearEth,
    netPerDay0Eth: (rewardsPerYearEth - fee0PerYearEth) / 365.25,
  };
}

/** Your stake per operator under an n-way split. */
export function stakePerOperator(p: CostParams): number {
  return p.stakeEth / Math.max(1, Math.round(p.operators));
}

export function safetyCase(p: CostParams, slashedFraction: number, stakeEth = stakePerOperator(p)): EventResult {
  return safetyEvent({
    stakeEth,
    operatorShare: p.operatorSharePct / 100,
    scope: p.operatorWide ? "operator" : "own",
    slashedFraction,
    slashSpreadDays: p.slashSpreadDays,
    restake: true,
    redepositDelayDays: p.redepositDelayDays,
    network: networkFromParams(p),
  });
}

function replacement(p: CostParams, stakeEth: number) {
  const input = {
    stakeEth,
    operatorShare: p.operatorSharePct / 100,
    scope: p.operatorWide ? ("operator" as const) : ("own" as const),
    network: networkFromParams(p),
    reshareEpochs: p.reshareEpochs,
  };
  return { good: goodLeaver(input), bad: badLeaver(input) };
}

/**
 * Blend Stage 1's two responses into one expected result (for display).
 * In a multi-operator DV every validator has a key share at every operator,
 * so a compromise at any one of them touches the whole stake (but can't
 * slash it): the default stake is all of it, not one operator's slice.
 */
export function stage1Compromise(p: CostParams, stakeEth = p.stakeEth): { result: EventResult; good: EventResult; bad: EventResult } {
  const { good, bad } = replacement(p, stakeEth);
  const w = p.s1ResharePct / 100;
  const mix = (a: number, b: number) => w * a + (1 - w) * b;
  const breakdown = Object.fromEntries(
    Object.keys(good.breakdown).map((k) => [
      k,
      mix(good.breakdown[k as keyof LossBreakdown], bad.breakdown[k as keyof LossBreakdown]),
    ]),
  ) as unknown as LossBreakdown;
  // Show the slower path's timeline; the number is the blend.
  return { result: { ...bad, breakdown }, good, bad };
}

export function outageEvent(p: CostParams, stakeEth = stakePerOperator(p), hours = p.outageHours): EventResult {
  const n = networkFromParams(p);
  const epochs = hours * (EPOCHS_PER_DAY / 24);
  const c = outageCost({
    stakeEth,
    epochsDown: epochs,
    cohortFraction: p.operatorSharePct / 100,
    totalActiveEth: n.totalActiveEth,
    aprPct: p.aprPct,
    eip7716: p.eip7716,
  });
  const days = hours / 24;
  return {
    breakdown: {
      forgoneEth: c.forgoneEth,
      attestationPenaltyEth: c.attestationPenaltyEth,
      initialPenaltyEth: 0,
      correlationPenaltyEth: 0,
      leakEth: c.leakEth,
      totalEth: c.totalEth,
    },
    unpaidDays: days,
    phases: [{ id: "offline", label: "Offline", startDays: 0, endDays: days }],
    markers: [{ id: "active", label: "Back online", days }],
    trace: [
      { days: 0, lossEth: 0 },
      { days, lossEth: c.totalEth },
      { days: days * 1.5, lossEth: c.totalEth },
    ],
    correlationFraction: 0,
    networkSlashedEth: 0,
    drainDays: 0,
  };
}

function scaled(r: EventResult, k: number): EventResult {
  const b = r.breakdown;
  return {
    ...r,
    breakdown: {
      forgoneEth: b.forgoneEth * k,
      attestationPenaltyEth: b.attestationPenaltyEth * k,
      initialPenaltyEth: b.initialPenaltyEth * k,
      correlationPenaltyEth: b.correlationPenaltyEth * k,
      leakEth: b.leakEth * k,
      totalEth: b.totalEth * k,
    },
    trace: r.trace.map((t) => ({ days: t.days, lossEth: t.lossEth * k })),
  };
}

/**
 * One incident at one of your operators, for each outcome.
 *
 * Stage 0 (solo operators): the incident hits the slice that operator runs
 * alone (all of your stake on a 1-way split), and that slice can be slashed.
 * Stage 1 (multi-operator DV): the same operators run every validator
 * together, so the incident touches the whole stake but is handled by
 * replacing one key-holder; only if the attacker also reaches a signing
 * threshold (the residual) is the whole stake exposed to slashing.
 */
export function outcomeCases(p: CostParams): OutcomeCase[] {
  const res = p.s1ResidualPct / 100;
  const s1 = stage1Compromise(p).result;
  const scale = p.stakeEth / stakePerOperator(p);
  const make = (id: FocusEvent, label: string, f: number): OutcomeCase => {
    const s0 = safetyCase(p, f);
    return {
      id,
      label,
      slashedFraction: f,
      stage0: s0,
      stage1: s1,
      stage1ExpectedEth: (1 - res) * s1.breakdown.totalEth + res * s0.breakdown.totalEth * scale,
    };
  };
  const out0 = outageEvent(p);
  // One operator down can't stop a threshold cluster; the outages a DV doesn't
  // ride through are correlated ones (shared cloud, client), which would hit
  // solo operators just as hard. So the DV loses (1 − cover) of what the same
  // outage costs a solo operator, on the same stake.
  const out1 = scaled(out0, 1 - p.s1LivenessCoverPct / 100);
  return [
    make("lucky", "Caught in time", 0),
    make("partial", "Partial slashing", p.partialPct / 100),
    make("full", "Every key slashed", 1),
    {
      id: "outage",
      label: `${p.outageHours} h outage`,
      slashedFraction: 0,
      stage0: out0,
      stage1: out1,
      stage1ExpectedEth: out1.breakdown.totalEth,
    },
  ];
}

// ── Per-ETH cost tables for sampling ────────────────────────────────────────

export const F_GRID = Array.from({ length: 21 }, (_, i) => i / 20);

export interface CostTable {
  /** Stage 0 loss per ETH at each F_GRID point, split so fees can be netted. */
  forgone0: number[];
  principal0: number[];
  /** Stage 1 compromise (reshare path), per ETH. */
  good1: { forgone: number; principal: number };
  /** Stage 1 compromise (consolidation path), per ETH. */
  bad1: { forgone: number; principal: number };
  /** Outage cost per ETH = linear × epochs + leak(epochs). */
  outagePerEthPerEpoch: number;
  outageLeak: boolean;
}

const split = (b: LossBreakdown) => ({
  forgone: b.forgoneEth,
  principal: b.attestationPenaltyEth + b.initialPenaltyEth + b.correlationPenaltyEth + b.leakEth,
});

export function costTable(p: CostParams): CostTable {
  const s = stakePerOperator(p);
  const forgone0: number[] = [];
  const principal0: number[] = [];
  for (const f of F_GRID) {
    const x = split(safetyCase(p, f, s).breakdown);
    forgone0.push(x.forgone / s);
    principal0.push(x.principal / s);
  }
  const { good, bad } = replacement(p, s);
  const g = split(good.breakdown);
  const b = split(bad.breakdown);
  const one = outageEvent(p, 1, 1);
  return {
    forgone0,
    principal0,
    good1: { forgone: g.forgone / s, principal: g.principal / s },
    bad1: { forgone: b.forgone / s, principal: b.principal / s },
    outagePerEthPerEpoch: (one.breakdown.totalEth - one.breakdown.leakEth) / (EPOCHS_PER_DAY / 24),
    outageLeak: p.operatorSharePct / 100 > 1 / 3,
  };
}

export function interp(grid: number[], f: number): number {
  const x = Math.min(Math.max(f, 0), 1) * (grid.length - 1);
  const i = Math.min(Math.floor(x), grid.length - 2);
  const t = x - i;
  return grid[i] * (1 - t) + grid[i + 1] * t;
}
