import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../api/.dev.vars') });

const sql = postgres(process.env.DATABASE_URL);

async function runSeed() {
  console.log('Connecting to database...');
  
  const schemaDir = path.resolve(__dirname, '../database/schema');
  
  // 1. Run Schema Files
  const schemas = ['planner.sql', 'research.sql', 'ai_tutor.sql'];
  
  for (const file of schemas) {
    const filePath = path.join(schemaDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`Executing schema: ${file}`);
      const query = fs.readFileSync(filePath, 'utf8');
      await sql.unsafe(query);
    } else {
      console.warn(`Warning: Schema file not found: ${file}`);
    }
  }

  // 2. Run initial seed.sql (for initial users, communities, posts)
  const seedFile = path.join(schemaDir, 'seed.sql');
  if (fs.existsSync(seedFile)) {
    console.log(`Executing seed.sql...`);
    const query = fs.readFileSync(seedFile, 'utf8');
    await sql.unsafe(query);
  }

  // 3. Seed new mock data for the new tables
  console.log('Seeding planner, research, ai_tutor, and messages data...');

  const mainUserId = '954489bd-20a4-4a47-a954-2b8ee72950ae'; // adnanshahria2019@gmail.com
  const friendId = '33333333-3333-3333-3333-333333333333'; // Rafi Ahmed

  // Create main user if not exists
  await sql`
    INSERT INTO public.users (id, name, email, institution, major, role)
    VALUES (${mainUserId}, 'Adnan Shahria', 'adnanshahria2019@gmail.com', 'UniMind', 'CS', 'Student')
    ON CONFLICT (id) DO NOTHING
  `;

  // -- Planner Data --
  await sql`
    INSERT INTO public.tasks (user_id, title, description, due_date, status, priority)
    VALUES 
    (${mainUserId}, 'Finish Physics Lab Report', 'Experiment 3 data analysis.', NOW() + INTERVAL '2 days', 'in_progress', 'high'),
    (${mainUserId}, 'Read Chapter 4 CS', 'Data structures trees and graphs.', NOW() + INTERVAL '1 day', 'pending', 'medium'),
    (${mainUserId}, 'Submit Math Assignment', 'Linear algebra problems 1-10.', NOW() - INTERVAL '1 day', 'completed', 'high')
  `;

  await sql`
    INSERT INTO public.events (user_id, title, start_time, end_time, color)
    VALUES 
    (${mainUserId}, 'Physics Lecture', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours', 'blue'),
    (${mainUserId}, 'CS Study Group', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 1 hour', 'green')
  `;

  // -- Research Data --
  await sql`
    INSERT INTO public.research_papers (user_id, title, authors, abstract, status)
    VALUES 
    (${mainUserId}, 'Attention Is All You Need', 'Vaswani et al.', 'We propose a new simple network architecture, the Transformer...', 'read'),
    (${mainUserId}, 'Quantum Supremacy Using a Programmable Superconducting Processor', 'Arute et al.', 'The promise of quantum computers is that certain computational tasks might be executed exponentially faster...', 'reading')
  `;

  // -- Messages Data --
  // Create a conversation
  const convId = '66666666-6666-6666-6666-666666666666';
  await sql`
    INSERT INTO public.conversations (id, type) VALUES (${convId}, 'direct')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO public.conversation_members (conversation_id, user_id)
    VALUES (${convId}, ${mainUserId}), (${convId}, ${friendId})
    ON CONFLICT DO NOTHING
  `;
  await sql`
    INSERT INTO public.messages (conversation_id, sender_id, content)
    VALUES 
    (${convId}, ${friendId}, 'Hey Adnan, are you ready for the physics exam?'),
    (${convId}, ${mainUserId}, 'Hey Rafi! Almost, just reviewing the quantum notes.'),
    (${convId}, ${friendId}, 'Awesome, let me know if you want to study together.')
  `;

  // -- AI Tutor Data --
  const aiConvId = '77777777-7777-7777-7777-777777777777';
  await sql`
    INSERT INTO public.ai_conversations (id, user_id, title)
    VALUES (${aiConvId}, ${mainUserId}, 'Physics Exam Prep')
    ON CONFLICT DO NOTHING
  `;
  await sql`
    INSERT INTO public.ai_messages (conversation_id, role, content)
    VALUES 
    (${aiConvId}, 'user', 'Can you explain quantum entanglement simply?'),
    (${aiConvId}, 'assistant', 'Imagine two coins that are magically linked. If you flip one and it lands on heads, the other will instantly land on heads too, no matter how far apart they are. In quantum physics, particles can become linked like this. When you measure the state of one particle, it instantly determines the state of the other. This is quantum entanglement.')
  `;

  console.log('Database seeding complete!');
  process.exit(0);
}

runSeed().catch(err => {
  console.error(err);
  process.exit(1);
});
