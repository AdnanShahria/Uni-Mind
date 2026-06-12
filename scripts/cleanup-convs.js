const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.dev.vars');
let tursoUrl = '';
let tursoToken = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('TURSO_DATABASE_URL='))  tursoUrl   = line.split('=').slice(1).join('=').trim().replace(/^"|"$/g, '');
    if (line.startsWith('TURSO_AUTH_TOKEN='))     tursoToken = line.split('=').slice(1).join('=').trim().replace(/^"|"$/g, '');
  });
}

const client = createClient({ url: tursoUrl, authToken: tursoToken });

async function clean() {
  try {
    // We can just delete anything titled "New Conversation" since those are the ghost ones.
    const res = await client.execute("DELETE FROM ai_conversations WHERE title = 'New Conversation'");
    console.log(`Deleted empty 'New Conversation' entries.`);
  } catch (err) {
    console.error(err);
  }
}

clean();
