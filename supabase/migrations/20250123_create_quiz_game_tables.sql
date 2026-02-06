CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'lobby',
  current_round INTEGER NOT NULL DEFAULT 0,
  current_question_index INTEGER NOT NULL DEFAULT -1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  is_host BOOLEAN NOT NULL DEFAULT false,
  selfie_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES quiz_players(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  answer TEXT NOT NULL,
  time_remaining INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_players_session ON quiz_players(game_session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_session ON quiz_answers(game_session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_player ON quiz_answers(player_id);

ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_players;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_answers;

DROP POLICY IF EXISTS "Enable read access for all users" ON game_sessions;
CREATE POLICY "Enable read access for all users"
  ON game_sessions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON game_sessions;
CREATE POLICY "Enable insert for all users"
  ON game_sessions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON game_sessions;
CREATE POLICY "Enable update for all users"
  ON game_sessions FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON quiz_players;
CREATE POLICY "Enable read access for all users"
  ON quiz_players FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON quiz_players;
CREATE POLICY "Enable insert for all users"
  ON quiz_players FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON quiz_players;
CREATE POLICY "Enable update for all users"
  ON quiz_players FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON quiz_answers;
CREATE POLICY "Enable read access for all users"
  ON quiz_answers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON quiz_answers;
CREATE POLICY "Enable insert for all users"
  ON quiz_answers FOR INSERT
  WITH CHECK (true);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
