# Home

Welcome to the engineering wiki for **Prashant Mudgal's** personal portfolio site — a
project built to demonstrate senior-engineer craft, not just describe it.

Start here:

- [Roadmap](Roadmap.md) — goals, phases, and current status
- [Architecture](Architecture.md) — stack, data flow, and system diagrams
- [Admin Guide](Admin-Guide.md) — how content is added and updated without a code change

## Quick facts

- **Stack**: Next.js (App Router) on Vercel, Supabase for database/auth/storage — $0 to run
- **Content**: fully dynamic, managed through a private admin panel, no CMS and no
  redeploy required
- **Status**: see [Roadmap](Roadmap.md) for the current phase

## How this wiki stays current

This wiki is generated from source files in the
[`wiki/`](https://github.com/mudgalprashant/home/tree/main/wiki) directory of the main
repository and is re-synced automatically on every push to `main`
(see `.github/workflows/sync-wiki.yml`). For the full planning detail behind these pages —
the complete architecture spec, phase-by-phase roadmap, and a running decision log — see
[`/KB`](https://github.com/mudgalprashant/home/tree/main/KB) in the repository. This wiki is
the readable summary; `/KB` is the detailed source of truth.
