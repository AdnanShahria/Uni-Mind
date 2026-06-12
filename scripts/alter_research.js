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
    await client.execute('ALTER TABLE research_papers ADD COLUMN journal VARCHAR(255);');
    console.log('Added journal');
  } catch (e) { console.log('col 1 error/exists', e.message); }

  try {
    await client.execute('ALTER TABLE research_papers ADD COLUMN year VARCHAR(4);');
    console.log('Added year');
  } catch (e) { console.log('col 2 error/exists', e.message); }

  try {
    await client.execute('ALTER TABLE research_papers ADD COLUMN citations INTEGER DEFAULT 0;');
    console.log('Added citations');
  } catch (e) { console.log('col 3 error/exists', e.message); }
}

run();
