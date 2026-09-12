-- OpenDrama Database Migration: Initial Schema
-- Target database: PostgreSQL (via Supabase)

-- Enable extension for vector search (pgvector)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES DEFINITIONS
-- ==========================================

-- Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    preferred_language TEXT DEFAULT 'en',
    favorite_genres JSONB DEFAULT '[]'::jsonb,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator Profiles Table (For content authors)
CREATE TABLE IF NOT EXISTS public.creator_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    creator_name TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    followers_count INTEGER DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos Table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    content_type TEXT NOT NULL, -- 'short', 'short_film', 'episode', etc.
    language TEXT DEFAULT 'en',
    genre TEXT,
    duration_seconds INTEGER DEFAULT 0,
    visibility TEXT DEFAULT 'public', -- 'public', 'unlisted', 'private'
    status TEXT DEFAULT 'draft', -- 'draft', 'processing', 'published', 'rejected'
    rights_type TEXT DEFAULT 'all_rights_reserved', -- 'all_rights_reserved', 'creator_licensed', 'creative_commons', 'public_domain', 'authorized'
    rights_confirmed BOOLEAN DEFAULT FALSE,
    ai_summary TEXT,
    ai_tags JSONB DEFAULT '[]'::jsonb,
    embedding vector(768), -- Vector for semantic search (e.g. Gemini text-embedding-004 is 768 dimensions)
    view_count BIGINT DEFAULT 0,
    like_count BIGINT DEFAULT 0,
    comment_count BIGINT DEFAULT 0,
    share_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Series Table
CREATE TABLE IF NOT EXISTS public.series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    language TEXT DEFAULT 'en',
    genre TEXT,
    status TEXT DEFAULT 'published', -- 'draft', 'published'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seasons Table
CREATE TABLE IF NOT EXISTS public.seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Episodes Table (Connects Series Seasons to Videos)
CREATE TABLE IF NOT EXISTS public.episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes Table (Unique user-video pair)
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- Follows Table (Creator / User social graph)
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Comments Table (Supports nesting)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    status TEXT DEFAULT 'approved', -- 'approved', 'flagged', 'hidden'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watch History Table (Analytics / User Resume Play)
CREATE TABLE IF NOT EXISTS public.watch_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    watch_seconds INTEGER DEFAULT 0,
    completion_percent NUMERIC DEFAULT 0.0,
    completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- Saved Videos Table (Watchlist / Saved lists)
CREATE TABLE IF NOT EXISTS public.saved_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- Reports Table (Content moderation)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    reason TEXT NOT NULL, -- 'copyright', 'spam', 'harassment', 'misleading', 'inappropriate', 'other'
    details TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'rejected'
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Subtitles Table (AI generated + community translations)
CREATE TABLE IF NOT EXISTS public.subtitles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    language TEXT NOT NULL, -- 'en', 'hi', 'te', etc.
    subtitle_url TEXT NOT NULL,
    source TEXT DEFAULT 'ai', -- 'ai', 'community', 'creator'
    status TEXT DEFAULT 'approved', -- 'pending', 'approved'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Analysis Table (Detailed computer vision analysis)
CREATE TABLE IF NOT EXISTS public.ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID UNIQUE NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    summary TEXT,
    transcript TEXT,
    genres JSONB DEFAULT '[]'::jsonb,
    topics JSONB DEFAULT '[]'::jsonb,
    scenes JSONB DEFAULT '[]'::jsonb,
    safety_flags JSONB DEFAULT '{}'::jsonb,
    confidence NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Events Table (Granular Analytics Log)
