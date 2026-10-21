import { Box, Text } from "@obolnetwork/obol-ui";
import { DOWNTIME_CALCULATOR_URL } from "@constants/index";
import { SPEC_REFS } from "@lib/cost/protocol";
import { Anchor } from "./Anchor";
import * as s from "./styles";

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

export type RefKey = (typeof REFS)[number]["key"];

const index = (key: RefKey) => REFS.findIndex((r) => r.key === key) + 1;

/** Superscript citation that jumps to the reference list. */
export function Ref({ k }: { k: RefKey }) {
  const n = index(k);
  const r = REFS[n - 1];
  return (
    <Box as="sup" css={{ fontSize: "0.72em", lineHeight: 0, marginLeft: 1 }}>
      <Box
        as="a"
        href={`#ref-${k}`}
        aria-label={`Reference ${n}: ${r.title}`}
        css={{
          color: s.LINK,
          fontWeight: "$semibold",
          textDecoration: "none",
          padding: "0 1px",
          "&:hover": { textDecoration: "underline" },
          "&:focus-visible": { outline: "2px solid var(--theme-brand)", outlineOffset: 1, borderRadius: 2 },
        }}
      >
        [{n}]
      </Box>
    </Box>
  );
}

export function References() {
  return (
    <Box css={{ marginTop: 36 }}>
      <Anchor as="h3" id="references" css={s.h3}>
        References
      </Anchor>
      <Box as="ol" css={{ ...s.prose, paddingLeft: 24, marginTop: 12, "& li": { marginTop: 8, paddingLeft: 4 } }}>
        {REFS.map((r) => (
          <Box as="li" key={r.key} id={`ref-${r.key}`}>
            <Box as="a" href={r.url} target="_blank" rel="noopener noreferrer">
              {r.title}
              <Box as="span" css={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
                {" "}(opens in a new tab)
              </Box>
            </Box>
            <Text as="span" css={{ display: "inline", color: "$textMiddle" }}>
              {" "}· {r.publisher}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
