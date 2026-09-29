import { Pizza } from "@components/pizza/Pizza";
import { SLICES, STAGE_META, computeStage } from "@lib/rubric";
import type { Answers, SliceColor } from "@lib/rubric/types";
import { Box, Text } from "@obolnetwork/obol-ui";
import { RiskDot, SectionLabel, risk } from "./stitches";

const RANK: Record<SliceColor, number> = { green: 2, yellow: 1, red: 0, unknown: 0 };

type Side = { label: string; answers: Answers };

type CompareCardProps = { left: Side; right: Side };

/** Head-to-head of two results: two pizzas, a verdict, and the slices where they differ. */
export function CompareCard({ left, right }: CompareCardProps) {
  const ls = computeStage(left.answers);
  const rs = computeStage(right.answers);
  if (ls == null || rs == null) return null;

  const diffs = SLICES.filter((s) => left.answers[s.id] !== right.answers[s.id]);
  const ahead = (label: string, by: number) =>
    `${label} ${label === "You" ? "are" : "is"} ${by === 1 ? "a stage" : "two stages"} ahead`;
  const verdict =
    ls === rs
      ? `Both ${STAGE_META[ls].name}`
      : ls > rs
        ? ahead(left.label, ls - rs)
        : ahead(right.label, rs - ls);

  return (
    <Box css={{ marginBottom: 22 }}>
      <SectionLabel>Head to head</SectionLabel>
      <Box
        css={{
          border: "1px solid $bg05",
          borderRadius: "$4",
          backgroundColor: "$bg03",
          padding: "16px 18px",
        }}
      >
        <Box css={{ display: "flex", justifyContent: "space-around", gap: 12, flexWrap: "wrap" }}>
          {[
            { side: left, stage: ls },
            { side: right, stage: rs },
          ].map(({ side, stage }) => (
            <Box key={side.label} css={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
              <Pizza answers={side.answers} size={132} stage={stage} showLabels={false} glowOpacity={0.25} />
              <Text css={{ fontSize: "$3", fontWeight: "$bold", color: "$body", marginTop: 6, textAlign: "center", overflowWrap: "anywhere" }}>
                {side.label}
              </Text>
              <Text css={{ fontSize: "$2", fontWeight: "$bold", color: risk[STAGE_META[stage].tone] }}>
                {STAGE_META[stage].name}
              </Text>
            </Box>
          ))}
        </Box>
        <Text css={{ fontSize: "$3", fontWeight: "$semibold", color: "$body", textAlign: "center", marginTop: 12 }}>
          {verdict}
          {diffs.length === 0 ? " — identical setups." : ` · ${diffs.length} of 6 slices differ`}
        </Text>
        {diffs.length > 0 && (
          <Box
            as="table"
            css={{
              margin: "12px auto 0",
              borderCollapse: "collapse",
              fontSize: "$2",
              color: "$textMiddle",
              "& th, & td": { padding: "4px 10px" },
              "& th": { fontWeight: "$semibold", textAlign: "center", maxWidth: 140, overflowWrap: "anywhere" },
            }}
          >
            <thead>
              <tr>
                <th aria-label="Slice" />
                <th>{left.label}</th>
                <th>{right.label}</th>
              </tr>
            </thead>
            <tbody>
              {diffs.map((s) => {
                const l = left.answers[s.id]!;
                const r = right.answers[s.id]!;
                const cell = (c: SliceColor, ahead: boolean) => (
                  <Box as="td" css={{ textAlign: "center", fontWeight: ahead ? "$bold" : undefined }}>
                    <Box css={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <RiskDot color={c} size="sm" />
                      {c === "unknown" ? "not sure" : c}
                    </Box>
                  </Box>
                );
                return (
                  <tr key={s.id}>
                    <Box as="td" css={{ fontWeight: "$semibold", color: "$body" }}>{s.label}</Box>
                    {cell(l, RANK[l] > RANK[r])}
                    {cell(r, RANK[r] > RANK[l])}
                  </tr>
                );
              })}
            </tbody>
          </Box>
        )}
      </Box>
    </Box>
  );
}
