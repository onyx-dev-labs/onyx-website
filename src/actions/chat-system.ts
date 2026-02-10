'use server';

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Conversation, Message, Profile } from "@/types/chat";

export async function getConversations(): Promise<Conversation[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Use admin client to bypass potential recursive RLS policies
  const adminSupabase = createAdminClient();

  // 1. Get IDs of conversations I am in
  const { data: myParticipations, error: partError } = await adminSupabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id);

  if (partError) {
    console.error('Error fetching participations:', partError);
    return [];
  }

  const conversationIds = myParticipations.map(p => p.conversation_id);

  if (conversationIds.length === 0) return [];

  // 2. Fetch conversations and all their participants
  const { data: conversations, error } = await adminSupabase
    .from('conversations')
    .select(`
      *,
      participants:conversation_participants(
        last_read_at,
        user:profiles(*)
      )
    `)
    .in('id', conversationIds)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  // Transform data to match type
  return conversations.map((c: any) => ({
    ...c,
    participants: c.participants.map((p: any) => ({
      ...p.user,
      last_read_at: p.last_read_at
    }))
  }));
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Use admin client to bypass potential recursive RLS policies
  const adminSupabase = createAdminClient();

  // Verify membership first
  const { data: member } = await adminSupabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .single();
  
  if (!member) {
    console.error('Unauthorized access to conversation messages');
    return [];
  }
  
  const { data: messages, error } = await adminSupabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(*)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return messages as Message[];
}

export async function sendMessage(conversationId: string, content: string, type: 'text' | 'image' | 'file' = 'text', fileUrl?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const adminSupabase = createAdminClient();

  // Verify membership first
  const { data: member } = await adminSupabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .single();

  if (!member) throw new Error('Unauthorized');

  const { data: newMessage, error } = await adminSupabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      type,
      file_url: fileUrl
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Manual Trigger Logic (since we can't run SQL triggers easily)
  // 1. Update conversation last_message
  await adminSupabase
    .from('conversations')
    .update({
      last_message_at: newMessage.created_at,
      last_message_id: newMessage.id
    })
    .eq('id', conversationId);

  // 2. Increment unread_count for other participants
  // We need to do this carefully to avoid race conditions, but simple update is fine for now
  // Postgres 'rpc' would be better but requires SQL function.
  // We'll fetch participants first.
  const { data: participants } = await adminSupabase
    .from('conversation_participants')
    .select('user_id, unread_count')
    .eq('conversation_id', conversationId)
    .neq('user_id', user.id);

  if (participants) {
    // Process in batches or one by one
    // Using a loop for simplicity, but could be optimized
    await Promise.all(participants.map(p => 
      adminSupabase
        .from('conversation_participants')
        .update({ unread_count: (p.unread_count || 0) + 1 })
        .eq('conversation_id', conversationId)
        .eq('user_id', p.user_id)
    ));
  }
  
  revalidatePath('/admin/chat');
}

export async function markAsRead(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const adminSupabase = createAdminClient();

  // Update last_read_at and reset unread_count
  const { error } = await adminSupabase
    .from('conversation_participants')
    .update({ 
      last_read_at: new Date().toISOString(),
      unread_count: 0
    })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id);

  if (error) console.error('Error marking messages as read:', error);
  revalidatePath('/admin/chat');
}

