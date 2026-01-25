-- Create mentorship_pillars table
CREATE TABLE public.mentorship_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL REFERENCES public.mentees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT DEFAULT 'folder',
  icon_color TEXT DEFAULT '#FFD93D',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentorship_pillars ENABLE ROW LEVEL SECURITY;

-- Add pillar_id to mentorship_stages
ALTER TABLE public.mentorship_stages 
ADD COLUMN pillar_id UUID REFERENCES public.mentorship_pillars(id) ON DELETE CASCADE;

-- RLS Policies for mentorship_pillars
CREATE POLICY "Mentees can view their own pillars"
ON public.mentorship_pillars
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM mentees
  WHERE mentees.id = mentorship_pillars.mentee_id
  AND mentees.user_id = auth.uid()
));

CREATE POLICY "Mentors and admins can manage pillars"
ON public.mentorship_pillars
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role));