import { getAllTeamMembers } from "@/actions/team";
import { TeamEditor } from "@/components/admin/team-editor";

export default async function TeamPage() {
  const members = await getAllTeamMembers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-mono">
          Team Roster
        </h1>
        <p className="text-slate-400">Manage active personnel and operational roles.</p>
      </div>

      <TeamEditor members={members} />
    </div>
  );
}
