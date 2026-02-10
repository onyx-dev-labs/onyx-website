
import { createAdminClient } from '../src/lib/supabase/admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function verifyUserSystem() {
  console.log('--- Verifying User System ---');
  
  try {
    const adminSupabase = createAdminClient();

    // 1. Fetch Auth Users
    console.log('Fetching auth users...');
    const { data: { users }, error: authError } = await adminSupabase.auth.admin.listUsers({
      perPage: 1000
    });

    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }

    console.log(`Found ${users.length} auth users.`);
    users.forEach(u => {
      console.log(`- ${u.email} (ID: ${u.id}) Confirmed: ${u.email_confirmed_at}`);
    });

    // 2. Fetch Profiles
    console.log('\nFetching profiles...');
    const { data: profiles, error: profileError } = await adminSupabase
      .from('profiles')
      .select('*');

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return;
    }

    console.log(`Found ${profiles.length} profiles.`);
    profiles.forEach(p => {
      console.log(`- ${p.display_name} (${p.email}) ID: ${p.id}`);
    });

    // 3. Simulate getAllProfiles logic
    console.log('\nSimulating getAllProfiles logic...');
    const verifiedIds = users
      .filter(u => u.email_confirmed_at)
      .map(u => u.id);
    
    console.log(`Verified IDs count: ${verifiedIds.length}`);

    if (verifiedIds.length === 0) {
      console.warn('WARNING: No verified users found. getAllProfiles will return empty array.');
    } else {
      const { data: filteredProfiles } = await adminSupabase
        .from('profiles')
        .select('*')
        .in('id', verifiedIds)
        .order('display_name', { ascending: true });
      
      console.log(`getAllProfiles would return ${filteredProfiles?.length || 0} profiles.`);
      if (filteredProfiles?.length === 0) {
        console.warn('WARNING: Verified users exist but no matching profiles found in public.profiles table.');
        console.warn('Mismatch details:');
        verifiedIds.forEach(id => {
          const hasProfile = profiles.some(p => p.id === id);
          if (!hasProfile) console.log(`- User ${id} is verified but has NO profile.`);
        });
      }
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

verifyUserSystem();
