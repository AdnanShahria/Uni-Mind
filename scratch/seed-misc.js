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
  const filePath = path.join(schemaDir, 'misc_ui.sql');
  
  if (fs.existsSync(filePath)) {
    console.log(`Executing schema: misc_ui.sql`);
    const query = fs.readFileSync(filePath, 'utf8');
    await sql.unsafe(query);
  } else {
    console.warn(`Warning: Schema file not found: misc_ui.sql`);
  }

  console.log('Seeding misc UI data...');

  const mainUserId = '954489bd-20a4-4a47-a954-2b8ee72950ae';

  // -- Weekly Goals --
  await sql`
    INSERT INTO public.weekly_goals (user_id, goal, progress, color)
    VALUES 
    (${mainUserId}, 'Complete 3 problem sets', 67, 'bg-blue-500'),
    (${mainUserId}, 'Read 2 research papers', 50, 'bg-purple-500'),
    (${mainUserId}, 'Upload 5 study notes', 80, 'bg-emerald-500'),
    (${mainUserId}, '15 AI tutor sessions', 40, 'bg-amber-500')
  `;

  // -- Research Collaborators --
  await sql`
    INSERT INTO public.research_collaborators (user_id, name, role, avatar, color)
    VALUES 
    (${mainUserId}, 'Dr. Sarah Chen', 'Advisor', 'SC', 'from-emerald-500 to-teal-500'),
    (${mainUserId}, 'Prof. James Miller', 'Co-Author', 'JM', 'from-amber-500 to-orange-500'),
    (${mainUserId}, 'Rafi Ahmed', 'Peer Researcher', 'RA', 'from-blue-500 to-cyan-500')
  `;

  // -- AI Prompts --
  await sql`
    INSERT INTO public.ai_prompts (icon, label, prompt, color)
    VALUES 
    ('BookOpen', 'Explain a concept', 'Explain quantum superposition in simple terms', 'text-blue-400'),
    ('Lightbulb', 'Generate ideas', 'Give me research topic ideas for machine learning', 'text-amber-400'),
    ('Code', 'Help with code', 'Help me write a Python function for matrix multiplication', 'text-emerald-400'),
    ('FileQuestion', 'Practice questions', 'Generate 5 practice questions on thermodynamics', 'text-purple-400')
  `;

  // -- AI Suggestions --
  await sql`
    INSERT INTO public.ai_suggestions (user_id, title, reason, icon, action, path)
    VALUES 
    (${mainUserId}, 'Review Quantum Mechanics Chapter 7', 'Based on your exam schedule', 'BookOpen', 'Start Review', '/app/notes'),
    (${mainUserId}, 'Generate flashcards for Linear Algebra', 'You haven''t reviewed in 3 days', 'Zap', 'Generate', '/app/ai'),
    (${mainUserId}, 'Join Thermodynamics study group', '8 classmates are active', 'Users', 'Join Now', '/app/communities')
  `;

  console.log('Database seeding complete!');
  process.exit(0);
}

runSeed().catch(err => {
  console.error(err);
  process.exit(1);
});
