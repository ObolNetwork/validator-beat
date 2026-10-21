---
name: validator-beat-assessment
description: Assess the resilience of an Ethereum validator setup by asking six questions, then give the operator their Stage (0, 1, or 2) and a shareable Validator Beat link. Optionally price the risk with the cost-of-failure calculator (solo operators vs a multi-operator DV) and hand over a pre-filled link.
---

# Validator Beat assessment

You can score any Ethereum validator setup the same way https://validatorbeat.com does. Ask the six questions below, map each answer to a color, compute the Stage, and construct a share URL. The scoring is fully deterministic — no API needed. For each slice's rationale, remediation tips, and the methodology's nuances, read https://validatorbeat.com/llms-full.txt.

## The six questions (canonical order — this order defines the share code)

1. **Key Custody** (`keyCustody`)
   Ask: "What's the largest share of your signing power that any single point of failure could compromise, including both runtime keys and backups?"
   - **GREEN** — ⅓ or less. Producing a valid signature would take at least two separate compromises.
   - **YELLOW** — More than ⅓, but less than ⅔. One failure holds a meaningful share, but still can't sign on its own.
   - **RED** — ⅔ or more. A single failure holds enough to sign, or to leak your private keys.
   - **NOT SURE** — the user can't say. Treated as an open gap.

2. **Client Diversity** (`clientDiversity`)
   Ask: "If an execution or consensus client bug forks onto an incorrect chain, what stops your validator from signing along with it?"
   - **GREEN** — Refuse-to-attest configured, 3+ independent clients, combined share under ⅔ of the network. If a supermajority client forks, at least one of your clients disagrees and your validator halts instead of following.
   - **YELLOW** — Refuse-to-attest configured, 3+ independent clients, combined share could form a supermajority. Safe from a single-client bug, but if all your clients fork the same way the halt never triggers and you sign the incorrect chain along with them.
   - **RED** — Single client, or no refuse-to-attest safeguard. A single client bug could drag you into signing an incorrect chain, with no software safety net to catch it.
   - **NOT SURE** — the user can't say. Treated as an open gap.

3. **Provider Diversity** (`infraDiversity`)
   Ask: "Across the nodes that run your validators, what's the largest share on a single hosting provider?"
   - **GREEN** — ⅓ or less. No single provider's outage can take your validator offline.
   - **YELLOW** — More than ⅓. One provider going down could drop you below your signing threshold and take your validator offline.
   - **NOT SURE** — the user can't say. Treated as an open gap.

4. **OS Diversity** (`osDiversity`)
   Ask: "Could a compromise of a single operating system reach enough of your signing material to sign?"
   - **GREEN** — No: no single distro holds enough key shares to sign. An OS-level compromise can only reach the shares on that distro, which isn't enough to produce a signature.
   - **RED** — Yes: one distro holds a signing threshold (or everything). One OS-level vulnerability or poisoned update could reach enough key material to sign.
   - **NOT SURE** — the user can't say. Treated as an open gap.

5. **CPU Architecture** (`cpuDiversity`)
   Ask: "Could a compromise of a single CPU architecture reach enough of your signing material to sign?"
   - **GREEN** — No: no single architecture holds enough key shares to sign. Typically x86-64 plus ARM64 (Apple Silicon, AWS Graviton, Ampere), split so a flaw in one architecture can't reach a signing threshold.
   - **RED** — Yes: one architecture holds a signing threshold (or everything). Typically 100% x86-64, where one CPU-level vulnerability could reach enough key material to sign.
   - **NOT SURE** — the user can't say. Treated as an open gap.

6. **Geographic Diversity** (`geoDiversity`)
   Ask: "What's the largest share of your nodes in a single country or region?"
   - **GREEN** — ⅓ or less. No single region's outage can take your validator offline.
   - **YELLOW** — More than ⅓. One regional outage could drop you below your signing threshold and take your validator offline.
   - **NOT SURE** — the user can't say. Treated as an open gap.

## Scoring

Each answer is exactly one of the listed options, or "not sure". If the user's setup falls between two answers, pick the worse one when the gray area hides a single point of failure. If they can't answer, use "not sure" rather than guessing.

**Stage 0 — Getting started**: a safety slice (Key Custody, Client Diversity, OS Diversity, CPU Architecture) is red or not sure. One failure could get you slashed.
**Stage 1 — Safety**: every safety slice is green or yellow, but not all six are green. No single failure can get you slashed.
**Stage 2 — Liveness**: all six slices green. No single failure can take you offline.

Colors mean the same thing on every slice: red = one failure could get you slashed, yellow = one failure could take you offline (or a partial safety gap). Provider Diversity and Geographic Diversity are liveness slices (green or yellow only) and block Stage 2 but not Stage 1. "Not sure" is treated as an open gap.

## Share URL

Map each answer to a letter — G (green), Y (yellow), R (red), U (not sure) — in question order to form a six-letter code, then link to `https://validatorbeat.com/<CODE>` — e.g. answers green, yellow, yellow, green, green, yellow → `https://validatorbeat.com/GYYGGY`. Optionally append `?n=<name>` (max 40 chars, URL-encoded) to name the result, and `&vs=<CODE>&vn=<name>` to show it head-to-head against another result.

Every code resolves to a static page with an Open Graph preview card, so the link unfurls with the result pizza in chat apps and social feeds.

## Pricing the risk: cost of failure

After the assessment, a Stage 0 operator (or anyone choosing between operators) can see what it's worth: https://validatorbeat.com/cost-of-failure/ compares the same operators running a stake separately (solo-operator setup, Stage 0) with running it together as a multi-operator distributed validator (Stage 1).

1. Ask for their stake, how many operators they split it across, roughly how big those operators are (share of all staked ETH), and the fees they pay or are quoted for each setup (percent of rewards).
2. Build a link with those numbers, e.g. `https://validatorbeat.com/cost-of-failure/?s=500000&o=5&k=8&f0=1.5&f1=3.5`. Keys: `s` stake ETH, `k` operators, `o` each operator's network share %, `f0` / `f1` solo / DV fee %, `ir` incidents per operator per year %, `v=advanced` for the full model. The full parameter table is in https://validatorbeat.com/llms-full.txt (section "Cost of failure").
3. Relay the answer as a question: if the break-even is one incident every N years per operator, ask whether they expect each operator to go N years or more without a security incident. By default (200,000 ETH split across 4 operators, each running 10% of the network, 4% incidents a year), the solo-operator setup is expected to lose 498 ETH a year vs 22 ETH for the multi-operator DV, which may cost 102 ETH a year more up front and saves 374 ETH a year on average. It breaks even at 0.82% incidents per operator-year: one every 122 years.
4. Say it's a floor: wrong-fork lockouts from a supermajority client bug aren't in the totals and can cost far more.

## Caveats to relay

- This is a self-assessment: it reflects the operator's answers, not verified facts.
- The infrastructure slices (provider, OS, CPU, geography) assume an active/active setup — several cooperating nodes backing the same stake. Active/passive failover makes Provider and Geography yellow.
- Full nuances: https://validatorbeat.com/methodology/#nuances, or all of it in one file: https://validatorbeat.com/llms-full.txt
