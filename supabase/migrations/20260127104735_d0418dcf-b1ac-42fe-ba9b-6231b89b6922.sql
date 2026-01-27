-- Create table for prompt variations
CREATE TABLE public.prompt_variations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.prompt_variations ENABLE ROW LEVEL SECURITY;

-- Policy: any authenticated user can read
CREATE POLICY "Anyone can read prompt_variations"
  ON public.prompt_variations FOR SELECT
  USING (true);

-- Policy: admins and mentors can manage (using has_role function)
CREATE POLICY "Admins and mentors can manage prompt_variations"
  ON public.prompt_variations FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role)
  );

-- Migrate existing prompt content to variations (optional - creates initial variation)
INSERT INTO public.prompt_variations (prompt_id, content, order_index)
SELECT id, content, 0 FROM public.prompts WHERE content IS NOT NULL AND content != '';