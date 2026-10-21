/**
 * The mechanics behind every number, in plain words with the spec function
 * each comes from. Rendered on /cost-of-failure (How it's calculated) and in
 * llms-full.txt, so the page and the agent docs can't disagree.
 */
import { SPEC_REFS } from "./protocol";

export interface Formula {
  title: string;
  body: string;
  ref: keyof typeof SPEC_REFS;
  refLabel: string;
}

export const FORMULAS: Formula[] = [
  {
    title: "Exit epoch",
    body: "Exits drain through one queue at get_activation_exit_churn_limit = min(256, max(128, total ÷ 65,536)) ETH per epoch. Your place is the queue ahead plus your position in the operator's book.",
    ref: "exitEpoch",
    refLabel: "compute_exit_epoch_and_update_churn",
  },
  {
    title: "Withdrawable epoch",
    body: "exit + 256 epochs (~27 h). A slashed validator waits at least slash + 8,192 epochs (~36 days), penalised for missed source and target votes the whole time.",
    ref: "slashValidator",
    refLabel: "slash_validator",
  },
  {
    title: "Initial slashing penalty",
    body: "effective_balance ÷ 4,096, applied at once.",
    ref: "slashValidator",
    refLabel: "MIN_SLASHING_PENALTY_QUOTIENT_ELECTRA",
  },
  {
    title: "Correlation penalty",
    body: "At withdrawable − 4,096: effective_balance × min(3 × slashings in the last 8,192 epochs, total) ÷ total, rounded per ETH increment. A validator withdrawable more than ~12,288 epochs after its slashing finds it already out of the window.",
    ref: "processSlashings",
    refLabel: "process_slashings",
  },
  {
    title: "Missed-attestation penalty",
    body: "(14 + 26) ÷ 64 × base_reward per epoch, with base_reward_per_increment = 64 × 10⁹ ÷ √(total Gwei). Head carries no penalty.",
    ref: "flagPenalties",
    refLabel: "get_flag_index_deltas",
  },
  {
    title: "Withdrawal sweep",
    body: "Each payload withdraws 16 validators, minus up to 8 pending partial withdrawals, so a full cycle is validators ÷ 16 slots. You wait half a cycle on average.",
    ref: "withdrawals",
    refLabel: "get_expected_withdrawals",
  },
  {
    title: "Re-entry",
    body: "Re-deposits join pending_deposits behind the backlog and any new demand, and drain at the same 256 ETH per epoch (at most 16 deposits per epoch). A whole operator re-depositing clogs it for everyone. Activation follows ~9 epochs later.",
    ref: "pendingDeposits",
    refLabel: "process_pending_deposits",
  },
  {
    title: "Consolidation (DV bad leaver)",
    body: "Sources drain at the consolidation churn (balance churn − 256, ~410 ETH per epoch) and keep earning while they wait. They then earn nothing for the 256-epoch withdrawability delay before the balance lands on the new cluster. New 0x02 targets need a 32 ETH seed through the entry queue.",
    ref: "pendingConsolidations",
    refLabel: "process_pending_consolidations",
  },
  {
    title: "Outages",
    body: "Forgone rewards plus source and target penalties. With EIP-7716 enabled, the target penalty is scaled by min(1 + 765 × share offline, 256) while the cohort is down. Above ⅓ offline the inactivity leak adds balance × n(n+1) ÷ 2²⁵.",
    ref: "eip7716",
    refLabel: "EIP-7716",
  },
];
