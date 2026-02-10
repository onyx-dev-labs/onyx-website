
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function applyPolicies() {
  console.log('--- Applying Storage RLS Policies ---');

  const connectionString = process.env.POSTGRES_DB;
  if (!connectionString) {
    throw new Error('POSTGRES_DB environment variable not found');
  }

  let clientConfig;
  
  // Parse connection string manually to handle special characters in password
  try {
    const lastAt = connectionString.lastIndexOf('@');
    const schemeEnd = connectionString.indexOf('://');
    
    if (lastAt > -1 && schemeEnd > -1) {
      const credentialsPart = connectionString.substring(schemeEnd + 3, lastAt);
      const hostPart = connectionString.substring(lastAt + 1);
      
      const [user, ...passwordParts] = credentialsPart.split(':');
      const password = passwordParts.join(':'); // In case password has :
      
      // Handle host, port, db
      // hostPart like "host:port/db"
      const [hostPort, dbName] = hostPart.split('/');
      const [host, port] = hostPort.split(':');
      
      console.log(`Parsed config - Host: ${host}, User: ${user}`);
      
      clientConfig = {
        user,
        password,
        host,
        port: parseInt(port || '5432'),
        database: dbName || 'postgres',
        ssl: { rejectUnauthorized: false }
      };
    }
  } catch (e) {
    console.warn('Failed to parse connection string manually, falling back to string:', e);
  }

  const client = new Client(clientConfig || {
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    // 1. Enable RLS on storage.objects (usually enabled, but good to ensure)
    try {
        await client.query('ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;');
        console.log('RLS enabled on storage.objects.');
    } catch (e: any) {
        if (e.code === '42501') {
            console.log('Warning: Skipped enabling RLS due to insufficient permissions (likely already enabled).');
        } else {
            console.error('Error enabling RLS:', e);
        }
    }

    // 2. Define Policies
    const policies = [

      {
        name: 'Authenticated users can upload avatars',
        definition: "bucket_id = 'avatars'",
        command: 'INSERT',
        role: 'authenticated'
      },
      {
        name: 'Authenticated users can update own avatars',
        definition: "bucket_id = 'avatars' AND owner = auth.uid()",
        command: 'UPDATE',
        role: 'authenticated'
      },
      {
        name: 'Authenticated users can upload chat attachments',
        definition: "bucket_id = 'chat-attachments'",
        command: 'INSERT',
        role: 'authenticated'
      },
      {
        name: 'Authenticated users can select chat attachments',
        definition: "bucket_id = 'chat-attachments'",
        command: 'SELECT',
        role: 'authenticated'
      },
       {
        name: 'Public can select avatars',
        definition: "bucket_id = 'avatars'",
        command: 'SELECT',
        role: 'public' // or anon
      }
    ];

    for (const policy of policies) {
      // Drop existing policy to ensure update
      // DROP POLICY IF EXISTS "name" ON storage.objects;
      try {
        await client.query(`DROP POLICY IF EXISTS "${policy.name}" ON storage.objects;`);
      } catch (e: any) {
        if (e.code === '42501') {
            console.log(`Warning: Cannot drop policy "${policy.name}" (permission denied). Attempting creation anyway.`);
        } else {
            console.warn(`Warning: Failed to drop policy "${policy.name}":`, e.message);
        }
      }
      
      // Create new policy
      // CREATE POLICY "name" ON storage.objects FOR COMMAND TO ROLE WITH CHECK (DEFINITION);
      // Note: SELECT policies use USING, INSERT/UPDATE use WITH CHECK (and USING for UPDATE)
      
      let query = '';
      if (policy.command === 'INSERT') {
        query = `CREATE POLICY "${policy.name}" ON storage.objects FOR INSERT TO ${policy.role} WITH CHECK (${policy.definition});`;
      } else if (policy.command === 'SELECT') {
        query = `CREATE POLICY "${policy.name}" ON storage.objects FOR SELECT TO ${policy.role} USING (${policy.definition});`;
      } else if (policy.command === 'UPDATE') {
        query = `CREATE POLICY "${policy.name}" ON storage.objects FOR UPDATE TO ${policy.role} USING (${policy.definition});`;
      }

      if (query) {
        try {
          await client.query(query);
          console.log(`Applied policy: ${policy.name}`);
        } catch (e: any) {
          if (e.code === '42710') { // duplicate_object
             console.log(`Policy "${policy.name}" already exists.`);
          } else {
             console.error(`Failed to apply policy "${policy.name}":`, e.message);
          }
        }
      }
    }

    console.log('--- Policies Applied Successfully ---');

  } catch (err) {
    console.error('Error applying policies:', err);
  } finally {
    await client.end();
  }
}

applyPolicies();
