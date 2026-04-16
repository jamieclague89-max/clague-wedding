-- Add category column to gallery_files
ALTER TABLE gallery_files ADD COLUMN IF NOT EXISTS category TEXT;
