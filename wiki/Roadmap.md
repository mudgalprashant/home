# Roadmap

Condensed from the full plan — see
[`/KB/plan.md`](https://github.com/mudgalprashant/home/blob/main/KB/plan.md) in the repo for
complete detail, open decisions, and the content checklist.

## Goal

A personal portfolio site for Prashant Mudgal, built to impress recruiters and hiring
managers for Senior Software Engineer roles: fast, interactive, easy to navigate, with
correct link previews on LinkedIn/GitHub/social — and **fully dynamic**, with content
managed through a private admin panel instead of hardcoded into the site.

## Locked-in decisions

| Area | Choice |
|---|---|
| Framework | Next.js (App Router), standard Vercel deployment |
| Hosting | Vercel free tier |
| Database / Auth | Supabase free tier (Postgres + Auth + Storage) |
| Content | Database-backed, editable via an unlisted, authenticated admin panel |

## Phases

| Phase | Focus | Status |
|---|---|---|
| 0 | Planning & system design | Done |
| 1 | Scaffold, deploy skeleton, data layer (Supabase provisioning) | In progress |
| 2 | Public site against seeded content | Not started |
| 3 | Admin panel (auth + CRUD) | Not started |
| 4 | Interactivity & polish | Not started |
| 5 | Social preview & SEO layer | Not started |
| 6 | Live content entry (via the admin UI) | Not started |
| 7 | Launch & feedback loop | Not started |

This table is hand-maintained alongside `/KB/plan.md` — when a phase's status changes there,
update the matching row here in the same PR (see `/wiki/README.md` for why this isn't
automated).

## What's next

Phase 1 is underway. The Next.js scaffold, CI pipeline, and security baseline have been
built; Supabase provisioning (schema, RLS policies, auth) and the theme toggle are the
remaining pieces before Phase 2 begins. See [Architecture](Architecture.md) for how these
fit together, and [Security](Security.md) for the gate each phase has to clear.
