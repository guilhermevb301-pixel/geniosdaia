-- Add zip_url column to templates table for storing ZIP file links
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS zip_url text;