const fs = require('fs');
const env = fs.readFileSync('.dev.vars', 'utf8');
const url = env.split('\n').find(l => l.startsWith('TURSO_DATABASE_URL')).split('=')[1].replace(/\"/g, '').trim();
const token = env.split('\n').find(l => l.startsWith('TURSO_AUTH_TOKEN')).split('=')[1].replace(/\"/g, '').trim();
const { createClient } = require('@libsql/client');
const client = createClient({ url, authToken: token });

async function check() {
  const res = await client.execute('SELECT id, email FROM users');
  console.log("USERS:", res.rows);
}
check().catch(console.error);
