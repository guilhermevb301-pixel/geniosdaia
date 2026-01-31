-- Create the many-to-many relationship table between objectives and daily challenges
CREATE TABLE public.objective_challenge_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_item_id uuid NOT NULL REFERENCES public.objective_items(id) ON DELETE CASCADE,
  daily_challenge_id uuid NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(objective_item_id, daily_challenge_id)
);

-- Enable Row Level Security
ALTER TABLE public.objective_challenge_links ENABLE ROW LEVEL SECURITY;

-- Anyone can read the links (needed for recommendations)
CREATE POLICY "Anyone can read objective_challenge_links"
ON public.objective_challenge_links
FOR SELECT
USING (true);

-- Mentors and admins can manage the links
CREATE POLICY "Mentors and admins can manage objective_challenge_links"
ON public.objective_challenge_links
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role));