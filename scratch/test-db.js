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
  return process.env.DATABASE_URL || "postgresql://postgres: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@db.mbqiepxaqseltvkhaxoy.supabase.co:5432/postgres";
}

async function main() {
  const connectionString = getDatabaseUrl();
  console.log("Resolved connection string for test-db...");

  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database successfully!");

    // Query list of tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in database:", res.rows.map(r => r.table_name));

    // Create users table if not exists
    console.log("Checking and creating users table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        institution VARCHAR(255) NOT NULL,
        major VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Users table verified / created successfully!");

  } catch (err) {
    console.error("Database error:", err);
  } finally {
    await client.end();
  }
}

main();
