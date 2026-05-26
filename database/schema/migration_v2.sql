-- =======================================================
-- UNIMIND DB MIGRATION v2
-- Run this in the Supabase SQL Editor to upgrade existing DB
-- =======================================================

-- 1. Extend posts table
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS media_urls TEXT[],
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);

-- 2. Extend post_comments with threading + edit flag
ALTER TABLE public.post_comments
  ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_comments_author ON public.post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);

-- 3. Create post_shares table
CREATE TABLE IF NOT EXISTS public.post_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    share_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_post_shares_user ON public.post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_post ON public.post_shares(post_id);
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Anyone can view shares" ON public.post_shares FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can insert their own shares" ON public.post_shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own shares" ON public.post_shares FOR DELETE USING (auth.uid() = user_id);

-- 4. Create post_bookmarks table
CREATE TABLE IF NOT EXISTS public.post_bookmarks (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user ON public.post_bookmarks(user_id);
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view their own bookmarks" ON public.post_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert their own bookmarks" ON public.post_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own bookmarks" ON public.post_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- 5. Create post_views table
CREATE TABLE IF NOT EXISTS public.post_views (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_post_views_post ON public.post_views(post_id);

-- 6. Create user_post_analytics view
CREATE OR REPLACE VIEW public.user_post_analytics AS
SELECT
    p.author_id AS user_id,
    COUNT(DISTINCT p.id) AS total_posts,
    COALESCE(SUM(likes.like_count), 0) AS total_likes,
    COALESCE(SUM(comments.comment_count), 0) AS total_comments,
    COALESCE(SUM(shares.share_count), 0) AS total_shares,
    COALESCE(SUM(p.view_count), 0) AS total_views
FROM public.posts p
LEFT JOIN (SELECT post_id, COUNT(*) AS like_count FROM public.post_likes GROUP BY post_id) likes ON likes.post_id = p.id
LEFT JOIN (SELECT post_id, COUNT(*) AS comment_count FROM public.post_comments GROUP BY post_id) comments ON comments.post_id = p.id
LEFT JOIN (SELECT post_id, COUNT(*) AS share_count FROM public.post_shares GROUP BY post_id) shares ON shares.post_id = p.id
GROUP BY p.author_id;

-- 7. Extend users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS skills TEXT[],
  ADD COLUMN IF NOT EXISTS interests TEXT[],
  ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- 8. Extend user_preferences
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS accent_color VARCHAR(50) DEFAULT 'blue',
  ADD COLUMN IF NOT EXISTS notif_sound BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_likes BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_comments BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_messages BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_community BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS quiet_hours_start TIME DEFAULT '22:00',
  ADD COLUMN IF NOT EXISTS quiet_hours_end TIME DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  ADD COLUMN IF NOT EXISTS number_format VARCHAR(20) DEFAULT 'en-US',
  ADD COLUMN IF NOT EXISTS high_contrast BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS screen_reader_hints BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS compact_mode BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sidebar_collapsed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_dms VARCHAR(50) DEFAULT 'everyone',
  ADD COLUMN IF NOT EXISTS search_indexing BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS data_sharing_research BOOLEAN DEFAULT false;
