import { ProjectCard } from "@/components/home/project-card";
import { Database } from "@/types/database.types";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectsGridProps {
  projects: Project[];
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  if (!projects || projects.length === 0) {
    return (
      <section id="projects" className="py-20">
        <div className="container px-4 md:px-6">
           <div className="text-center">
             <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl">
                Latest Operations
             </h2>
             <p className="mt-4 text-slate-400">No projects deployed in this sector yet.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="projects" className="py-20 bg-navy-950/50">
      <div className="container px-4 md:px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl font-mono">
              Latest Operations
            </h2>
            <p className="mt-4 max-w-[700px] text-slate-400">
              Deployed solutions and case studies from the Onyx Intelligence Unit.
            </p>
          </div>
          <Link href="/projects" className="hidden text-cyan-500 hover:text-cyan-400 md:block font-mono">
            View All Archives -&gt;
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ScrollReveal
              key={project.id}
              variant="slide-up"
              delay={index * 0.1}
            >
              <ProjectCard project={project} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
