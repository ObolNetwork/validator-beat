# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

Validator Beat is a **client-side, public-good self-assessment** for Ethereum validator operators. Six banded questions → six "pizza slices" (each green/yellow/red, or grey for "not sure") → one Stage (0, 1, or 2). The whole thing runs in the browser; nothing is submitted, stored, or fetched at runtime. The static export ships to GitHub Pages. Built by Obol, in partnership with Lido (the stewards of ValOS) — never call Lido a co-author.

The rubric's source of truth is `lib/rubric/` plus the public methodology page (`pages/methodology.tsx`). Pre-launch, breaking rubric/share-code changes are fine — update every surface rather than documenting the old behaviour.

## Domain context: why these six slices

The assessment exists because Ethereum validators have several distinct **single-points-of-failure (SPoF)** that operators routinely conflate or overlook. Obol's distributed-validator-technology (DVT) thesis is that an operator should be able to lose any one piece of their stack — a key custodian, a client, a host, an OS, a CPU vendor, a jurisdiction — without (a) leaking signing power [the "Safety" failure mode, Stage 1] or (b) going offline [the "Liveness" failure mode, Stage 2].

The six slices are deliberately ordered worst-failure-first:

1. **Key Custody** — concentration of signing power (a Safety risk; one compromise can sign with the operator's stake)
2. **Client Diversity** — supermajority-client bug exposure (a Safety risk; refuse-to-attest turns it into mere downtime)
3. **Provider** — hosting-provider concentration (a Liveness risk)
4. **OS Diversity** — distro monoculture (a Safety risk: one supply-chain compromise reaching a signing threshold)
5. **CPU Architecture** — ISA monoculture (a Safety risk: one hardware/side-channel flaw reaching a signing threshold)
6. **Geographic** — jurisdictional concentration (a Liveness risk, plus censorship)

Each slice has a `kind`: **safety** (Keys, Clients, OS, CPU) or **liveness** (Provider, Geo). Stage rules (`computeStage`): Stage 0 = any safety slice red or not sure; Stage 1 = every safety slice green/yellow; Stage 2 = all six green. Colors carry one meaning: red = one failure could slash you, yellow = one failure could take you offline (or a partial safety gap). So liveness slices are `bands: [green, yellow]` and safety yes/no slices are `[green, red]`. "Not sure" (`unknown`, share letter `U`) is an open gap: it holds a safety slice at Stage 0 and a liveness slice short of Stage 2.

The bottom four slices (Infra / OS / CPU / Geo) **assume the operator runs per-validator DVT or a multiplexer** — i.e. duties are split across independent nodes so diversity translates into uptime rather than just redundancy. This premise is stated in `pages/methodology.tsx` and in each question's `helper` text.

Banding thresholds (⅓ / ⅔) map to the threshold-signing math: DV clusters typically need ⅔ of key shares to sign, so any single point holding **⅔ or more** is red, and **⅓ or less** is green (losing it still leaves a threshold online). OS and CPU are binary (`bands: [green, red]`): the question is whether one OS/ISA holds a signing threshold. Provider and Geo are binary (`bands: [green, yellow]`): over ⅓ on one provider/region can already drop you below the threshold, so there's one cut-off, and the worst case is downtime, not slashing.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Browser (no backend)                                        │
│                                                             │
│  questions.ts ──► AssessmentApp ──► Pizza (SVG)             │
│   (copy)          (useAssessment   ▲                        │
│                    state machine)  │                        │
│       ▲                            │                        │
│       │                       Results / Blockers / Tips     │
│       │                            │                        │
│       └──── lib/rubric ────────────┘                        │
│             (pure functions: stage, blockers, shareCode)    │
└─────────────────────────────────────────────────────────────┘
```

- **`lib/rubric/`** is the single source of truth for scoring. It exports `SLICES` (the canonical ordered list with each slice's `kind` and `bands` — also defines pizza slice order and share-code character order), `computeStage`, `blockers`, `sliceTarget`, `getTip`, `shareCode`, `decodeShareCode`, `allShareCodes`. Pure, fully unit-tested; a test asserts `questions.ts` options match each slice's `bands`.
- **`lib/assessment/questions.ts`** holds question copy + banded options. Each option's `color` is the rubric input — there is no separate scoring step; the user's chosen band *is* the slice color. The "Not sure" option is appended to every question by `Question.tsx`.
- **`hooks/useAssessment.ts`** is the state machine (intro → 6 questions → results) with a 420 ms auto-advance after each answer.
- **`pages/[code].tsx`** statically generates **one share page per valid code** (`allShareCodes()`, currently 1,296) at build time. Each share URL like `/GYYGGY` rehydrates the assessment to that result in "guest" mode (big owner name from `?n=`, "Take it yourself & compare" CTA). `?vs=CODE&vn=Name` adds a head-to-head (`components/assessment/Compare.tsx`); `lib/share/share-url.ts` owns all query parsing/building.
- **`scripts/generate-og-images.ts`** runs *before* `next build` (see `package.json` `build` script) and pre-renders an OG preview PNG into `public/og/` and a README badge SVG into `public/badge/` for every code. Both must stay in sync with `allShareCodes`.

### Cost of failure (`/cost-of-failure/`)

A second tool on the site: is it worth paying your operators to run your validators together? It compares the same operators running a stake **separately** (solo-operator setup, Stage 0) with running it **together** as a multi-operator distributed validator (Stage 1). Default: 200,000 ETH across 4 operators, each 10% of the network.

- **`lib/cost/`** is the model: pure TypeScript, no UI imports, Jest-tested (`cost.test.ts`). Works in epochs and ETH, pinned to the Fulu spec (`protocol.ts`, with `SPEC_REFS` links). `events.ts` simulates exits, slashing (initial + correlation penalty at withdrawable − 4096, including deep-queue validators escaping their own correlation), sweep and re-entry; `rewards.ts` outages, flag penalties, inactivity leak and opt-in EIP-7716; `model.ts` turns `CostParams` into per-incident cases; `montecarlo.ts` is the seeded simulation, heatmap and analytic expectations; `summary.ts` the headline numbers at the defaults.
- **Modelling rules that must survive edits:** a solo operator's incident hits only its slice (stake ÷ operators) but can slash it; a multi-operator DV's incident touches the whole stake but is a reshare or consolidation unless the attacker reaches the threshold (`s1ResidualPct`); a DV's outage loss is `(1 − s1LivenessCoverPct)` × the same solo outage, on the same stake. Wrong-fork lockouts are cited, not added to totals.
- **Operators of different sizes:** `opList` (`ops=318000:9.96,183000:6.53` in the URL) overrides the equal split (`s`, `k`, `o`); `operatorsOf(p)` always returns the list (an equal split is k identical entries), `forOperator(p, op)` gives one operator's view, and `costTables(p)` one cost table per operator. Single-incident figures use the largest exposure (`primaryOperatorIndex`). `extraNodes` adds DV members with no Stage 0 stake (e.g. your own node). Equal-split results must stay identical to the list form: a test checks it.
- **Pinned snapshots:** `snap=2026-10-19` reads the network state and defaults from `data/network/pinned/<id>.json` via `lib/cost/snapshots.ts`, so links in reports don't drift. Never edit a pinned file; to refresh `snapshot.json` or change `DEFAULT_PARAMS`, add a new pin and update `LATEST_PIN` (a test fails otherwise). The Sharplink report's figures are regression tests in `cost.test.ts`.
- **`lib/cost/params.ts`** is the page state: every parameter, its default, bounds (`PARAM_BOUNDS`), URL key (`URL_KEYS`), meaning (`PARAM_DOCS`). URLs carry only non-default values; `decodeParams` clamps everything (a crafted link can't freeze the simulation). Adding a parameter means adding it to all four.
- **`lib/cost/labels.ts`** holds the setup names; **`methodology.ts`** the formula copy and **`references.ts`** the citations, shared by the page and `llms-full.txt`.
- **`data/network/`** is a hand-refreshed mainnet snapshot (head state, pending deposits/consolidations, price) plus 90 days of validatorqueue.com history. Refresh both together and update `snapshot.json`'s `asOf`.
- **`components/cost/`** is the page. Basic view (default, `?v=advanced` for the rest) shows Setup, Results (analytic, instant), the heatmap and the lockout caveat; the Monte Carlo runs in a Web Worker (`simulation.worker.ts`). Chart colours are `--theme-cost-s0/s1` (validated for colour-blind separation in both themes).
- **Agent docs:** `lib/agents/files.ts` generates the cost section of `llms-full.txt`, the `llms.txt` line and the `skill.md` pricing section from the model, so their numbers match the page. `lib/share/cost-og-svg.ts` draws the OG card (its own 1M ETH scenario). Tests in `lib/agents/agents.test.ts` fail if they drift.

### Hard constraints from the static-export setup

- `next.config.js` sets `output: "export"` — **no API routes, no `getServerSideProps`, no runtime image optimization** (`images.unoptimized: true`). All data must be derivable at build time or in the browser.
- `basePath` / `assetPrefix` come from `NEXT_PUBLIC_BASE_PATH`. GitHub Pages project deploys need `/validator-beat`; the custom domain (`validatorbeat.com`) needs it empty. Don't hardcode paths — use `next/link` and `NEXT_PUBLIC_SITE_URL` (via `constants/index.ts` → `SITE_URL`).
- `trailingSlash: true` — every internal link should match.
- React/ReactDOM are aliased to local copies in both `next.config.js` and `jest.config.ts` to prevent `@obolnetwork/obol-ui` (which bundles its own peer deps) from pulling in a second React. **Don't remove these aliases or the `resolutions` block in `package.json`** without testing.

### Path aliases

`@components/*`, `@constants/*`, `@hooks/*`, `@lib/*`, `@public/*`, `@styles/*` — defined in both `tsconfig.json` and `jest.config.ts`. Add new top-level dirs to both if needed.

## Commands

| Command | What it does |
|---|---|
| `yarn dev` | Next dev server on :3000 |
| `yarn test` | Jest (jsdom): `lib/rubric`, `lib/cost` (the cost-of-failure model) and `lib/agents` |
| `yarn test -t "not sure"` | Run a single test by name |
| `yarn lint` | `next lint` (lints `pages`, `components`, `lib`, `constants`, `scripts`) |
| `yarn tsc --noEmit` | Type-check only (also runs via husky pre-commit on staged files) |
| `yarn build` | `build:og` → `next build` → static `out/` |
| `yarn build:og` | Regenerate the OG PNGs + badges only (~1 min; run when share-card visuals change) |
| `yarn build:banner` | Regenerate the committed README banner (`docs/images/banner.png`) |
| `npx serve out` | Serve the static export locally to verify share pages, OG tags, and trailing slashes |

Pre-commit (husky) runs `yarn test` + `yarn lint`. Lint-staged additionally runs `tsc --noEmit`, ESLint --fix, and Prettier on staged files.

## Conventions worth knowing

- **The rubric is the contract.** If you add, rename, or reorder a slice, you must update: `lib/rubric/types.ts` (`SliceId` union), `lib/rubric/index.ts` (`SLICES`, `TIPS`), `lib/assessment/questions.ts`, the `Pizza` component's slice order, and the methodology/landing examples. The share-code character order **is** `SLICES` order — breaking it invalidates every existing share link.
- **Share codes are user-visible URLs.** Six chars, `G`/`Y`/`R`/`U`, one per slice; `decodeShareCode` rejects bands a slice doesn't offer. Treat as a stable wire format once launched.
- Stage rules live in one place — `computeStage` in `lib/rubric/index.ts`. Don't reimplement them in components.
- Copy lives close to the rubric: question text in `lib/assessment/questions.ts`, slice `why` and remediation tips in `lib/rubric/index.ts`. Methodology page reads from `SLICES` so descriptions stay in sync.
- Styling is a hybrid: `@obolnetwork/obol-ui` Stitches components (see `components/assessment/stitches.ts`) for the assessment shell, plus plain CSS files in `styles/` (CSS custom properties in `theme-tokens.css` are the palette source of truth — if you change pizza slice colors there, also update `lib/theme/tokens.ts`).

### UI and styling (use obol-ui)

**Default:** build UI with `@obolnetwork/obol-ui` primitives — `Box`, `Text`, `Button`, `Link` — and the project’s Stitches tokens (`$bg01`, `$body`, `$textMiddle`, `var(--theme-brand)`, etc.). Bridge tokens live in `styles/theme-tokens.css` and `styles/obol-bridge.css`.

- Prefer the **`css` prop** on `Box` / `Text` (see `components/layout/SiteHeader.tsx`, `components/landing/Landing.tsx`) or **reuse styled exports** from `components/assessment/stitches.ts` (`Card`, `Eyebrow`, `BrandLink`, `TopNavLink`, `risk`, …) instead of new page-specific CSS files or BEM class strings.
- Use **`VbButton`** (`components/ui/VbButton.tsx`) for primary actions in the assessment flow.
- **Do not** add separate per-page CSS files (e.g. a dedicated `landing.css`) unless there is a strong reason; the landing page was migrated off that pattern.

**Exceptions (plain CSS or inline SVG is fine):**

- **Complex animations** (keyframes, multi-step pulses) — e.g. a hero “heartbeat” effect; a small block in an existing global stylesheet or component-level `@keyframes` in `css` is OK if Stitches/obol-ui makes it awkward.
- **SVG visuals** tied to the product (`Pizza`, brand mark) — not generic UI icons; use `@radix-ui/react-icons` (already in the tree via obol-ui) for arrows, external-link, etc. (`components/landing/icons.tsx`).
- **Methodology** — still uses `styles/methodology.css` for now; new work should still prefer obol-ui where practical.

**Site chrome:** the landing, assessment, and methodology share one header and footer — `components/layout/SiteHeader.tsx` and `SiteFooter.tsx` (the landing nav, generalized). `SiteHeader` reads the route to adapt: it hides the "Assess your validator" CTA on `/assess` and points "How it works" at `/#how` from inner pages. Both take a `contentWidth` prop to align the inner content with the page's main column (landing/methodology `1140`, assessment `1440`). The assessment renders them as the top/bottom rows of the 100vh `Shell` (`MainGrid` is `flex:1`).

## Deferred work (don't build yet unless asked)

`data/operators/`, `content/methodology/`, `components/operators/`, and `lib/schemas/` are placeholder dirs for the **operator registry** (YAML profiles + Zod validation + a `/operators` summary table). `scripts/validate-operators.ts` and `scripts/import-survey-csv.ts` are scaffolding for that phase. The `/operators` route currently redirects to `/`.

Preferred design when we pick it up — **Git as the backend**, no stateful service:

- Operators open a PR adding `data/operators/<slug>.yaml` with their share code, name, links, and optional evidence. The PR thread is the public audit trail; CODEOWNERS review is the moderation step.
- CI validates the YAML (Zod) and that the code passes `decodeShareCode`; the static build renders `/operators` and per-operator pages from the files.
- Later: per-slice minimums for stages, live client-share checks against clientdiversity.org, and automating `ethSecured`.
