import { Box, Text } from "@obolnetwork/obol-ui";
import { useEffect, useState, type ReactNode } from "react";
import { Card, Eyebrow } from "@components/assessment/stitches";
import { fmtDays, fmtEth, fmtUsd } from "@lib/cost/format";
import {
  DEFAULT_NETWORK,
  QUEUE_PRESETS,
  SNAPSHOT,
  activationExitChurnEth,
  sweepWaitDays,
} from "@lib/cost/network";
import { DEFAULT_PARAMS, applyQueuePreset, networkFromParams, type CostParams } from "@lib/cost/params";
import { EPOCHS_PER_DAY } from "@lib/cost/protocol";
import type { MonteCarloResult } from "@lib/cost/montecarlo";
import type { OutcomeCase } from "@lib/cost/model";
import { Chips, NumberField, Slider, Toggle } from "./controls";
import { COMPONENTS } from "./Outcomes";
import { Anchor } from "./Anchor";
import * as s from "./styles";

interface Props {
  params: CostParams;
  update: (patch: Partial<CostParams>) => void;
  replace: (fn: (p: CostParams) => CostParams) => void;
  reset: (keys?: (keyof CostParams)[]) => void;
  cases: OutcomeCase[];
  mc: MonteCarloResult | null;
}

interface GroupProps {
  id: string;
  title: string;
  /** One line of current values, shown while collapsed. */
  summary: string;
  keys: (keyof CostParams)[];
  params: CostParams;
  open: boolean;
  onToggle: (open: boolean) => void;
  reset: (keys?: (keyof CostParams)[]) => void;
  children: ReactNode;
}

