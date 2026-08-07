import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { getExperience, getProfile, getSkills } from "@/lib/content";
import { formatDateRange } from "@/lib/format";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume and work history for ${site.name}.`,
  alternates: { canonical: "/resume" },
};

/**
 * Printable resume, rendered from the same database content as the home page so
 * the two can never disagree.
 *
 * Note this renders what the schema holds — profile, experience, skills. There
 * are no tables for education or awards (KB/decision-log.md, 2026-08-08), so
 * those appear only in the downloadable PDF. If they should appear here too,
 * that is a migration plus admin CRUD, best decided before Phase 3.
 */
export default async function ResumePage() {
  const [profile, experience, skills] = await Promise.all([
    getProfile(),
    getExperience(),
    getSkills(),
  ]);

  const name = profile?.name ?? site.name;

  return (
    <article className="py-12">
      {/* Screen-only chrome. Printing a page that says "Download PDF" is noise
          on paper, so this whole block is dropped from print output. */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to site
        </Link>

        {profile?.resume_url ? (
          <a
            href={profile.resume_url}
            download
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Download className="size-4" aria-hidden="true" />
            Download PDF
          </a>
        ) : null}
      </div>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{name}</h1>
        {profile?.headline ? (
          <p className="mt-1.5 text-muted">{profile.headline}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted">
          {profile?.location ? <span>{profile.location}</span> : null}
          {profile?.github_url ? (
            <a href={profile.github_url} rel="noopener noreferrer" className="hover:text-foreground">
              {profile.github_url.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          ) : null}
          {profile?.linkedin_url ? (
            <a href={profile.linkedin_url} rel="noopener noreferrer" className="hover:text-foreground">
              {profile.linkedin_url.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          ) : null}
        </div>
      </header>

      {profile?.bio ? (
        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Summary</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
            {profile.bio}
          </p>
        </section>
      ) : null}

      {experience.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Experience</h2>
          <ol className="mt-4 space-y-7">
            {experience.map((item) => (
              // break-inside-avoid keeps a single role from being split across a
              // page boundary when printed.
              <li key={item.id} className="break-inside-avoid">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <h3 className="font-medium text-foreground">
                    {item.role}
                    <span className="text-muted"> · {item.company}</span>
                  </h3>
                  <p className="shrink-0 font-mono text-xs text-muted">
                    {formatDateRange(item.start_date, item.end_date)}
                  </p>
                </div>

                {item.summary ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.summary}</p>
                ) : null}

                {item.highlights.length > 0 ? (
                  <ul className="mt-2 space-y-1.5">
                    {item.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="relative pl-4 text-sm leading-relaxed text-muted before:absolute before:left-0 before:top-[0.6em] before:size-1 before:rounded-full before:bg-border"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {skills.length > 0 ? (
        <section className="mt-10 break-inside-avoid">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Skills</h2>
          <dl className="mt-4 space-y-2.5">
            {skills.map((group) => (
              <div key={group.id} className="sm:flex sm:gap-4">
                <dt className="w-28 shrink-0 font-mono text-xs uppercase tracking-wider text-muted">
                  {group.category}
                </dt>
                <dd className="text-sm text-muted">{group.items.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {!profile && experience.length === 0 ? (
        <p className="mt-10 text-sm text-muted">
          Resume content is not available yet.
        </p>
      ) : null}
    </article>
  );
}
