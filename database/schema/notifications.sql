-- =======================================================
-- UNIMIND DATABASE SCHEMA
-- Table: notifications
-- PostgreSQL dialect (Supabase / Neon DB compatible)
-- =======================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- Recipient
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'like', 'comment', 'mention', 'announcement', 'note_share', 'connection'
    source_type VARCHAR(50),   -- 'posts', 'comments', 'notes', 'connections'
    source_id UUID,            -- ID of source entity
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexing for optimized lookups
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (e.g. mark as read)
CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Allow internal triggers or select public operations to insert notifications
CREATE POLICY "Allow authenticated insert"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- =======================================================
-- SQL TRIGGER: Auto notify on post comments
-- =======================================================
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
    commenter_name VARCHAR(255);
    post_title_str VARCHAR(255);
BEGIN
    -- Get the post author and title
    SELECT author_id, title INTO post_author_id, post_title_str 
    FROM public.posts WHERE id = NEW.post_id;
    
    -- Get commenter's name
    SELECT name INTO commenter_name 
    FROM public.users WHERE id = NEW.author_id;

    -- Avoid notifying oneself
    IF post_author_id IS NOT NULL AND post_author_id != NEW.author_id THEN
        INSERT INTO public.notifications (user_id, title, content, type, source_type, source_id)
        VALUES (
            post_author_id,
            'New Comment on your Post',
            coalesce(commenter_name, 'Someone') || ' commented: "' || substring(NEW.content, 1, 50) || '"',
            'comment',
            'posts',
            NEW.post_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_post_comment_created
    AFTER INSERT ON public.post_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_on_comment();

-- =======================================================
-- SQL TRIGGER: Auto notify on post likes
-- =======================================================
CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
    liker_name VARCHAR(255);
BEGIN
    -- Get the post author
    SELECT author_id INTO post_author_id 
    FROM public.posts WHERE id = NEW.post_id;
    
    -- Get liker's name
    SELECT name INTO liker_name 
    FROM public.users WHERE id = NEW.user_id;

    -- Avoid notifying oneself
    IF post_author_id IS NOT NULL AND post_author_id != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, title, content, type, source_type, source_id)
        VALUES (
            post_author_id,
            'Post Liked',
            coalesce(liker_name, 'Someone') || ' liked your post.',
            'like',
            'posts',
            NEW.post_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_post_like_created
    AFTER INSERT ON public.post_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_on_like();

-- =======================================================
-- SQL TRIGGER: Auto notify community members on Academic Announcements
-- =======================================================
CREATE OR REPLACE FUNCTION public.notify_on_announcement()
RETURNS TRIGGER AS $$
DECLARE
    member_record RECORD;
    author_name VARCHAR(255);
    community_name_str VARCHAR(255);
BEGIN
    -- Only trigger if this is an announcement post
    IF NEW.type = 'announcement' THEN
        -- Get author name
        SELECT name INTO author_name 
        FROM public.users WHERE id = NEW.author_id;

        IF NEW.community_id IS NOT NULL THEN
            -- Get community name
            SELECT name INTO community_name_str 
            FROM public.communities WHERE id = NEW.community_id;

            -- Loop through all members of that community (except the author)
            FOR member_record IN 
                SELECT user_id FROM public.community_members 
                WHERE community_id = NEW.community_id AND user_id != NEW.author_id
            LOOP
                INSERT INTO public.notifications (user_id, title, content, type, source_type, source_id)
                VALUES (
                    member_record.user_id,
                    'New Announcement inside ' || coalesce(community_name_str, 'Community'),
                    coalesce(author_name, 'Instructor') || ' published: "' || substring(NEW.content, 1, 60) || '"',
                    'announcement',
                    'posts',
                    NEW.id
                );
            END LOOP;
        ELSE
            -- Global announcement: loop through all registered users in the platform (except the author)
            FOR member_record IN 
                SELECT id FROM public.users 
                WHERE id != NEW.author_id
            LOOP
                INSERT INTO public.notifications (user_id, title, content, type, source_type, source_id)
                VALUES (
                    member_record.id,
                    'Global Academic Announcement',
                    coalesce(author_name, 'Faculty') || ' broadcasted: "' || substring(NEW.content, 1, 60) || '"',
                    'announcement',
                    'posts',
                    NEW.id
                );
            END LOOP;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_post_announcement_created
    AFTER INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_on_announcement();
