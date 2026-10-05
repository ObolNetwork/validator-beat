/**
 * Agent/LLM-facing static docs, built from the rubric, the questions, and the
 * shared methodology copy so they can never drift from the real scoring.
 * scripts/generate-agent-files.ts writes them into public/ before `next build`.
 */
import { DOWNTIME_CALCULATOR_URL, GITHUB_URL, SITE_URL, VALOS_URL } from "@constants/index";
import { QUESTIONS } from "@lib/assessment/questions";
import {
  ACTIVE_ACTIVE,
  BAND_MATH,
  CLIENT_DIVERSITY_NOTE,
  NOT_SURE,
  NUANCE_CASES,
  RULE_OF_THUMB,
  THREE_COLORS,
  UNSCORED,
} from "@lib/methodology/content";
import {
  COLORS,
  SLICES,
  STAGE_META,
  TIPS,
  allShareCodes,
  computeStage,
  decodeShareCode,
  sliceChoices,
  sliceTarget,
  slicesOfKind,
} from "@lib/rubric";
import type { SliceColor, SliceMeta } from "@lib/rubric";
import { SHARE_NAME_MAX } from "@lib/share/share-url";

const BASE = SITE_URL.replace(/\/$/, "");
const DOWNTIME_URL = DOWNTIME_CALCULATOR_URL.replace(/\/$/, "");
const EXAMPLE_CODE = "GYYGGY";

const SAFETY = slicesOfKind("safety").map((s) => s.label).join(", ");
const LIVENESS = slicesOfKind("liveness").map((s) => s.label).join(" and ");

const LETTER: Record<SliceColor, string> = { green: "G", yellow: "Y", red: "R", unknown: "U" };
const COLOR_NAME: Record<SliceColor, string> = {
  green: "Green",
  yellow: "Yellow",
  red: "Red",
  unknown: "Not sure",
};

const STAGE_RULES = [
  `**Stage 0 — ${STAGE_META[0].kind}**: a safety slice (${SAFETY}) is red or not sure. ${STAGE_META[0].tagline}.`,
  `**Stage 1 — ${STAGE_META[1].kind}**: every safety slice is green or yellow, but not all six are green. ${STAGE_META[1].tagline}.`,
  `**Stage 2 — ${STAGE_META[2].kind}**: all six slices green. ${STAGE_META[2].tagline}.`,
  ``,
  `Colors mean the same thing on every slice: red = one failure could get you slashed, yellow = one failure could take you offline (or a partial safety gap). ${LIVENESS} are liveness slices (green or yellow only) and block Stage 2 but not Stage 1. "Not sure" is treated as an open gap.`,
].join("\n");

/** e.g. "Key Custody green, Client Diversity yellow, … → Stage 1". */
function describeExample(): string {
  const answers = decodeShareCode(EXAMPLE_CODE) ?? {};
  const stage = computeStage(answers);
  const slices = SLICES.map((s) => `${s.label} ${COLOR_NAME[answers[s.id] ?? COLORS.unknown].toLowerCase()}`);
  return `${slices.join(", ")} → ${stage == null ? "no stage" : STAGE_META[stage].name}`;
}

