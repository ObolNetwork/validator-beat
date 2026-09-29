import type { Answers, SliceColor, SliceId, SliceKind, SliceMeta, Stage, StageMeta } from "./types";
import { COLORS } from "./types";

export { COLORS } from "./types";
export type { Answers, SliceColor, SliceId, SliceKind, SliceMeta, Stage, StageMeta } from "./types";

export const RUBRIC_VERSION = "0.2";

/**
 * Colors carry one meaning everywhere: red = one failure could get you slashed,
 * yellow = one failure could take you offline (or a partial safety gap).
 * So the yes/no safety slices are green/red and the liveness slices green/yellow.
 */
const THREE_BANDS = [COLORS.green, COLORS.yellow, COLORS.red] as const;
const SAFETY_BANDS = [COLORS.green, COLORS.red] as const;
const LIVENESS_BANDS = [COLORS.green, COLORS.yellow] as const;

export const SLICES: SliceMeta[] = [
  {
    id: "keyCustody",
    label: "Key Custody",
    short: "Keys",
    kind: "safety",
    bands: THREE_BANDS,
    why: "Concentrated private keys are a single point of failure — one compromise lets an attacker sign slashable messages with your entire stake.",
  },
  {
    id: "clientDiversity",
    label: "Client Diversity",
    short: "Clients",
    kind: "safety",
    bands: THREE_BANDS,
    why: "If a supermajority client forks onto a wrong chain, validators that follow it face mass correlated slashing; refusing to attest on disagreement turns that into mere downtime.",
  },
  {
    id: "infraDiversity",
    label: "Provider Diversity",
    short: "Provider",
    kind: "liveness",
    bands: LIVENESS_BANDS,
    why: "One hosting provider's outage or compromise can take every validator hosted there with it.",
  },
  {
    id: "osDiversity",
    label: "OS Diversity",
    short: "OS",
    kind: "safety",
    bands: SAFETY_BANDS,
    why: "An OS monoculture is a supply-chain risk: one poisoned update or zero-day could reach every node — and every key — at once.",
  },
  {
    id: "cpuDiversity",
    label: "CPU Architecture",
    short: "CPU",
    kind: "safety",
    bands: SAFETY_BANDS,
    why: "A CPU-architecture monoculture is a hardware-level supply-chain and side-channel risk — one flaw can reach keys on every machine you run.",
  },
  {
    id: "geoDiversity",
    label: "Geographic Diversity",
    short: "Geo",
    kind: "liveness",
    bands: LIVENESS_BANDS,
    why: "Nodes concentrated in one country or region share exposure to grid failures, natural disasters, and local policy shifts.",
  },
];

/**
 * Canonical stage naming and taglines. Every surface that names a stage
 * (results, ladder, landing, share cards, OG images) should read from here
 * so the Stage 0/1/2 vocabulary stays identical everywhere.
 */
export const STAGE_META: Record<Stage, StageMeta> = {
  0: {
    name: "Stage 0",
    kind: "Getting started",
    tagline: "One failure could get you slashed",
    shareLine: "One failure could still get it slashed — for now.",
    tone: COLORS.red,
  },
  1: {
    name: "Stage 1",
    kind: "Safety",
    tagline: "No single failure can get you slashed",
    shareLine: "Safe from slashing — no single failure can get it slashed.",
    tone: COLORS.yellow,
  },
  2: {
    name: "Stage 2",
    kind: "Liveness",
    tagline: "No single failure can take you offline",
    shareLine: "Maximum resilience — no single failure can slash it or stop it.",
    tone: COLORS.green,
  },
};

export const TIPS: Record<SliceId, { red?: string; yellow?: string; unknown: string }> = {
  keyCustody: {
    red: "Split your keys so no single party ever holds a signing threshold — use distributed key generation, split backup mnemonics across 2+ parties, and sign through a multi-node setup (Dirk, Web3Signer, or a distributed validator).",
    yellow:
      "Distribute signing across 3+ independent parties (multi-operator DVT or distributed remote signers), backups included, so no single party holds more than ⅓ and losing any one of them doesn't threaten liveness.",
    unknown:
      "Map every place key material lives — each signer, remote signer, backup, mnemonic, and custodian — and who can reach it. Until you can, assume one of them holds everything.",
  },
  clientDiversity: {
    red: "Run 3+ independent clients with a refuse-to-attest-on-disagreement setup (multi-operator DVT or a Vero/Vouch-style multiplexer).",
    yellow:
      "Add at least one minority execution or consensus client so your combined client share stays under ⅔ of the network.",
    unknown:
      "Check which execution and consensus clients each node runs, and whether your stack halts when they disagree. Then compare against clientdiversity.org.",
  },
  infraDiversity: {
    yellow:
      "Spread hosting so no provider backs more than ⅓ of your active/active nodes — add providers or self-host a portion.",
    unknown:
      "List the provider behind every node that backs your stake (home and bare metal count as their own) and work out the largest share.",
  },
  osDiversity: {
    red: "Run a second, unrelated distro (e.g. Fedora or NixOS alongside Ubuntu) and spread key shares so no single OS holds enough of them to sign.",
    unknown:
      "Inventory the distro on every machine that holds key shares or signs, and count how many shares each distro holds.",
  },
  cpuDiversity: {
    red: "Split your nodes across x86-64 and ARM64 hardware (Apple Silicon, AWS Graviton, Ampere) so no single architecture holds enough key shares to sign.",
    unknown:
      "Run `uname -m` on every machine that holds key shares or signs, and count how many shares each architecture holds.",
  },
  geoDiversity: {
    yellow:
      "Spread nodes across three or more countries or regions so none backs more than ⅓ of your setup, and one local disaster or outage can't take your validator offline.",
    unknown:
      "List the country each node physically runs in — your cloud console shows the region — and work out the largest share.",
  },
};

