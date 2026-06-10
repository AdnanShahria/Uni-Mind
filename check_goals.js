const { createClient } = require('@libsql/client');
const fs = require('fs');
const envPath = './.dev.vars';
let tursoUrl='', tursoToken='';
fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
  if (line.startsWith('TURSO_DATABASE_URL=')) tursoUrl = line.split('=')[1].trim().replace(/^"|"$/g, '');
  if (line.startsWith('TURSO_AUTH_TOKEN=')) tursoToken = line.split('=')[1].trim().replace(/^"|"$/g, '');
});
const client = createClient({ url: tursoUrl, authToken: tursoToken });

async function check() {
  const ltgs = await client.execute('SELECT id, user_id, goal FROM long_term_goals');
  console.log("Long-Term Goals:");
  console.table(ltgs.rows);
  const wgs = await client.execute('SELECT id, user_id, goal FROM weekly_goals');
  console.log("Weekly Goals:");
  console.table(wgs.rows);
}
check();
