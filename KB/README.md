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
3. [decision-log.md](./decision-log.md) — chronological record of decisions and completed
   work. Append-only. Read this last to see what's actually been done vs. just planned, and
   to catch any decision that later got revised.

## Purpose

This folder exists so that work on the website — across sessions, across different AI
assistants, or picked up by a human reviewer cold — never has to be reconstructed from
scratch. Any change in scope, stack, or design direction gets written here as it happens,
not left implicit in chat history that won't be available next time.

## Working agreement for future sessions (human or AI)

- Before making a structural change (stack, hosting, information architecture), check
  plan.md and system-design.md for whether it's already been decided — and why.
- After any decision or completed milestone, add an entry to decision-log.md. Don't skip
  this even for "small" decisions; the log is only useful if it's complete.
- Keep plan.md and system-design.md current — they describe the *present* intended state,
  not history. History belongs in decision-log.md.
- No code exists yet as of 2026-08-07. See decision-log.md's latest entry for exactly what
  state the project is in and what the next step is.
