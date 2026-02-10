import { UserManagement } from "@/components/admin/user-management";
import { getAllProfiles } from "@/actions/chat-system";

export default async function UsersPage() {
  const profiles = await getAllProfiles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-mono">
          User Management
        </h1>
        <p className="text-slate-400">Manage team access and accounts.</p>
      </div>

      <UserManagement initialProfiles={profiles} />
    </div>
  );
}
