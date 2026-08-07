# Security

Summary of the project's security approach. Full detail — threat model, per-entry-point
attack/defense tables, development rules, and verification checklists — lives in
[`/KB/security.md`](https://github.com/mudgalprashant/home/blob/main/KB/security.md).

## The core principle

**Everything the browser receives is public, and everything the browser sends is
attacker-controlled.**

The UI is not a security boundary. Hiding a button, omitting a nav link, or using an unlisted
URL are user-experience measures — an attacker uses DevTools, `curl`, and Postman against the
endpoints directly, never the interface.

Concretely for this project: the Supabase anon key ships inside the JavaScript bundle **by
design** and anyone can extract it in seconds. That's not a leak. It's safe only because
**Postgres Row Level Security is the real boundary** — enforced inside the database, on every
request, no matter which client sent it. Get RLS right and DevTools snooping is harmless. Get
it wrong and no amount of frontend care compensates.

## Attack entry points

| Entry point | What an attacker can do | What stops them |
|---|---|---|
| **DevTools / Inspect Element** | Read the entire JS bundle, all network traffic, cookies, storage, hidden DOM, and server-component payloads; edit any of it | RLS as the boundary; admin UI lives in a separate route tree (never conditionally rendered into public pages); `HttpOnly` session cookies; only ever query fields a page actually renders |
| **URL manipulation** | Visit `/admin` directly, guess unpublished slugs, tamper with record ids, attempt open redirects or reflected XSS | Middleware auth check on `/admin/**` before any page code runs; every route param validated as hostile input; no `dangerouslySetInnerHTML` anywhere |
| **Postman / curl / scripts** | Call the Supabase REST API and Next.js Server Actions directly, skipping the app entirely | RLS write policies restricted to one allow-listed admin identity; every Server Action independently re-checks auth and re-validates input |
| **Contact form** | Spam, header injection, quota abuse | Provider-side filtering, honeypot field, submissions never rendered on the site |
| **File uploads** (later phase) | Content-type spoofing, oversized files, path traversal | Server-side MIME allow-list, bucket size limits, server-generated filenames |

## How it's verified

Automated and free: Dependabot, `npm audit` in CI, GitHub CodeQL code scanning, secret
scanning with push protection, securityheaders.com, and the existing Lighthouse
best-practices gate.

Manual, and the highest-value check in the project — **the RLS ritual**: using Postman
against the real Supabase URL with the public anon key, attempt `INSERT`, `PATCH`, and
`DELETE` on every table, first with no auth and then with a valid session for a
non-allow-listed account. Every write must fail *at the database*. If something can only be
prevented by removing a button from the interface, it isn't secured. Runnable commands are in
[`supabase/README.md`](https://github.com/mudgalprashant/home/blob/main/supabase/README.md).

Authorization is enforced in two independent layers, so a mistake in either alone isn't
exploitable: the anonymous role is never granted write privileges on any table at all, and
policies additionally require the caller to be the allow-listed admin. The allow-list itself
sits in a table with RLS on and zero policies — invisible and unmodifiable through the API,
editable only from the SQL console.

Security is a gate at each development phase rather than an audit at the end — see
[Roadmap](Roadmap.md) and `/KB/security.md` §6.

## Proportionality

Worth being honest: this site holds no user accounts, no payment data, and no personal data
beyond what its owner deliberately publishes. The realistic worst case is someone defacing
portfolio content — recoverable from a backup, though embarrassing in front of recruiters.
That argues for doing the standard controls *properly*, not for an enterprise-grade posture.

The strongest reason to get this right isn't the risk profile. It's that a portfolio for a
senior engineering role is itself an artifact a technical reviewer may poke at — and an admin
panel that falls to a five-minute Postman probe says more than any project description could.
