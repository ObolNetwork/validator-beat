import type { SliceColor } from "@lib/rubric/types";
import {
  FONT,
  OG_ACCENT,
  OG_HEAD,
  OG_HUB_IDLE_STROKE,
  OG_SUB,
  ogCta,
  ogHeader,
  ogPizza,
  ogPulse,
  ogShell,
} from "@lib/share/og-card";
import { PIZZA_FILL } from "@lib/theme/tokens";

/**
 * Default OG card for the landing page — the "What stage is your validator?"
 * hook with a mixed pizza and a STAGE ? hub, so viewers realise they don't
 * know their own answer. Rendered to public/og/landing.png at build time.
 */
export function landingOgSvg(
  displayHost: string = "validatorbeat.com",
): string {
  // Mixed, mostly-fine-with-one-red — "you're probably not as safe as you think".
  const colors: SliceColor[] = [
    "green",
    "yellow",
    "red",
    "green",
    "yellow",
    "green",
  ];

  return ogShell(`
  ${ogHeader(displayHost)}
  <text x="64" y="186" font-family="${FONT}" font-size="19" font-weight="600" fill="${OG_ACCENT}" letter-spacing="0.12em">THE STANDARD FOR ETHEREUM STAKING SECURITY</text>
  <text x="64" y="262" font-family="${FONT}" font-size="66" font-weight="700" fill="${OG_HEAD}">What stage is</text>
  <text x="64" y="340" font-family="${FONT}" font-size="66" font-weight="700" fill="${OG_HEAD}">your validator?</text>
  <text x="64" y="402" font-family="${FONT}" font-size="26" fill="${OG_SUB}"><tspan fill="${PIZZA_FILL.red}" font-weight="700">Stage 0</tspan> — one failure can slash it.</text>
  <text x="64" y="440" font-family="${FONT}" font-size="26" fill="${OG_SUB}"><tspan fill="${PIZZA_FILL.yellow}" font-weight="700">Stage 1</tspan> — one failure won't slash it.</text>
  <text x="64" y="478" font-family="${FONT}" font-size="26" fill="${OG_SUB}"><tspan fill="${PIZZA_FILL.green}" font-weight="700">Stage 2</tspan> — one failure won't cause an outage.</text>
  ${ogPulse(514)}
  ${ogCta(`Find your stage → ${displayHost}`, 578)}
  ${ogPizza({ colors, hubText: "?", hubTextColor: PIZZA_FILL.yellow, hubStroke: OG_HUB_IDLE_STROKE })}`);
}
