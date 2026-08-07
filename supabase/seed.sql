-- =============================================================================
-- Initial content load.
--
-- Sourced from Prashant's CV (Aug 2026). This replaces the placeholder seed —
-- it is the *initial* load only; ongoing edits happen through the admin panel
-- (KB/plan.md Phase 6), not by editing this file.
--
-- Safe to re-run: every insert is idempotent on a natural key.
--
-- Values needing the owner's confirmation are marked TODO(owner). They are
-- deliberately obvious rather than plausible-looking, so nothing unverified can
-- pass as real (KB/system-design.md §13).
-- =============================================================================

-- Admin allow-list --------------------------------------------------------------
-- TODO(owner): replace with the email you will sign in to the admin panel with.
-- This address controls every write to the site. See supabase/README.md §4.
insert into public.admin_allowlist (email, note)
values ('replace-me@example.com', 'PLACEHOLDER — replace before Phase 3 (admin panel)')
on conflict (email) do nothing;


-- Profile -----------------------------------------------------------------------
-- Deliberately omitted: the phone number from the CV. A phone number on a public
-- page is scraped within days and cannot be un-published. Recruiters reach out
-- via the contact form or LinkedIn.
--
-- contact_email is stored but never selected for public pages, so it does not
-- reach the browser (see src/lib/content.ts).
insert into public.profile (
  name, headline, bio, location, contact_email, github_url, linkedin_url, resume_url, avatar_url
)
select
  'Prashant Mudgal',
  'Backend engineer building payments and marketplace systems at scale',
  -- TODO(owner): this bio is drafted from CV facts — please rewrite in your own
  -- voice. It is the first thing a recruiter reads.
  'Backend-focused software engineer with four years building and scaling distributed systems in production. '
  'Currently SDE II at Nuclei, where I architected a multi-vendor flight booking module serving 10+ countries, '
  'led a monolith-to-microservices migration across 15 services, and shipped content infrastructure reaching '
  '5M+ active users. I work mostly in Java and Spring Boot, care about the parts nobody sees — release '
  'reliability, observability, sensible service boundaries — and mentor the engineers around me. '
  'B.Tech in Information Technology from SGSITS Indore (CGPA 8.51, Dr. K. K. Haldar Gold Medal). '
  'Google HashCode 2021: global rank 527.',
  'Bangalore, India',
  'prashant.mudgal612@gmail.com',
  'https://github.com/mudgalprashant',
  -- TODO(owner): the CV links "LinkedIn" but the URL was not in the text I received.
  'https://www.linkedin.com/in/REPLACE-ME',
  -- TODO(owner): add the PDF at public/resume.pdf, then this path resolves.
  '/resume.pdf',
  -- TODO(owner): a square headshot works best here. The image supplied was a
  -- landscape photograph — see KB/runbook.md §2.
  null
where not exists (select 1 from public.profile);


-- Experience --------------------------------------------------------------------
insert into public.experience (role, company, start_date, end_date, summary, highlights, sort_order)
values
  (
    'Software Development Engineer II',
    'Nuclei (CDNA Technologies)',
    date '2025-10-01',
    null,
    'Backend engineering on merchant marketplace and content platforms, mentoring junior engineers.',
    array[
      'Architected and scaled the Merchant Marketplace SDK''s flight booking module with Spring Boot and Elasticsearch, integrating multi-vendor and direct airline APIs across 10+ countries — driving a 17% increase in platform revenue.',
      'Integrated and extended Strapi to deliver real-time content updates and personalised stories to 100K+ daily active users, with feature and nudge management for 5M+ active users behind a maker-checker approval workflow, cutting manual deployment effort by 80%.',
      'Devised the documentation and implementation strategy for using Claude across the frontend and backend of 11 microservices, reducing resource requirements by 30%.'
    ],
    0
  ),
  (
    'Software Development Engineer I',
    'Nuclei (CDNA Technologies)',
    date '2022-07-01',
    date '2025-09-30',
    'Migration, platform upgrades, and release reliability across a microservices estate.',
    array[
      'Led the migration of the Fedmobile backend from monolith to microservices, and upgraded 15 services from Java 11 to Java 21 and Spring Boot 2.0.5 to 3.5.10 — enabling independent scaling, faster deployments, and better fault isolation.',
      'Managed service and pod performance on OpenShift, delivering 15+ stable releases a year and cutting release cycle time by ~35%.',
      'Diagnosed performance bottlenecks across 14+ microservices using Graylog and OpenSearch, achieving 30% faster response times with sustained stability.'
    ],
    1
  ),
  (
    'Software Development Engineer Intern',
    'Nuclei (CDNA Technologies)',
    date '2022-01-01',
    date '2022-06-30',
    null,
    array[
      'Built an Outside Login Scan and Pay feature that cut API call count by 50% and transaction time by 40%, while meeting secure communication requirements.',
      'Embedded Delhivery APIs for real-time tracking of physical card shipments, reducing support enquiries by ~30%, and added QR-based activation that cut activation time by 60%.'
    ],
    2
  ),
  (
    'Software Development Engineer Intern',
    'Appointy IT',
    date '2021-05-01',
    date '2021-07-31',
    'Remote, Bhopal.',
    array[
      'Integrated the FreshSales calendar into Appointy''s web app, enabling real-time two-way sync between Google, Microsoft, and Appointy calendars and reducing manual scheduling coordination by ~50%.'
    ],
    3
  )
