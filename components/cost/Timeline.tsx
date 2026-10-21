import { Box, Text } from "@obolnetwork/obol-ui";
import { useState } from "react";
import { Card, Eyebrow } from "@components/assessment/stitches";
import { fmtCompact, fmtDays, fmtEth } from "@lib/cost/format";
import type { EventResult, TracePoint } from "@lib/cost/events";
import type { OutcomeCase } from "@lib/cost/model";
import type { CostParams } from "@lib/cost/params";
import { describeCase } from "./Incident";
import { TableView } from "./controls";
import { useWidth } from "./useWidth";
import { niceTicks } from "./ticks";
import { Anchor } from "./Anchor";
import * as s from "./styles";

function at(trace: TracePoint[], d: number): number {
  if (d <= trace[0].days) return trace[0].lossEth;
  for (let i = 1; i < trace.length; i++) {
    if (trace[i].days >= d) {
      const a = trace[i - 1];
      const b = trace[i];
      const t = (d - a.days) / Math.max(b.days - a.days, 1e-12);
      return a.lossEth + t * (b.lossEth - a.lossEth);
    }
  }
  return trace[trace.length - 1].lossEth;
}

const PHASE_ORDER = ["exitQueue", "consolidation", "slashedLock", "withdrawDelay", "sweep", "entryQueue", "offline"] as const;

