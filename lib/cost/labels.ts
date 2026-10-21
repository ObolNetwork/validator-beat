/**
 * Names for the two setups the page compares: the same operators running
 * your stake separately (each a single point of failure for its slice), or
 * together as one multi-operator distributed validator. The stage is shown
 * alongside, since that's how Validator Beat grades them.
 */
export const SETUP = {
  s0: {
    name: "Solo-operator setup",
    short: "Solo operators",
    stage: "Stage 0",
    definition:
      "Your stake is split across operators that each run their share alone. One compromised key at any of them can get that share slashed.",
  },
  s1: {
    name: "Multi-operator distributed validator",
    short: "Multi-operator DV",
    stage: "Stage 1",
    definition:
      "The same operators run every validator together, and signing needs a threshold of them. No single compromise can get you slashed.",
  },
} as const;
