/**
 * Safety-event timelines: precautionary exits, slashings and Stage 1 key
 * replacement. Works in epochs and ETH; the UI converts to days and USD.
 *
 * The operator's whole book is modelled as a fluid of K equal slices in exit
 * order. Each slice gets an exit epoch from the exit churn
 * (compute_exit_epoch_and_update_churn), a withdrawable epoch (+256, or
 * slash + 8192 if slashed), a sweep wait, and a place in the pending-deposit
 * queue when it re-stakes (process_pending_deposits). Your stake is spread
 * evenly through the book, so your loss is the slice average.
 */
import {
  ACTIVATION_LATENCY_EPOCHS,
  EPOCHS_PER_DAY,
  EPOCHS_PER_SLASHINGS_VECTOR,
  GWEI_PER_ETH,
  MAX_EFFECTIVE_BALANCE_ELECTRA_ETH,
  MIN_ACTIVATION_BALANCE_ETH,
  MIN_SLASHING_PENALTY_QUOTIENT_ELECTRA,
  MIN_VALIDATOR_WITHDRAWABILITY_DELAY,
  PROPORTIONAL_SLASHING_MULTIPLIER_BELLATRIX,
} from "./protocol";
import {
  activationExitChurnEth,
  consolidationChurnEth,
  entryWaitDays,
  sweepWaitDays,
  type NetworkState,
} from "./network";
import { missedAttestationPenaltyPerEpoch, rewardRatePerEpoch } from "./rewards";

export type ExitScope = "own" | "operator";

export interface SafetyEventInput {
  stakeEth: number;
  /** The operator's total share of network stake (0–1). Drives correlation. */
  operatorShare: number;
  /** "own": only your keys are affected. "operator": the whole book exits. */
  scope: ExitScope;
  /** Fraction of the affected keys the attacker slashes (0–1). */
  slashedFraction: number;
  /** Attacker spreads slashings uniformly over this many days (0 = all at once). */
  slashSpreadDays: number;
  /** Re-stake after withdrawal (otherwise forgone rewards stop at withdrawal). */
  restake: boolean;
  /** Your own operational delay between the sweep and the new deposit, days. */
  redepositDelayDays: number;
  network: NetworkState;
}

export interface LossBreakdown {
  /** Rewards an unaffected validator would have earned while yours did not. */
  forgoneEth: number;
  /** Source + target penalties while slashed and not yet withdrawable. */
  attestationPenaltyEth: number;
  /** effective_balance / 4096 at the slashing epoch. */
  initialPenaltyEth: number;
  /** process_slashings, at withdrawable_epoch − 4096. */
  correlationPenaltyEth: number;
  /** Inactivity leak (liveness events above ⅓ only). */
  leakEth: number;
  totalEth: number;
}

export interface Phase {
  id: "exitQueue" | "withdrawDelay" | "slashedLock" | "sweep" | "entryQueue" | "consolidation" | "offline";
  label: string;
  /** Average start/end for your stake, days from the event. */
  startDays: number;
  endDays: number;
}

export interface Marker {
  id: "slash" | "correlation" | "withdrawable" | "active";
  label: string;
  days: number;
}

export interface TracePoint {
  days: number;
  /** Cumulative loss vs an unaffected validator, ETH. */
  lossEth: number;
}

export interface EventResult {
  breakdown: LossBreakdown;
  /** Average days your stake earned nothing. */
  unpaidDays: number;
  phases: Phase[];
  markers: Marker[];
  trace: TracePoint[];
  /** Correlation penalty fraction actually applied (average over slashed stake). */
  correlationFraction: number;
  /** ETH slashed across the network in this event. */
  networkSlashedEth: number;
  /** Days for the affected book to clear the exit queue. */
  drainDays: number;
}

const K = 48; // book slices
const J = 12; // slash-time bins when the attacker spreads slashings

