/**
 * Reward, penalty and downtime pieces. All values are per ETH of effective
 * balance per epoch unless a name says otherwise, so they scale linearly
 * with stake (the protocol is balance-weighted since Electra).
 */
import {
  BASE_REWARD_FACTOR,
  EIP7716_MAX_PENALTY_FACTOR,
  EIP7716_PENALTY_SLOPE,
  EPOCHS_PER_YEAR,
  GWEI_PER_ETH,
  INACTIVITY_PENALTY_QUOTIENT_BELLATRIX,
  INACTIVITY_SCORE_BIAS,
  MIN_EPOCHS_TO_INACTIVITY_PENALTY,
  TIMELY_SOURCE_WEIGHT,
  TIMELY_TARGET_WEIGHT,
  WEIGHT_DENOMINATOR,
} from "./protocol";

/** get_base_reward_per_increment, in Gwei (integer, as the spec computes it). */
export function baseRewardPerIncrementGwei(totalActiveEth: number): number {
  const totalGwei = totalActiveEth * GWEI_PER_ETH;
  return Math.floor((GWEI_PER_ETH * BASE_REWARD_FACTOR) / Math.floor(Math.sqrt(totalGwei)));
}

/** Full CL + EL rewards an online validator earns, ETH per ETH per epoch. */
export function rewardRatePerEpoch(aprPct: number): number {
  return aprPct / 100 / EPOCHS_PER_YEAR;
}

/**
 * Penalty for missing source and target in one epoch (get_flag_index_deltas),
 * ETH per ETH. Applies while offline and to slashed validators until they are
 * withdrawable. Head carries no penalty.
 */
export function missedAttestationPenaltyPerEpoch(totalActiveEth: number): number {
  const brpi = baseRewardPerIncrementGwei(totalActiveEth) / GWEI_PER_ETH;
  return (brpi * (TIMELY_SOURCE_WEIGHT + TIMELY_TARGET_WEIGHT)) / WEIGHT_DENOMINATOR;
}

// ── EIP-7716 (ported from validator-downtime/src/lib/penaltyCalculator.ts) ──

/**
 * Onset penalty factor when `cohortFraction` of stake goes offline together.
 * The smoothed baseline cancels out (the slope is normalised by total active
 * balance), so the factor depends only on the size of the anomaly. Never
 * below 1: uncorrelated failures pay today's penalties.
 */
export function eip7716Factor(cohortFraction: number): number {
  return Math.min(1 + EIP7716_PENALTY_SLOPE * Math.max(0, cohortFraction), EIP7716_MAX_PENALTY_FACTOR);
}

// ── Liveness outage ─────────────────────────────────────────────────────────

export interface OutageInput {
  stakeEth: number;
  /** How long you are offline, epochs. */
  epochsDown: number;
  /** Share of total stake offline together with you (0–1). */
  cohortFraction: number;
  /** How long the cohort stays down, epochs (defaults to yours). */
  cohortEpochsDown?: number;
  totalActiveEth: number;
  aprPct: number;
  /** Apply the revised EIP-7716 correlation scaling to the target penalty. */
  eip7716: boolean;
}

export interface OutageCost {
  forgoneEth: number;
  attestationPenaltyEth: number;
  /** Extra target penalty from EIP-7716 scaling (already in attestationPenaltyEth). */
  eip7716ExtraEth: number;
  leakEth: number;
  factor: number;
  totalEth: number;
}

/**
 * Cost of an outage: forgone rewards, source + target penalties (target
 * scaled by the EIP-7716 onset factor while the cohort is down, if enabled),
 * and the inactivity leak if more than ⅓ of stake is offline.
 */
export function outageCost(o: OutageInput): OutageCost {
  const E = Math.max(0, o.epochsDown);
  const cohortE = o.cohortEpochsDown ?? E;
  const high = Math.min(E, cohortE);
  const brpi = baseRewardPerIncrementGwei(o.totalActiveEth) / GWEI_PER_ETH;
  const factor = o.eip7716 ? eip7716Factor(o.cohortFraction) : 1;

  const forgoneEth = o.stakeEth * rewardRatePerEpoch(o.aprPct) * E;
  const source = (o.stakeEth * brpi * TIMELY_SOURCE_WEIGHT * E) / WEIGHT_DENOMINATOR;
  const targetToday = (o.stakeEth * brpi * TIMELY_TARGET_WEIGHT * E) / WEIGHT_DENOMINATOR;
  const target =
    (o.stakeEth * brpi * TIMELY_TARGET_WEIGHT * (factor * high + (E - high))) / WEIGHT_DENOMINATOR;
  const leakEth = o.cohortFraction > 1 / 3 ? inactivityLeakEth(o.stakeEth, high) : 0;

  return {
    forgoneEth,
    attestationPenaltyEth: source + target,
    eip7716ExtraEth: target - targetToday,
    leakEth,
    factor,
    totalEth: forgoneEth + source + target + leakEth,
  };
}

/**
 * Inactivity-leak loss for a validator offline for `epochs` while finality
 * is lost: its score rises by INACTIVITY_SCORE_BIAS per epoch once the leak
 * starts, and each epoch costs balance × score / (bias × quotient).
 */
export function inactivityLeakEth(stakeEth: number, epochs: number): number {
  const leakEpochs = Math.max(0, epochs - MIN_EPOCHS_TO_INACTIVITY_PENALTY);
  // score after k leak epochs = bias·k, so Σ_{k=1..n} bias·k / (bias·quotient) = n(n+1) / (2·quotient)
  const n = leakEpochs;
  const perEpochDivisor = INACTIVITY_SCORE_BIAS * INACTIVITY_PENALTY_QUOTIENT_BELLATRIX;
  return (stakeEth * INACTIVITY_SCORE_BIAS * n * (n + 1)) / (2 * perEpochDivisor);
}
