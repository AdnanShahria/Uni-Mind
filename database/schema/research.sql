-- =======================================================
-- UNIMIND DATABASE SCHEMA
-- Table: research_papers
-- =======================================================

CREATE TABLE IF NOT EXISTS public.research_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(500) NOT NULL,
    authors TEXT,
    abstract TEXT,
    url VARCHAR(1000),
    journal VARCHAR(255),
    year VARCHAR(4),
    citations INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'to_read' NOT NULL, -- 'to_read', 'reading', 'read', 'writing', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_research_papers_modtime
    BEFORE UPDATE ON public.research_papers
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_modified_column();
