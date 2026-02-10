'use server';

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(prevState: any, formData: FormData) {
  console.log('[Auth] Login attempt starting');
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    console.warn('[Auth] Login failed: Missing credentials');
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('[Auth] Login error:', error.message);
    return { error: error.message };
  }

  console.log('[Auth] Login successful for user:', email);
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function updatePassword(password: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.auth.updateUser({ password });

  if (error) throw new Error(error.message);

  // Update profile force_password_change to false
  // We need to use admin client to update profile if RLS prevents it? 
  // Actually, users can update their own profile based on my schema policy "Users can update their own profile".
  // But let's check if force_password_change is editable by user. 
  // If I didn't restrict columns in RLS, they can. 
  // Ideally, this flag should be system-managed, but for simplicity, let's allow user to update it via server action using admin client or regular client if allowed.
  
  // Use admin client to be safe and ensure it happens
  const adminSupabase = createAdminClient();
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .update({ force_password_change: false })
    .eq('id', user.id);

  if (profileError) throw new Error(profileError.message);

  revalidatePath('/admin');
}
