import { Box, Text } from "@obolnetwork/obol-ui";
import { useMemo } from "react";
import { Card, Eyebrow } from "@components/assessment/stitches";
import { fmtCompact, fmtEth } from "@lib/cost/format";
import { QUEUE_HISTORY, QUEUE_HISTORY_SOURCE, SNAPSHOT, type QueueDay } from "@lib/cost/network";
import { DEFAULT_PARAMS, applyQueuePreset } from "@lib/cost/params";
import { safetyCase, stage1Compromise } from "@lib/cost/model";
import { simulate } from "@lib/cost/montecarlo";
import { SPEC_REFS, SPEC_VERSION } from "@lib/cost/protocol";
import { FORMULAS } from "@lib/cost/methodology";
import { TableView, srOnly } from "./controls";
import { Ref } from "./refs";
import { useWidth } from "./useWidth";
import { Anchor } from "./Anchor";
import * as s from "./styles";

function Spark({ days, field, label }: { days: QueueDay[]; field: "entryQueueEth" | "exitQueueEth"; label: string }) {
  const [ref, W] = useWidth<HTMLDivElement>(320);
  const H = 70;
  const vals = days.map((d) => d[field]);
  const max = Math.max(...vals, 1);
  const d = vals.map((v, i) => `${i ? "L" : "M"}${((i / (vals.length - 1)) * W).toFixed(1)},${(H - (v / max) * (H - 6)).toFixed(1)}`).join("");
  const lastV = vals[vals.length - 1];
  return (
    <Box>
      <Box css={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text css={{ fontSize: "$2", fontWeight: "$semibold", color: "$body" }}>{label}</Text>
        <Text css={{ fontSize: "$2", fontWeight: "$bold", color: "$body" }}>{fmtEth(lastV)}</Text>
      </Box>
      <Box ref={ref}>
      <svg width={W} height={H + 16} role="img" aria-label={`${label}, last 90 days, max ${fmtEth(max)}, now ${fmtEth(lastV)}`} style={{ display: "block", marginTop: 6, overflow: "visible" }}>
        <line x1={0} x2={W} y1={H} y2={H} stroke={s.GRID} />
        <line x1={0} x2={W} y1={6} y2={6} stroke={s.GRID} />
        <path d={`${d}L${W},${H}L0,${H}Z`} fill={s.INK_2} opacity={0.1} />
        <path d={d} fill="none" stroke={s.INK_2} strokeWidth={2} strokeLinejoin="round" />
        <circle cx={W} cy={H - (lastV / max) * (H - 6)} r={4} fill={s.INK_2} stroke={s.SURFACE} strokeWidth={2} />
        <text x={0} y={H + 13} fontSize={11} fill={s.INK_2}>
          {days[0].date}
        </text>
        <text x={W} y={H + 13} fontSize={11} fill={s.INK_2} textAnchor="end">
          {days[days.length - 1].date}
        </text>
        <text x={4} y={18} fontSize={11} fill={s.INK_2}>
          {fmtCompact(max)}
        </text>
      </svg>
      </Box>
    </Box>
  );
}


export function HowItWorks() {
  const recon = useMemo(() => {
    const note = { ...applyQueuePreset(DEFAULT_PARAMS, "avg90"), aprPct: 2.61 };
    const own = { ...note, operatorWide: false };
    const mc = simulate(
      { ...note, fee0Pct: 0, fee1Pct: 3.25, incidentRatePct: 4, rateUncertainty: 0, pSlashPct: 50, betaA: 1, betaB: 1, outagesPerYear: 0, runs: 4000 },
    );
    const y = mc.years[9];
    return [
      { label: "Precautionary exit, own stake only", note: "~582 ETH", got: fmtEth(safetyCase(own, 0).breakdown.totalEth), why: "Within 10%: same mechanics, real sweep and deposit queue." },
      { label: "Precautionary exit, whole 10% operator", note: "~1,099 ETH", got: fmtEth(safetyCase(note, 0).breakdown.totalEth), why: "Lower: the deposit queue drains while the book is still exiting, so re-entry waits less than a flat average implies." },
      { label: "Slashed, own stake only", note: "~4,402 ETH", got: fmtEth(safetyCase(own, 1).breakdown.totalEth), why: "Lower: real flag penalties instead of 1.5× forgone rewards." },
      { label: "Attacker slashes 25% of the operator", note: "~5,137 ETH", got: fmtEth(safetyCase(note, 0.25).breakdown.totalEth), why: "Lower: see the correlation-window note below." },
      { label: "Attacker slashes 50%", note: "~16,674 ETH", got: fmtEth(safetyCase(note, 0.5).breakdown.totalEth), why: "" },
      { label: "Attacker slashes 100%", note: "~62,249 ETH", got: fmtEth(safetyCase(note, 1).breakdown.totalEth), why: "Validators deep in an ~80-day exit queue escape their own correlation penalty." },
      { label: "DV bad leaver (consolidation)", note: "~16 ETH", got: fmtEth(stage1Compromise(note).bad.breakdown.totalEth), why: "Higher: adds the 32 ETH seed deposits for new targets." },
      { label: "DV good leaver (reshare)", note: "<1 ETH", got: fmtEth(stage1Compromise(note).good.breakdown.totalEth), why: "" },
      { label: "Monte Carlo: solo runs ahead after 10 years", note: "81%", got: `${Math.round(y.pStage0Ahead * 100)}%`, why: "4%/yr, half slash 10–100% (uniform), 3.25% premium." },
    ];
  }, []);

  return (
    <Box as="section" css={{ ...s.section, ...s.band }} aria-labelledby="how-calculated">
      <Box css={s.wrap}>
        <Eyebrow as="p" css={{ margin: "0 0 14px", color: s.LINK }}>
          How it&apos;s calculated
        </Eyebrow>
        <Anchor id="how-calculated" css={s.h2}>
          The protocol&apos;s own rules, epoch by epoch
        </Anchor>
        <Text as="p" css={s.prose}>
          The model follows {SPEC_VERSION}. It works in epochs and ETH, models the operator&apos;s whole book as it queues to
          exit and re-enter, and averages over your validators&apos; places in that queue. The same pure, unit-tested functions
          drive every number here (<code>lib/cost/</code> in the{" "}
          <a href="https://github.com/ObolNetwork/validator-beat" target="_blank" rel="noopener noreferrer">
            repository
          </a>
          ).
        </Text>

        <Anchor as="h3" id="queues" css={{ ...s.h3, marginTop: 36 }}>
          The queues, last 90 days
        </Anchor>
        <Box css={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16, marginTop: 16, "@media (max-width: 760px)": { gridTemplateColumns: "minmax(0, 1fr)" } }}>
          <Card css={{ padding: 22 }}>
            <Spark days={QUEUE_HISTORY} field="entryQueueEth" label="Entry queue, last 90 days" />
          </Card>
          <Card css={{ padding: 22 }}>
            <Spark days={QUEUE_HISTORY} field="exitQueueEth" label="Exit queue, last 90 days" />
          </Card>
        </Box>
        <Text css={{ ...s.small, marginTop: 10, maxWidth: 900 }}>
          Source: {QUEUE_HISTORY_SOURCE}
          <Ref k="queues" />; head state from a public beacon node, {SNAPSHOT.asOf}. Since Electra,
          validatorqueue&apos;s exit queue also counts consolidation sources, which drain on their own churn, so its implied
          exit wait overstates the wait for a new exit. Today it implies ~14 days; the head state shows new exits clearing in ~6.5.
        </Text>

        <Anchor as="h3" id="formulas" css={{ ...s.h3, marginTop: 40 }}>
          The formulas
        </Anchor>
        <Box as="dl" css={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, marginTop: 16, "@media (max-width: 900px)": { gridTemplateColumns: "minmax(0, 1fr)" } }}>
          {FORMULAS.map((f) => (
            <Card key={f.title} css={{ padding: 20 }}>
              <Text as="dt" css={{ ...s.h3, fontSize: 15 }}>
                {f.title}
              </Text>
              <Text as="dd" css={{ ...s.small, margin: "8px 0 0", fontSize: "$2" }}>
                {f.body}
                <Box as="span" css={{ display: "block", marginTop: 10 }}>
                  <Box as="a" href={SPEC_REFS[f.ref]} target="_blank" rel="noopener noreferrer" css={{ fontSize: "$1", fontWeight: "$semibold", color: s.LINK, fontFamily: "monospace" }}>
                    {f.refLabel} ↗<Box as="span" css={srOnly}> (spec, opens in a new tab)</Box>
                  </Box>
                </Box>
              </Text>
            </Card>
          ))}
        </Box>

        <Anchor as="h3" id="correlation-window" css={{ ...s.h3, marginTop: 44 }}>
          A spec quirk worth knowing
        </Anchor>
        <Text as="p" css={s.prose}>
          The correlation penalty is charged when a slashed validator is halfway to withdrawable, and it only counts slashings
          still in the 8,192-epoch vector at that moment. When an operator&apos;s whole book is slashed together and has to
          drain through 256 ETH per epoch, validators more than ~53 days back in the queue become withdrawable so late that
          their own slashing has rolled out of the window. They pay the initial penalty and ~2–3 months of missed duties, but
          not the 3× correlation penalty<Ref k="slashings" />. This is current behaviour (unchanged in Gloas). A simpler model that charges every
          slashed validator the full penalty overstates this worst case by about half.
        </Text>

        <Anchor as="h3" id="simplified-model" css={{ ...s.h3, marginTop: 36 }}>
          How this compares to a simpler model
        </Anchor>
        <Text as="p" css={s.prose}>
          The usual back-of-envelope version of this calculation uses flat averages for the queues and the sweep, prices
          downtime at 1.5× forgone rewards and charges every slashed validator the full correlation penalty. With the same
          inputs (200K ETH, a 10% operator, 2.61% APR, 90-day average queues), here is how far apart the two land, and why.
        </Text>
        <TableView summary="Show the comparison" label="Comparison with a simpler model, table">
          <table>
            <thead>
              <tr>
                <th>Case</th>
                <th>Simplified model</th>
                <th>This model</th>
                <th style={{ textAlign: "left" }}>Why it differs</th>
              </tr>
            </thead>
            <tbody>
              {recon.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td>{r.note}</td>
                  <td>{r.got}</td>
                  <td style={{ textAlign: "left", whiteSpace: "normal" }}>{r.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableView>

        <Anchor as="h3" id="limits" css={{ ...s.h3, marginTop: 36 }}>
          What this does not model yet
        </Anchor>
        <Box as="ul" css={{ ...s.prose, paddingLeft: 20, "& li": { marginTop: 6 } }}>
          <li>
            <strong>Client bugs and wrong-fork lockouts, which make these figures an understatement.</strong> If ⅔ or more of
            stake justifies an invalid chain, as on Holešky in February 2025<Ref k="holesky" />, trapped validators lose
            most of their balance to the inactivity leak<Ref k="lockout" />. That risk is larger than anything modelled here
            and isn&apos;t in the totals or the odds. <a href="#wrong-fork-lockout">More above</a>.
          </li>
          <li>
            <strong>Correlation between operators.</strong> Incidents at different operators are independent here. A shared
            dependency (a shared cloud, client or signer) would make splitting even less effective, since one
            failure could hit several of your operators at once.
          </li>
          <li>
            <strong>Feedback on the network.</strong> Total stake, base rewards and APR stay fixed while an operator exits.
          </li>
          <li>
            <strong>Future forks.</strong> Glamsterdam (Gloas) is expected late 2026 and leaves churn and slashing as modelled.
            EIP-7716 is a draft and is opt-in here.
          </li>
          <li>
            <strong>Incident rates.</strong> The base rate rests on a handful of public incidents. It is a prior to argue with,
            not a measurement.
          </li>
        </Box>
        <Text css={{ ...s.small, marginTop: 24 }}>
          Changelog · {SNAPSHOT.asOf}: first version. Network snapshot at epoch {SNAPSHOT.headEpoch.toLocaleString("en-US")};
          spec pinned to Fulu.
        </Text>
      </Box>
    </Box>
  );
}
