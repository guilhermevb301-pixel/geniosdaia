-- Add thumbnail and example media columns to prompts table
ALTER TABLE public.prompts 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS example_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS example_video_url TEXT;

-- Create storage bucket for prompt media
INSERT INTO storage.buckets (id, name, public)
VALUES ('prompts', 'prompts', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: Admins can upload prompt media
CREATE POLICY "Admins can upload prompt media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'prompts' AND has_role(auth.uid(), 'admin'));

-- RLS: Public can view prompt media
CREATE POLICY "Public can view prompt media"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'prompts');

-- RLS: Admins can update prompt media
CREATE POLICY "Admins can update prompt media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'prompts' AND has_role(auth.uid(), 'admin'));

-- RLS: Admins can delete prompt media
CREATE POLICY "Admins can delete prompt media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'prompts' AND has_role(auth.uid(), 'admin'));