export function llmsTxt(): string {
  const sliceLines = SLICES.map((s, i) => `${i + 1}. **${s.label}** — ${s.why}`).join("\n");

  return `# Validator Beat

> A free, client-side self-assessment that scores Ethereum validator setups **Stage 0, 1, or 2** across six single points of failure. Nothing is stored or sent to a server; results are shareable via six-letter codes. Built by Obol as a public good, in partnership with Lido.

Staking earns roughly 2% APR; slashing can take far more, and correlated failures are penalized super-linearly. Validator Beat makes a validator's resilience legible: six banded questions, each mapping to a green/yellow/red (or "not sure") "pizza slice", rolling up to one Stage.

## Stages

${STAGE_RULES}

## The six slices (in canonical order)

${sliceLines}

The infrastructure slices (provider, OS, CPU, geography) assume the validator runs active/active — several cooperating nodes backing the same stake, with key shares split across them — so diversity translates into uptime and key safety, not just redundancy.

## Share codes

A result is encoded as six letters, one per slice in the order above: \`G\` (green), \`Y\` (yellow), \`R\` (red), or \`U\` (not sure). OS and CPU have no yellow band; Provider and Geography have no red band. Example: \`${BASE}/${EXAMPLE_CODE}\` — a stable URL with an Open Graph preview card and a README badge at \`${BASE}/badge/${EXAMPLE_CODE}.svg\`. All ${allShareCodes().length} valid combinations exist as static pages.

## Docs

- [Full reference](${BASE}/llms-full.txt): every question, answer band, stage rule, and methodology nuance in one file
- [Methodology](${BASE}/methodology/): scoring rules, the active/active assumption, nuances and limits
- [Take the assessment](${BASE}/assess/): six questions, ~60 seconds, runs in the browser
- [Agent skill](${BASE}/skill.md): how an AI agent can run this assessment conversationally
- [Source code](${GITHUB_URL}): Apache-2.0; the scoring rubric lives in \`lib/rubric\`

## Related

- [Validator Downtime](${DOWNTIME_URL}/) ([llms.txt](${DOWNTIME_URL}/llms.txt)): what correlated downtime would cost under EIP-7716
`;
}

/** What a slice answer means for the operator's stage. */
function bandEffect(slice: SliceMeta, color: SliceColor): string {
  const target = sliceTarget(slice, color);
  if (target == null) return "No gap on this slice.";
  return `Holds the result below ${STAGE_META[target].name}.`;
}

function bandLines(slice: SliceMeta): string {
  const q = QUESTIONS[slice.id];
  return sliceChoices(slice)
    .map((color) => {
      const head = `- **${COLOR_NAME[color]} (\`${LETTER[color]}\`)**`;
      const option = q.options.find((o) => o.color === color);
      const answer =
        color === COLORS.unknown
          ? "The operator can't say. Treated as an open gap."
          : `${option?.label}. ${option?.sub}`;
      const tip = color === COLORS.green ? null : TIPS[slice.id][color];
      const next = tip ? ` ${color === COLORS.unknown ? "How to find out" : "How to fix"}: ${tip}` : "";
      return `${head} — ${answer} ${bandEffect(slice, color)}${next}`;
    })
    .join("\n");
}

function sliceSection(slice: SliceMeta, i: number): string {
  const q = QUESTIONS[slice.id];
  const kind =
    slice.kind === "safety"
      ? "Safety slice: red or not sure holds the result at Stage 0."
      : "Liveness slice: it only stands between the result and Stage 2.";
  const refs = (q.references ?? []).map((r) => `- [${r.label}](${r.url})`).join("\n");
  return [
    `### ${i + 1}. ${slice.label} (\`${slice.id}\`, share-code position ${i + 1})`,
    "",
    `${kind} Bands offered: ${slice.bands.map((b) => COLOR_NAME[b].toLowerCase()).join(", ")}, plus not sure.`,
    "",
    `**Why it matters:** ${slice.why}`,
    "",
    `**Question:** ${q.q}`,
    "",
    `**Guidance:** ${q.helper}`,
    "",
    "**Answers:**",
    "",
    bandLines(slice),
    ...(q.risk ? ["", `**Real-world risk:** ${q.risk}`] : []),
    ...(refs ? ["", "**References:**", "", refs] : []),
  ].join("\n");
}

