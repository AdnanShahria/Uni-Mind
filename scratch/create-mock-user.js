import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '../.dev.vars') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .dev.vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createMockUser() {
  console.log("Creating mock user...");
  
  const email = "test@unimind.edu";
  const password = "password123";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: "Test Scholar",
        institution: "Mock University",
        major: "Computer Science",
        role: "Researcher"
      }
    }
  });

  if (error) {
    console.error("Failed to create user:", error.message);
  } else {
    console.log("SUCCESS!");
    console.log("-----------------------------------------");
    console.log("Email:    ", email);
    console.log("Password: ", password);
    console.log("User ID:  ", data.user?.id);
    console.log("-----------------------------------------");
    console.log("You can now log in with these credentials.");
  }
}

createMockUser();
