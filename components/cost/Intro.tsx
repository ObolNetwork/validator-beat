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
              Large stakers usually split their stake across several operators, each running its share alone (
              <strong>Stage 0</strong>). The same operators can instead run every validator together as a{" "}
              <strong>multi-operator distributed validator</strong> (<strong>Stage 1</strong>), so that no single compromise
              can get you slashed. That usually costs more. This calculator estimates whether the risk it removes is worth the
              extra cost.
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
