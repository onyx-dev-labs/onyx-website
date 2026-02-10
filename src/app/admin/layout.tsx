import { Sidebar } from "@/components/admin/sidebar";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/actions/chat-system";
import { PasswordChangeModal } from "@/components/auth/password-change-modal";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let shouldForceChange = false;
  if (user) {
    const profile = await getProfile(user.id);
    if (profile?.force_password_change) {
      shouldForceChange = true;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-navy-900 text-slate-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
      <PasswordChangeModal shouldForceChange={shouldForceChange} />
    </div>
  );
}
