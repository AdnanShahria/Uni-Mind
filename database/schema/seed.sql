-- =======================================================
-- UNIMIND SEED DATA
-- Run this in the Supabase SQL Editor to populate mock data
-- =======================================================

-- 1. Create Mock Users (inserted directly into public.users)
-- Note: These users won't be able to log in (as they aren't in auth.users), 
-- but they will populate the feed so you can test as your own logged-in user.
INSERT INTO public.users (id, name, email, institution, major, role)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Dr. Sarah Chen', 'schen@mit.edu', 'MIT', 'Physics', 'Professor'),
    ('22222222-2222-2222-2222-222222222222', 'Prof. James Miller', 'jmiller@stanford.edu', 'Stanford University', 'Computer Science', 'Researcher'),
    ('33333333-3333-3333-3333-333333333333', 'Rafi Ahmed', 'rahmed@harvard.edu', 'Harvard University', 'Mathematics', 'Undergraduate')
ON CONFLICT (email) DO NOTHING;

-- 2. Create Mock Communities
INSERT INTO public.communities (id, name, type, description, created_by)
VALUES
    ('44444444-4444-4444-4444-444444444441', 'Quantum Computing Lab', 'Research Group', 'Discussion on NISQ era devices and algorithms.', '11111111-1111-1111-1111-111111111111'),
    ('44444444-4444-4444-4444-444444444442', 'CS Batch 2025', 'Batch', 'General discussion for CS majors graduating in 2025.', '33333333-3333-3333-3333-333333333333'),
    ('44444444-4444-4444-4444-444444444443', 'Machine Learning Research', 'Department', 'AI, Deep Learning, and RL discussions.', '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- 3. Add Members to Communities
INSERT INTO public.community_members (community_id, user_id, role)
VALUES
    ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'admin'),
    ('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333333', 'admin'),
    ('44444444-4444-4444-4444-444444444443', '22222222-2222-2222-2222-222222222222', 'admin')
ON CONFLICT DO NOTHING;

-- 4. Create Mock Posts
INSERT INTO public.posts (id, author_id, community_id, content, type, tags, created_at)
VALUES
    (
        '55555555-5555-5555-5555-555555555551', 
        '11111111-1111-1111-1111-111111111111', 
        '44444444-4444-4444-4444-444444444441', 
        'Just published our latest findings on quantum entanglement at room temperature. This could revolutionize how we think about quantum computing accessibility. Full paper linked below! 🧪✨', 
        'text', 
        ARRAY['#QuantumPhysics', '#Research'],
        NOW() - INTERVAL '2 hours'
    ),
    (
        '55555555-5555-5555-5555-555555555552', 
        '33333333-3333-3333-3333-333333333333', 
        '44444444-4444-4444-4444-444444444442', 
        'Anyone else struggling with the Fourier Transform homework? I created a comprehensive summary note that breaks it down step by step. AI helped me generate flashcards too! Sharing in the CS301 community.', 
        'text', 
        ARRAY['#Mathematics', '#StudyNotes'],
        NOW() - INTERVAL '4 hours'
    ),
    (
        '55555555-5555-5555-5555-555555555553', 
        '22222222-2222-2222-2222-222222222222', 
        '44444444-4444-4444-4444-444444444443', 
        'Excited to announce our new study group on Reinforcement Learning! We''ll meet every Tuesday at 6 PM. Open to all departments. Let''s explore the frontier of AI together. 🤖', 
        'text', 
        ARRAY['#MachineLearning', '#StudyGroup'],
        NOW() - INTERVAL '6 hours'
    )
ON CONFLICT DO NOTHING;

-- 5. Create some mock likes and comments
INSERT INTO public.post_likes (post_id, user_id)
VALUES
    ('55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222222'),
    ('55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333333'),
    ('55555555-5555-5555-5555-555555555553', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

INSERT INTO public.post_comments (post_id, author_id, content)
VALUES
    ('55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333333', 'This is incredible work, Professor! Can''t wait to read the paper.'),
    ('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', 'Great initiative sharing your notes, Rafi. Collaboration is key to mastering these concepts.')
ON CONFLICT DO NOTHING;
