-- Add height and width_type columns to dashboard_banners
ALTER TABLE public.dashboard_banners 
ADD COLUMN height integer DEFAULT 176,
ADD COLUMN width_type text DEFAULT 'half';

-- Add title and media_urls columns to user_notes
ALTER TABLE public.user_notes 
ADD COLUMN title text,
ADD COLUMN media_urls text[] DEFAULT '{}';

-- Create bucket for user notes media
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-notes', 'user-notes', true);

-- RLS policies for the bucket
CREATE POLICY "Users can upload own media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own media"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-notes');

CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user-notes' AND auth.uid()::text = (storage.foldername(name))[1]);