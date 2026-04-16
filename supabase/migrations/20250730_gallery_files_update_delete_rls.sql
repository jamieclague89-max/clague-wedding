-- Allow anyone to update gallery files (needed for category assignment in admin)
DROP POLICY IF EXISTS "Public update access" ON gallery_files;
CREATE POLICY "Public update access"
  ON gallery_files FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete gallery files (needed for admin delete)
DROP POLICY IF EXISTS "Public delete access" ON gallery_files;
CREATE POLICY "Public delete access"
  ON gallery_files FOR DELETE
  USING (true);
