import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Database } from "@/types/database.types";

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden border-slate-800 bg-navy-900/40 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col h-full">
      {project.image_url && (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={project.image_url}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="cyber">{project.category}</Badge>
        </div>
        <CardTitle className="text-white">{project.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-slate-400">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tech_stack?.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="secondary" className="bg-slate-800 text-slate-300">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-4">
        {project.live_link && (
          <Link href={project.live_link} target="_blank" className="flex-1">
            <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 rounded-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              Live
            </Button>
          </Link>
        )}
        {project.github_link && (
          <Link href={project.github_link} target="_blank" className="flex-1">
            <Button variant="ghost" className="w-full hover:bg-slate-800 rounded-full">
              <Github className="mr-2 h-4 w-4" />
              Code
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
