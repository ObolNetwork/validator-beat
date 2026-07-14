import { SLICES, STAGE_META, computeStage } from "@lib/rubric";
import type { Answers } from "@lib/rubric/types";
import {
  FONT,
  OG_HEAD,
  OG_HUB_IDLE_STROKE,
  OG_LABEL,
  OG_STAGE_COLOR,
  OG_SUB,
  escapeXml,
  ogCta,
  ogHeader,
  ogPizza,
  ogPulse,
  ogShell,
} from "@lib/share/og-card";
import { PIZZA_FILL } from "@lib/theme/tokens";

const EMPTY_DOT = "#5a6a66";

/**
 * OG card for a share result (/GYRYGG etc.) — "MY VALIDATOR SETUP IS Stage N"
 * with the result pizza. The viral loop: the card states the sharer's stage
 * and asks the viewer theirs.
 */
export function pizzaOgSvg(
  answers: Answers,
  code: string,
  displayHost: string = "validatorbeat.com",
): string {
  const stage = computeStage(answers);
  const colors = SLICES.map((s) => answers[s.id] ?? null);

  if (stage == null) {
    // Partial result (share codes with "_") — no stage to headline yet.
    return ogShell(`
  ${ogHeader(`${displayHost}/${code}`)}
  <text x="64" y="196" font-family="${FONT}" font-size="20" font-weight="600" fill="${OG_SUB}" letter-spacing="0.1em">MY VALIDATOR SETUP IS</text>
  <text x="64" y="292" font-family="${FONT}" font-size="80" font-weight="700" fill="${OG_HEAD}">In progress</text>
  <text x="64" y="380" font-family="${FONT}" font-size="27" fill="${OG_SUB}">Six checks, one Stage — nothing stored.</text>
  ${ogPulse(470)}
  ${ogCta(`What stage is yours? → ${displayHost}`)}
  ${ogPizza({ colors, hubText: "?", hubTextColor: PIZZA_FILL.yellow, hubStroke: OG_HUB_IDLE_STROKE })}`);
  }

  const stageColor = OG_STAGE_COLOR[stage];
  // Keep each label snug against its own dot; put the breathing room around
  // the "·" separators so the label↔dot pairing reads unambiguously.
  const dots = SLICES.map((s) => {
    const c = answers[s.id];
    const dot = c ? PIZZA_FILL[c] : EMPTY_DOT;
    return `${escapeXml(s.short)}<tspan dx="5" fill="${dot}" font-size="26" dy="2">●</tspan><tspan dy="-2"> </tspan>`;
  }).join(`<tspan dx="9" fill="${EMPTY_DOT}">·</tspan><tspan dx="9"> </tspan>`);

  return ogShell(`
  ${ogHeader(`${displayHost}/${code}`)}
  <text x="64" y="196" font-family="${FONT}" font-size="20" font-weight="600" fill="${OG_SUB}" letter-spacing="0.1em">MY VALIDATOR SETUP IS</text>
  <text x="64" y="292" font-family="${FONT}" font-size="88" font-weight="700" fill="${stageColor}">Stage ${stage}</text>
  <text x="64" y="338" font-family="${FONT}" font-size="21" font-weight="700" fill="${stageColor}" letter-spacing="0.08em">${escapeXml(STAGE_META[stage].kind.toUpperCase())}</text>
  <text x="64" y="404" font-family="${FONT}" font-size="27" fill="#d7e2de">${escapeXml(STAGE_META[stage].shareLine)}</text>
  <text x="64" y="466" font-family="${FONT}" font-size="20" fill="${OG_LABEL}">${dots}</text>
  ${ogCta(`What stage is yours? → ${displayHost}`)}
  ${ogPizza({ colors, hubText: String(stage), hubTextColor: stageColor, hubStroke: stageColor })}`);
}
