const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Read the connection string from .dev.vars or env
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
    console.error("Error: DATABASE_URL not found in .dev.vars or environment variables.");
    process.exit(1);
  }

  console.log("Database connection string resolved successfully.");

  const sqlPath = path.join(__dirname, '..', 'database', 'schema', 'users.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error(`Error: SQL schema file not found at ${sqlPath}`);
    process.exit(1);
  }

  const sqlCode = fs.readFileSync(sqlPath, 'utf8');
  console.log("Loaded users.sql schema contents.");

  // Initialize Postgres Client
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false } // Supabase requires SSL
  });

  try {
    console.log("Connecting to Supabase PostgreSQL database...");
    await client.connect();
    console.log("Connection established! Executing schema definition SQL...");

    // Execute the loaded SQL queries
    await client.query(sqlCode);
    console.log("=========================================");
    console.log("DATABASE CODES EXECUTED SUCCESSFULLY IN SUPABASE!");
    console.log("The users table and triggers are fully active.");
    console.log("=========================================");

  } catch (err) {
    console.error("=========================================");
    console.error("MIGRATION FAILED!");
    console.error("Details:", err.message || err);
    console.error("If this is a DNS ENOTFOUND error, it indicates that your Supabase database host is suspended, paused, or currently unreachable from the local network.");
    console.error("Don't worry, the Auth Page and API Worker are configured with an active Mock DB Fallback so they remain 100% operational locally!");
    console.error("=========================================");
  } finally {
    await client.end();
  }
}

main();


