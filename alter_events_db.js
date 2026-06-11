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
    await client.execute('ALTER TABLE events ADD COLUMN community_id TEXT;');
    console.log('Added community_id to events');
  } catch (e) { console.log('community_id:', e.message); }

  try {
    await client.execute('ALTER TABLE events ADD COLUMN description TEXT;');
    console.log('Added description to events');
  } catch (e) { console.log('description:', e.message); }

  try {
    await client.execute('ALTER TABLE events ADD COLUMN location TEXT;');
    console.log('Added location to events');
  } catch (e) { console.log('location:', e.message); }

  try {
    await client.execute('ALTER TABLE events ADD COLUMN event_type TEXT DEFAULT "general";');
    console.log('Added event_type to events');
  } catch (e) { console.log('event_type:', e.message); }

  try {
    await client.execute('ALTER TABLE events ADD COLUMN attendees_count INTEGER DEFAULT 0;');
    console.log('Added attendees_count to events');
  } catch (e) { console.log('attendees_count:', e.message); }

  console.log('Done!');
}

run();
