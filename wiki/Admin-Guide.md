# Admin Guide

How content on the site gets managed. This page describes the design; it will be updated
with real steps/screenshots once the admin panel is built (Phase 3 — see
[Roadmap](Roadmap.md)).

## Access

- The admin panel has no link anywhere on the public site: no nav item, no footer link, and
  it's excluded from the sitemap and from search indexing.
- It's reachable only by navigating directly to its URL, and then authenticating.
- Not being linked is a UX choice, not the security boundary. The real security is
  authentication (Supabase Auth) plus a database-level check that only one allow-listed
  email can ever write data — both enforced independently, so a leaked URL alone grants
  nothing. See [Security](Security.md) for the full model, or `/KB/security.md` for the
  complete threat model and verification steps.

## What it manages

- **Profile** — name, headline, bio, links, avatar, resume file
- **Experience** — add, edit, remove, and reorder roles
- **Projects** — add, edit, remove, reorder, mark as featured, set the slug used for that
  project's own page
- **Skills** — add, edit, remove, grouped by category

## What happens after a save

A save writes directly to the database and immediately invalidates the cached public page it
affects — the change is live within seconds, with no redeploy and no waiting for a build.
See [Architecture](Architecture.md) for the full flow.

## Deliberately not included (v1)

- No rich content blocks or general-purpose page builder — this is a small, typed content
  model sized to exactly what the site needs, not a general CMS.
- No multi-user roles — single owner, single allow-listed login.
- No revision history or rollback — cut from v1 scope, cheap to add later if needed.
