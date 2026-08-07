# Supabase setup

Everything here is free-tier. Follow in order — the RLS verification at the end is not
optional, it is the Phase 1/2 security gate (`KB/security.md` §5.2).

## 1. Create the project

1. Sign in at [supabase.com](https://supabase.com) and create a new project (free tier).
2. Choose a region close to you; note the database password somewhere safe.
3. Wait for provisioning to finish (~2 minutes).

## 2. Wire up environment variables

From **Project Settings → API**, copy the Project URL and the `anon` / `public` key into
`.env.local`:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Add the same two values to Vercel (Project Settings → Environment Variables) for Production,
Preview, and Development.

> **Do not copy the `service_role` key.** It bypasses RLS entirely. This project has no use
> for one, and its absence is itself a security control (`KB/security.md` §4.1 rule 4).

## 3. Apply the schema

Open **SQL Editor** in the Supabase dashboard, paste the contents of
`migrations/0001_content_schema.sql`, and run it. Then do the same with `seed.sql`.

Or, with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Migrations are applied as an explicit, reviewed step — never automatically from CI, because
schema changes are harder to undo than a code deploy (`KB/system-design.md` §10).

## 4. Set the admin email

`seed.sql` inserts a placeholder into `admin_allowlist`. Replace it with the real admin
address before building the admin panel:

```sql
delete from public.admin_allowlist where email = 'replace-me@example.com';
insert into public.admin_allowlist (email, note) values ('you@example.com', 'owner');
```

This table has RLS enabled with **no policies**, so it is invisible and unmodifiable through
the API — it can only be changed here, in the SQL editor. That is deliberate: anyone able to
add their own address would gain write access to the whole site.

## 5. Verify RLS — required

The single highest-value check in the project. It tests the actual security boundary rather
than a proxy for it. Run it now, and again whenever a table or policy changes.

Set up your shell (these are the public values from step 2 — safe to use in a terminal):

```bash
export SB_URL="https://<project-ref>.supabase.co"
export SB_KEY="<anon key>"
```

**Read should succeed** — the site is public:

```bash
curl -s "$SB_URL/rest/v1/projects?select=slug,title" \
  -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY"
# expect: the seeded placeholder projects
```

**Every write must fail.** None of these should change anything:

```bash
# INSERT — expect 401/403, not 201
curl -s -o /dev/null -w "insert: %{http_code}\n" -X POST "$SB_URL/rest/v1/projects" \
  -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY" \
  -H "Content-Type: application/json" \
  -d '{"slug":"rls-probe","title":"probe","pitch":"probe"}'

# UPDATE — expect rejection or 0 rows affected
curl -s -o /dev/null -w "update: %{http_code}\n" -X PATCH \
  "$SB_URL/rest/v1/projects?slug=eq.placeholder-project-one" \
  -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY" \
  -H "Content-Type: application/json" -d '{"title":"pwned"}'

# DELETE — expect rejection, row still present
curl -s -o /dev/null -w "delete: %{http_code}\n" -X DELETE \
  "$SB_URL/rest/v1/projects?slug=eq.placeholder-project-two" \
  -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY"

# Confirm nothing actually changed
curl -s "$SB_URL/rest/v1/projects?select=slug,title" \
  -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY"
```

Repeat the three write calls against `profile`, `experience`, and `skills`.

Also confirm the allow-list is unreachable:

```bash
curl -s "$SB_URL/rest/v1/admin_allowlist?select=email" \
  -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY"
# expect: empty array or a permission error — never the email list
```

**Step 6 of the ritual — a valid session for a non-allow-listed account — cannot be run
until Auth and the admin panel exist (Phase 3).** It is the step that catches authentication
being confused with authorization, so it is tracked as part of the Phase 3 security gate
rather than skipped.

If any write above succeeds, stop and fix the policies before building anything on top.

## Files

| File | Purpose |
|---|---|
| `migrations/0001_content_schema.sql` | Tables, constraints, triggers, RLS policies |
| `seed.sql` | Placeholder content; also gives the RLS ritual rows to attempt writes against |
