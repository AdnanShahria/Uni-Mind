import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../api/.dev.vars') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const userId = '954489bd-20a4-4a47-a954-2b8ee72950ae';

const foldersToInsert = [
  { name: 'Physics 301', color: 'from-blue-500/20 to-cyan-500/20', user_id: userId },
  { name: 'Computer Science', color: 'from-emerald-500/20 to-teal-500/20', user_id: userId },
  { name: 'Mathematics', color: 'from-purple-500/20 to-violet-500/20', user_id: userId },
  { name: 'Research Papers', color: 'from-amber-500/20 to-orange-500/20', user_id: userId },
];

async function seed() {
  console.log('Seeding folders for user:', userId);
  
  // Try inserting
  const { data, error } = await supabase
    .from('folders')
    .insert(foldersToInsert)
    .select();

  if (error) {
    console.error('Error inserting folders:', error);
  } else {
    console.log('Successfully inserted folders:', data);
  }
}

seed();
