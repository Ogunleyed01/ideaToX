-- ==============================================================================
-- IdeaToX: Core Database Schema Migration
-- Tables: profiles, ideas, feature_requests, idea_builds, idea_upvotes, comments
-- Includes RLS policies, automated triggers, and indexes.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Mirrors Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  github_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  location TEXT DEFAULT 'Global',
  reputation_score INT DEFAULT 250,
  badges TEXT[] DEFAULT ARRAY['Ideator']::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: Automatically Create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
BEGIN
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'preferred_username',
    split_part(NEW.email, '@', 1)
  ) || '_' || substr(NEW.id::text, 1, 4);

  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    bio,
    github_url,
    reputation_score
  )
  VALUES (
    NEW.id,
    generated_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', generated_username),
    NEW.raw_user_meta_data->>'avatar_url',
    'Open-source systems builder & software architect on IdeaToX.',
    CASE WHEN NEW.raw_user_meta_data->>'user_name' IS NOT NULL 
         THEN 'https://github.com/' || (NEW.raw_user_meta_data->>'user_name') 
         ELSE NULL END,
    300
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. IDEAS TABLE (Core Entity with Self-Referencing Fork Lineage)
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_idea_id UUID REFERENCES public.ideas(id) ON DELETE SET NULL,
  parent_slug TEXT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  hook TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  mvp_features JSONB NOT NULL DEFAULT '[]'::JSONB,
  category TEXT NOT NULL CHECK (category IN ('web', 'mobile', 'ai', 'cli', 'hardware', 'extension')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  target_region TEXT DEFAULT 'Global',
  collab_status TEXT DEFAULT 'open' CHECK (collab_status IN ('open', 'seeking_cofounder')),
  suggested_stack TEXT[] DEFAULT '{}',
  upvotes_count INT DEFAULT 0,
  forks_count INT DEFAULT 0,
  builds_count INT DEFAULT 0,
  is_seeded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Fast Discovery Feed Queries
CREATE INDEX IF NOT EXISTS idx_ideas_slug ON public.ideas(slug);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON public.ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_difficulty ON public.ideas(difficulty);
CREATE INDEX IF NOT EXISTS idx_ideas_parent ON public.ideas(parent_idea_id);
CREATE INDEX IF NOT EXISTS idx_ideas_upvotes ON public.ideas(upvotes_count DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_created ON public.ideas(created_at DESC);

-- Enable RLS on Ideas
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ideas."
  ON public.ideas FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create ideas."
  ON public.ideas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Idea authors can update their ideas."
  ON public.ideas FOR UPDATE
  USING (auth.uid() = author_id);


-- 4. FEATURE PULL REQUESTS (Proposals to Modify an Idea's MVP Scope)
CREATE TABLE IF NOT EXISTS public.feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  proposer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('add_feature', 'remove_feature')),
  feature_text TEXT NOT NULL,
  rationale TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prs_idea_id ON public.feature_requests(idea_id);

ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feature PRs."
  ON public.feature_requests FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can propose feature PRs."
  ON public.feature_requests FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Idea owners can update PR status."
  ON public.feature_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.ideas
      WHERE ideas.id = feature_requests.idea_id AND ideas.author_id = auth.uid()
    )
  );


-- 5. SHIPPED BUILDS & IN-PROGRESS PROJECTS (Proof-of-Work Showcase)
CREATE TABLE IF NOT EXISTS public.idea_builds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  builder_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'building' CHECK (status IN ('building', 'shipped')),
  repo_url TEXT NOT NULL,
  live_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builds_idea_id ON public.idea_builds(idea_id);

ALTER TABLE public.idea_builds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shipped builds."
  ON public.idea_builds FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can link builds."
  ON public.idea_builds FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Builders can update their own builds."
  ON public.idea_builds FOR UPDATE
  USING (auth.uid() = builder_id);


-- 6. UPVOTES & STARS (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.idea_upvotes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, idea_id)
);

ALTER TABLE public.idea_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view upvotes count."
  ON public.idea_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can toggle upvotes."
  ON public.idea_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their upvotes."
  ON public.idea_upvotes FOR DELETE
  USING (auth.uid() = user_id);


-- 7. THREADED COMMENTS (Architectural RFC Discussions)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON public.comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_comment_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments."
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can post comments."
  ON public.comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can edit or delete their own comments."
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);