on conflict do nothing;


-- Projects ----------------------------------------------------------------------
-- TODO(owner): review this section closely. Your CV has no standalone projects
-- section, so these are drawn from your most substantial work at Nuclei and
-- reframed as project cards, plus the one genuine side project. That is normal
-- for a backend portfolio, but the framing is a judgement call — edit, reorder,
-- or delete freely once the admin panel exists.
--
-- source_url is null throughout because this is proprietary work. Leaving it
-- null is more honest than linking somewhere unrelated.
insert into public.projects (slug, title, pitch, description, stack, demo_url, source_url, impact, featured, sort_order)
values
  (
    'merchant-marketplace-flight-booking',
    'Merchant Marketplace — Flight Booking',
    'Multi-vendor flight booking module inside a white-label commerce SDK, live across 10+ countries.',
    'Designed and scaled the flight booking module of the Merchant Marketplace SDK. Integrated both aggregator and direct airline APIs behind a single interface, using Elasticsearch for search across a large and frequently changing inventory. Also mentored junior engineers through the vendor integrations.',
    array['Java', 'Spring Boot', 'Elasticsearch', 'REST APIs', 'Microservices'],
    null,
    null,
    'Drove a 17% increase in platform revenue.',
    true,
    0
  ),
  (
    'fedmobile-microservices-migration',
    'Fedmobile — Monolith to Microservices',
    'Decomposed a banking app backend into microservices and modernised the whole estate two major Java versions.',
    'Led the migration of the Fedmobile backend from a monolith to microservices, then upgraded 15 services from Java 11 to Java 21 and Spring Boot 2.0.5 to 3.5.10. The result was independent scaling per service, faster and safer deploys, and fault isolation the monolith could not offer.',
    array['Java 21', 'Spring Boot 3', 'OpenShift', 'Microservices', 'CI/CD'],
    null,
    null,
    '15+ stable releases per year, with release cycle time down ~35% and response times 30% faster.',
    true,
    1
  ),
  (
    'strapi-content-platform',
    'Real-Time Content & Nudge Platform',
    'Extended Strapi into a governed content platform serving 5M+ users without a deploy per change.',
    'Integrated and extended Strapi (open-source CMS) to deliver real-time content updates and personalised stories to 100K+ daily active users, and to manage features and nudges for 5M+ active users. Added a maker-checker approval workflow so content could ship quickly without giving up control over what goes live.',
    array['Strapi', 'Java', 'Spring Boot', 'PostgreSQL'],
    null,
    null,
    'Cut manual deployment effort by 80% while keeping approvals auditable.',
    false,
    2
  ),
  (
    'virtual-walkathon',
    'Virtual Walkathon',
    'A company-wide virtual walking event stitched together from Strava, Google Apps Script, and Slack.',
    'Side project: pulled activity data from the Strava API, processed it with Google Apps Script, and drove standings and notifications through Slack workflows so participants could see progress without a dedicated app.',
    array['Strava API', 'Google Apps Script', 'Slack Workflows'],
    null,
    null,
    null,
    false,
    3
  )
on conflict (slug) do nothing;


-- Skills ------------------------------------------------------------------------
insert into public.skills (category, items, sort_order)
values
  ('Languages',    array['Java 11+', 'Python', 'Go', 'JavaScript', 'SQL', 'C'],                                  0),
  ('Backend',      array['Spring Boot', 'REST API design', 'Microservices', 'JWT', 'Distributed Systems', 'OOP'], 1),
  ('Data',         array['PostgreSQL', 'MySQL', 'Elasticsearch', 'OpenSearch'],                                   2),
  ('Platform',     array['Docker', 'Podman', 'OpenShift', 'Jenkins', 'GitHub Actions', 'nginx', 'HAProxy'],       3),
  ('Quality',      array['JUnit', 'Mockito', 'SonarQube', 'PMD', 'Code Review'],                                  4),
  ('Practice',     array['System Design', 'Mentoring', 'Team Leadership', 'Agile/Scrum', 'Observability'],        5)
on conflict (category) do nothing;
