# Decision Log

Chronological record of decisions, scope changes, and completed work on this project.
Purpose: any AI session or reviewer picking this up cold should be able to read this file
top-to-bottom and understand *what's true now and why*, without re-deriving it from chat
history that isn't available to them.

## How to use this file

- Append new entries at the bottom, newest last. Don't rewrite history — if a decision gets
  reversed, add a new entry that says so and links back (`See 2026-08-07 entry above`).
- Every entry: **date, what changed, why, what it affects**. Skip the why and this file loses
  its entire point — "we chose X" is useless without "because Y."
- Log decisions and completed milestones, not routine edits. A typo fix doesn't belong here;
  a tech-stack choice, scope cut, or "phase N shipped" does.
- If a future session changes course on something logged here, that's fine — the log is a
  timeline, not a contract. Just record the change and the reason, same as any other entry.

---

## 2026-08-07 — Initial planning pass

**Context**: Repo started as an empty scaffold (`README.md` with just "# home") plus a
`KB/` folder the user seeded with a generic starter `plan.md` and `README.md`. User asked
for these to be replaced with a more robust plan and system design, explicitly for a
personal portfolio site aimed at impressing recruiters for Senior Software Engineer roles.

**Decisions made** (via direct question to the user, not assumed):
1. **Framework: Next.js, static export, App Router.** Chosen over Astro/plain Vite/React SPA
   because it gives the strongest "senior engineer" signal, has first-class free tooling for
   OG image generation (`@vercel/og`), and static export keeps hosting portable.
2. **Hosting: Vercel free tier.** Chosen over GitHub Pages/Netlify/Cloudflare Pages for
   zero-config Next.js support and free per-PR preview URLs. Static export keeps this
   non-lock-in — see system-design.md §3 for the migration escape hatch.
3. **Content: placeholders now, real content later.** User doesn't have resume/GitHub
   username/project list ready to hand over in this session. Site is built content-first
   (typed `/content` data files) specifically so this doesn't require a redesign later —
   see system-design.md §5. Real-content swap is tracked as Phase 5 in plan.md.

**Work completed this session**:
- Rewrote `KB/plan.md`: goals, locked-in decisions table, information architecture (8
  sections + 2 standalone routes), concrete definition of "interactive/engaging" (not vibes —
  named features + named anti-patterns to avoid), social preview requirements, 6-phase
  roadmap (Phase 0 planning → Phase 6 launch), definition of done per phase.
- Wrote `KB/system-design.md` (new file): tech stack table with free-tier limits noted per
  tool, directory structure, typed content data model with example shape, OG image generation
  strategy (build-time static PNG generation to stay compatible with static export — this is
  the one non-obvious technical solve in the whole design, see §6), navigation/interactivity
  architecture, performance/accessibility budget with concrete Lighthouse targets, CI/CD
  pipeline, security notes, explicit out-of-scope list with reasoning.
- Wrote this decision log (new file).
- Updated `KB/README.md` to index the new structure (see next section / that file directly).

**Open items carried forward** (see plan.md §2 for the checklist):
- Real name/headline/bio, GitHub username, LinkedIn URL, email, resume PDF
- Real project list, work history, skills list
- Domain name decision (or default to `*.vercel.app`)
- Profile photo

**Not yet started**: no code exists yet. Next session should begin at Phase 1
(scaffold & deploy skeleton) per plan.md, *unless* the user wants to review/amend the plan
and system design first — check plan.md §6 Phase 0's checklist for sign-off status before
assuming it's approved.

---

## 2026-08-07 — Dynamic content + admin panel (supersedes static-only design)

**Context**: Same session as the initial planning pass above. User asked for the site to be
dynamic: an admin should be able to add/update/remove projects, skills, and other content.
The admin page should have no entry point anywhere in the public site (not in nav, footer,
etc.) but be reachable by navigating directly to its URL.

**What this reverses**: the original system-design.md explicitly chose Next.js **static
export** and ruled out both a database and a CMS (see its original §11 "out of scope" and
§3 "why static export"). That choice is incompatible with "admin edits content and it goes
live" — static export has no server to receive a write. This is a genuine architecture pivot,
not an addition on top of the old design.

