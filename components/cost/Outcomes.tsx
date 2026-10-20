import { Box, Text } from "@obolnetwork/obol-ui";
import { Card, Eyebrow } from "@components/assessment/stitches";
import { fmtDays, fmtEth, fmtPct, fmtUsd, fmtYears } from "@lib/cost/format";
import type { LossBreakdown } from "@lib/cost/events";
import type { Economics, OutcomeCase } from "@lib/cost/model";
import type { CostParams, FocusEvent } from "@lib/cost/params";
import { TableView } from "./controls";
import { Anchor } from "./Anchor";
import * as s from "./styles";

export const COMPONENTS: { key: keyof LossBreakdown; label: string }[] = [
  { key: "forgoneEth", label: "Rewards forgone" },
  { key: "attestationPenaltyEth", label: "Attestation penalties" },
  { key: "initialPenaltyEth", label: "Initial slashing penalty" },
  { key: "correlationPenaltyEth", label: "Correlation penalty" },
  { key: "leakEth", label: "Inactivity leak" },
];

interface Props {
  params: CostParams;
  cases: OutcomeCase[];
  econ: Economics;
  probabilities: { lucky: number; partial: number; full: number };
  onFocus: (id: FocusEvent) => void;
}

export function Outcomes({ params: p, cases, econ, probabilities, onFocus }: Props) {
  return (
    <Box as="section" css={{ ...s.section, ...s.band }} aria-labelledby="outcomes">
      <Box css={s.wrap}>
        <Eyebrow as="p" css={{ margin: "0 0 14px" }}>
          Lucky, partial or total
        </Eyebrow>
        <Anchor id="outcomes" css={s.h2}>
          A key compromise has three endings. Only one is cheap.
        </Anchor>
        <Text as="p" css={s.prose}>
          If the leak is caught first, the operator exits everything and pays only in lost rewards while the queues
          clear. If not, the attacker slashes, and stolen keys gain leverage the more of them are used at once: the{" "}
          <strong>correlation penalty</strong> is three times the share of the network slashed in the same window. So
          when slashings happen they tend to be big, and the operator&apos;s total share of the network matters far
          more than your slice of it. Probabilities are per incident, under the assumptions in{" "}
          <a href="#odds">the odds</a>.
        </Text>

        <Box
          css={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 16,
            marginTop: 34,
            "@media (max-width: 1000px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
            "@media (max-width: 560px)": { gridTemplateColumns: "minmax(0, 1fr)" },
          }}
        >
          {cases.map((c) => {
            const b = c.stage0.breakdown;
            const prob =
              c.id === "outage"
                ? `${p.outagesPerYear} per operator per year`
                : c.id === "partial"
                  ? `Partial slashings (under 90%): ${fmtPct(probabilities.partial)} of incidents`
                  : c.id === "full"
                    ? `90% or more slashed: ${fmtPct(probabilities.full)} of incidents`
                    : `${fmtPct(probabilities.lucky)} of incidents`;
            const s1 = c.id === "outage" ? c.stage1ExpectedEth : c.stage1.breakdown.totalEth;
            const active = p.focus === c.id;
            return (
              <Card
                key={c.id}
                as="article"
                css={{
                  ...s.cardPad,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  borderColor: active ? "var(--theme-brand)" : "$bg05",
                }}
              >
                <Box>
                  <Anchor as="h3" id={`outcome-${c.id}`} css={{ ...s.h3, fontSize: 17 }}>
                    {c.id === "partial" ? `${p.partialPct}% of keys slashed` : c.label}
                  </Anchor>
                  <Text css={{ ...s.small, marginTop: 4 }}>{prob}</Text>
                </Box>
                <Box>
                  <Text css={{ ...s.small, fontWeight: "$semibold" }}>
                    <Box as="span" css={s.swatch(s.S0)} />
                    Stage 0
                  </Text>
                  <Text css={{ ...s.statValue, fontSize: 26, marginTop: 4 }}>{fmtEth(b.totalEth)}</Text>
                  <Text css={s.small}>
                    {fmtUsd(b.totalEth * p.ethUsd)} · {fmtYears(b.totalEth / Math.max(econ.premiumPerYearEth, 1e-9))} of premium
                  </Text>
                </Box>
                <Box as="ul" css={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 7 }}>
                  {COMPONENTS.filter((k) => b[k.key] > 0.005).map((k) => (
                    <Box as="li" key={k.key}>
                      <Box css={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <Text css={s.small}>{k.label}</Text>
                        <Text css={{ ...s.small, color: "$body", fontVariantNumeric: "tabular-nums" }}>{fmtEth(b[k.key])}</Text>
                      </Box>
                      <Box css={{ height: 4, backgroundColor: s.GRID, borderRadius: 2, marginTop: 3 }}>
                        <Box
                          css={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: s.S0,
                            width: `${Math.max(1.5, (b[k.key] / b.totalEth) * 100)}%`,
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Text css={s.small}>
                  {c.id === "outage" ? "Offline" : "Not earning"} for {fmtDays(c.stage0.unpaidDays)} on average
                  {c.id !== "outage" && c.slashedFraction > 0 && c.stage0.correlationFraction > 0 && (
                    <> · correlation penalty {fmtPct(c.stage0.correlationFraction, 1)} of slashed stake</>
                  )}
                </Text>
                <Box css={{ borderTop: "1px solid $bg05", paddingTop: 12, marginTop: "auto" }}>
                  <Text css={{ ...s.small, fontWeight: "$semibold" }}>
                    <Box as="span" css={s.swatch(s.S1)} />
                    Stage 1
                  </Text>
                  <Text css={{ ...s.statValue, fontSize: 22, marginTop: 4 }}>{fmtEth(s1)}</Text>
                  <Text css={s.small}>{c.id === "outage" ? "Expected, after coverage" : "Replace one key-holder"}</Text>
                </Box>
                <Box
                  as="button"
                  type="button"
                  onClick={() => {
                    onFocus(c.id);
                    document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  aria-pressed={active}
                  css={{
                    all: "unset",
                    cursor: "pointer",
                    fontSize: "$2",
                    fontWeight: "$semibold",
                    color: "var(--theme-brand)",
                    "&:hover": { textDecoration: "underline" },
                    "&:focus-visible": { outline: "2px solid var(--theme-brand)", outlineOffset: 2, borderRadius: 3 },
                  }}
                >
                  See the timeline →
                </Box>
              </Card>
            );
          })}
        </Box>

        <TableView summary="Show all outcomes as a table">
          <table>
            <thead>
              <tr>
                <th>Component (ETH)</th>
                {cases.map((c) => (
                  <th key={c.id}>{c.id === "partial" ? `${p.partialPct}% slashed` : c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPONENTS.map((k) => (
                <tr key={k.key}>
                  <td>{k.label}</td>
                  {cases.map((c) => (
                    <td key={c.id}>{fmtEth(c.stage0.breakdown[k.key], { unit: false })}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td>
                  <strong>Stage 0 total</strong>
                </td>
                {cases.map((c) => (
                  <td key={c.id}>
                    <strong>{fmtEth(c.stage0.breakdown.totalEth, { unit: false })}</strong>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Stage 1 (usual path / expected)</td>
                {cases.map((c) => (
                  <td key={c.id}>{fmtEth(c.id === "outage" ? c.stage1ExpectedEth : c.stage1.breakdown.totalEth, { unit: false })}</td>
                ))}
              </tr>
              <tr>
                <td>Stage 1 incl. residual threshold risk</td>
                {cases.map((c) => (
                  <td key={c.id}>{fmtEth(c.stage1ExpectedEth, { unit: false })}</td>
                ))}
              </tr>
              <tr>
                <td>Days not earning (Stage 0)</td>
                {cases.map((c) => (
                  <td key={c.id}>{c.stage0.unpaidDays.toFixed(1)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </TableView>
      </Box>
    </Box>
  );
}
