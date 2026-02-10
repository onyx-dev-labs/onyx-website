"use client";

import { useState } from "react";
import { updatePassword } from "@/actions/auth";
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
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PasswordChangeModalProps {
  shouldForceChange: boolean;
}

export function PasswordChangeModal({ shouldForceChange }: PasswordChangeModalProps) {
  const [isOpen, setIsOpen] = useState(shouldForceChange);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  if (!shouldForceChange) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    if (password.length < 6) {
      addToast("Password must be at least 6 characters", "error");
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(password);
      addToast("Password updated successfully", "success");
      setIsOpen(false);
    } catch (error: any) {
      addToast(error.message || "Failed to update password", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Prevent closing if forced
      if (!open && shouldForceChange && !isLoading) {
        return; 
      }
      setIsOpen(open);
    }}>
      <DialogContent className="bg-navy-900 border-slate-800 text-white sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Change Password Required</DialogTitle>
          <DialogDescription>
            For your security, you must change your temporary password before continuing.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-navy-950 border-slate-800 focus:border-cyan-500"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-navy-950 border-slate-800 focus:border-cyan-500"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700 w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
