
-- Certificate verification function
CREATE OR REPLACE FUNCTION public.verify_certificate(p_code TEXT)
RETURNS TABLE(id UUID, user_id UUID, module_id UUID, certificate_code TEXT, user_name TEXT, module_title TEXT, issued_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.user_id, c.module_id, c.certificate_code, c.user_name, c.module_title, c.issued_at
  FROM public.certificates c
  WHERE c.certificate_code = p_code
  LIMIT 1;
END;
$$;

-- Safe XP insertion function
CREATE OR REPLACE FUNCTION public.safe_insert_xp(p_action_type TEXT, p_amount INTEGER, p_reference_id UUID DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  valid_actions TEXT[] := ARRAY['lesson_completed', 'module_completed', 'challenge_submitted', 'challenge_won', 'daily_challenge_completed', 'streak_bonus'];
  max_amounts JSONB := '{"lesson_completed": 100, "module_completed": 500, "challenge_submitted": 200, "challenge_won": 1000, "daily_challenge_completed": 150, "streak_bonus": 50}'::JSONB;
  max_amount INTEGER;
BEGIN
  IF NOT (p_action_type = ANY(valid_actions)) THEN
    RAISE EXCEPTION 'Invalid action type: %', p_action_type;
  END IF;
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'XP amount must be positive';
  END IF;
  max_amount := (max_amounts ->> p_action_type)::INTEGER;
  IF p_amount > max_amount THEN
    RAISE EXCEPTION 'XP amount exceeds maximum for action';
  END IF;
  INSERT INTO public.xp_transactions (user_id, action_type, amount, reference_id)
  VALUES (auth.uid(), p_action_type, p_amount, p_reference_id);
  INSERT INTO public.user_xp (user_id, total_xp, current_level)
  VALUES (auth.uid(), p_amount, 1)
  ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + p_amount;
END;
$$;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_stages_mentee_order ON public.mentorship_stages(mentee_id, order_index);
CREATE INDEX IF NOT EXISTS idx_mentorship_tasks_stage_completed ON public.mentorship_tasks(stage_id, completed);
CREATE INDEX IF NOT EXISTS idx_mentee_todos_mentee_order ON public.mentee_todos(mentee_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user_status ON public.user_challenge_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_mentorship_meetings_mentee_date ON public.mentorship_meetings(mentee_id, meeting_date);
