import { getProject } from "@/actions/projects";
import { ProjectForm } from "@/components/admin/project-form";
import { notFound } from "next/navigation";

interface ProjectEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectEditPage(props: ProjectEditPageProps) {
  const params = await props.params;
  const project = await getProject(params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-mono">
          Edit Operation
        </h1>
        <p className="text-slate-400">Update project parameters and status.</p>
      </div>

      <div className="max-w-2xl">
        <ProjectForm project={project} />
      </div>
    </div>
  );
}
