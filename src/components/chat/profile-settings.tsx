"use client";

import { useState } from "react";
import { Profile } from "@/types/chat";
import { updateProfile } from "@/actions/chat-system";
import { uploadFile } from "@/lib/storage-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

interface ProfileSettingsProps {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSettingsDialog({ profile, open, onOpenChange }: ProfileSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    display_name: profile.display_name || "",
    about: profile.about || "",
    avatar_url: profile.avatar_url || "",
    wallpaper_url: profile.wallpaper_url || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(formData);
      addToast("Profile updated successfully", "success");
      onOpenChange(false);
    } catch (error: any) {
      addToast("Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar_url' | 'wallpaper_url') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        addToast("File too large. Please use an image under 5MB.", "error");
        return;
      }

      setIsLoading(true);
      try {
        const publicUrl = await uploadFile('avatars', file, `${field}/${profile.id}-${Date.now()}`);
        setFormData(prev => ({ ...prev, [field]: publicUrl }));
        addToast("Image uploaded successfully", "success");
      } catch (error: any) {
        console.error('Upload error:', error);
        addToast(error.message || "Failed to upload image", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-navy-900 border-slate-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-2 border-cyan-500/30">
              <AvatarImage src={formData.avatar_url} />
              <AvatarFallback className="bg-navy-800 text-2xl text-cyan-500">
                {formData.display_name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="relative overflow-hidden" onClick={() => document.getElementById('avatar-upload')?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Change Avatar
                <input 
                  id="avatar-upload"
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleFileUpload(e, 'avatar_url')}
                />
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="bg-navy-950 border-slate-800 focus:border-cyan-500"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="about">About</Label>
            <Textarea
              id="about"
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              className="bg-navy-950 border-slate-800 focus:border-cyan-500 min-h-[80px]"
              placeholder="Hey there! I am using Team Uplink."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="wallpaper">Chat Wallpaper</Label>
            <div className="flex gap-2">
              <Input
                id="wallpaper"
                value={formData.wallpaper_url}
                onChange={(e) => setFormData({ ...formData, wallpaper_url: e.target.value })}
                className="bg-navy-950 border-slate-800 focus:border-cyan-500"
                placeholder="https://..."
              />
              <Button type="button" variant="outline" size="icon" className="relative overflow-hidden flex-shrink-0" onClick={() => document.getElementById('wallpaper-upload')?.click()}>
                <Upload className="h-4 w-4" />
                <input 
                  id="wallpaper-upload"
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleFileUpload(e, 'wallpaper_url')}
                />
              </Button>
            </div>
            <p className="text-[10px] text-slate-500">
              Enter an image URL or upload a file (max 2MB).
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
