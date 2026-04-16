-- Enable REPLICA IDENTITY FULL on gallery_files so real-time UPDATE and DELETE
-- events carry the full old/new row data (including id for DELETE payloads).
ALTER TABLE gallery_files REPLICA IDENTITY FULL;