export async function createDirectConversation(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // Use admin client to verify existence without RLS recursion
  const adminSupabase = createAdminClient();

  // Check if conversation already exists (simplified)
  const { data: existingConvs, error: existingError } = await adminSupabase
    .from('conversations')
    .select('id, conversation_participants(user_id)')
    .eq('type', 'direct');

  if (!existingError && existingConvs) {
    const existing = existingConvs.find(c => 
      c.conversation_participants.some((p: any) => p.user_id === userId) &&
      c.conversation_participants.some((p: any) => p.user_id === user.id)
    );
    if (existing) return existing.id;
  }
  
  const { data: conversation, error: convError } = await adminSupabase
    .from('conversations')
    .insert({
      type: 'direct',
      created_by: user.id
    })
    .select()
    .single();

  if (convError) throw new Error(convError.message);

  // Add participants
  const { error: partError } = await adminSupabase
    .from('conversation_participants')
    .insert([
      { conversation_id: conversation.id, user_id: user.id },
      { conversation_id: conversation.id, user_id: userId }
    ]);

  if (partError) throw new Error(partError.message);

  revalidatePath('/admin/chat');
  return conversation.id;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function updateProfile(data: Partial<Profile>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/chat');
  revalidatePath('/chat');
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Use admin client to fetch all users
  const adminSupabase = createAdminClient();

  // 1. List all users to get their IDs (regardless of verification status, as invited users might be 'waiting')
  const { data: { users }, error: authError } = await adminSupabase.auth.admin.listUsers({
    perPage: 1000
  });

  if (authError) {
    console.error('Error fetching users:', authError);
    return [];
  }

  // Get all user IDs
  const userIds = users.map(u => u.id);

  if (userIds.length === 0) return [];

  // 2. Fetch profiles for these users
  const { data, error } = await adminSupabase
    .from('profiles')
    .select('*')
    .in('id', userIds)
    .order('display_name', { ascending: true });

  if (error) return [];
  return data as Profile[];
}


export async function createTeamMember(
  email: string, 
  displayName: string, 
  role: string = 'member',
  details: { bio?: string; title?: string } = {}
) {
  // Verify current user is admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');
  
  // Strict Role Check: Only admins can invite new users
  if (user.user_metadata?.role !== 'admin') {
    console.error(`[Security] Unauthorized user creation attempt by ${user.id} (${user.email})`);
    throw new Error('Unauthorized: Admin privileges required');
  }
  
  const adminSupabase = createAdminClient();
  
  // Use Supabase built-in invitation system
  // This sends an email with a magic link to set a password
  let inviteData: any;
  let inviteError: any;
  let tempPassword = "";
  let emailSent = true;

  try {
    const result = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      data: { 
        display_name: displayName,
        role: role,
        ...details
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/admin`
    });
    inviteData = result.data;
    inviteError = result.error;
  } catch (err: any) {
    inviteError = err;
  }

  // Handle Rate Limit by falling back to direct creation with temp password
  if (inviteError && (inviteError.status === 429 || inviteError.message?.includes('rate limit'))) {
    console.warn(`[createTeamMember] Email rate limit exceeded for ${email}. Falling back to manual creation.`);
    
    // Generate secure temporary password
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    for (let i = 0; i < 12; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const createResult = await adminSupabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm since admin is creating it
      user_metadata: { 
        display_name: displayName,
        role: role,
        ...details
      }
    });

    if (createResult.error) throw new Error(createResult.error.message);
    inviteData = createResult.data;
    emailSent = false;
  } else if (inviteError) {
    throw new Error(inviteError.message);
  }

  if (!inviteData?.user) throw new Error('Failed to create user invitation');
  const newUser = inviteData;

  // Create profile immediately so they show up in the list
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .upsert({
      id: newUser.user.id,
      email: email,
      display_name: displayName,
      status: 'offline',
      force_password_change: true,
      about: details.bio || null,
    });

  if (profileError) {
    // Cleanup if profile creation fails
    await adminSupabase.auth.admin.deleteUser(newUser.user.id);
    throw new Error(profileError.message);
  }

  // 4. Add to "General" Group Chat
  try {
    // Check if General chat exists
    let { data: generalChat } = await adminSupabase
      .from('conversations')
      .select('id')
      .eq('name', 'General')
      .eq('type', 'group')
      .maybeSingle(); // Use maybeSingle to avoid error if not found
    
    let generalChatId = generalChat?.id;

    if (!generalChatId) {
      console.log('[createTeamMember] "General" chat not found. Creating it...');
      const { data: newGeneral, error: createError } = await adminSupabase
        .from('conversations')
        .insert({
          name: 'General',
          type: 'group',
          created_by: user.id
        })
        .select('id')
        .single();
      
      if (createError) {
        console.error('[createTeamMember] Failed to create General chat:', createError);
      } else {
        generalChatId = newGeneral.id;
        // Add the creator (admin) to the chat as well
        await adminSupabase
          .from('conversation_participants')
          .insert({
            conversation_id: generalChatId,
            user_id: user.id
          });
      }
    }

    if (generalChatId) {
      const { error: joinError } = await adminSupabase
        .from('conversation_participants')
        .insert({
          conversation_id: generalChatId,
          user_id: newUser.user.id
        });
        
      if (joinError) {
        console.error('[createTeamMember] Failed to add user to General chat:', joinError);
      } else {
        console.log(`[createTeamMember] Added user ${newUser.user.id} to General chat (${generalChatId})`);
      }
    }
  } catch (chatError) {
    console.error('[createTeamMember] Error handling General chat:', chatError);
    // Don't fail the whole user creation just because chat add failed
  }

  // Audit Log
  console.log(`[AUDIT] User ${emailSent ? 'invited' : 'created (manual)'}: ${email} (ID: ${newUser.user.id}) by ${user.email} at ${new Date().toISOString()}`);

  revalidatePath('/admin/users');
  
  // Return structure compatible with frontend expectation
  return { 
    success: true, 
    userId: newUser.user.id, 
    emailSuccess: emailSent, 
    emailMocked: false,
    tempPassword: tempPassword // Only present if email failed
  };
}

export async function deleteTeamMember(userId: string) {
  // Verify current user is admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  // Strict Role Check: Only admins can delete users
  if (user.user_metadata?.role !== 'admin') {
    console.error(`[Security] Unauthorized user deletion attempt by ${user.id} (${user.email})`);
    throw new Error('Unauthorized: Admin privileges required');
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.auth.admin.deleteUser(userId);
  
  if (error) {
    // If user is not found in Auth, they might still be in profiles (orphaned)
    if (error.message.includes("User not found") || error.code === "404") {
      console.warn(`[deleteTeamMember] User ${userId} not found in Auth, attempting to clean up profile...`);
    } else {
      throw new Error(error.message);
    }
  }

  // Ensure profile is deleted (in case of orphan or if Auth delete didn't cascade for some reason)
  // This is safe to run even if already deleted (it will just delete 0 rows)
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) {
    console.error(`[deleteTeamMember] Failed to delete profile for ${userId}:`, profileError);
    // We don't throw here if the main goal (Auth delete) was handled or skipped
  }

  revalidatePath('/admin/users');
}

export async function resetUserPassword(userId: string) {
  // Verify current user is admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  // Strict Role Check: Only admins can reset passwords
  if (user.user_metadata?.role !== 'admin') {
    console.error(`[Security] Unauthorized password reset attempt by ${user.id} (${user.email})`);
    throw new Error('Unauthorized: Admin privileges required');
  }

  const adminSupabase = createAdminClient();

  // Generate secure temporary password
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let tempPassword = "";
  for (let i = 0; i < 12; i++) {
    tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
    password: tempPassword,
    user_metadata: { force_password_change: true }
  });

  if (error) throw new Error(error.message);

  // Also update profile to reflect the force change requirement
  await adminSupabase
    .from('profiles')
    .update({ force_password_change: true })
    .eq('id', userId);

  console.log(`[AUDIT] Password reset for user ${userId} by ${user.email} at ${new Date().toISOString()}`);

  return { success: true, newPassword: tempPassword };
}

