-- =============================================
-- GAMIFICATION SYSTEM TABLES
-- =============================================

-- 1. User XP - Main gamification data per user
CREATE TABLE public.user_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  total_xp integer DEFAULT 0 NOT NULL,
  current_level integer DEFAULT 1 NOT NULL,
  current_streak integer DEFAULT 0 NOT NULL,
  longest_streak integer DEFAULT 0 NOT NULL,
  last_activity_date date,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2. XP Transactions - History of all XP gains
CREATE TABLE public.xp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  action_type text NOT NULL,
  reference_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Badges catalog
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  criteria_type text NOT NULL,
  criteria_value integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 4. User badges (earned)
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id uuid REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- 5. User streaks - Daily activity log
CREATE TABLE public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_date date NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, activity_date)
);

-- =============================================
-- CHALLENGES SYSTEM TABLES
-- =============================================

-- 6. Challenges
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  rules text,
  xp_reward integer DEFAULT 100 NOT NULL,
  badge_reward_id uuid REFERENCES public.badges(id),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 7. Challenge submissions
CREATE TABLE public.challenge_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  file_url text,
  link_url text,
  votes_count integer DEFAULT 0 NOT NULL,
  is_winner boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(challenge_id, user_id)
);

-- 8. Challenge votes
CREATE TABLE public.challenge_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES public.challenge_submissions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(submission_id, user_id)
);

-- =============================================
-- CERTIFICATES SYSTEM TABLE
-- =============================================

-- 9. Certificates
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  certificate_code text UNIQUE NOT NULL,
  user_name text NOT NULL,
  module_title text NOT NULL,
  module_duration text,
  issued_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, module_id)
);

-- =============================================
-- NOTES AND FAVORITES SYSTEM TABLES
-- =============================================

-- 10. User notes
CREATE TABLE public.user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  prompt_id uuid REFERENCES public.prompts(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 11. User favorites
CREATE TABLE public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  prompt_id uuid REFERENCES public.prompts(id) ON DELETE CASCADE,
  note text,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_favorite CHECK (
    (lesson_id IS NOT NULL AND prompt_id IS NULL) OR
    (lesson_id IS NULL AND prompt_id IS NOT NULL)
  )
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- User XP policies
CREATE POLICY "Users can view their own XP" ON public.user_xp FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own XP" ON public.user_xp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own XP" ON public.user_xp FOR UPDATE USING (auth.uid() = user_id);

-- XP Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges policies (public read)
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Admins can manage badges" ON public.badges FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- User badges policies
CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User streaks policies
CREATE POLICY "Users can view their own streaks" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can log their own streaks" ON public.user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Challenges policies (public read, admin write)
CREATE POLICY "Anyone can view challenges" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Admins can manage challenges" ON public.challenges FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Challenge submissions policies
CREATE POLICY "Anyone can view submissions" ON public.challenge_submissions FOR SELECT USING (true);
CREATE POLICY "Users can create their own submissions" ON public.challenge_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own submissions" ON public.challenge_submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage submissions" ON public.challenge_submissions FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Challenge votes policies
CREATE POLICY "Anyone can view votes" ON public.challenge_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON public.challenge_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their vote" ON public.challenge_votes FOR DELETE USING (auth.uid() = user_id);

-- Certificates policies
CREATE POLICY "Users can view their own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public certificate verification" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Users can create their own certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User notes policies
CREATE POLICY "Users can view their own notes" ON public.user_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notes" ON public.user_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.user_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.user_notes FOR DELETE USING (auth.uid() = user_id);

-- User favorites policies
CREATE POLICY "Users can view their own favorites" ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own favorites" ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own favorites" ON public.user_favorites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- INSERT DEFAULT BADGES
-- =============================================

INSERT INTO public.badges (name, description, icon, criteria_type, criteria_value) VALUES
('Primeiro Passo', 'Complete sua primeira aula', 'footprints', 'lessons_completed', 1),
('Consistente', 'Mantenha 7 dias de streak', 'flame', 'streak_days', 7),
('Dedicado', 'Mantenha 30 dias de streak', 'fire', 'streak_days', 30),
('Colecionador', 'Copie 10 prompts', 'copy', 'prompts_copied', 10),
('Estudioso', 'Complete 1 módulo', 'book-open', 'modules_completed', 1),
('Veterano', 'Complete 5 módulos', 'graduation-cap', 'modules_completed', 5),
('Competidor', 'Participe de 1 desafio', 'trophy', 'challenges_participated', 1),
('Campeão', 'Vença 1 desafio', 'crown', 'challenges_won', 1),
('Networker', 'Participe de 5 eventos ao vivo', 'users', 'events_attended', 5);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_user_xp_user_id ON public.user_xp(user_id);
CREATE INDEX idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_user_streaks_user_id ON public.user_streaks(user_id);
CREATE INDEX idx_challenge_submissions_challenge_id ON public.challenge_submissions(challenge_id);
CREATE INDEX idx_challenge_votes_submission_id ON public.challenge_votes(submission_id);
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_code ON public.certificates(certificate_code);
CREATE INDEX idx_user_notes_user_id ON public.user_notes(user_id);
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);

-- =============================================
-- FUNCTION TO UPDATE VOTES COUNT
-- =============================================

CREATE OR REPLACE FUNCTION public.update_votes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.challenge_submissions 
    SET votes_count = votes_count + 1 
    WHERE id = NEW.submission_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.challenge_submissions 
    SET votes_count = votes_count - 1 
    WHERE id = OLD.submission_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_update_votes_count
AFTER INSERT OR DELETE ON public.challenge_votes
FOR EACH ROW EXECUTE FUNCTION public.update_votes_count();

-- =============================================
-- FUNCTION TO GENERATE CERTIFICATE CODE
-- =============================================

CREATE OR REPLACE FUNCTION public.generate_certificate_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.certificate_code IS NULL OR NEW.certificate_code = '' THEN
    NEW.certificate_code := 'GENIA-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_certificate_code
BEFORE INSERT ON public.certificates
FOR EACH ROW EXECUTE FUNCTION public.generate_certificate_code();