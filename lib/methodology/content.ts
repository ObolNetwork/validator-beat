/**
 * Methodology copy shared by the methodology page and the generated agent
 * docs (llms-full.txt), so the two can't drift. Strings use `**bold**`
 * Markdown, which `components/methodology/Inline.tsx` renders on the page.
 */

export const ACTIVE_ACTIVE =
  "For infrastructure, OS, CPU, and geography, diversity only translates into resilience when your validator runs **active/active**: several cooperating nodes back the same stake, with signing continuing as long as enough of them stay up. The stake isn't partitioned across machines — it's one aggregate validator whose cooperating machines you've diversified. Several setups achieve this — multi-operator **distributed validators (DVT)** coordinated by Charon, or validator clients like **Vouch** paired with multiplexers like **Vero** and remote signers like **Dirk** or **Web3Signer**. The common requirement: no single party holds enough key material to sign alone — at least two independent parties involved, backups kept separate, so compromising one doesn't leak the full private key.";

export const NOT_SURE =
  "Every question also offers **Not sure**. It's treated as an open gap: a gap you can't verify is closed has to be assumed open, so it holds a safety slice at Stage 0 and a liveness slice short of Stage 2. Your results then tell you how to find out, rather than how to fix it.";

export const BAND_MATH =
  "Bands follow the consensus math. Distributed validators typically need ⅔ of key shares to sign, so any single party, OS, or architecture holding ⅔ or more is red. Holding ⅓ or less means losing it still leaves a signing threshold online, which is green. For Provider and Geography, anything over ⅓ on one provider or region can already drop you below that threshold, so there's a single cut-off.";

export const CLIENT_DIVERSITY_NOTE =
  "**Client diversity** counts execution and consensus clients alike and uses a simplified banded model; live network client share thresholds are deferred to a future operator registry.";

export const RULE_OF_THUMB =
  "If your setup falls between two answers, pick the worse one. If you can't tell, pick **Not sure** — your results will say how to find out.";

export const THREE_COLORS =
  "Real setups don't fall into neat green, yellow, and red buckets. We use three colors anyway because they keep a result easy to read at a glance — the rule of thumb covers the space between them.";

/** Known cases the questions don't spell out. */
export const NUANCE_CASES: { title: string; body: string }[] = [
  {
    title: "Shared owner",
    body: "Two key custodians inside one company fail together. Count them as one party when scoring Key Custody.",
  },
  {
    title: "Derived distros",
    body: "Ubuntu and Debian share upstream packaging. If your distros share a supply chain, count them as one OS.",
  },
  {
    title: "One physical host",
    body: "Two OSes in VMs on one machine are both reachable through the host. Count the host's OS, not the guests'.",
  },
  {
    title: "Resold infrastructure",
    body: "Two providers reselling the same cloud or data centre fail together. Count them as one provider.",
  },
  {
    title: "Active/passive failover",
    body: "A warm standby still goes offline during failover. The Provider and Geography slices assume active/active; score them yellow.",
  },
];

/** Things the assessment deliberately doesn't score, and why. */
export const UNSCORED: { id: string; title: string; body: string }[] = [
  {
    id: "remote-signers",
    title: "The remote signer stack",
    body: "Every current signing stack keeps a single point of failure somewhere, whether you run Web3Signer, Dirk, Vero, Vouch, or Charon. Validator Beat doesn't score it: penalizing something no setup can avoid would push everyone toward one architecture.",
  },
  {
    id: "hosting-type",
    title: "Hosting provider type",
    body: "Validator Beat doesn't rank residential, bare metal, or cloud hosting. The Provider slice already scores provider concentration, which catches the real trap: five regions all on AWS still fall to one provider incident.",
  },
  {
    id: "cpu-generation",
    title: "CPU generation",
    body: "Validator Beat counts instruction sets and ignores chip generations. Hardware bugs sometimes hit one generation and sometimes a vendor's entire line, so mixing generations guarantees nothing.",
  },
];
