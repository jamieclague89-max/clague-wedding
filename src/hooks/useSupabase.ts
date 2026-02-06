import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface Player {
  id: string;
  name: string;
  score: number;
  is_host: boolean;
  selfie_url?: string;
}

export type GameStatus = 'lobby' | 'intro' | 'question' | 'reveal' | 'leaderboard';

export interface GameState {
  current_round: number;
  current_question_index: number;
  status: GameStatus;
}

export interface PlayerAnswer {
  player_id: string;
  question_key: string;
  answer: string;
  time_remaining: number;
}

const GAME_SESSION_KEY = 'quiz_game_session_id';
const PLAYER_ID_KEY = 'quiz_player_id';

export const useSupabase = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    current_round: 0,
    current_question_index: -1,
    status: 'lobby'
  });
  const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gameCode, setGameCode] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedSessionId = localStorage.getItem(GAME_SESSION_KEY);
      const savedPlayerId = localStorage.getItem(PLAYER_ID_KEY);
      
      if (!savedSessionId || !savedPlayerId) return;

      console.log('Attempting to restore session:', savedSessionId, 'player:', savedPlayerId);

      // Verify the session and player still exist and are valid
      const { data: session } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', savedSessionId)
        .single();

      if (!session) {
        console.log('Session no longer exists, clearing localStorage');
        localStorage.removeItem(GAME_SESSION_KEY);
        localStorage.removeItem(PLAYER_ID_KEY);
        return;
      }

      const { data: player } = await supabase
        .from('quiz_players')
        .select('*')
        .eq('id', savedPlayerId)
        .eq('game_session_id', savedSessionId)
        .single();

      if (!player) {
        console.log('Player no longer exists in this session, clearing localStorage');
        localStorage.removeItem(GAME_SESSION_KEY);
        localStorage.removeItem(PLAYER_ID_KEY);
        return;
      }

      // Restore session state
      console.log('Restoring session and player');
      setSessionId(savedSessionId);
      setGameCode(session.game_code);
      setCurrentPlayer({
        id: player.id,
        name: player.name,
        score: player.score,
        is_host: player.is_host,
        selfie_url: player.selfie_url || undefined
      });
      setGameState({
        current_round: session.current_round,
        current_question_index: session.current_question_index,
        status: session.status as GameStatus
      });
    };

    restoreSession();
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const fetchPlayers = async () => {
      const { data } = await supabase
        .from('quiz_players')
        .select('*')
        .eq('game_session_id', sessionId);
      
      if (data) {
        console.log('Fetched players:', data);
        setPlayers(data.map(p => ({
          id: p.id,
          name: p.name,
          score: p.score,
          is_host: p.is_host,
          selfie_url: p.selfie_url || undefined
        })));
      }
    };

    const fetchGameState = async () => {
      const { data } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (data) {
        console.log('Fetched game state:', data);
        setGameState({
          current_round: data.current_round,
          current_question_index: data.current_question_index,
          status: data.status as GameStatus
        });
      }
    };

    const fetchAnswers = async () => {
      const { data } = await supabase
        .from('quiz_answers')
        .select('*')
        .eq('game_session_id', sessionId);
      
      if (data) {
        setAnswers(data.map(a => ({
          player_id: a.player_id,
          question_key: a.question_key,
          answer: a.answer,
          time_remaining: a.time_remaining
        })));
      }
    };

    // Direct payload parsing for instant realtime updates without full refetch
    const handlePlayersChange = (payload: any) => {
      console.log('Real-time player change:', payload);
      if (payload.new) {
        setPlayers(current => {
          const exists = current.find(p => p.id === payload.new.id);
          if (exists) {
            return current.map(p => 
              p.id === payload.new.id 
                ? {
                    id: payload.new.id,
                    name: payload.new.name,
                    score: payload.new.score,
                    is_host: payload.new.is_host,
                    selfie_url: payload.new.selfie_url || undefined
                  }
                : p
            );
          }
          return [...current, {
            id: payload.new.id,
            name: payload.new.name,
            score: payload.new.score,
            is_host: payload.new.is_host,
            selfie_url: payload.new.selfie_url || undefined
          }];
        });
      } else if (payload.old && payload.eventType === 'DELETE') {
        setPlayers(current => current.filter(p => p.id !== payload.old.id));
      }
    };

    const handleGameStateChange = (payload: any) => {
      console.log('Real-time game state change:', payload);
      if (payload.new) {
        setGameState({
          current_round: payload.new.current_round,
          current_question_index: payload.new.current_question_index,
          status: payload.new.status as GameStatus
        });
      }
    };

    const handleAnswersChange = (payload: any) => {
      console.log('Real-time answer change:', payload);
      if (payload.new) {
        setAnswers(current => {
          const exists = current.find(a => 
            a.player_id === payload.new.player_id && 
            a.question_key === payload.new.question_key
          );
          if (exists) {
            return current.map(a =>
              a.player_id === payload.new.player_id && a.question_key === payload.new.question_key
                ? {
                    player_id: payload.new.player_id,
                    question_key: payload.new.question_key,
                    answer: payload.new.answer,
                    time_remaining: payload.new.time_remaining
                  }
                : a
            );
          }
          return [...current, {
            player_id: payload.new.player_id,
            question_key: payload.new.question_key,
            answer: payload.new.answer,
            time_remaining: payload.new.time_remaining
          }];
        });
      }
    };

    fetchPlayers();
    fetchGameState();
    fetchAnswers();

    // Use a single channel with all subscriptions for better reliability
    const realtimeChannel = supabase
      .channel(`game_realtime:${sessionId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'quiz_players', filter: `game_session_id=eq.${sessionId}` },
        handlePlayersChange
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
        handleGameStateChange
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_answers', filter: `game_session_id=eq.${sessionId}` },
        handleAnswersChange
      )
      .subscribe((status) => {
        console.log('Realtime channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          // Re-fetch everything when subscription is confirmed to catch any missed events
          fetchPlayers();
          fetchGameState();
          fetchAnswers();
        }
      });

    // Polling fallback: poll every 1 second instead of 3 for faster fallback updates
    const pollInterval = setInterval(() => {
      fetchPlayers();
      fetchGameState();
      fetchAnswers();
    }, 1000);

    return () => {
      realtimeChannel.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    
    const storedPlayerId = localStorage.getItem('quiz_player_id');
    if (storedPlayerId) {
      const player = players.find(p => p.id === storedPlayerId);
      if (player) {
        setCurrentPlayer(player);
      }
    }
  }, [players, sessionId]);

  // Generate a simple 6-character game code
  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createNewGame = useCallback(async (hostName: string, code: string) => {
    const gameCodeUpper = code.toUpperCase();
    
    // Create the game session
    const { data: newSession, error: sessionError } = await supabase
      .from('game_sessions')
      .insert([{ 
        status: 'lobby',
        current_round: 0,
        current_question_index: -1,
        game_code: gameCodeUpper
      }])
      .select()
      .single();
    
    if (sessionError || !newSession) {
      console.error('Error creating game:', sessionError);
      return null;
    }

    // Create the host player
    const { data: hostPlayer, error: playerError } = await supabase
      .from('quiz_players')
      .insert([{
        game_session_id: newSession.id,
        name: hostName,
        score: 0,
        is_host: true
      }])
      .select()
      .single();

    if (playerError || !hostPlayer) {
      console.error('Error creating host player:', playerError);
      return null;
    }

    // Set up local state
    localStorage.setItem(GAME_SESSION_KEY, newSession.id);
    localStorage.setItem('quiz_player_id', hostPlayer.id);
    setSessionId(newSession.id);
    setGameCode(gameCodeUpper);
    
    const player: Player = {
      id: hostPlayer.id,
      name: hostPlayer.name,
      score: hostPlayer.score,
      is_host: hostPlayer.is_host,
      selfie_url: hostPlayer.selfie_url || undefined
    };
    setCurrentPlayer(player);
    
    return { code: gameCodeUpper, player };
  }, []);

  const joinGameByCode = useCallback(async (name: string, code: string) => {
    const { data: session } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('game_code', code.toUpperCase())
      .single();
    
    if (!session) {
      return { success: false, message: 'Game not found. Please check the code and try again.' };
    }

    // Create player in this game
    const { data: newPlayer, error: playerError } = await supabase
      .from('quiz_players')
      .insert([{
        game_session_id: session.id,
        name,
        score: 0,
        is_host: false
      }])
      .select()
      .single();

    if (playerError || !newPlayer) {
      console.error('Error creating player:', playerError);
      return { success: false, message: 'Failed to join game. Please try again.' };
    }

    // Set up local state
    localStorage.setItem(GAME_SESSION_KEY, session.id);
    localStorage.setItem('quiz_player_id', newPlayer.id);
    setSessionId(session.id);
    setGameCode(code.toUpperCase());
    
    const player: Player = {
      id: newPlayer.id,
      name: newPlayer.name,
      score: newPlayer.score,
      is_host: newPlayer.is_host,
      selfie_url: newPlayer.selfie_url || undefined
    };
    setCurrentPlayer(player);
    
    return { success: true, player };
  }, []);

  const joinGame = useCallback(async (name: string, selfieUrl?: string) => {
    if (!sessionId) return;

    const { data: existingPlayers } = await supabase
      .from('quiz_players')
      .select('*')
      .eq('game_session_id', sessionId);
    
    const isHost = !existingPlayers || existingPlayers.length === 0;
    
    console.log('Joining game, existing players:', existingPlayers);
    
    const { data: newPlayer } = await supabase
      .from('quiz_players')
      .insert([{
        game_session_id: sessionId,
        name,
        score: 0,
        is_host: isHost,
        selfie_url: selfieUrl
      }])
      .select()
      .single();
    
    if (newPlayer) {
      console.log('New player created:', newPlayer);
      const player: Player = {
        id: newPlayer.id,
        name: newPlayer.name,
        score: newPlayer.score,
        is_host: newPlayer.is_host,
        selfie_url: newPlayer.selfie_url || undefined
      };
      setCurrentPlayer(player);
      localStorage.setItem('quiz_player_id', player.id);
      
      // Immediately fetch all players to update the list
      const { data: allPlayers } = await supabase
        .from('quiz_players')
        .select('*')
        .eq('game_session_id', sessionId);
      
      if (allPlayers) {
        setPlayers(allPlayers.map(p => ({
          id: p.id,
          name: p.name,
          score: p.score,
          is_host: p.is_host,
          selfie_url: p.selfie_url || undefined
        })));
      }
      
      return player;
    }
  }, [sessionId]);

  const startGame = useCallback(async () => {
    if (!sessionId) return;

    console.log('Starting game...');
    const { data, error } = await supabase
      .from('game_sessions')
      .update({
        current_round: 1,
        current_question_index: -1,
        status: 'intro',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select();
    
    if (error) {
      console.error('Error starting game:', error);
    } else {
      console.log('Game started successfully:', data);
    }
  }, [sessionId]);

  const advanceToQuestion = useCallback(async (questionIndex: number) => {
    if (!sessionId) return;

    await supabase
      .from('game_sessions')
      .update({
        current_question_index: questionIndex,
        status: 'question',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);
  }, [sessionId]);

  const submitAnswer = useCallback(async (
    answer: string,
    timeRemaining: number
  ) => {
    if (!currentPlayer || !sessionId) return;
    
    const questionKey = `${gameState.current_round}-${gameState.current_question_index}`;
    
    await supabase
      .from('quiz_answers')
      .insert([{
        game_session_id: sessionId,
        player_id: currentPlayer.id,
        question_key: questionKey,
        answer,
        time_remaining: timeRemaining
      }]);
  }, [currentPlayer, gameState, sessionId]);

  const revealAnswer = useCallback(async () => {
    if (!sessionId) return;

    await supabase
      .from('game_sessions')
      .update({
        status: 'reveal',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);
  }, [sessionId]);

  const showLeaderboard = useCallback(async () => {
    if (!sessionId) return;

    await supabase
      .from('game_sessions')
      .update({
        status: 'leaderboard',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);
  }, [sessionId]);

  const advanceToNextRound = useCallback(async (roundId: number) => {
    if (!sessionId) return;

    await supabase
      .from('game_sessions')
      .update({
        current_round: roundId,
        current_question_index: -1,
        status: 'intro',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);
  }, [sessionId]);

  const updatePlayerScore = useCallback(async (playerId: string, points: number) => {
    if (!sessionId) return;

    // Use atomic server-side increment to avoid stale state issues
    const { error } = await supabase.rpc('increment_player_score', {
      p_player_id: playerId,
      p_points: points
    });
    
    if (error) {
      console.error('Error updating player score:', error);
    }
  }, [sessionId]);

  const resetGame = useCallback(async () => {
    if (!sessionId) return;

    await supabase
      .from('game_sessions')
      .update({
        current_round: 0,
        current_question_index: -1,
        status: 'lobby',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    await supabase
      .from('quiz_players')
      .update({ score: 0 })
      .eq('game_session_id', sessionId);

    await supabase
      .from('quiz_answers')
      .delete()
      .eq('game_session_id', sessionId);
  }, [sessionId]);

  const leaveGame = useCallback(() => {
    // Clear localStorage and reset state
    localStorage.removeItem(GAME_SESSION_KEY);
    localStorage.removeItem(PLAYER_ID_KEY);
    setSessionId(null);
    setGameCode(null);
    setCurrentPlayer(null);
    setPlayers([]);
    setGameState({
      current_round: 0,
      current_question_index: -1,
      status: 'lobby'
    });
    setAnswers([]);
  }, []);

  return {
    players,
    gameState,
    answers,
    currentPlayer,
    sessionId,
    gameCode,
    createNewGame,
    joinGameByCode,
    joinGame,
    startGame,
    advanceToQuestion,
    submitAnswer,
    revealAnswer,
    showLeaderboard,
    advanceToNextRound,
    updatePlayerScore,
    resetGame,
    leaveGame
  };
};

