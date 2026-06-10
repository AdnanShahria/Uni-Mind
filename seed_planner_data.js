const { createClient } = require('@libsql/client');
const fs = require('fs');
const crypto = require('crypto');

const envPath = './.dev.vars';
let tursoUrl='', tursoToken='';
try {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    if (line.startsWith('TURSO_DATABASE_URL=')) tursoUrl = line.split('=')[1].trim().replace(/^"|"$/g, '');
    if (line.startsWith('TURSO_AUTH_TOKEN=')) tursoToken = line.split('=')[1].trim().replace(/^"|"$/g, '');
  });
} catch (e) {
  console.error("Error reading .dev.vars:", e.message);
  process.exit(1);
}

const client = createClient({ url: tursoUrl, authToken: tursoToken });

const USER_ID = 'beb78b4e-b09b-4697-be6e-e89d2f3d2330';

async function setupAndSeed() {
  try {
    // 1. Add missing columns to tasks
    console.log("Adding columns to tasks...");
    try { await client.execute('ALTER TABLE tasks ADD COLUMN estimated_hours NUMERIC;'); } catch(e){}
    try { await client.execute('ALTER TABLE tasks ADD COLUMN weekly_goal_id TEXT;'); } catch(e){}
    try { await client.execute('ALTER TABLE tasks ADD COLUMN long_term_goal_id TEXT;'); } catch(e){}

    // 2. Add missing columns to weekly_goals
    console.log("Adding columns to weekly_goals...");
    try { await client.execute('ALTER TABLE weekly_goals ADD COLUMN long_term_goal_id TEXT;'); } catch(e){}
    try { await client.execute('ALTER TABLE weekly_goals ADD COLUMN target_segments INTEGER DEFAULT 0;'); } catch(e){}
    try { await client.execute('ALTER TABLE weekly_goals ADD COLUMN completed_segments INTEGER DEFAULT 0;'); } catch(e){}

    // 3. Create a Long-Term Goal
    const ltgId = crypto.randomUUID();
    const ltgTitle = 'Master Advanced Artificial Intelligence';
    await client.execute({
      sql: 'INSERT INTO long_term_goals (id, user_id, goal, progress, color) VALUES (?, ?, ?, ?, ?)',
      args: [ltgId, USER_ID, ltgTitle, 0, 'purple']
    });
    console.log(`Seeded Long-Term Goal: ${ltgTitle}`);

    // 4. Create Weekly Goals linked to the Long-Term Goal
    const wgId1 = crypto.randomUUID();
    const wgTitle1 = 'Finish Neural Networks Course';
    await client.execute({
      sql: 'INSERT INTO weekly_goals (id, user_id, goal, long_term_goal_id, target_segments, completed_segments) VALUES (?, ?, ?, ?, ?, ?)',
      args: [wgId1, USER_ID, wgTitle1, ltgId, 2, 0]
    });
    console.log(`Seeded Weekly Goal: ${wgTitle1}`);

    const wgId2 = crypto.randomUUID();
    const wgTitle2 = 'Build an RL Agent';
    await client.execute({
      sql: 'INSERT INTO weekly_goals (id, user_id, goal, long_term_goal_id, target_segments, completed_segments) VALUES (?, ?, ?, ?, ?, ?)',
      args: [wgId2, USER_ID, wgTitle2, ltgId, 1, 0]
    });
    console.log(`Seeded Weekly Goal: ${wgTitle2}`);

    // 5. Create Tasks
    const tasks = [
      {
        id: crypto.randomUUID(),
        title: 'Watch Lecture 4 & 5 (Backpropagation)',
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // tomorrow
        wg_id: wgId1,
        hours: 2.5
      },
      {
        id: crypto.randomUUID(),
        title: 'Complete Assignment 2 (CNNs)',
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // day after tomorrow
        wg_id: wgId1,
        hours: 4.0
      },
      {
        id: crypto.randomUUID(),
        title: 'Read Q-Learning Paper',
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), // 3 days from now
        wg_id: wgId2,
        hours: 1.5
      }
    ];

    for (const t of tasks) {
      await client.execute({
        sql: 'INSERT INTO tasks (id, user_id, title, due_date, status, priority, estimated_hours, weekly_goal_id, long_term_goal_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [t.id, USER_ID, t.title, t.due_date, 'pending', 'high', t.hours, t.wg_id, null]
      });
      console.log(`Seeded Task: ${t.title}`);
    }

    console.log('Successfully seeded planner data for user:', USER_ID);

  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
}

setupAndSeed();
