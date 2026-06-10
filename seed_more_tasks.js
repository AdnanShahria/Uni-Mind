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

async function seedMoreTasks() {
  try {
    // 1. Fetch existing weekly goals for this user
    const wgRes = await client.execute({
      sql: 'SELECT id, goal FROM weekly_goals WHERE user_id = ?',
      args: [USER_ID]
    });
    
    const weeklyGoals = wgRes.rows;
    if (weeklyGoals.length === 0) {
      console.log('No weekly goals found. Cannot attach tasks to weekly goals. Exiting.');
      return;
    }
    
    const wgId1 = weeklyGoals[0].id; // e.g. Finish Neural Networks Course
    const wgId2 = weeklyGoals.length > 1 ? weeklyGoals[1].id : wgId1;

    // 2. Create more tasks
    // Adding some tasks for today, tomorrow, and past dates
    const tasks = [
      {
        id: crypto.randomUUID(),
        title: 'Review Chapter 3 (Deep Learning Book)',
        due_date: new Date().toISOString(), // Today
        wg_id: wgId1,
        hours: 1.5,
        status: 'pending'
      },
      {
        id: crypto.randomUUID(),
        title: 'Set up PyTorch environment',
        due_date: new Date().toISOString(), // Today
        wg_id: wgId1,
        hours: 0.5,
        status: 'completed'
      },
      {
        id: crypto.randomUUID(),
        title: 'Experiment with OpenAI Gym',
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
        wg_id: wgId2,
        hours: 3.0,
        status: 'pending'
      },
      {
        id: crypto.randomUUID(),
        title: 'Draft RL project proposal',
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days from now
        wg_id: wgId2,
        hours: 2.0,
        status: 'pending'
      },
      {
        id: crypto.randomUUID(),
        title: 'Submit Midterm Assignment',
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
        wg_id: null, // Standalone task
        hours: 1.0,
        status: 'pending'
      }
    ];

    for (const t of tasks) {
      await client.execute({
        sql: 'INSERT INTO tasks (id, user_id, title, due_date, status, priority, estimated_hours, weekly_goal_id, long_term_goal_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [t.id, USER_ID, t.title, t.due_date, t.status, 'medium', t.hours, t.wg_id, null]
      });
      console.log(`Seeded extra Task: ${t.title}`);
    }

    console.log('Successfully added more tasks for user:', USER_ID);

  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
}

seedMoreTasks();
