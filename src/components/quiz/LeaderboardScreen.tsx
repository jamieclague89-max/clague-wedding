import { motion } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Player, PlayerAnswer } from '@/hooks/useSupabase';

interface PointsBreakdown {
  playerId: string;
  playerName: string;
  playerSelfie?: string;
  isCorrect: boolean;
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
}

interface LeaderboardScreenProps {
  players: Player[];
  isHost: boolean;
  isFinalRound: boolean;
  answers: PlayerAnswer[];
  correctAnswer: string;
  onContinue: () => void;
  onPlayAgain: () => void;
}

export const LeaderboardScreen = ({
  players,
  isHost,
  isFinalRound,
  answers,
  correctAnswer,
  onContinue,
  onPlayAgain
}: LeaderboardScreenProps) => {
  // Calculate points breakdown for each player
  const pointsBreakdown: PointsBreakdown[] = players.map(player => {
    const playerAnswer = answers.find(a => a.player_id === player.id);
    const isCorrect = playerAnswer?.answer === correctAnswer;
    const basePoints = isCorrect ? 10 : 0;
    const bonusPoints = isCorrect ? (playerAnswer?.time_remaining || 0) : 0;
    
    console.log(`[LeaderboardScreen] Player: ${player.name}, answer: "${playerAnswer?.answer}", correctAnswer: "${correctAnswer}", isCorrect: ${isCorrect}, found answer: ${!!playerAnswer}`);
    
    return {
      playerId: player.id,
      playerName: player.name,
      playerSelfie: player.selfie_url,
      isCorrect,
      basePoints,
      bonusPoints,
      totalPoints: basePoints + bonusPoints
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  // Sort players by total score for overall standings
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const maxScore = sortedPlayers[0]?.score || 1;

  const getMedalEmoji = (position: number) => {
    if (position === 0) return '🥇';
    if (position === 1) return '🥈';
    if (position === 2) return '🥉';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 flex items-start md:items-center justify-center p-4 pt-[10px] md:pt-4">
      <Card className="w-full max-w-2xl p-4 md:p-8 space-y-4 md:space-y-6 mt-0">
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="inline-block"
          >
            <Star className="w-12 h-12 md:w-16 md:h-16 text-yellow-500 mx-auto" />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-purple-900 font-sans">
            Points Scored
          </h2>
        </div>

        {/* Points Breakdown */}
        <div className="space-y-3">
          {pointsBreakdown.map((breakdown, idx) => (
            <motion.div
              key={breakdown.playerId}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-lg overflow-hidden ${
                breakdown.isCorrect 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
              }`}
            >
              <div className="relative z-10 flex items-center gap-2 md:gap-3 p-3 md:p-4">
                {/* Avatar */}
                {breakdown.playerSelfie ? (
                  <img
                    src={breakdown.playerSelfie}
                    alt={breakdown.playerName}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold border-2 border-white text-sm md:text-base">
                    {breakdown.playerName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Name and Points Breakdown */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm md:text-lg truncate">{breakdown.playerName}</p>
                  {breakdown.isCorrect ? (
                    <div className="flex flex-wrap gap-1 md:gap-2 text-xs md:text-sm">
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-1.5 md:px-2 py-0.5 rounded">
                        <Star className="w-3 h-3" />
                        <span className="hidden sm:inline">Correct:</span> +10
                      </span>
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 px-1.5 md:px-2 py-0.5 rounded">
                        <Zap className="w-3 h-3" />
                        <span className="hidden sm:inline">Speed:</span> +{breakdown.bonusPoints}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs md:text-sm text-red-600">
                      ✗ Incorrect
                    </span>
                  )}
                </div>

                {/* Total Points */}
                <div className={`text-xl md:text-2xl font-bold ${
                  breakdown.isCorrect ? 'text-green-600' : 'text-red-400'
                }`}>
                  +{breakdown.totalPoints}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Overall Standings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: pointsBreakdown.length * 0.1 + 0.3 }}
          className="pt-4 border-t-2 border-purple-200"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
            <h3 className="text-lg md:text-xl font-bold text-purple-900">
              {isFinalRound ? 'Final Standings' : 'Current Standings'}
            </h3>
          </div>
          
          <div className="space-y-2">
            {sortedPlayers.slice(0, 5).map((player, idx) => {
              const barWidth = (player.score / maxScore) * 100;
              
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: pointsBreakdown.length * 0.1 + 0.4 + idx * 0.05 }}
                  className="relative rounded-lg overflow-hidden"
                >
                  <div className="relative z-10 flex items-center gap-2 p-2 md:p-3">
                    <div className="text-lg md:text-xl font-bold w-8 md:w-10 text-center">
                      {getMedalEmoji(idx) || `#${idx + 1}`}
                    </div>
                    
                    {/* Avatar - smaller */}
                    {player.selfie_url ? (
                      <img
                        src={player.selfie_url}
                        alt={player.name}
                        className="w-8 h-8 rounded-full object-cover border border-white"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold text-xs border border-white">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="flex-1 font-medium text-sm md:text-base truncate">
                      {player.name}
                    </div>
                    
                    <div className="text-lg md:text-xl font-bold text-purple-900">
                      {player.score}
                    </div>
                  </div>
                  
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg"
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ delay: pointsBreakdown.length * 0.1 + 0.5 + idx * 0.05, duration: 0.4 }}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Continue/Play Again Button */}
        {isHost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pointsBreakdown.length * 0.1 + 0.8 }}
          >
            {isFinalRound ? (
              <Button
                onClick={onPlayAgain}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-lg py-6"
              >
                Play Again
              </Button>
            ) : (
              <Button
                onClick={onContinue}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
              >
                Next Question
              </Button>
            )}
          </motion.div>
        )}

        {!isHost && (
          <p className="text-center text-gray-500 italic">
            {isFinalRound ? 'Thanks for playing!' : 'Waiting for host...'}
          </p>
        )}
      </Card>
    </div>
  );
};
