import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ContactSection } from "@/components/sections/contact-section";
import { getExperience, getProfile, getProjects, getSkills } from "@/lib/content";

/**
 * Regenerate at most hourly. The hourly figure is only a backstop: once the
 * admin panel lands in Phase 3, saving content will call revalidatePath('/') and
 * the page updates within seconds rather than waiting for this window
 * (KB/system-design.md §3).
 */
export const revalidate = 3600;

export default async function Home() {
  // Issued concurrently — these queries are independent, and awaiting them in
  // sequence would make the page as slow as their sum for no reason.
  const [profile, experience, projects, skills] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getSkills(),
  ]);

  return (
    <>
      <HeroSection profile={profile} />
      <AboutSection profile={profile} />
      <ExperienceSection items={experience} />
      <ProjectsSection items={projects} />
      <SkillsSection items={skills} />
      <ContactSection profile={profile} />
    </>
  );
}