interface Piece {
  amount: number; // ETH of your stake
  bookAmount: number; // ETH of the operator's book this piece stands for
  stopEarn: number; // epoch
  slashedAt: number | null;
  exitEpoch: number;
  withdrawable: number;
  correlationAt: number;
  correlationFraction: number;
  sweptAt: number;
  remaining: number; // ETH re-deposited
  activeAt: number; // epoch rewards resume (Infinity if never)
}

function zeroBreakdown(): LossBreakdown {
  return {
    forgoneEth: 0,
    attestationPenaltyEth: 0,
    initialPenaltyEth: 0,
    correlationPenaltyEth: 0,
    leakEth: 0,
    totalEth: 0,
  };
}

/** Fraction of the network's slashings that fall in (end − 8192, end]. */
function slashedInWindow(end: number, spreadEpochs: number): number {
  const lo = end - EPOCHS_PER_SLASHINGS_VECTOR;
  if (spreadEpochs <= 0) return lo < 0 && end >= 0 ? 1 : 0;
  const a = Math.max(lo, 0);
  const b = Math.min(end, spreadEpochs);
  return Math.max(0, b - a) / spreadEpochs;
}

/**
 * Electra process_slashings per ETH of effective balance:
 * (min(Σ slashings × 3, total) // total_increments) per increment, in Gwei.
 */
export function correlationPenaltyPerEth(windowSlashedEth: number, totalActiveEth: number): number {
  const adjustedGwei = Math.min(
    windowSlashedEth * PROPORTIONAL_SLASHING_MULTIPLIER_BELLATRIX * GWEI_PER_ETH,
    totalActiveEth * GWEI_PER_ETH,
  );
  return Math.floor(adjustedGwei / Math.floor(totalActiveEth)) / GWEI_PER_ETH;
}

/**
 * FIFO pending-deposit queue as a fluid: backlog `q0`, competing inflow `d`
 * per epoch, our arrivals, served at `churn` per epoch. Returns, for each
 * arrival, the epoch it is processed.
 */
function serveDeposits(
  arrivals: { epoch: number; amount: number }[],
  q0: number,
  d: number,
  churn: number,
): number[] {
  const order = arrivals.map((a, i) => ({ ...a, i })).sort((a, b) => a.epoch - b.epoch);
  const out = new Array<number>(arrivals.length);
  let arrived = q0; // cumulative ETH that has joined the queue
  let served = 0; // cumulative ETH processed
  let next = 0;
  let epoch = 0;
  const pending: { pos: number; i: number }[] = [];
  const lastEpoch = order.length ? order[order.length - 1].epoch : 0;
  const maxEpochs = 5_000_000;
  while (epoch < maxEpochs) {
    while (next < order.length && order[next].epoch <= epoch) {
      arrived += order[next].amount;
      pending.push({ pos: arrived, i: order[next].i });
      next++;
    }
    served = Math.min(arrived, served + churn);
    while (pending.length && pending[0].pos <= served + 1e-9) {
      out[pending.shift()!.i] = epoch;
    }
    if (next >= order.length && pending.length === 0) break;
    arrived += d;
    epoch++;
    if (epoch > lastEpoch && pending.length === 0 && next >= order.length) break;
  }
  for (const p of pending) out[p.i] = Infinity;
  return out;
}

