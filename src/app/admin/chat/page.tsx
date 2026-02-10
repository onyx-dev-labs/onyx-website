import { ChatInterface } from "@/components/chat/chat-interface";
import { getConversations, getProfile, getAllProfiles } from "@/actions/chat-system";
import { createClient } from "@/lib/supabase/server";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  // Ensure profile exists or create basic one
  let profile = await getProfile(user.id);
  
  if (!profile) {
    // If no profile, we should probably redirect to setup or create one on fly
    // For now, let's assume the trigger created it or we have a partial one
    profile = {
      id: user.id,
      email: user.email!,
      display_name: user.email?.split('@')[0] || 'Agent',
      avatar_url: null,
      status: 'online',
      last_seen: new Date().toISOString(),
      about: null,
      wallpaper_url: null,
      force_password_change: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  const conversations = await getConversations();
  const allProfiles = await getAllProfiles();

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white font-mono">
          Team Uplink
        </h1>
        <p className="text-slate-400">Encrypted realtime communication channel.</p>
      </div>

      <ChatInterface 
        currentUser={profile}
        initialConversations={conversations}
        allProfiles={allProfiles}
      />
    </div>
  );
}
