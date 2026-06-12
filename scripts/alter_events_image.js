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
    await client.execute('ALTER TABLE events ADD COLUMN image_url TEXT;');
    console.log('Added image_url to events');
  } catch (e) { console.log('image_url:', e.message); }
}
run();
