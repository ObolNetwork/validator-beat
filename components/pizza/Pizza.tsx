import { SLICES } from "@lib/rubric";
import type { Answers, SliceColor, SliceId, Stage } from "@lib/rubric/types";

/**
 * Theme-reactive colors. The in-app pizza reads CSS variables so it follows
 * light/dark mode; the static OG share images use the hex constants in
 * lib/theme/tokens.ts instead (they're pre-rendered at build time).
 */
const PIZZA_FILL: Record<SliceColor, string> = {
  green: "var(--vb-green)",
  yellow: "var(--vb-yellow)",
  red: "var(--vb-red)",
};
const PIZZA_RING: Record<SliceColor, string> = {
  green: "var(--theme-risk-green-ring)",
  yellow: "var(--theme-risk-yellow-ring)",
  red: "var(--theme-risk-red-ring)",
};
const PIZZA_PLATE = "var(--vb-plate)";
const PIZZA_EMPTY = "var(--vb-empty)";
const PIZZA_EMPTY_STROKE = "var(--vb-empty-stroke)";
const PIZZA_INK = "var(--vb-ink)";

const RAD = Math.PI / 180;

function polar(cx: number, cy: number, r: number, deg: number) {
  return [cx + r * Math.cos(deg * RAD), cy + r * Math.sin(deg * RAD)] as const;
}

function wedgePath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${cx},${cy} L${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
}

export type PizzaProps = {
  answers?: Answers;
  size?: number;
  active?: SliceId | null;
  onSlice?: (id: SliceId) => void;
  showLabels?: boolean;
  /** Pull labels inward (results panel — avoids overlapping rubric below). */
  tightLabels?: boolean;
  /** Scale wedge labels (e.g. 0.8 for compact share card). */
  labelScale?: number;
  showCenter?: boolean;
  stage?: Stage | null;
};

