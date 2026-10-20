import { FONT, OG_ACCENT, OG_HEAD, OG_LABEL, OG_SUB, escapeXml, ogCta, ogHeader, ogPulse, ogShell } from "@lib/share/og-card";
import { fmtEth } from "@lib/cost/format";
import { DEFAULT_PARAMS } from "@lib/cost/params";
import { economics, outcomeCases } from "@lib/cost/model";

// Dark-mode chart tokens (styles/theme-tokens.css --theme-cost-s0/s1), validated on dark surfaces.
const S0 = "#dd603c";
const S1 = "#4f8fd6";
const EMPTY = "#1b2f30";

const COLS = 25;
const ROWS = 8;
const CELL = 14;
const GAP = 3;

/** 200 cells = the whole stake; filled cells are the loss, area-true. */
function waffle(x0: number, y0: number, loss: number, stake: number, color: string): string {
  const per = stake / (COLS * ROWS);
  const full = Math.floor(loss / per);
  const part = loss / per - full;
  const out: string[] = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    const x = x0 + (i % COLS) * (CELL + GAP);
    const y = y0 + Math.floor(i / COLS) * (CELL + GAP);
    out.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${EMPTY}"/>`);
    if (i < full) {
      out.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${color}"/>`);
    } else if (i === full && part > 0) {
      const side = Math.max(Math.sqrt(part) * CELL, 2.5);
      out.push(`<rect x="${x}" y="${y}" width="${side.toFixed(1)}" height="${side.toFixed(1)}" fill="${color}"/>`);
      if (full === 0) {
        out.push(`<rect x="${x - 2}" y="${y - 2}" width="${CELL + 4}" height="${CELL + 4}" rx="3" fill="none" stroke="${color}" stroke-width="2"/>`);
      }
    }
  }
  return out.join("");
}

/**
 * OG card for /cost-of-failure: the headline loss at the page's defaults,
 * Stage 0 vs Stage 1 as to-scale waffles. Rendered to
 * public/og/cost-of-failure.png at build time.
 */
export function costOgSvg(displayHost: string = "validatorbeat.com"): string {
  const p = DEFAULT_PARAMS;
  const full = outcomeCases(p).find((c) => c.id === "full")!;
  const loss0 = full.stage0.breakdown.totalEth;
  const loss1 = full.stage1.breakdown.totalEth;
  const premiumYears = loss0 / economics(p).premiumPerYearEth;
  const gx = 712;

  return ogShell(`
  ${ogHeader(displayHost)}
  <text x="64" y="176" font-family="${FONT}" font-size="19" font-weight="600" fill="${OG_ACCENT}" letter-spacing="0.12em">THE COST OF ONE FAILURE</text>
  <text x="64" y="250" font-family="${FONT}" font-size="62" font-weight="700" fill="${OG_HEAD}">One leaked key.</text>
  <text x="64" y="324" font-family="${FONT}" font-size="62" font-weight="700" fill="${S0}">${escapeXml(fmtEth(loss0))}</text>
  <text x="64" y="380" font-family="${FONT}" font-size="25" fill="${OG_SUB}">${p.operatorSharePct}% operator, every key slashed, ${escapeXml(fmtEth(p.stakeEth))}.</text>
  <text x="64" y="418" font-family="${FONT}" font-size="25" fill="${OG_SUB}">At Stage 1: <tspan fill="${OG_HEAD}" font-weight="700">about ${escapeXml(fmtEth(loss1))}</tspan>.</text>
  <text x="64" y="456" font-family="${FONT}" font-size="25" fill="${OG_SUB}">${escapeXml(`= ${Math.round(premiumYears)} years of a ${p.fee0Pct}% → ${p.fee1Pct}% fee premium.`)}</text>
  ${ogPulse(500)}
  ${ogCta("Run the numbers for your stake →", 568)}
  <rect x="${gx}" y="170" width="14" height="4" rx="2" fill="${S0}"/>
  <text x="${gx + 22}" y="177" font-family="${FONT}" font-size="20" font-weight="700" fill="${OG_LABEL}" letter-spacing="0.06em">STAGE 0 · ${escapeXml(fmtEth(loss0))}</text>
  ${waffle(gx, 192, loss0, p.stakeEth, S0)}
  <rect x="${gx}" y="370" width="14" height="4" rx="2" fill="${S1}"/>
  <text x="${gx + 22}" y="377" font-family="${FONT}" font-size="20" font-weight="700" fill="${OG_LABEL}" letter-spacing="0.06em">STAGE 1 · ${escapeXml(fmtEth(loss1))}</text>
  ${waffle(gx, 392, loss1, p.stakeEth, S1)}
  <text x="${gx}" y="566" font-family="${FONT}" font-size="19" fill="${OG_LABEL}">Each square: ${escapeXml(fmtEth(p.stakeEth / (COLS * ROWS)))}. To scale.</text>`);
}
