-- Add video_url column to prompt_variations for video category prompts
ALTER TABLE public.prompt_variations ADD COLUMN video_url text;