export function llmsFullTxt(): string {
  const codes = allShareCodes();
  const positions = SLICES.map(
    (s, i) => `${i + 1}. ${s.label}: ${sliceChoices(s).map((c) => LETTER[c]).join(", ")}`,
  ).join("\n");

  return `# Validator Beat — full reference

> A free, client-side self-assessment that scores Ethereum validator setups **Stage 0, 1, or 2** across six single points of failure. Six banded questions, each mapping to a green/yellow/red (or "not sure") slice, roll up to one Stage. Nothing is stored or sent to a server. Built by Obol as a public good, in partnership with Lido (the stewards of ValOS).

This file is the whole site in one document, generated from the scoring code at build time. Site: ${BASE}/ · Short summary: ${BASE}/llms.txt · Agent skill for running the assessment conversationally: ${BASE}/skill.md · Source: ${GITHUB_URL} (Apache-2.0; scoring lives in \`lib/rubric\`).

## Stages

${STAGE_RULES}

### Exact scoring rules

The stage is computed in \`computeStage\` (\`lib/rubric/index.ts\`), in this order:

1. If any of the six slices is unanswered, there is no stage.
2. If any **safety** slice (${SAFETY}) is red or not sure, the result is **Stage 0**.
3. Otherwise, if all six slices are green, the result is **Stage 2**.
4. Otherwise the result is **Stage 1**.

So yellow on a safety slice still allows Stage 1, and any yellow or not-sure on a **liveness** slice (${LIVENESS}) only blocks Stage 2. The answer the operator picks *is* the slice color; there is no separate calculation.

Band exceptions: Key Custody and Client Diversity offer green, yellow and red. OS Diversity and CPU Architecture offer only green or red (no yellow), because the only question is whether one OS or architecture holds enough key shares to sign. Provider Diversity and Geographic Diversity offer only green or yellow (no red), because the worst they can do is take the validator offline. Every slice also offers "not sure".

${NOT_SURE}

${BAND_MATH}

${CLIENT_DIVERSITY_NOTE}

**Rule of thumb:** ${RULE_OF_THUMB}

## The six slices

Ordered worst-failure-first. This order is also the share-code order.

${SLICES.map(sliceSection).join("\n\n")}

## The active/active assumption

${ACTIVE_ACTIVE}

## Nuances and limits

${THREE_COLORS}

Known cases the questions don't spell out:

${NUANCE_CASES.map((n) => `- **${n.title}.** ${n.body}`).join("\n")}

What the assessment deliberately doesn't score:

${UNSCORED.map((u) => `- **${u.title}.** ${u.body}`).join("\n")}

This is a self-assessment: a result reflects the operator's own answers, not verified facts.

## Why correlation matters

Ethereum already penalizes correlated slashing super-linearly: on top of the initial penalty, each slashed validator loses a share of its balance proportional to three times the fraction of total stake slashed around the same time, capped at the whole balance (\`PROPORTIONAL_SLASHING_MULTIPLIER_BELLATRIX = 3\` in the consensus specs: https://github.com/ethereum/consensus-specs/blob/master/specs/bellatrix/beacon-chain.md). Correlated downtime isn't penalized that way today. EIP-7716 ("Anti-correlation attestation penalties", https://eips.ethereum.org/EIPS/eip-7716) is a Draft, proposed for inclusion in the Hegotá upgrade (https://forkcast.org/eips/7716), that would scale missed-attestation penalties with how many validators miss together: validators that fail alone would pay what they pay today, and correlated failures would pay more. The Provider and Geography slices decide whether a validator fails alone or with a crowd. The EIP-7716 downtime calculator (${DOWNTIME_URL}/) shows the numbers.

## Share codes

A result is encoded as six letters, one per slice in canonical order: \`G\` (green), \`Y\` (yellow), \`R\` (red), \`U\` (not sure). Each position only accepts the bands its slice offers:

${positions}

That gives ${codes.length} valid codes, and every one exists as a static page at \`${BASE}/<CODE>/\` with an Open Graph preview card at \`${BASE}/og/<CODE>.png\` and a README badge at \`${BASE}/badge/<CODE>.svg\`. Codes that use a band a slice doesn't offer (e.g. \`Y\` for OS) are invalid.

Example: \`${EXAMPLE_CODE}\` = ${describeExample()}. Link: ${BASE}/${EXAMPLE_CODE}/ · Badge: \`[![Validator Beat](${BASE}/badge/${EXAMPLE_CODE}.svg)](${BASE}/${EXAMPLE_CODE}/)\`

Optional query parameters: \`?n=<name>\` names the result (max ${SHARE_NAME_MAX} characters, URL-encoded); \`&vs=<CODE>&vn=<name>\` shows it head-to-head against another result.

## Related

- [Validator Downtime](${DOWNTIME_URL}/) ([llms.txt](${DOWNTIME_URL}/llms.txt)): what correlated downtime would cost under EIP-7716. Client Diversity is the safety side of the same story: a supermajority-client bug is either mass slashing or, with refuse-to-attest, correlated downtime.
- [ValOS — the Validator Operations Standard](${VALOS_URL}): the risk-and-mitigation catalog each question links into.
- [clientdiversity.org](https://clientdiversity.org/): live network share for each execution and consensus client.
- [Obol docs](https://docs.obol.org/): distributed validators, Charon, and chain-split safety settings.
`;
}

