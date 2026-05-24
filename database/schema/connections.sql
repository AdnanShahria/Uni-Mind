-- =======================================================
-- UNIMIND DATABASE SCHEMA
-- Table: connections
-- =======================================================

CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'pending', 'accepted', 'blocked'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_user ON public.connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_friend ON public.connections(friend_id);

CREATE TRIGGER update_connections_modtime
    BEFORE UPDATE ON public.connections
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_modified_column();

-- =======================================================
-- Table: post_shares
-- =======================================================

CREATE TABLE IF NOT EXISTS public.post_shares (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (post_id, user_id)
);
