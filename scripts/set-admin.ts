import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setAdminRole(email: string) {
  console.log(`Looking up user with email: ${email}...`);

  let userId: string | null = null;
  let page = 1;
  const perPage = 50;
  
  while (!userId) {
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: perPage
    });

    if (error) {
      console.error('Error listing users:', error.message);
      process.exit(1);
    }

    if (!users || users.length === 0) break;

    const found = users.find(u => u.email === email);
    if (found) {
      userId = found.id;
      break;
    }
    
    page++;
  }

  if (!userId) {
    console.error(`User with email ${email} not found.`);
    process.exit(1);
  }

  console.log(`Found user ID: ${userId}`);
  console.log(`Updating role to 'admin'...`);

  const { data: user, error: updateError } = await supabase.auth.admin.updateUserById(
    userId,
    { user_metadata: { role: 'admin' } }
  );

  if (updateError) {
    console.error('Error updating user:', updateError.message);
    process.exit(1);
  }

  console.log('Success! User metadata updated:');
  console.log(user.user.user_metadata);
}

const emailArg = process.argv[2];
if (!emailArg) {
  console.log('Usage: npx tsx scripts/set-admin.ts <email>');
  process.exit(1);
}

setAdminRole(emailArg);
