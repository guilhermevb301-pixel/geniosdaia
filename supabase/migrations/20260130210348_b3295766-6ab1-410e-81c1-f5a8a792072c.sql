-- Create table for custom GPTs
CREATE TABLE public.custom_gpts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  gpt_url TEXT NOT NULL,
  icon_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_gpts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active GPTs
CREATE POLICY "Anyone can read active GPTs"
ON public.custom_gpts FOR SELECT
USING (is_active = true);

-- Policy: Admins can manage GPTs
CREATE POLICY "Admins can manage GPTs"
ON public.custom_gpts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));