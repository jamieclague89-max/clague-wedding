CREATE TABLE IF NOT EXISTS gallery_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id TEXT NOT NULL,
  emoji TEXT NOT NULL CHECK (emoji IN ('heart', 'like', 'laugh')),
  reactor_name TEXT NOT NULL DEFAULT 'Anonymous',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(file_id, emoji, reactor_name)
);

ALTER TABLE gallery_reactions REPLICA IDENTITY FULL;