/** A collapsible group of assumptions. Closed by default so first-time readers see four lines, not 20 sliders. */
function Group({ id, title, summary, keys, params, open, onToggle, reset, children }: GroupProps) {
  const changed = keys.filter((k) => params[k] !== DEFAULT_PARAMS[k] && k !== "queue" && k !== "frequency" && k !== "severity").length;
  return (
    <Card
      as="details"
      id={id}
      open={open}
      onToggle={(e: React.SyntheticEvent<HTMLDetailsElement>) => {
        const isOpen = e.currentTarget.open;
        if (isOpen !== open) onToggle(isOpen);
      }}
      css={{
        padding: 0,
        "& > summary": { listStyle: "none" },
        "& > summary::-webkit-details-marker": { display: "none" },
        "&[open] .cost-chevron": { transform: "rotate(90deg)" },
      }}
    >
      <Box
        as="summary"
        css={{
          cursor: "pointer",
          padding: "18px 22px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          borderRadius: 14,
          "&:hover": { backgroundColor: "$bg04" },
          "&:focus-visible": { outline: "2px solid var(--theme-brand)", outlineOffset: -2 },
        }}
      >
        <Box
          as="span"
          aria-hidden="true"
          className="cost-chevron"
          css={{ color: "$textMiddle", fontSize: 13, transition: "transform .15s", flexShrink: 0 }}
        >
          ▶
        </Box>
        <Box css={{ minWidth: 0, flex: 1 }}>
          <Box css={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <Text as="h3" css={{ ...s.h3, fontSize: 16 }}>
              {title}
            </Text>
            {changed > 0 && (
              <Text
                as="span"
                css={{
                  fontSize: 11,
                  fontWeight: "$bold",
                  color: s.LINK,
                  border: "1px solid var(--theme-brand)",
                  borderRadius: 999,
                  padding: "1px 8px",
                }}
              >
                {changed} changed
              </Text>
            )}
          </Box>
          <Text css={{ ...s.small, marginTop: 3 }}>{summary}</Text>
        </Box>
      </Box>
      <Box css={{ padding: "4px 22px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
        {changed > 0 && (
          <Box css={{ display: "flex", justifyContent: "flex-end" }}>
            <Box as="button" type="button" onClick={() => reset(keys)} css={linkButton}>
              Reset this group
            </Box>
          </Box>
        )}
        {children}
      </Box>
    </Card>
  );
}

const linkButton = {
  all: "unset",
  cursor: "pointer",
  fontSize: "$1",
  fontWeight: "$semibold",
  color: s.LINK,
  "&:hover": { textDecoration: "underline" },
  "&:focus-visible": { outline: "2px solid var(--theme-brand)", outlineOffset: 2, borderRadius: 3 },
} as const;

const actionButton = {
  all: "unset",
  cursor: "pointer",
  fontSize: "$2",
  fontWeight: "$semibold",
  color: "$body",
  border: "1px solid $bg05",
  backgroundColor: "$bg02",
  borderRadius: "$3",
  padding: "9px 16px",
  "&:hover": { backgroundColor: "$bg04" },
  "&:focus-visible": { outline: "2px solid var(--theme-brand)", outlineOffset: 2 },
} as const;

function csv(rows: (string | number)[][]): string {
  return rows.map((r) => r.map((c) => (typeof c === "string" && c.includes(",") ? `"${c}"` : c)).join(",")).join("\n");
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const GROUPS = {
  network: ["queue", "exitQueueEth", "depositQueueEth", "depositInflowEthPerEpoch", "aprPct", "ethUsd"],
  event: ["operatorWide", "slashSpreadDays", "redepositDelayDays"],
  stage1: ["reshareEpochs", "s1ResharePct", "s1ResidualPct", "s1LivenessCoverPct"],
  sim: ["outagesPerYear", "outageMedianHours", "eip7716", "runs", "seed"],
} satisfies Record<string, (keyof CostParams)[]>;
type GroupId = keyof typeof GROUPS;
const GROUP_IDS: Record<GroupId, string> = {
  network: "assumptions-network",
  event: "assumptions-event",
  stage1: "assumptions-stage-1",
  sim: "assumptions-outages",
};

export function Assumptions({ params: p, update, replace, reset, cases, mc }: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState<Record<GroupId, boolean>>({ network: false, event: false, stage1: false, sim: false });
  const allOpen = Object.values(open).every(Boolean);
  const setGroup = (g: GroupId) => (v: boolean) => setOpen((o) => ({ ...o, [g]: v }));

  // A link to a group (#assumptions-stage-1) opens it.
  useEffect(() => {
    const openFromHash = () => {
      const g = (Object.keys(GROUP_IDS) as GroupId[]).find((k) => `#${GROUP_IDS[k]}` === window.location.hash);
      if (g) setOpen((o) => ({ ...o, [g]: true }));
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);
  const n = networkFromParams(p);
  const churn = activationExitChurnEth(n.totalActiveEth);
  const days = (eth: number) => fmtDays(eth / churn / EPOCHS_PER_DAY);

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ["Validator Beat cost of failure", `snapshot ${SNAPSHOT.asOf}`, window.location.href],
      [],
      ["Outcome", ...COMPONENTS.map((c) => c.label), "Stage 0 total ETH", "Stage 1 ETH", "Stage 1 expected ETH", "Days not earning"],
      ...cases.map((c) => [
        c.label,
        ...COMPONENTS.map((k) => c.stage0.breakdown[k.key].toFixed(4)),
        c.stage0.breakdown.totalEth.toFixed(4),
        c.stage1.breakdown.totalEth.toFixed(4),
        c.stage1ExpectedEth.toFixed(4),
        c.stage0.unpaidDays.toFixed(2),
      ]),
    ];
    if (mc) {
      rows.push([], ["Year", "P(Stage 0 ahead)", "Mean ETH", "P5", "P25", "Median", "P75", "P95"]);
      mc.years.forEach((y) => rows.push([y.year, y.pStage0Ahead, y.mean, y.p5, y.p25, y.p50, y.p75, y.p95].map((v) => (typeof v === "number" ? +v.toFixed(4) : v))));
    }
    rows.push([], ["Parameter", "Value"], ...Object.entries(p).map(([k, v]) => [k, String(v)]));
    download("validator-beat-cost-of-failure.csv", csv(rows));
  };

  return (
    <Box as="section" css={s.section} aria-labelledby="assumptions">
      <Box css={s.wrap}>
        <Eyebrow as="p" css={{ margin: "0 0 14px", color: s.LINK }}>
          Adjust assumptions
        </Eyebrow>
        <Box css={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
          <Anchor id="assumptions" css={s.h2}>
            Every number, yours to change
          </Anchor>
          <Box css={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Box
              as="button"
              type="button"
              css={actionButton}
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href).then(() => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1600);
                });
              }}
            >
              {copied ? "Link copied" : "Copy link to this view"}
            </Box>
            <Box as="button" type="button" css={actionButton} onClick={exportCsv}>
              Download CSV
            </Box>
            <Box
              as="button"
              type="button"
              css={actionButton}
              aria-expanded={allOpen}
              onClick={() => setOpen({ network: !allOpen, event: !allOpen, stage1: !allOpen, sim: !allOpen })}
            >
              {allOpen ? "Collapse all" : "Expand all"}
            </Box>
            <Box as="button" type="button" css={actionButton} onClick={() => reset()}>
              Reset everything
            </Box>
          </Box>
        </Box>
        <Text as="p" css={s.prose}>
          Defaults come from a mainnet snapshot taken on <strong>{SNAPSHOT.asOf}</strong> ({SNAPSHOT.fork}, epoch{" "}
          {SNAPSHOT.headEpoch.toLocaleString("en-US")}) and the 90-day queue history. The link in your address bar carries
          every change. Open a group to adjust it.
        </Text>

        <Box
          css={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 16,
            marginTop: 28,
            alignItems: "start",
            "@media (max-width: 860px)": { gridTemplateColumns: "minmax(0, 1fr)" },
          }}
        >
          <Group
            id={GROUP_IDS.network}
            title="Network and queues"
            summary={`${QUEUE_PRESETS.find((q) => q.id === p.queue)?.label ?? "Custom queues"} · ${days(p.exitQueueEth)} to exit, ${days(p.depositQueueEth)} to enter · ${p.aprPct.toFixed(2)}% APR · ${fmtUsd(p.ethUsd)}`}
            keys={GROUPS.network}
            params={p}
            open={open.network}
            onToggle={setGroup("network")}
            reset={reset}
          >
            <Chips
              label="Queues"
              value={p.queue}
              options={QUEUE_PRESETS.map((q) => ({ id: q.id, label: q.label, hint: q.hint }))}
              onChange={(id) => replace((q) => applyQueuePreset(q, id))}
            />
            <Slider
              label="Exit queue ahead of you"
              value={p.exitQueueEth}
              min={0}
              max={5_000_000}
              step={10_000}
              format={(v) => `${fmtEth(v)} · ${days(v)}`}
              defaultValue={DEFAULT_PARAMS.exitQueueEth}
              onChange={(v) => update({ exitQueueEth: v, queue: "custom" })}
              hint={`Head state: the latest exit epoch already assigned is ${SNAPSHOT.newExitWaitEpochs.toLocaleString("en-US")} epochs out. Exits drain at ${churn} ETH/epoch.`}
            />
            <Slider
              label="Entry queue (pending deposits)"
              value={p.depositQueueEth}
              min={0}
              max={4_000_000}
              step={10_000}
              format={(v) => `${fmtEth(v)} · ${days(v)}`}
              defaultValue={DEFAULT_PARAMS.depositQueueEth}
              onChange={(v) => update({ depositQueueEth: v, queue: "custom" })}
              hint={`pending_deposits at head: ${SNAPSHOT.pendingDepositCount.toLocaleString("en-US")} deposits, ${fmtEth(SNAPSHOT.pendingDepositsEth)}.`}
            />
            <Slider
              label="New competing deposits"
              value={p.depositInflowEthPerEpoch}
              min={0}
              max={400}
              step={1}
              format={(v) => `${v} ETH/epoch`}
              defaultValue={DEFAULT_PARAMS.depositInflowEthPerEpoch}
              onChange={(v) => update({ depositInflowEthPerEpoch: v })}
              hint="Implied by the last 90 days: the queue drained ~15K ETH a day against 57.6K of churn. Above 256, the queue grows."
            />
            <Slider
              label="Staking APR (CL + EL)"
              value={p.aprPct}
              min={1.5}
              max={4.5}
              step={0.05}
              format={(v) => `${v.toFixed(2)}%`}
              defaultValue={DEFAULT_PARAMS.aprPct}
              onChange={(v) => update({ aprPct: Math.round(v * 100) / 100 })}
              hint="validatorqueue.com reports 2.56% today; the 90-day average is 2.61%."
            />
            <NumberField
              label="ETH price"
              value={p.ethUsd}
              min={1}
              step={10}
              suffix="USD"
              onChange={(v) => update({ ethUsd: v })}
              hint={`DefiLlama, ${SNAPSHOT.asOf}: ${fmtUsd(SNAPSHOT.ethUsd)}.`}
            />
            <Text css={s.small}>
              Fixed from the snapshot: {fmtEth(DEFAULT_NETWORK.totalActiveEth)} active across{" "}
              {DEFAULT_NETWORK.activeValidators.toLocaleString("en-US")} validators; the withdrawal sweep takes{" "}
              {fmtDays(sweepWaitDays(n) * 2)} per cycle, {fmtDays(sweepWaitDays(n))} on average.
            </Text>
          </Group>

          <Group
            id={GROUP_IDS.event}
            title="How the event plays out"
            summary={`${p.operatorWide ? "Whole operator exits" : "Only your validators exit"} · slashed ${p.slashSpreadDays === 0 ? "all at once" : `over ${p.slashSpreadDays} days`} · ${p.redepositDelayDays === 0 ? "re-deposit straight away" : `${p.redepositDelayDays}-day re-deposit delay`}`}
            keys={GROUPS.event}
            params={p}
            open={open.event}
            onToggle={setGroup("event")}
            reset={reset}
          >
            <Toggle
              label="The whole operator exits"
              checked={p.operatorWide}
              onChange={(operatorWide) => update({ operatorWide })}
              hint="A compromise at the operator means every key it runs is suspect, so its whole book queues to exit. Off: only your validators are affected."
            />
            <Slider
              label="Attacker spreads slashings over"
              value={p.slashSpreadDays}
              min={0}
              max={90}
              step={1}
              format={(v) => (v === 0 ? "all at once" : `${v} days`)}
              defaultValue={DEFAULT_PARAMS.slashSpreadDays}
              onChange={(v) => update({ slashSpreadDays: v })}
              hint="Keys stay slashable until withdrawable, so the attacker's window is the exit queue. All at once maximises the correlation penalty."
            />
            <Slider
              label="Your delay before re-depositing"
              value={p.redepositDelayDays}
              min={0}
              max={14}
              step={0.5}
              format={(v) => (v === 0 ? "none" : `${v} days`)}
              defaultValue={DEFAULT_PARAMS.redepositDelayDays}
              onChange={(v) => update({ redepositDelayDays: v })}
              hint="New keys, new withdrawal checks, internal approvals."
            />
          </Group>

          <Group
            id={GROUP_IDS.stage1}
            title="Stage 1"
            summary={`${p.reshareEpochs}-epoch reshare · ${p.s1ResharePct}% reshare, ${100 - p.s1ResharePct}% consolidate · ${p.s1ResidualPct}% still reach a threshold · rides through ${p.s1LivenessCoverPct}% of outages`}
            keys={GROUPS.stage1}
            params={p}
            open={open.stage1}
            onToggle={setGroup("stage1")}
            reset={reset}
          >
            <Slider
              label="Reshare downtime (good leaver)"
              value={p.reshareEpochs}
              min={1}
              max={30}
              step={1}
              format={(v) => `${v} epochs · ${fmtDays(v / EPOCHS_PER_DAY)}`}
              defaultValue={DEFAULT_PARAMS.reshareEpochs}
              onChange={(v) => update({ reshareEpochs: v })}
              hint="The remaining key-holders reshare or re-run the DKG in place. 5 epochs by default; 3 is achievable."
            />
            <Slider
              label="Compromises fixed by a reshare"
              value={p.s1ResharePct}
              min={0}
              max={100}
              step={5}
              format={(v) => `${v}%`}
              defaultValue={DEFAULT_PARAMS.s1ResharePct}
              onChange={(v) => update({ s1ResharePct: v })}
              hint="The rest are bad leavers: consolidate onto fresh keys (EIP-7251), losing ~27 hours of rewards in the withdrawability delay."
            />
            <Slider
              label="Incidents that still reach a signing threshold"
              value={p.s1ResidualPct}
              min={0}
              max={10}
              step={0.5}
              format={(v) => `${v}%`}
              defaultValue={DEFAULT_PARAMS.s1ResidualPct}
              onChange={(v) => update({ s1ResidualPct: v })}
              hint="Stage 1 means no single failure can slash you. Two at once still can."
            />
            <Slider
              label="Outages a Stage 1 cluster rides through"
              value={p.s1LivenessCoverPct}
              min={0}
              max={100}
              step={5}
              format={(v) => `${v}%`}
              defaultValue={DEFAULT_PARAMS.s1LivenessCoverPct}
              onChange={(v) => update({ s1LivenessCoverPct: v })}
              hint="Most outages hit one node or one provider and leave a threshold online. Stage 2 is what removes the rest."
            />
          </Group>

          <Group
            id={GROUP_IDS.sim}
            title="Outages and simulation"
            summary={`${p.outagesPerYear} outage${p.outagesPerYear === 1 ? "" : "s"} a year, ${p.outageMedianHours} h median · EIP-7716 ${p.eip7716 ? "on" : "off"} · ${p.runs.toLocaleString("en-US")} runs, seed ${p.seed}`}
            keys={GROUPS.sim}
            params={p}
            open={open.sim}
            onToggle={setGroup("sim")}
            reset={reset}
          >
            <Slider
              label="Outages per operator per year"
              value={p.outagesPerYear}
              min={0}
              max={6}
              step={0.5}
              format={(v) => `${v}`}
              defaultValue={DEFAULT_PARAMS.outagesPerYear}
              onChange={(v) => update({ outagesPerYear: v })}
            />
            <Slider
              label="Typical outage length"
              value={p.outageMedianHours}
              min={0.5}
              max={48}
              step={0.5}
              format={(v) => `${v} h median`}
              defaultValue={DEFAULT_PARAMS.outageMedianHours}
              onChange={(v) => update({ outageMedianHours: v })}
              hint="Log-normal, so some outages run much longer."
            />
            <Toggle
              label="EIP-7716 correlated downtime penalties (opt in)"
              checked={p.eip7716}
              onChange={(eip7716) => update({ eip7716 })}
              hint={
                <>
                  Draft, proposed for Hegotá. Makes correlated outages cost more. The{" "}
                  <a
                    href="https://validatordowntime.obol.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--theme-cost-link)", textDecoration: "underline", fontWeight: 600 }}
                  >
                    downtime calculator
                  </a>{" "}
                  goes deeper.
                </>
              }
            />
            <Slider
              label="Simulated runs"
              value={p.runs}
              min={1000}
              max={20000}
              step={1000}
              format={(v) => v.toLocaleString("en-US")}
              defaultValue={DEFAULT_PARAMS.runs}
              onChange={(v) => update({ runs: v })}
            />
            <NumberField
              label="Random seed"
              value={p.seed}
              min={0}
              step={1}
              onChange={(v) => update({ seed: Math.round(v) })}
              hint="The same seed and settings reproduce the same runs."
            />
          </Group>
        </Box>
      </Box>
    </Box>
  );
}
