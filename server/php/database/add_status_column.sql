-- Add status column to surveys table if it doesn't exist
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS status ENUM('draft', 'published', 'archived') DEFAULT 'draft';

-- Update existing surveys to have proper status based on is_public
UPDATE surveys SET status = 'published' WHERE is_public = 1;
UPDATE surveys SET status = 'draft' WHERE is_public = 0;

-- Add status column to survey_templates table if it doesn't exist
ALTER TABLE survey_templates ADD COLUMN IF NOT EXISTS status ENUM('draft', 'published', 'archived') DEFAULT 'draft';

-- Update existing templates to have proper status based on is_public
UPDATE survey_templates SET status = 'published' WHERE is_public = 1;
UPDATE survey_templates SET status = 'draft' WHERE is_public = 0;
