# Owner Runbook

Everything on this project that requires an account, a credential, or a click in someone
else's dashboard — the tasks an AI assistant or a new contributor cannot do for you.

Last updated: 2026-08-08

---

## 1. Handling secrets

### The rule

**Never paste a credential into a chat, an issue, a PR description, or a commit.**

That includes conversations with an AI assistant. Anything typed into a chat exists in a
transcript, and transcripts get stored, synced, and sometimes reviewed. A credential that
touches one is compromised whether or not anyone acts on it.

This costs nothing to follow, because **no one working on this codebase ever needs to see a
secret's value.** Code refers to credentials by variable *name*. If a value needs testing,
the person with access runs the check and reports "works" or "fails" — never the value.

### What is actually secret here

Not everything that looks like a key is one. Getting this distinction right matters, because
treating a public value as secret wastes effort, and treating a secret as public is a breach.

| Value | Secret? | Where it belongs |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **No** — public by design | `.env.local` + Vercel env vars |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **No** — ships in the browser bundle by design | `.env.local` + Vercel env vars |
| Supabase database password | **Yes** | Supabase dashboard only. The app never uses it. |
| Supabase `service_role` key | **Yes — and never use it at all** | Nowhere. Do not copy it anywhere. See below. |
| Contact-form provider access key | Semi-public (designed for client-side use) | `.env.local` + Vercel env vars |
| GitHub Personal Access Token, if ever needed | **Yes** | GitHub repository secrets only |

Two entries deserve expanding:

**The anon key is not a secret.** It ships inside the JavaScript bundle and anyone can read
it in seconds. That is the intended design — Postgres Row Level Security, not key secrecy, is
what prevents unauthorized writes (`security.md` §1). Do not spend effort hiding it, and do
not treat its exposure as an incident.

**The `service_role` key must never enter this project.** It bypasses RLS entirely, so it
would undo every protection in `supabase/migrations/0001_content_schema.sql`. The architecture
has no use for one. Its absence is itself a security control (`security.md` §4.1 rule 4) — if
you ever find one in the repo or in Vercel, that is a defect to remove, not a feature.

### Where to put each value

Two places, both of which you enter directly. Neither passes through anyone else.

**Local development** — `.env.local` in the repo root:

```bash
cp .env.example .env.local
# then edit .env.local and fill in the values
```

`.env.local` is git-ignored (`.gitignore` ignores `.env*` with a single exception for
`.env.example`). Verify before your first commit:

```bash
git check-ignore -v .env.local   # should print the matching .gitignore rule
git status --short                # .env.local must NOT appear
```

**Production** — Vercel dashboard → Project → Settings → Environment Variables. Add each
variable for Production, Preview, and Development. Vercel encrypts them at rest and injects
them at build and run time. Never commit them.

**GitHub Actions** — Settings → Secrets and variables → Actions, only if a workflow genuinely
needs one. Nothing currently does.

### Safety net: turn on push protection

GitHub can block a push that contains a recognizable credential, before it ever reaches the
remote. Enable it (see §4) — it has caught real leaks that careful people made.

### If a secret leaks

Assume compromise the moment it is exposed, and act in this order:

1. **Rotate first.** Generate a new value at the source (Supabase, GitHub, form provider) and
   update `.env.local` and Vercel. Nothing else matters until this is done.
2. **Then clean up if you like.** Deleting the commit is *not* a fix on its own — the value is
   already in the remote's history, in every clone, and in GitHub's cached views. Rotation is
   what makes the old value worthless.
3. Note it in `decision-log.md` so the timeline is honest.

For Supabase specifically, rotating the anon/service keys means rotating the project's JWT
secret (Project Settings → API → JWT Settings). That invalidates existing sessions, so expect
to sign in again.

---

## 2. Static assets needed from you

Drop files into `public/` and tell me the filenames, or hand them over however you prefer —
I only need to know what exists and where. **None of these block current work**; the site
renders without them.

Binary files cannot be handed over through a chat transcript. **Commit them into `public/`
yourself and say what you added** — that is the whole handover.

