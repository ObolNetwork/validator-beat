---
name: validator-beat-assessment
description: Assess the resilience of an Ethereum validator setup by asking six questions, then give the operator their Stage (0, 1, or 2) and a shareable Validator Beat link.
---

# Validator Beat assessment

You can score any Ethereum validator setup the same way https://validatorbeat.com does. Ask the six questions below, map each answer to a color, compute the Stage, and construct a share URL. The scoring is fully deterministic — no API needed.

## The six questions (canonical order — this order defines the share code)

1. **Key Custody** (`keyCustody`)
   Ask: "What's the largest share of your signing power that any single point of failure could compromise, including both runtime keys and backups?"
   - **GREEN** — No more than ⅓. Producing a valid signature would take at least two separate compromises.
   - **YELLOW** — Between ⅓ and ⅔. One failure holds a meaningful share, but still can't sign on its own.
   - **RED** — More than ⅔. A single failure can leak your private keys.

2. **Client Diversity** (`clientDiversity`)
   Ask: "If a client bug forks onto an incorrect chain, what stops your validator from signing along with it?"
   - **GREEN** — Refuse-to-attest configured, 3+ independent clients, combined share under ⅔ of the network. If a supermajority client forks, at least one of your clients disagrees and your validator halts instead of following.
   - **YELLOW** — Refuse-to-attest configured, 3+ independent clients, combined share could form a supermajority. Safe from a single-client bug, but if all your clients fork the same way the halt never triggers and you sign the incorrect chain along with them.
   - **RED** — Single client, or no refuse-to-attest safeguard. A consensus-client bug could drag you into signing an incorrect chain, with no software safety net to catch it.

3. **Provider Diversity** (`infraDiversity`)
   Ask: "Across the nodes that run your validators, what's the largest share on a single hosting provider?"
   - **GREEN** — Less than ⅓. No single provider's outage can take your validator offline.
   - **YELLOW** — ⅓ to ⅔. One provider going down would drop a large share of your nodes.
   - **RED** — More than ⅔. One provider going down takes your validator offline.

4. **OS Diversity** (`osDiversity`)
   Ask: "Could a compromise of a single operating system expose all of your signing material?"
   - **GREEN** — No: signing material is split across two or more distinct distros. An OS-level compromise can only reach the share of your keys on that distro.
   - **RED** — Yes: all signing material runs on a single OS. One OS-level vulnerability or poisoned update could reach every key you hold.

5. **CPU Architecture** (`cpuDiversity`)
   Ask: "Could a compromise of a single CPU architecture expose all of your signing material?"
   - **GREEN** — No: signing material is split across two or more architectures. Typically x86-64 plus ARM64 (Apple Silicon, AWS Graviton, Ampere), so a flaw in one architecture can only reach the keys running on it.
   - **RED** — Yes: all signing material runs on a single architecture. Typically 100% x86-64, where one CPU-level vulnerability could reach every key.

6. **Geographic Diversity** (`geoDiversity`)
   Ask: "What's the largest share of your nodes in a single country or region?"
   - **GREEN** — Less than ⅓. No single region's outage can take your validator offline.
   - **YELLOW** — ⅓ to ⅔. One region going down would drop a large share of your nodes.
   - **RED** — More than ⅔. One regional outage takes your validator offline.

## Scoring

Each answer is exactly one color: green, yellow, or red. If the user's setup falls between two answers, use yellow; if a gray area hides a single point of failure, use red.

**Stage 0 — Getting started**: at least one slice is red. Has a single point of failure.
**Stage 1 — Safety**: no red slices, but not all green. No single failure can get you slashed.
**Stage 2 — Liveness**: all six slices green. No single failure can take you offline.

## Share URL

Concatenate the first letter of each color (G/Y/R) in question order to form a six-letter code, then link to `https://validatorbeat.com/<CODE>` — e.g. answers green, yellow, red, yellow, green, green → `https://validatorbeat.com/GYRYGG`. Optionally append `?n=<name>` (max 25 chars, URL-encoded) to attribute the result: `https://validatorbeat.com/GYRYGG?n=ExampleOp`.

Every code resolves to a static page with an Open Graph preview card, so the link unfurls with the result pizza in chat apps and social feeds.

## Caveats to relay

- This is a self-assessment: it reflects the operator's answers, not verified facts.
- The four infrastructure slices (provider, OS, CPU, geography) assume an active/active setup — several cooperating nodes backing the same stake. Active/passive failover caps those slices at yellow.
- Full nuances: https://validatorbeat.com/methodology/#nuances
