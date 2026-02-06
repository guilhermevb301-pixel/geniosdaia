-- Add predecessor_challenge_id to objective_challenge_links
-- This defines which challenge must be completed to unlock this one
ALTER TABLE public.objective_challenge_links 
ADD COLUMN predecessor_challenge_id uuid REFERENCES public.daily_challenges(id) ON DELETE SET NULL;