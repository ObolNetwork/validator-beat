# Validator Beat

Public transparency dashboard for Ethereum node operators — stage + six-slice risk profile per operator.

**Planning:** See [docs/PLAN.md](./docs/PLAN.md) for the full setup and implementation plan.

**Prototype:** https://stately-bienenstitch-8e3cfc.netlify.app/

## Development

```bash
cp .env.example .env.local   # optional: NEXT_PUBLIC_SURVEY_URL
yarn install
yarn dev
```

| Command | Description |
|---------|-------------|
| `yarn dev` | Local dev server |
| `yarn build` | Static export to `out/` (deploy via GitHub Pages later — see plan) |
| `yarn lint` | ESLint |
| `yarn test` | Jest (rubric unit tests) |

Stack: Next.js 15 (Pages Router), static export, `@obolnetwork/obol-ui`, TypeScript.
