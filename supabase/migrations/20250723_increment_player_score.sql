CREATE OR REPLACE FUNCTION increment_player_score(p_player_id UUID, p_points INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE quiz_players
  SET score = score + p_points
  WHERE id = p_player_id;
END;
$$ LANGUAGE plpgsql;
