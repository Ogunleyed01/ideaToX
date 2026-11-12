-- ==============================================================================
-- IdeaToX: Milestone 13 Production Auth, Counters & Persistence Migration
-- Idempotent migration extending profiles, adding bookmarks, collaboration_requests,
-- notifications, hardened handle_new_user() trigger, and SECURITY DEFINER counter triggers.
-- ==============================================================================

-- 1. EXTEND PROFILES FOR BUILDER SETTINGS & CUSTOM HANDLES
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'Open to Co-Founding',
  ADD COLUMN IF NOT EXISTS preferred_stack TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS discord_url TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower
  ON public.profiles (LOWER(username));

-- Hardened profile provisioning on auth.users signup (supports Email + Password & OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  raw_handle TEXT;
  clean_handle TEXT;
  candidate_username TEXT;
BEGIN
  raw_handle := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'preferred_username',
    split_part(COALESCE(NEW.email, ''), '@', 1),
    'builder'
  );

  clean_handle := lower(regexp_replace(raw_handle, '[^a-zA-Z0-9_]+', '_', 'g'));
  clean_handle := trim(both '_' from clean_handle);

  IF length(clean_handle) < 2 THEN
    clean_handle := 'builder';
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(clean_handle)) THEN
    candidate_username := left(clean_handle, 24) || '_' || substr(NEW.id::text, 1, 4);
  ELSE
    candidate_username := left(clean_handle, 30);
  END IF;

  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    headline,
    availability,
    bio,
    github_url,
    contact_email,
    reputation_score,
    badges
  )
  VALUES (
    NEW.id,
    candidate_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', candidate_username),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'headline', 'Full-Stack Systems Builder'),
    'Open to Co-Founding',
    COALESCE(NEW.raw_user_meta_data->>'bio', 'Open-source systems builder & software architect on IdeaToX.'),
    CASE WHEN NEW.raw_user_meta_data->>'user_name' IS NOT NULL
         THEN 'https://github.com/' || (NEW.raw_user_meta_data->>'user_name')
         ELSE NULL END,
    NEW.email,
    300,
    ARRAY['Ideator']::TEXT[]
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure missing DELETE policies for user-owned records exist cleanly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ideas' AND policyname = 'Idea authors can delete their ideas.'
  ) THEN
    CREATE POLICY "Idea authors can delete their ideas."
      ON public.ideas FOR DELETE
      USING (auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'comments' AND policyname = 'Users can delete their own comments.'
  ) THEN
    CREATE POLICY "Users can delete their own comments."
      ON public.comments FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2. SECURITY DEFINER COUNTER TRIGGERS (Fixes RLS blocking non-author count increments)
CREATE OR REPLACE FUNCTION public.handle_idea_upvotes_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.ideas
      SET upvotes_count = GREATEST(0, COALESCE(upvotes_count, 0) + 1)
      WHERE id = NEW.idea_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.ideas
      SET upvotes_count = GREATEST(0, COALESCE(upvotes_count, 0) - 1)
      WHERE id = OLD.idea_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_idea_upvotes_counter ON public.idea_upvotes;
CREATE TRIGGER trg_idea_upvotes_counter
  AFTER INSERT OR DELETE ON public.idea_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.handle_idea_upvotes_counter();

CREATE OR REPLACE FUNCTION public.handle_idea_builds_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.ideas
      SET builds_count = GREATEST(0, COALESCE(builds_count, 0) + 1)
      WHERE id = NEW.idea_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.ideas
      SET builds_count = GREATEST(0, COALESCE(builds_count, 0) - 1)
      WHERE id = OLD.idea_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_idea_builds_counter ON public.idea_builds;
CREATE TRIGGER trg_idea_builds_counter
  AFTER INSERT OR DELETE ON public.idea_builds
  FOR EACH ROW EXECUTE FUNCTION public.handle_idea_builds_counter();

CREATE OR REPLACE FUNCTION public.handle_idea_forks_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.parent_idea_id IS NOT NULL) THEN
    UPDATE public.ideas
      SET forks_count = GREATEST(0, COALESCE(forks_count, 0) + 1)
      WHERE id = NEW.parent_idea_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE' AND OLD.parent_idea_id IS NOT NULL) THEN
    UPDATE public.ideas
      SET forks_count = GREATEST(0, COALESCE(forks_count, 0) - 1)
      WHERE id = OLD.parent_idea_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_idea_forks_counter ON public.ideas;
