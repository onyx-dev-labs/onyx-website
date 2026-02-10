'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutDashboard, 
  FolderGit2, 
  Users, 
  MessageSquare, 
  LogOut, 
  Terminal,
  FileEdit,
  Shield
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Projects', href: '/admin/projects', icon: FolderGit2 },
  { name: 'Team Roster', href: '/admin/team', icon: Users },
  { name: 'User Access', href: '/admin/users', icon: Shield },
  { name: 'Uplink', href: '/admin/chat', icon: MessageSquare },
  { name: 'Site Editor', href: '/admin/cms', icon: FileEdit },
];

export function Sidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fetchUnread = async () => {
        const { data } = await supabase
          .from('conversation_participants')
          .select('unread_count')
          .eq('user_id', user.id);
        
        if (data) {
          setUnreadCount(data.reduce((acc, curr) => acc + (curr.unread_count || 0), 0));
        }
      };

      // Initial fetch
      fetchUnread();

      // Subscribe to changes
      const channel = supabase.channel('sidebar_notifications')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchUnread();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, []);

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-800 bg-navy-950">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <Terminal className="h-6 w-6 text-cyan-500" />
          <span className="font-mono text-lg font-bold text-white">
            ONYX<span className="text-cyan-500">_ADMIN</span>
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const isChat = item.name === 'Uplink';
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors relative",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <div className="relative">
                  <item.icon className="h-4 w-4" />
                  {isChat && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-navy-950 animate-pulse" />
                  )}
                </div>
                {item.name}
                {isChat && unreadCount > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-slate-800 p-4">
        <form action={logout}>
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </Button>
        </form>
      </div>
    </div>
  );
}