**Decisions made**:
1. **Drop static export, move to standard Next.js/Vercel deployment** (SSR + Server Actions +
   Route Handlers, still on Vercel's free Hobby tier — this doesn't cost anything, it just
   uses more of what Vercel's free tier already offers). Public pages use ISR with on-demand
   revalidation so they stay static-fast for visitors while updating immediately when the
   admin saves — see system-design.md §3.
2. **Add Supabase (free tier) as the database + auth + storage provider.** Chose one provider
   for all three instead of stitching together a separate DB, a separate auth service, and
   separate file storage — smaller integration surface, still fully free at this scale. See
   system-design.md §2 and §5 for schema.
3. **Admin route is unlisted AND requires real authentication** — the user's ask was
   specifically "no entry point in the site, but reachable by direct URL." Implemented that
   UX request literally (no nav/footer/sitemap link, `noindex`), but added Supabase Auth +
   Postgres RLS policies restricted to a single allow-listed admin email as the actual
   security boundary, since a URL that merely isn't linked is still discoverable (referrers,
   browser history, guessed routes) and isn't a substitute for auth. This was a judgment call
   made in the design rather than asked back to the user — flagged clearly in
   system-design.md §7 and in plan.md's decisions table so it's visible and reversible if the
   user actually wants URL-only, no-login access instead.
4. **OG image generation got simpler as a side effect**: the original design needed a
   build-time static-PNG workaround specifically because static export can't run a live image
   route. That workaround is gone — dynamic content now uses Next.js's standard
   `opengraph-image.tsx` convention rendered per request. Noted in system-design.md §6 as an
   incidental win, not an added cost, of this pivot.

**Work completed this session**:
- Rewrote `KB/plan.md`: goal statement now includes dynamic/admin-editable content, new
  decisions-table rows (framework/hosting rationale updated, DB+Auth choice, admin access
  model), new §3a describing the admin panel's scope, phase plan restructured from 6 to 8
  phases (0-7) to insert data-layer provisioning (Phase 1), admin panel build (Phase 3), and
  reframe "live content swap" as "live content entry via the admin UI" (Phase 6) rather than
  a file edit. Added admin-specific criteria to the definition-of-done section.
- Rewrote `KB/system-design.md`: added a revision note at the top pointing here; replaced the
  "why static export" section with "why not static export anymore" (§3); added Supabase to
  the stack table; added full Postgres schema + RLS approach (§5); simplified the OG image
  section now that a live route is possible (§6); added a new §7 dedicated to admin
  access/security reasoning (the most important addition — this is where the
  hidden-URL-is-not-security judgment call is recorded); expanded the security and risks
  sections accordingly; updated out-of-scope list (third-party CMS still excluded, self-built
  admin no longer is).
- Appended this entry.

**Open items carried forward**: same content checklist as the initial entry, plus one new
item — **which email should be allow-listed as the admin login** (plan.md §2). This does not
have to be decided before Phase 1 starts, but must be decided before Phase 3 (admin panel)
can be built.

**Not yet started**: still no code. Next session begins at Phase 1 per the revised plan.md,
which now includes Supabase provisioning as part of that phase (not a later add-on).

---

## 2026-08-07 — Flow diagrams added to system-design.md

**Context**: User asked for flow diagrams in system-design.md — the doc explained several
request/data flows in prose (ISR revalidation, OG image generation, admin auth, admin writes)
without a visual to go with them.

