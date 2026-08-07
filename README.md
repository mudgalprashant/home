# home

Personal portfolio site for Prashant Mudgal — Next.js on Vercel, with content managed
through a private admin panel rather than hardcoded.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values; .env.local is git-ignored
npm run dev                  # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm run audit:ci` | Fail on high/critical dependency CVEs |

CI runs lint, typecheck, build, and audit on every PR (`.github/workflows/ci.yml`).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Postgres +
Auth, added in the data-layer branch) · deployed on Vercel. Everything runs on a free tier.

## Documentation

Planning and design docs live in [`KB/`](./KB) and are the source of truth:

- [`KB/plan.md`](./KB/plan.md) — goals, decisions, phased roadmap
- [`KB/system-design.md`](./KB/system-design.md) — architecture, data model, deployment
- [`KB/security.md`](./KB/security.md) — threat model and the rules to follow while coding
- [`KB/decision-log.md`](./KB/decision-log.md) — append-only history of what changed and why

[`wiki/`](./wiki) holds a shorter summary that syncs to the GitHub Wiki automatically.

## Contributing

One branch per feature or component, reviewed via pull request. Before opening one: lint,
typecheck, and build must pass, and the relevant security gate in
[`KB/security.md`](./KB/security.md) §6 should be cleared.
