'use client';

import { createProject, updateProject } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormStatus } from "react-dom";
import { Database } from "@/types/database.types";
import { UploadZone } from "@/components/admin/upload-zone";

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectFormProps {
  project?: Project;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} variant="cyber" className="w-full">
      {pending ? (isEditing ? "UPDATING..." : "DEPLOYING...") : (isEditing ? "UPDATE PROJECT" : "DEPLOY PROJECT")}
    </Button>
  );
}

export function ProjectForm({ project }: ProjectFormProps) {
  const isEditing = !!project;
  
  const action = isEditing 
    ? updateProject.bind(null, project.id) 
    : createProject;

  return (
    <Card className="border-slate-800 bg-navy-900/50">
      <CardHeader>
        <CardTitle className="text-white">{isEditing ? "Update Operation" : "Initialize New Project"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-slate-400">Project Title</label>
              <Input id="title" name="title" placeholder="e.g. Project Onyx" defaultValue={project?.title} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-slate-400">Category</label>
              <Input id="category" name="category" placeholder="e.g. Web Architecture" defaultValue={project?.category} required />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-400">Description</label>
            <Input id="description" name="description" placeholder="Brief mission briefing..." defaultValue={project?.description || ''} required />
          </div>

          <div className="space-y-2">
            <label htmlFor="tech_stack" className="text-sm font-medium text-slate-400">Tech Stack (comma separated)</label>
            <Input id="tech_stack" name="tech_stack" placeholder="Next.js, TypeScript, Supabase" defaultValue={project?.tech_stack?.join(', ')} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="live_link" className="text-sm font-medium text-slate-400">Live URL</label>
              <Input id="live_link" name="live_link" placeholder="https://..." defaultValue={project?.live_link || ''} />
            </div>
            <div className="space-y-2">
              <label htmlFor="github_link" className="text-sm font-medium text-slate-400">GitHub URL</label>
              <Input id="github_link" name="github_link" placeholder="https://github.com/..." defaultValue={project?.github_link || ''} />
            </div>
          </div>

          <div className="space-y-2">
            <UploadZone 
              onFileSelect={(file) => console.log(file)} 
              currentImage={project?.image_url} 
            />
          </div>

          <SubmitButton isEditing={isEditing} />
        </form>
      </CardContent>
    </Card>
  );
}
