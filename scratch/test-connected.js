const { Client } = require('pg');

const password = "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";
const ref = "mbqiepxaqseltvkhaxoy";
const host = "aws-1-ap-northeast-1.pooler.supabase.com";

async function main() {
  const connectionString = `postgresql://postgres.${ref}:${password}@${host}:6543/postgres`;
  console.log("Connecting to verified Supabase pooler...");

  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("CONNECTED SUCCESSFULLY!");
    
    const res = await client.query("SELECT NOW()");
    console.log("Server time:", res.rows[0]);

    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Existing public tables:", tables.rows.map(r => r.table_name));

  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.end();
  }
}

main();
