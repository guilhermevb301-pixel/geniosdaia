-- Add is_initial_active column to objective_challenge_links
ALTER TABLE public.objective_challenge_links 
ADD COLUMN is_initial_active boolean DEFAULT false NOT NULL;