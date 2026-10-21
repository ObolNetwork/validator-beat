import { Box, Text } from "@obolnetwork/obol-ui";
import { Card, Eyebrow } from "@components/assessment/stitches";
import { fmtDays, fmtEth, fmtYears } from "@lib/cost/format";
import { DEFAULT_PARAMS, type CostParams, type FocusEvent } from "@lib/cost/params";
import type { Economics, OutcomeCase } from "@lib/cost/model";
import { Chips, Slider, Toggle } from "./controls";
import { AreaCompare } from "./AreaCompare";
import { Ref } from "./refs";
import { SETUP } from "@lib/cost/labels";
import { Anchor } from "./Anchor";
import * as s from "./styles";

const FOCUS: { id: FocusEvent; label: string; hint: string }[] = [
  { id: "lucky", label: "Caught", hint: "Caught in time: nothing slashed, everything exits and re-stakes" },
  { id: "partial", label: "Partial", hint: "The attacker slashes some of the keys" },
  { id: "full", label: "All slashed", hint: "The attacker slashes every key before it exits: their best play" },
  { id: "outage", label: "Outage", hint: "Offline, not slashed" },
];

export function describeCase(p: CostParams): string {
  const k = Math.max(1, Math.round(p.operators));
  const op = k > 1 ? `one of your ${k} operators (each runs ${p.operatorSharePct}% of the network)` : `an operator running ${p.operatorSharePct}% of the network`;
  switch (p.focus) {
    case "lucky":
      return `A key compromise at ${op}, caught before anything is slashed. ${p.operatorWide ? "The whole operator exits and re-stakes." : "Your validators exit and re-stake."}`;
    case "partial":
      return `A key compromise at ${op}, where the attacker slashes ${p.partialPct}% of its keys before they exit.`;
    case "full":
      return `A key compromise at ${op}, where the attacker slashes every key before it exits.`;
    case "outage":
      return `A ${p.outageHours}-hour outage at ${op}, with all of its validators offline together.`;
  }
}

interface IncidentProps {
  params: CostParams;
  update: (patch: Partial<CostParams>) => void;
  focusCase: OutcomeCase;
  econ: Economics;
}

export function Incident({ params: p, update, focusCase: c, econ }: IncidentProps) {
  const loss0 = c.stage0.breakdown.totalEth;
  const loss1 = c.id === "outage" ? c.stage1ExpectedEth : c.stage1.breakdown.totalEth;
  const daysOfRewards = loss0 / econ.netPerDay0Eth;
  const premiumYears = econ.premiumPerYearEth > 0 ? loss0 / econ.premiumPerYearEth : Infinity;
  const isSafety = c.id !== "outage";

  return (
    <Box as="section" aria-labelledby="incident" css={{ ...s.section, ...s.band }}>
      <Box css={s.wrap}>
        <Eyebrow as="p" css={{ margin: "0 0 14px", color: s.LINK }}>
          One incident, in detail
        </Eyebrow>
        <Anchor id="incident" css={s.h2}>
          What one incident costs each setup
        </Anchor>
        <Text as="p" css={s.prose}>
          Pick how a key compromise at one of your operators ends, or an outage, and compare what each setup loses. The
          squares are drawn to scale, so a loss a thousand times smaller looks a thousand times smaller.
        </Text>
        <Box
          css={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: 16,
            marginTop: 36,
            "@media (max-width: 900px)": { gridTemplateColumns: "minmax(0, 1fr)" },
          }}
        >
          <Card css={{ ...s.cardPad, display: "flex", flexDirection: "column", gap: 18, "& > *": { maxWidth: 560 } }}>
            <Chips label="What happens" value={p.focus} options={FOCUS} onChange={(focus) => update({ focus })} css={{ maxWidth: 560 }} />
            {p.focus === "partial" && (
              <Slider
                label="Share of the operator's keys slashed"
                value={p.partialPct}
                min={5}
                max={95}
                step={5}
                format={(v) => `${v}%`}
                defaultValue={DEFAULT_PARAMS.partialPct}
                onChange={(v) => update({ partialPct: v })}
              />
            )}
            {p.focus === "outage" && (
              <>
                <Slider
                  label="Outage length"
                  value={p.outageHours}
                  min={1}
                  max={72}
                  step={1}
                  format={(v) => `${v} h`}
                  defaultValue={DEFAULT_PARAMS.outageHours}
                  onChange={(v) => update({ outageHours: v })}
                />
                <Toggle
                  label="Apply EIP-7716 (opt in)"
                  checked={p.eip7716}
                  onChange={(eip7716) => update({ eip7716 })}
                  hint={
                    <>
                      Draft proposal for Hegotá: scales the target penalty with how much stake is offline together
                      <Ref k="eip7716" />.
                    </>
                  }
                />
              </>
            )}
          </Card>

          <Card
            as="section"
            aria-live="polite"
            css={{ ...s.cardPad, display: "flex", flexDirection: "column", gap: 20, borderColor: isSafety ? "var(--vb-red-b)" : "$bg05" }}
          >
            <Text css={{ fontSize: "$3", lineHeight: 1.55, color: "$textMiddle" }}>
              {describeCase(p)} What each setup would lose:
            </Text>
            <AreaCompare
              big={{
                label: !isSafety
                  ? `${SETUP.s0.short}: offline`
                  : c.slashedFraction > 0
                    ? `${SETUP.s0.short}: slashed and exited`
                    : `${SETUP.s0.short}: emergency exit`,
                sub: `${SETUP.s0.stage} · ${fmtDays(daysOfRewards)} of rewards`,
                eth: loss0,
              }}
              small={{
                label: isSafety ? `${SETUP.s1.short}: replace the operator` : `${SETUP.s1.short}: rides through`,
                sub: isSafety
                  ? `${SETUP.s1.stage} · reshare or consolidate at your own pace`
                  : `${SETUP.s1.stage} · expected: avoids ${p.s1LivenessCoverPct}% of the loss, since one operator down can't stop the cluster`,
                eth: loss1,
              }}
              ethUsd={p.ethUsd}
            />
            <Box css={{ borderTop: "1px solid $bg05", paddingTop: 16 }}>
              <Text css={{ fontSize: "$3", lineHeight: 1.55, color: "$body" }}>
                The multi-operator DV may cost <strong>{fmtEth(econ.premiumPerYearEth)} a year</strong> more up front ({p.fee0Pct}% → {p.fee1Pct}% of{" "}
                {fmtEth(econ.rewardsPerYearEth)} rewards).{" "}
                {econ.premiumPerYearEth > 0 ? (
                  <>
                    On the solo-operator setup, this one event costs as much as <strong>{fmtYears(premiumYears)}</strong> of
                    that extra fee.
                  </>
                ) : (
                  <>With no extra fee, the multi-operator DV is free insurance.</>
                )}
              </Text>
              {isSafety && p.s1ResidualPct > 0 && (
                <Text css={{ ...s.small, marginTop: 8 }}>
                  DV shown for the usual path. If the attacker also reaches a signing threshold ({p.s1ResidualPct}% of
                  incidents by default), the multi-operator DV loses as much as the solo-operator one; the averages include that.
                </Text>
              )}
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
