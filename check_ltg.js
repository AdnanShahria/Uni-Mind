const { createClient } = require('@libsql/client');
const fs = require('fs');
const envPath = './.dev.vars';
let tursoUrl='', tursoToken='';
fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
  if (line.startsWith('TURSO_DATABASE_URL=')) tursoUrl = line.split('=')[1].trim().replace(/^"|"$/g, '');
  if (line.startsWith('TURSO_AUTH_TOKEN=')) tursoToken = line.split('=')[1].trim().replace(/^"|"$/g, '');
});
const client = createClient({ url: tursoUrl, authToken: tursoToken });

async function run() {
  try {
    const res = await client.execute('SELECT * FROM long_term_goals;');
    console.log('long_term_goals:', res.rows);
  } catch (e) { console.log('error', e.message); }
}

run();
