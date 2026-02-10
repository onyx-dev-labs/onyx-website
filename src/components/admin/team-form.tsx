'use client';

import { useState } from "react";
import { upsertTeamMember, TeamMemberInsert } from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, UserCog } from "lucide-react";
import { Database } from "@/types/database.types";

type TeamMember = Database['public']['Tables']['team_members']['Row'];

interface TeamFormProps {
  member?: TeamMember;
}

export function TeamForm({ member }: TeamFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!member;

  async function clientAction(formData: FormData) {
    setPending(true);
    setError(null);
    
    try {
      const data: TeamMemberInsert = {
        name: formData.get("name") as string,
        role: formData.get("role") as string,
        bio: formData.get("bio") as string,
        avatar_url: formData.get("avatar_url") as string,
      };

      if (isEditing) {
        data.id = member.id;
      }

      await upsertTeamMember(data);
        
      if (!isEditing) {
        // Reset form only if adding new
        const form = document.getElementById('team-form') as HTMLFormElement;
        form?.reset();
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="border-slate-800 bg-navy-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          {isEditing ? <UserCog className="h-5 w-5 text-cyan-500" /> : <UserPlus className="h-5 w-5 text-cyan-500" />}
          {isEditing ? "Update Profile" : "Recruit Operative"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form id="team-form" action={clientAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-400">Operative Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required className="bg-navy-950 border-slate-700" defaultValue={member?.name} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-400">Role / Designation</Label>
            <Input id="role" name="role" placeholder="Senior Engineer" required className="bg-navy-950 border-slate-700" defaultValue={member?.role} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-slate-400">Briefing (Bio)</Label>
            <Textarea id="bio" name="bio" placeholder="Specializes in..." className="bg-navy-950 border-slate-700" defaultValue={member?.bio || ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url" className="text-slate-400">Avatar URL</Label>
            <Input id="avatar_url" name="avatar_url" placeholder="https://..." className="bg-navy-950 border-slate-700" defaultValue={member?.avatar_url || ''} />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" className="w-full" variant="cyber" disabled={pending}>
            {pending ? "PROCESSING..." : (isEditing ? "UPDATE PROFILE" : "AUTHORIZE RECRUITMENT")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
