import { Box, Text } from "@obolnetwork/obol-ui";
import { Eyebrow } from "@components/assessment/stitches";
import { SETUP } from "@lib/cost/labels";
import type { CostParams } from "@lib/cost/params";
import { Chips } from "./controls";
import * as s from "./styles";

export function Intro({ params: p, update }: { params: CostParams; update: (patch: Partial<CostParams>) => void }) {
  return (
    <Box as="header" css={{ ...s.section, paddingBottom: 28 }}>
      <Box css={s.wrap}>
        <Box
          css={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 24,
            "@media (max-width: 760px)": { flexDirection: "column", gap: 18 },
          }}
        >
          <Box css={{ maxWidth: 820 }}>
            <Eyebrow as="p" css={{ margin: "0 0 14px", color: s.LINK }}>
              The cost of failure
            </Eyebrow>
            <Text as="h1" css={s.h1}>
              Is it worth paying your operators to run your validators together?
            </Text>
            <Text as="p" css={s.lede}>
              Splitting your stake across operators that each run their share alone (<strong>Stage 0</strong>) leaves each
              share one leaked key away from slashing. Running every validator together as a{" "}
              <strong>multi-operator distributed validator</strong> (<strong>Stage 1</strong>) removes that, for a higher fee.
              Is it worth it?
            </Text>
          </Box>
          <Chips
            label="View"
            size="sm"
            value={p.view}
            options={[
              { id: "basic", label: "Basic" },
              { id: "advanced", label: "Advanced" },
            ]}
            onChange={(view) => update({ view })}
            css={{ width: 220, flexShrink: 0, "@media (max-width: 760px)": { width: "100%", maxWidth: 320 } }}
          />
        </Box>

        {p.snap && (
          <Box
            role="note"
            css={{
              marginTop: 22,
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid $bg05",
              backgroundColor: "$bg03",
              display: "flex",
              gap: 14,
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              maxWidth: 980,
            }}
          >
            <Text css={{ ...s.small, fontSize: "$2", color: "$body" }}>
              <strong>Pinned to the {p.snap} network snapshot</strong> and that day&apos;s defaults, so these numbers match
              wherever this link was shared.
            </Text>
            <Box
              as="button"
              type="button"
              onClick={() => update({ snap: "" })}
              css={{
                all: "unset",
                cursor: "pointer",
                fontSize: "$2",
                fontWeight: "$semibold",
                color: s.LINK,
                textDecoration: "underline",
                "&:focus-visible": { outline: "2px solid var(--theme-brand)", outlineOffset: 2, borderRadius: 3 },
              }}
            >
              Use the latest numbers
            </Box>
          </Box>
        )}

        <Box
          as="dl"
          css={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 14,
            marginTop: 26,
            maxWidth: 980,
            "@media (max-width: 760px)": { gridTemplateColumns: "minmax(0, 1fr)" },
          }}
        >
          {([
            ["s0", s.S0],
            ["s1", s.S1],
          ] as const).map(([k, color]) => (
            <Box key={k} css={{ borderLeft: `4px solid ${color}`, paddingLeft: 12 }}>
              <Text as="dt" css={{ fontSize: "$2", fontWeight: "$bold", color: "$body" }}>
                {SETUP[k].name}{" "}
                <Text as="span" css={{ display: "inline", fontWeight: "$medium", color: "$textMiddle" }}>
                  · {SETUP[k].stage}
                </Text>
              </Text>
              <Text as="dd" css={{ ...s.small, margin: "3px 0 0", fontSize: "$2" }}>
                {SETUP[k].definition}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
