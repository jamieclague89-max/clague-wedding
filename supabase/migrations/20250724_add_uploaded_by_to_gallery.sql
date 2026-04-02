ALTER TABLE gallery_files ADD COLUMN IF NOT EXISTS uploaded_by TEXT NOT NULL DEFAULT 'Anonymous';
