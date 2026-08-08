# Website Plan

Status: Planning phase. No code written yet.
Last updated: 2026-08-07

## 1. Goal

Build a personal portfolio website for **Prashant Mudgal** that is polished enough to make a
recruiter or hiring manager stop scrolling — targeting **Senior Software Engineer** roles.
The site must:

- Feel fast, interactive, and intentional (not a template clone).
- Be trivially easy to navigate on desktop and mobile.
- Produce rich, correct link previews when shared on LinkedIn, GitHub, Slack, Twitter/X,
  and iMessage/WhatsApp.
- Cost $0 to build and host, using only free-tier tools and services.
- Be **dynamically updatable** — projects, skills, and other content can be added/edited/
  removed through a private admin panel, with no code edit or redeploy required.

Non-goals: a public-facing blog engine, multi-language support, multi-admin/team accounts
with roles. These add cost/complexity without moving the needle for a single-owner
portfolio site — see [system-design.md](./system-design.md) for the reasoning. (A
self-built single-admin CMS *is* in scope — see section 3a below — this list is about what's
still cut, not a blanket "no CMS" anymore.)

## 2. Decisions locked in

These came from explicit choices with the user and should not be re-litigated without a
reason — see [system-design.md](./system-design.md) for the technical implications of each.

| Decision | Choice | Why | Locked |
|---|---|---|---|
| Framework | Next.js (App Router), standard Vercel deployment (not static export) | Strongest "senior engineer" signal; dynamic content + admin mutations need server-side rendering/API routes, which static export can't provide | 2026-08-07 |
| Hosting | Vercel (free Hobby tier) | Zero-config Next.js deploys incl. serverless functions on the free tier, free custom domain, per-PR preview URLs | 2026-08-07 |
| Content source | Database-backed, editable via admin panel | User wants to add/update/remove projects, skills, and other info without touching code — see section 3a | 2026-08-07 (supersedes original "static content files" decision) |
| Database + Auth | Supabase (free tier: Postgres + Auth + Storage) | One free provider covers the data layer, admin login, and optional image uploads — avoids stitching together three separate free tiers | 2026-08-07 |
| Admin access model | Unlisted route + real authentication (not URL-obscurity alone) | User asked for no nav entry point; a hidden URL alone is not a security boundary (browser history, referrer leaks, guessable routes) — see system-design.md §7 for why auth is non-negotiable even though the route is unlisted | 2026-08-07 |

Open for the user to fill in later (tracked so no context is lost):
- [ ] Real name display preference, headline/title, short bio
- [ ] GitHub username, LinkedIn URL, public contact email, resume PDF
- [ ] Admin login email (which email should be allow-listed for admin access — not
      necessarily the same as the public contact email)
- [ ] Real project list (title, description, stack, links, metrics/impact) — can be entered
      directly via the admin panel once built, doesn't need to be handed over as text
- [ ] Work history / experience timeline
- [ ] Skills list grouped by category
- [ ] Domain name (or default to `*.vercel.app`)
- [ ] Profile photo / avatar

## 3. Core sections (information architecture)

Single-page scroll app with anchor-based sections (fast to navigate, easy to share deep links,
no route-loading jank), plus a couple of standalone routes where a dedicated URL earns its
keep (resume, and per-project detail pages if projects need more than a card can hold).

1. **Hero** — name, one-line value prop (not just a job title), current role/status,
   CTA buttons (View Projects, Resume, Contact). Subtle animated entrance, not gimmicky.
2. **About** — short narrative bio, what kind of engineer you are, current focus. Kept short;
   depth lives in Experience/Projects, not prose.
3. **Experience** — timeline of roles, scannable in 10 seconds, expandable for detail.
4. **Projects** — the section that does the most work. Cards with: title, one-line pitch,
   tech badges, live demo + source links, and a short "what I built / why it mattered" note.
   Optional: filter/sort by tech tag.
5. **Skills** — grouped, not a wall of badges. Signal depth over breadth.
6. **GitHub activity** (stretch, see Phase 5) — live contribution graph / recent repo pull via
   GitHub's public API, proves the profile is current, not a snapshot from 2022.
7. **Social / links** — GitHub, LinkedIn, email, resume download — always reachable (nav +
   footer), not buried at the bottom only.
8. **Contact** — a real contact form (not just `mailto:`), see system-design.md for the
   free no-backend approach.

