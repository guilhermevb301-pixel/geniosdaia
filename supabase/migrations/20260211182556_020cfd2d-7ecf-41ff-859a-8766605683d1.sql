-- Update lesson-videos bucket to allow up to 1GB files
UPDATE storage.buckets 
SET file_size_limit = 1073741824
WHERE id = 'lesson-videos';