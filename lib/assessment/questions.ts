import type { SliceColor, SliceId } from "@lib/rubric/types";

export type QuestionOption = {
  color: SliceColor;
  label: string;
  sub: string;
};

export type QuestionReference = {
  label: string;
  url: string;
};

export type Question = {
  q: string;
  helper: string;
  options: QuestionOption[];
  /** Anonymized real-world incident illustrating the risk this slice mitigates. */
  risk?: string;
  /** Useful external resources — tools, dashboards, security features. */
  references?: QuestionReference[];
};

export const QUESTIONS: Record<SliceId, Question> = {
  keyCustody: {
    q: "What's the largest share of your signing power that any single point of failure could control or compromise — counting key backups the same as live keys?",
    helper:
      "A “point of failure” is anywhere your signing power can converge: a person, a team, a machine, a custodian, or even one piece of software (an RCE bug in your validator client could leak whatever key material it holds). With threshold signing, no single compromise can sign unless it controls more than ⅔ of the shares.",
    options: [
      {
        color: "green",
        label: "No more than ⅓",
        sub: "Signing needs at least 3 independent components to converge — no single compromise can sign.",
      },
      {
        color: "yellow",
        label: "Between ⅓ and ⅔",
        sub: "One failure holds a meaningful share, but still can't sign on its own.",
      },
      {
        color: "red",
        label: "More than ⅔",
        sub: "A single failure can leak your private keys.",
      },
    ],
    risk: "A single key-management compromise once forced one large operator to preemptively exit roughly 10% of all Ethereum validators — billions of dollars of stake withdrawn, tens of millions of dollars in opportunity cost, as a precaution because no one could rule out that whole signing keys had been exposed. With threshold signing split across independent parties — for example a multi-operator distributed validator, or HA remote signers like Dirk or Web3Signer fronted by Vouch or Vero — no single compromise can reconstruct a usable key.",
    references: [
      { label: "VALOS: Key Custody Risk", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-risks-keys" },
      { label: "VALOS: Key Management", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-key-management" },
      { label: "VALOS: Signature Management", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-signature-management" },
      { label: "Obol docs — distributed validators", url: "https://docs.obol.org/" },
    ],
  },
  clientDiversity: {
    q: "If a consensus client developed a critical bug and forked onto an incorrect chain, what would stop your validator from signing along with it?",
    helper:
      "Two independent safeguards. (1) Halt-on-disagreement configured in your stack: Charon (DVT) halts when more than its BFT threshold of operators disagree, i.e. when QBFT can't reach a decision; Vero exposes --attestation-consensus-threshold (default majority, set equal to the beacon-node count for unanimity); Vouch uses strategies.attestationdata.style: majority with a tunable majority.threshold (set to N for unanimity). (2) Keep your full client mix under ⅔ of the network. If every client you run is on the supermajority side, they all fork the same way, the halt-on-disagreement safeguard never triggers, and you get slashed alongside the network. See clientdiversity.org for current client shares.",
    options: [
      {
        color: "green",
        label: "Refuse-to-attest configured, 3+ independent clients, includes a minority client",
        sub: "Your combined client share stays under ⅔ of the network — no supermajority-client fork can sweep you up.",
      },
      {
        color: "yellow",
        label: "Refuse-to-attest configured, 3+ independent clients, all on supermajority-share clients",
        sub: "Safe from a single-client bug, but if every client you run is in the bad supermajority, they fork in unison and the safeguard never fires.",
      },
      {
        color: "red",
        label: "Single client, or no refuse-to-attest safeguard",
        sub: "A consensus-client bug could drag you into signing the wrong chain — no software safety net to catch it.",
      },
    ],
    risk: "On a recent public test network, a bug in one consensus client caused every validator using it to sign an incorrect chain. Because that client held a supermajority share of the testnet's validators, the result was mass slashing — the same pattern on mainnet would have destroyed billions of dollars of stake. Refuse-to-attest only saves you when your clients disagree; if they all run software in the bad supermajority, they fork in unison and the safeguard never fires.",
    references: [
      { label: "VALOS: Slashing Risk", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-risks-slashing" },
      { label: "VALOS: Client Diversity", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-client-diversity" },
      { label: "VALOS: Anti-Slashing DB", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-antislash-db" },
      { label: "clientdiversity.org", url: "https://clientdiversity.org/" },
      { label: "Obol docs — chain_split_halt", url: "https://docs.obol.org/" },
    ],
  },
  infraDiversity: {
    q: "Across the nodes that run your validators, what's the largest share on a single hosting provider?",
    helper:
      "Think active/active: in a multi-operator DVT, or a multiplexer like Vero fronting several beacon nodes, multiple machines cooperate to back the same stake. “Share on a single provider” here is the share of those cooperating machines, not a share of stake — diversifying the machine inventory means a single provider's outage drops only some of them, and the validator keeps signing. Count each cloud (AWS, Hetzner…) and “home / bare-metal” as its own provider.",
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
    risk: "A major hosting provider once suffered a security incident in which stored disk images may have been exposed. Any validator whose keystore and its decryption material lived on that provider's disks would have been at risk of complete key exfiltration in one stroke. Beyond breaches, single-provider outages routinely take large fractions of the network offline simultaneously — concentrating your nodes turns a vendor incident into your incident.",
    references: [
      { label: "VALOS: Infrastructure Risk", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-risks-infra" },
      { label: "VALOS: Physically Distributed Infrastructure", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-distribute-hardware" },
      { label: "VALOS: Utility Failure", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-protect-utilities" },
    ],
  },
  osDiversity: {
    q: "Could a compromise of a single operating system expose all of your signing material?",
    helper:
      "Distinct Linux/Unix distributions count separately — Ubuntu, Debian, Arch, NixOS, macOS, etc. The concern is compromise (an OS-level RCE, a poisoned package update, a build-pipeline attack) reaching every key at once, not uptime. Mixing distros forces an attacker to break multiple independent supply chains to reach all of your signing material.",
    options: [
      {
        color: "green",
        label: "No — signing material is split across two or more distinct distros",
        sub: "An OS-level compromise can only reach the share of your keys on that distro.",
      },
      {
        color: "red",
        label: "Yes — all signing material runs on a single OS",
        sub: "One OS-level vulnerability or poisoned update could reach every key you hold.",
      },
    ],
    risk: "Operating systems regularly ship critical remote-code-execution disclosures, and their package managers and build pipelines have repeatedly been targeted by supply-chain attacks. A single poisoned update to a popular distro could backdoor every validator running it — mixing distros forces an attacker to compromise multiple independent supply chains to reach you.",
    references: [
      { label: "VALOS: Hacking Risk", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-risks-hacking" },
      { label: "VALOS: Supply-chain Malware", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-protect-against-malware" },
      { label: "VALOS: Third-party Software Updates", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-update-software" },
    ],
  },
  cpuDiversity: {
    q: "Could a compromise of a single CPU architecture expose all of your signing material?",
    helper:
      "The instruction set the chip speaks — x86-64, ARM64, RISC-V — not the chip model. Side-channel and speculative-execution disclosures (Spectre, Meltdown, and successors) are architecture-bound, so splitting your signing material across two ISAs (typically x86-64 + ARM64) limits the blast radius of any single hardware-class disclosure. RISC-V is barely available today, so two is the practical ceiling for most operators.",
    options: [
      {
        color: "green",
        label: "No — signing material is split across two or more architectures",
        sub: "Typically x86-64 + ARM64 (Apple Silicon, AWS Graviton, Ampere) — an architecture-bound side-channel can only reach the keys on that ISA.",
      },
      {
        color: "red",
        label: "Yes — all signing material runs on a single architecture",
        sub: "Typically 100% x86-64 — one CPU-class disclosure could reach every key.",
      },
    ],
    risk: "CPU architectures have repeatedly disclosed speculative-execution and side-channel vulnerabilities — Spectre, Meltdown, and a long tail of successors — that let one process read memory belonging to another process on the same machine, including, in principle, signing keys held by a co-located component. A second architecture across your fleet limits the blast radius of any single hardware-class vulnerability.",
    references: [
      { label: "VALOS: Hacking Risk", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-risks-hacking" },
      { label: "VALOS: Physically Distributed Infrastructure", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-distribute-hardware" },
    ],
  },
  geoDiversity: {
    q: "What's the largest share of those nodes in a single country or region?",
    helper:
      "Where the cooperating nodes that back your stake physically run — grouped by country or region, not data-centre. In an active/active setup, a country-level outage (grid blackout, weather event, network disruption) only drops the nodes in that region; the rest keep signing.",
    options: [
      {
        color: "green",
        label: "Less than 33%",
        sub: "No issue in a single region can put your validator offline.",
      },
      {
        color: "yellow",
        label: "33% to 66%",
        sub: "A situation in this country or region could take your validator offline.",
      },
      {
        color: "red",
        label: "More than 66%",
        sub: "An issue in this region could risk your validator's security.",
      },
    ],
    risk: "Entire countries lose grid power for hours or days — the 2025 Iberian Peninsula blackout cut electricity to tens of millions of people across two countries simultaneously. Natural disasters, accidental cascading failures, and sovereign actions all show up as common-mode risk for validators concentrated in one country or region.",
    references: [
      { label: "VALOS: Downtime Risk", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-risks-downtime" },
      { label: "VALOS: Physically Distributed Infrastructure", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-distribute-hardware" },
      { label: "VALOS: Environmental Threat Protection", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-protect-from-environment" },
      { label: "VALOS: Environmental Controls", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-controls-environment" },
    ],
  },
};
