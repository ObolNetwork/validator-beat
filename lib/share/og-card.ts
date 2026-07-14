/**
 * Shared building blocks for the dark OG-card system (1200×630).
 *
 * Both the landing card (lib/share/landing-og-svg.ts) and the 729 share
 * cards (lib/share/pizza-og-svg.ts) compose these pieces so layout, palette,
 * and the pizza rendering stay pixel-identical across the whole OG surface.
 * Cards are rendered to PNG at build time by scripts/generate-og-images.ts.
 *
 * Layout contract: text column starts at x=64; pizza sits at cx=905 cy=348
 * r=190; CTA baseline at y=556. Sizes are chosen for feed-scale legibility —
 * cards display ~500px wide, so nothing here should go below ~19px.
 */
import { SLICES } from "@lib/rubric";
import type { SliceColor, Stage } from "@lib/rubric/types";
import { ethBadge } from "@lib/share/eth-mark";
import { PIZZA_FILL, THEME_BRAND } from "@lib/theme/tokens";

export const OG_W = 1200;
export const OG_H = 630;

export const FONT = "DM Sans, system-ui, sans-serif";
export const MONO = "ui-monospace, monospace";

// Dark palette — tuned for contrast in social feeds, not for the (light) site.
export const OG_BG = "#0e1b1d";
export const OG_PLATE = "#152829";
export const OG_HEAD = "#f2f6f4";
export const OG_SUB = "#9fb3ae";
export const OG_LABEL = "#a9b8b3";
export const OG_URL = "#6f827e";
export const OG_ACCENT = "#2fe4ab";
export const OG_HUB_FILL = "#0f2123";
export const OG_HUB_IDLE_STROKE = "#2a4a48";
const OG_EMPTY = "#1b2f30";
const OG_EMPTY_STROKE = "#3a4f4c";

export const OG_STAGE_COLOR: Record<Stage, string> = {
  0: PIZZA_FILL.red,
  1: PIZZA_FILL.yellow,
  2: PIZZA_FILL.green,
};

export function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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

/** SVG open tag, dark background, and a teal glow behind the pizza. */
export function ogShell(inner: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}" viewBox="0 0 ${OG_W} ${OG_H}">
  <rect width="${OG_W}" height="${OG_H}" fill="${OG_BG}"/>
  <radialGradient id="glow" cx="905" cy="348" r="420" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#16968E" stop-opacity="0.16"/>
    <stop offset="1" stop-color="#16968E" stop-opacity="0"/>
  </radialGradient>
  <rect width="${OG_W}" height="${OG_H}" fill="url(#glow)"/>
  ${inner}
</svg>`;
}

/** Eth badge + wordmark top-left, URL top-right. */
export function ogHeader(urlText: string): string {
  return `
  ${ethBadge(94, 66, 22, THEME_BRAND, "#e6e6e6")}
  <text x="128" y="75" font-family="${FONT}" font-size="24" font-weight="700" fill="${OG_HEAD}">Validator <tspan fill="${OG_ACCENT}">Beat</tspan></text>
  <text x="${OG_W - 64}" y="75" text-anchor="end" font-family="${MONO}" font-size="17" fill="${OG_URL}">${escapeXml(urlText)}</text>`;
}

export type OgPizzaOpts = {
  /** One color per slice in SLICES order; null renders a dashed empty wedge. */
  colors: (SliceColor | null)[];
  hubText: string;
  hubTextColor: string;
  hubStroke: string;
};

/** The six-slice pizza with labels and a stage hub, at the fixed right-column position. */
export function ogPizza(o: OgPizzaOpts): string {
  const cx = 905;
  const cy = 348;
  const r = 190;
  const gap = 1.6;

  const wedges = SLICES.map((s, i) => {
    const a0 = -90 + i * 60 + gap;
    const a1 = -90 + (i + 1) * 60 - gap;
    const mid = (a0 + a1) / 2;
    const [lx, ly] = polar(cx, cy, r + 34, mid);
    const col = o.colors[i];
    const fill = col ? PIZZA_FILL[col] : OG_EMPTY;
    const dash = col
      ? ""
      : ` stroke-dasharray="5 4" stroke="${OG_EMPTY_STROKE}" stroke-width="1.5"`;
    return `
      <path d="${wedgePath(cx, cy, r, a0, a1)}" fill="${fill}" stroke="${OG_BG}" stroke-width="3"${dash}/>
      <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-family="${FONT}" font-size="21" font-weight="600" fill="${OG_LABEL}">${escapeXml(s.short)}</text>`;
  }).join("");

  return `<circle cx="${cx}" cy="${cy}" r="${r + 8}" fill="${OG_PLATE}"/>
  ${wedges}
  <circle cx="${cx}" cy="${cy}" r="54" fill="${OG_HUB_FILL}" stroke="${o.hubStroke}" stroke-width="2.5"/>
  <text x="${cx}" y="${cy - 12}" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="600" fill="${OG_LABEL}" letter-spacing="0.14em">STAGE</text>
  <text x="${cx}" y="${cy + 30}" text-anchor="middle" font-family="${FONT}" font-size="46" font-weight="700" fill="${o.hubTextColor}">${escapeXml(o.hubText)}</text>`;
}

/** Bottom-left call to action in the accent green. */
export function ogCta(text: string, y: number = 556): string {
  return `<text x="64" y="${y}" font-family="${FONT}" font-size="28" font-weight="700" fill="${OG_ACCENT}">${escapeXml(text)}</text>`;
}

/** A single EKG heartbeat across the text column — the "Beat" motif. */
export function ogPulse(y: number): string {
  const x0 = 64;
  const x1 = 620;
  const m = (x0 + x1) / 2;
  return `<polyline points="${x0},${y} ${m - 60},${y} ${m - 42},${y} ${m - 28},${y - 26} ${m - 12},${y + 30} ${m + 2},${y} ${x1},${y}" fill="none" stroke="${OG_ACCENT}" stroke-width="2.5" opacity="0.4"/>`;
}
