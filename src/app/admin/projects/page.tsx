import { getProjects } from "@/actions/projects";
import { ProjectForm } from "@/components/admin/project-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-mono">
          Project Archives
        </h1>
        <p className="text-slate-400">Manage and deploy new case studies.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProjectForm />
        </div>
        
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white">Deployed Operations</h2>
          {projects.length === 0 ? (
            <div className="rounded-md border border-slate-800 p-8 text-center text-slate-500">
              No projects found in the database.
            </div>
          ) : (
            projects.map((project) => (
              <Card key={project.id} className="border-slate-800 bg-navy-900/40">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-white">{project.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-cyan-500/30 text-cyan-500">
                        {project.category}
                      </Badge>
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-cyan-400">
                        <Link href={`/admin/projects/${project.id}`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-4">{project.description}</p>
                  <div className="flex gap-2">
                    {project.tech_stack?.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