export function sliceColor(answers: Answers, id: SliceId): SliceColor | null {
  return answers[id] ?? null;
}

export function allAnswered(answers: Answers): boolean {
  return SLICES.every((s) => !!sliceColor(answers, s.id));
}

export function colorsArray(answers: Answers): (SliceColor | null)[] {
  return SLICES.map((s) => sliceColor(answers, s.id));
}

/** Red and "not sure" both leave a single point of failure open. */
export function isOpen(color: SliceColor | null | undefined): boolean {
  return color === COLORS.red || color === COLORS.unknown;
}

/** Slices of one kind, in canonical order. */
export function slicesOfKind(kind: SliceKind): SliceMeta[] {
  return SLICES.filter((s) => s.kind === kind);
}

/**
 * Stage 0 = a safety slice is red or not sure (one failure could slash you)
 * Stage 1 = every safety slice is clear, but not all six green
 * Stage 2 = all six green (no single failure can slash you or take you offline)
 */
export function computeStage(answers: Answers): Stage | null {
  if (!allAnswered(answers)) return null;
  if (slicesOfKind("safety").some((s) => isOpen(answers[s.id]))) return 0;
  if (SLICES.every((s) => answers[s.id] === COLORS.green)) return 2;
  return 1;
}

/** The stage a slice's current answer is holding you back from, or null if it's maxed. */
export function sliceTarget(slice: SliceMeta, color: SliceColor | null | undefined): Stage | null {
  if (!color || color === COLORS.green) return null;
  return slice.kind === "safety" && isOpen(color) ? 1 : 2;
}

/** Slices standing between the current stage and the next one. */
export function blockers(answers: Answers): SliceMeta[] {
  const stage = computeStage(answers);
  if (stage == null || stage === 2) return [];
  const next = (stage + 1) as Stage;
  return SLICES.filter((s) => sliceTarget(s, answers[s.id]) === next);
}

export function getTip(sliceId: SliceId, color: SliceColor): string | null {
  if (color === COLORS.green) return null;
  return TIPS[sliceId]?.[color] ?? null;
}

const CODE_LETTER: Record<SliceColor, string> = {
  green: "G",
  yellow: "Y",
  red: "R",
  unknown: "U",
};

const LETTER_COLOR: Record<string, SliceColor> = Object.fromEntries(
  Object.entries(CODE_LETTER).map(([color, letter]) => [letter, color as SliceColor]),
);

/** Answers a slice can hold: its banded options plus "not sure". */
export function sliceChoices(slice: SliceMeta): SliceColor[] {
  return [...slice.bands, COLORS.unknown];
}

/** Six-letter share code, e.g. GYRUGG — one letter per slice in SLICES order. */
export function shareCode(answers: Answers): string {
  return colorsArray(answers)
    .map((c) => (c ? CODE_LETTER[c] : "_"))
    .join("");
}

/** Decode a complete share code; rejects answers a slice's question can't produce. */
export function decodeShareCode(code: string): Answers | null {
  if (code.length !== SLICES.length) return null;
  const answers: Answers = {};
  for (let i = 0; i < SLICES.length; i++) {
    const color = LETTER_COLOR[code[i]];
    if (!color || !sliceChoices(SLICES[i]).includes(color)) return null;
    answers[SLICES[i].id] = color;
  }
  return answers;
}

/** Every valid share code — one static share page and OG image each. */
export function allShareCodes(): string[] {
  return SLICES.reduce<string[]>(
    (prefixes, slice) =>
      prefixes.flatMap((p) => sliceChoices(slice).map((c) => p + CODE_LETTER[c])),
    [""],
  );
}
