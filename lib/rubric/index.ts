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
    why: "Concentrated private keys are a single point of failure — one compromise and an attacker can sign to slash your stake.",
  },
  {
    id: "clientDiversity",
    label: "Client Diversity",
    short: "Clients",
    why: "A supermajority-client bug can cause you to lose 100% of funds; refusing to attest during a chain split turns that into mere downtime.",
  },
  {
    id: "infraDiversity",
    label: "Infrastructure",
    short: "Infra",
    why: "One hosting provider's outage or compromise can take every validator hosted there with it.",
  },
  {
    id: "osDiversity",
    label: "OS Diversity",
    short: "OS",
    why: "An OS monoculture is a supply-chain risk: one backdoor or zero-day could jeopardise a huge amount of validators.",
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
    why: "A validator fully in one country or region can be impacted by a natural or man-made disaster.",
  },
];

export const TIPS: Record<SliceId, { red: string; yellow: string }> = {
  keyCustody: {
    red: "Split the private keys so no single entity custodies it in full — use distributed key generation or split your backup mnemonic across 2+ parties, and run the validator private keys across multi-node setups (Dirk, Web3Signer, Distributed Validators).",
    yellow:
      "Distribute signing across 3+ independent parties (multi-operator DVT or distributed remote-signers), backups included, so no one party controls more than ⅓, and a failure of one won't introduce a liveness risk.",
  },
  clientDiversity: {
    red: "Run 3+ independent clients with a refuse-to-attest-on-disagreement setup (multi-operator DVT or a Vero/Vouch-style multiplexer).",
    yellow:
      "Add at least one minority client so your combined client share stays under ⅔ of the network.",
  },
  infraDiversity: {
    red: "Move enough validators off your largest provider to get its share under ⅔.",
    yellow:
      "Spread hosting so no provider holds more than ⅓ of your active/active setup(add providers or self-host a portion).",
  },
  osDiversity: {
    red: "Run a second operating system distro across your multi-node validator (e.g. add Debian or NixOS next to Ubuntu) to ensure a compromised distro won't expose your private keys.",
    yellow:
      "Run a third distinct distro so one distro's supply-chain compromise can't cause a liveness failure if enough partial keys have leaked to break your validator's consensus.",
  },
  cpuDiversity: {
    red: "Run your validator across ARM64 hardware (Apple Silicon, AWS Graviton, Ampere) and x86-64 machines.",
    yellow:
      "Add a third ISA (RISC-V) once viable — aspirational for nearly all setups today.",
  },
  geoDiversity: {
    red: "Run your validator across a second country/region to reduce your risk exposure.",
    yellow: "Run your validator across several regions so no single country/region runs more than ⅓ of machines and can cause a liveness outage.",
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
