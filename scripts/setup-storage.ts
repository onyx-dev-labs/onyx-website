
import { createAdminClient } from '../src/lib/supabase/admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function setupStorage() {
  console.log('--- Setting up Supabase Storage ---');
  const supabase = createAdminClient();

  const buckets = [
    { name: 'avatars', public: true },
    { name: 'chat-attachments', public: true }
  ];

  for (const bucket of buckets) {
    console.log(`Checking bucket: ${bucket.name}...`);
    const { data, error } = await supabase.storage.getBucket(bucket.name);

    if (error && error.message.includes('not found')) {
      console.log(`Creating bucket: ${bucket.name}...`);
      const { error: createError } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: bucket.name === 'avatars' 
          ? ['image/*'] 
          : ['image/*', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      });

      if (createError) {
        console.error(`Failed to create bucket ${bucket.name}:`, createError);
      } else {
        console.log(`Bucket ${bucket.name} created successfully.`);
      }
    } else if (data) {
      console.log(`Bucket ${bucket.name} already exists.`);
      // Update public status if needed
      if (data.public !== bucket.public) {
        console.log(`Updating bucket ${bucket.name} to public=${bucket.public}...`);
        await supabase.storage.updateBucket(bucket.name, { public: bucket.public });
      }
    } else {
      console.error(`Error checking bucket ${bucket.name}:`, error);
    }
  }

  console.log('--- Storage Setup Complete ---');
}

setupStorage();
