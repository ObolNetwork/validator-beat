import { Box, Text } from "@obolnetwork/obol-ui";
import { useMemo } from "react";
import { Card } from "@components/assessment/stitches";
import { fmtEth, fmtUsd, fmtYears, fmtYearsBetween, sinceYear } from "@lib/cost/format";
import { SNAPSHOT_YEAR } from "@lib/cost/network";
import { SETUP } from "@lib/cost/labels";
import { expectations } from "@lib/cost/montecarlo";
import { primaryOperator } from "@lib/cost/model";
import { parseOps } from "@lib/cost/params";
import type { Economics, OutcomeCase } from "@lib/cost/model";
import type { CostParams } from "@lib/cost/params";
import { AreaCompare } from "./AreaCompare";
import { InfoTip } from "./InfoTip";
import * as s from "./styles";

interface Props {
  params: CostParams;
  econ: Economics;
  cases: OutcomeCase[];
}

const label = { fontSize: "$1", fontWeight: "$bold", textTransform: "uppercase", letterSpacing: "0.05em", color: "$textMiddle" } as const;

/**
 * The answer, from expected values (no simulation): what each setup is
 * expected to lose a year, what the multi-operator DV costs extra, and the net.
 */
export function Results({ params: p, econ, cases }: Props) {
  const exp = useMemo(() => expectations(p), [p]);
  const k = Math.max(1, Math.round(p.operators));
  const custom = parseOps(p.opList) !== null;
  const biggest = primaryOperator(p);
  const loss0 = exp.loss0PerYearEth;
  const loss1 = exp.loss1PerYearEth;
  const premium = econ.premiumPerYearEth;
  const net = exp.annualAdvantageEth;
  const full = cases.find((c) => c.id === "full")!;
  const worst = full.stage0.breakdown.totalEth;
  const dvRoute = full.stage1.breakdown.totalEth;
  const worstYears = premium > 0 ? worst / premium : Infinity;
  // Round once, so the % and the "years between incidents" agree on the page.
  const be = Number.isFinite(exp.breakEvenRatePct)
    ? Number(exp.breakEvenRatePct.toFixed(exp.breakEvenRatePct < 1 ? 2 : 1))
    : exp.breakEvenRatePct;
  const usd = (eth: number) => fmtUsd(eth * p.ethUsd);

  return (
    <Card
      as="section"
      aria-labelledby="results"
      aria-live="polite"
      css={{ ...s.cardPad, display: "flex", flexDirection: "column", gap: 22, borderColor: "var(--theme-brand)" }}
    >
      <Box>
        <Text css={{ fontSize: "$1", fontWeight: "$bold", textTransform: "uppercase", letterSpacing: "0.06em", color: s.LINK }}>
          Step 2 · Results
        </Text>
        <Text as="h2" id="results" css={{ fontSize: 26, lineHeight: 1.25, letterSpacing: "-0.015em", fontWeight: "$bold", color: "$body", margin: "8px 0 0", textWrap: "balance" }}>
          {Number.isFinite(be) && be > 0 ? (
            <>
              Do you expect {k > 1 ? `each of your ${k} operators` : "your operator"} to go{" "}
              <Box as="span" css={{ color: s.LINK }}>{fmtYearsBetween(be)}</Box> without a security incident?
            </>
          ) : be === 0 ? (
            <>Running your operators together pays for itself even if no key is ever compromised.</>
          ) : (
            <>With these settings, running your operators separately comes out ahead on average.</>
          )}
        </Text>
        {Number.isFinite(be) && be > 0 && (
          <Text css={{ ...s.small, fontSize: "$2", marginTop: 8 }}>
            That&apos;s how rare incidents must be for running them separately to pay off: none at an operator since about{" "}
            {sinceYear(be, SNAPSHOT_YEAR)}.{" "}
            {p.incidentRatePct > 0
              ? `You assumed about one every ${fmtYearsBetween(p.incidentRatePct)} per operator, or none since ${sinceYear(p.incidentRatePct, SNAPSHOT_YEAR)}.`
              : "You assumed none."}
            {p.view === "advanced" && ` (Break-even: ${be}% of operator-years.)`}
          </Text>
        )}
      </Box>

      <Box
        css={{
          borderRadius: 12,
          padding: "14px 16px",
          backgroundColor: net >= 0 ? "color-mix(in srgb, var(--theme-cost-s1) 10%, transparent)" : "$bg03",
          border: "1px solid",
          borderColor: net >= 0 ? "color-mix(in srgb, var(--theme-cost-s1) 45%, transparent)" : "$bg05",
        }}
      >
        <Text css={{ fontSize: "$3", lineHeight: 1.5, color: "$body", fontWeight: "$semibold" }}>
          {net >= 0 ? (
            <>
              If not, run them together. On average the multi-operator DV saves you <strong>{fmtEth(net)} a year</strong>{" "}
              ({usd(net)}) after its extra cost.
            </>
          ) : (
            <>
              At your setting, the multi-operator DV costs about <strong>{fmtEth(-net)} a year</strong> ({usd(-net)}) more
              than it saves.
            </>
          )}
        </Text>
      </Box>

      <Box css={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 18, "@media (max-width: 420px)": { gridTemplateColumns: "minmax(0, 1fr)" } }}>
        <Box>
          <Box css={{ display: "flex", alignItems: "center" }}>
            <Text css={label}>Expected loss a year</Text>
            <InfoTip label="expected loss a year">
              Incidents a year × the average cost of one, plus outages. Most years the real loss is zero; some years it is
              far larger.
            </InfoTip>
          </Box>
          {([
            ["s0", loss0, s.S0],
            ["s1", loss1, s.S1],
          ] as const).map(([key, v, color]) => (
            <Text key={key} css={{ fontSize: "$3", color: "$body", marginTop: 8, fontVariantNumeric: "tabular-nums" }}>
              <Box as="span" css={s.swatch(color)} />
              <strong>{fmtEth(v)}</strong>{" "}
              <Text as="span" css={{ display: "inline", ...s.small }}>
                {SETUP[key].short} · {SETUP[key].stage}
              </Text>
            </Text>
          ))}
        </Box>
        <Box>
          <Text css={label}>Extra cost of running together</Text>
          <Text css={{ fontSize: "$3", color: "$body", marginTop: 8 }}>
            <strong>{fmtEth(premium)} a year</strong> up front
          </Text>
          <Text css={{ ...s.small, marginTop: 4 }}>
            {p.fee1Pct}% instead of {p.fee0Pct}% of rewards. One worst case costs {fmtYears(worstYears)} of it.
          </Text>
        </Box>
      </Box>

      <Box css={{ borderTop: "1px solid $bg05", paddingTop: 16 }}>
        <Text as="h3" css={{ ...label, margin: "0 0 12px" }}>
          {custom
            ? `Your largest exposure: the operator with ${fmtEth(biggest.stakeEth)} of yours (${biggest.sharePct}% of the network) has its keys leaked and all slashed`
            : "The worst case: one operator's keys leak and are all slashed"}
        </Text>
        <AreaCompare
          big={{
            label: `${SETUP.s0.short}: slashed and exited`,
            sub: k > 1 ? `the ${fmtEth(biggest.stakeEth)} that operator ran` : "your whole stake",
            eth: worst,
          }}
          small={{
            label: `${SETUP.s1.short}: replace the operator`,
            sub: "at your own pace",
            eth: dvRoute,
          }}
          ethUsd={p.ethUsd}
          maxSide={170}
        />
      </Box>

      <a href="#ahead-heatmap" style={{ color: "var(--theme-brand)", fontWeight: 600, textDecoration: "underline", fontSize: 14 }}>
        See how often the solo setup still comes out ahead ↓
      </a>
    </Card>
  );
}
