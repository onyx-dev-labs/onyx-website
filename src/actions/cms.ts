'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SiteConfigItem = {
  key: string;
  value: any;
  section: string;
  description?: string;
};

export async function getSiteConfig(section?: string) {
  const supabase = await createClient();
  let query = supabase.from('site_config').select('*');
  
  if (section) {
    query = query.eq('section', section);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching site config:', error);
    return [];
  }

  return data;
}

export async function updateSiteConfig(items: SiteConfigItem[]) {
  const supabase = await createClient();
  
  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const updates = items.map(item => ({
    key: item.key,
    value: item.value,
    section: item.section,
    description: item.description,
    updated_at: new Date().toISOString(),
    updated_by: user.id
  }));

  const { error } = await supabase
    .from('site_config')
    .upsert(updates, { onConflict: 'key' });

  if (error) {
    console.error('Error updating site config:', error);
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin/cms');
}
