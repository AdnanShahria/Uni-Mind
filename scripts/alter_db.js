const { createClient } = require('@libsql/client');
const fs = require('fs');
const envPath = '../.dev.vars';
let tursoUrl='', tursoToken='';
fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
  if (line.startsWith('TURSO_DATABASE_URL=')) tursoUrl = line.split('=')[1].trim().replace(/^"|"$/g, '');
  if (line.startsWith('TURSO_AUTH_TOKEN=')) tursoToken = line.split('=')[1].trim().replace(/^"|"$/g, '');
});
const client = createClient({ url: tursoUrl, authToken: tursoToken });

async function run() {
  try {
    await client.execute('ALTER TABLE communities ADD COLUMN uni_name VARCHAR(255);');
    console.log('Added uni_name');
  } catch (e) { console.log('col 1 error/exists', e.message); }

  try {
    await client.execute('ALTER TABLE communities ADD COLUMN sessions VARCHAR(255);');
    console.log('Added sessions');
  } catch (e) { console.log('col 2 error/exists', e.message); }

  try {
    await client.execute('ALTER TABLE communities ADD COLUMN logo_url TEXT;');
    console.log('Added logo_url');
  } catch (e) { console.log('col 3 error/exists', e.message); }
}

run();
