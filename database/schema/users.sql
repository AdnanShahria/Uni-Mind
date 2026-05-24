-- =======================================================
-- UNIMIND DATABASE SCHEMA
-- Table: users
-- PostgreSQL dialect (Supabase / Neon DB compatible)
-- =======================================================

-- Create users table inside the 'public' schema
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Globally unique user identifier
    name VARCHAR(255) NOT NULL,                    -- Full name of the user
    email VARCHAR(255) UNIQUE NOT NULL,            -- Academic email (unique constraint)
    institution VARCHAR(255) NOT NULL,             -- Associated University / Research Institution
    major VARCHAR(255) NOT NULL,                   -- Major / Field of Study
    session VARCHAR(100),                          -- Academic Session / Batch (e.g., 2021-2022)
    role VARCHAR(100) NOT NULL,                    -- Academic role (e.g. Researcher, PhD, Student)
    bio TEXT,                                      -- User biography
    graduations TEXT[],                            -- Array of educational histories/graduations
    relationship_status VARCHAR(100),              -- Relationship/Collaboration status
    avatar_url TEXT,                               -- URL to user's avatar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexing for optimized semantic queries and rapid access
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_institution ON public.users(institution);

-- Automatically update 'updated_at' column on update operations
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_modified_column();

-- =======================================================
-- NOTE: Supabase Auth tables mapping
-- =======================================================
-- If utilizing Supabase Auth directly (which we do through HTTP auth/signup),
-- Supabase automatically populates users inside the auth.users system table, 
-- and profiles/metadata are accessed via the JWT user_metadata fields.
--
-- Alternatively, to sync Supabase Auth users to the public.users table,
-- you can run the following PostgreSQL trigger inside the Supabase editor:
--
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
