import { useEffect, useMemo, useCallback, useRef } from 'react';
import { GameSetupScreen } from '@/components/quiz/GameSetupScreen';
import { LobbyScreen } from '@/components/quiz/LobbyScreen';
import { GameScreen } from '@/components/quiz/GameScreen';
import { LeaderboardScreen } from '@/components/quiz/LeaderboardScreen';
import { useSupabase } from '@/hooks/useSupabase';
import { quizData } from '@/data/quizData';

export default function HenPartyQuiz() {
  const {
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
  } = useSupabase();

  // Get current round and question
  const currentRound = useMemo(() => {
    if (gameState.current_round === 0) return null;
    return quizData.find(r => r.roundId === gameState.current_round);
  }, [gameState.current_round]);

  const currentQuestion = useMemo(() => {
    if (!currentRound || gameState.current_question_index < 0) return null;
    return currentRound.questions[gameState.current_question_index];
  }, [currentRound, gameState.current_question_index]);

  // Track whether we've already scored this question to avoid recalculating
  const scoredQuestionRef = useRef<string | null>(null);
  const showLeaderboardRef = useRef(showLeaderboard);
  showLeaderboardRef.current = showLeaderboard;

  const isHost = currentPlayer?.is_host || false;

  // Calculate scores when revealing answer (only host scores to prevent duplicate increments from multiple clients)
  useEffect(() => {
    if (gameState.status === 'reveal' && currentQuestion && isHost) {
      const questionKey = `${gameState.current_round}-${gameState.current_question_index}`;

      // Only score once per question
      if (scoredQuestionRef.current !== questionKey) {
        scoredQuestionRef.current = questionKey;
        // Filter to only current question's answers
        const currentAnswers = answers.filter(a => a.question_key === questionKey);
        currentAnswers.forEach(answer => {
          const isCorrect = answer.answer === currentQuestion.correct;
          if (isCorrect) {
            const points = 10 + answer.time_remaining; // 10 base + time bonus
            updatePlayerScore(answer.player_id, points);
          }
        });
      }
    }
  }, [gameState.status, gameState.current_round, gameState.current_question_index, currentQuestion, answers, updatePlayerScore, isHost]);


  // Handle start new game
  const handleStartNewGame = useCallback(async (name: string, gameCode: string) => {
    const result = await createNewGame(name, gameCode);
    if (!result) {
      alert('Failed to create game. Please try again.');
    }
  }, [createNewGame]);

  // Handle join game by code
  const handleJoinGameByCode = useCallback(async (name: string, code: string) => {
    const result = await joinGameByCode(name, code);
    if (!result.success) {
      alert(result.message || 'Failed to join game. Please try again.');
    }
  }, [joinGameByCode]);

  // Handle start game
  const handleStartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // Handle continue from intro, reveal, or leaderboard
  const handleContinue = useCallback(() => {
    if (!currentRound) return;

    if (gameState.status === 'intro') {
      // Start first question
      advanceToQuestion(0);
    } else if (gameState.status === 'reveal') {
      // Move from reveal to leaderboard (points scored screen)
      showLeaderboard();
    } else if (gameState.status === 'leaderboard') {
      // Check if round is complete
      const isRoundComplete = gameState.current_question_index >= currentRound.questions.length - 1;
      
      if (isRoundComplete) {
        // Move to next round or end game
        const nextRoundId = gameState.current_round + 1;
        if (nextRoundId <= quizData.length) {
          advanceToNextRound(nextRoundId);
        }
      } else {
        // Next question
        advanceToQuestion(gameState.current_question_index + 1);
      }
    }
  }, [currentRound, gameState, advanceToQuestion, advanceToNextRound, showLeaderboard]);

  // Handle answer submission
  const handleSubmitAnswer = useCallback((answer: string, timeRemaining: number) => {
    submitAnswer(answer, timeRemaining);
  }, [submitAnswer]);

  // Handle reveal
  const handleReveal = useCallback(() => {
    revealAnswer();
  }, [revealAnswer]);

  // Handle play again
  const handlePlayAgain = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const isFinalRound = gameState.current_round === quizData.length && 
    currentRound && 
    gameState.current_question_index >= currentRound.questions.length - 1;

  // Show setup screen if no session
  if (!sessionId) {
    return (
      <GameSetupScreen
        onStartNewGame={handleStartNewGame}
        onJoinGame={handleJoinGameByCode}
      />
    );
  }

  // Lobby
  if (gameState.status === 'lobby') {
    return (
      <LobbyScreen
        players={players}
        currentPlayer={currentPlayer}
        gameCode={gameCode}
        onStartGame={handleStartGame}
        onLeaveGame={leaveGame}
      />
    );
  }

  // Leaderboard
  if (gameState.status === 'leaderboard') {
    const questionKey = `${gameState.current_round}-${gameState.current_question_index}`;
    const currentAnswers = answers.filter(a => a.question_key === questionKey);
    const correctAnswer = currentQuestion?.correct || '';
    
    console.log('[Leaderboard] questionKey:', questionKey, 'correctAnswer:', correctAnswer, 
      'currentAnswers:', currentAnswers, 'all answers:', answers, 
      'currentQuestion:', currentQuestion);
    
    return (
      <LeaderboardScreen
        players={players}
        isHost={isHost}
        isFinalRound={isFinalRound}
        answers={currentAnswers}
        correctAnswer={correctAnswer}
        onContinue={handleContinue}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // Game (Intro, Question, Reveal)
  if (currentRound) {
    const questionKey = `${gameState.current_round}-${gameState.current_question_index}`;
    const currentAnswers = answers.filter(a => a.question_key === questionKey);

    return (
      <GameScreen
        question={currentQuestion || currentRound.questions[0]}
        questionNumber={gameState.current_question_index + 1}
        totalQuestions={currentRound.questions.length}
        players={players}
        currentPlayer={currentPlayer}
        answers={currentAnswers}
        gameStatus={gameState.status as 'intro' | 'question' | 'reveal'}
        roundTitle={currentRound.title}
        roundDescription={currentRound.description}
        isHost={isHost}
        onSubmitAnswer={handleSubmitAnswer}
        onReveal={handleReveal}
        onContinue={handleContinue}
      />
    );
  }

  return null;
}
