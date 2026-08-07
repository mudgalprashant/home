-- =============================================================================
-- Content schema + Row Level Security
--
-- RLS is enabled on every table in the same migration that creates it
-- (KB/security.md §4.1 rule 1). RLS is this project's actual security boundary:
-- the Supabase anon key ships publicly in the browser bundle by design, so the
-- PostgREST API is callable by anyone with curl or Postman. These policies --
-- not the application code, and not the admin UI -- are what prevent
-- unauthorized writes (KB/security.md §1 and §3.3).
--
-- Verify with the RLS ritual in KB/security.md §5.2 after applying.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Admin allow-list
-- -----------------------------------------------------------------------------
-- Who is allowed to write. Kept as a table rather than an email hardcoded into
-- each policy, so changing the admin address is a one-row update instead of a
-- schema migration.
create table if not exists public.admin_allowlist (
  email      text primary key,
  note       text,
  created_at timestamptz not null default now()
);

alter table public.admin_allowlist enable row level security;

-- Deliberately NO policies on this table. RLS enabled with zero policies means
-- every PostgREST client -- anon and authenticated alike -- sees nothing and can
-- change nothing. The allow-list is managed only through the Supabase SQL editor
-- or CLI, which connect as a privileged role that bypasses RLS.
--
-- This is intentional and load-bearing: anyone who could insert their own email
-- here would gain write access to the entire site, so the table is not reachable
-- from the internet at all.


-- -----------------------------------------------------------------------------
-- is_admin() -- the single authorization predicate used by every write policy
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER so it can read admin_allowlist, which (per above) no client
-- can read directly.
--
-- search_path is pinned to '' and every object below is schema-qualified.
-- An unpinned search_path is the classic way SECURITY DEFINER functions get
-- hijacked -- a caller creates a same-named object in a schema that resolves
-- first and the function runs their code with elevated rights.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_allowlist a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- For an anonymous request auth.jwt() is null, so coalesce yields '' and the
-- lookup finds nothing. The predicate fails closed.
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;


-- -----------------------------------------------------------------------------
-- updated_at maintenance
-- -----------------------------------------------------------------------------
-- Set server-side rather than trusting a client-supplied timestamp. This is the
-- minimal audit signal referenced in KB/system-design.md §11.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- -----------------------------------------------------------------------------
-- profile
-- -----------------------------------------------------------------------------
create table if not exists public.profile (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  headline      text        not null,
  bio           text        not null,
  location      text,
  contact_email text,
  github_url    text,
  linkedin_url  text,
  resume_url    text,
  avatar_url    text,
  updated_at    timestamptz not null default now(),

  -- Reject javascript:/data: URIs at the database layer, so a bug in the admin
  -- form cannot store one for the public site to render (KB/security.md §3.2).
  constraint profile_github_url_http   check (github_url   is null or github_url   ~* '^https?://'),
  constraint profile_linkedin_url_http check (linkedin_url is null or linkedin_url ~* '^https?://')
);

-- Exactly one profile row: a unique index on a constant expression means a
-- second insert violates uniqueness.
create unique index if not exists profile_singleton on public.profile ((true));

create or replace trigger profile_touch_updated_at
  before update on public.profile
  for each row execute function public.touch_updated_at();


-- -----------------------------------------------------------------------------
-- experience
-- -----------------------------------------------------------------------------
create table if not exists public.experience (
  id         uuid primary key default gen_random_uuid(),
  role       text        not null,
  company    text        not null,
  start_date date        not null,
  end_date   date,                       -- null means "current role"
  summary    text,
  highlights text[]      not null default '{}',
  sort_order integer     not null default 0,
  updated_at timestamptz not null default now(),

  constraint experience_dates_ordered check (end_date is null or end_date >= start_date)
);

create index if not exists experience_sort_idx on public.experience (sort_order, start_date desc);

create or replace trigger experience_touch_updated_at
  before update on public.experience
  for each row execute function public.touch_updated_at();


-- -----------------------------------------------------------------------------
-- projects
-- -----------------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text        not null unique,
  title       text        not null,
  pitch       text        not null,
  description text,
  stack       text[]      not null default '{}',
  demo_url    text,
  source_url  text,
  impact      text,
  featured    boolean     not null default false,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Slug becomes a public URL segment, so constrain its shape here rather than
  -- relying only on form validation.
  constraint projects_slug_format     check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint projects_demo_url_http   check (demo_url   is null or demo_url   ~* '^https?://'),
  constraint projects_source_url_http check (source_url is null or source_url ~* '^https?://')
);

create index if not exists projects_sort_idx     on public.projects (sort_order, created_at desc);
create index if not exists projects_featured_idx on public.projects (featured) where featured;

create or replace trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();


-- -----------------------------------------------------------------------------
-- skills
-- -----------------------------------------------------------------------------
create table if not exists public.skills (
  id         uuid primary key default gen_random_uuid(),
  category   text        not null unique,
  items      text[]      not null default '{}',
  sort_order integer     not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists skills_sort_idx on public.skills (sort_order);

create or replace trigger skills_touch_updated_at
  before update on public.skills
  for each row execute function public.touch_updated_at();


-- =============================================================================
-- Row Level Security
--
-- Two deliberate layers, so a mistake in either one alone is not exploitable:
--
--   1. GRANTs      -- anon is never granted insert/update/delete on any table.
--                     Even a policy that wrongly evaluated true could not let an
--                     anonymous request write, because the privilege is absent.
--   2. POLICIES    -- writes additionally require public.is_admin().
--
-- Policies are written out per table and per operation rather than generated in
-- a loop or collapsed into `for all`. It is more verbose, and that is the point:
-- security configuration should be reviewable at a glance
-- (KB/security.md §4.1 rule 2).
-- =============================================================================

alter table public.profile    enable row level security;
alter table public.experience enable row level security;
alter table public.projects   enable row level security;
alter table public.skills     enable row level security;

-- Layer 1: privileges. Read for everyone, write only ever for authenticated.
grant select on public.profile, public.experience, public.projects, public.skills
  to anon, authenticated;
grant insert, update, delete on public.profile, public.experience, public.projects, public.skills
  to authenticated;

-- Layer 2: policies.

-- profile ---------------------------------------------------------------------
create policy profile_select_public on public.profile
  for select to anon, authenticated using (true);

create policy profile_insert_admin on public.profile
  for insert to authenticated with check (public.is_admin());

create policy profile_update_admin on public.profile
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy profile_delete_admin on public.profile
  for delete to authenticated using (public.is_admin());

-- experience ------------------------------------------------------------------
create policy experience_select_public on public.experience
  for select to anon, authenticated using (true);

create policy experience_insert_admin on public.experience
  for insert to authenticated with check (public.is_admin());

create policy experience_update_admin on public.experience
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy experience_delete_admin on public.experience
  for delete to authenticated using (public.is_admin());

-- projects --------------------------------------------------------------------
create policy projects_select_public on public.projects
  for select to anon, authenticated using (true);

create policy projects_insert_admin on public.projects
  for insert to authenticated with check (public.is_admin());

create policy projects_update_admin on public.projects
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy projects_delete_admin on public.projects
  for delete to authenticated using (public.is_admin());

-- skills ----------------------------------------------------------------------
create policy skills_select_public on public.skills
  for select to anon, authenticated using (true);

create policy skills_insert_admin on public.skills
  for insert to authenticated with check (public.is_admin());

create policy skills_update_admin on public.skills
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy skills_delete_admin on public.skills
  for delete to authenticated using (public.is_admin());
