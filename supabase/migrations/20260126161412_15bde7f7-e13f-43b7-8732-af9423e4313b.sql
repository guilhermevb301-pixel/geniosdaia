-- Enable realtime for mentorship tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorship_pillars;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorship_stages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorship_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorship_meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorship_notes;

-- Create prompts table
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('video', 'image', 'agent')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated can view prompts"
  ON public.prompts FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage prompts"
  ON public.prompts FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Enable realtime for prompts
ALTER PUBLICATION supabase_realtime ADD TABLE public.prompts;