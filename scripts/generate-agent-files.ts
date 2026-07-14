/**
 * Generates the agent/LLM-facing static docs from the rubric, so they can
 * never drift from the real questions and scoring:
 *
 *   public/llms.txt  — llmstxt.org site summary for LLM crawlers
 *   public/skill.md  — a self-contained guide for an AI agent to run the
 *                      assessment conversationally and emit a share link
 *
 * Runs before `next build` (see package.json `build`).
 */
import fs from "fs";
import path from "path";
import { QUESTIONS } from "../lib/assessment/questions";
import { SLICES, STAGE_META } from "../lib/rubric/index";

const PUB = path.join(__dirname, "..", "public");
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://validatorbeat.com";
const BASE = SITE_URL.replace(/\/$/, "");
const GITHUB_URL = "https://github.com/ObolNetwork/validator-beat";

const STAGE_RULES = [
  `**Stage 0 — ${STAGE_META[0].kind}**: at least one slice is red. ${STAGE_META[0].tagline}.`,
  `**Stage 1 — ${STAGE_META[1].kind}**: no red slices, but not all green. ${STAGE_META[1].tagline}.`,
  `**Stage 2 — ${STAGE_META[2].kind}**: all six slices green. ${STAGE_META[2].tagline}.`,
].join("\n");

function llmsTxt(): string {
  const sliceLines = SLICES.map(
    (s, i) => `${i + 1}. **${s.label}** — ${s.why}`,
  ).join("\n");

  return `# Validator Beat

> A free, client-side self-assessment that scores Ethereum validator setups **Stage 0, 1, or 2** across six single points of failure. Nothing is stored or sent to a server; results are shareable via six-letter codes. Built by Obol as a public good.

Staking earns roughly 2% APR; slashing can take far more, and correlated failures are penalized super-linearly. Validator Beat makes a validator's resilience legible: six banded questions, each mapping to a green/yellow/red "pizza slice", rolling up to one Stage.

## Stages

${STAGE_RULES}

## The six slices (in canonical order)

${sliceLines}

The four infrastructure slices (provider, OS, CPU, geography) assume the validator runs active/active — several cooperating nodes backing the same stake — so diversity translates into uptime, not just redundancy.

## Share codes

A result is encoded as six letters, one per slice in the order above, \`G\` (green), \`Y\` (yellow), or \`R\` (red). Example: \`${BASE}/GYRYGG\` — a stable URL with an Open Graph preview card. All 729 combinations exist as static pages.

## Docs

- [Methodology](${BASE}/methodology/): scoring rules, the active/active assumption, nuances and limits
- [Take the assessment](${BASE}/assess/): six questions, ~60 seconds, runs in the browser
- [Agent skill](${BASE}/skill.md): how an AI agent can run this assessment conversationally
- [Source code](${GITHUB_URL}): Apache-2.0; the scoring rubric lives in \`lib/rubric\`
`;
}

function skillMd(): string {
  const questions = SLICES.map((s, i) => {
    const q = QUESTIONS[s.id];
    const options = q.options
      .map((o) => `   - **${o.color.toUpperCase()}** — ${o.label}. ${o.sub}`)
      .join("\n");
    return `${i + 1}. **${s.label}** (\`${s.id}\`)\n   Ask: "${q.q}"\n${options}`;
  }).join("\n\n");

  return `---
name: validator-beat-assessment
description: Assess the resilience of an Ethereum validator setup by asking six questions, then give the operator their Stage (0, 1, or 2) and a shareable Validator Beat link.
---

# Validator Beat assessment

You can score any Ethereum validator setup the same way ${BASE} does. Ask the six questions below, map each answer to a color, compute the Stage, and construct a share URL. The scoring is fully deterministic — no API needed.

## The six questions (canonical order — this order defines the share code)

${questions}

## Scoring

Each answer is exactly one color: green, yellow, or red. If the user's setup falls between two answers, use yellow; if a gray area hides a single point of failure, use red.

${STAGE_RULES}

## Share URL

Concatenate the first letter of each color (G/Y/R) in question order to form a six-letter code, then link to \`${BASE}/<CODE>\` — e.g. answers green, yellow, red, yellow, green, green → \`${BASE}/GYRYGG\`. Optionally append \`?n=<name>\` (max 25 chars, URL-encoded) to attribute the result: \`${BASE}/GYRYGG?n=ExampleOp\`.

Every code resolves to a static page with an Open Graph preview card, so the link unfurls with the result pizza in chat apps and social feeds.

## Caveats to relay

- This is a self-assessment: it reflects the operator's answers, not verified facts.
- The four infrastructure slices (provider, OS, CPU, geography) assume an active/active setup — several cooperating nodes backing the same stake. Active/passive failover caps those slices at yellow.
- Full nuances: ${BASE}/methodology/#nuances
`;
}

fs.writeFileSync(path.join(PUB, "llms.txt"), llmsTxt());
fs.writeFileSync(path.join(PUB, "skill.md"), skillMd());
console.log(`Generated public/llms.txt and public/skill.md (base: ${BASE})`);
