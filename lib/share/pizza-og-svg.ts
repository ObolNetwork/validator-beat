import { SLICES, computeStage } from "@lib/rubric";
import type { Answers, Stage } from "@lib/rubric/types";
import {
  PIZZA_EMPTY,
  PIZZA_EMPTY_STROKE,
  PIZZA_FILL,
  PIZZA_INK,
  PIZZA_PLATE,
  THEME_BRAND,
} from "@lib/theme/tokens";

const W = 1200;
const H = 630;
const RAD = Math.PI / 180;

function polar(cx: number, cy: number, r: number, deg: number) {
  return [cx + r * Math.cos(deg * RAD), cy + r * Math.sin(deg * RAD)] as const;
}

function wedgePath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z`;
}

const STAGE_LINE: Record<Stage, string> = {
  0: "Has a single point of failure — for now.",
  1: "Safe from slashing — no single party can get it slashed.",
  2: "Maximum resilience — can't be slashed, stopped, or censored.",
};

const STAGE_KIND: Record<Stage, string> = {
  0: "Getting started",
  1: "Safety",
  2: "Liveness",
};

const STAGE_COLOR: Record<Stage, string> = {
  0: PIZZA_FILL.red,
  1: PIZZA_FILL.yellow,
  2: PIZZA_FILL.green,
};

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function pizzaOgSvg(answers: Answers, code: string): string {
  const stage = computeStage(answers);
  const cx = 300;
  const cy = 315;
  const r = 200;
  const gap = 1.6;

  const wedges = SLICES.map((s, i) => {
    const a0 = -90 + i * 60 + gap;
    const a1 = -90 + (i + 1) * 60 - gap;
    const mid = (a0 + a1) / 2;
    const col = answers[s.id];
    const fill = col ? PIZZA_FILL[col] : PIZZA_EMPTY;
    const [lx, ly] = polar(cx, cy, r + 34, mid);
    const dash = col
      ? ""
      : ` stroke="${PIZZA_EMPTY_STROKE}" stroke-width="1.2" stroke-dasharray="5 4" opacity="0.7"`;
    return `
      <path d="${wedgePath(cx, cy, r, a0, a1)}" fill="${fill}" stroke="${PIZZA_PLATE}" stroke-width="2"${dash}/>
      <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle"
        font-family="DM Sans, system-ui, sans-serif" font-size="15" font-weight="600" fill="#696969">${escapeXml(s.short)}</text>`;
  }).join("");

  const stageBlock =
    stage == null
      ? `<text x="620" y="300" font-family="DM Sans, system-ui, sans-serif" font-size="36" font-weight="700" fill="${PIZZA_INK}">Validator Beat</text>`
      : `
      <text x="620" y="248" font-family="DM Sans, system-ui, sans-serif" font-size="18" font-weight="600" fill="#999999" letter-spacing="0.08em">MY VALIDATOR SETUP IS</text>
      <text x="620" y="310" font-family="DM Sans, system-ui, sans-serif" font-size="56" font-weight="700" fill="${STAGE_COLOR[stage]}">Stage ${stage}</text>
      <text x="620" y="352" font-family="DM Sans, system-ui, sans-serif" font-size="16" font-weight="700" fill="${STAGE_COLOR[stage]}" letter-spacing="0.06em">${STAGE_KIND[stage].toUpperCase()}</text>
      <text x="620" y="400" font-family="DM Sans, system-ui, sans-serif" font-size="22" font-weight="400" fill="#000000">${escapeXml(STAGE_LINE[stage])}</text>
      <text x="620" y="460" font-family="DM Sans, system-ui, sans-serif" font-size="17" fill="#696969">${SLICES.map((s) => `${s.short} ${answers[s.id] ? answers[s.id]![0].toUpperCase() : "—"}`).join(" · ")}</text>`;

  const hub =
    stage != null
      ? `<circle cx="${cx}" cy="${cy}" r="52" fill="${PIZZA_PLATE}" stroke="${PIZZA_EMPTY_STROKE}" stroke-width="1.5"/>
         <text x="${cx}" y="${cy - 10}" text-anchor="middle" font-family="DM Sans, system-ui, sans-serif" font-size="14" font-weight="600" fill="#999999" letter-spacing="0.14em">STAGE</text>
         <text x="${cx}" y="${cy + 28}" text-anchor="middle" font-family="DM Sans, system-ui, sans-serif" font-size="42" font-weight="700" fill="${STAGE_COLOR[stage]}">${stage}</text>`
      : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#f7f7f7"/>
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="16" fill="#ffffff" stroke="#e6e6e6"/>
  <text x="72" y="88" font-family="DM Sans, system-ui, sans-serif" font-size="22" font-weight="700" fill="${PIZZA_INK}">Validator <tspan fill="${THEME_BRAND}">Beat</tspan></text>
  <text x="${W - 72}" y="88" text-anchor="end" font-family="ui-monospace, monospace" font-size="16" fill="#999999">${code}</text>
  <circle cx="${cx}" cy="${cy}" r="${r + 8}" fill="${PIZZA_PLATE}"/>
  ${wedges}
  ${hub}
  ${stageBlock}
  <text x="72" y="${H - 56}" font-family="DM Sans, system-ui, sans-serif" font-size="18" fill="#696969">How resilient is your validator? Find out →</text>
</svg>`;
}