Standalone routes:
- `/` — the scroll page above
- `/resume` — clean printable resume view (and downloadable PDF)
- `/projects/[slug]` — optional deep-dive page per flagship project, only for 2-3 projects
  that deserve more space than a card (adds its own OG image per project — good for sharing
  a single project link directly)

### 3a. Admin panel (private, unlisted)

Not part of the public navigation, sitemap, or any linked element anywhere on the site.
Reachable only by knowing its exact URL and then authenticating — see
system-design.md §7 for the full auth/security design. Purpose: let the owner add, edit, or
remove content without touching code or redeploying.

Manages:
- Profile (name, headline, bio, links, avatar, resume file)
- Experience entries (add/edit/remove/reorder)
- Projects (add/edit/remove/reorder, mark featured, set slug for `/projects/[slug]`)
- Skills (add/edit/remove, grouped by category)

Explicitly *not* trying to be a general-purpose CMS: no rich content blocks, no multi-user
roles, no revision history/rollback in v1 (all cuttable scope if time-constrained — see
Phase 4 below). It's a small set of typed forms over a database, sized to exactly what this
site's content model needs.

## 4. What "interactive and engaging" means here (concrete, not vibes)

Interactivity should demonstrate engineering taste, not distract from content. Concretely:

- Scroll-triggered reveal animations (sections/cards animate in once, not on every scroll)
- Smooth section-to-section navigation with an active-section indicator in the nav
- Command palette (`Cmd/Ctrl+K`) to jump to any section or open GitHub/LinkedIn — a small
  detail that reads as senior-engineer taste to a technical recruiter
- Light/dark theme toggle, respecting system preference by default
- Project cards with hover-state micro-interactions (not full-card image zoom clichés)
- Optional light easter egg (e.g. a terminal-styled `/whoami` command in the command palette)
  — nice-to-have, cut first if time-constrained

Explicitly avoided: heavy 3D/WebGL hero scenes, autoplay video/audio, parallax that induces
scroll jank on mobile, anything that delays time-to-interactive. Recruiters bounce fast;
performance is itself part of "impressive."

The admin panel is exempt from this bar — it should be clean and fast, not "engaging."
Nobody but the owner ever sees it; polish effort belongs on the public site.

## 5. Social preview requirements

- Every public route has correct Open Graph + Twitter Card meta tags (title, description,
  image, url), generated from live database content so they never go stale.
- OG images are generated dynamically per route (Next.js's `opengraph-image` file convention
  using `ImageResponse`, rendered on request and cached at the edge) — see
  system-design.md §6 for why this got *simpler* once the site stopped being statically
  exported.
- JSON-LD `Person` structured data on the homepage so search engines and some social crawlers
  can build a richer preview (name, jobTitle, sameAs: [GitHub, LinkedIn]).
- The admin route is explicitly excluded from previews/indexing: `noindex, nofollow` meta tag
  and excluded from `sitemap.xml` — it should never appear in a social unfurl or search result.
- Verify previews before calling this "done" using: LinkedIn Post Inspector, Twitter Card
  Validator, Facebook Sharing Debugger, and a raw `curl` of the meta tags.

## 6. Phase plan

Each phase ends with something demoable. Order is chosen so the site is deployable and
shareable early, then gets progressively more capable and polished — never a long stretch
with nothing to show.

### Phase 0 — Planning & system design (this phase)
- [x] Define goals, IA, and interactivity scope (this doc)
- [x] Write system design: architecture, folder structure, data model, deployment
- [x] Fold in dynamic content + admin panel requirement (2026-08-07 revision)
- [x] Document security model: threat model, attack entry points, dev rules, vuln checks
      ([security.md](./security.md), 2026-08-08)
- [x] User reviewed and approved (implementation began 2026-08-08)

Each phase below carries a **security gate** — the corresponding row in
[security.md](./security.md) §6 must pass before the phase counts as done. Security is
built in per phase rather than audited at the end, because the expensive mistakes here
(RLS misconfiguration, a publicly-reachable preview of the admin panel) are foundational
and cheap to prevent but costly to retrofit.

### Phase 1 — Scaffold, deploy skeleton, data layer
- Next.js app scaffolded, deployed to Vercel, custom domain wired (if provided)
- Supabase project provisioned: Postgres schema (profile, experience, projects, skills
  tables), Auth configured, environment variables wired into Vercel
- Base layout, theme system (light/dark), font loading, empty section shells
- CI: GitHub Actions running lint + typecheck + build on every PR
- **Security gate**: RLS enabled in every table-creating migration; `.env.local` git-ignored
  from the first commit; Dependabot, secret scanning, and `npm audit` active in CI
