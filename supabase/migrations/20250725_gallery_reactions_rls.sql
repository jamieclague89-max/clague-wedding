-- Enable RLS on gallery_reactions
ALTER TABLE gallery_reactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read reactions
CREATE POLICY "Anyone can read reactions"
  ON gallery_reactions FOR SELECT
  USING (true);

-- Allow anyone to insert reactions
CREATE POLICY "Anyone can insert reactions"
  ON gallery_reactions FOR INSERT
  WITH CHECK (true);

-- Allow anyone to delete their own reactions
CREATE POLICY "Anyone can delete reactions"
  ON gallery_reactions FOR DELETE
  USING (true);
