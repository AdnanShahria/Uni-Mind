const { createClient } = require('@libsql/client');
const fs = require('fs');
let tursoUrl='', tursoToken='';
fs.readFileSync('../.dev.vars', 'utf-8').split('\n').forEach(line => {
  if (line.startsWith('TURSO_DATABASE_URL=')) tursoUrl = line.split('=')[1].trim().replace(/^"|"$/g, '');
  if (line.startsWith('TURSO_AUTH_TOKEN=')) tursoToken = line.split('=')[1].trim().replace(/^"|"$/g, '');
});
const client = createClient({ url: tursoUrl, authToken: tursoToken });

async function run() {
  const notes = await client.execute('PRAGMA table_info(notes);');
  console.log('Notes columns:', notes.rows.map(r => r.name));

  const folders = await client.execute('PRAGMA table_info(folders);');
  console.log('Folders columns:', folders.rows.map(r => r.name));
  
  const communityResources = await client.execute('PRAGMA table_info(community_resources);');
  console.log('CommunityResources columns:', communityResources.rows.map(r => r.name));
}

run();
