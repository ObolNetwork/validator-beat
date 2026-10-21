/**
 * Sources cited on /cost-of-failure. Shared by the page's numbered
 * citations and llms-full.txt.
 */
import { DOWNTIME_CALCULATOR_URL } from "@constants/index";
import { SPEC_REFS } from "./protocol";

/** Sources cited on /cost-of-failure, in order of first citation (sets the numbers). */
export const REFS = [
  {
    key: "holesky",
    title: "Holešky Pectra incident post-mortem",
    publisher: "Ethereum Foundation, ethereum/pm",
    url: "https://github.com/ethereum/pm/blob/master/Network-Upgrade-Archive/Pectra/holesky-postmortem.md",
  },
  {
    key: "lockout",
    title: "EIP-7716 downtime calculator: client failure tiers and wrong-fork lockout model",
    publisher: "validatordowntime.obol.org",
    url: DOWNTIME_CALCULATOR_URL,
  },
  {
    key: "inactivity",
    title: "get_inactivity_penalty_deltas (inactivity leak)",
    publisher: "ethereum/consensus-specs, Bellatrix",
    url: SPEC_REFS.inactivity,
  },
  {
    key: "holesky-debrief",
    title: "Holešky incident debrief, 26 February 2025",
    publisher: "Ethereum Magicians",
    url: "https://ethereum-magicians.org/t/holesky-incident-debrief-february-26-2025/22998",
  },
  {
    key: "clients",
    title: "Client diversity, including stake-weighted execution client shares from supermajority.info",
    publisher: "clientdiversity.org",
    url: "https://clientdiversity.org/",
  },
  {
    key: "queues",
    title: "Validator queue history",
    publisher: "validatorqueue.com (etheralpha/validatorqueue-com)",
    url: "https://github.com/etheralpha/validatorqueue-com",
  },
  {
    key: "slashings",
    title: "process_slashings and slash_validator",
    publisher: "ethereum/consensus-specs, Electra",
    url: SPEC_REFS.processSlashings,
  },
  {
    key: "eip7716",
    title: "EIP-7716: Anti-correlation attestation penalties",
    publisher: "Ethereum Improvement Proposals",
    url: SPEC_REFS.eip7716,
  },
  {
    key: "eip7251",
    title: "EIP-7251: Increase the MAX_EFFECTIVE_BALANCE (consolidations)",
    publisher: "Ethereum Improvement Proposals",
    url: SPEC_REFS.eip7251,
  },
] as const;
