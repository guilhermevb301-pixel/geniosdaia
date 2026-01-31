-- 1. Create user_challenge_progress table
CREATE TABLE public.user_challenge_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  daily_challenge_id uuid NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  objective_item_id uuid REFERENCES public.objective_items(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  deadline timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, daily_challenge_id, objective_item_id)
);

-- 2. Add order_index to objective_challenge_links
ALTER TABLE public.objective_challenge_links
ADD COLUMN order_index integer DEFAULT 0;

-- 3. Enable RLS
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for users
CREATE POLICY "Users can view own progress" 
ON public.user_challenge_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" 
ON public.user_challenge_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" 
ON public.user_challenge_progress FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" 
ON public.user_challenge_progress FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Admins and mentors can view all progress
CREATE POLICY "Admins and mentors can view all progress" 
ON public.user_challenge_progress FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role));