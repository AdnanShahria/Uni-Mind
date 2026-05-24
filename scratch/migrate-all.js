const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function getDatabaseUrl() {
  const devVarsPath = path.join(__dirname, '..', 'backend', '.dev.vars');
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

  const schemaDir = path.join(__dirname, '..', 'database', 'schema');
  
  // Order matters due to foreign keys: users -> communities -> posts -> notes, messages, etc.
  const files = [
    'users.sql', 
    'communities.sql', 
    'connections.sql', 
    'posts.sql', 
    'messages.sql', 
    'notes.sql', 
    'planner.sql', 
    'research.sql', 
    'ai_tutor.sql', 
    'misc_ui.sql', 
    'rls.sql'
  ];

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    for (const file of files) {
      const sqlPath = path.join(schemaDir, file);
      if (fs.existsSync(sqlPath)) {
        console.log(`Executing ${file}...`);
        const sqlCode = fs.readFileSync(sqlPath, 'utf8');
        try {
          await client.query(sqlCode);
          console.log(`${file} executed successfully.`);
        } catch (e) {
          console.log(`Error in ${file}: ${e.message}`);
        }
      } else {
        console.warn(`Warning: ${file} not found.`);
      }
    }
    console.log("All schema migrations executed!");
    
    const seedPath = path.join(schemaDir, 'seed.sql');
    if (fs.existsSync(seedPath)) {
        console.log(`Executing seed.sql...`);
        const sqlCode = fs.readFileSync(seedPath, 'utf8');
        await client.query(sqlCode);
        console.log(`seed.sql executed successfully.`);
    }

  } catch (err) {
    console.error("MIGRATION FAILED!", err.message);
  } finally {
    await client.end();
  }
}

main();
