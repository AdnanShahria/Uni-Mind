-- =======================================================
-- UNIMIND DATABASE SCHEMA
-- Table: folders
-- =======================================================

CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_folders_user ON public.folders(user_id);

CREATE TRIGGER update_folders_modtime
    BEFORE UPDATE ON public.folders
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_modified_column();

-- =======================================================
-- Table: notes
-- =======================================================

CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    content TEXT, -- rich text content or markdown
    file_url VARCHAR(1024), -- if an external PDF/document was uploaded
    is_ai_summarized BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_author ON public.notes(author_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder ON public.notes(folder_id);

CREATE TRIGGER update_notes_modtime
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_modified_column();
