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
    q: "What's the largest share of your signing power that any single point of failure could compromise, including both runtime keys and backups?",
    helper:
      "A “point of failure” is anywhere your signing power can converge: a person, a team, a machine, a custodian, or even one piece of software (an RCE bug in your validator client could leak whatever key material it holds). With threshold signing (typically ⅔ of shares), no single compromise can sign unless it reaches that threshold.",
    options: [
      {
        color: "green",
        label: "⅓ or less",
        sub: "Producing a valid signature would take at least two separate compromises.",
      },
      {
        color: "yellow",
        label: "More than ⅓, but less than ⅔",
        sub: "One failure holds a meaningful share, but still can't sign on its own.",
      },
      {
        color: "red",
        label: "⅔ or more",
        sub: "A single failure holds enough to sign, or to leak your private keys.",
      },
    ],
    risk: "A single key-management compromise once forced one large operator to preemptively exit roughly 10% of all Ethereum validators — billions of dollars of stake withdrawn, tens of millions of dollars in opportunity cost, as a precaution because no one could rule out that whole signing keys had been exposed. With threshold signing split across independent parties — for example a multi-operator distributed validator, or HA remote signers like Dirk or Web3Signer fronted by Vouch or Vero — no single compromise can reconstruct a usable key.",
    references: [
      { label: "ValOS: Key Custody Risk", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-risks-keys" },
      { label: "ValOS: Key Management", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-key-management" },
      { label: "ValOS: Signature Management", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-signature-management" },
      { label: "Obol docs — distributed validators", url: "https://docs.obol.org/" },
    ],
  },
  clientDiversity: {
    q: "If an execution or consensus client bug forks onto an incorrect chain, what stops your validator from signing along with it?",
    helper:
      "Two safeguards work together. First, halt on disagreement: run several independent clients and configure your stack (Charon, Vero, or Vouch all support this) to stop attesting when they disagree, so a client bug becomes downtime instead of slashing. Second, watch the supermajority: if every client you run sits inside a ⅔ supermajority that forks together, your clients never disagree and the halt never triggers. Count execution and consensus clients alike — execution-client supermajorities are the bigger risk on mainnet today. Check clientdiversity.org for current shares.",
    options: [
      {
        color: "green",
        label: "Refuse-to-attest configured, 3+ independent clients, combined share under ⅔ of the network",
        sub: "If a supermajority client forks, at least one of your clients disagrees and your validator halts instead of following.",
      },
      {
        color: "yellow",
        label: "Refuse-to-attest configured, 3+ independent clients, combined share could form a supermajority",
        sub: "Safe from a single-client bug, but if all your clients fork the same way the halt never triggers and you sign the incorrect chain along with them.",
      },
      {
        color: "red",
        label: "Single client, or no refuse-to-attest safeguard",
        sub: "A single client bug could drag you into signing an incorrect chain, with no software safety net to catch it.",
      },
    ],
    risk: "On a recent public test network, a bug in one consensus client caused every validator using it to sign an incorrect chain. Because that client held a supermajority share of the testnet's validators, the result was mass slashing — the same pattern on mainnet would have destroyed billions of dollars of stake. Ethereum's slashing penalty already scales with how many validators are slashed in the same window, so a correlated event costs each affected validator far more than an isolated slashing would. Refuse-to-attest only saves you when your clients disagree; if they all run software in the bad supermajority, they fork in unison and the safeguard never fires.",
    references: [
      { label: "ValOS: Slashing Risk", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-risks-slashing" },
      { label: "ValOS: Client Diversity", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-client-diversity" },
      { label: "ValOS: Anti-Slashing DB", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-antislash-db" },
      { label: "clientdiversity.org", url: "https://clientdiversity.org/" },
      { label: "Obol docs — chain_split_halt", url: "https://docs.obol.org/" },
    ],
  },
  infraDiversity: {
    q: "Across the nodes that run your validators, what's the largest share on a single hosting provider?",
    helper:
      "This assumes an active/active setup: several machines cooperate to back the same stake, as in a multi-operator DVT or with a multiplexer like Vero fronting several beacon nodes. The share that matters is the share of those cooperating machines, not of stake. If your biggest provider goes down, it should only drop some of your machines while the validator keeps signing. Treat each cloud (AWS, Hetzner…) and home or bare-metal as its own provider.",
    options: [
      {
        color: "green",
        label: "⅓ or less",
        sub: "No single provider's outage can take your validator offline.",
      },
      {
        color: "yellow",
        label: "More than ⅓",
        sub: "One provider going down could drop you below your signing threshold and take your validator offline.",
      },
    ],
    risk: "A major hosting provider once suffered a security incident in which stored disk images may have been exposed. Any validator whose keystore and its decryption material lived on that provider's disks would have been at risk of complete key exfiltration in one stroke. Beyond breaches, single-provider outages routinely take large fractions of the network offline simultaneously — concentrating your nodes turns a vendor incident into your incident.",
    references: [
      { label: "ValOS: Infrastructure Risk", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-risks-infra" },
      { label: "ValOS: Physically Distributed Infrastructure", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-distribute-hardware" },
      { label: "ValOS: Utility Failure", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-protect-utilities" },
      { label: "EIP-7716: Anti-correlation penalties", url: "https://eips.ethereum.org/EIPS/eip-7716" },
      { label: "EIP-7716 downtime calculator", url: "https://validatordowntime.obol.org" },
    ],
  },
  osDiversity: {
    q: "Could a compromise of a single operating system reach enough of your signing material to sign?",
    helper:
      "The concern is a compromise reaching every key at once, not uptime: an OS-level vulnerability, a poisoned package update, or a build-pipeline attack. Distinct Linux and Unix distributions count separately, so Ubuntu, Debian, Arch, NixOS, and macOS are each their own OS. What matters is how many key shares each OS holds: a 3-to-1 split across two distros in a four-node cluster still leaves one distro holding a signing threshold.",
    options: [
      {
        color: "green",
        label: "No: no single distro holds enough key shares to sign",
        sub: "An OS-level compromise can only reach the shares on that distro, which isn't enough to produce a signature.",
      },
      {
        color: "red",
        label: "Yes: one distro holds a signing threshold (or everything)",
        sub: "One OS-level vulnerability or poisoned update could reach enough key material to sign.",
      },
    ],
    risk: "Operating systems regularly ship critical remote-code-execution disclosures, and their package managers and build pipelines have repeatedly been targeted by supply-chain attacks. A single poisoned update to a popular distro could backdoor every validator running it — mixing distros forces an attacker to compromise multiple independent supply chains to reach you.",
    references: [
      { label: "ValOS: Hacking Risk", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-risks-hacking" },
      { label: "ValOS: Supply-chain Malware", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-protect-against-malware" },
      { label: "ValOS: Third-party Software Updates", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-update-software" },
    ],
  },
  cpuDiversity: {
    q: "Could a compromise of a single CPU architecture reach enough of your signing material to sign?",
    helper:
      "Count by instruction set, not chip model: x86-64, ARM64, and RISC-V are the architectures that matter. Side-channel and speculative-execution flaws like Spectre and Meltdown are bound to one architecture, so splitting key shares across two — with neither holding a signing threshold — limits how far any single flaw can reach. RISC-V is barely available today, so two is the practical ceiling for most operators.",
    options: [
      {
        color: "green",
        label: "No: no single architecture holds enough key shares to sign",
        sub: "Typically x86-64 plus ARM64 (Apple Silicon, AWS Graviton, Ampere), split so a flaw in one architecture can't reach a signing threshold.",
      },
      {
        color: "red",
        label: "Yes: one architecture holds a signing threshold (or everything)",
        sub: "Typically 100% x86-64, where one CPU-level vulnerability could reach enough key material to sign.",
      },
    ],
    risk: "CPU architectures have repeatedly disclosed speculative-execution and side-channel vulnerabilities — Spectre, Meltdown, and a long tail of successors — that let one process read memory belonging to another process on the same machine, including, in principle, signing keys held by a co-located component. A second architecture across your fleet limits the blast radius of any single hardware-class vulnerability.",
    references: [
      { label: "ValOS: Hacking Risk", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-risks-hacking" },
      { label: "ValOS: Physically Distributed Infrastructure", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-distribute-hardware" },
    ],
  },
  geoDiversity: {
    q: "What's the largest share of your nodes in a single country or region?",
    helper:
      "Group the cooperating nodes that back your stake by the country or region where they physically run, not by data centre. In an active/active setup, a country-level outage like a grid blackout, weather event, or network disruption only drops the nodes in that region while the rest keep signing.",
    options: [
      {
        color: "green",
        label: "⅓ or less",
        sub: "No single region's outage can take your validator offline.",
      },
      {
        color: "yellow",
        label: "More than ⅓",
        sub: "One regional outage could drop you below your signing threshold and take your validator offline.",
      },
    ],
    risk: "Entire countries lose grid power for hours or days — the 2025 Iberian Peninsula blackout cut electricity to tens of millions of people across two countries simultaneously. Natural disasters, accidental cascading failures, and sovereign actions all show up as common-mode risk for validators concentrated in one country or region.",
    references: [
      { label: "ValOS: Downtime Risk", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-risks-downtime" },
      { label: "ValOS: Physically Distributed Infrastructure", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-distribute-hardware" },
      { label: "ValOS: Environmental Threat Protection", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-mit-protect-from-environment" },
      { label: "ValOS: Environmental Controls", url: "https://lidofinance.github.io/valos/valos-spec.html#sec-controls-environment" },
      { label: "EIP-7716: Anti-correlation penalties", url: "https://eips.ethereum.org/EIPS/eip-7716" },
      { label: "EIP-7716 downtime calculator", url: "https://validatordowntime.obol.org" },
    ],
  },
};
