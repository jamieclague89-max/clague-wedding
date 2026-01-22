-- Enable RLS on gallery_files table
ALTER TABLE gallery_files ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read gallery files (public gallery)
DROP POLICY IF EXISTS "Public read access" ON gallery_files;
CREATE POLICY "Public read access"
  ON gallery_files FOR SELECT
  USING (true);

-- Allow anyone to insert gallery files (guests can upload)
DROP POLICY IF EXISTS "Public insert access" ON gallery_files;
CREATE POLICY "Public insert access"
  ON gallery_files FOR INSERT
  WITH CHECK (true);
