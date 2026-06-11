-- =======================================================
-- UNIMIND TURSO (LIBSQL) DATABASE SCHEMA
-- Phase 1 Migration
-- =======================================================

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- We will generate UUIDs in the backend API
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Required for Custom Auth
    name TEXT NOT NULL,
    institution TEXT NOT NULL,
    district TEXT,
    country TEXT,
    major TEXT NOT NULL,
    session TEXT,
    role TEXT NOT NULL,
    bio TEXT,
    graduations TEXT, -- Stored as JSON array
    relationship_status TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    website_url TEXT,
    social_links TEXT DEFAULT '{}', -- Stored as JSON object
    skills TEXT, -- Stored as JSON array
    interests TEXT, -- Stored as JSON array
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution);

-- Table: communities
CREATE TABLE IF NOT EXISTS communities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📚',          -- Emoji icon for the community
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_communities_type ON communities(type);

-- Table: community_members
-- role hierarchy: owner(5) > admin(4) > moderator(3) > elder(2) > member(1)
CREATE TABLE IF NOT EXISTS community_members (
    community_id TEXT REFERENCES communities(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' NOT NULL CHECK (role IN ('owner','admin','moderator','elder','member')),
    role_level INTEGER DEFAULT 1 NOT NULL, -- numeric level for hierarchy enforcement
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (community_id, user_id)
);

-- Table: posts
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    author_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    community_id TEXT REFERENCES communities(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text' NOT NULL,
    tags TEXT, -- Stored as JSON array
    media_urls TEXT, -- Stored as JSON array
    is_pinned BOOLEAN DEFAULT 0,
    is_archived BOOLEAN DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- Table: post_comments
CREATE TABLE IF NOT EXISTS post_comments (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    author_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    parent_comment_id TEXT REFERENCES post_comments(id) ON DELETE CASCADE,
    content TEXT,
    image_url TEXT,
    is_edited BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON post_comments(post_id);

-- Table: post_likes
CREATE TABLE IF NOT EXISTS post_likes (
    post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

-- Table: folders
CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT,
    parent_id TEXT REFERENCES folders(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_folders_user ON folders(user_id);

-- Migration statement to add parent_id to existing databases (will warn if already exists, safely ignored)
ALTER TABLE folders ADD COLUMN parent_id TEXT REFERENCES folders(id) ON DELETE CASCADE;

-- Table: notes
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    author_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    course TEXT,
    content TEXT,
    file_url TEXT,
    is_ai_summarized BOOLEAN DEFAULT 0,
    is_starred BOOLEAN DEFAULT 0,
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'class', 'public')),
    shared_link_token TEXT UNIQUE,
    studio_data TEXT, -- JSON column for generated study guides, mind maps, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_author ON notes(author_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder_id);

-- Table: tasks
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATETIME,
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'in_progress', 'completed'
    priority TEXT DEFAULT 'medium' NOT NULL, -- 'low', 'medium', 'high'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);

-- =======================================================
-- MIGRATED TABLES (PHASE 2 - SYNC WITH SUPABASE)
-- =======================================================

-- Table: connections
CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    friend_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'accepted', 'blocked'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_user ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_friend ON connections(friend_id);

-- Table: post_shares
CREATE TABLE IF NOT EXISTS post_shares (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    share_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_shares_user ON post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_post ON post_shares(post_id);

-- Table: conversations
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'direct' NOT NULL, -- 'direct', 'group'
    name TEXT, -- optional name for group chats
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: conversation_members
CREATE TABLE IF NOT EXISTS conversation_members (
    conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (conversation_id, user_id)
);

-- Table: messages
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- Table: events
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    color TEXT DEFAULT 'blue',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);

-- Table: research_papers
CREATE TABLE IF NOT EXISTS research_papers (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    authors TEXT,
    abstract TEXT,
    url TEXT,
    status TEXT DEFAULT 'to_read' NOT NULL, -- 'to_read', 'reading', 'read'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_research_papers_user ON research_papers(user_id);

-- Table: research_collaborators
CREATE TABLE IF NOT EXISTS research_collaborators (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar TEXT,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: user_preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark',              -- 'dark', 'midnight-ocean', 'nebula-purple', 'matrix-scholar', 'aurora-dark', 'solar-scholar'
    font_size TEXT DEFAULT 'medium',        -- 'small', 'medium', 'large'
    accent_color TEXT DEFAULT 'blue',       -- 'blue', 'purple', 'teal', 'pink', 'amber', 'emerald'
    push_notifs BOOLEAN DEFAULT 1,
    email_notifs BOOLEAN DEFAULT 1,
    notif_sound BOOLEAN DEFAULT 1,
    notif_likes BOOLEAN DEFAULT 1,
    notif_comments BOOLEAN DEFAULT 1,
    notif_messages BOOLEAN DEFAULT 1,
    notif_community BOOLEAN DEFAULT 1,
    quiet_hours_start TEXT DEFAULT '22:00',
    quiet_hours_end TEXT DEFAULT '08:00',
    language TEXT DEFAULT 'en-US',
    timezone TEXT DEFAULT 'UTC',
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    number_format TEXT DEFAULT 'en-US',
    reduce_motion BOOLEAN DEFAULT 0,
    high_contrast BOOLEAN DEFAULT 0,
    screen_reader_hints BOOLEAN DEFAULT 0,
    compact_mode BOOLEAN DEFAULT 0,
    sidebar_collapsed BOOLEAN DEFAULT 0,
    profile_visibility TEXT DEFAULT 'public',  -- 'public', 'connections', 'private'
    show_online_status BOOLEAN DEFAULT 1,
    allow_dms TEXT DEFAULT 'everyone',          -- 'everyone', 'connections', 'nobody'
    search_indexing BOOLEAN DEFAULT 1,
    data_sharing_research BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: api_keys
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    key_value TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);

-- Table: weekly_goals
CREATE TABLE IF NOT EXISTS weekly_goals (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    goal TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_weekly_goals_user ON weekly_goals(user_id);

-- Table: long_term_goals
CREATE TABLE IF NOT EXISTS long_term_goals (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    goal TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_long_term_goals_user ON long_term_goals(user_id);

-- Table: ai_conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT DEFAULT 'New Conversation',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);

-- Table: ai_messages
CREATE TABLE IF NOT EXISTS ai_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES ai_conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON ai_messages(conversation_id);

-- Table: ai_prompts
CREATE TABLE IF NOT EXISTS ai_prompts (
    id TEXT PRIMARY KEY,
    icon TEXT,
    label TEXT NOT NULL,
    prompt TEXT NOT NULL,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: ai_suggestions
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    reason TEXT,
    icon TEXT,
    action TEXT,
    path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user ON ai_suggestions(user_id);

-- Table: flashcards
CREATE TABLE IF NOT EXISTS flashcards (
    id TEXT PRIMARY KEY,
    note_id TEXT REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    status TEXT DEFAULT 'new' NOT NULL, -- 'new', 'learning', 'mastered'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_flashcards_note ON flashcards(note_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards(user_id);

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

