import { Box, Text } from "@obolnetwork/obol-ui";
import { useMemo } from "react";
import { Card } from "@components/assessment/stitches";
import { fmtEth, fmtUsd, fmtYears, fmtYearsBetween } from "@lib/cost/format";
import { SETUP } from "@lib/cost/labels";
import { expectations } from "@lib/cost/montecarlo";
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
const big = { fontSize: 34, lineHeight: 1.05, fontWeight: "$bold", letterSpacing: "-0.025em", color: "$body", fontVariantNumeric: "tabular-nums", marginTop: 6 } as const;

/**
 * The answer, from expected values (no simulation): what each setup is
 * expected to lose a year, what the multi-operator DV costs extra, and the net.
 */
export function Results({ params: p, econ, cases }: Props) {
  const exp = useMemo(() => expectations(p), [p]);
  const k = Math.max(1, Math.round(p.operators));
  const lambda = p.incidentRatePct / 100;
  const loss0 = k * lambda * exp.perIncident0Eth + exp.outage0PerYearEth;
  const loss1 = k * lambda * exp.perIncident1Eth + exp.outage1PerYearEth;
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
          Step 2
        </Text>
        <Text as="h2" id="results" css={{ ...s.h3, fontSize: 22, marginTop: 4 }}>
          Results
        </Text>
      </Box>

      <Box>
        <Box css={{ display: "flex", alignItems: "center" }}>
          <Text as="h3" css={{ fontSize: "$2", fontWeight: "$semibold", color: "$body", margin: 0 }}>
            Expected loss a year
          </Text>
          <InfoTip label="expected loss a year">
            Incidents a year × the average cost of one, plus outages. Most years the real loss is zero; some years it is far
            larger. Advanced shows the spread.
          </InfoTip>
        </Box>
        <Box css={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 18, marginTop: 12 }}>
          {([
            ["s0", loss0, s.S0],
            ["s1", loss1, s.S1],
          ] as const).map(([key, v, color]) => (
            <Box key={key}>
              <Text css={label}>
                <Box as="span" css={s.swatch(color)} />
                {SETUP[key].short}
                <Box as="span" css={{ fontWeight: "$medium", textTransform: "none", letterSpacing: 0 }}> · {SETUP[key].stage}</Box>
              </Text>
              <Text css={big}>{fmtEth(v)}</Text>
              <Text css={{ ...s.small, marginTop: 4 }}>{usd(v)} a year</Text>
            </Box>
          ))}
        </Box>
      </Box>

      <Box css={{ borderTop: "1px solid $bg05", paddingTop: 18 }}>
        <Text css={{ fontSize: "$4", lineHeight: 1.45, color: "$body" }}>
          The multi-operator setup may cost <strong>{fmtEth(premium)} a year more</strong> up front.
        </Text>
        <Text css={{ ...s.small, marginTop: 4 }}>
          {usd(premium)}: fees of {p.fee1Pct}% instead of {p.fee0Pct}% on {fmtEth(econ.rewardsPerYearEth)} of rewards a year.
          One worst-case incident at a solo operator would cost as much as <strong>{fmtYears(worstYears)}</strong> of it.
        </Text>
      </Box>

      <Box
        css={{
          borderRadius: 12,
          padding: "16px 18px",
          backgroundColor: net >= 0 ? "color-mix(in srgb, var(--theme-cost-s1) 10%, transparent)" : "$bg03",
          border: "1px solid",
          borderColor: net >= 0 ? "color-mix(in srgb, var(--theme-cost-s1) 45%, transparent)" : "$bg05",
        }}
      >
        <Text css={{ fontSize: "$4", lineHeight: 1.45, color: "$body", fontWeight: "$semibold" }}>
          {net >= 0 ? (
            <>
              On average though, the multi-operator DV saves you <strong>{fmtEth(net)} a year</strong> ({usd(net)}) after
              its additional cost.
            </>
          ) : (
            <>
              On average, the multi-operator DV costs you <strong>{fmtEth(-net)} a year</strong> ({usd(-net)}) more than it saves at
              this incident rate.
            </>
          )}
        </Text>
        <Text css={{ ...s.small, fontSize: "$2", marginTop: 6 }}>
          {Number.isFinite(be) && be > 0 ? (
            <>
              It pays for itself if key incidents happen more than <strong>{be}%</strong> of
              operator-years. You assumed {p.incidentRatePct}%.
            </>
          ) : be === 0 ? (
            <>It pays for itself at any incident rate, even zero.</>
          ) : (
            <>With these settings the multi-operator DV doesn&apos;t pay for itself at any incident rate.</>
          )}
        </Text>
      </Box>

      {Number.isFinite(be) && (
        <Box css={{ borderLeft: "3px solid var(--theme-brand)", paddingLeft: 14 }}>
          {be > 0 ? (
            <>
              <Text css={{ fontSize: "$4", lineHeight: 1.45, color: "$body", fontWeight: "$semibold" }}>
                Do you expect {k > 1 ? `each of your ${k} operators` : "your operator"} to go{" "}
                <strong>{fmtYearsBetween(be)} or more</strong> without a security incident?
              </Text>
              <Text css={{ ...s.small, fontSize: "$2", marginTop: 6 }}>
                If not, the multi-operator DV is likely worth its extra fee.{" "}
                {p.incidentRatePct > 0
                  ? `Your setting assumes a ${p.incidentRatePct}% chance of a security incident each year, which means you'd expect about one incident every ${fmtYearsBetween(p.incidentRatePct)} for each operator.`
                  : "You assumed no incidents at all."}
              </Text>
            </>
          ) : (
            <Text css={{ fontSize: "$3", lineHeight: 1.5, color: "$body", fontWeight: "$semibold" }}>
              With these settings the multi-operator DV pays for itself even if no key is ever compromised: the outages it
              rides through cover its extra fee.
            </Text>
          )}
        </Box>
      )}

      <Box css={{ borderTop: "1px solid $bg05", paddingTop: 18 }}>
        <Text as="h3" css={{ fontSize: "$2", fontWeight: "$semibold", color: "$body", margin: "0 0 14px" }}>
          If one operator&apos;s keys leak and the attacker slashes them all
        </Text>
        <AreaCompare
          big={{
            label: `${SETUP.s0.short}: slashed and exited`,
            sub: k > 1 ? `the ${fmtEth(p.stakeEth / k)} that operator ran` : "your whole stake",
            eth: worst,
          }}
          small={{
            label: `${SETUP.s1.short}: replace the operator`,
            sub: "reshare or consolidate, at your own pace",
            eth: dvRoute,
          }}
          ethUsd={p.ethUsd}
          maxSide={220}
        />

      </Box>

      <Text css={{ ...s.small, fontSize: "$2" }}>
        These are averages. Most years nothing happens and the solo-operator setup simply costs less.{" "}
        <a href="#ahead-heatmap" style={{ color: "var(--theme-brand)", fontWeight: 600, textDecoration: "underline" }}>
          See how the odds play out
        </a>
        .
      </Text>
    </Card>
  );
}
