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

---

## 2026-08-08 — Phase 1 begins: project scaffold, CI, security baseline

**Context**: `security-docs` merged (PR #3). User asked to start implementation, with a new
branch per feature/component and a PR for review each time. This is the first code in the
repo — branch `feat/project-scaffold`.

**Scope decision**: Phase 1 in plan.md bundles four things (scaffold, Supabase data layer,
theme system, CI). Split into separate branches per the user's one-branch-per-feature
request rather than one large PR. This branch is the foundation everything else needs:
scaffold + CI + security baseline. Supabase and the theme toggle follow as their own
branches, so Phase 1 stays "in progress" until those land.

**Versions installed** (scaffolded via `create-next-app`, so these are current-latest rather
than chosen individually): Next.js 16.3.0, React 19.2.8, TypeScript 5, Tailwind CSS v4,
ESLint 9. system-design.md §2 specified "Next.js 14+", so 16 is consistent with the plan —
noting the exact versions here because "14+" won't tell a future reader what actually shipped.
Tailwind v4 configures through CSS (`@theme inline` in `globals.css`) rather than a
`tailwind.config.js`, which is why no such file exists.

**Decisions made**:
1. **`src/` directory layout**, diverging from system-design.md §4 which sketched `app/` and
   `components/` at the repo root. `create-next-app`'s current default is `src/`, and keeping
   the tool's default avoids fighting future codegen. The structure inside is otherwise as
   designed. system-design.md §4 should be treated as describing the intended *shape*, not
   exact paths — worth a small correction pass there when the directories actually get
   populated in Phase 2, rather than editing it speculatively now.
2. **Security headers shipped in `next.config.ts`, but deliberately no CSP yet.**
   `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
   `Permissions-Policy`, and HSTS are set and were verified live against a running server
   (all five present in the response, and `X-Powered-By` correctly suppressed). CSP is
   omitted on purpose: Next.js needs either nonce-based CSP via middleware or a permissive
   `unsafe-inline` fallback, and an untested CSP either breaks the app or gives false
   assurance. security.md §6 already schedules CSP as a **Phase 2** gate, so this matches the
   plan rather than deferring something that was due now. Reasoning is in a comment at the
   top of `next.config.ts` so the omission doesn't read as an oversight.
3. **`.gitignore` uses `.env*` with an `!.env.example` exception.** The scaffold's default
   ignores all env files including the example; the negation lets the placeholder template be
   committed while real values stay out (security.md §4.3 rules 10-11).
4. **`.env.example` documents the service-role-key prohibition inline**, not just in KB. The
   most likely moment someone adds one is while filling in env vars, so the warning belongs
   where they'll be looking.
5. **`typecheck` script is `next typegen && tsc --noEmit`.** Next 16 generates global types
   (`LayoutProps`, `PageProps`) into `.next/types`, so a bare `tsc --noEmit` fails on a clean
   checkout — which is exactly what CI does. Running typegen first makes the script
   order-independent and correct on a fresh clone. Found by actually running it; the failure
   is silent-until-CI otherwise.
6. **`npm audit --audit-level=high` blocks CI; moderate and below don't.** Routine advisories
   in a portfolio's dependency tree shouldn't wedge every open PR — Dependabot reports those
   instead. Dependabot is configured to group routine updates but security advisories are
   always raised individually, so grouping doesn't delay real fixes.
7. **Design tokens defined now, theme toggle deferred.** `globals.css` defines light values
   on bare `:root`, dark under both `prefers-color-scheme` (guarded so an explicit light
   choice wins) and `[data-theme="dark"]`. The toggle branch only has to set that attribute.
   Also added a global `prefers-reduced-motion` reset so no future animated component has to
   remember it individually (plan.md §4).

**Verification performed** (not assumed): `npm run lint`, `npm run typecheck`, and
`npm run build` all pass. Production server started on a scratch port and `curl -I` confirmed
every security header; page body confirmed rendering. `npm audit` reports 0 vulnerabilities
across 362 packages.

**Phase 1 security gate status** (security.md §6): `.env.local` git-ignored from the first
commit ✅; `npm audit` in CI ✅; Dependabot configured ✅. **RLS-in-every-migration is not yet
applicable** — no migrations exist until the Supabase branch, where that gate item gets
cleared. GitHub secret scanning and CodeQL are repo *settings*, not files, and need enabling
in the GitHub UI (free for public repos) — carried as an open item below.

**Work completed**: Next.js app scaffolded into the repo (configs, `src/app` layout + page,
`src/lib/site.ts`), `next.config.ts` with security headers, `.gitignore`, `.env.example`,
`.github/workflows/ci.yml`, `.github/dependabot.yml`, rewritten root `README.md`, wiki
Roadmap updated to show Phase 1 in progress, and this entry.

**Open items**: enable GitHub secret scanning + push protection and CodeQL code scanning in
repo settings (free for public repos; not doable from this environment — no `gh` CLI or API
token, same constraint as PR creation). Vercel project connection is also a UI step the user
needs to do once, at which point the deploy-skeleton half of Phase 1's goal is met.

**Next branches**: Supabase data layer (schema + RLS migrations + typed client), then the
theme toggle. Public sections come in Phase 2.

---

## 2026-08-08 — Supabase data layer (branch `feat/supabase-data-layer`)

**Context**: PR #4 (scaffold) merged. Second implementation branch: the Postgres schema, RLS
policies, typed clients, and validation schemas. Continues Phase 1.

**CI observations from the merged scaffold** (worth recording, since they validate or correct
earlier assumptions):
- CI passed on `feat/project-scaffold` and on `main`.
- The **wiki sync workflow's earlier failure was stale** — it failed once at 18:50 on
  2026-08-07 with `repository 'home.wiki' not found`, before the user had created the first
  wiki page. The two runs after that (19:18, 20:01) both succeeded. Notably it worked with
  the default `GITHUB_TOKEN`; the `WIKI_SYNC_TOKEN` fallback flagged on 2026-08-08 was not
  needed. That earlier caveat can be treated as resolved unless it recurs.
- **Dependabot PR #7 fails CI**: `typescript-eslint does not support TS 7.0`. Root cause is a
  flaw in the `dependabot.yml` written on 2026-08-08 — the `dev-dependencies` group has no
  `update-types` restriction, so *major* bumps get batched into it, and TypeScript 7 is
  ahead of what typescript-eslint supports. The production group was correctly limited to
  minor/patch; dev was not. Fix is to add the same restriction so majors arrive as individual
  reviewable PRs. Not done on this branch to keep it scoped — flagged to the user as a
  separate small change.

**Decisions made**:
1. **Authorization via an `admin_allowlist` table + `public.is_admin()`**, rather than
   hardcoding the admin email into each policy. Changing the admin becomes a one-row update
   instead of a schema migration. The table has RLS enabled with **zero policies**, which
   makes it completely unreachable through PostgREST — deliberate, because an attacker who
   could insert their own address there would own every write path on the site.
2. **`is_admin()` is `security definer` with `search_path` pinned to `''`** and every object
   schema-qualified. It needs definer rights to read the allow-list that clients cannot, and
   an unpinned search path is the standard way such functions get hijacked. Fails closed for
   anonymous requests, where `auth.jwt()` is null.
3. **Two independent authorization layers, not one.** `anon` is granted `select` only and is
   never granted insert/update/delete on any table; policies then additionally require
   `is_admin()`. A policy bug alone cannot produce an anonymous write, because the privilege
   is absent. This goes beyond what security.md §4.1 specified and is now documented in
   system-design.md §5.
4. **Policies written out explicitly per table per operation** (16 of them) rather than
   generated in a `DO` loop or collapsed into `for all`. Verbose on purpose — security.md
   §4.1 rule 2 asks for configuration that is reviewable at a glance, and a loop is not.
5. **URL/slug/date rules enforced in the database as CHECK constraints, and mirrored in Zod.**
   The `~* '^https?://'` constraints implement security.md §3.2's `javascript:` URI defense
   at the layer that cannot be bypassed; the Zod copy exists to turn a would-be PostgREST 400
   into a readable field error. Duplication is intentional and noted in both files.
6. **Env vars read lazily inside a function, not validated at module scope.** CI builds
   without Supabase credentials; a module-level throw would have failed every PR before any
   query existed. Verified: `npm run build` succeeds with no Supabase env set. **This becomes
   a real question in Phase 2**, when pages actually query at build time — CI will then either
   need the credentials or the pages will need to tolerate their absence. Flagging now rather
   than discovering it mid-phase.
7. **`to*Insert` helper functions as compile-time drift guards.** They are identity functions
   at runtime; their only job is the type annotation, which fails to compile if a Zod schema
   drifts out of shape with its table.
8. **DB types hand-written** rather than generated, since there is no project to generate
   against yet. `supabase gen types typescript` can replace the file once one exists — noted
   at the top of `types.ts`.
9. **Seed data included in this branch** even though plan.md assigns seeding to Phase 2. The
   RLS ritual needs rows to attempt UPDATE/DELETE against — an empty table cannot demonstrate
   that a write was *refused* rather than simply finding nothing to change. Seeding is
   therefore a prerequisite of this branch's own security gate, not Phase 2 work pulled
   forward.

**Verification performed**: `npm run lint`, `npm run typecheck`, and `npm run build` all pass.
The drift guard in decision 7 was tested rather than assumed — deliberately renaming
`title` to `titel` in the project schema produced the expected compile error naming the
mismatch, and the file was restored and re-verified clean.

**NOT verified, and this matters**: neither Docker nor a local Postgres is available in this
environment, so **the migration SQL has never been executed and the RLS policies have never
been exercised**. The schema is written from the design and reviewed by eye; it is not
tested. The first real test is the user applying it to a Supabase project and running the
RLS ritual, which is why `supabase/README.md` spells that out with copy-pasteable `curl`
commands rather than leaving it as a reference to security.md. Treat the Phase 1/2 RLS gate
as **open** until that ritual has actually been run and passed.

**Work completed**: `supabase/migrations/0001_content_schema.sql` (4 content tables +
allow-list, constraints, `updated_at` triggers, grants, 16 RLS policies),
`supabase/seed.sql`, `supabase/README.md` (setup + the RLS ritual as runnable commands),
`src/lib/supabase/{types,env,client,server}.ts`, `src/lib/schemas.ts`, `.env.example`
updated to active Supabase vars, system-design.md §5 rewritten to match what was actually
built, and this entry.

**Open items**: user must create the Supabase project, apply the migration and seed, replace
the placeholder allow-list email, and run the RLS ritual. Plus the still-outstanding repo
settings from the previous entry (secret scanning, CodeQL) and the Vercel connection.

---

## 2026-08-08 — Site chrome: header, footer, theme system, section shells (`feat/site-chrome`)

**Context**: PR #8 merged. Third implementation branch, completing Phase 1's remaining layout
bullet ("base layout, theme system, font loading, empty section shells" — fonts landed with
the scaffold).

**Scope decision**: theme system and layout shell were built as one branch rather than two.
They are naturally coupled — the toggle needs somewhere to live, and the nav needs section
anchors to point at. Splitting them would have meant building a temporary home for the toggle
and then moving it, i.e. churn in place of a cleaner review.

**Two findings worth recording, both discovered by testing rather than reasoning:**

1. **`next/script` with `strategy="beforeInteractive"` does not work for a no-flash theme
   script in the App Router.** It was the first implementation and it looked correct. Serving
   the production build and reading the HTML showed what it actually emits: a
   `<link rel="preload">` hint in `<head>`, plus a
   `(self.__next_s=self.__next_s||[]).push([...])` queue entry that Next drains during
   hydration. That is far too late — the page has already painted. The flash would only have
   affected users whose stored preference differs from their OS setting, which is exactly the
   population the script exists for, so it would have been easy to miss in casual testing.
   **Fix**: a plain, un-decorated `<script src>` as the first element in `<body>`. A classic
   synchronous script blocks parsing where it sits, so nothing visible has been parsed yet
   when it runs. Verified in the served HTML: the tag now appears at byte 1508, before any
   visible markup. A comment in `layout.tsx` records this so nobody "modernises" it back into
   `next/script`.

2. **React 19's `react-hooks/set-state-in-effect` lint rule rejected the first
   ThemeProvider.** The read-localStorage-on-mount pattern (`useEffect` → `setState`) is the
   conventional approach and is now flagged. Rather than suppress it, the provider was
   rewritten around **`useSyncExternalStore`**, which is the correct API for reading external
   mutable state: it handles the server/client split explicitly (`getServerSnapshot` returns
   `null`, meaning "unknown") instead of guessing during render. Two things fell out of that
   for free — cross-tab sync via the `storage` event, and **the provider component became
   unnecessary entirely**, since the store is module-level. The lint rule pointed at a genuinely
   better design, not just a style preference.

**Decisions made**:
1. **Theme state lives in the DOM and localStorage, not React.** `public/theme-init.js` must
   apply the theme before React exists, so the DOM is already the source of truth by the time
   components mount. `useSyncExternalStore` reads from there rather than duplicating it.
2. **No-flash script kept as a static file, not inlined.** This upholds security.md §4.2
   rule 8 (never `dangerouslySetInnerHTML`, which is how inline scripts get injected in React)
   and has a second payoff: an external script needs no CSP nonce or hash, so the Phase 2 CSP
   can stay `script-src 'self'` without special-casing. Cost is one tiny same-origin request.
3. **Cookie-based theming was considered and rejected.** Reading a cookie server-side would
   give zero flash and no client script at all — but it forces dynamic rendering, which would
   disable ISR caching on every page just to pick a colour scheme. Wrong trade for a content
   site whose whole performance story is edge caching (system-design.md §3).
4. **Toggle switches light/dark only; "follow system" is the default but not a third
   selectable state.** A three-way cycle needs explanatory UI to be usable. Absence of a
   stored value means "follow system", and the OS is still tracked live via a `matchMedia`
   listener while no explicit choice exists.
5. **Nav scrolls horizontally on small screens rather than collapsing to a hamburger.** Five
   short links fit on a phone; a menu would add JavaScript, a focus trap, and an escape-key
   handler for no benefit at this size.
6. **Footer deliberately ships without social links.** Those belong to the profile record and
   arrive with database content in Phase 2 — hardcoding placeholder URLs would be exactly the
   "content inside components" pattern plan.md §8 exists to prevent.
7. **Skip-to-content link added**, and section anchors carry `scroll-mt-14` so a nav jump
   does not land with the heading hidden under the sticky header.

**Verification performed**: lint, typecheck, and build all pass. Production server served and
HTML inspected to confirm — blocking script present and positioned before visible markup; all
five section anchors present with matching nav hrefs; skip link present; `aria-label`s on the
nav and toggle. **The string "admin" appears zero times in the rendered HTML**, confirming the
unlisted-route requirement (plan.md §3a) holds at the markup level. The theme script's logic
was unit-tested against a mock DOM across five cases including junk values and a localStorage
that throws (private browsing) — all pass.

**Not verified**: no browser automation available here, so the *visual* absence of a theme
flash has not been observed directly — the claim rests on the script's position in the
document and the tested logic. Worth a manual check on the Vercel preview.

**Work completed**: `public/theme-init.js`, `src/components/theme/{use-theme.ts,theme-toggle.tsx}`,
`src/components/layout/{header.tsx,footer.tsx}`, `src/components/ui/section.tsx`, rewritten
`src/app/layout.tsx` and `src/app/page.tsx`, `lucide-react` added, and this entry.

**Still open**: the `dependabot.yml` dev-dependencies group still batches major bumps (see the
previous entry); PR #7 remains red. Not fixed here to keep this branch scoped.

---

## 2026-08-08 — Fixes: Dependabot major grouping, static footer year (`fix/dependabot-major-grouping`)

**Context**: PR #9 merged. Clearing the two outstanding defects before starting Phase 2.

**Fix 1 — Dependabot batched three unrelated majors into one PR.**
Inspecting PR #7's diff showed it bumping `typescript` 5→7, `eslint` 9→10, and `@types/node`
20→26 *together*. CI failed on `typescript-eslint does not support TS 7.0`, and because they
were grouped there was no way to take the safe parts. Root cause was in the `dependabot.yml`
written on 2026-08-08: the production group was correctly limited to minor/patch, but the
dev-dependencies group had no `update-types` restriction, so majors fell into it.

- **Both groups now restricted to minor/patch.** Majors arrive as individual PRs that can be
  evaluated and tested on their own merits. Security advisories are unaffected — they are
  always raised individually and ignore grouping entirely.
- **Added a scoped `ignore` for TypeScript majors only.** Without it Dependabot re-raises the
  same known-broken PR every week. This is deliberately narrow: `eslint` 10 and
  `@types/node` 26 are *not* ignored, because they have not been shown to break anything and
  should be judged by CI on their own. The ignore carries an explicit removal condition
  ("remove once typescript-eslint ships TS 7 support") so it reads as a temporary block on a
  known incompatibility rather than a standing policy of skipping TypeScript majors.

**Fix 2 — Footer year was frozen at build time.**
`new Date().getFullYear()` in the footer looked harmless, but the home page is statically
prerendered, so the value is evaluated during `next build` and baked into the HTML. Confirmed
by grepping the served output: the literal string `2026` was present. The site would have
displayed "© 2026" throughout 2027 until something happened to trigger a redeploy — a stale
detail on a page whose entire purpose is looking current to a recruiter.

Considered rendering it client-side and rejected that: it means shipping JavaScript and
risking a hydration mismatch for a line nobody reads. **The year is simply omitted** —
`© Prashant Mudgal` is correct in every year. A comment records the reasoning so it does not
get "helpfully" re-added.

This is a small instance of a general hazard worth remembering for Phase 2: **anything
time-dependent or request-dependent in a statically prerendered component is frozen at build
time.** Relative dates ("2 years experience"), "last updated" stamps, and anything derived
from `Date` will all have this property once real content lands.

**Verification**: `dependabot.yml` parsed and its structure asserted (both groups restricted,
ignore rule shaped correctly). Lint, typecheck, and build pass. Production server served and
the rendered HTML confirmed to contain zero occurrences of `2026`.

**Recommended alongside this PR**: merge Dependabot PRs **#5** (actions/checkout 4→7) and
**#6** (actions/setup-node 4→7) — both green, and they also clear the "Node.js 20 is
deprecated" warnings appearing in every CI run. Close **#7** as superseded; its individual
components will return as separate PRs under the corrected config.

---

## 2026-08-08 — Phase 2 begins: sections rendered from database (`feat/content-sections`)

**Context**: PR #10 merged. First Phase 2 branch — the public sections now read real content
from Supabase instead of showing hardcoded placeholder text.

**Unanswered question resolved by decision**: the previous entry asked whether CI should build
against a real Supabase project (repo secrets) or whether pages should tolerate absent
credentials. Went with **tolerate absent credentials** — CI stays independent of an external
service, and the same code path gives the site a sensible empty state if Supabase is ever
unreachable. Verified: `npm run build` succeeds with no Supabase env set.

**The significant find of this branch — a bug that would have shipped silently.**

The first implementation had `lib/content.ts` reading through `lib/supabase/server.ts`, the
cookie-bound client. Testing the failure path with deliberately unreachable credentials
surfaced this in the build log:

```
[content] failed to load profile: Error: Dynamic server usage: Route / couldn't be
rendered statically because it used `cookies`
```

Two compounding faults:

1. **Touching `cookies()` opts the route out of static rendering permanently.** That silently
   discards ISR and edge caching — the entire performance argument for this architecture
   (system-design.md §3) — in exchange for a session the public page never needed.
2. **The `catch` swallowed Next's control-flow exception.** Next signals dynamic-rendering
   bailouts by *throwing*. Catching it convinced Next the page had rendered fine, so it would
   have been prerendered **permanently empty** in production. The site would have looked like
   "no content added yet" forever, with a green build and no error anywhere.

This is precisely the failure mode the file's own comment warned about ("silent empty states
are how a broken query survives to production"), which is a reminder that documenting a
hazard is not the same as being immune to it.

**Fixes**:
- **New `lib/supabase/public.ts`** — a cookie-free anon client for public reads. Public
  content needs no session; the anon key plus the public `select` RLS policy is exactly the
  required access level. Pages stay statically renderable. The rule is now explicit in both
  files: *public reads use `public.ts`; anything involving a logged-in admin uses
  `server.ts`.*
- **`rethrowIfFrameworkError()`** — re-throws any error carrying a `digest`, which is how Next
  signals control flow (dynamic bailout, `notFound`, `redirect`). Catching those changes
  program behaviour rather than handling a failure.

**Verification performed** (beyond lint/typecheck/build):
- **Failure path**: built against an unreachable Supabase URL. The `cookies` bailout is gone;
  failures are now genuine `TypeError: fetch failed`, logged, and the page still prerenders
  with `Revalidate 1h`.
- **Happy path**: wrote a mock PostgREST server and built against it, because shipping render
  code that has never seen data is a gamble. All sections rendered — profile, location,
  experience with highlights, projects with featured flag and stack tags, skills. Date ranges
  formatted correctly as "Jan 2023 — Present" and "Jun 2020 — Dec 2022", confirming the UTC
  parsing avoids the off-by-one-month bug.
- **Leak check**: made the mock return `contact_email` even though no query selects it. It did
  **not** appear in the served HTML. The reason turned out to be more specific than expected
  and is now documented in `content.ts`: **props passed to Server Components are not
  serialized into the RSC payload — only their rendered output is.** Over-fetching is
  therefore invisible today, but that protection vanishes the moment a section becomes a
  Client Component, since client props *are* serialized. Narrowing the `select` is the defence
  that holds either way, which is why it stays the rule rather than "keep sections on the
  server".

**Other decisions**:
1. **`export const revalidate = 3600`** as a backstop only. Phase 3's admin saves will call
   `revalidatePath('/')` for near-immediate updates; the hourly window just bounds staleness
   if that ever fails.
2. **Queries issued with `Promise.all`** — they are independent, and awaiting in sequence
   would make the page as slow as their sum.
3. **`lucide-react` 1.x has removed all brand icons** (no `Github`, `Linkedin`, `Twitter`);
   this broke the build and had to be worked around. Rejected hand-embedding logo SVG paths —
   with no browser available here, a subtly wrong path would ship looking broken. Used a
   uniform external-link arrow instead; the text labels already carry the meaning.
4. **Contact email is never selected for public pages**, so the address cannot reach the
   client at all. Reaching out will go through the form in Phase 6.
5. **No duration arithmetic in `formatDateRange`** ("3 years experience" etc.). Same
   build-time-freezing hazard as the footer year fixed in the previous entry — "Present" is
   derived from `end_date` being null, which is data-driven and safe.

**Work completed**: `src/lib/content.ts`, `src/lib/supabase/public.ts`, `src/lib/format.ts`,
`src/components/ui/tag.tsx`, six section components under `src/components/sections/`,
rewritten `src/app/page.tsx`, and this entry.

**Still open for Phase 2**: resume route with printable export, and the CSP headers deferred
from Phase 1 — each its own branch. The Phase 2 security gate also requires the RLS read-path
ritual against the real project, which still depends on the user provisioning Supabase.

---

## 2026-08-08 — Content-Security-Policy, in Report-Only mode (`feat/csp-headers`)

**Context**: Closes the CSP item deferred from Phase 1, which was postponed specifically so it
could be written against a real build instead of guessed at.

**What the build actually contains** (measured, not assumed): the served HTML has 10 `<script>`
tags — 8 external, all same-origin under `/_next/static/`, and **2 inline**: Next's RSC
bootstrap (43 bytes) and an ~11KB RSC payload. Zero inline `<style>` blocks and zero `style=`
attributes.

**Decision: `script-src` permits `'unsafe-inline'`.** Both stricter alternatives were ruled out
by the measurement above:
- **Hashes** would need recomputing whenever the payload changes, which for a database-backed
  site means on every admin save. Unworkable.
- **Nonces** must vary per request, so HTML carrying one cannot be cached. That disables ISR
  on every page — the caching this whole architecture rests on (system-design.md §3) — to
  harden a single path.

The residual XSS risk is bounded by properties this codebase already has:
`dangerouslySetInnerHTML` is banned (security.md §4.2 rule 8, still zero occurrences), React
escapes interpolated values, and no user-submitted content is rendered anywhere. The policy
still blocks the thing that matters most in practice — loading script from an
attacker-controlled origin — plus base-tag injection, form hijacking, plugin embedding, and
framing. Verified 0 cross-origin scripts in the output, so `'self'` is not aspirational.

This is also where the Phase 1 decision to keep the theme script in a static file pays off: it
needs no CSP exception at all.

**Decision: shipped as `Content-Security-Policy-Report-Only`, not enforcing.** A policy that is
subtly too strict breaks the site silently in the browser, and this one has never been loaded
by a browser — there is none in this environment. Report-Only surfaces violations in the
console while blocking nothing, which is the standard rollout path. Shipping an unverified
enforcing policy would repeat the mistake Phase 1 avoided by deferring CSP in the first place.

**To enforce, once verified** (steps kept here so they survive independently of runbook.md):
1. Open the Vercel deploy preview for this PR (or production after merge).
2. Open DevTools → Console. Look for `Content-Security-Policy-Report-Only` violation entries.
3. Click through: home page, theme toggle, every nav anchor, every external link.
4. If the console is clean, change `CSP_HEADER_NAME` in `next.config.ts` from
   `"Content-Security-Policy-Report-Only"` to `"Content-Security-Policy"`.
5. If violations appear, they name the blocked directive and origin — add that origin to the
   relevant directive rather than loosening `default-src`.

**Decision: CSP applies in production only.** Next opens a websocket for hot reload in
development, which `connect-src 'self'` flags on every page load; that noise would bury real
violations. Verified: production response carries the CSP header, development does not, and the
five baseline security headers are present in both.

**Known follow-up**: `form-action 'self'` will need revisiting when the contact form is wired
up in Phase 6, since it posts to a third-party endpoint (Web3Forms/Formspree). Noted in a
comment at the directive itself rather than only here, so whoever adds the form sees it.

**Verification performed**: lint, typecheck, build pass. Production server served and all six
headers confirmed present with correct values; dev server confirmed to omit CSP while keeping
the baseline headers; script origins confirmed 100% same-origin. **Not verified**: actual
browser enforcement behaviour — which is precisely why it ships in Report-Only.

---

## 2026-08-08 — `main` broken by ESLint 10; restored (`fix/restore-eslint-9`)

**Context**: User merged all outstanding PRs (#5, #6, #11, #12, #14, #15) and asked for a full
re-check. The re-check found `main` red.

**What was broken**: `npm run lint` crashed outright —
`TypeError: Error while loading rule 'react/display-name': contextOrFilename.getFilename is
not a function`. Cause: `eslint-config-next@16.3.0` bundles `eslint-plugin-react@7.37.5`,
which uses the pre-ESLint-10 rule context API. ESLint 10 arrived via Dependabot PR #11.

**Two separate failures let it land, and both are worth fixing rather than just the symptom:**

1. **PR #11's CI had failed, and it was merged anyway.** Confirmed via the API: that branch's
   run concluded `failure`. There is no branch protection on `main` yet — it is step 4 of
   runbook.md and has not been done. That single setting would have prevented this.
2. **The intermediate CI runs never completed.** The workflow's `cancel-in-progress: true`
   cancelled superseded runs on the same ref, so merging six PRs in quick succession meant
   each merge cancelled the previous one's verification. Only the final run finished — and
   failed. Every merge in between was effectively unverified. This was a flaw in the CI
   config written on 2026-08-08, not user error.

**Fixes applied**:
- **ESLint pinned back to `^9`** (9.39.5). Verified lint passes again.
- **Dependabot now ignores ESLint majors**, alongside the existing TypeScript ignore, with an
  explicit removal condition: remove once `eslint-config-next` ships an `eslint-plugin-react`
  new enough for ESLint 10. Without this the same broken PR returns weekly.
- **`cancel-in-progress` narrowed to pull requests only**
  (`${{ github.event_name == 'pull_request' }}`). PR branches still cancel superseded runs,
  but every push to `main` now runs to completion, so a broken merge cannot hide behind a
  cancelled run again.

**Verified after the fix**: clean `npm ci` from scratch, then lint, typecheck, build, and
`npm audit --audit-level=high` all pass. `@types/node` 26 and the `actions/checkout@v7` /
`actions/setup-node@v7` bumps (PRs #12, #5, #6) are fine and were kept — only ESLint was
reverted.

**Note on the Dependabot grouping fix from earlier today**: it worked exactly as designed —
the three majors arrived as separate PRs instead of one batch, which is why `@types/node` 26
could be kept while ESLint 10 was reverted. The grouping fix was never meant to judge whether
a major is safe; CI does that, and CI did. The gap was that its verdict was not enforced.

**Recommendation to the user**: enable branch protection on `main` (runbook.md §4) —
require a PR and require the `verify` check to pass. It is the control that turns "CI is
green before merge" from a habit into a guarantee, and this incident is precisely what it
prevents.

---

## 2026-08-08 — Real content seeded from CV; asset URL validation fixed (`feat/real-content`)

**Context**: User supplied their CV and a photograph, and asked that placeholders be used
wherever content is missing. Branched from `fix/restore-eslint-9` rather than `main`, because
`main` currently fails lint — **this PR should merge after #16.**

**Content decisions** (all reviewable and editable once the admin panel exists):

1. **Phone number deliberately omitted.** The CV carries one; a phone number on a public page
   is scraped within days and cannot be un-published. Recruiters have the contact form and
   LinkedIn. Verified absent from the rendered HTML.
2. **Email stored but never published.** `contact_email` is set in the profile row but is not
   in any public `select` (src/lib/content.ts), so it cannot reach the browser. Verified: zero
   occurrences in the served HTML.
3. **Projects synthesised from work achievements.** The CV has no standalone projects section,
   but Projects is the section doing the most work on a portfolio (plan.md §3). Three
   substantial pieces of Nuclei work were reframed as project cards — Merchant Marketplace
   flight booking, the Fedmobile migration, the Strapi content platform — plus the genuine
   Virtual Walkathon side project. `source_url` is null throughout, because the work is
   proprietary and linking somewhere unrelated would be worse than linking nowhere. **This is a
   judgement call and is flagged as TODO(owner) in the seed file.**
4. **Bio drafted from CV facts**, marked TODO(owner) to rewrite in their own voice — it is the
   first thing a recruiter reads, and it should not be in an assistant's register.
5. **Education and accomplishments have nowhere to live.** There are no tables for them, and
   plan.md §3's information architecture never included such sections. Rather than unilaterally
   adding schema, the strongest signals (gold medal, CGPA, HashCode global rank 527) were
   folded into the bio. If dedicated sections are wanted, that is a migration plus new admin
   CRUD — cheapest to decide before Phase 3 builds the admin forms.
6. **GitHub URL inferred** as `github.com/mudgalprashant` from this repository's own remote —
   the CV does not list one. LinkedIn is marked TODO(owner): the CV hyperlinks the word
   "LinkedIn" but the underlying URL was not in the text received.

**Bug fixed — asset URLs could not reference files in `public/`.** Migration 0001 constrained
`github_url` and `linkedin_url` to `^https?://` but left `resume_url` and `avatar_url`
unconstrained, while `src/lib/schemas.ts` required absolute URLs for all four. So a resume
committed to `public/resume.pdf` could be stored by the database but **rejected by the admin
form** — a mismatch that would only have surfaced when the user first tried to save one.

Both layers now accept an absolute http(s) URL *or* a site-relative path, via new migration
`0002_asset_url_constraints.sql` and a new `assetUrl` schema. The pattern
`^(https?://|/(?!/))` is deliberate: `/resume.pdf` passes, while `//evil.com` — which browsers
resolve to an external origin despite looking local — does not. Tested against eight inputs
including protocol-relative, `javascript:`, `data:`, and backslash variants; all behaved
correctly.

**Verification**: lint, typecheck, and build pass with no Supabase env. Built and served
against a mock PostgREST loaded with the real seed data: every field rendered, date ranges
formatted correctly ("Oct 2025 — Present", "Jul 2022 — Sep 2025", "May 2021 — Jul 2021"), and
both the email and phone number confirmed absent from the HTML.

**Assets still outstanding**: the resume PDF and a square headshot. Binaries cannot pass
through a chat transcript, so the handover is for the owner to commit them to `public/` and
say so. The photograph supplied is a landscape scenic image — good as a hero or OG background,
but not croppable into an avatar, so it was not wired in. Recorded in runbook.md §2.

**Also noted for the owner**: the CV misspells "Claude" as "Calude" in the first SDE-II bullet.
Corrected in the seed text; worth fixing in the PDF before it goes to recruiters.

---

## 2026-08-08 — Avatar and resume assets wired in (`feat/real-content`, cont.)

**Context**: Owner placed `resume.pdf` and a 2816×1536 `image.png` in `public/` and asked for
the image to be cropped, noting it is placeholder imagery rather than a real photograph.

**Work done**:
1. **Avatar produced from the landscape source.** Cropped a full-height 1536×1536 square with
   its left edge at x=1105, chosen so the hiker sits near the centre — the hero applies a
   circular mask, and a subject near an edge gets clipped by it. Downscaled to 800×800, JPEG
   quality 82. Result: 6.7 MB → 124 KB. Exact commands recorded in runbook.md §2.
   - **The first attempt got it wrong and was caught by looking at the output.**
     `sips --cropOffset` treats its second argument as the crop window's absolute left edge,
     not an offset from centre. The initial value put the hiker hard against the right edge,
     where the circular mask would have cut him in half. Reading the rendered JPEG back showed
     it immediately; recomputing the origin fixed it. Worth remembering that image work cannot
     be verified by reasoning about coordinates alone.
2. **The 6.7 MB PNG source was deliberately not committed.** Everything in `public/` is
   publicly downloadable, and a file that size would be in git history permanently. The derived
   124 KB image is what the site needs. Flagged to the owner rather than done silently.
3. **Avatar rendering added to the hero** via `next/image`, with `alt=""` — the name it
   illustrates is in the adjacent `<h1>`, so a description would only make a screen reader
   repeat itself. `priority` set because it is above the fold.
4. **`images.remotePatterns` configured for `*.supabase.co`.** `avatar_url` accepts either a
   site-relative path or an absolute URL, and Storage is where uploads will land in Phase 3.
   Scoped to that single host rather than a wildcard: an open image host lets anyone route
   traffic through this site's optimizer. Matches the CSP `img-src` directive in the same file.

**Verification**: lint, typecheck, build pass. Served the production build against the mock and
confirmed the `<img>` renders with a responsive `srcSet`, both assets serve (`/avatar.jpg` 200
image/jpeg, `/resume.pdf` 200 application/pdf), and the optimizer returns WebP — 124 KB JPEG
down to **7.3 KB** at 256px.

**A stale build cache briefly hid the change.** The avatar did not appear in the served HTML
until `.next` was removed and the project rebuilt, despite the component and data both being
correct. Noting it because the symptom — verified-correct code producing output that does not
contain it — is easy to misdiagnose as a data problem. When output contradicts source, clear
`.next` before investigating further.

**Privacy note carried forward**: the resume PDF contains the phone number and email that were
deliberately kept off the rendered page, and it is publicly downloadable. Normal for a
portfolio and possibly intended, but it partially undoes that omission, so it should be a
decision rather than an accident.

---

## 2026-08-08 — Resume route; Phase 2 code complete (`feat/resume-route`)

**Context**: PRs #16 and #17 merged. `main` re-verified from a clean `npm ci` — lint,
typecheck, build, and audit all pass, and both assets are present. This branch adds the last
outstanding Phase 2 item.

**Work done**:
1. **`/resume`** — a printable resume rendered from the same database content as the home
   page, so the two cannot drift apart. ISR at the same 1h backstop. Renders summary,
   experience with date ranges and highlights, and skills.
2. **Print handling.** Site chrome (header, footer) and the page's own toolbar carry
   `print:hidden`, so paper output starts at the name rather than repeating navigation. A
   `@media print` block forces the palette back to black-on-white: browsers drop background
   colours when printing, so a reader on the dark theme would otherwise have printed pale grey
   on white. Verified both rules are present in the compiled CSS, not just the source.
   `break-inside-avoid` on each role stops a job being split across a page boundary.
3. **Deliberately no rule appending `href` values after links in print.** It is a common print
   idiom, but the only external links on this page already display their URL as the link text,
   so it would have printed each one twice.
4. **Contact section now links to `/resume`, not straight to the PDF** — the page opens in
   place, reads on a phone, and offers the download from there. Rendered with `next/link` and
   no `target="_blank"`, since it is same-origin and should navigate client-side rather than
   spawn a tab. The section's placeholder branch became dead code once Resume was always
   present, so the component was rewritten rather than left with an unreachable path.

**Known limitation, stated rather than hidden**: the printable page renders only what the
schema holds — profile, experience, skills. There are no tables for education or awards, so
the gold medal, CGPA, and HashCode ranking appear in the downloadable PDF but not on `/resume`.
Adding them is a migration plus admin CRUD, and remains the open decision flagged on
2026-08-08. A comment at the top of the route records this so the gap is not mistaken for a
bug.

**Verification**: lint, typecheck, build pass; `/resume` builds as a static ISR route. Served
against the mock and confirmed: HTTP 200, all content sections render, title is
"Resume · Prashant Mudgal", the download button points at `/resume.pdf`, the home page links
to `/resume`, and the contact email and phone number are absent from the page.

*(A `grep -c` briefly suggested only one of the three `print:hidden` classes had applied. It
had not — `grep -c` counts matching lines and the HTML is a single line. Measurement error,
not a defect; noted because it nearly sent me debugging working code.)*

**Phase 2 status: code complete, phase NOT closed.** Both remaining items need the owner, not
more code:
- **RLS read-path verification** (security.md §5.2) cannot run until Supabase is provisioned.
  The migrations have still never been executed anywhere.
- **CSP is Report-Only** and needs a browser console check before being switched to enforcing.

plan.md and wiki/Roadmap.md updated to say exactly this, rather than marking the phase done.
