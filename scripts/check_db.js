const { createClient } = require('@libsql/client');
const fs = require('fs');
const envPath = '../.dev.vars';
let tursoUrl='', tursoToken='';
fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
  if (line.startsWith('TURSO_DATABASE_URL=')) tursoUrl = line.split('=')[1].trim().replace(/^"|"$/g, '');
  if (line.startsWith('TURSO_AUTH_TOKEN=')) tursoToken = line.split('=')[1].trim().replace(/^"|"$/g, '');
});
const client = createClient({ url: tursoUrl, authToken: tursoToken });

async function check() {
  try {
    const res = await client.execute('SELECT id, email FROM users');
    console.log("Users in DB:");
    console.table(res.rows);
    
    const tasks = await client.execute('SELECT id, user_id, title FROM tasks');
    console.log("Tasks in DB:");
    console.table(tasks.rows);
  } catch (e) {
    console.error(e);
  }
}
check();
