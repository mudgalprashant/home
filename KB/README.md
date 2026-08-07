# Knowledge Base

This folder is the source of truth for planning this personal portfolio website — a
Next.js site meant to impress recruiters for Senior Software Engineer roles, built and
hosted entirely on free tools. Read the files in this order.

## Contents

1. [plan.md](./plan.md) — goals, locked-in decisions, information architecture, phased
   roadmap, definition of done. Start here for *what* we're building and *why*.
2. [system-design.md](./system-design.md) — tech stack, directory structure, content data
   model, social-preview/OG image strategy, performance/security architecture. Read this for
   *how* it's built.
3. [security.md](./security.md) — threat model, attack entry points (DevTools, URL,
   Postman/direct API, forms, uploads), development rules, vulnerability checks, and
   per-phase security gates. Read this *before writing code*, not after — it expands
   system-design.md §7 and §11 into rules meant to be followed during development.
4. [runbook.md](./runbook.md) — the owner's operational guide: how secrets are handled and
   where each one goes, static assets still needed, and step-by-step setup for Supabase,
   Vercel, and GitHub repository settings. Everything that requires an account or a click in
   someone else's dashboard.
5. [decision-log.md](./decision-log.md) — chronological record of decisions and completed
   work. Append-only. Read this last to see what's actually been done vs. just planned, and
   to catch any decision that later got revised.

## Purpose

This folder exists so that work on the website — across sessions, across different AI
assistants, or picked up by a human reviewer cold — never has to be reconstructed from
scratch. Any change in scope, stack, or design direction gets written here as it happens,
not left implicit in chat history that won't be available next time.

## Relationship to `/wiki`

The repo also has a [`/wiki`](../wiki/) folder — hand-authored source for the project's
GitHub Wiki, auto-synced to the live wiki on every push to `main`
(`.github/workflows/sync-wiki.yml`). It is a shorter, human-readable summary aimed at anyone
browsing the repo; `/KB` stays the detailed planning source of truth. The two are not
generated from each other, so a decision recorded here that changes something summarized in
`/wiki` needs both updated in the same PR — see `/wiki/README.md` for that folder's own
rules.

## Working agreement for future sessions (human or AI)

- Before making a structural change (stack, hosting, information architecture), check
  plan.md and system-design.md for whether it's already been decided — and why.
- After any decision or completed milestone, add an entry to decision-log.md. Don't skip
  this even for "small" decisions; the log is only useful if it's complete.
- Keep plan.md and system-design.md current — they describe the *present* intended state,
  not history. History belongs in decision-log.md.
- When writing application code, follow security.md's development rules (§4) as you go, and
  clear that phase's security gate (§6) before calling the phase done. Retrofitting these is
  much more expensive than following them the first time.
- No code exists yet as of 2026-08-08. See decision-log.md's latest entry for exactly what
  state the project is in and what the next step is.
