-- =======================================================
-- UNIMIND DATABASE SCHEMA
-- Table: posts
-- =======================================================

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE, -- null if it's a global/personal feed post
    title VARCHAR(255),
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text' NOT NULL, -- 'text', 'image', 'document', 'poll'
    tags TEXT[], -- array of tags
    media_urls TEXT[], -- array of attached media URLs
    is_pinned BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_community ON public.posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);

CREATE TRIGGER update_posts_modtime
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_modified_column();

-- =======================================================
-- Table: post_likes
-- =======================================================

CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);

-- =======================================================
-- Table: post_comments
-- =======================================================

CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE, -- for nested/threaded replies
    content TEXT,
    image_url TEXT,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.post_comments(author_id);

CREATE TRIGGER update_post_comments_modtime
    BEFORE UPDATE ON public.post_comments
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_modified_column();

-- =======================================================
-- Table: post_shares
-- =======================================================

CREATE TABLE IF NOT EXISTS public.post_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    share_note TEXT, -- optional message when sharing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_shares_user ON public.post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_post ON public.post_shares(post_id);

-- RLS for post_shares
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shares"
    ON public.post_shares FOR SELECT USING (true);

CREATE POLICY "Users can insert their own shares"
    ON public.post_shares FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shares"
    ON public.post_shares FOR DELETE USING (auth.uid() = user_id);

-- =======================================================
-- Table: post_bookmarks
-- =======================================================

CREATE TABLE IF NOT EXISTS public.post_bookmarks (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user ON public.post_bookmarks(user_id);

-- RLS for post_bookmarks
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
    ON public.post_bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
    ON public.post_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
    ON public.post_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- =======================================================
-- Table: post_views (for analytics)
-- =======================================================

CREATE TABLE IF NOT EXISTS public.post_views (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_views_post ON public.post_views(post_id);

-- =======================================================
-- View: user_post_analytics (aggregated per user)
-- =======================================================

CREATE OR REPLACE VIEW public.user_post_analytics AS
SELECT
    p.author_id AS user_id,
    COUNT(DISTINCT p.id) AS total_posts,
    COALESCE(SUM(likes.like_count), 0) AS total_likes,
    COALESCE(SUM(comments.comment_count), 0) AS total_comments,
    COALESCE(SUM(shares.share_count), 0) AS total_shares,
    COALESCE(SUM(p.view_count), 0) AS total_views
FROM public.posts p
LEFT JOIN (
    SELECT post_id, COUNT(*) AS like_count
    FROM public.post_likes GROUP BY post_id
) likes ON likes.post_id = p.id
LEFT JOIN (
    SELECT post_id, COUNT(*) AS comment_count
    FROM public.post_comments GROUP BY post_id
) comments ON comments.post_id = p.id
LEFT JOIN (
    SELECT post_id, COUNT(*) AS share_count
    FROM public.post_shares GROUP BY post_id
) shares ON shares.post_id = p.id
GROUP BY p.author_id;

