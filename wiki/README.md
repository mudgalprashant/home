# Wiki source

This folder is the hand-authored source for the project's [GitHub Wiki](../../../wiki).
It is synced automatically to the live wiki by `.github/workflows/sync-wiki.yml` on every
push to `main` that touches this folder.

## Edit here, not in the Wiki UI

GitHub Wikis are editable directly through the web UI, but don't use that here — any edit
made directly on the live wiki is **not** stored in this repo and will be silently
overwritten the next time this folder changes and the sync workflow runs. Treat this folder
as the only source of truth for wiki content: edit these files, open a PR like any other
change, and the live wiki updates itself after merge.

## Relationship to `/KB`

This repo has two documentation surfaces, and they're not duplicates of each other:

- **`/KB`** — the detailed planning source of truth: full system design, phase-by-phase
  roadmap, and an append-only decision log. Dense, internal-facing, written for whoever
  (human or AI) needs full context to continue the work.
- **`/wiki`** (this folder) — a shorter, human-readable summary for anyone browsing the
  GitHub repo's Wiki tab. Each page links back to the relevant `/KB` file for full detail
  rather than restating it.

Because these are separate hand-written documents, they can drift if one is updated and the
other isn't. When a change in `/KB` affects something summarized here (a phase completes, an
architecture decision changes), update the matching wiki page in the same PR. There is no
automation that regenerates wiki content from `/KB` — the sync workflow only mirrors this
folder's *current* content to the live wiki, it does not keep the words themselves in sync.

## Pages

- `Home.md` — landing page and links to everything else
- `Roadmap.md` — condensed from `/KB/plan.md`
- `Architecture.md` — condensed from `/KB/system-design.md`, includes the system overview diagram
- `Admin-Guide.md` — practical guide to the admin panel, condensed from `/KB/plan.md` §3a and `/KB/system-design.md` §7
- `_Sidebar.md` — GitHub wiki custom sidebar (special filename, rendered on every page)
- `_Footer.md` — GitHub wiki custom footer (special filename, rendered on every page)
