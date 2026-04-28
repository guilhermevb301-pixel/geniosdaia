-- Add is_locked column to prompts table
-- Locked prompts show thumbnail/title but hide the prompt content
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN prompts.is_locked IS 'When true, prompt content is hidden (locked) — only thumbnail and title are visible to regular members';
