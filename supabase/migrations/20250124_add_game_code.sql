-- Add game_code column to game_sessions table
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS game_code TEXT UNIQUE;

-- Create index on game_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_sessions_code ON game_sessions(game_code);
