import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Background } from "@/components/layout/background";
import { Hero } from "@/components/home/hero";
import { ProjectsGrid } from "@/components/home/projects-grid";
import { Services } from "@/components/home/services";
import { Team } from "@/components/home/team";
import { InsighterPreview } from "@/components/home/insighter-preview";
import { getProjects } from "@/actions/projects";
import { getSiteConfig } from "@/actions/cms";
import { getTeamTree, getAllTeamMembers } from "@/actions/team";

export default async function Home() {
  const projects = await getProjects();
  const config = await getSiteConfig('home');
  const teamMembers = await getAllTeamMembers();
  
  // Create a map of config keys to values
  const configMap = (config || []).reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as Record<string, any>);

  return (
    <main className="min-h-screen relative flex flex-col">
      <Background />
      <Navbar />
      <div className="flex-1">
        <Hero 
          title={configMap['home_hero_title']}
          subtitle={configMap['home_hero_subtitle']}
          ctaPrimary={configMap['home_hero_cta_primary']}
          ctaSecondary={configMap['home_hero_cta_secondary']}
        />
        <Services />
        <Team members={teamMembers} />
        <InsighterPreview />
        <ProjectsGrid projects={projects} />
      </div>
      <Footer />
    </main>
  );
}
