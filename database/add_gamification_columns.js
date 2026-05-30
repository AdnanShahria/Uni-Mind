const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .dev.vars
const devVarsPath = path.resolve(__dirname, '../.dev.vars');
if (fs.existsSync(devVarsPath)) {
  const devVars = dotenv.parse(fs.readFileSync(devVarsPath));
  for (const k in devVars) {
    process.env[k] = devVars[k];
  }
}

async function addGamificationColumns() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('TURSO_DATABASE_URL or TURSO_AUTH_TOKEN not found in .dev.vars');
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  try {
    console.log('Adding gamification columns to users table...');
    
    const queries = [
      `ALTER TABLE users ADD COLUMN knowledge_score INTEGER DEFAULT 0;`,
      `ALTER TABLE users ADD COLUMN study_streak INTEGER DEFAULT 0;`,
      `ALTER TABLE users ADD COLUMN badges TEXT DEFAULT '[]';`
    ];

    for (const q of queries) {
      try {
        await client.execute(q);
        console.log(`Executed: ${q}`);
      } catch (e) {
        if (e.message && e.message.includes('duplicate column name')) {
          console.log(`Column already exists, skipping: ${q}`);
        } else {
          console.error(`Error executing ${q}:`, e.message || e);
        }
      }
    }
    
    // Seed existing users with a random score for demo purposes
    console.log('Seeding demo scores...');
    await client.execute(`UPDATE users SET knowledge_score = abs(random() % 1000) WHERE knowledge_score = 0;`);
    await client.execute(`UPDATE users SET study_streak = abs(random() % 30) WHERE study_streak = 0;`);
    
    console.log('Successfully completed gamification migration.');
  } catch (err) {
    console.error('Migration error:', err.message || err);
  }
}

addGamificationColumns();
