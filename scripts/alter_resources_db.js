const { createClient } = require('@libsql/client');
const fs = require('fs');
let tursoUrl='', tursoToken='';
fs.readFileSync('../.dev.vars', 'utf-8').split('\n').forEach(line => {
  if (line.startsWith('TURSO_DATABASE_URL=')) tursoUrl = line.split('=')[1].trim().replace(/^"|"$/g, '');
  if (line.startsWith('TURSO_AUTH_TOKEN=')) tursoToken = line.split('=')[1].trim().replace(/^"|"$/g, '');
});
const client = createClient({ url: tursoUrl, authToken: tursoToken });

async function run() {
  try {
    await client.execute('ALTER TABLE notes ADD COLUMN community_id TEXT;');
    console.log('Added community_id to notes');
  } catch (e) { console.log('col 1 error/exists', e.message); }

  try {
    await client.execute('ALTER TABLE folders ADD COLUMN community_id TEXT;');
    console.log('Added community_id to folders');
  } catch (e) { console.log('col 2 error/exists', e.message); }
}

run();
