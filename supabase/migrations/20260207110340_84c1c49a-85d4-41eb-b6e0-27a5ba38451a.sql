-- Create sidebar_settings table for storing visual customizations
CREATE TABLE public.sidebar_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon_color TEXT NOT NULL DEFAULT 'amber-400',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.sidebar_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for sidebar to display correctly)
CREATE POLICY "Anyone can read sidebar settings"
  ON public.sidebar_settings
  FOR SELECT
  USING (true);

-- Mentors and admins can manage settings
CREATE POLICY "Mentors and admins can manage sidebar settings"
  ON public.sidebar_settings
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'mentor'::app_role)
  );

-- Insert default settings
INSERT INTO public.sidebar_settings (icon_color) VALUES ('amber-400');