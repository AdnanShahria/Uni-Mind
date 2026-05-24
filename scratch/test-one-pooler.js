const { Client } = require('pg');

const region = 'us-east-2';
const password = "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";
const ref = "mbqiepxaqseltvkhaxoy";
const host = `aws-0-${region}.pooler.supabase.com`;

async function main() {
  const connectionString = `postgresql://postgres.${ref}:${password}@${host}:6543/postgres`;
  console.log(`Connecting to: postgresql://postgres.${ref}:[PASSWORD]@${host}:6543/postgres`);

  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("SUCCESS!");
    const res = await client.query("SELECT NOW()");
    console.log("Time:", res.rows[0]);
  } catch (err) {
    console.error("Connection failed! Error:", err);
  } finally {
    await client.end();
  }
}

main();