export function safetyEvent(input: SafetyEventInput): EventResult {
  const n = input.network;
  const T = n.totalActiveEth;
  const S = Math.max(0, input.stakeEth);
  const f = Math.min(Math.max(input.slashedFraction, 0), 1);
  const book = input.scope === "own" ? S : Math.max(S, input.operatorShare * T);
  const churn = activationExitChurnEth(T);
  const r = rewardRatePerEpoch(n.aprPct);
  const pen = missedAttestationPenaltyPerEpoch(T);
  const sweep = sweepWaitDays(n) * EPOCHS_PER_DAY;
  const delay = Math.max(0, input.redepositDelayDays) * EPOCHS_PER_DAY;
  const spread = Math.max(0, input.slashSpreadDays) * EPOCHS_PER_DAY;
  const networkSlashed = f * book;

  const pieces: Piece[] = [];
  for (let k = 0; k < K; k++) {
    const u = (k + 0.5) / K;
    const exitEpoch = (n.exitQueueEth + u * book) / churn;
    const sliceBook = book / K;
    // Unslashed share of the slice: precautionary exit.
    if (f < 1) {
      const amt = (S / K) * (1 - f);
      const w = exitEpoch + MIN_VALIDATOR_WITHDRAWABILITY_DELAY;
      pieces.push({
        amount: amt,
        bookAmount: sliceBook * (1 - f),
        stopEarn: exitEpoch,
        slashedAt: null,
        exitEpoch,
        withdrawable: w,
        correlationAt: Infinity,
        correlationFraction: 0,
        sweptAt: w + sweep,
        remaining: amt,
        activeAt: Infinity,
      });
    }
    if (f > 0) {
      const bins = spread > 0 ? J : 1;
      for (let j = 0; j < bins; j++) {
        // The attacker can slash until the validator is withdrawable.
        const tRaw = spread > 0 ? ((j + 0.5) / bins) * spread : 0;
        const t = Math.min(tRaw, exitEpoch + MIN_VALIDATOR_WITHDRAWABILITY_DELAY - 1);
        const amt = ((S / K) * f) / bins;
        const w = Math.max(exitEpoch + MIN_VALIDATOR_WITHDRAWABILITY_DELAY, t + EPOCHS_PER_SLASHINGS_VECTOR);
        const corrAt = w - EPOCHS_PER_SLASHINGS_VECTOR / 2;
        const windowEth = networkSlashed * slashedInWindow(corrAt, spread);
        const corrPerEth = correlationPenaltyPerEth(windowEth, T);
        const lost = amt / MIN_SLASHING_PENALTY_QUOTIENT_ELECTRA + amt * pen * (w - t) + amt * corrPerEth;
        pieces.push({
          amount: amt,
          bookAmount: (sliceBook * f) / bins,
          stopEarn: t,
          slashedAt: t,
          exitEpoch,
          withdrawable: w,
          correlationAt: corrAt,
          correlationFraction: corrPerEth,
          sweptAt: w + sweep,
          remaining: Math.max(0, amt - lost),
          activeAt: Infinity,
        });
      }
    }
  }

  // Re-entry: the whole affected book re-deposits (scaled from our pieces).
  if (input.restake) {
    const arrivals = pieces.map((p) => ({
      epoch: Math.ceil(p.sweptAt + delay),
      amount: (p.remaining / Math.max(p.amount, 1e-18)) * p.bookAmount,
    }));
    const processed = serveDeposits(arrivals, n.depositQueueEth, n.depositInflowEthPerEpoch, churn);
    pieces.forEach((p, i) => {
      p.activeAt = processed[i] + ACTIVATION_LATENCY_EPOCHS;
    });
  }

  // ── Breakdown ────────────────────────────────────────────────────────────
  const b = zeroBreakdown();
  let unpaidWeighted = 0;
  let corrWeighted = 0;
  let slashedAmt = 0;
  for (const p of pieces) {
    const end = input.restake ? p.activeAt : p.sweptAt;
    // Forgone on the original amount until it earns again; the principal a
    // slashing destroys is counted once, as a penalty, not as lost yield.
    const paidAmount = p.slashedAt === null ? p.amount : p.remaining;
    const unpaid = Math.max(0, end - p.stopEarn);
    b.forgoneEth += paidAmount * r * unpaid;
    unpaidWeighted += p.amount * unpaid;
    if (p.slashedAt !== null) {
      b.initialPenaltyEth += p.amount / MIN_SLASHING_PENALTY_QUOTIENT_ELECTRA;
      b.attestationPenaltyEth += p.amount * pen * (p.withdrawable - p.slashedAt);
      b.correlationPenaltyEth += p.amount * p.correlationFraction;
      corrWeighted += p.amount * p.correlationFraction;
      slashedAmt += p.amount;
    }
  }
  b.totalEth = b.forgoneEth + b.attestationPenaltyEth + b.initialPenaltyEth + b.correlationPenaltyEth;

  // ── Phases and markers (stake-weighted averages, days) ───────────────────
  const avg = (sel: (p: Piece) => number, filter: (p: Piece) => boolean = () => true) => {
    let s = 0;
    let w = 0;
    for (const p of pieces) if (filter(p)) {
      s += p.amount * sel(p);
      w += p.amount;
    }
    return w > 0 ? s / w / EPOCHS_PER_DAY : NaN;
  };
  const isSlashed = (p: Piece) => p.slashedAt !== null;
  const notSlashed = (p: Piece) => p.slashedAt === null;
  const phases: Phase[] = [];
  const markers: Marker[] = [];
  if (f < 1) {
    phases.push({ id: "exitQueue", label: "Exit queue (still earning)", startDays: 0, endDays: avg((p) => p.exitEpoch, notSlashed) });
    phases.push({
      id: "withdrawDelay",
      label: "Withdrawability delay",
      startDays: avg((p) => p.exitEpoch, notSlashed),
      endDays: avg((p) => p.withdrawable, notSlashed),
    });
  }
  if (f > 0) {
    markers.push({ id: "slash", label: "Slashed", days: avg((p) => p.slashedAt ?? 0, isSlashed) });
    phases.push({
      id: "slashedLock",
      label: "Slashed, penalised until withdrawable",
      startDays: avg((p) => p.slashedAt ?? 0, isSlashed),
      endDays: avg((p) => p.withdrawable, isSlashed),
    });
    markers.push({ id: "correlation", label: "Correlation penalty", days: avg((p) => p.correlationAt, isSlashed) });
  }
  const sweptAvg = avg((p) => p.sweptAt);
  phases.push({ id: "sweep", label: "Withdrawal sweep", startDays: avg((p) => p.withdrawable), endDays: sweptAvg });
  if (input.restake) {
    const activeAvg = avg((p) => p.activeAt);
    phases.push({ id: "entryQueue", label: "Entry queue and activation", startDays: sweptAvg + delay / EPOCHS_PER_DAY, endDays: activeAvg });
    markers.push({ id: "active", label: "Earning again", days: activeAvg });
  }

  return {
    breakdown: b,
    unpaidDays: S > 0 ? unpaidWeighted / S / EPOCHS_PER_DAY : 0,
    phases,
    markers,
    trace: buildTrace(pieces, r, pen, input.restake),
    correlationFraction: slashedAmt > 0 ? corrWeighted / slashedAmt : 0,
    networkSlashedEth: networkSlashed,
    drainDays: (n.exitQueueEth + book) / churn / EPOCHS_PER_DAY,
  };
}

