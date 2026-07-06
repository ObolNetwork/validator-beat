# Validator Beat

Neutral, public-good **self-assessment** for Ethereum validator operators — six questions, six pizza slices, one Stage. Runs entirely in your browser; nothing is submitted or stored.

**Planning:** [docs/PLAN.md](./docs/PLAN.md)

## Development

Requires **Node.js 24+** (see `.nvmrc`).

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

**Theming:** edit [`styles/theme-tokens.css`](styles/theme-tokens.css) to change colors (warm cream, ecosystem-neutral by default; an Obol-branded dark palette under `[data-theme="dark"]`). If you change pizza slice colors, also update [`lib/theme/tokens.ts`](lib/theme/tokens.ts).

## Site chrome: shared header and footer

The **landing** (`/`), **assessment** (`/assess/`), and **methodology** (`/methodology/`) share one header and footer — [`components/layout/SiteHeader.tsx`](components/layout/SiteHeader.tsx) and [`SiteFooter.tsx`](components/layout/SiteFooter.tsx) (the landing nav, generalized).

- **`SiteHeader`** adapts to the route: it hides the "Assess your validator" CTA on `/assess` (you're already there) and points "How it works" at `/#how` from inner pages. The logo mark reads the `--vb-*` tokens, so it follows the theme.
- Both take a **`contentWidth`** prop so the inner content lines up with the page's main column (landing/methodology `1140`, assessment `1440`).
- The assessment renders them as the top/bottom rows of the `100vh` `Shell`; `MainGrid` is `flex:1` and absorbs the remaining height, so the focus layout still fits one screen.

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
