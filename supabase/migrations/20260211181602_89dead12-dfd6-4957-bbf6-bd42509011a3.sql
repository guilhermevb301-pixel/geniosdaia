
-- Create lesson-videos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-videos', 'lesson-videos', true);

-- Allow authenticated users to view lesson videos
CREATE POLICY "Anyone can view lesson videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-videos');

-- Allow admins and mentors to upload lesson videos
CREATE POLICY "Admins and mentors can upload lesson videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-videos'
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
);

-- Allow admins and mentors to update lesson videos
CREATE POLICY "Admins and mentors can update lesson videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lesson-videos'
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
);

-- Allow admins and mentors to delete lesson videos
CREATE POLICY "Admins and mentors can delete lesson videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lesson-videos'
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
);