export function Timeline({ params: p, focusCase: c }: { params: CostParams; focusCase: OutcomeCase }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const s0 = c.stage0;
  const s1: EventResult = c.stage1;
  const horizon = Math.max(s0.trace[s0.trace.length - 1].days, 0.05);
  const hoursMode = horizon < 2;
  const yAxis = niceTicks(0, Math.max(s0.breakdown.totalEth, s1.breakdown.totalEth, 1e-6) * 1.02, 4);
  const yMax = yAxis.hi;

  const W = width;
  const m0 = { l: 56, r: 16 };
  const iw0 = W - m0.l - m0.r;
  // Stagger marker labels into rows when they would collide.
  const rowEnds: number[] = [];
  const markerRows = [...s0.markers]
    .sort((a, b) => a.days - b.days)
    .map((mk) => {
      const px = m0.l + (Math.min(mk.days, horizon) / horizon) * iw0;
      const w = mk.label.length * 6.4 + 10;
      let row = rowEnds.findIndex((end) => px - w / 2 > end);
      if (row === -1) row = rowEnds.length;
      rowEnds[row] = px + w / 2;
      return { ...mk, row };
    });
  const labelRows = Math.max(1, rowEnds.length);
  const m = { l: m0.l, r: m0.r, t: 12 + labelRows * 15, b: 30 };
  const H = 254 + m.t;
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const x = (d: number) => m.l + (Math.min(d, horizon) / horizon) * iw;
  const y = (v: number) => m.t + ih - (v / yMax) * ih;
  const path = (tr: TracePoint[]) =>
    tr
      .filter((t) => t.days <= horizon)
      .map((t, i) => `${i ? "L" : "M"}${x(t.days).toFixed(1)},${y(t.lossEth).toFixed(1)}`)
      .join("") + (tr[tr.length - 1].days < horizon ? `L${x(horizon)},${y(tr[tr.length - 1].lossEth)}` : "");

  const xTicks = Array.from({ length: 6 }, (_, i) => (horizon * i) / 5);
  const yTicks = yAxis.ticks;
  const fmtX = (d: number) => (hoursMode ? `${Math.round(d * 24)}h` : `${Math.round(d)}d`);
  const phases = [...s0.phases].sort((a, b) => PHASE_ORDER.indexOf(a.id) - PHASE_ORDER.indexOf(b.id));
  const hoverDay = hover;

  return (
    <Box as="section" css={s.section} aria-labelledby="timeline">
      <Box css={s.wrap}>
        <Eyebrow as="p" css={{ margin: "0 0 14px", color: s.LINK }}>
          One event, day by day
        </Eyebrow>
        <Anchor id="timeline" css={s.h2}>
          Where the ETH goes
        </Anchor>
        <Text as="p" css={s.prose}>
          {describeCase(p)} The line is your cumulative loss against a validator that kept earning.{" "}
          {c.id === "outage" ? (
            <>Nothing exits in an outage: the loss stops when the operator is back online.</>
          ) : (
            <>
              Exits drain at <strong>256 ETH per epoch</strong>, so the operator&apos;s whole book takes{" "}
              {fmtDays(s0.drainDays)} to leave, and the re-deposits then queue again on the way back in.
            </>
          )}
        </Text>

        <Card css={{ ...s.cardPad, marginTop: 28 }}>
          <Box css={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 6 }}>
            <Text css={s.small}>
              <Box as="span" css={s.swatch(s.S0)} />
              Solo operators: {fmtEth(s0.breakdown.totalEth)}
            </Text>
            <Text css={s.small}>
              <Box as="span" css={s.swatch(s.S1)} />
              DV: {fmtEth(s1.breakdown.totalEth)}
              {s1.breakdown.totalEth < yMax / 50 && " (flat at this scale)"}
            </Text>
          </Box>
          <Box ref={ref} css={{ position: "relative" }}>
            <svg
              width={W}
              height={H}
              role="img"
              aria-label={`Cumulative loss over ${fmtDays(horizon)}: solo operators reach ${fmtEth(s0.breakdown.totalEth)}, DV ${fmtEth(s1.breakdown.totalEth)}.`}
              onMouseMove={(e) => {
                const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                const d = ((e.clientX - r.left - m.l) / iw) * horizon;
                setHover(d >= 0 && d <= horizon ? d : null);
              }}
              onMouseLeave={() => setHover(null)}
              style={{ display: "block", overflow: "visible" }}
            >
              {phases.map((ph) => (
                <rect
                  key={ph.id}
                  x={x(ph.startDays)}
                  y={m.t}
                  width={Math.max(0, x(ph.endDays) - x(ph.startDays))}
                  height={ih}
                  fill={ph.id === "slashedLock" ? "var(--vb-red-t)" : "transparent"}
                />
              ))}
              {yTicks.map((t) => (
                <g key={t}>
                  <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke={s.GRID} />
                  <text x={m.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={s.INK_2}>
                    {fmtCompact(t)}
                  </text>
                </g>
              ))}
              {xTicks.map((t) => (
                <text key={t} x={x(t)} y={H - 8} textAnchor="middle" fontSize={11} fill={s.INK_2}>
                  {fmtX(t)}
                </text>
              ))}
              {markerRows.map((mk) => (
                <g key={mk.id}>
                  <line x1={x(mk.days)} x2={x(mk.days)} y1={m.t - 6 - (labelRows - 1 - mk.row) * 15} y2={m.t + ih} stroke={s.INK_MUTED} strokeWidth={1} />
                  <text
                    x={x(mk.days)}
                    y={m.t - 10 - (labelRows - 1 - mk.row) * 15}
                    textAnchor={x(mk.days) > W - 120 ? "end" : x(mk.days) < m.l + 60 ? "start" : "middle"}
                    fontSize={11}
                    fontWeight={600}
                    fill={s.INK_2}
                  >
                    {mk.label}
                  </text>
                </g>
              ))}
              <path d={path(s1.trace)} fill="none" stroke={s.S1} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              <path d={path(s0.trace)} fill="none" stroke={s.S0} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {hoverDay !== null && (
                <g pointerEvents="none">
                  <line x1={x(hoverDay)} x2={x(hoverDay)} y1={m.t} y2={m.t + ih} stroke={s.INK_MUTED} />
                  <circle cx={x(hoverDay)} cy={y(at(s0.trace, hoverDay))} r={4.5} fill={s.S0} stroke={s.SURFACE} strokeWidth={2} />
                  <circle cx={x(hoverDay)} cy={y(at(s1.trace, hoverDay))} r={4.5} fill={s.S1} stroke={s.SURFACE} strokeWidth={2} />
                </g>
              )}
            </svg>
            {hoverDay !== null && (
              <Box
                css={{
                  position: "absolute",
                  top: 30,
                  left: Math.min(x(hoverDay) + 12, W - 200),
                  pointerEvents: "none",
                  backgroundColor: "$bg02",
                  border: "1px solid $bg05",
                  borderRadius: "$3",
                  padding: "8px 11px",
                  boxShadow: "0 6px 20px rgba(0,0,0,.12)",
                  minWidth: 170,
                }}
              >
                <Text css={{ ...s.small, fontWeight: "$semibold", color: "$body" }}>
                  {hoursMode ? `Hour ${(hoverDay * 24).toFixed(1)}` : `Day ${hoverDay.toFixed(1)}`}
                </Text>
                <Text css={s.small}>
                  <Box as="span" css={s.swatch(s.S0)} />
                  Solo operators: {fmtEth(at(s0.trace, hoverDay))}
                </Text>
                <Text css={s.small}>
                  <Box as="span" css={s.swatch(s.S1)} />
                  DV: {fmtEth(at(s1.trace, hoverDay))}
                </Text>
                <Text css={{ ...s.small, marginTop: 3 }}>
                  {phases.find((ph) => hoverDay >= ph.startDays && hoverDay < ph.endDays)?.label ?? ""}
                </Text>
              </Box>
            )}
          </Box>

          {/* Phase lanes: what your stake is doing on the solo-operator setup */}
          <Box css={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }} aria-label="Phases, solo-operator setup">
            {phases.map((ph) => (
              <Box key={ph.id} css={{ position: "relative", height: 22 }}>
                <Box
                  css={{
                    position: "absolute",
                    left: x(ph.startDays),
                    width: Math.max(3, x(ph.endDays) - x(ph.startDays)),
                    top: 0,
                    height: 22,
                    borderRadius: 4,
                    backgroundColor: ph.id === "exitQueue" || ph.id === "consolidation" ? "$bg03" : "var(--vb-red-t)",
                    border: "1px solid",
                    borderColor: ph.id === "exitQueue" || ph.id === "consolidation" ? "$bg05" : "var(--vb-red-b)",
                  }}
                />
                <Text
                  css={{
                    position: "absolute",
                    left: Math.min(x(ph.startDays) + 6, W - 230),
                    top: 3,
                    fontSize: 11,
                    fontWeight: "$semibold",
                    color: "$body",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ph.label} · {fmtDays(Math.max(0, ph.endDays - ph.startDays))}
                </Text>
              </Box>
            ))}
          </Box>
          <Text css={{ ...s.small, marginTop: 12 }}>
            Averages across your validators: each one exits at its own place in the queue. Shaded red: earning nothing.
            {c.slashedFraction > 0 &&
              " Slashed validators are penalised for missed attestations until withdrawable (at least 8,192 epochs, ~36 days), and pay the correlation penalty halfway."}
          </Text>

          <TableView label="Event timeline, table">
            <table>
              <thead>
                <tr>
                  <th>{hoursMode ? "Hour" : "Day"}</th>
                  <th>Solo-operator loss (ETH)</th>
                  <th>DV loss (ETH)</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 11 }, (_, i) => (horizon * i) / 10).map((d) => (
                  <tr key={d}>
                    <td>{hoursMode ? (d * 24).toFixed(1) : d.toFixed(1)}</td>
                    <td>{fmtEth(at(s0.trace, d), { unit: false })}</td>
                    <td>{fmtEth(at(s1.trace, d), { unit: false })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableView>
        </Card>
      </Box>
    </Box>
  );
}
