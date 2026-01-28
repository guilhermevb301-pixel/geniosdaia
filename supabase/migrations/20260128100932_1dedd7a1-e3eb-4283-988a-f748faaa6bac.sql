-- Add cover image URL column to modules table
ALTER TABLE public.modules ADD COLUMN cover_image_url text;

-- Create storage bucket for module covers
INSERT INTO storage.buckets (id, name, public) VALUES ('modules', 'modules', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for module covers
CREATE POLICY "Public can view module covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'modules');

CREATE POLICY "Admins can upload module covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'modules' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update module covers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'modules' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete module covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'modules' AND has_role(auth.uid(), 'admin'::app_role));