CREATE TABLE IF NOT EXISTS gallery_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id TEXT NOT NULL,
  commenter_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gallery_comments REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE gallery_comments;
