'use client';

import { useState } from "react";
import { TeamMemberRow, upsertTeamMember, deleteTeamMember } from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Save, User } from "lucide-react";
import Image from "next/image";

interface TeamEditorProps {
  members: TeamMemberRow[];
}

export function TeamEditor({ members }: TeamEditorProps) {
  const { addToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<TeamMemberRow>>({});

  const handleEdit = (member: TeamMemberRow) => {
    setEditingId(member.id);
    setFormData(member);
  };

  const handleCreate = () => {
    setEditingId('new');
    setFormData({
      name: '',
      role: '',
      bio: '',
      avatar_url: '',
      display_order: 0,
      parent_id: null
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleChange = (key: keyof TeamMemberRow, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.role) {
      addToast("Name and Role are required.", "error");
      return;
    }

    setIsSaving(true);
    try {
      // Remove null id if it's new (let DB generate it)
      const { id, created_at, ...dataToSave } = formData;
      const payload: any = { ...dataToSave };
      
      if (editingId !== 'new') {
        payload.id = editingId;
      }

      await upsertTeamMember(payload);
      
      addToast("Team member saved successfully.", "success");
      setEditingId(null);
    } catch (error: any) {
      console.error(error);
      addToast(error.message || "Failed to save team member.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    
    setIsSaving(true);
    try {
      await deleteTeamMember(id);
      addToast("Team member deleted.", "success");
      if (editingId === id) setEditingId(null);
    } catch (error: any) {
      console.error(error);
      addToast("Failed to delete team member.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* List Column */}
      <div className="md:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Team Members</h3>
          <Button onClick={handleCreate} size="sm" className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {members.map(member => (
            <Card 
              key={member.id} 
              className={`cursor-pointer transition-colors hover:bg-slate-800 border-slate-700 ${editingId === member.id ? 'bg-slate-800 border-cyan-500' : 'bg-navy-900'}`}
              onClick={() => handleEdit(member)}
            >
              <div className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                  {member.avatar_url ? (
                    <Image 
                      src={member.avatar_url} 
                      alt={member.name} 
                      width={40} 
                      height={40} 
                      className="object-cover h-full w-full"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-white truncate">{member.name}</p>
                  <p className="text-xs text-slate-400 truncate">{member.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Column */}
      <div className="md:col-span-2">
        {editingId ? (
          <Card className="bg-navy-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">
                {editingId === 'new' ? 'Add Team Member' : 'Edit Team Member'}
              </CardTitle>
              <CardDescription>
                Manage profile details and reporting lines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200">Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name || ''} 
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="bg-navy-950 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-slate-200">Role</Label>
                  <Input 
                    id="role" 
                    value={formData.role || ''} 
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="bg-navy-950 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url" className="text-slate-200">Avatar URL</Label>
                <div className="flex gap-4">
                  <Input 
                    id="avatar_url" 
                    value={formData.avatar_url || ''} 
                    onChange={(e) => handleChange('avatar_url', e.target.value)}
                    className="bg-navy-950 border-slate-700 text-white flex-1"
                    placeholder="https://... or /assets/team/image.png"
                  />
                  {formData.avatar_url && (
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-700 flex-shrink-0 border border-slate-600">
                       <Image 
                        src={formData.avatar_url} 
                        alt="Preview" 
                        width={40} 
                        height={40} 
                        className="object-cover h-full w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parent_id" className="text-slate-200">Reports To</Label>
                  <select
                    id="parent_id"
                    value={formData.parent_id || "none"}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChange('parent_id', val === "none" ? null : val);
                    }}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-700 bg-navy-950 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-navy-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="none">-- No Parent (Root) --</option>
                    {members
                      .filter(m => m.id !== editingId)
                      .map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role})
                        </option>
                      ))
                    }
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order" className="text-slate-200">Display Order</Label>
                  <Input 
                    id="display_order" 
                    type="number"
                    value={formData.display_order || 0} 
                    onChange={(e) => handleChange('display_order', parseInt(e.target.value))}
                    className="bg-navy-950 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-slate-200">Bio / Department</Label>
                <Textarea 
                  id="bio" 
                  value={formData.bio || ''} 
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="bg-navy-950 border-slate-700 text-white"
                  placeholder="Department or short bio..."
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  variant="destructive" 
                  onClick={() => handleDelete(editingId!)}
                  disabled={isSaving || editingId === 'new'}
                  type="button"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleCancel} disabled={isSaving} className="text-slate-300">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-lg text-slate-500">
            <p>Select a team member to edit or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
