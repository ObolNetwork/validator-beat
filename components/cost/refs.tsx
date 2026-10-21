import { Box, Text } from "@obolnetwork/obol-ui";
import { REFS } from "@lib/cost/references";
import { Anchor } from "./Anchor";
import * as s from "./styles";


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
