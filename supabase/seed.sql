-- =============================================================================
-- Placeholder seed data.
--
-- Two purposes:
--   1. Gives the public site something to render before real content is entered
--      through the admin panel (KB/plan.md Phase 6).
--   2. Provides rows to attempt UPDATE and DELETE against when running the RLS
--      ritual (KB/security.md §5.2) -- an empty table cannot demonstrate that a
--      write was actually refused rather than merely finding nothing to change.
--
-- Every value here is obviously fake so it cannot be mistaken for real content
-- (KB/system-design.md §13). Safe to re-run: inserts are idempotent on the
-- natural keys.
-- =============================================================================

-- Admin allow-list --------------------------------------------------------------
-- REPLACE THIS before building the admin panel. This address controls every
-- write to the site. Leaving the placeholder in place is harmless only because
-- nobody can authenticate as it.
insert into public.admin_allowlist (email, note)
values ('replace-me@example.com', 'PLACEHOLDER — replace with the real admin email before Phase 3')
on conflict (email) do nothing;


-- Profile -----------------------------------------------------------------------
insert into public.profile (name, headline, bio, location, contact_email, github_url, linkedin_url)
select
  'Prashant Mudgal',
  'Senior Software Engineer — placeholder headline',
  'Placeholder bio. Two or three sentences describing background, the kind of engineering work this person does, and what they are currently focused on.',
  'Placeholder City',
  'placeholder@example.com',
  'https://github.com/placeholder',
  'https://linkedin.com/in/placeholder'
where not exists (select 1 from public.profile);


-- Experience --------------------------------------------------------------------
insert into public.experience (role, company, start_date, end_date, summary, highlights, sort_order)
values
  (
    'Senior Software Engineer',
    'Placeholder Company',
    date '2023-01-01',
    null,
    'Placeholder summary of the current role.',
    array[
      'Placeholder highlight describing a concrete outcome.',
      'Placeholder highlight with a quantified result.'
    ],
    0
  ),
  (
    'Software Engineer',
    'Earlier Placeholder Company',
    date '2020-06-01',
    date '2022-12-31',
    'Placeholder summary of a previous role.',
    array['Placeholder highlight.'],
    1
  )
on conflict do nothing;


-- Projects ----------------------------------------------------------------------
insert into public.projects (slug, title, pitch, description, stack, demo_url, source_url, impact, featured, sort_order)
values
  (
    'placeholder-project-one',
    'Placeholder Project One',
    'One-line pitch describing what it does and why it mattered.',
    'Longer description used on the project detail page. Explains the problem, the approach taken, and the tradeoffs involved.',
    array['TypeScript', 'Next.js', 'PostgreSQL'],
    'https://example.com',
    'https://github.com/placeholder/placeholder',
    'Placeholder impact statement, ideally quantified.',
    true,
    0
  ),
  (
    'placeholder-project-two',
    'Placeholder Project Two',
    'Another one-line pitch.',
    'Longer placeholder description.',
    array['Python', 'FastAPI'],
    null,
    'https://github.com/placeholder/placeholder-two',
    null,
    false,
    1
  )
on conflict (slug) do nothing;


-- Skills ------------------------------------------------------------------------
insert into public.skills (category, items, sort_order)
values
  ('Languages',    array['TypeScript', 'Python', 'Go', 'SQL'],                    0),
  ('Frameworks',   array['Next.js', 'React', 'Node.js'],                          1),
  ('Infrastructure', array['PostgreSQL', 'Docker', 'AWS', 'CI/CD'],               2)
on conflict (category) do nothing;
