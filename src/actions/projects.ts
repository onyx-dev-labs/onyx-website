'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data;
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const tech_stack = (formData.get('tech_stack') as string).split(',').map(t => t.trim());
  const live_link = formData.get('live_link') as string;
  const github_link = formData.get('github_link') as string;
  const image_file = formData.get('image') as File;

  let image_url = '';

  if (image_file && image_file.size > 0) {
    const filename = `${Date.now()}-${image_file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('onyx-assets')
      .upload(filename, image_file);

    if (uploadError) {
      throw new Error('Failed to upload image');
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('onyx-assets')
      .getPublicUrl(filename);
      
    image_url = publicUrl;
  }

  const { error } = await supabase.from('projects').insert({
    title,
    category,
    description,
    tech_stack,
    live_link,
    github_link,
    image_url
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin/projects');
}

export async function getProject(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  return data;
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient();
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const tech_stack = (formData.get('tech_stack') as string).split(',').map(t => t.trim());
  const live_link = formData.get('live_link') as string;
  const github_link = formData.get('github_link') as string;
  const image_file = formData.get('image') as File;

  const updates: any = {
    title,
    category,
    description,
    tech_stack,
    live_link,
    github_link,
  };

  if (image_file && image_file.size > 0) {
    const filename = `${Date.now()}-${image_file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('onyx-assets')
      .upload(filename, image_file);

    if (uploadError) {
      throw new Error('Failed to upload image');
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('onyx-assets')
      .getPublicUrl(filename);
      
    updates.image_url = publicUrl;
  }

  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin/projects');
  revalidatePath(`/admin/projects/${id}`);
}
