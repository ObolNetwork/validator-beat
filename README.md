# Validator Beat

Neutral, public-good **self-assessment** for Ethereum validator operators — six questions, six pizza slices, one Stage. Runs entirely in your browser; nothing is submitted or stored.

**Planning:** [docs/PLAN.md](./docs/PLAN.md)

## Development

```bash
yarn install
yarn dev
```

Open http://localhost:3000

| Command | Description |
|---------|-------------|
| `yarn dev` | Local dev server |
| `yarn build` | Static export to `out/` |
| `yarn test` | Rubric unit tests |
| `yarn lint` | ESLint |

Optional: set `NEXT_PUBLIC_SITE_URL` in `.env.local` for share links (defaults to `https://validatorbeat.com`).

## Deploy (GitHub Pages)

Every push to `main` runs CI and, on success, deploys the static `out/` folder to GitHub Pages.

**One-time repo setup**

1. **Settings → Pages → Build and deployment** — set **Source** to **GitHub Actions**.
2. Production builds use the GitHub Pages project path in [`.github/workflows/ci.yml`](.github/workflows/ci.yml):
   - `NEXT_PUBLIC_BASE_PATH=/validator-beat` — required so `/_next/` JS/CSS load at `obolnetwork.github.io/validator-beat/`
   - `NEXT_PUBLIC_SITE_URL=https://obolnetwork.github.io/validator-beat` — share links and OG URLs
3. **Custom domain** (`validatorbeat.com`): point DNS at GitHub Pages, then rebuild with `NEXT_PUBLIC_BASE_PATH=` (empty) and `NEXT_PUBLIC_SITE_URL=https://validatorbeat.com`.

**Theming:** edit [`styles/theme-tokens.css`](styles/theme-tokens.css) to change colors (Lido forum–aligned by default). If you change pizza slice colors, also update [`lib/theme/tokens.ts`](lib/theme/tokens.ts).

## Future UX: shared chrome across landing and assessment

Today the **landing** (`/`) and **assessment** (`/assess/`) use different shells: the marketing page has a full nav + footer; the assessment uses a slim `TopBar` and a one-line `Footnote` inside a `100vh` focus layout (`AssessmentApp`). That is intentional for the six-question wizard (less distraction, pizza always visible) but can feel like leaving the site when users click “Assess your validator.”

**Recommended direction (not implemented yet):**

1. **One shared slim header** on `/`, `/assess/`, and `/methodology/` — logo (home), Methodology, valOS (external), theme toggle; primary CTA on marketing pages only.
2. **Compact footer on assess** — keep the trust line (“nothing submitted or stored”) plus links (Methodology · valOS · Home), not the full landing footer.
3. **Keep focus mode during Q1–Q6** — do not wrap the wizard in the full marketing layout; optional richer links on intro/results only if needed later.

**Avoid:** pasting the full landing nav + footer around the assessment grid — it costs too much vertical space on mobile and fights the locked viewport.

See `components/assessment/AssessmentApp.tsx` (`TopBar`, `Footnote`, `Shell`) and `components/landing/Landing.tsx` (`LNav`, `LFooter`) for the current split.

## v0.1 routes

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page |
| `/assess/` | Self-assessment (intro → 6 slices → results) |
| `/GYRYGG` | Open a shared result (729 static pages + OG preview image) |
| `/GYRYGG?n=Kody%27s%20Cluster` | Same, with optional display name (not in link preview) |
| `/methodology/` | Framework and stage definitions |
| `/operators/` | Redirects to `/` until operator registry ships |

## Share codes

Six characters: `G` green, `Y` yellow, `R` red — one per slice in order (Keys → Geo).

## Link previews (OG / Twitter cards)

Share pages expose Open Graph tags and a per-code image at `/og/{code}.png` (e.g. `/og/GYRYGG.png`).

**Local**

```bash
yarn build
npx serve out
```

Then open a share URL (e.g. `http://localhost:3000/GYRYGG/`) and confirm meta tags:

```bash
curl -s http://localhost:3000/GYRYGG/ | grep -E 'og:|twitter:'
```

Open the image directly: `http://localhost:3000/og/GYRYGG.png`.

**After deploy**

| Tool | URL |
|------|-----|
| Meta Tags | https://metatags.io/ (paste your share URL) |
| Facebook / LinkedIn debugger | https://developers.facebook.com/tools/debug/ |
| opengraph.xyz | https://www.opengraph.xyz/ |

Paste a live share link such as `https://validatorbeat.com/GYRYGG`. Debuggers cache previews — use “Scrape again” if you redeployed OG images.

**Quick checks**

- Image loads: `https://validatorbeat.com/og/GYRYGG.png`
- `og:image` in page source matches that URL (must be absolute HTTPS)
- Slack / Discord / iMessage: paste the URL in a draft message to see the unfurl

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE).
