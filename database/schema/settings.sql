-- =======================================================
-- UNIMIND DATABASE SCHEMA
-- Settings & Preferences (user_preferences, api_keys)
-- =======================================================

-- Table: user_preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    theme VARCHAR(50) DEFAULT 'dark',              -- 'dark', 'midnight-ocean', 'nebula-purple', 'matrix-scholar', 'aurora-dark', 'solar-scholar'
    font_size VARCHAR(50) DEFAULT 'medium',        -- 'small', 'medium', 'large'
    accent_color VARCHAR(50) DEFAULT 'blue',       -- 'blue', 'purple', 'teal', 'pink', 'amber', 'emerald'
    push_notifs BOOLEAN DEFAULT true,
    email_notifs BOOLEAN DEFAULT true,
    notif_sound BOOLEAN DEFAULT true,
    notif_likes BOOLEAN DEFAULT true,
    notif_comments BOOLEAN DEFAULT true,
    notif_messages BOOLEAN DEFAULT true,
    notif_community BOOLEAN DEFAULT true,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    language VARCHAR(50) DEFAULT 'en-US',
    timezone VARCHAR(100) DEFAULT 'UTC',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    number_format VARCHAR(20) DEFAULT 'en-US',
    reduce_motion BOOLEAN DEFAULT false,
    high_contrast BOOLEAN DEFAULT false,
    screen_reader_hints BOOLEAN DEFAULT false,
    compact_mode BOOLEAN DEFAULT false,
    sidebar_collapsed BOOLEAN DEFAULT false,
    profile_visibility VARCHAR(50) DEFAULT 'public',  -- 'public', 'connections', 'private'
    show_online_status BOOLEAN DEFAULT true,
    allow_dms VARCHAR(50) DEFAULT 'everyone',          -- 'everyone', 'connections', 'nobody'
    search_indexing BOOLEAN DEFAULT true,
    data_sharing_research BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Trigger for user_preferences updated_at
CREATE TRIGGER update_user_preferences_modtime
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_modified_column();

-- RLS for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select their own preferences"
    ON public.user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON public.user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON public.user_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Table: api_keys
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    key_value VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- RLS for api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select their own api keys"
    ON public.api_keys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own api keys"
    ON public.api_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own api keys"
    ON public.api_keys FOR DELETE
    USING (auth.uid() = user_id);
