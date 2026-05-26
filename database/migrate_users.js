const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const devVarsPath = path.resolve(__dirname, '../.dev.vars');
if (fs.existsSync(devVarsPath)) {
  const devVars = dotenv.parse(fs.readFileSync(devVarsPath));
  for (const k in devVars) {
    process.env[k] = devVars[k];
  }
}

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found in .dev.vars');
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to database.');

    await client.query(`
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS graduations TEXT[],
      ADD COLUMN IF NOT EXISTS relationship_status VARCHAR(100),
      ADD COLUMN IF NOT EXISTS website_url TEXT,
      ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::JSONB,
      ADD COLUMN IF NOT EXISTS skills TEXT[],
      ADD COLUMN IF NOT EXISTS interests TEXT[],
      ADD COLUMN IF NOT EXISTS cover_url TEXT;
    `);

    // Reload PostgREST schema cache
    await client.query("NOTIFY pgrst, 'reload schema';");

    console.log('Migration successful!');
  } catch (err) {
    console.error('Error executing migration:', err);
  } finally {
    await client.end();
  }
}

runMigration();