- Goal: a live, blank-but-branded URL exists, backed by a real (empty/seeded) database —
  deployment and data-layer risk both retired on day one

### Phase 2 — Public site against seeded content — **DONE (2026-08-09)**
Security gate closed: the RLS ritual was run against the real Supabase project and passed
after migration 0003 (see decision-log.md).
- Seed script populates the database — now with the owner's real content, not placeholders
- All public sections built and fetching from the database (via typed server-side queries),
  fully responsive
- Resume route + printable/PDF export working
- **Security gate — PASSED**: `curl` leak check done (contact email and phone absent from
  rendered HTML); CSP done (Report-Only, pending a browser console check to enforce); RLS
  ritual run against the live project — reads succeed, all writes refused with 401
- Goal: the whole public site exists and reads correctly, sourced from real infrastructure,
  just with placeholder copy

### Phase 3 — Admin panel
- `/admin` route (unlisted, `noindex`), protected by Supabase Auth + server-side allow-list
  check (see system-design.md §7)
- Login page, session handling, logout
- CRUD forms for profile, experience, projects, skills — server actions writing to Supabase,
  triggering on-demand revalidation so public pages update immediately after a save
- **Security gate** (the heaviest one — see security.md §6): full RLS ritual including the
  non-allow-listed-account case; every Server Action has an auth guard + Zod validation; the
  Postman Test passes on every write path; Vercel preview-deployment exposure resolved
- Goal: owner can add a real project end-to-end through the UI and see it live within seconds

### Phase 4 — Interactivity & polish (public site)
- Scroll animations, command palette, active-section nav, hover micro-interactions
- Accessibility pass (keyboard nav, focus states, contrast, reduced-motion support)
- Performance pass (Lighthouse ≥ 95 across the board, image optimization, font subsetting)
- **Security gate**: no client-side hiding introduced as a substitute for access control;
  any newly added dependency reviewed

### Phase 5 — Social preview & SEO layer
- Dynamic OG image generation per route, Twitter Card + JSON-LD, sitemap.xml (admin route
  excluded), robots.txt
- Validate previews on LinkedIn/Twitter/Facebook debuggers, fix anything that renders wrong
- Favicon set, `manifest.json` for "add to home screen" polish
- **Security gate**: `/admin` confirmed `noindex` and absent from the live sitemap

### Phase 6 — Live content entry
- User logs into the admin panel and replaces placeholder content with real bio/projects/
  experience/links (see checklist in section 2) — no code changes required, this is the
  whole point of Phase 3
- Contact form wired to a real destination email, spam protection verified
- **Security gate**: no real credentials committed to git; admin allow-list email confirmed

### Phase 7 — Launch & feedback loop
- Final cross-browser/cross-device check, analytics wired (privacy-friendly, free tier)
- Share the real URL, collect feedback, iterate
- **Security gate**: full pre-launch checklist (security.md §5.3) plus a securityheaders.com
  scan and a final RLS ritual

## 7. Definition of done (per phase and overall)

A phase is done when: it builds with zero errors/warnings, passes Lighthouse ≥ 90 (all
categories) at minimum, works on mobile viewport, is deployed to a reachable preview URL,
and clears that phase's security gate ([security.md](./security.md) §6).

The admin panel specifically is done when: it cannot be reached without authentication under
any circumstance (verified by attempting direct access while logged out), a save action is
reflected on the public site within a few seconds without a manual redeploy, it is
unreachable from any public navigation, sitemap, or search index, and — the test that
actually matters — **no write succeeds when attempted from Postman without a valid
allow-listed session**, because that verifies the database is enforcing access control rather
than the user interface merely hiding it.

The project is "amaze-a-recruiter" done when: page loads in under ~1.5s on a cold visit,
every social preview renders correctly, keyboard-only navigation works end to end, a person
with zero context can find "what does this person build" within 5 seconds of landing, and
the owner can publish a new project without writing a line of code.

## 8. Notes

- Keep the public site content-driven from the database: never hardcode copy inside
  components. This is what makes both Phase 6 (real content) and ongoing updates after
  launch a form-fill instead of a code change.
- Every decision made outside this document (scope changes, tech swaps, deferred features)
  must be recorded in [decision-log.md](./decision-log.md) as it happens, not reconstructed
  later — see that file's instructions.
