import { site } from "@/lib/site";
import type { PublicProfile } from "@/lib/content";

/**
 * Falls back to the static values in site.ts when the database has no profile
 * yet, so the page always has a headline rather than rendering a blank hero.
 */
export function HeroSection({ profile }: { profile: PublicProfile | null }) {
  const name = profile?.name ?? site.name;
  const headline = profile?.headline ?? site.description;

  return (
    <section className="py-20">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Portfolio</p>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {name}
      </h1>

      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{headline}</p>

      {profile?.location ? (
        <p className="mt-3 font-mono text-xs text-muted">{profile.location}</p>
      ) : null}

      {!profile ? (
        <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
          <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
          <p className="font-mono text-sm text-muted">
            Site in active development — full content coming soon.
          </p>
        </div>
      ) : null}
    </section>
  );
}
