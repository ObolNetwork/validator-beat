import { Box, Text } from "@obolnetwork/obol-ui";
import { Card, Eyebrow } from "@components/assessment/stitches";
import { fmtDays, fmtEth, fmtUsd, fmtYears } from "@lib/cost/format";
import { DEFAULT_PARAMS, type CostParams, type FocusEvent } from "@lib/cost/params";
import type { Economics, OutcomeCase } from "@lib/cost/model";
import { Chips, NumberField, Slider, Toggle } from "./controls";
import { LogBars } from "./LogBars";
import { Ref } from "./refs";
import * as s from "./styles";

const FOCUS: { id: FocusEvent; label: string; hint: string }[] = [
  { id: "lucky", label: "Caught in time", hint: "Nothing slashed, everything exits" },
  { id: "partial", label: "Partial slashing", hint: "Some keys slashed" },
  { id: "full", label: "Every key slashed", hint: "The attacker's best play" },
  { id: "outage", label: "Outage", hint: "Liveness, not safety" },
];

export function describeCase(p: CostParams): string {
  const op = `an operator running ${p.operatorSharePct}% of the network`;
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

interface HeroProps {
  params: CostParams;
  update: (patch: Partial<CostParams>) => void;
  focusCase: OutcomeCase;
  econ: Economics;
}

export function Hero({ params: p, update, focusCase: c, econ }: HeroProps) {
  const loss0 = c.stage0.breakdown.totalEth;
  const loss1 = c.id === "outage" ? c.stage1ExpectedEth : c.stage1.breakdown.totalEth;
  const daysOfRewards = loss0 / econ.netPerDay0Eth;
  const premiumYears = econ.premiumPerYearEth > 0 ? loss0 / econ.premiumPerYearEth : Infinity;
  const isSafety = c.id !== "outage";

  return (
    <Box as="header" css={{ ...s.section, paddingBottom: 56 }}>
      <Box css={s.wrap}>
        <Eyebrow as="p" css={{ margin: "0 0 14px", color: s.LINK }}>
          The cost of a single point of failure
        </Eyebrow>
        <Text as="h1" css={{ ...s.h1, maxWidth: 860 }}>
          What would one bad day cost your stake?
        </Text>
        <Text as="p" css={s.lede}>
          Stage 1 setups cost more to run. This page prices what they buy: on Stage 0, one leaked key can get
          your validators <strong>slashed</strong>. On Stage 1, the same leak means replacing one key-holder.
          Every number follows the consensus spec and today&apos;s queues, and every assumption can be changed.
        </Text>

        <Box
          css={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
            gap: 22,
            marginTop: 36,
            "@media (max-width: 900px)": { gridTemplateColumns: "minmax(0, 1fr)" },
          }}
        >
          <Card css={{ ...s.cardPad, display: "flex", flexDirection: "column", gap: 22 }}>
            <NumberField
              label="Your stake"
              value={p.stakeEth}
              min={32}
              max={10_000_000}
              step={1000}
              suffix={`ETH · ${fmtUsd(p.stakeEth * p.ethUsd)}`}
              onChange={(v) => update({ stakeEth: v })}
            />
            <Slider
              label="Operator's share of all staked ETH"
              value={p.operatorSharePct}
              min={0.5}
              max={33}
              step={0.5}
              format={(v) => `${v}%`}
              defaultValue={DEFAULT_PARAMS.operatorSharePct}
              onChange={(v) => update({ operatorSharePct: v })}
              hint="The operator's whole book, not just your slice. It drives the correlation penalty and the queues."
            />
            <Chips label="What happens" value={p.focus} options={FOCUS} onChange={(focus) => update({ focus })} />
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
            <Box css={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 18, "@media (max-width: 480px)": { gridTemplateColumns: "minmax(0, 1fr)" } }}>
              <Slider
                label="Stage 0 fee"
                value={p.fee0Pct}
                min={0}
                max={5}
                step={0.25}
                format={(v) => `${v}%`}
                defaultValue={DEFAULT_PARAMS.fee0Pct}
                onChange={(v) => update({ fee0Pct: v })}
                hint="Of staking rewards"
              />
              <Slider
                label="Stage 1 fee"
                value={p.fee1Pct}
                min={0}
                max={5}
                step={0.25}
                format={(v) => `${v}%`}
                defaultValue={DEFAULT_PARAMS.fee1Pct}
                onChange={(v) => update({ fee1Pct: v })}
                hint="Of staking rewards"
              />
            </Box>
          </Card>

          <Card
            as="section"
            aria-live="polite"
            css={{ ...s.cardPad, display: "flex", flexDirection: "column", gap: 20, borderColor: isSafety ? "var(--vb-red-b)" : "$bg05" }}
          >
            <Text css={{ fontSize: "$3", lineHeight: 1.55, color: "$textMiddle" }}>
              {describeCase(p)} Your {fmtEth(p.stakeEth)} would lose:
            </Text>
            <Box css={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 18, "@media (max-width: 520px)": { gridTemplateColumns: "minmax(0, 1fr)" } }}>
              <Box>
                <Text css={{ fontSize: "$1", fontWeight: "$bold", textTransform: "uppercase", letterSpacing: "0.05em", color: "$textMiddle" }}>
                  <Box as="span" css={s.swatch(s.S0)} />
                  On Stage 0
                </Text>
                <Text css={{ fontSize: 54, lineHeight: 1, fontWeight: "$bold", letterSpacing: "-0.035em", color: "$body", marginTop: 10, fontVariantNumeric: "tabular-nums", "@media (max-width: 760px)": { fontSize: 42 } }}>
                  {fmtEth(loss0, { unit: false })}
                  <Text as="span" css={{ display: "inline", fontSize: 20, marginLeft: 6, color: "$textMiddle" }}>
                    ETH
                  </Text>
                </Text>
                <Text css={{ ...s.statLabel, marginTop: 8 }}>
                  {fmtUsd(loss0 * p.ethUsd)} · {fmtDays(daysOfRewards)} of rewards
                </Text>
              </Box>
              <Box>
                <Text css={{ fontSize: "$1", fontWeight: "$bold", textTransform: "uppercase", letterSpacing: "0.05em", color: "$textMiddle" }}>
                  <Box as="span" css={s.swatch(s.S1)} />
                  On Stage 1
                </Text>
                <Text css={{ fontSize: 54, lineHeight: 1, fontWeight: "$bold", letterSpacing: "-0.035em", color: "$body", marginTop: 10, fontVariantNumeric: "tabular-nums", "@media (max-width: 760px)": { fontSize: 42 } }}>
                  {fmtEth(loss1, { unit: false })}
                  <Text as="span" css={{ display: "inline", fontSize: 20, marginLeft: 6, color: "$textMiddle" }}>
                    ETH
                  </Text>
                </Text>
                <Text css={{ ...s.statLabel, marginTop: 8 }}>
                  {isSafety
                    ? `No single key can sign. ${p.s1ResharePct}% reshare in place, the rest consolidate onto new keys.`
                    : `Expected: the cluster rides through ${p.s1LivenessCoverPct}% of outages.`}
                </Text>
              </Box>
            </Box>
            <LogBars
              rows={[
                { key: "s0", label: "Stage 0", value: loss0, color: s.S0 },
                { key: "s1", label: "Stage 1", value: loss1, color: s.S1 },
              ]}
            />
            <Box css={{ borderTop: "1px solid $bg05", paddingTop: 16 }}>
              <Text css={{ fontSize: "$3", lineHeight: 1.55, color: "$body" }}>
                Stage 1 costs <strong>{fmtEth(econ.premiumPerYearEth)} a year</strong> more ({p.fee0Pct}% → {p.fee1Pct}% of{" "}
                {fmtEth(econ.rewardsPerYearEth)} rewards).{" "}
                {econ.premiumPerYearEth > 0 ? (
                  <>
                    This one event costs <strong>{fmtYears(premiumYears)}</strong> of that premium.
                  </>
                ) : (
                  <>With no premium, Stage 1 is free insurance.</>
                )}
              </Text>
              {isSafety && p.s1ResidualPct > 0 && (
                <Text css={{ ...s.small, marginTop: 8 }}>
                  Stage 1 shown for the usual path. If the attacker also reaches a signing threshold ({p.s1ResidualPct}% of
                  incidents by default), Stage 1 loses the same as Stage 0; the odds below include that.
                </Text>
              )}
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
