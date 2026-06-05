import type { SliceColor, SliceId } from "@lib/rubric/types";

export type QuestionOption = {
  color: SliceColor;
  label: string;
  sub: string;
};

export type Question = {
  q: string;
  helper: string;
  options: QuestionOption[];
};

export const QUESTIONS: Record<SliceId, Question> = {
  keyCustody: {
    q: "What's the largest share of your signing power that any one party controls — counting key backups the same as live keys?",
    helper:
      "A “party” is one machine, team, or person. With threshold signing, a party needs more than ⅔ of the key shares to sign on its own.",
    options: [
      {
        color: "green",
        label: "No more than ⅓",
        sub: "Signing needs at least 3 independent parties to agree — no single compromise can sign.",
      },
      {
        color: "yellow",
        label: "Between ⅓ and ⅔",
        sub: "One party holds a meaningful share, but still can't sign on its own.",
      },
      {
        color: "red",
        label: "More than ⅔",
        sub: "One party can sign on your behalf, by itself.",
      },
    ],
  },
  clientDiversity: {
    q: "How protected are you from a buggy client signing the wrong chain and getting you slashed?",
    helper:
      "“Refuse-to-attest” means your setup won't sign when its clients disagree, so a single client bug becomes downtime, not a slashing — via multi-operator DVT, a multiplexer like Vero, or a similar setup.",
    options: [
      {
        color: "green",
        label: "3+ independent clients, refuse-to-attest, plus a minority client",
        sub: "Your combined client share stays under ⅔ — a supermajority-client bug can't slash you.",
      },
      {
        color: "yellow",
        label: "3+ independent clients that refuse to attest when they disagree",
        sub: "Safe from a single-client bug, but you're not adding minority-client share to the network.",
      },
      {
        color: "red",
        label: "A single client, or no refuse-to-attest safeguard",
        sub: "A supermajority-client bug could drag you into signing the wrong chain.",
      },
    ],
  },
  infraDiversity: {
    q: "Across the nodes that run your validators, what's the largest share on a single hosting provider?",
    helper:
      "Diversity only buys uptime if your validator keeps signing when some nodes drop — i.e. it runs as a distributed validator (DVT) or behind a multiplexer. Count each cloud (AWS, Hetzner…) and “home / bare-metal” as its own provider.",
    options: [
      {
        color: "green",
        label: "Less than 33%",
        sub: "No single provider's outage can take your validator offline.",
      },
      {
        color: "yellow",
        label: "33% to 66%",
        sub: "One provider going down would drop a large share of your nodes.",
      },
      {
        color: "red",
        label: "More than 66%",
        sub: "One provider going down takes your validator offline.",
      },
    ],
  },
  osDiversity: {
    q: "How many distinct operating systems run across those nodes?",
    helper:
      "Distinct Linux/Unix distributions — Ubuntu, Debian, Arch, NixOS, macOS, etc.",
    options: [
      {
        color: "green",
        label: "3 or more",
        sub: "No single OS bug or bad update can stop your validator. e.g. Ubuntu + Arch + NixOS.",
      },
      {
        color: "yellow",
        label: "2 distinct distros",
        sub: "e.g. Ubuntu + macOS.",
      },
      {
        color: "red",
        label: "1 — everything on one OS",
        sub: "e.g. 100% Ubuntu LTS.",
      },
    ],
  },
  cpuDiversity: {
    q: "How many distinct CPU architectures run across those nodes?",
    helper:
      "The instruction set the chip speaks — x86-64, ARM64, RISC-V — not the chip model. RISC-V is barely available today, so a third architecture is frontier for almost everyone.",
    options: [
      {
        color: "green",
        label: "3 or more architectures",
        sub: "x86-64 + ARM64 + RISC-V — aspirational today.",
      },
      {
        color: "yellow",
        label: "2 architectures",
        sub: "typically x86-64 + ARM64.",
      },
      {
        color: "red",
        label: "1 architecture",
        sub: "typically 100% x86-64.",
      },
    ],
  },
  geoDiversity: {
    q: "What's the largest share of those nodes in a single country or legal jurisdiction?",
    helper:
      "Where the nodes physically run — grouped by country or jurisdiction, not data-centre.",
    options: [
      {
        color: "green",
        label: "Less than 33%",
        sub: "No single jurisdiction can take your validator offline or compel you to censor.",
      },
      {
        color: "yellow",
        label: "33% to 66%",
        sub: "A large share of your nodes sit in one jurisdiction.",
      },
      {
        color: "red",
        label: "More than 66%",
        sub: "One ruling or regional outage could take your validator offline.",
      },
    ],
  },
};
