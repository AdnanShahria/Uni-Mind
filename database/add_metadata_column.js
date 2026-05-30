const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .dev.vars
const devVarsPath = path.resolve(__dirname, '../.dev.vars');
if (fs.existsSync(devVarsPath)) {
  const devVars = dotenv.parse(fs.readFileSync(devVarsPath));
  for (const k in devVars) {
    process.env[k] = devVars[k];
  }
}

async function addMetadataColumn() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('TURSO_DATABASE_URL or TURSO_AUTH_TOKEN not found in .dev.vars');
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  try {
    console.log('Adding metadata column to messages table...');
    await client.execute(`ALTER TABLE messages ADD COLUMN metadata TEXT;`);
    console.log('Successfully added metadata column.');
  } catch (err) {
    if (err.message && err.message.includes('duplicate column name')) {
      console.log('Column metadata already exists.');
    } else {
      console.error('Error adding column:', err.message || err);
    }
  }
}

addMetadataColumn();
