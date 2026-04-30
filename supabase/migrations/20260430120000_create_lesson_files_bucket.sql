-- Create storage bucket for lesson downloadable files (PDFs, ZIPs, DOCX, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-files',
  'lesson-files',
  true,
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-zip',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Anyone (authenticated) can read lesson files
CREATE POLICY "Anyone can view lesson files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-files');

-- Only admins can upload lesson files
CREATE POLICY "Admins can upload lesson files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lesson-files' AND public.has_role(auth.uid(), 'admin'));

-- Only admins can update lesson files
CREATE POLICY "Admins can update lesson files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'lesson-files' AND public.has_role(auth.uid(), 'admin'));

-- Only admins can delete lesson files
CREATE POLICY "Admins can delete lesson files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'lesson-files' AND public.has_role(auth.uid(), 'admin'));
