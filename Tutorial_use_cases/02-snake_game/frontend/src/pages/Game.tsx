import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { GameCanvas } from '@/components/GameCanvas';
import { useSnakeGame, GameMode } from '@/hooks/useSnakeGame';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { mockApi } from '@/api/mockApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Game: React.FC = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const gameMode = (mode as GameMode) || 'pass-through';

  const handleGameOver = async (score: number) => {
    if (user && score > 0) {
      await mockApi.leaderboard.submitScore(score, gameMode);
      toast.success(`Game Over! Score: ${score}`, {
        description: 'Your score has been submitted to the leaderboard.',
      });
    }
  };

  const { gameState, resetGame, togglePause, GRID_SIZE } = useSnakeGame(
    gameMode,
    handleGameOver
  );

  useEffect(() => {
    if (!['pass-through', 'walls'].includes(gameMode)) {
      navigate('/');
    }
  }, [gameMode, navigate]);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold neon-text">
                {gameMode === 'pass-through' ? 'Pass-Through Mode' : 'Walls Mode'}
              </h1>
              <p className="text-muted-foreground">
                {gameMode === 'pass-through'
                  ? 'Wrap around the edges - no walls!'
                  : 'Avoid the walls - one hit and game over!'}
              </p>
            </div>
            <Button onClick={() => navigate('/')} variant="outline" className="border-primary/30">
              Back to Menu
            </Button>
          </div>

          <div className="grid lg:grid-cols-[1fr,300px] gap-6">
            <div className="space-y-4">
              <GameCanvas gameState={gameState} gridSize={GRID_SIZE} />

              <div className="flex gap-4">
                <Button
                  onClick={togglePause}
                  disabled={gameState.isGameOver}
                  className="game-button flex-1"
                >
                  {gameState.isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button onClick={resetGame} variant="outline" className="border-primary/30 flex-1">
                  New Game
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 text-primary">Score</h2>
                <p className="text-4xl font-bold neon-text">{gameState.score}</p>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 text-secondary">Controls</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Move:</span>
                    <span>WASD / Arrow Keys</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pause:</span>
                    <span>Space</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 text-accent">Tips</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Speed increases every 50 points</li>
                  <li>• Plan your path ahead</li>
                  <li>• Use the edges strategically</li>
                  {gameMode === 'walls' && <li>• Stay away from walls!</li>}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Game;
