# Development

Contributor notes that don't belong on the README. Architecture and conventions for coding agents live in [`CLAUDE.md`](../CLAUDE.md).

## Commands

| Command | Description |
|---------|-------------|
| `yarn dev` | Local dev server on :3000 |
| `yarn test` | Rubric unit tests |
| `yarn lint` | ESLint |
| `yarn build` | OG images + badges + agent files, then static export to `out/` |
| `yarn build:og` | Regenerate `public/og/*.png` and `public/badge/*.svg` only (~1 min) |
| `yarn build:agents` | Regenerate `public/llms.txt` and `public/skill.md` from the rubric |
| `yarn build:banner` | Regenerate the README header image (`docs/images/banner.png`, committed) |

Optional: set `NEXT_PUBLIC_SITE_URL` in `.env.local` for share links (defaults to `https://validatorbeat.com`).

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/assess/` | Self-assessment (intro → 6 slices → results) |
| `/assess/?vs=GYYGGY&vn=Name` | Take the assessment head-to-head against a result |
| `/GYYGGY/` | A shared result (one static page + OG image + badge per valid code) |
| `/GYYGGY/?n=Name&vs=GGGGGG&vn=Other` | Same, named, with an optional head-to-head |
| `/badge/GYYGGY.svg` | README/website badge |
| `/methodology/` | Framework and stage definitions |
| `/operators/` | Redirects to `/` until the operator registry ships |

Query parameters never reach link previews — OG images are static per code.

## Deploy (GitHub Pages)

Every push to `main` runs CI and, on success, deploys the static `out/` folder to GitHub Pages.

1. **Settings → Pages → Build and deployment** — set **Source** to **GitHub Actions**.
2. Production build env lives in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):
   - `NEXT_PUBLIC_BASE_PATH` — `/validator-beat` for `obolnetwork.github.io/validator-beat/`, empty for the custom domain.
   - `NEXT_PUBLIC_SITE_URL` — absolute origin used in share links, OG tags, and badges.
3. **Custom domain** (`validatorbeat.com`): point DNS at GitHub Pages and build with an empty `NEXT_PUBLIC_BASE_PATH`.

## Link previews

Share pages expose Open Graph tags and a per-code image at `/og/{code}.png`.

```bash
yarn build && npx serve out
curl -s http://localhost:3000/GYYGGY/ | grep -E 'og:|twitter:'
open http://localhost:3000/og/GYYGGY.png
```

After deploy, paste a live share URL into [metatags.io](https://metatags.io/), the [Facebook/LinkedIn debugger](https://developers.facebook.com/tools/debug/), or [opengraph.xyz](https://www.opengraph.xyz/). Debuggers cache previews — use "Scrape again" after redeploying images. `og:image` must be an absolute HTTPS URL.

## Theming

Edit [`styles/theme-tokens.css`](../styles/theme-tokens.css) to change colors (warm cream by default; an Obol-branded dark palette under `[data-theme="dark"]`). If you change pizza slice colors, also update [`lib/theme/tokens.ts`](../lib/theme/tokens.ts), which the pre-rendered OG images and badges use.

## Site chrome

The landing, assessment, and methodology share [`SiteHeader`](../components/layout/SiteHeader.tsx) and [`SiteFooter`](../components/layout/SiteFooter.tsx). The header hides the "Assess your validator" CTA on `/assess`, and both take a `contentWidth` prop to align with the page's main column (landing/methodology `1140`, assessment `1440`).
