-- Add thumbnail_focus column to store the focal point of the image
ALTER TABLE public.prompts 
ADD COLUMN thumbnail_focus TEXT DEFAULT 'center';