-- Enable RLS on gallery_comments
ALTER TABLE gallery_comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read comments
CREATE POLICY "Anyone can read comments"
  ON gallery_comments FOR SELECT
  USING (true);

-- Allow anyone to insert comments
CREATE POLICY "Anyone can insert comments"
  ON gallery_comments FOR INSERT
  WITH CHECK (true);