CREATE TRIGGER trg_idea_forks_counter
  AFTER INSERT OR DELETE ON public.ideas
  FOR EACH ROW EXECUTE FUNCTION public.handle_idea_forks_counter();

-- Automatically apply merged Feature PR changes to public.ideas.mvp_features
CREATE OR REPLACE FUNCTION public.handle_feature_pr_merge()
RETURNS TRIGGER AS $$
DECLARE
  current_features JSONB;
  updated_features JSONB;
BEGIN
  IF (NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved') THEN
    SELECT COALESCE(mvp_features, '[]'::JSONB) INTO current_features
    FROM public.ideas WHERE id = NEW.idea_id;

    IF (NEW.action_type = 'add_feature') THEN
      IF NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(current_features) AS elem
        WHERE LOWER(TRIM(elem)) = LOWER(TRIM(NEW.feature_text))
      ) THEN
        updated_features := current_features || jsonb_build_array(NEW.feature_text);
        UPDATE public.ideas SET mvp_features = updated_features, updated_at = NOW() WHERE id = NEW.idea_id;
      END IF;
    ELSIF (NEW.action_type = 'remove_feature') THEN
      SELECT COALESCE(jsonb_agg(elem), '[]'::JSONB) INTO updated_features
      FROM jsonb_array_elements_text(current_features) AS elem
      WHERE LOWER(TRIM(elem)) <> LOWER(TRIM(NEW.feature_text));
      UPDATE public.ideas SET mvp_features = updated_features, updated_at = NOW() WHERE id = NEW.idea_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_feature_pr_merge ON public.feature_requests;
CREATE TRIGGER trg_feature_pr_merge
  AFTER UPDATE OF status ON public.feature_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_feature_pr_merge();

-- 3. PERSONAL READING LIST BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, idea_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bookmarks." ON public.bookmarks;
CREATE POLICY "Users can view their own bookmarks."
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add their own bookmarks." ON public.bookmarks;
CREATE POLICY "Users can add their own bookmarks."
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their own bookmarks." ON public.bookmarks;
CREATE POLICY "Users can remove their own bookmarks."
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- 4. BUILDER COLLABORATION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.collaboration_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  availability TEXT NOT NULL,
  contact_handle TEXT NOT NULL,
  pitch TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collab_idea_id ON public.collaboration_requests(idea_id);
CREATE INDEX IF NOT EXISTS idx_collab_applicant_id ON public.collaboration_requests(applicant_id);

ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view collaboration roster pitches." ON public.collaboration_requests;
CREATE POLICY "Anyone can view collaboration roster pitches."
  ON public.collaboration_requests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can submit collaboration pitches." ON public.collaboration_requests;
CREATE POLICY "Authenticated users can submit collaboration pitches."
  ON public.collaboration_requests FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Idea authors can review collaboration pitches." ON public.collaboration_requests;
CREATE POLICY "Idea authors can review collaboration pitches."
  ON public.collaboration_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.ideas
      WHERE ideas.id = collaboration_requests.idea_id AND ideas.author_id = auth.uid()
    )
  );

-- 5. BUILDER INBOX NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('pr', 'fork', 'build', 'comment', 'collab', 'star', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  idea_slug TEXT NOT NULL,
  idea_title TEXT NOT NULL,
  target_tab TEXT CHECK (target_tab IN ('spec', 'prs', 'builds', 'lineage', 'discussions', 'team')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications." ON public.notifications;
CREATE POLICY "Users can view their own notifications."
  ON public.notifications FOR SELECT
  USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Authenticated users can create builder notifications." ON public.notifications;
CREATE POLICY "Authenticated users can create builder notifications."
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND (actor_id IS NULL OR actor_id = auth.uid()));

DROP POLICY IF EXISTS "Users can mark their own notifications read." ON public.notifications;
CREATE POLICY "Users can mark their own notifications read."
  ON public.notifications FOR UPDATE
  USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can delete their own notifications." ON public.notifications;
CREATE POLICY "Users can delete their own notifications."
  ON public.notifications FOR DELETE
  USING (auth.uid() = recipient_id);