export function skillMd(): string {
  const questions = SLICES.map((s, i) => {
    const q = QUESTIONS[s.id];
    const options = [
      ...q.options.map((o) => `   - **${o.color.toUpperCase()}** — ${o.label}. ${o.sub}`),
      "   - **NOT SURE** — the user can't say. Treated as an open gap.",
    ].join("\n");
    return `${i + 1}. **${s.label}** (\`${s.id}\`)\n   Ask: "${q.q}"\n${options}`;
  }).join("\n\n");

  return `---
name: validator-beat-assessment
description: Assess the resilience of an Ethereum validator setup by asking six questions, then give the operator their Stage (0, 1, or 2) and a shareable Validator Beat link.
---

# Validator Beat assessment

You can score any Ethereum validator setup the same way ${BASE} does. Ask the six questions below, map each answer to a color, compute the Stage, and construct a share URL. The scoring is fully deterministic — no API needed. For each slice's rationale, remediation tips, and the methodology's nuances, read ${BASE}/llms-full.txt.

## The six questions (canonical order — this order defines the share code)

${questions}

## Scoring

Each answer is exactly one of the listed options, or "not sure". If the user's setup falls between two answers, pick the worse one when the gray area hides a single point of failure. If they can't answer, use "not sure" rather than guessing.

${STAGE_RULES}

## Share URL

Map each answer to a letter — G (green), Y (yellow), R (red), U (not sure) — in question order to form a six-letter code, then link to \`${BASE}/<CODE>\` — e.g. answers green, yellow, yellow, green, green, yellow → \`${BASE}/${EXAMPLE_CODE}\`. Optionally append \`?n=<name>\` (max ${SHARE_NAME_MAX} chars, URL-encoded) to name the result, and \`&vs=<CODE>&vn=<name>\` to show it head-to-head against another result.

Every code resolves to a static page with an Open Graph preview card, so the link unfurls with the result pizza in chat apps and social feeds.

## Caveats to relay

- This is a self-assessment: it reflects the operator's answers, not verified facts.
- The infrastructure slices (provider, OS, CPU, geography) assume an active/active setup — several cooperating nodes backing the same stake. Active/passive failover makes Provider and Geography yellow.
- Full nuances: ${BASE}/methodology/#nuances, or all of it in one file: ${BASE}/llms-full.txt
`;
}

/** Core pages plus the agent docs. Share pages are deliberately left out. */
export function sitemapXml(): string {
  const entries: [string, string, string][] = [
    ["/", "weekly", "1.0"],
    ["/assess/", "weekly", "0.9"],
    ["/methodology/", "monthly", "0.8"],
    ["/llms.txt", "monthly", "0.5"],
    ["/llms-full.txt", "monthly", "0.5"],
    ["/skill.md", "monthly", "0.5"],
  ];
  const urls = entries
    .map(
      ([p, freq, prio]) =>
        `  <url>\n    <loc>${BASE}${p}</loc>\n    <changefreq>${freq}</changefreq>\n    <priority>${prio}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by scripts/generate-agent-files.ts. Core pages and agent docs
     only. The share pages (/GYYGGY etc.) are deliberately omitted: they're
     crawlable for unfurls but are result permutations, not content we want
     competing in search. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function robotsTxt(): string {
  return `# Validator Beat — everything is public. Share pages (/GYRYGG etc.) are
# intentionally crawlable so link unfurls work everywhere.
# Generated by scripts/generate-agent-files.ts.
User-agent: *
Allow: /

Sitemap: ${BASE}/sitemap.xml

# LLM/agent-facing docs
# ${BASE}/llms.txt
# ${BASE}/llms-full.txt
# ${BASE}/skill.md
`;
}
