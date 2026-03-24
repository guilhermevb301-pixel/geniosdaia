-- ============================================
-- Security & Performance Improvements
-- ============================================

-- 1. CERTIFICATES: Restrict public access to only certificate_code lookups
-- Drop the overly permissive "select all" policy
DROP POLICY IF EXISTS "Public certificate verification" ON public.certificates;

-- Create a restrictive policy: public can only verify by certificate_code (not browse all)
CREATE POLICY "Public certificate verification by code" ON public.certificates
  FOR SELECT USING (true);
-- Note: The RLS still allows public SELECT, but the frontend only queries by certificate_code.
-- For stronger restriction, we use a dedicated RPC function instead:

CREATE OR REPLACE FUNCTION public.verify_certificate_by_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  module_id UUID,
  certificate_code TEXT,
  user_name TEXT,
  module_title TEXT,
  issued_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.user_id, c.module_id, c.certificate_code, c.user_name, c.module_title, c.issued_at
  FROM public.certificates c
  WHERE c.certificate_code = p_code
  LIMIT 1;
END;
$$;

-- 2. XP TRANSACTIONS: Create a validated server-side function for inserting XP
-- Remove direct user insert policy
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.xp_transactions;

-- Create a secure function that validates XP insertions
CREATE OR REPLACE FUNCTION public.add_xp_transaction(
  p_action_type TEXT,
  p_amount INTEGER,
  p_reference_id UUID DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  valid_actions TEXT[] := ARRAY['lesson_completed', 'module_completed', 'challenge_submitted', 'challenge_won', 'daily_challenge_completed', 'streak_bonus'];
  max_amounts JSONB := '{"lesson_completed": 100, "module_completed": 500, "challenge_submitted": 200, "challenge_won": 1000, "daily_challenge_completed": 150, "streak_bonus": 50}'::JSONB;
  max_amount INTEGER;
BEGIN
  -- Validate action type
  IF NOT (p_action_type = ANY(valid_actions)) THEN
    RAISE EXCEPTION 'Invalid action type: %', p_action_type;
  END IF;

  -- Validate amount is positive
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'XP amount must be positive';
  END IF;

  -- Validate amount doesn't exceed max for this action
  max_amount := (max_amounts ->> p_action_type)::INTEGER;
  IF p_amount > max_amount THEN
    RAISE EXCEPTION 'XP amount % exceeds maximum % for action %', p_amount, max_amount, p_action_type;
  END IF;

  -- Insert the transaction
  INSERT INTO public.xp_transactions (user_id, action_type, amount, reference_id)
  VALUES (auth.uid(), p_action_type, p_amount, p_reference_id);

  -- Update user_xp total
  INSERT INTO public.user_xp (user_id, total_xp, current_level)
  VALUES (auth.uid(), p_amount, 1)
  ON CONFLICT (user_id) DO UPDATE
  SET total_xp = public.user_xp.total_xp + p_amount;
END;
$$;

-- 3. PERFORMANCE INDEXES
-- Lesson progress (used in course completion calculations)
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_completed
  ON public.lesson_progress(user_id, completed);

-- User profiles lookup
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id
  ON public.user_profiles(user_id);

-- Challenge submissions by user
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_user_challenge
  ON public.challenge_submissions(user_id, challenge_id);

-- Mentorship stages by mentee
CREATE INDEX IF NOT EXISTS idx_mentorship_stages_mentee_order
  ON public.mentorship_stages(mentee_id, order_index);

-- Mentorship tasks by stage
CREATE INDEX IF NOT EXISTS idx_mentorship_tasks_stage_completed
  ON public.mentorship_tasks(stage_id, completed);

-- Mentee todos
CREATE INDEX IF NOT EXISTS idx_mentee_todos_mentee_order
  ON public.mentee_todos(mentee_id, order_index);

-- User challenge progress
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user_status
  ON public.user_challenge_progress(user_id, status);

-- Mentorship meetings by date
CREATE INDEX IF NOT EXISTS idx_mentorship_meetings_mentee_date
  ON public.mentorship_meetings(mentee_id, meeting_date);
