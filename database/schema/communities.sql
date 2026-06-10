-- =======================================================
-- UNIMIND DATABASE SCHEMA
-- Table: communities
-- =======================================================

CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- e.g., 'Department', 'Research Group', 'Batch', 'Interest Group'
    description TEXT,
    uni_name VARCHAR(255),
    sessions VARCHAR(255),
    logo_url TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    visibility VARCHAR(50) DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_communities_type ON public.communities(type);

CREATE TRIGGER update_communities_modtime
    BEFORE UPDATE ON public.communities
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_modified_column();

-- =======================================================
-- Table: community_members
-- =======================================================

CREATE TABLE IF NOT EXISTS public.community_members (
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' NOT NULL, -- 'admin', 'moderator', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (community_id, user_id)
);
