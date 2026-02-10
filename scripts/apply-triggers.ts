
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function applyTriggers() {
  console.log('--- Applying Chat Triggers ---');

  const connectionString = process.env.POSTGRES_DB;
  if (!connectionString) {
    throw new Error('POSTGRES_DB environment variable not found in .env.local');
  }

  // Read the SQL file
  const sqlPath = path.resolve(__dirname, 'setup-chat-triggers.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

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

    console.log('Executing SQL script...');
    await client.query(sql);
    console.log('SQL script executed successfully.');

  } catch (error) {
    console.error('Error executing SQL script:', error);
  } finally {
    await client.end();
  }
}

applyTriggers().catch(console.error);
