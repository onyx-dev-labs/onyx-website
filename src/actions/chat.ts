'use server'

import { createClient } from "@/lib/supabase/server";

export async function getMessages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('team_chat')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(50);

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data;
}

export async function sendMessage(content: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get user details for the chat message
  // In a real app, you might join with a profiles table, 
  // but here we'll assume we store sender info in the chat table for simplicity
  // or fetch it from a profile. For now, let's use metadata or placeholder.
  // Ideally, we should have a public.profiles table synced with auth.users
  
  // For this MVP, we'll assume the user's email or metadata contains the name.
  const sender_name: string = (user.user_metadata?.full_name as string) || (user.email?.split('@')[0] as string) || 'Unknown';
  
  const { error } = await supabase.from('team_chat').insert({
    content,
    sender_name,
    sender_id: user.id,
    sender_role: 'Admin' // Defaulting to Admin since only admins can chat in this spec
  });

  if (error) {
    throw new Error(error.message);
  }
}