function buildTrace(pieces: Piece[], r: number, pen: number, restake: boolean): TracePoint[] {
  const ends = pieces.map((p) => (restake ? p.activeAt : p.sweptAt)).filter(Number.isFinite);
  const horizon = Math.max(EPOCHS_PER_DAY * 7, ...ends) * 1.08;
  const steps = 160;
  const out: TracePoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (horizon * i) / steps;
    let loss = 0;
    for (const p of pieces) {
      const end = restake ? p.activeAt : p.sweptAt;
      const paidAmount = p.slashedAt === null ? p.amount : p.remaining;
      loss += paidAmount * r * Math.max(0, Math.min(t, end) - p.stopEarn);
      if (p.slashedAt !== null && t >= p.slashedAt) {
        loss += p.amount / MIN_SLASHING_PENALTY_QUOTIENT_ELECTRA;
        loss += p.amount * pen * (Math.min(t, p.withdrawable) - p.slashedAt);
        if (t >= p.correlationAt) loss += p.amount * p.correlationFraction;
      }
    }
    out.push({ days: t / EPOCHS_PER_DAY, lossEth: loss });
  }
  return out;
}

// ── Stage 1: replacing a compromised key-holder ─────────────────────────────

export interface ReplacementInput {
  stakeEth: number;
  operatorShare: number;
  scope: ExitScope;
  network: NetworkState;
  /** Good leaver: epochs offline while the cluster reshares (default 5). */
  reshareEpochs: number;
}

