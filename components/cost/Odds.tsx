import { Box, Text } from "@obolnetwork/obol-ui";
import { useMemo, useState } from "react";
import { Card, Eyebrow } from "@components/assessment/stitches";
import { fmtCompact, fmtEth, fmtPct, fmtYears, fmtYearsBetween } from "@lib/cost/format";
import { HEATMAP_RUNS, HEATMAP_YEARS, betaShape, expectations, type Heatmap, type MonteCarloResult } from "@lib/cost/montecarlo";
import { DEFAULT_PARAMS, type CostParams } from "@lib/cost/params";
import type { Economics } from "@lib/cost/model";
import { Chips, Slider, TableView } from "./controls";
import { SETUP } from "@lib/cost/labels";
import { useWidth } from "./useWidth";
import { niceTicks } from "./ticks";
import { Anchor } from "./Anchor";
import * as s from "./styles";

interface Props {
  params: CostParams;
  mc: MonteCarloResult | null;
  running: boolean;
  econ: Economics;
}

export function Odds({ params: p, mc, running, econ }: Props) {
  const exp = useMemo(() => expectations(p), [p]);
  const last = mc?.years[mc.years.length - 1];
  const unit = mc?.netRewardsPerYear0 ?? econ.rewardsPerYearEth;

  return (
    <Box as="section" css={{ ...s.section, ...s.band }} aria-labelledby="odds">
      <Box css={s.wrap}>
        <Eyebrow as="p" css={{ margin: "0 0 14px", color: s.LINK }}>
          The odds over time
        </Eyebrow>
        <Anchor id="odds" css={s.h2}>
          How the odds play out, year by year
        </Anchor>
        <Text as="p" css={s.prose}>
          The results above use averages. Incidents are rare and vary in size, so here are {p.runs.toLocaleString("en-US")}{" "}
          simulated runs over your {p.years}-year setting instead: the same operators as a {SETUP.s0.name.toLowerCase()} and as a multi-operator DV
          paying the higher fee, hit by the same incidents. Change the scenario in Setup. (The heatmap above runs its own
          simulations at every incident rate, out to {HEATMAP_YEARS} years.)
        </Text>

        {/* Headline stats */}
        <Box
          aria-live="polite"
          aria-busy={running}
          css={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 16,
            marginTop: 26,
            opacity: running && mc ? 0.6 : 1,
            transition: "opacity .2s",
            "@media (max-width: 900px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
          }}
        >
          <Stat
            value={last ? fmtPct(last.pStage0Ahead) : "…"}
            label={`of runs where the solo-operator setup is still ahead after ${p.years} years: no incident, or one small enough that the fees saved cover it`}
          />
          <Stat
            value={last ? signed(last.mean) : "…"}
            label={last ? `Average outcome for the multi-operator DV: ${signedYears(last.mean / unit)} of rewards` : "Average outcome"}
          />
          <Stat
            value={last ? signed(last.p95) : "…"}
            label="The 1-in-20 run: what the multi-operator DV saved when things went wrong"
          />
          <Stat
            value={Number.isFinite(exp.breakEvenRatePct) ? `${exp.breakEvenRatePct.toFixed(exp.breakEvenRatePct < 1 ? 2 : 1)}%` : "never"}
            label={
              Number.isFinite(exp.breakEvenRatePct) && exp.breakEvenRatePct > 0
                ? `Break-even incident rate per operator-year: one incident every ${fmtYearsBetween(Number(exp.breakEvenRatePct.toFixed(exp.breakEvenRatePct < 1 ? 2 : 1)))}. Above it, the multi-operator DV pays for itself on average (you chose ${p.incidentRatePct}%).`
                : `Break-even incident rate per operator-year (you chose ${p.incidentRatePct}%).`
            }
          />
        </Box>

        <Card css={{ ...s.cardPad, padding: 22, marginTop: 16 }}>
          <Anchor as="h3" id="fan-chart" css={s.h3}>
            Multi-operator DV minus solo operators, by year
          </Anchor>
          <Text css={{ ...s.small, marginTop: 4 }}>
            ETH. Above zero, the multi-operator DV is ahead. The median sits near the extra fee paid; the mean is pulled up by
            the runs where a solo operator was slashed.
          </Text>
          {mc ? <Fan mc={mc} /> : <Placeholder />}
        </Card>

        <Text as="p" css={{ ...s.prose, maxWidth: 900 }}>
          Expected loss per incident at one operator: <strong>{fmtEth(exp.perIncident0Eth)}</strong> with solo operators vs{" "}
          <strong>{fmtEth(exp.perIncident1Eth)}</strong> DV (including a {p.s1ResidualPct}% chance the attacker reaches a
          signing threshold anyway). Outages add about {fmtEth(exp.outage0PerYearEth)} a year with solo operators and{" "}
          {fmtEth(exp.outage1PerYearEth)} DV. The multi-operator DV&apos;s extra fee is {fmtEth(econ.premiumPerYearEth)} a year.
          {mc && (
            <>
              {" "}
              Across the runs: {mc.incidents.lucky.toLocaleString("en-US")} incidents caught in time,{" "}
              {mc.incidents.partial.toLocaleString("en-US")} partial slashings and {mc.incidents.full.toLocaleString("en-US")}{" "}
              near-total ones. The worst solo-operator run lost {fmtEth(mc.worstStage0LossEth)}.
            </>
          )}
        </Text>
      </Box>
    </Box>
  );
}

