-- =============================================================================
-- Constrain the asset URL columns.
--
-- 0001 constrained github_url and linkedin_url but left resume_url and
-- avatar_url unchecked — an inconsistency that also disagreed with the Zod
-- schema, which required an absolute https:// URL for all four. The result was
-- that a file committed to `public/` could not be referenced by its natural
-- site-relative path (`/resume.pdf`): the database would have accepted it, but
-- the admin form would have rejected it.
--
-- These two columns legitimately take either form — an external URL for a file
-- in Supabase Storage, or a site-relative path for one served from `public/`.
-- So both are allowed, and the database now says so explicitly rather than
-- having no opinion.
--
-- `/[^/]` is the load-bearing part: it permits `/resume.pdf` while rejecting
-- protocol-relative URLs like `//evil.com`, which browsers resolve to an
-- external origin despite looking local. `javascript:` and `data:` fail both
-- branches (KB/security.md §3.2).
--
-- Mirrors `assetUrl` in src/lib/schemas.ts. Change one, change the other.
-- =============================================================================

alter table public.profile
  add constraint profile_resume_url_shape
  check (resume_url is null or resume_url ~* '^(https?://|/[^/])');

alter table public.profile
  add constraint profile_avatar_url_shape
  check (avatar_url is null or avatar_url ~* '^(https?://|/[^/])');
