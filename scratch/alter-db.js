import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const { Client } = pg;
dotenv.config({ path: path.resolve(process.cwd(), '../.dev.vars') });

async function alterDb() {
  if (!process.env.DATABASE_URL) {
    console.error("Missing DATABASE_URL");
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log("Connected to DB.");

    // Add session column
    await client.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS session VARCHAR(100);`);
    console.log("Added session column to public.users");

    // Update the trigger function directly
    const fnSql = `
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.users (id, name, email, institution, major, session, role)
      VALUES (
        new.id,
        coalesce(new.raw_user_meta_data->>'name', 'Scholar'),
        new.email,
        coalesce(new.raw_user_meta_data->>'institution', 'UniMind Cloud'),
        coalesce(new.raw_user_meta_data->>'major', 'Deep Work'),
        new.raw_user_meta_data->>'session',
        coalesce(new.raw_user_meta_data->>'role', 'Undergraduate')
      );
      RETURN new;
    END;
    $$ language plpgsql security definer;
    `;
    await client.query(fnSql);
    console.log("Updated handle_new_user trigger.");

  } catch (err) {
    console.error("Error altering DB:", err);
  } finally {
    await client.end();
  }
}

alterDb();
