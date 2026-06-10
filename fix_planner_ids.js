const { createClient } = require('@libsql/client');
const fs = require('fs');
const envPath = './.dev.vars';
let tursoUrl='', tursoToken='';
fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
  if (line.startsWith('TURSO_DATABASE_URL=')) tursoUrl = line.split('=')[1].trim().replace(/^"|"$/g, '');
  if (line.startsWith('TURSO_AUTH_TOKEN=')) tursoToken = line.split('=')[1].trim().replace(/^"|"$/g, '');
});
const client = createClient({ url: tursoUrl, authToken: tursoToken });

const crypto = require('crypto');

async function run() {
  try {
    const ltgRes = await client.execute('SELECT rowid, id, goal FROM long_term_goals WHERE id IS NULL;');
    for (const row of ltgRes.rows) {
      const newId = crypto.randomUUID();
      await client.execute({ sql: 'UPDATE long_term_goals SET id = ? WHERE rowid = ?', args: [newId, row.rowid] });
      console.log('Fixed LTG', row.goal);
    }
    
    const wgRes = await client.execute('SELECT rowid, id, goal FROM weekly_goals WHERE id IS NULL;');
    for (const row of wgRes.rows) {
      const newId = crypto.randomUUID();
      await client.execute({ sql: 'UPDATE weekly_goals SET id = ? WHERE rowid = ?', args: [newId, row.rowid] });
      console.log('Fixed WG', row.goal);
    }

    const tRes = await client.execute('SELECT rowid, id, title FROM tasks WHERE id IS NULL;');
    for (const row of tRes.rows) {
      const newId = crypto.randomUUID();
      await client.execute({ sql: 'UPDATE tasks SET id = ? WHERE rowid = ?', args: [newId, row.rowid] });
      console.log('Fixed Task', row.title);
    }
    
    console.log('Data cleanup done.');
  } catch (e) { console.log('error', e.message); }
}

run();
