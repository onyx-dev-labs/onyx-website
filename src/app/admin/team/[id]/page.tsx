import { getTeamMember } from "@/actions/team";
import { TeamForm } from "@/components/admin/team-form";
import { notFound } from "next/navigation";

interface TeamEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeamEditPage(props: TeamEditPageProps) {
  const params = await props.params;
  const member = await getTeamMember(params.id);

  if (!member) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-mono">
          Edit Personnel
        </h1>
        <p className="text-slate-400">Update operative details and clearance.</p>
      </div>

      <div className="max-w-2xl">
        <TeamForm member={member} />
      </div>
    </div>
  );
}
