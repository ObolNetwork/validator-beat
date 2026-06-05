import type { Answers, SliceColor, SliceId, SliceMeta, Stage } from "./types";
import { COLORS } from "./types";

export { COLORS } from "./types";
export type { Answers, SliceColor, SliceId, SliceMeta, Stage } from "./types";

export const RUBRIC_VERSION = "0.1";

export const SLICES: SliceMeta[] = [
  {
    id: "keyCustody",
    label: "Key Custody",
    short: "Keys",
    why: "Concentrated signing material is a single point of failure — one compromise can sign with your stake.",
  },
  {
    id: "clientDiversity",
    label: "Client Diversity",
    short: "Clients",
    why: "A supermajority-client bug can slash a single-client setup; refusing to attest on disagreement turns that into mere downtime.",
  },
  {
    id: "infraDiversity",
    label: "Infrastructure",
    short: "Infra",
    why: "One hosting provider's outage or compromise takes every validator hosted there with it.",
  },
  {
    id: "osDiversity",
    label: "OS Diversity",
    short: "OS",
    why: "An OS monoculture is a supply-chain risk: one poisoned build pipeline can backdoor the whole fleet.",
  },
  {
    id: "cpuDiversity",
    label: "CPU Architecture",
    short: "CPU",
    why: "A CPU-architecture monoculture is a hardware-level supply-chain and side-channel risk.",
  },
  {
    id: "geoDiversity",
    label: "Geographic",
    short: "Geo",
    why: "All validators in one jurisdiction can be hit by a single sovereign action, outage, or regulation.",
  },
];

export const TIPS: Record<SliceId, { red: string; yellow: string }> = {
  keyCustody: {
    red: "Split signing so no single party controls more than ⅔ — move to threshold signing and split your backup mnemonic across 2+ parties.",
    yellow:
      "Distribute signing across 3+ independent parties (multi-operator DVT or distributed MPC), backups included, so no one party controls more than ⅓.",
  },
  clientDiversity: {
    red: "Run 3+ independent clients with a refuse-to-attest-on-disagreement setup (multi-operator DVT or a Vero-style multiplexer).",
    yellow:
      "Add at least one minority client so your combined client share stays under ⅔ of the network.",
  },
  infraDiversity: {
    red: "Move enough validators off your largest provider to get its share under ⅔.",
    yellow:
      "Spread hosting so no provider holds more than ⅓ (add providers or self-host a portion).",
  },
  osDiversity: {
    red: "Run a second OS distro across part of your fleet (e.g. add Debian or NixOS next to Ubuntu).",
    yellow:
      "Run a third distinct distro so one distro's supply-chain compromise can't hit the whole fleet.",
  },
  cpuDiversity: {
    red: "Add ARM64 hardware (Apple Silicon, AWS Graviton, Ampere) next to your x86-64 nodes.",
    yellow:
      "Add a third ISA (RISC-V) once viable — aspirational for nearly all operators today.",
  },
  geoDiversity: {
    red: "Move enough validators to a second country/region so no single one holds more than ⅔.",
    yellow: "Spread across regions so no single country/region holds more than ⅓.",
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