function signed(eth: number): string {
  return `${eth >= 0 ? "+" : "−"}${fmtEth(Math.abs(eth))}`;
}
function signedYears(y: number): string {
  return `${y >= 0 ? "+" : "−"}${fmtYears(Math.abs(y))}`;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <Card css={{ padding: "18px 18px 16px" }}>
      <Text css={s.statValue}>{value}</Text>
      <Text css={s.statLabel}>{label}</Text>
    </Card>
  );
}

function Placeholder() {
  return (
    <Box css={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Text css={s.small}>Simulating…</Text>
    </Box>
  );
}

export function SeverityShape({
  params: p,
  update,
  probabilities,
}: {
  params: CostParams;
  update: (patch: Partial<CostParams>) => void;
  probabilities: { lucky: number; partial: number; full: number };
}) {
  const [ref, W] = useWidth<HTMLDivElement>(260);
  const ys = betaShape(p.betaA, p.betaB);
  const H = 54;
  const d = ys.map((y, i) => `${i ? "L" : "M"}${((i / (ys.length - 1)) * W).toFixed(1)},${(H - y * (H - 4)).toFixed(1)}`).join("");
  const mean = p.betaA / (p.betaA + p.betaB);
  return (
    <Box>
      <Box css={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text css={{ fontSize: "$2", fontWeight: "$semibold", color: "$body" }}>Share of keys slashed, when it happens</Text>
        <Text css={{ fontSize: "$2", fontWeight: "$bold", color: "$body" }}>avg {fmtPct(mean)}</Text>
      </Box>
      <Box ref={ref}>
      <svg width={W} height={H + 16} role="img" aria-label={`Distribution of slashed share, mean ${fmtPct(mean)}`} style={{ display: "block", marginTop: 6 }}>
        <path d={`${d}L${W},${H}L0,${H}Z`} fill={s.S0} opacity={0.12} />
        <path d={d} fill="none" stroke={s.S0} strokeWidth={2} />
        <line x1={0} x2={W} y1={H} y2={H} stroke={s.GRID} />
        {[0, 0.5, 1].map((t) => (
          <text key={t} x={t * W} y={H + 13} fontSize={11} fill={s.INK_2} textAnchor={t === 0 ? "start" : t === 1 ? "end" : "middle"}>
            {fmtPct(t)}
          </text>
        ))}
      </svg>
      </Box>
      <Box css={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 14, marginTop: 10 }}>
        <Slider
          label="Skew to big (a)"
          value={p.betaA}
          min={0.5}
          max={10}
          step={0.5}
          defaultValue={DEFAULT_PARAMS.betaA}
          onChange={(v) => update({ betaA: v, severity: "custom" })}
          hint="Higher pushes slashings towards all of the operator's keys. Stolen keys gain leverage when used together, so attackers tend to slash many at once."
        />
        <Slider
          label="Skew to small (b)"
          value={p.betaB}
          min={0.5}
          max={10}
          step={0.5}
          defaultValue={DEFAULT_PARAMS.betaB}
          onChange={(v) => update({ betaB: v, severity: "custom" })}
          hint="Higher pushes slashings towards a few keys. Together with the one on the left, this sets a Beta(a, b) distribution for the share slashed."
        />
      </Box>
      <Text css={{ ...s.small, marginTop: 8 }}>
        Per incident: {fmtPct(probabilities.lucky)} caught in time, {fmtPct(probabilities.partial)} partial,{" "}
        {fmtPct(probabilities.full)} at least 90% of keys.
      </Text>
    </Box>
  );
}

function Fan({ mc }: { mc: MonteCarloResult }) {
  const [ref, width] = useWidth<HTMLDivElement>(520);
  const [hover, setHover] = useState<number | null>(null);
  const ys = mc.years;
  const lo = Math.min(0, ...ys.map((y) => y.p5));
  const hi = Math.max(0, ...ys.map((y) => Math.max(y.p95, y.mean)));
  const axis = niceTicks(lo, hi, 5);
  const yMin = axis.lo;
  const yMax = axis.hi;
  const m = { l: 52, r: 12, t: 12, b: 26 };
  const H = 260;
  const W = width;
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const n = ys.length;
  const x = (i: number) => m.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => m.t + ih - ((v - yMin) / (yMax - yMin)) * ih;
  const band = (a: keyof (typeof ys)[0], b: keyof (typeof ys)[0]) =>
    ys.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d[a] as number)}`).join("") +
    [...ys].reverse().map((d, i) => `L${x(n - 1 - i)},${y(d[b] as number)}`).join("") +
    "Z";
  const line = (k: keyof (typeof ys)[0]) => ys.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d[k] as number)}`).join("");
  const ticks = axis.ticks;
  const hy = hover !== null ? ys[hover] : null;

  return (
    <Box ref={ref} css={{ position: "relative", marginTop: 14 }}>
      <Box css={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 6 }}>
        <Text css={s.small}>
          <Box as="span" css={{ ...s.swatch(s.S1), height: 10, opacity: 0.18 }} />
          5–95% of runs
        </Text>
        <Text css={s.small}>
          <Box as="span" css={{ ...s.swatch(s.S1), height: 10, opacity: 0.35 }} />
          25–75%
        </Text>
        <Text css={s.small}>
          <Box as="span" css={s.swatch(s.S1)} />
          Median
        </Text>
        <Text css={s.small}>
          <Box as="span" css={{ display: "inline-block", width: 8, height: 8, borderRadius: 4, backgroundColor: s.INK, marginRight: 7 }} />
          Mean
        </Text>
      </Box>
      <svg
        width={W}
        height={H}
        role="img"
        aria-label={`After ${n} years, median ${signed(ys[n - 1].p50)}, mean ${signed(ys[n - 1].mean)}, 95th percentile ${signed(ys[n - 1].p95)}`}
        onMouseMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const i = Math.round(((e.clientX - r.left - m.l) / iw) * (n - 1));
          setHover(i >= 0 && i < n ? i : null);
        }}
        onMouseLeave={() => setHover(null)}
        style={{ display: "block" }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke={s.GRID} />
            <text x={m.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={s.INK_2}>
              {fmtCompact(t)}
            </text>
          </g>
        ))}
        <path d={band("p5", "p95")} fill={s.S1} opacity={0.14} />
        <path d={band("p25", "p75")} fill={s.S1} opacity={0.26} />
        <line x1={m.l} x2={W - m.r} y1={y(0)} y2={y(0)} stroke={s.INK_MUTED} strokeWidth={1.5} />
        <path d={line("p50")} fill="none" stroke={s.S1} strokeWidth={2} strokeLinejoin="round" />
        {ys.map((d, i) => (
          <circle key={d.year} cx={x(i)} cy={y(d.mean)} r={4} fill={s.INK} stroke={s.SURFACE} strokeWidth={2} />
        ))}
        {ys.map((d, i) =>
          n <= 12 || i % 2 === n % 2 || i === n - 1 ? (
            <text key={d.year} x={x(i)} y={H - 7} textAnchor="middle" fontSize={11} fill={s.INK_2}>
              {d.year}y
            </text>
          ) : null,
        )}
        <text x={m.l + 6} y={m.t + 12} fontSize={11} fill={s.INK_2}>
          ↑ DV ahead
        </text>
        <text x={m.l + 6} y={m.t + ih - 6} fontSize={11} fill={s.INK_2}>
          ↓ Solo operators ahead
        </text>
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={m.t + ih} stroke={s.INK_MUTED} pointerEvents="none" />}
      </svg>
      {hy && hover !== null && (
        <Box
          css={{
            position: "absolute",
            top: 40,
            left: Math.min(x(hover) + 12, W - 190),
            pointerEvents: "none",
            backgroundColor: "$bg02",
            border: "1px solid $bg05",
            borderRadius: "$3",
            padding: "8px 11px",
            boxShadow: "0 6px 20px rgba(0,0,0,.12)",
          }}
        >
          <Text css={{ ...s.small, fontWeight: "$semibold", color: "$body" }}>Year {hy.year}</Text>
          <Text css={s.small}>Median {signed(hy.p50)}</Text>
          <Text css={s.small}>Mean {signed(hy.mean)}</Text>
          <Text css={s.small}>
            5–95%: {signed(hy.p5)} to {signed(hy.p95)}
          </Text>
          <Text css={s.small}>Solo operators ahead in {fmtPct(hy.pStage0Ahead)}</Text>
        </Box>
      )}
      <TableView label="DV minus solo operators by year, table">
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>P(solo operators ahead)</th>
              <th>Mean</th>
              <th>5%</th>
              <th>25%</th>
              <th>Median</th>
              <th>75%</th>
              <th>95%</th>
            </tr>
          </thead>
          <tbody>
            {ys.map((d) => (
              <tr key={d.year}>
                <td>{d.year}</td>
                <td>{fmtPct(d.pStage0Ahead)}</td>
                <td>{fmtEth(d.mean, { unit: false })}</td>
                <td>{fmtEth(d.p5, { unit: false })}</td>
                <td>{fmtEth(d.p25, { unit: false })}</td>
                <td>{fmtEth(d.p50, { unit: false })}</td>
                <td>{fmtEth(d.p75, { unit: false })}</td>
                <td>{fmtEth(d.p95, { unit: false })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableView>
    </Box>
  );
}

export type HeatView = "chance" | "average";

const mix = (hue: string, pct: number) => `color-mix(in srgb, ${hue} ${Math.round(pct)}%, var(--theme-surface-card))`;

/** Chance view, diverging: Stage 0 colour above 50%, Stage 1 colour below, neutral at 50%. */
function chanceColor(pAhead: number): string {
  const t = Math.min(1, Math.abs(pAhead - 0.5) * 2);
  return mix(pAhead >= 0.5 ? s.S0 : s.S1, 8 + t * 72);
}

/** Average view, stepped diverging in years of Stage 0 rewards (Stage 1 − Stage 0). */
const AVG_STEPS = [0.05, 0.25, 1, 4];
const AVG_MIX = [8, 26, 46, 66, 86];
function avgLevel(years: number): number {
  const a = Math.abs(years);
  return AVG_STEPS.filter((t) => a >= t).length;
}
function averageColor(years: number): string {
  const level = avgLevel(years);
  return mix(level === 0 ? "var(--theme-text-muted)" : years > 0 ? s.S1 : s.S0, level === 0 ? 10 : AVG_MIX[level]);
}

function fmtAvg(years: number): string {
  if (Math.abs(years) < 0.05) return "about even";
  return `${years > 0 ? "DV" : "solo operators"} ahead by ${fmtYears(Math.abs(years))}`;
}

export function HeatGrid({ hm, rate, years, view }: { hm: Heatmap; rate: number; years: number; view: HeatView }) {
  const [hover, setHover] = useState<{ r: number; y: number } | null>(null);
  const yearCols = hm.years.filter((y) => y === 1 || y % 2 === 0);
  const nearest = (xs: number[], v: number) => xs.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));
  const nearestRate = nearest(hm.rates, rate);
  const nearestYear = nearest(yearCols, years);
  const value = (ri: number, y: number) => (view === "chance" ? hm.cells[ri][y - 1] : hm.meanYears[ri][y - 1]);
  const color = (v: number) => (view === "chance" ? chanceColor(v) : averageColor(v));
  const describe = (v: number) => (view === "chance" ? `solo operators ahead in ${fmtPct(v)} of runs` : `${fmtAvg(v)} of rewards on average`);

  return (
    <Box css={{ marginTop: 14 }}>
      <Box
        role="grid"
        aria-label={view === "chance" ? "Chance the solo-operator setup is still ahead, by incident rate and years" : "Average outcome, by incident rate and years"}
        css={{ display: "grid", gridTemplateColumns: `40px repeat(${yearCols.length}, minmax(0, 1fr))`, gap: 2 }}
        onMouseLeave={() => setHover(null)}
      >
        <Box />
        {yearCols.map((y) => (
          <Text key={y} css={{ fontSize: 11, color: s.INK_2, textAlign: "center" }}>
            {y}y
          </Text>
        ))}
        {[...hm.rates].reverse().map((r) => {
          const ri = hm.rates.indexOf(r);
          return (
            <Box key={r} role="row" css={{ display: "contents" }}>
              <Text css={{ fontSize: 11, color: s.INK_2, alignSelf: "center", textAlign: "right", paddingRight: 4 }}>{r}%</Text>
              {yearCols.map((y) => {
                const v = value(ri, y);
                const mine = r === nearestRate && y === nearestYear;
                return (
                  <Box
                    key={y}
                    role="gridcell"
                    aria-label={`${r}% a year, ${y} years: ${describe(v)}`}
                    onMouseEnter={() => setHover({ r, y })}
                    css={{
                      height: 20,
                      borderRadius: 3,
                      backgroundColor: color(v),
                      transition: "background-color .25s",
                      outline: mine ? `2px solid ${s.INK}` : "none",
                      outlineOffset: -1,
                    }}
                  />
                );
              })}
            </Box>
          );
        })}
      </Box>

      <Box css={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 10, gap: 10, flexWrap: "wrap" }}>
        {view === "chance" ? (
          <Box css={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Text css={{ fontSize: 11, color: s.INK_2 }}>DV usually ahead</Text>
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <Box key={v} css={{ width: 16, height: 10, borderRadius: 2, backgroundColor: chanceColor(v) }} />
            ))}
            <Text css={{ fontSize: 11, color: s.INK_2 }}>Solo operators usually ahead</Text>
          </Box>
        ) : (
          <Box css={{ display: "flex", alignItems: "flex-start", gap: 3 }} aria-label="Legend: years of rewards, DV minus solo operators">
            {[-4, -1, -0.25, -0.05, 0, 0.05, 0.25, 1, 4].map((v) => (
              <Box key={v} css={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: 30 }}>
                <Box css={{ width: 26, height: 10, borderRadius: 2, backgroundColor: averageColor(v) }} />
                <Text css={{ fontSize: 9, color: s.INK_2, whiteSpace: "nowrap" }}>
                  {v === 0 ? "even" : `${v > 0 ? "+" : "−"}${Math.abs(v)}y`}
                </Text>
              </Box>
            ))}
          </Box>
        )}
        <Text css={{ fontSize: "$1", color: "$body", fontWeight: "$semibold", minHeight: 16 }}>
          {hover ? `${hover.r}%/yr · ${hover.y} years: ${describe(value(hm.rates.indexOf(hover.r), hover.y))}` : ""}
        </Text>
      </Box>
      <Text css={{ ...s.small, marginTop: 8 }}>
        {view === "chance" ? (
          <>
            &ldquo;Ahead&rdquo; is not &ldquo;better on average&rdquo;: the solo-operator setup wins most runs by a little and loses
            a few by a lot. Switch to the average to see it.
          </>
        ) : (
          <>
            Average of DV minus solo operators, in years of rewards. Blue: the multi-operator DV comes out ahead on average, even where the
            solo-operator setup wins most individual runs.
          </>
        )}
      </Text>
      <TableView label={view === "chance" ? "Chance solo operators are ahead, table" : "Average outcome, table"}>
        <table>
          <thead>
            <tr>
              <th>Rate / yr</th>
              {yearCols.map((y) => (
                <th key={y}>{y}y</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hm.rates.map((r, ri) => (
              <tr key={r}>
                <td>{r}%</td>
                {yearCols.map((y) => (
                  <td key={y}>
                    {view === "chance"
                      ? fmtPct(hm.cells[ri][y - 1])
                      : `${hm.meanYears[ri][y - 1] >= 0 ? "+" : "−"}${Math.abs(hm.meanYears[ri][y - 1]).toFixed(2)}y`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableView>
    </Box>
  );
}

/** The heatmap card on its own: shown in both views, right after Results. */
export function AheadMap({
  params: p,
  update,
  heatmap,
}: {
  params: CostParams;
  update: (patch: Partial<CostParams>) => void;
  heatmap: Heatmap | null;
}) {
  return (
    <Card
      as="section"
      aria-labelledby="ahead-heatmap"
      css={{
        ...s.cardPad,
        display: "grid",
        gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1.2fr)",
        gap: 28,
        "@media (max-width: 900px)": { gridTemplateColumns: "minmax(0, 1fr)" },
      }}
    >
      <Box>
        <Anchor as="h2" id="ahead-heatmap" css={{ ...s.h3, fontSize: 22 }}>
          {p.heatView === "chance" ? "How often the solo setup still comes out ahead" : "Who comes out ahead on average"}
        </Anchor>
        <Text as="p" css={{ ...s.prose, fontSize: "$2", marginTop: 10 }}>
          {p.heatView === "chance" ? (
            <>
              Each cell is the share of simulated runs where the {SETUP.s0.name.toLowerCase()} is still ahead: no incident yet,
              or only small ones its lower fees have covered. With {Math.max(1, Math.round(p.operators))} separate operators there
              are that many chances of an incident each year, so the odds fall quickly.
            </>
          ) : (
            <>
              Each cell is the average result, in years of rewards. Blue means the multi-operator DV comes out ahead on
              average, even where the solo setup wins most individual runs: when it loses, it loses a lot.
            </>
          )}
        </Text>
        <Chips
          label="Heatmap view"
          hideLabel
          size="sm"
          value={p.heatView}
          options={[
            { id: "chance", label: "Chance of being ahead" },
            { id: "average", label: "Average outcome" },
          ]}
          onChange={(heatView) => update({ heatView })}
          css={{ marginTop: 14, maxWidth: 360 }}
        />
      </Box>
      <Box>
        <Text css={{ ...s.small }}>
          Rows: key incidents per operator per year. Columns: years held, 1 to {HEATMAP_YEARS}, from{" "}
          {HEATMAP_RUNS.toLocaleString("en-US")} simulated runs per row. Your rate and your {p.years}-year setting are outlined.
        </Text>
        {heatmap ? <HeatGrid hm={heatmap} rate={p.incidentRatePct} years={p.years} view={p.heatView} /> : <Placeholder />}
      </Box>
    </Card>
  );
}
