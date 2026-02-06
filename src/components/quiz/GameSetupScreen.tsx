import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface GameSetupScreenProps {
  onStartNewGame: (name: string, gameCode: string) => void;
  onJoinGame: (name: string, gameCode: string) => void;
}

export const GameSetupScreen = ({ onStartNewGame, onJoinGame }: GameSetupScreenProps) => {
  const [mode, setMode] = useState<'select' | 'create' | 'join' | null>(null);
  const [name, setName] = useState('');
  const [gameCode, setGameCode] = useState('');

  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 shadow-xl">
            <h2 style={{ fontFamily: 'Courgette, cursive' }} className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Start New Game
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Game Code (Password)</label>
                <Input
                  placeholder="Create a code for others to join"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value)}
                  className="text-lg"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Others will use this code to join your game</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMode(null);
                    setName('');
                    setGameCode('');
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => onStartNewGame(name, gameCode)}
                  disabled={!name.trim() || !gameCode.trim() || gameCode.length < 4}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  Create Game
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 shadow-xl">
            <h2 style={{ fontFamily: 'Courgette, cursive' }} className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Join a Game
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Game Code</label>
                <Input
                  placeholder=""
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMode(null);
                    setName('');
                    setGameCode('');
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => onJoinGame(name, gameCode)}
                  disabled={!name.trim() || !gameCode.trim()}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  Join Game
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-12">
          <h1 style={{ fontFamily: 'Courgette, cursive' }} className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Hen Party Quiz
          </h1>
          <p className="text-xl text-gray-600">How well do you know the bride?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="p-8 cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => setMode('create')}
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                  <Plus className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Start New Game</h3>
                <p className="text-gray-600">
                  Create a new quiz session and invite your friends to join
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="p-8 cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => setMode('join')}
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                  <LogIn className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Join Game</h3>
                <p className="text-gray-600">
                  Enter a game code to join an existing quiz session
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
