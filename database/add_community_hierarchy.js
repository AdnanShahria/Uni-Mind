/**
 * DB Migration: Add Community Hierarchy Support
 * 
 * Run with: node database/add_community_hierarchy.js
 * 
 * Adds:
 *  - communities.icon         (emoji string, default '📚')
 *  - community_members.role_level  (integer 1-5 for hierarchy enforcement)
 * 
 * Updates existing rows to match the new role_level from their role string.
 */

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.dev.vars' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const migrations = [
  // Add icon column to communities
  `ALTER TABLE communities ADD COLUMN icon TEXT DEFAULT '📚'`,

  // Add role_level to community_members
  `ALTER TABLE community_members ADD COLUMN role_level INTEGER DEFAULT 1`,

  // Backfill role_level from existing role strings
  `UPDATE community_members SET role_level = CASE role
    WHEN 'owner'     THEN 5
    WHEN 'admin'     THEN 4
    WHEN 'moderator' THEN 3
    WHEN 'elder'     THEN 2
    ELSE 1
  END`,
];

async function run() {
  console.log('🚀 Running community hierarchy migration...\n');

  for (const sql of migrations) {
    try {
      await client.execute(sql);
      console.log(`✅ ${sql.substring(0, 60)}...`);
    } catch (err) {
      if (err.message && err.message.includes('duplicate column')) {
        console.log(`⚠️  Skipped (already exists): ${sql.substring(0, 60)}...`);
      } else {
        console.error(`❌ Failed: ${err.message}`);
        console.error('   SQL:', sql);
      }
    }
  }

  console.log('\n✨ Migration complete!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
