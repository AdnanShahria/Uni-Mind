-- =======================================================
-- UNIMIND DATABASE SCHEMA
-- Table: metadata_requests
-- PostgreSQL dialect (Supabase / Neon DB compatible)
-- =======================================================

CREATE TABLE IF NOT EXISTS public.metadata_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_email VARCHAR(255) NOT NULL,
    request_type VARCHAR(50) NOT NULL, -- 'institution', 'major', 'session'
    action_type VARCHAR(50) NOT NULL,  -- 'add', 'rename'
    old_value VARCHAR(255),            -- NULL if action_type is 'add'
    new_value VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexing for rapid lookups by admin panel
CREATE INDEX IF NOT EXISTS idx_metadata_requests_status ON public.metadata_requests(status);
CREATE INDEX IF NOT EXISTS idx_metadata_requests_type ON public.metadata_requests(request_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.metadata_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone (even unauthenticated guests registering) to insert a new request
CREATE POLICY "Allow public insert" 
    ON public.metadata_requests 
    FOR INSERT 
    WITH CHECK (true);

-- Policy: Allow only Admin users to select, update, or delete requests
-- An admin user has a role of 'admin' in public.users
CREATE POLICY "Allow admins all actions" 
    ON public.metadata_requests 
    FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE public.users.id = auth.uid() 
            AND public.users.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE public.users.id = auth.uid() 
            AND public.users.role = 'admin'
        )
    );

-- Automatically update 'updated_at' column on update operations
CREATE TRIGGER update_metadata_requests_modtime
    BEFORE UPDATE ON public.metadata_requests
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_modified_column();
