# System Design & Technical Specification: IdeaToX

## 1. High-Level Architecture Stack
- **Framework:** Next.js 15+ (App Router, Server Actions, React Server Components)
- **Language:** TypeScript (Strict Mode)
- **Styling & UI:** Tailwind CSS + `shadcn/ui` + Lucide Icons
- **Database & Backend-as-a-Service:** Supabase (PostgreSQL + Auth + Row Level Security)
- **ORM / Query Builder:** Drizzle ORM or Supabase typed JS client
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`) for auto-generating MVP specs from 1-sentence prompts and powering the Idea Slot Machine.
- **Hosting & CI/CD:** Vercel (Frontend/Edge Functions) + GitHub Actions (Open-source PR checks).

## 2. Database Schema (PostgreSQL / Supabase)

```sql
-- 1. USERS PROFILE TABLE (Mirrors Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  github_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  reputation_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. IDEAS TABLE (Core Entity + Self-Referencing Fork Lineage)
CREATE TABLE public.ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_idea_id UUID REFERENCES public.ideas(id) ON DELETE SET NULL, -- Null if original, populated if Forked
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  hook TEXT NOT NULL, -- Max 140 chars
  problem_statement TEXT NOT NULL,
  mvp_features JSONB NOT NULL DEFAULT '[]', -- Array of feature strings
  category TEXT NOT NULL, -- 'web', 'mobile', 'ai', 'cli', 'hardware', 'extension'
  difficulty TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced'
  target_region TEXT DEFAULT 'Global', -- e.g., 'Global', 'Nigeria', 'US'
  collab_status TEXT DEFAULT 'open', -- 'open', 'seeking_cofounder'
  suggested_stack TEXT[] DEFAULT '{}',
  upvotes_count INT DEFAULT 0,
  forks_count INT DEFAULT 0,
  builds_count INT DEFAULT 0,
  is_seeded BOOLEAN DEFAULT FALSE, -- True if imported via initial Idea Bank
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FEATURE PULL REQUESTS (Suggestions to modify an Idea)
CREATE TABLE public.feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  proposer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL, -- 'add_feature' or 'remove_feature'
  feature_text TEXT NOT NULL,
  rationale TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SHIPPED BUILDS / IN-PROGRESS PROJECTS
CREATE TABLE public.idea_builds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  builder_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'building', -- 'building', 'shipped'
  repo_url TEXT NOT NULL,
  live_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STARS / UPVOTES (Many-to-Many)
CREATE TABLE public.idea_upvotes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, idea_id)
);

-- 6. COMMENTS (Threaded Discussion)
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);