/**
 * Bad leaver: the remaining key-holders can still sign, so they consolidate
 * the validators onto a fresh cluster (EIP-7251). Sources keep earning in
 * the consolidation queue, then earn nothing for the withdrawability delay
 * before process_pending_consolidations moves the balance. New 0x02 targets
 * need a 32 ETH seed deposit through the entry queue, which idles that seed.
 */
export function badLeaver(i: ReplacementInput): EventResult {
  const n = i.network;
  const T = n.totalActiveEth;
  const S = i.stakeEth;
  const r = rewardRatePerEpoch(n.aprPct);
  const book = i.scope === "own" ? S : Math.max(S, i.operatorShare * T);
  const cChurn = Math.max(consolidationChurnEth(T), 1);
  const queueEpochs = book / cChurn; // whole book through consolidation churn
  const offline = MIN_VALIDATOR_WITHDRAWABILITY_DELAY + 1;
  const seedEth = Math.ceil(S / MAX_EFFECTIVE_BALANCE_ELECTRA_ETH) * MIN_ACTIVATION_BALANCE_ETH;
  const seedEpochs = entryWaitDays(n) * EPOCHS_PER_DAY + ACTIVATION_LATENCY_EPOCHS;

  const b = zeroBreakdown();
  b.forgoneEth = S * r * offline + seedEth * r * seedEpochs;
  b.totalEth = b.forgoneEth;
  const avgStart = queueEpochs / 2 / EPOCHS_PER_DAY;
  const offDays = offline / EPOCHS_PER_DAY;
  const steps = 60;
  const horizon = Math.max(avgStart + offDays, seedEpochs / EPOCHS_PER_DAY) * 1.1;
  const trace: TracePoint[] = [];
  for (let k = 0; k <= steps; k++) {
    const d = (horizon * k) / steps;
    const seed = seedEth * r * Math.min(d * EPOCHS_PER_DAY, seedEpochs);
    const main = S * r * Math.max(0, Math.min(d - avgStart, offDays)) * EPOCHS_PER_DAY;
    trace.push({ days: d, lossEth: seed + main });
  }
  return {
    breakdown: b,
    unpaidDays: offDays,
    phases: [
      { id: "consolidation", label: "Consolidation queue (still earning)", startDays: 0, endDays: avgStart },
      { id: "withdrawDelay", label: "Withdrawability delay", startDays: avgStart, endDays: avgStart + offDays },
    ],
    markers: [{ id: "active", label: "Balance on the new cluster", days: avgStart + offDays }],
    trace,
    correlationFraction: 0,
    networkSlashedEth: 0,
    drainDays: queueEpochs / EPOCHS_PER_DAY,
  };
}

/** Good leaver: reshare or re-DKG in place, offline for a few epochs. */
export function goodLeaver(i: ReplacementInput): EventResult {
  const n = i.network;
  const r = rewardRatePerEpoch(n.aprPct);
  const pen = missedAttestationPenaltyPerEpoch(n.totalActiveEth);
  const E = Math.max(0, i.reshareEpochs);
  const b = zeroBreakdown();
  b.forgoneEth = i.stakeEth * r * E;
  b.attestationPenaltyEth = i.stakeEth * pen * E;
  b.totalEth = b.forgoneEth + b.attestationPenaltyEth;
  const days = E / EPOCHS_PER_DAY;
  return {
    breakdown: b,
    unpaidDays: days,
    phases: [{ id: "offline", label: "Offline while resharing", startDays: 0, endDays: days }],
    markers: [{ id: "active", label: "Earning again", days }],
    trace: [
      { days: 0, lossEth: 0 },
      { days, lossEth: b.totalEth },
      { days: Math.max(days * 2, 0.1), lossEth: b.totalEth },
    ],
    correlationFraction: 0,
    networkSlashedEth: 0,
    drainDays: 0,
  };
}
