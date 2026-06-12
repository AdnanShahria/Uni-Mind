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
  const wgCols = await client.execute("PRAGMA table_info(weekly_goals)");
  console.log("Weekly Goals columns:");
  console.log(wgCols.rows);

  const tCols = await client.execute("PRAGMA table_info(tasks)");
  console.log("Tasks columns:");
  console.log(tCols.rows);
}
run();
