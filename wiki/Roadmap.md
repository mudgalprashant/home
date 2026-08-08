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
| 1 | Scaffold, deploy skeleton, data layer | Done |
| 2 | Public site against seeded content | Done — RLS verified against the live database |
| 3 | Admin panel (auth + CRUD) | In progress — auth shell built |
| 4 | Interactivity & polish | Not started |
| 5 | Social preview & SEO layer | Not started |
| 6 | Live content entry (via the admin UI) | Not started |
| 7 | Launch & feedback loop | Not started |

This table is hand-maintained alongside `/KB/plan.md` — when a phase's status changes there,
update the matching row here in the same PR (see `/wiki/README.md` for why this isn't
automated).

## What's next

The public site is built and rendering real content: hero, about, experience, projects,
skills, and contact all read from the database, plus a printable `/resume` route. Security
headers and a Report-Only CSP are in place.

Phase 2 is closed. The Supabase project is live, and the RLS verification has been run against
it: public reads succeed, and every anonymous write is refused. That check found a real gap on
its first run — a privilege layer the migration claimed but had not created — which is now
fixed and documented.

Phase 3 — the private admin panel — is under way. The authentication shell is built; content
editing forms are next. See [Architecture](Architecture.md)
for how the pieces fit, and [Security](Security.md) for the gate each phase has to clear.
