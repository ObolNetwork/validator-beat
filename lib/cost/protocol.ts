/**
 * Consensus-spec constants for the cost-of-failure model.
 *
 * Pinned to the fork live on mainnet as of the network snapshot: Fulu
 * (Electra's validator, churn and slashing rules are unchanged in Fulu).
 * Every constant links to the spec that defines it; the methodology section
 * on /cost-of-failure renders `SPEC_REFS` so the page and the code agree.
 */

export const SPEC_VERSION = "consensus-specs v1.6 (Fulu, live on mainnet)";

const SPEC = "https://github.com/ethereum/consensus-specs/blob/master/specs";
export const SPEC_REFS = {
  baseReward: `${SPEC}/altair/beacon-chain.md#get_base_reward_per_increment`,
  flagWeights: `${SPEC}/altair/beacon-chain.md#incentivization-weights`,
  flagPenalties: `${SPEC}/altair/beacon-chain.md#get_flag_index_deltas`,
  inactivity: `${SPEC}/bellatrix/beacon-chain.md#modified-get_inactivity_penalty_deltas`,
  balanceChurn: `${SPEC}/electra/beacon-chain.md#new-get_balance_churn_limit`,
  activationExitChurn: `${SPEC}/electra/beacon-chain.md#new-get_activation_exit_churn_limit`,
  consolidationChurn: `${SPEC}/electra/beacon-chain.md#new-get_consolidation_churn_limit`,
  exitEpoch: `${SPEC}/electra/beacon-chain.md#new-compute_exit_epoch_and_update_churn`,
  consolidationEpoch: `${SPEC}/electra/beacon-chain.md#new-compute_consolidation_epoch_and_update_churn`,
  pendingDeposits: `${SPEC}/fulu/beacon-chain.md#modified-process_pending_deposits`,
  pendingConsolidations: `${SPEC}/electra/beacon-chain.md#new-process_pending_consolidations`,
  slashValidator: `${SPEC}/electra/beacon-chain.md#modified-slash_validator`,
  processSlashings: `${SPEC}/electra/beacon-chain.md#modified-process_slashings`,
  withdrawals: `${SPEC}/electra/beacon-chain.md#modified-get_expected_withdrawals`,
  eip7716: "https://eips.ethereum.org/EIPS/eip-7716",
  eip7251: "https://eips.ethereum.org/EIPS/eip-7251",
  eip6110: "https://eips.ethereum.org/EIPS/eip-6110",
} as const;

// ── Time ────────────────────────────────────────────────────────────────────
export const SECONDS_PER_SLOT = 12;
export const SLOTS_PER_EPOCH = 32;
export const SECONDS_PER_EPOCH = SECONDS_PER_SLOT * SLOTS_PER_EPOCH; // 384
export const EPOCHS_PER_DAY = 86_400 / SECONDS_PER_EPOCH; // 225
export const EPOCHS_PER_YEAR = EPOCHS_PER_DAY * 365.25; // 82,181.25

// ── Units ───────────────────────────────────────────────────────────────────
export const GWEI_PER_ETH = 1e9;
export const EFFECTIVE_BALANCE_INCREMENT_ETH = 1;
export const MIN_ACTIVATION_BALANCE_ETH = 32;
export const MAX_EFFECTIVE_BALANCE_ELECTRA_ETH = 2048;

// ── Rewards (Altair) ────────────────────────────────────────────────────────
export const BASE_REWARD_FACTOR = 64;
export const TIMELY_SOURCE_WEIGHT = 14;
export const TIMELY_TARGET_WEIGHT = 26;
export const TIMELY_HEAD_WEIGHT = 14;
export const WEIGHT_DENOMINATOR = 64;

// ── Inactivity leak (Bellatrix) ─────────────────────────────────────────────
export const INACTIVITY_SCORE_BIAS = 4;
export const INACTIVITY_PENALTY_QUOTIENT_BELLATRIX = 2 ** 24;
export const MIN_EPOCHS_TO_INACTIVITY_PENALTY = 4;

// ── Slashing (Electra) ──────────────────────────────────────────────────────
export const MIN_SLASHING_PENALTY_QUOTIENT_ELECTRA = 4096;
export const PROPORTIONAL_SLASHING_MULTIPLIER_BELLATRIX = 3;
export const EPOCHS_PER_SLASHINGS_VECTOR = 8192;

// ── Churn, exits and withdrawals (Electra) ──────────────────────────────────
export const CHURN_LIMIT_QUOTIENT = 65_536;
export const MIN_PER_EPOCH_CHURN_LIMIT_ELECTRA_ETH = 128;
export const MAX_PER_EPOCH_ACTIVATION_EXIT_CHURN_LIMIT_ETH = 256;
export const MIN_VALIDATOR_WITHDRAWABILITY_DELAY = 256; // epochs, ~27.3 h
export const MAX_SEED_LOOKAHEAD = 4;
export const MAX_WITHDRAWALS_PER_PAYLOAD = 16;
export const MAX_PENDING_PARTIALS_PER_WITHDRAWALS_SWEEP = 8;

/**
 * Epochs from a deposit being processed to the validator attesting: the
 * deposit waits for finality (~2 epochs), activation_eligibility_epoch is set,
 * that epoch must finalize, then activation lands at
 * compute_activation_exit_epoch = epoch + 1 + MAX_SEED_LOOKAHEAD.
 * A modelling constant, not a spec constant.
 */
export const ACTIVATION_LATENCY_EPOCHS = 2 + 2 + 1 + MAX_SEED_LOOKAHEAD;

// ── EIP-7716 (2026 revision, Draft; proposed for Hegotá) ────────────────────
// Ported from validator-downtime (src/lib/constants.ts) so the two sites agree.
export const EIP7716_MAX_PENALTY_FACTOR = 256;
export const EIP7716_PENALTY_SLOPE = 765;