**What changed**: added five Mermaid diagrams (render natively on GitHub and in most
Markdown viewers/IDE extensions; also readable as structured text by anything that can't
render Mermaid, which matters for this folder's "context for other AI sessions" purpose):
- New **§1a System architecture overview** (flowchart) — visitor/admin/crawler paths through
  the same Next.js app and single Supabase project, at a glance.
- **§3.1** (sequence) — ordinary cached visit vs. the moment an admin save triggers
  `revalidatePath`.
- **§6.1** (sequence) — OG image request flow, same edge-caching shape as §3.1.
- **§7.1** (sequence) — admin login flow through `middleware.ts` and Supabase Auth, including
  the allow-list check.
- **§7.2** (sequence) — admin content write flow: Zod validation client-side, RLS
  authorization at the database, `revalidatePath` on success.

**Why inserted as subsections (§1a, §3.1, §6.1, §7.1, §7.2) instead of new top-level
sections**: plan.md and this file's own earlier entries cross-reference system-design.md by
section number (e.g. "system-design.md §7"). Renumbering top-level sections would have
silently broken those references. Subsections slot in without shifting anything after them —
same pattern plan.md already used for §3a (admin panel scope).

**Work completed**: edited `KB/system-design.md` only (five diagrams added, no other content
changed). Appended this entry.

**Not yet started**: still no code. Next session begins at Phase 1 per plan.md.

---

## 2026-08-08 — GitHub Wiki added, synced automatically from a new branch

**Context**: The `system-design` branch was merged to `main` (PR #1). User asked for a new
branch to create wiki pages, and for the wiki to "also be updated regularly on each commit
and push" alongside the knowledge base.

**Key fact that shaped the design**: a GitHub repo's Wiki is a *separate* git repository
(`<repo>.wiki.git`), not something that lives in a branch of the main repo. "Create a branch
to create the wiki pages" therefore can't mean committing directly to the wiki's own git
history from here — it means authoring wiki *source* in this repo (reviewable via normal
PRs, consistent with how `/KB` already works) and mechanically mirroring it to the real wiki.
That mirroring is what makes "updated on each commit and push" literal rather than a manual
reminder: a GitHub Actions workflow, not a habit to remember.

**Decisions made**:
1. **New branch `wiki-pages`, cut from latest `main` post-merge.** Contains a new `/wiki`
   folder (hand-authored source: Home, Roadmap, Architecture, Admin-Guide, plus the special
   `_Sidebar.md`/`_Footer.md` GitHub wiki files) and a new
   `.github/workflows/sync-wiki.yml` — the first CI workflow in this repo.
2. **`/wiki` summarizes, `/KB` stays authoritative.** Wiki pages are deliberately shorter
   than their `/KB` counterparts and link back to the relevant `/KB` file/section rather than
   restating it — avoids two independently-drifting copies of the same planning prose. This
   does mean `/wiki` needs manual upkeep alongside `/KB` (e.g. Roadmap.md's phase-status
   table) — there is no automation that regenerates wiki content from `/KB`, only automation
   that mirrors whatever's currently in `/wiki` to the live site. Recorded explicitly in both
   `KB/README.md` and `wiki/README.md` so this isn't mistaken for full automation later.
3. **Sync workflow triggers on push to `main` touching `wiki/**`, not on every branch.**
   Keeps the live wiki reflecting shipped (merged) state only, avoids feature branches racing
   to overwrite it. `workflow_dispatch` also enabled for a manual re-run (useful after fixing
   the auth setup in point 4 without needing a throwaway commit).
4. **Flagged, not hidden: wiki push auth is a known GitHub Actions rough edge.** The default
   `GITHUB_TOKEN` does not reliably get write access to a repo's wiki git repository — this
   is a widely reported limitation of GitHub's permission model, not something specific to
   this repo, and not something worth asserting false confidence about. The workflow prefers
   a `WIKI_SYNC_TOKEN` repository secret (a classic PAT with `repo` scope) and falls back to
   `GITHUB_TOKEN`; if the fallback doesn't have access, the fix is adding that secret. This
   is documented in a comment block at the top of the workflow file itself, so it's visible
   exactly where it'd be needed, not only here.
5. **One-time manual setup this workflow cannot do itself**: the repo's Wiki feature must be
   enabled (Settings -> Features -> Wikis), and the wiki git repo must be initialized by
   creating one page through the web UI before the very first sync can push to it — GitHub
   does not create `<repo>.wiki.git` until that happens. No API/token available in this
   session to do this step remotely; it's the user's to complete once. Also noted in the
   workflow file's header comment.

**Work completed this session**:
- Created branch `wiki-pages` off `main` (post-merge of PR #1).
- Added `/wiki`: `README.md` (authoring rules, explicitly: edit here not in the live wiki UI,
  since direct wiki edits get overwritten by the next sync), `Home.md`, `Roadmap.md`,
  `Architecture.md` (includes the system overview diagram from `KB/system-design.md` §1a),
  `Admin-Guide.md`, `_Sidebar.md`, `_Footer.md`.
- Added `.github/workflows/sync-wiki.yml`.
- Updated `KB/README.md` with a "Relationship to `/wiki`" section.
- Appended this entry.

**Open items carried forward**: same content checklist as prior entries, plus — the user
still needs to complete the two manual GitHub setup steps in point 5 above before the sync
workflow's first run will succeed. No `gh` CLI or GitHub API token is available in this
environment (also true when PR #1 was raised — that PR was opened by hand from a link this
assistant provided, not by any tool call), so neither the Wiki-enable toggle nor the
first-page bootstrap can be done on the user's behalf; both are one-time actions in the
GitHub web UI.

**Not yet started**: still no application code. This entry only adds repo tooling/docs
infrastructure; Phase 1 of plan.md (Next.js scaffold) is still the next product step.

---

## 2026-08-08 — Security guide added (KB/security.md) + wiki Security page

**Context**: `wiki-pages` merged to `main` (PR #2), and the user confirmed the GitHub Wiki is
now created, so the sync workflow has something to push to. User then asked for documentation
covering security considerations, vulnerability checks, and the points from which attacks are
possible — explicitly naming the inspect-element window, the URL, and Postman — plus
instructions for handling those cases *during* development, with both KB and wiki updated.

**Interpretation note**: the user wrote "UI breakpoints or points from where the attacks are
possible." Read as *attack entry points* (break-in points), not CSS responsive breakpoints —
the examples given (DevTools, URL, Postman) settle it. Documented as "entry points" throughout
to avoid the ambiguity resurfacing later.

**Decisions made**:
1. **New standalone `KB/security.md` rather than expanding system-design.md §11.** The
   content is substantial (threat model, five entry-point sections, development rules,
   verification procedures, per-phase gates) and serves a different purpose from the
   architecture doc — it's meant to be followed while writing code, not read once at design
   time. Also avoids renumbering system-design.md sections, which plan.md and this log
   cross-reference by number (same constraint that shaped the flow-diagram placement on
   2026-08-07).
2. **Organized the doc around a single load-bearing principle** — "everything the browser
   receives is public, everything it sends is attacker-controlled" — with every rule derived
   from it, instead of a flat checklist. A flat list gets skimmed and partially applied; a
   principle plus derivations lets a developer reason about a case the doc didn't enumerate.
3. **Made RLS-as-the-real-boundary the doc's centerpiece.** The most important architectural
   fact about this stack is that the Supabase anon key ships publicly in the bundle by design,
   so PostgREST is directly callable from Postman with it. Every control that exists only in
   application code is bypassable; only database policies aren't. Added a trust-boundary
   Mermaid diagram (§2) whose whole point is the arrow going from "any HTTP client" straight
   past the app to the database.
4. **Added a "Postman Test" and an "RLS ritual" as named, repeatable procedures** (§3.3,
   §5.2) rather than generic advice to "test security." Named procedures get run; "be careful"
   doesn't. §5.2 step 6 (valid session, non-allow-listed account) is called out specifically
   because it's the step that catches authentication being confused with authorization.
5. **Security gates woven into every phase of plan.md** (§6 of security.md, mirrored into
   plan.md's phase list and definition-of-done) instead of a single pre-launch audit. The
   expensive failures here — RLS misconfigured, admin panel publicly reachable via preview
   deploys — are foundational; finding them at Phase 7 means rework, finding them at Phase 1
   costs nothing.
6. **Flagged Vercel preview-deployment exposure as the most likely real mistake** (§4.3 rule
   12). Preview builds run the admin code at a public URL against whatever database the env
   vars point to, and nothing about it looks wrong locally. Written as a must-verify item
   before Phase 3 ships rather than an assertion about Vercel's current tier behavior, since
   platform defaults change and asserting them confidently in a doc that outlives the session
   would be worse than telling the reader to check.

**Work completed this session**:
- Created branch `security-docs` off `main` (post-merge of PR #2).
- Added `KB/security.md`: core principle (§1), trust-boundary diagram (§2), five attack
  entry points with attack/defense/verify tables (§3: DevTools, URL manipulation, direct API
  access, forms, file uploads), development rules split across database/application/repo
  (§4), automated and manual vulnerability checks (§5), per-phase gates (§6), threat model
  with an explicit proportionality statement (§7).
- Updated `KB/system-design.md` §11 with a pointer to security.md plus an RLS-is-the-boundary
  bullet. No section renumbering.
- Updated `KB/plan.md`: security gate bullet added to Phases 1-7, Phase 0 checklist item
  marked done, definition-of-done now includes clearing the phase's security gate and — for
  the admin panel specifically — the Postman write test.
- Updated `KB/README.md`: security.md added to the contents list as item 3 (decision-log
  moved to 4), plus a working-agreement bullet to follow §4 rules while coding.
- Added `wiki/Security.md` and linked it from `wiki/Home.md`, `wiki/_Sidebar.md`,
  `wiki/README.md`, `wiki/Architecture.md`, and `wiki/Admin-Guide.md`.
- Appended this entry.

**Note on wiki sync**: this branch touches `wiki/**`, so merging it to `main` will trigger
`.github/workflows/sync-wiki.yml` — this is the first real exercise of that workflow. If the
push step fails on wiki write permissions, the fix is the `WIKI_SYNC_TOKEN` secret described
in the workflow file's header comment (see the 2026-08-08 wiki entry above, point 4).

**Open items carried forward**: unchanged content checklist from prior entries. Nothing in
this entry blocks Phase 1.

**Not yet started**: still no application code. Phase 1 of plan.md remains the next product
step — now with a defined security gate attached to it.