CREATE TABLE IF NOT EXISTS public.content_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'impression', 'play', 'pause', '25_percent', '50_percent', '75_percent', 'complete', 'replay', 'like', 'share', 'comment', 'follow', 'save', 'skip'
    event_value JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- 2. INDEXES DEFINITIONS
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_videos_creator ON public.videos(creator_id);
CREATE INDEX IF NOT EXISTS idx_videos_published_at ON public.videos(published_at) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_videos_type ON public.videos(content_type);
CREATE INDEX IF NOT EXISTS idx_videos_lang ON public.videos(language);
CREATE INDEX IF NOT EXISTS idx_videos_genre ON public.videos(genre);
CREATE INDEX IF NOT EXISTS idx_videos_views ON public.videos(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_series_creator ON public.series(creator_id);
CREATE INDEX IF NOT EXISTS idx_comments_video ON public.comments(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_subtitles_video ON public.subtitles(video_id);
CREATE INDEX IF NOT EXISTS idx_events_video_type ON public.content_events(video_id, event_type);


-- ==========================================
-- 3. TRIGGERS AND SYNC FUNCTIONS
-- ==========================================

-- Function to handle auto updated_at
CREATE OR REPLACE FUNCTION public.handle_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER trigger_update_profiles_timestamp
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

CREATE TRIGGER trigger_update_videos_timestamp
    BEFORE UPDATE ON public.videos
    FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

CREATE TRIGGER trigger_update_series_timestamp
    BEFORE UPDATE ON public.series
    FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

CREATE TRIGGER trigger_update_comments_timestamp
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

-- Functions to update counts on actions
CREATE OR REPLACE FUNCTION public.handle_likes_count_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.videos SET like_count = like_count + 1 WHERE id = NEW.video_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.videos SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.video_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_likes_count_sync
    AFTER INSERT OR DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION public.handle_likes_count_sync();

CREATE OR REPLACE FUNCTION public.handle_comments_count_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.videos SET comment_count = comment_count + 1 WHERE id = NEW.video_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.videos SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.video_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comments_count_sync
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_comments_count_sync();

CREATE OR REPLACE FUNCTION public.handle_followers_count_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.creator_profiles SET followers_count = followers_count + 1 WHERE user_id = NEW.following_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.creator_profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE user_id = OLD.following_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_followers_count_sync
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.handle_followers_count_sync();


-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtitles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_events ENABLE ROW LEVEL SECURITY;

-- 4.1. Profiles Policies
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 4.2. Creator Profiles Policies
CREATE POLICY "Creator profiles are readable by everyone" ON public.creator_profiles
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can create their own creator profile" ON public.creator_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can update their own creator profile" ON public.creator_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 4.3. Videos Policies
CREATE POLICY "Anyone can watch published videos" ON public.videos
    FOR SELECT USING (status = 'published' AND visibility = 'public');

CREATE POLICY "Creators can view all their own videos" ON public.videos
    FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Authenticated users can upload videos" ON public.videos
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own videos" ON public.videos
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own videos" ON public.videos
    FOR DELETE USING (auth.uid() = creator_id);

-- 4.4. Series Policies
CREATE POLICY "Anyone can view public series" ON public.series
    FOR SELECT USING (status = 'published');

CREATE POLICY "Creators can view all their own series" ON public.series
    FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Creators can create series" ON public.series
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own series" ON public.series
    FOR UPDATE USING (auth.uid() = creator_id);

-- 4.5. Seasons & Episodes Policies
CREATE POLICY "Anyone can view seasons" ON public.seasons FOR SELECT USING (TRUE);
CREATE POLICY "Creators can create seasons" ON public.seasons FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.series WHERE id = series_id AND creator_id = auth.uid())
);
CREATE POLICY "Creators can update seasons" ON public.seasons FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.series WHERE id = series_id AND creator_id = auth.uid())
);

CREATE POLICY "Anyone can view episodes" ON public.episodes FOR SELECT USING (TRUE);
CREATE POLICY "Creators can create episodes" ON public.episodes FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.seasons s
        JOIN public.series se ON s.series_id = se.id
        WHERE s.id = season_id AND se.creator_id = auth.uid()
    )
);

-- 4.6. Likes Policies
CREATE POLICY "Anyone can see likes count" ON public.likes FOR SELECT USING (TRUE);
CREATE POLICY "Users can like videos" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike videos" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- 4.7. Follows Policies
CREATE POLICY "Anyone can see follows" ON public.follows FOR SELECT USING (TRUE);
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow others" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- 4.8. Comments Policies
CREATE POLICY "Anyone can read approved comments" ON public.comments
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can comment on videos" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

-- 4.9. Watch History Policies
CREATE POLICY "Users can view own watch history" ON public.watch_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own watch history" ON public.watch_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own watch history" ON public.watch_history
    FOR UPDATE USING (auth.uid() = user_id);

-- 4.10. Saved Videos (Watchlist) Policies
CREATE POLICY "Users can view own saved videos" ON public.saved_videos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save videos" ON public.saved_videos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave videos" ON public.saved_videos
    FOR DELETE USING (auth.uid() = user_id);

-- 4.11. Reports Policies (Admin Gated)
CREATE POLICY "Users can submit reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view reports" ON public.reports
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

CREATE POLICY "Admins can update reports" ON public.reports
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- 4.12. Subtitles Policies
CREATE POLICY "Anyone can read subtitles" ON public.subtitles FOR SELECT USING (TRUE);
CREATE POLICY "Creators can upload subtitles" ON public.subtitles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.videos WHERE id = video_id AND creator_id = auth.uid())
);

-- 4.13. AI Analysis Policies
CREATE POLICY "Anyone can read AI summary/tags" ON public.ai_analysis FOR SELECT USING (TRUE);
CREATE POLICY "Only system role can write AI Analysis" ON public.ai_analysis FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- 4.14. Content Events (Batch Analytics)
CREATE POLICY "Anyone can log content events" ON public.content_events FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins can review analytics events" ON public.content_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
