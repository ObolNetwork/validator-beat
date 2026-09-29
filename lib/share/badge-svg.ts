import { SLICES, STAGE_META, computeStage } from "@lib/rubric";
import type { Answers } from "@lib/rubric/types";
import { PIZZA_FILL } from "@lib/theme/tokens";
import { escapeXml } from "@lib/share/og-card";

const H = 20;
const LEFT_W = 96;
const RIGHT_W = 78;
const RAD = Math.PI / 180;

/** A mini six-slice pizza, r=6, centred at (cx, 10). */
function miniPizza(answers: Answers, cx: number): string {
  const r = 6;
  const cy = H / 2;
  return SLICES.map((s, i) => {
    const a0 = (-90 + i * 60 + 3) * RAD;
    const a1 = (-90 + (i + 1) * 60 - 3) * RAD;
    const col = answers[s.id];
    const fill = col ? PIZZA_FILL[col] : "#555";
    return `<path d="M${cx},${cy} L${(cx + r * Math.cos(a0)).toFixed(2)},${(cy + r * Math.sin(a0)).toFixed(2)} A${r},${r} 0 0 1 ${(cx + r * Math.cos(a1)).toFixed(2)},${(cy + r * Math.sin(a1)).toFixed(2)} Z" fill="${fill}"/>`;
  }).join("");
}

/**
 * Shields-style README/website badge: "Validator Beat | 🍕 Stage N".
 * Pre-rendered per share code into public/badge/ by scripts/generate-og-images.ts.
 */
export function badgeSvg(answers: Answers): string {
  const stage = computeStage(answers);
  const stageName = stage == null ? "In progress" : STAGE_META[stage].name;
  const tone = stage == null ? "#555" : PIZZA_FILL[STAGE_META[stage].tone];
  const w = LEFT_W + RIGHT_W;
  const label = `Validator Beat: ${stageName}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${H}" role="img" aria-label="${escapeXml(label)}">
  <title>${escapeXml(label)}</title>
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${w}" height="${H}" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${LEFT_W}" height="${H}" fill="#0e1b1d"/>
    <rect x="${LEFT_W}" width="${RIGHT_W}" height="${H}" fill="${tone}"/>
    <rect width="${w}" height="${H}" fill="url(#s)"/>
  </g>
  <g fill="#fff" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" text-rendering="geometricPrecision">
    <text x="${LEFT_W / 2}" y="14" text-anchor="middle">Validator <tspan fill="#2fe4ab">Beat</tspan></text>
    <circle cx="${LEFT_W + 13}" cy="${H / 2}" r="7.5" fill="#0e1b1d" fill-opacity=".85"/>
    ${miniPizza(answers, LEFT_W + 13)}
    <text x="${LEFT_W + 24 + (RIGHT_W - 24) / 2}" y="14" text-anchor="middle" fill="#0e1b1d" font-weight="bold">${escapeXml(stageName)}</text>
  </g>
</svg>`;
}
