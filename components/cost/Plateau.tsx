import { Box, Text } from "@obolnetwork/obol-ui";
import { useMemo, useState } from "react";
import { fmtPct } from "@lib/cost/format";
import { forOperator, safetyCase } from "@lib/cost/model";
import { DEFAULT_PARAMS } from "@lib/cost/params";
import { TableView } from "./controls";
import { niceTicks } from "./ticks";
import { useWidth } from "./useWidth";
import * as s from "./styles";

const SHARES = [0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 21, 24, 27, 30, 33];

/**
 * Loss when every key at an operator is slashed, as a share of your slice,
 * against that operator's share of the network. The simple rule (3× the
 * share) rises without limit; the real exit queue flattens it, because
 * validators deep in the queue escape their own correlation penalty.
 */
export function Plateau() {
  const [ref, W] = useWidth<HTMLDivElement>(640);
  const [hover, setHover] = useState<number | null>(null);
  const rows = useMemo(
    () =>
      SHARES.map((share) => {
        const q = forOperator(DEFAULT_PARAMS, { stakeEth: 1000, sharePct: share });
        return {
          share,
          model: safetyCase(q, 1).breakdown.totalEth / 1000,
          simple: Math.min((3 * share) / 100, 1) + 1 / 4096,
        };
      }),
    [],
  );
  const m = { l: 44, r: 14, t: 10, b: 30 };
  const H = 240;
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  // Full 0–100% so the simple rule visibly keeps climbing while the model flattens.
  const yAxis = niceTicks(0, Math.max(...rows.map((r) => r.simple), ...rows.map((r) => r.model)), 4);
  const x = (share: number) => m.l + (share / 33) * iw;
  const y = (v: number) => m.t + ih - (Math.min(v, yAxis.hi) / yAxis.hi) * ih;
  const line = (k: "model" | "simple") => rows.map((r, i) => `${i ? "L" : "M"}${x(r.share)},${y(r[k])}`).join("");
  const peak = rows.reduce((a, r) => (r.model > a.model ? r : a));
  // Where the model leaves the 3× line: the first share at which it falls 10% short.
  const knee = rows.find((r) => r.model < 0.9 * r.simple) ?? rows[rows.length - 1];
  const h = hover !== null ? rows[hover] : null;

  return (
    <Box css={{ marginTop: 18 }}>
      <Box css={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 6 }}>
        <Text css={s.small}>
          <Box as="span" css={s.swatch(s.S0)} />
          This model (exit queue included)
        </Text>
        <Text css={s.small}>
          <Box as="span" css={s.swatch(s.INK_MUTED)} />
          Simple rule: 3× the operator&apos;s share
        </Text>
      </Box>
      <Box ref={ref} css={{ position: "relative" }}>
        <svg
          width={W}
          height={H}
          role="img"
          aria-label={`Loss when every key is slashed, by operator size: it follows the simple 3× rule up to about ${knee.share}% of the network, then flattens at about ${fmtPct(knee.model)} to ${fmtPct(peak.model)} of your slice, while the simple rule keeps rising to 100%.`}
          onMouseMove={(e) => {
            const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const share = ((e.clientX - r.left - m.l) / iw) * 33;
            let best = 0;
            rows.forEach((row, i) => {
              if (Math.abs(row.share - share) < Math.abs(rows[best].share - share)) best = i;
            });
            setHover(share >= 0 && share <= 33 ? best : null);
          }}
          onMouseLeave={() => setHover(null)}
          style={{ display: "block" }}
        >
          {yAxis.ticks.map((t) => (
            <g key={t}>
              <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke={s.GRID} />
              <text x={m.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={s.INK_2}>
                {fmtPct(t)}
              </text>
            </g>
          ))}
          {[0, 5, 10, 15, 20, 25, 30].map((t) => (
            <text key={t} x={x(t)} y={H - 8} textAnchor="middle" fontSize={11} fill={s.INK_2}>
              {t}%
            </text>
          ))}
          <path d={line("simple")} fill="none" stroke={s.INK_MUTED} strokeWidth={2} />
          <path d={line("model")} fill="none" stroke={s.S0} strokeWidth={2} strokeLinejoin="round" />
          {h && (
            <g pointerEvents="none">
              <line x1={x(h.share)} x2={x(h.share)} y1={m.t} y2={m.t + ih} stroke={s.INK_MUTED} />
              <circle cx={x(h.share)} cy={y(h.model)} r={4.5} fill={s.S0} stroke={s.SURFACE} strokeWidth={2} />
            </g>
          )}
        </svg>
        {h && (
          <Box
            css={{
              position: "absolute",
              top: 12,
              left: Math.min(x(h.share) + 12, W - 210),
              pointerEvents: "none",
              backgroundColor: "$bg02",
              border: "1px solid $bg05",
              borderRadius: "$3",
              padding: "8px 11px",
              boxShadow: "0 6px 20px rgba(0,0,0,.12)",
            }}
          >
            <Text css={{ ...s.small, fontWeight: "$semibold", color: "$body" }}>Operator at {h.share}% of the network</Text>
            <Text css={s.small}>This model: {fmtPct(h.model, 1)} of the slice</Text>
            <Text css={s.small}>Simple rule: {fmtPct(h.simple, 1)}</Text>
          </Box>
        )}
      </Box>
      <Text css={{ ...s.small, marginTop: 6 }}>
        X axis: the operator&apos;s share of all staked ETH. Y axis: loss when every key it runs is slashed, as a share of
        your slice. Defaults otherwise.
      </Text>
      <TableView label="Plateau chart, table">
        <table>
          <thead>
            <tr>
              <th>Operator&apos;s network share</th>
              <th>This model</th>
              <th>Simple 3× rule</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.share}>
                <td>{r.share}%</td>
                <td>{fmtPct(r.model, 1)}</td>
                <td>{fmtPct(r.simple, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableView>
    </Box>
  );
}
