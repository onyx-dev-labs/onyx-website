
import { createAdminClient } from '../src/lib/supabase/admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function syncProfiles() {
  console.log('--- Syncing Profiles ---');
  const adminSupabase = createAdminClient();

  // 1. Get all users
  const { data: { users }, error: authError } = await adminSupabase.auth.admin.listUsers({
    perPage: 1000
  });

  if (authError) {
    console.error('Error fetching users:', authError);
    return;
  }

  console.log(`Found ${users.length} auth users.`);

  for (const user of users) {
    // Check if profile exists
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      console.log(`Creating missing profile for ${user.email}...`);
      const { error: insertError } = await adminSupabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
          status: 'offline'
        });

      if (insertError) {
        console.error(`Failed to create profile for ${user.email}:`, insertError);
      } else {
        console.log(`Profile created for ${user.email}`);
      }
    } else {
      console.log(`Profile exists for ${user.email}`);
    }
  }
}

syncProfiles();
