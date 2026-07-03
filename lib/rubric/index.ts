import type { Answers, SliceColor, SliceId, SliceMeta, Stage, StageMeta } from "./types";
import { COLORS } from "./types";

export { COLORS } from "./types";
export type { Answers, SliceColor, SliceId, SliceMeta, Stage, StageMeta } from "./types";

export const RUBRIC_VERSION = "0.1";

export const SLICES: SliceMeta[] = [
  {
    id: "keyCustody",
    label: "Key Custody",
    short: "Keys",
    why: "Concentrated private keys are a single point of failure — one compromise lets an attacker sign slashable messages with your entire stake.",
  },
  {
    id: "clientDiversity",
    label: "Client Diversity",
    short: "Clients",
    why: "If a supermajority client forks onto a wrong chain, validators that follow it face mass correlated slashing; refusing to attest on disagreement turns that into mere downtime.",
  },
  {
    id: "infraDiversity",
    label: "Provider Diversity",
    short: "Provider",
    why: "One hosting provider's outage or compromise can take every validator hosted there with it.",
  },
  {
    id: "osDiversity",
    label: "OS Diversity",
    short: "OS",
    why: "An OS monoculture is a supply-chain risk: one poisoned update or zero-day could reach every node — and every key — at once.",
  },
  {
    id: "cpuDiversity",
    label: "CPU Architecture",
    short: "CPU",
    why: "A CPU-architecture monoculture is a hardware-level supply-chain and side-channel risk — one flaw can reach keys on every machine you run.",
  },
  {
    id: "geoDiversity",
    label: "Geographic Diversity",
    short: "Geo",
    why: "Nodes concentrated in one country or region share exposure to grid failures, natural disasters, and local policy shifts.",
  },
];

/**
 * Canonical stage naming and taglines. Every surface that names a stage
 * (results, ladder, landing, OG images) should read from here so the
 * Stage 0/1/2 vocabulary stays identical everywhere.
 */
export const STAGE_META: Record<Stage, StageMeta> = {
  0: {
    name: "Stage 0",
    kind: "Getting started",
    tagline: "Has a single point of failure",
    tone: COLORS.red,
  },
  1: {
    name: "Stage 1",
    kind: "Safety",
    tagline: "No single failure can get you slashed",
    tone: COLORS.yellow,
  },
  2: {
    name: "Stage 2",
    kind: "Liveness",
    tagline: "No single failure can take you offline",
    tone: COLORS.green,
  },
};

export const TIPS: Record<SliceId, { red: string; yellow: string }> = {
  keyCustody: {
    red: "Split your keys so no single party ever holds them in full — use distributed key generation, split backup mnemonics across 2+ parties, and sign through a multi-node setup (Dirk, Web3Signer, or a distributed validator).",
    yellow:
      "Distribute signing across 3+ independent parties (multi-operator DVT or distributed remote signers), backups included, so no single party controls more than ⅓ and losing any one of them doesn't threaten liveness.",
  },
  clientDiversity: {
    red: "Run 3+ independent clients with a refuse-to-attest-on-disagreement setup (multi-operator DVT or a Vero/Vouch-style multiplexer).",
    yellow:
      "Add at least one minority client so your combined client share stays under ⅔ of the network.",
  },
  infraDiversity: {
    red: "Move enough nodes off your largest provider to bring its share under ⅔.",
    yellow:
      "Spread hosting so no provider backs more than ⅓ of your active/active nodes — add providers or self-host a portion.",
  },
  osDiversity: {
    red: "Run a second, unrelated distro across your nodes (e.g. Debian or NixOS alongside Ubuntu) so one compromised OS supply chain can't reach all of your signing material.",
    yellow:
      "Add a third distinct distro so a single OS compromise can't threaten your validator's liveness either.",
  },
  cpuDiversity: {
    red: "Split your nodes across x86-64 and ARM64 hardware (Apple Silicon, AWS Graviton, Ampere) so one architecture-level flaw can't reach every key.",
    yellow:
      "Add a third ISA (RISC-V) once viable — aspirational for nearly all setups today.",
  },
  geoDiversity: {
    red: "Add nodes in a second country or region so one local disaster or outage can't take your validator offline.",
    yellow:
      "Spread nodes across several regions so no single country or region backs more than ⅓ of your setup.",
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

/** Stage 0 = any red · 1 = no reds · 2 = all green */
export function computeStage(answers: Answers): Stage | null {
  const cols = colorsArray(answers);
  if (cols.some((c) => c == null)) return null;
  if (cols.some((c) => c === COLORS.red)) return 0;
  if (cols.every((c) => c === COLORS.green)) return 2;
  return 1;
}

export function blockers(answers: Answers): SliceMeta[] {
  const cols = colorsArray(answers);
  if (cols.some((c) => c == null)) return [];
  const reds = SLICES.filter((s) => answers[s.id] === COLORS.red);
  if (reds.length) return reds;
  return SLICES.filter((s) => answers[s.id] !== COLORS.green);
}

export function getTip(sliceId: SliceId, color: SliceColor): string | null {
  if (color === COLORS.green) return null;
  return TIPS[sliceId]?.[color] ?? null;
}

/** Six-letter share code, e.g. GYRYGG */
export function shareCode(answers: Answers): string {
  const map: Record<SliceColor, string> = {
    green: "G",
    yellow: "Y",
    red: "R",
  };
  return colorsArray(answers)
    .map((c) => (c ? map[c] : "_"))
    .join("");
}

export function decodeShareCode(code: string): Answers | null {
  if (!/^[GYR_]{6}$/.test(code)) return null;
  const colorMap: Record<string, SliceColor> = {
    G: COLORS.green,
    Y: COLORS.yellow,
    R: COLORS.red,
  };
  const answers: Answers = {};
  SLICES.forEach((s, i) => {
    const ch = code[i];
    if (ch in colorMap) answers[s.id] = colorMap[ch];
  });
  return answers;
}
