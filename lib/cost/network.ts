/**
 * Network state: the build-time snapshot plus the 90-day queue history.
 * Everything the model reads about "the chain right now" comes through
 * `NetworkState`, so the UI can override any field and show its source.
 */
import snapshot from "../../data/network/snapshot.json";
import history from "../../data/network/queue-history-90d.json";
import {
  CHURN_LIMIT_QUOTIENT,
  EPOCHS_PER_DAY,
  MAX_PER_EPOCH_ACTIVATION_EXIT_CHURN_LIMIT_ETH,
  MAX_PENDING_PARTIALS_PER_WITHDRAWALS_SWEEP,
  MAX_WITHDRAWALS_PER_PAYLOAD,
  MIN_PER_EPOCH_CHURN_LIMIT_ELECTRA_ETH,
  SECONDS_PER_SLOT,
} from "./protocol";

export interface NetworkState {
  /** Total active balance, ETH (get_total_active_balance). */
  totalActiveEth: number;
  /** Active validators; drives the withdrawal sweep cycle. */
  activeValidators: number;
  /** ETH already in the exit queue ahead of a new voluntary exit. */
  exitQueueEth: number;
  /** ETH in pending_deposits ahead of a new deposit. */
  depositQueueEth: number;
  /** New competing deposits per epoch while you wait (ETH/epoch). */
  depositInflowEthPerEpoch: number;
  /** Full staking APR (CL + EL), percent. */
  aprPct: number;
  ethUsd: number;
  /** Average pending partial withdrawals per payload (0–8); slows the sweep. */
  partialsPerPayload: number;
}

export interface QueueDay {
  date: string;
  validators: number;
  entryQueueEth: number;
  entryWaitDays: number;
  exitQueueEth: number;
  exitWaitDays: number;
  stakedEth: number;
  aprPct: number;
}

export const SNAPSHOT = snapshot;
export const QUEUE_HISTORY: QueueDay[] = history.days;
export const QUEUE_HISTORY_SOURCE = history.source;

// ── Churn (Electra) ─────────────────────────────────────────────────────────

/** get_balance_churn_limit, in whole ETH. */
export function balanceChurnEth(totalActiveEth: number): number {
  return Math.max(
    MIN_PER_EPOCH_CHURN_LIMIT_ELECTRA_ETH,
    Math.floor(totalActiveEth / CHURN_LIMIT_QUOTIENT),
  );
}

/** get_activation_exit_churn_limit: shared by exits and pending deposits. */
export function activationExitChurnEth(totalActiveEth: number): number {
  return Math.min(MAX_PER_EPOCH_ACTIVATION_EXIT_CHURN_LIMIT_ETH, balanceChurnEth(totalActiveEth));
}

/** get_consolidation_churn_limit: what's left of the balance churn. */
export function consolidationChurnEth(totalActiveEth: number): number {
  return balanceChurnEth(totalActiveEth) - activationExitChurnEth(totalActiveEth);
}

// ── Withdrawal sweep ────────────────────────────────────────────────────────

/**
 * Days for the sweep to visit every validator once. Each payload carries 16
 * withdrawals, minus the slots taken by pending partial withdrawals
 * (get_expected_withdrawals processes those first, up to 8). Assumes most
 * validators have something to withdraw, so payloads fill and the sweep
 * advances 16 validators per slot rather than skipping ahead.
 */
export function sweepCycleDays(n: NetworkState): number {
  const partials = Math.min(Math.max(n.partialsPerPayload, 0), MAX_PENDING_PARTIALS_PER_WITHDRAWALS_SWEEP);
  const perSlot = MAX_WITHDRAWALS_PER_PAYLOAD - partials;
  return (n.activeValidators / perSlot) * SECONDS_PER_SLOT / 86_400;
}

/** Expected wait from withdrawable to swept: half a cycle on average. */
export function sweepWaitDays(n: NetworkState): number {
  return sweepCycleDays(n) / 2;
}

// ── Queue waits ─────────────────────────────────────────────────────────────

export function exitWaitDays(n: NetworkState): number {
  return n.exitQueueEth / activationExitChurnEth(n.totalActiveEth) / EPOCHS_PER_DAY;
}

/** Entry wait with no extra demand from you: backlog drains at churn minus new inflow. */
export function entryWaitDays(n: NetworkState): number {
  return n.depositQueueEth / activationExitChurnEth(n.totalActiveEth) / EPOCHS_PER_DAY;
}

// ── Defaults and presets ────────────────────────────────────────────────────

const churnNow = activationExitChurnEth(snapshot.totalActiveEth);

function avg(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

const last90 = {
  entryQueueAvg: avg(QUEUE_HISTORY.map((d) => d.entryQueueEth)),
  entryQueueMax: Math.max(...QUEUE_HISTORY.map((d) => d.entryQueueEth)),
  entryQueueMin: Math.min(...QUEUE_HISTORY.map((d) => d.entryQueueEth)),
  exitQueueAvg: avg(QUEUE_HISTORY.map((d) => d.exitQueueEth)),
  exitQueueMax: Math.max(...QUEUE_HISTORY.map((d) => d.exitQueueEth)),
  aprAvg: avg(QUEUE_HISTORY.map((d) => d.aprPct)),
};
export const LAST_90 = last90;

export const DEFAULT_NETWORK: NetworkState = {
  totalActiveEth: snapshot.totalActiveEth,
  activeValidators: snapshot.activeValidators,
  // Measured from the head state: the latest exit_epoch already assigned is
  // ~1,460 epochs out, i.e. that much exit churn is spoken for.
  exitQueueEth: snapshot.newExitWaitEpochs * churnNow,
  depositQueueEth: snapshot.pendingDepositsEth,
  depositInflowEthPerEpoch: snapshot.depositInflowEthPerEpoch90d,
  aprPct: snapshot.aprPct,
  ethUsd: snapshot.ethUsd,
  partialsPerPayload: 0,
};

export type QueuePresetId = "today" | "avg90" | "worst90" | "empty";

export interface QueuePreset {
  id: QueuePresetId;
  label: string;
  hint: string;
  exitQueueEth: number;
  depositQueueEth: number;
}

/**
 * validatorqueue's exit queue counts consolidation sources too, which drain on
 * the separate consolidation churn; dividing it by 256 ETH/epoch overstates
 * the wait for a new exit. The 90-day presets use it as an upper bound.
 */
export const QUEUE_PRESETS: QueuePreset[] = [
  {
    id: "today",
    label: "Today",
    hint: `Head state, ${snapshot.asOf}`,
    exitQueueEth: DEFAULT_NETWORK.exitQueueEth,
    depositQueueEth: snapshot.pendingDepositsEth,
  },
  {
    id: "avg90",
    label: "90-day average",
    hint: "validatorqueue.com",
    exitQueueEth: Math.round(last90.exitQueueAvg),
    depositQueueEth: Math.round(last90.entryQueueAvg),
  },
  {
    id: "worst90",
    label: "90-day worst",
    hint: "Longest queues in the window",
    exitQueueEth: last90.exitQueueMax,
    depositQueueEth: last90.entryQueueMax,
  },
  { id: "empty", label: "Empty queues", hint: "Best case", exitQueueEth: 0, depositQueueEth: 0 },
];
