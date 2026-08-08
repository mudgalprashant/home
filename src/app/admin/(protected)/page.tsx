import Link from "next/link";
import { getExperience, getProfile, getProjects, getSkills } from "@/lib/content";

export const dynamic = "force-dynamic";

/**
 * Admin dashboard.
 *
 * Content-editing forms arrive in the next branch; this shows what the database
 * currently holds so the auth shell can be verified end to end before any write
 * path exists. Building the gate first, and confirming it holds, is deliberate:
 * CRUD behind an unverified gate is the wrong order.
 */
export default async function AdminDashboard() {
  const [profile, experience, projects, skills] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getSkills(),
  ]);

  const rows = [
    { label: "Profile", count: profile ? 1 : 0 },
    { label: "Experience", count: experience.length },
    { label: "Projects", count: projects.length },
    { label: "Skills", count: skills.length },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Content
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {rows.map((row) => (
            <div key={row.label} className="rounded-md border border-border p-3">
              <dt className="text-xs text-muted">{row.label}</dt>
              <dd className="mt-0.5 text-2xl font-semibold text-foreground">
                {row.count}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Next
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Editing forms for each content type are the next piece of work. Until
          then, changes go through the Supabase SQL editor.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          View public site
        </Link>
      </section>
    </div>
  );
}
