const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function getDatabaseUrl() {
  const devVarsPath = path.join(__dirname, '..', '.dev.vars');
  if (fs.existsSync(devVarsPath)) {
    const content = fs.readFileSync(devVarsPath, 'utf8');
    const match = content.match(/DATABASE_URL=["']?([^"'\s]+)["']?/);
    if (match) return match[1];
  }
  return process.env.DATABASE_URL;
}

async function main() {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    console.error("Error: DATABASE_URL not found.");
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase.");

    const alterUsersSql = `
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS graduations TEXT[],
      ADD COLUMN IF NOT EXISTS relationship_status VARCHAR(100),
      ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    `;
    await client.query(alterUsersSql);
    console.log("Added columns to users table.");

    const alterPostsSql = `
      ALTER TABLE public.posts 
      ADD COLUMN IF NOT EXISTS title VARCHAR(255);
    `;
    await client.query(alterPostsSql);
    console.log("Added title column to posts table.");

    const connectionsSqlPath = path.join(__dirname, '..', 'database', 'schema', 'connections.sql');
    if (fs.existsSync(connectionsSqlPath)) {
      const connectionsSql = fs.readFileSync(connectionsSqlPath, 'utf8');
      await client.query(connectionsSql);
      console.log("Created connections and post_shares tables.");
    }

    console.log("Schema updates applied successfully.");
  } catch (err) {
    console.error("MIGRATION FAILED!", err);
  } finally {
    await client.end();
  }
}

main();
