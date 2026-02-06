import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Question } from '@/data/quizData';
import type { Player, PlayerAnswer } from '@/hooks/useSupabase';

interface GameScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  players: Player[];
  currentPlayer: Player | null;
  answers: PlayerAnswer[];
  gameStatus: 'intro' | 'question' | 'reveal';
  roundTitle: string;
  roundDescription: string;
  isHost: boolean;
  onSubmitAnswer: (answer: string, timeRemaining: number) => void;
  onReveal: () => void;
  onContinue: () => void;
}

export const GameScreen = ({
  question,
  questionNumber,
  totalQuestions,
  players,
  currentPlayer,
  answers,
  gameStatus,
  roundTitle,
  roundDescription,
  isHost,
  onSubmitAnswer,
  onReveal,
  onContinue
}: GameScreenProps) => {
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [playingSound, setPlayingSound] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const songAudioRef = useRef<HTMLAudioElement | null>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [blurAmount, setBlurAmount] = useState(7);

  // Intro auto-advance - only host triggers the advance to prevent multiple players
  // all calling advanceToQuestion simultaneously. Use a ref for the callback to
  // avoid resetting the timer when onContinue reference changes.
  const onContinueRef = useRef(onContinue);
  onContinueRef.current = onContinue;

  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

  // Pre-load audio on component mount for mobile compatibility
  useEffect(() => {
    audioRef.current = new Audio('/timer/timer-alert.mp3');
    audioRef.current.volume = 1.0;
    audioRef.current.loop = true;
    audioRef.current.preload = 'auto';
    
    // Try to load the audio file
    audioRef.current.load();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gameStatus === 'intro' && isHost) {
      const timer = setTimeout(() => {
        onContinueRef.current();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, isHost]);

  // Question timer
  useEffect(() => {
    if (gameStatus === 'question') {
      // Set timer to 30 seconds for music round, 15 for others
      const initialTime = question.audioFile ? 30 : 15;
      setTimeRemaining(initialTime);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setShowOptions(false);
      setBlurAmount(7); // Reset blur for image rounds

      // Wait 2s then show options
      const showTimer = setTimeout(() => {
        setShowOptions(true);
      }, 2000);

      // Play song audio if it's a music round question (only on host device)
      if (question.audioFile && isHost) {
        // Preload the audio
        songAudioRef.current = new Audio(question.audioFile);
        songAudioRef.current.preload = 'auto';
        songAudioRef.current.load();
        
        // Try to autoplay after 2 seconds
        const songTimer = setTimeout(() => {
          if (songAudioRef.current) {
            songAudioRef.current.play().catch((error) => {
              console.log('Autoplay blocked, showing play button:', error);
              // If autoplay is blocked (mobile), show play button
              setShowPlayButton(true);
            });
          }
        }, 2000);

        return () => {
          clearTimeout(showTimer);
          clearTimeout(songTimer);
          if (songAudioRef.current) {
            songAudioRef.current.pause();
            songAudioRef.current = null;
          }
          setShowPlayButton(false);
        };
      }

      return () => clearTimeout(showTimer);
    }
  }, [gameStatus, questionNumber, question.audioFile]);

  // Countdown timer - continues even after answering
  // Only the host triggers the reveal to prevent multiple DB updates
  // Also handles gradual unblur for image rounds
  useEffect(() => {
    if (gameStatus === 'question' && showOptions && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - only host triggers reveal to avoid race conditions
            if (isHost) {
              setTimeout(() => {
                onRevealRef.current();
              }, 100);
            }
            return 0;
          }
          
          // Gradually unblur image as time decreases (for image rounds)
          if (question.imageFile) {
            const newBlur = Math.max(0, (prev / 15) * 7); // 7px blur at start, 0px at end
            setBlurAmount(newBlur);
          }
          
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStatus, showOptions, timeRemaining, isHost, question.imageFile]);

  // Play timer sound when time is running out - only for players who haven't answered
  useEffect(() => {
    if (gameStatus === 'question' && showOptions && timeRemaining <= 4 && timeRemaining > 0 && !hasAnswered) {
      // Use the pre-loaded audio for better mobile compatibility
      if (audioRef.current && !playingSound) {
        setPlayingSound(true);
        audioRef.current.currentTime = 0; // Reset to start
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log('Audio play failed:', error);
            setPlayingSound(false);
          });
        }
      }
    } else if ((timeRemaining === 0 || hasAnswered || gameStatus !== 'question') && playingSound) {
      // Stop the sound when time runs out or player answers
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingSound(false);
    }
  }, [gameStatus, showOptions, timeRemaining, hasAnswered, playingSound]);

  // Check if all players have answered and trigger reveal (host only)
  useEffect(() => {
    if (gameStatus === 'question' && showOptions && isHost) {
      const allAnswered = players.length > 0 && players.every(p => 
        answers.some(a => a.player_id === p.id)
      );
      
      if (allAnswered) {
        // Short delay then reveal
        const revealTimer = setTimeout(() => {
          onRevealRef.current();
        }, 1000);
        return () => clearTimeout(revealTimer);
      }
    }
  }, [gameStatus, showOptions, players, answers, isHost]);

  const handleSelectAnswer = (answer: string) => {
    if (hasAnswered || gameStatus !== 'question') return;
    
    setSelectedAnswer(answer);
    setHasAnswered(true);
    onSubmitAnswer(answer, timeRemaining);
  };

  // Intro Screen
  if (gameStatus === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center text-white"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-4"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
          >
            {roundTitle}
          </motion.h1>
          <motion.p
            className="text-2xl md:text-3xl"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
          >
            {roundDescription}
          </motion.p>
          <motion.div
            className="mt-8 text-lg opacity-75"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Get ready...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Question/Reveal Screen
  // Calculate who has answered
  const playersAnswered = players.filter(p => 
    answers.some(a => a.player_id === p.id)
  );
  const playersNotAnswered = players.filter(p => 
    !answers.some(a => a.player_id === p.id)
  );

  // Helper component for player avatar
  const PlayerAvatar = ({ player, size = 'md', showStatus = false, answered = false }: { 
    player: Player; 
    size?: 'sm' | 'md'; 
    showStatus?: boolean;
    answered?: boolean;
  }) => {
    const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
    const statusRing = showStatus 
      ? answered 
        ? 'ring-2 ring-green-500 ring-offset-1' 
        : 'ring-2 ring-orange-400 ring-offset-1 opacity-50' 
      : '';
    
    return player.selfie_url ? (
      <img
        src={player.selfie_url}
        alt={player.name}
        className={`${sizeClasses} rounded-full object-cover ${statusRing}`}
        title={player.name}
      />
    ) : (
      <div 
        className={`${sizeClasses} rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold ${statusRing}`}
        title={player.name}
      >
        {player.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-purple-100 via-pink-100 to-purple-200 flex flex-col p-2 md:p-4 overflow-hidden">
      {/* Header - More compact on mobile */}
      <div className="flex justify-between items-center mb-1 md:mb-4">
        <div className="text-xs md:text-sm font-medium text-purple-800">
          Q {questionNumber}/{totalQuestions}
        </div>
        {gameStatus === 'question' && showOptions && (
          <motion.div
            className={`flex items-center gap-2 px-4 py-2 md:px-4 md:py-2 rounded-full font-bold text-3xl md:text-base ${
              timeRemaining <= 5 ? 'bg-red-500 text-white shadow-2xl' : 'bg-white text-purple-800'
            }`}
            animate={timeRemaining <= 5 ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.5, repeat: timeRemaining <= 5 ? Infinity : 0 }}
          >
            <Clock className="w-7 h-7 md:w-5 md:h-5" />
            <span className="min-w-[2ch]">{timeRemaining}s</span>
          </motion.div>
        )}
      </div>

      {/* Mobile: Player status as avatar row */}
      {gameStatus === 'question' && showOptions && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mb-1"
        >
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {players.map(player => {
              const hasAnswered = playersAnswered.some(p => p.id === player.id);
              return (
                <motion.div
                  key={player.id}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: hasAnswered ? 1 : 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <PlayerAvatar 
                    player={player} 
                    size="sm" 
                    showStatus={true} 
                    answered={hasAnswered} 
                  />
                </motion.div>
              );
            })}
          </div>
          <p className="text-center text-[10px] text-purple-600 mt-0.5">
            {playersAnswered.length}/{players.length} answered
          </p>
        </motion.div>
      )}

      <div className="flex gap-4 flex-1">
        {/* Desktop: Players Status Sidebar */}
        {gameStatus === 'question' && showOptions && (
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden md:block w-48 lg:w-64 space-y-3"
          >
            {/* Players who answered */}
            {playersAnswered.length > 0 && (
              <Card className="p-3 bg-green-50 border-green-200">
                <h3 className="text-xs font-bold text-green-800 mb-2">
                  ✓ Answered ({playersAnswered.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {playersAnswered.map(player => (
                    <div key={player.id} className="flex flex-col items-center gap-1">
                      <PlayerAvatar player={player} size="sm" />
                      <span className="text-[10px] text-green-700 truncate max-w-[50px]">
                        {player.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Players who haven't answered */}
            {playersNotAnswered.length > 0 && (
              <Card className="p-3 bg-orange-50 border-orange-200">
                <h3 className="text-xs font-bold text-orange-800 mb-2">
                  ⏳ Waiting ({playersNotAnswered.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {playersNotAnswered.map(player => (
                    <div key={player.id} className="flex flex-col items-center gap-1 opacity-60">
                      <PlayerAvatar player={player} size="sm" />
                      <span className="text-[10px] text-orange-700 truncate max-w-[50px]">
                        {player.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* Question Card - Now takes more space on mobile */}
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-2xl p-3 md:p-6 lg:p-8 space-y-3 md:space-y-6">
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-purple-900 leading-tight"
              style={{ fontFamily: "'Courgette', cursive" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {question.q}
            </motion.h2>

            {/* Blurred Image (for image rounds) */}
            {question.imageFile && gameStatus === 'question' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center my-4"
              >
                <div className="relative w-full max-w-md aspect-square">
                  <img
                    src={question.imageFile}
                    alt="Mystery person"
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                    style={{
                      filter: `blur(${blurAmount}px)`,
                      transition: 'filter 1s ease-out'
                    }}
                  />
                  {blurAmount > 5 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-bold">
                        Image revealing...
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Revealed Image (after time's up) */}
            {question.imageFile && gameStatus === 'reveal' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center my-4"
              >
                <div className="relative w-full max-w-md aspect-square">
                  <img
                    src={question.imageFile}
                    alt="Revealed person"
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                    style={{ filter: 'blur(0px)' }}
                  />
                </div>
              </motion.div>
            )}

            {/* Play Music Button (appears if autoplay is blocked on mobile) */}
            {showPlayButton && question.audioFile && isHost && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center"
              >
                <Button
                  size="lg"
                  onClick={() => {
                    if (songAudioRef.current) {
                      songAudioRef.current.play();
                      setShowPlayButton(false);
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg px-8 py-6 shadow-lg"
                >
                  🎵 Play Song
                </Button>
              </motion.div>
            )}

            {/* Options - Better mobile layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
              <AnimatePresence>
                {(gameStatus === 'question' && showOptions || gameStatus === 'reveal') &&
                  question.options.map((option, idx) => {
                    const isCorrect = option === question.correct;
                    const isSelected = selectedAnswer === option;
                    const showResult = gameStatus === 'reveal';

                    let buttonClass = 'bg-white hover:bg-purple-50 border-2 border-purple-200';
                    
                    if (showResult) {
                      if (isCorrect) {
                        buttonClass = 'bg-green-500 text-white border-green-600';
                      } else if (isSelected && !isCorrect) {
                        buttonClass = 'bg-red-500 text-white border-red-600';
                      } else {
                        buttonClass = 'bg-gray-200 border-gray-300 opacity-50';
                      }
                    } else if (isSelected) {
                      buttonClass = 'bg-purple-600 text-white border-purple-700';
                    }

                    return (
                      <motion.div
                        key={option}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Button
                          onClick={() => handleSelectAnswer(option)}
                          disabled={hasAnswered || gameStatus === 'reveal'}
                          className={`w-full h-auto py-3 md:py-4 text-sm md:text-lg ${buttonClass} flex items-center justify-center gap-2`}
                          variant="outline"
                        >
                          {showResult && isCorrect && <Check className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />}
                          {showResult && isSelected && !isCorrect && <X className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />}
                          <span className="flex-1">{option}</span>
                        </Button>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>

            {/* Status Messages */}
            {hasAnswered && gameStatus === 'question' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-purple-600 font-medium text-xs md:text-base"
              >
                ✓ Locked in! Waiting for others...
              </motion.p>
            )}

            {gameStatus === 'reveal' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-2 md:space-y-4"
              >
                <p className="text-base md:text-xl font-bold text-green-600">
                  Correct: {question.correct}
                </p>
                {isHost && (
                  <Button
                    onClick={onContinue}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Continue
                  </Button>
                )}
                {!isHost && (
                  <p className="text-gray-500 italic text-xs md:text-sm">Waiting for host...</p>
                )}
              </motion.div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
