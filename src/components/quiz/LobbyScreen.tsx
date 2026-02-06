import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, Check, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Player } from '@/hooks/useSupabase';

interface LobbyScreenProps {
  players: Player[];
  currentPlayer: Player | null;
  gameCode?: string | null;
  onStartGame: () => void;
  onLeaveGame?: () => void;
}

export const LobbyScreen = ({ players, currentPlayer, gameCode, onStartGame, onLeaveGame }: LobbyScreenProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (gameCode) {
      navigator.clipboard.writeText(gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHost = currentPlayer?.is_host;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-pink-600">Waiting Room</h2>
            <p className="text-gray-600">
              <Users className="inline mr-2" />
              {players.length} {players.length === 1 ? 'player has joined' : 'players have joined'}
            </p>
          </div>

          {gameCode && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border-2 border-pink-200">
              <p className="text-sm text-gray-600 text-center mb-2">Share this code with friends:</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white rounded-lg p-3 text-center">
                  <span className="text-3xl font-bold tracking-wider text-pink-600">{gameCode}</span>
                </div>
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {players.map((player, idx) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{player.name}</p>
                  {player.is_host && (
                    <span className="text-xs bg-pink-600 text-white px-2 py-1 rounded">
                      HOST
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {isHost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={onStartGame}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-lg py-6"
                disabled={players.length < 1}
              >
                START GAME
              </Button>
            </motion.div>
          )}

          {!isHost && (
            <p className="text-center text-gray-500 italic">
              Waiting for host to start the game...
            </p>
          )}

          {onLeaveGame && (
            <Button
              onClick={onLeaveGame}
              variant="outline"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave Game
            </Button>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
