-- =============================================================================
-- Revoke write privileges from `anon`.
--
-- WHY THIS EXISTS: migration 0001 claimed two independent layers of protection
-- (see its "Row Level Security" header) —
--
--   Layer 1, privileges: "anon is never granted insert/update/delete on any
--                         table ... even a policy that wrongly evaluated true
--                         could not let an anonymous request write, because the
--                         privilege is absent."
--   Layer 2, policies:   writes additionally require public.is_admin().
--
-- **Layer 1 was never actually in place.** 0001 only ever ran GRANT statements;
-- it never revoked anything. Supabase provisions every project with
--
--   alter default privileges in schema public
--     grant all on tables to anon, authenticated, service_role;
--
-- so `anon` already held INSERT/UPDATE/DELETE on each table the moment it was
-- created. Adding `grant select ... to anon` on top changed nothing.
--
-- HOW IT WAS FOUND: the RLS ritual (KB/security.md §5.2). An anonymous PATCH and
-- DELETE returned **204** rather than the expected 401/403. 204 is consistent
-- with the data being safe — RLS still filtered every row, so nothing was
-- modified — but it is *not* consistent with the privilege being absent, which
-- would have failed before row matching. Layer 2 was holding alone.
--
-- This is the whole argument for defence in depth being verified rather than
-- asserted: the design was right, the implementation silently wasn't, and only
-- an actual request against a real database could tell the difference.
--
-- Safe to run more than once; REVOKE on an absent privilege is a no-op.
-- =============================================================================

-- Content tables: anon reads, and does nothing else. `authenticated` keeps its
-- write privileges — RLS narrows those to the allow-listed admin.
revoke insert, update, delete
  on public.profile, public.experience, public.projects, public.skills
  from anon;

-- The allow-list should be unreachable by any API client. RLS with zero policies
-- already blocked it; this removes the underlying privilege as well, so the same
-- two-layer argument holds here too.
revoke all on public.admin_allowlist from anon, authenticated;

-- Guard against the next table repeating this. Supabase's default privileges
-- apply to tables created by the owning role, so a future migration would
-- otherwise reintroduce the same gap silently.
alter default privileges in schema public
  revoke insert, update, delete on tables from anon;
