"use client";

import { useState } from "react";
import { Profile } from "@/types/chat";
import { createTeamMember, deleteTeamMember, resetUserPassword } from "@/actions/chat-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, UserPlus, Copy, Check, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserManagementProps {
  initialProfiles: Profile[];
}

export function UserManagement({ initialProfiles }: UserManagementProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState<string | null>(null);
  const [resettingUser, setResettingUser] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "member",
    bio: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const displayName = `${formData.firstName} ${formData.lastName}`.trim();
    
    console.log('[UserManagement] Creating new team member:', formData.email);
    try {
      const result = await createTeamMember(
        formData.email, 
        displayName, 
        formData.role,
        { bio: formData.bio }
      );
      
      console.log('[UserManagement] Team member created successfully');
      
      if (result.emailSuccess) {
        setSuccessEmail(formData.email);
        setEmailSent(true);
        if (result.emailMocked) {
          addToast("User created. Email mocked (check server console).", "warning");
        } else {
          addToast("Invitation sent! User created.", "success");
        }
      } else {
        // Handle email failure (rate limit, etc)
        addToast("User created, but email delivery failed.", "warning");
        setSuccessEmail(formData.email); 
        setEmailSent(false);
        
        // If we have a temp password, it means we fell back to manual creation
        if (result.tempPassword) {
          setTempPassword(result.tempPassword);
        }
      }
    } catch (error: any) {
      console.error('[UserManagement] Error creating team member:', error);
      addToast(
        error.message,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to reset the password for ${email}? This will generate a new temporary password.`)) return;
    
    setResettingUser(userId);
    try {
      const result = await resetUserPassword(userId);
      setResetPassword(result.newPassword);
      addToast("Password reset successfully", "success");
    } catch (error: any) {
      console.error('[UserManagement] Error resetting password:', error);
      addToast(error.message, "error");
    } finally {
      setResettingUser(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    console.log('[UserManagement] Deleting team member:', userId);
    try {
      await deleteTeamMember(userId);
      console.log('[UserManagement] Team member deleted successfully');
      setProfiles(profiles.filter(p => p.id !== userId));
      addToast(
        "Team member has been removed.",
        "success"
      );
    } catch (error: any) {
      console.error('[UserManagement] Error deleting team member:', error);
      addToast(
        error.message,
        "error"
      );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast(
      "Copied to clipboard",
      "success"
    );
  };

  return (
    <div className="space-y-6">
      <Dialog open={!!resetPassword} onOpenChange={(open) => !open && setResetPassword(null)}>
        <DialogContent className="bg-navy-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Password Reset Successful</DialogTitle>
            <DialogDescription className="text-slate-400">
              Share this temporary password with the user. They can use it to log in immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-black/30 p-4 rounded-md border border-white/10 mt-4">
            <div className="flex items-center justify-between">
              <code className="text-xl font-mono text-cyan-400">{resetPassword}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white"
                onClick={() => copyToClipboard(resetPassword || "")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="cyber" onClick={() => setResetPassword(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Team Members</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="cyber" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-navy-900 border-cyan-500/30">
            <DialogHeader>
              <DialogTitle className="text-white">Invite New Team Member</DialogTitle>
              <DialogDescription className="text-slate-400">
                Send an invitation to a new team member. They will receive an email with a secure link to join.
              </DialogDescription>
            </DialogHeader>

            {successEmail ? (
              <div className="space-y-4 py-4">
                {emailSent && (
                  <div className="rounded-md bg-green-500/10 p-4 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <Check className="h-4 w-4" />
                      <span className="font-semibold">Invitation Sent!</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                      <span>
                        An invitation email has been sent to <span className="text-white font-medium">{successEmail}</span>.
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 text-slate-400 hover:text-white"
                        onClick={() => successEmail && copyToClipboard(successEmail)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                      The user will need to click the link in the email to set their password and log in.
                    </p>
                  </div>
                )}

                {tempPassword && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-4 mb-4">
                    <p className="text-amber-400 font-medium mb-2">Email Delivery Failed (Rate Limit)</p>
                    <p className="text-slate-400 text-sm mb-3">
                      The user was created, but the invitation email could not be sent. 
                      Please share this temporary password with them manually:
                    </p>
                    <div className="flex items-center justify-between bg-black/30 p-3 rounded border border-white/10">
                      <code className="text-white font-mono text-lg">{tempPassword}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-white"
                        onClick={() => copyToClipboard(tempPassword)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button onClick={() => {
                    setIsOpen(false);
                    setSuccessEmail(null);
                    setTempPassword(null);
                    setFormData({ email: "", firstName: "", lastName: "", role: "member", bio: "" });
                  }}>
                    Done
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="bg-navy-950 border-slate-800 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="bg-navy-950 border-slate-800 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-navy-950 border-slate-800 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-slate-300">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="bg-navy-950 border-slate-800 text-white">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-navy-900 border-slate-800 text-white">
                      <SelectItem value="admin">Admin (Full Access)</SelectItem>
                      <SelectItem value="member">Member (Standard Access)</SelectItem>
                      <SelectItem value="viewer">Viewer (Read Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-slate-300">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="bg-navy-950 border-slate-800 text-white resize-none"
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                    Cancel
                  </Button>
                  <Button type="submit" variant="cyber" disabled={isLoading}>
                    {isLoading ? "Generating Invite..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-950/50">
        <div className="grid grid-cols-12 gap-4 border-b border-slate-800 p-4 text-sm font-medium text-slate-400">
          <div className="col-span-4">User</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y divide-slate-800">
          {profiles.map((profile) => (
            <div key={profile.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-900/50 transition-colors">
              <div className="col-span-4 flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>{profile.display_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-white">{profile.display_name}</span>
              </div>
              <div className="col-span-4 text-slate-400 text-sm truncate">
                {profile.email}
              </div>
              <div className="col-span-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  profile.status === 'online' 
                    ? 'bg-green-500/10 text-green-500' 
                    : profile.status === 'busy'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-slate-500/10 text-slate-500'
                }`}>
                  {profile.status}
                </span>
              </div>
              <div className="col-span-2 text-right flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/30"
                  onClick={() => handleResetPassword(profile.id, profile.email)}
                  disabled={resettingUser === profile.id}
                  title="Reset Password"
                >
                  {resettingUser === profile.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                  onClick={() => handleDelete(profile.id)}
                  title="Delete User"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {profiles.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No team members found. Create one to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