| Asset | Format & size | Commit to | Status |
|---|---|---|---|
| Resume PDF | PDF, ideally < 2 MB | `public/resume.pdf` | **Outstanding.** CV *content* received and seeded; the file itself is still needed for the download link |
| Profile photo | **Square**, ≥ 800×800, JPG/PNG | `public/avatar.jpg` | **Outstanding.** A landscape photograph was supplied — usable as a hero or OG background, but not as an avatar (see below) |
| Favicon source | 512×512 PNG or an SVG | `public/` | Outstanding, needed by Phase 5 |

Once a file is committed, its value in the database is the site-relative path — `/resume.pdf`,
`/avatar.jpg`. Migration 0002 and `assetUrl` in `src/lib/schemas.ts` both accept that form
alongside absolute URLs, so a file in `public/` and a file in Supabase Storage are equally
valid.

**On the landscape photo**: a wide scenic image cannot be cropped into a square avatar without
losing the subject, so it is not wired in as one. It *would* work well as a hero background or
as the backdrop for the generated OG preview image in Phase 5 — say the word if you want it
used that way. A separate square headshot is still the better choice for the avatar slot,
since that is what a recruiter scanning the page expects to see.

Two open questions on assets:

- **Project screenshots.** The `projects` table currently has no image column, so project
  cards are text-only. If you want screenshots, that needs a schema migration plus a Supabase
  Storage bucket — worth deciding before the admin panel is built in Phase 3, since the upload
  form would need to exist. Text-only cards are a perfectly defensible choice for an
  engineering portfolio.
- **Brand icons.** `lucide-react` 1.x removed GitHub/LinkedIn logo icons, so those links
  currently use a generic external-link arrow. If you want the real marks, supply SVGs (or say
  the word and I will add them from a licensed set) — I avoided hand-writing the paths because
  I cannot visually verify them here.

---

## 3. Supabase setup

Full step-by-step lives in [`supabase/README.md`](../supabase/README.md) — create the project,
add the two public env vars, apply `migrations/0001_content_schema.sql` then `seed.sql`, set
your admin email, and run the RLS verification.

**The RLS verification in §5 of that file is not optional.** It is the Phase 2 security gate,
and it is the only test that has ever exercised those policies — the SQL has been reviewed by
eye but never executed, because this environment has no Postgres. Until it passes, treat the
database as unverified.

---

## 4. GitHub repository settings

All free for public repositories. Each is a one-time toggle.

**Secret scanning and push protection** — Settings → Code security → enable both
"Secret scanning" and "Push protection". Push protection is the one that blocks a leak before
it lands.

**CodeQL code scanning** — Settings → Code security → Code scanning → Set up → Default.
Static analysis on every PR.

**Branch protection on `main`** — Settings → Rules → Rulesets → New branch ruleset, targeting
`main`:
- Require a pull request before merging
- Require status checks to pass → select the `verify` job from the CI workflow
- Block force pushes

This last one matters more than it looks: it is what makes "CI green before merge" a guarantee
rather than a habit.

---

## 5. Vercel setup

1. Sign in at [vercel.com](https://vercel.com) with your GitHub account.
2. **Add New → Project**, import `mudgalprashant/home`. Framework detection should say
   Next.js; accept the defaults.
3. Add the two Supabase env vars (§1) for Production, Preview, and Development.
4. Deploy.

**Then check one thing before the admin panel ships in Phase 3:** preview deployments.

Every pull request builds at a public URL, running whatever code is on that branch against
whatever database the env vars point to. Once `/admin` exists, that means a publicly reachable
admin panel wired to production data. Nothing about it looks wrong locally, which is what
makes it the most likely real mistake in this architecture (`security.md` §4.3 rule 12).

Under Settings → Deployment Protection, either enable protection for preview deployments, or
point preview builds at a separate Supabase project. Decide which before Phase 3 — it is
tracked as part of that phase's security gate.

---

## 6. Things I can do without you

For clarity on the division of labour: I can create branches, open and update pull requests,
read CI results and diagnose failures, and read repository metadata — using the GitHub
credentials already configured for `git push` on this machine. Those calls never print a token.

I cannot: sign in to Supabase or Vercel, change repository settings, run SQL against your
database, or view anything requiring your account. Everything in this file is in that second
category.
