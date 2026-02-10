'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/database.types";

export type TeamMemberRow = Database['public']['Tables']['team_members']['Row'];
export type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'];
export type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update'];

export type TeamMemberNode = TeamMemberRow & {
  children: TeamMemberNode[];
};

export async function getTeamTree(): Promise<TeamMemberNode | null> {
  const supabase = await createClient();
  
  const { data: members, error } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching team members:', error);
    return null;
  }

  if (!members || members.length === 0) return null;

  // Build tree
  const memberMap = new Map<string, TeamMemberNode>();
  members.forEach(member => {
    memberMap.set(member.id, { ...member, children: [] });
  });

  let root: TeamMemberNode | null = null;

  members.forEach(member => {
    const node = memberMap.get(member.id)!;
    if (member.parent_id) {
      const parent = memberMap.get(member.parent_id);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      // Assuming single root for now, or picking the first one found as root
      if (!root) root = node;
    }
  });

  return root;
}

export async function getAllTeamMembers(): Promise<TeamMemberRow[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }

  return data || [];
}

export async function getTeamMember(id: string): Promise<TeamMemberRow | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching team member:', error);
    return null;
  }

  return data;
}

export async function upsertTeamMember(member: TeamMemberInsert) {
  const supabase = await createClient();
  
  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('team_members')
    .upsert(member);

  if (error) {
    console.error('Error updating team member:', error);
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin/cms');
}

export async function deleteTeamMember(id: string) {
  const supabase = await createClient();
  
  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting team member:', error);
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin/cms');
}