export function Pizza({
  answers = {},
  size = 320,
  active = null,
  onSlice,
  showLabels = true,
  tightLabels = false,
  labelScale = 1,
  showCenter = true,
  stage = null,
}: PizzaProps) {
  const big = size >= 120;
  const pop = big ? size * 0.022 : 0;
  const cx = size / 2;
  const cy = size / 2;
  const pad = showLabels ? (tightLabels ? 0.42 : 0.34) : 0.06;
  const r = (size / 2) * (1 - pad);
  const gap = 1.6;

  const answered = SLICES.filter((s) => answers[s.id]).length;
  const stageTone =
    stage == null
      ? null
      : stage === 2
        ? PIZZA_FILL.green
        : stage === 1
          ? PIZZA_FILL.yellow
          : PIZZA_FILL.red;
  const ringTone =
    stage == null
      ? null
      : stage === 2
        ? PIZZA_RING.green
        : stage === 1
          ? PIZZA_RING.yellow
          : PIZZA_RING.red;

  const hubR = size * 0.135;
  const ringR = hubR + (big ? 7 : 3);
  const circ = 2 * Math.PI * ringR;
  const frac = answered / SLICES.length;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="vbpizza"
      role="img"
      aria-label="Decentralization pizza — six slices"
    >
      {big && (
        <defs>
          {(["green", "yellow", "red"] as const).map((c) => (
            <filter
              key={c}
              id={`vbglow-${c}-${size}`}
              x="-45%"
              y="-45%"
              width="190%"
              height="190%"
            >
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation={size * 0.013}
                floodColor={PIZZA_FILL[c]}
                floodOpacity="0.5"
              />
            </filter>
          ))}
        </defs>
      )}

      <circle cx={cx} cy={cy} r={r + (big ? 7 : 2)} style={{ fill: PIZZA_PLATE }} />
      {big && (
        <circle
          cx={cx}
          cy={cy}
          r={r + 4.5}
          style={{
            fill: "none",
            stroke: PIZZA_EMPTY_STROKE,
            strokeWidth: 1,
            opacity: 0.45,
          }}
        />
      )}

      {SLICES.map((s, i) => {
        const a0 = -90 + i * 60 + gap;
        const a1 = -90 + (i + 1) * 60 - gap;
        const mid = (a0 + a1) / 2;
        const col = answers[s.id];
        const clickable = Boolean(onSlice && col);
        const isActive = active === s.id;
        const dx = isActive ? Math.cos(mid * RAD) * pop : 0;
        const dy = isActive ? Math.sin(mid * RAD) * pop : 0;
        const shift = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
        const labelOutset = size * (tightLabels ? 0.05 : 0.082);
        const [lx, ly] = polar(cx, cy, r + labelOutset, mid);

        return (
          <g
            key={s.id}
            className="vbwedge"
            data-clickable={clickable ? "true" : undefined}
            onClick={clickable ? () => onSlice!(s.id) : undefined}
          >
            <path
              className="vbwedge__fill"
              d={wedgePath(cx, cy, r, a0, a1)}
              filter={col && big ? `url(#vbglow-${col}-${size})` : undefined}
              style={{
                fill: col ? PIZZA_FILL[col] : PIZZA_EMPTY,
                stroke: PIZZA_PLATE,
                strokeWidth: 2,
                transform: shift,
              }}
            />
            {!col && (
              <path
                d={wedgePath(cx, cy, r, a0, a1)}
                strokeDasharray="4 4"
                style={{
                  fill: "none",
                  stroke: PIZZA_EMPTY_STROKE,
                  strokeWidth: 1.25,
                  opacity: 0.7,
                  transform: shift,
                  pointerEvents: "none",
                }}
              />
            )}
            {isActive && (
              <path
                d={wedgePath(cx, cy, r + 3, a0, a1)}
                className="vbwedge__ring"
                style={{
                  fill: "none",
                  stroke: PIZZA_INK,
                  strokeWidth: 2,
                  transform: shift,
                  pointerEvents: "none",
                }}
              />
            )}
            {showLabels && (
              <text
                x={+lx.toFixed(2)}
                y={+ly.toFixed(2)}
                className="vbpizza__lbl"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  transform: shift,
                  pointerEvents: "none",
                  fill: isActive ? "var(--fg-1)" : "var(--fg-3)",
                  fontSize: 11 * labelScale,
                }}
              >
                {s.short}
              </text>
            )}
          </g>
        );
      })}

      {showCenter && (
        <g style={{ pointerEvents: "none" }}>
          {big && (
            <circle
              cx={cx}
              cy={cy}
              r={ringR}
              style={{ fill: "none", stroke: PIZZA_PLATE, strokeWidth: 6 }}
            />
          )}
          {big && (
            <circle
              cx={cx}
              cy={cy}
              r={ringR}
              style={{
                fill: "none",
                stroke: PIZZA_EMPTY_STROKE,
                strokeWidth: 3.5,
                opacity: 0.35,
              }}
            />
          )}
          {big && answered > 0 && (
            <circle
              cx={cx}
              cy={cy}
              r={ringR}
              className="vbpizza__progress"
              style={{
                fill: "none",
                stroke: ringTone || "var(--ice)",
                strokeWidth: 3.5,
                strokeLinecap: frac >= 1 ? "butt" : "round",
                strokeDasharray:
                  frac >= 1 ? "none" : `${(frac * circ).toFixed(1)} ${circ.toFixed(1)}`,
                transform: "rotate(-90deg)",
                transformOrigin: `${cx}px ${cy}px`,
              }}
            />
          )}
          <circle
            cx={cx}
            cy={cy}
            r={hubR}
            strokeWidth="1.5"
            style={{ fill: PIZZA_PLATE, stroke: PIZZA_EMPTY_STROKE }}
          />
          <text
            x={cx}
            y={cy - size * 0.028}
            className="vbpizza__stagek"
            textAnchor="middle"
            style={{ fill: PIZZA_INK, fontSize: size * 0.033 }}
          >
            STAGE
          </text>
          <text
            x={cx}
            y={cy + size * 0.072}
            className="vbpizza__stagev"
            textAnchor="middle"
            style={{ fill: stageTone || PIZZA_INK, fontSize: size * 0.105 }}
          >
            {stage == null ? "–" : stage}
          </text>
        </g>
      )}
    </svg>
  );
}
