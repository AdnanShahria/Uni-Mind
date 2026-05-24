import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const { Client } = pg;

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '../.dev.vars') });

async function seedDatabase() {
  console.log("Connecting to database...");
  
  if (!process.env.DATABASE_URL) {
    console.error("Missing DATABASE_URL in .dev.vars");
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected successfully.");

    const schemas = [
      'communities.sql',
      'posts.sql',
      'notes.sql',
      'messages.sql',
      'seed.sql'
    ];

    for (const file of schemas) {
      const filePath = path.resolve(process.cwd(), `../database/schema/${file}`);
      console.log(`Executing ${file}...`);
      const sql = fs.readFileSync(filePath, 'utf8');
      await client.query(sql);
    }
    
    console.log("=========================================");
    console.log("SUCCESS: Database schema and mock data seeded!");
    console.log("=========================================");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.end();
  }
}

seedDatabase();
