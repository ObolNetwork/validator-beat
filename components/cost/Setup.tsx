import { Box, Text } from "@obolnetwork/obol-ui";
import { Card } from "@components/assessment/stitches";
import { fmtUsd } from "@lib/cost/format";
import { SETUP } from "@lib/cost/labels";
import {
  DEFAULT_PARAMS,
  FREQUENCY_PRESETS,
  SEVERITY_PRESETS,
  applyFrequency,
  applySeverity,
  type CostParams,
  type FrequencyId,
  type SeverityId,
} from "@lib/cost/params";
import { Chips, NumberField, Slider } from "./controls";
import { SeverityShape } from "./Odds";
import * as s from "./styles";

interface Props {
  params: CostParams;
  update: (patch: Partial<CostParams>) => void;
  replace: (fn: (p: CostParams) => CostParams) => void;
  probabilities: { lucky: number; partial: number; full: number };
}

const blockTitle = { ...s.h3, fontSize: 16, marginBottom: 2 };
const sub = { display: "flex", flexDirection: "column", gap: 18 } as const;

export function Setup({ params: p, update, replace, probabilities }: Props) {
  const advanced = p.view === "advanced";
  return (
    <Card as="section" aria-labelledby="setup" css={{ ...s.cardPad, display: "flex", flexDirection: "column", gap: 24 }}>
      <Box>
        <Text css={{ fontSize: "$1", fontWeight: "$bold", textTransform: "uppercase", letterSpacing: "0.06em", color: s.LINK }}>
          Step 1
        </Text>
        <Text as="h2" id="setup" css={{ ...s.h3, fontSize: 22, marginTop: 4 }}>
          Setup
        </Text>
      </Box>

      <NumberField
        label="Your stake"
        value={p.stakeEth}
        min={32}
        max={10_000_000}
        step={1000}
        suffix={`ETH · ${fmtUsd(p.stakeEth * p.ethUsd)}`}
        onChange={(v) => update({ stakeEth: v })}
      />

      <Box css={sub}>
        <Chips
          label="How often a key is compromised"
          value={p.frequency}
          options={(Object.keys(FREQUENCY_PRESETS) as FrequencyId[]).map((id) => ({ id, ...FREQUENCY_PRESETS[id] }))}
          onChange={(id) => replace((q) => applyFrequency(q, id))}
        />
        {advanced && (
          <>
            <Slider
              label="Incidents per operator per year"
              value={p.incidentRatePct}
              min={0}
              max={15}
              step={0.5}
              format={(v) => `${v}%`}
              defaultValue={DEFAULT_PARAMS.incidentRatePct}
              onChange={(v) => update({ incidentRatePct: v, frequency: "custom" })}
              hint="Base rate: about 8 public key or operator incidents across about 50 major operators since April 2023, so 4–5% a year. The data is thin: treat it as a starting point, not a measurement."
            />
            <Slider
              label="Uncertainty in that rate"
              value={p.rateUncertainty}
              min={0}
              max={1.5}
              step={0.1}
              format={(v) => (v === 0 ? "none" : `±${Math.round(v * 100)}%`)}
              defaultValue={DEFAULT_PARAMS.rateUncertainty}
              onChange={(v) => update({ rateUncertainty: v })}
              hint="Each simulated run draws its own incident rate around the one above (a Gamma distribution with this coefficient of variation). Affects the odds charts, not the averages."
            />
          </>
        )}
      </Box>

      <Box css={sub}>
        <Chips
          label="How bad an incident is"
          value={p.severity}
          options={(Object.keys(SEVERITY_PRESETS) as SeverityId[]).map((id) => ({ id, ...SEVERITY_PRESETS[id] }))}
          onChange={(id) => replace((q) => applySeverity(q, id))}
        />
        {advanced && (
          <>
            <Slider
              label="Incidents that end in slashing"
              value={p.pSlashPct}
              min={0}
              max={100}
              step={5}
              format={(v) => `${v}%`}
              defaultValue={DEFAULT_PARAMS.pSlashPct}
              onChange={(v) => update({ pSlashPct: v, severity: "custom" })}
              hint="The rest are caught in time: the operator exits everything and loses only rewards while the queues clear."
            />
            <SeverityShape params={p} update={update} probabilities={probabilities} />
          </>
        )}
      </Box>

      <Box>
        <Text css={{ ...s.small, fontSize: "$2", fontWeight: "$semibold", color: "$body", marginBottom: 12 }}>
          Operator fees, as a share of staking rewards
        </Text>
        <Box css={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 18, "@media (max-width: 480px)": { gridTemplateColumns: "minmax(0, 1fr)" } }}>
          <Slider
            label={SETUP.s0.short}
            value={p.fee0Pct}
            min={0}
            max={5}
            step={0.25}
            format={(v) => `${v}%`}
            defaultValue={DEFAULT_PARAMS.fee0Pct}
            onChange={(v) => update({ fee0Pct: v })}
            hint={`What you pay a ${SETUP.s0.name.toLowerCase()} operator. ${SETUP.s0.definition}`}
          />
          <Slider
            label={SETUP.s1.short}
            value={p.fee1Pct}
            min={0}
            max={5}
            step={0.25}
            format={(v) => `${v}%`}
            defaultValue={DEFAULT_PARAMS.fee1Pct}
            onChange={(v) => update({ fee1Pct: v })}
            hint={`What you pay for the multi-operator DV, including any DV software or coordination fee. ${SETUP.s1.definition}`}
          />
        </Box>
      </Box>

      {advanced && (
        <Box
          as="fieldset"
          css={{ border: "1px solid $bg05", borderRadius: 12, padding: "16px 18px 18px", margin: 0, minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}
        >
          <Text as="legend" css={{ ...blockTitle, padding: "0 6px" }}>
            General setup
          </Text>
          <Slider
            label="Operator's share of all staked ETH"
            value={p.operatorSharePct}
            min={0.5}
            max={33}
            step={0.5}
            format={(v) => `${v}%`}
            defaultValue={DEFAULT_PARAMS.operatorSharePct}
            onChange={(v) => update({ operatorSharePct: v })}
            hint="The operator's whole book, not just your slice. A compromise there affects all of it, and the correlation penalty and exit queues scale with it."
          />
          <Slider
            label="Split your stake across"
            value={p.operators}
            min={1}
            max={10}
            step={1}
            format={(v) => (v === 1 ? "1 operator" : `${v} operators`)}
            defaultValue={DEFAULT_PARAMS.operators}
            onChange={(v) => update({ operators: v })}
            hint="Each runs its share alone and holds the network share above. Splitting shrinks each loss but adds more chances of one. Run together as a multi-operator DV, the same operators remove the single point of failure instead."
          />
          <Slider
            label="Years"
            value={p.years}
            min={1}
            max={20}
            step={1}
            format={(v) => `${v}`}
            defaultValue={DEFAULT_PARAMS.years}
            onChange={(v) => update({ years: v })}
            hint="How long the main simulation runs: the fan chart and the stats under 'How the odds play out'. The averages in Results are per year, and the heatmap always shows 1 to 20 years with this setting outlined."
          />
        </Box>
      )}
    </Card>
  );
}
