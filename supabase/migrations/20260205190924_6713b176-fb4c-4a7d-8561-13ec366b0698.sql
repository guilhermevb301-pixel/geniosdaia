-- Create banners storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true);

-- Allow admins and mentors to upload banners
CREATE POLICY "Admins and mentors can upload banners"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'banners' AND 
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
);

-- Allow public viewing of banners
CREATE POLICY "Anyone can view banners"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'banners');

-- Allow admins and mentors to delete banners
CREATE POLICY "Admins and mentors can delete banners"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'banners' AND 
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
);