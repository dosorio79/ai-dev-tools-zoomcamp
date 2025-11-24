import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameCanvas } from '@/components/GameCanvas';
import { mockApi, LiveGame } from '@/api/mockApi';
import { GameState } from '@/hooks/useSnakeGame';

const Watch: React.FC = () => {
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<LiveGame | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulated game state for watching
  const [simulatedState, setSimulatedState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: 'RIGHT',
    score: 0,
    isGameOver: false,
    isPaused: false,
  });

  useEffect(() => {
    const loadLiveGames = async () => {
      const games = await mockApi.liveGames.getLiveGames();
      setLiveGames(games);
      setLoading(false);
    };

    loadLiveGames();
  }, []);

  // Simulate game movement when watching
  useEffect(() => {
    if (!selectedGame) return;

    const interval = setInterval(() => {
      setSimulatedState((prev) => {
        const head = prev.snake[0];
        const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'] as const;
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];

        const moves = {
          UP: { x: head.x, y: head.y - 1 },
          DOWN: { x: head.x, y: head.y + 1 },
          LEFT: { x: head.x - 1, y: head.y },
          RIGHT: { x: head.x + 1, y: head.y },
        };

        let newHead = moves[randomDirection];

        // Wrap around
        if (newHead.x < 0) newHead.x = 19;
        if (newHead.x >= 20) newHead.x = 0;
        if (newHead.y < 0) newHead.y = 19;
        if (newHead.y >= 20) newHead.y = 0;

        const newSnake = [newHead, ...prev.snake];

        // Check food collision
        if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
          const newFood = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20),
          };
          return {
            ...prev,
            snake: newSnake,
            food: newFood,
            score: prev.score + 10,
          };
        }

        // Remove tail
        newSnake.pop();

        return {
          ...prev,
          snake: newSnake,
        };
      });
    }, 200);

    return () => clearInterval(interval);
  }, [selectedGame]);

  const handleWatchGame = (game: LiveGame) => {
    setSelectedGame(game);
    setSimulatedState({
      snake: [{ x: 10, y: 10 }],
      food: { x: 15, y: 15 },
      direction: 'RIGHT',
      score: game.currentScore,
      isGameOver: false,
      isPaused: false,
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold neon-text mb-2">Live Games</h1>
            <p className="text-muted-foreground">
              Watch other players compete in real-time
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr,300px] gap-6">
            <div>
              {selectedGame ? (
                <div className="space-y-4">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-primary">
                          {selectedGame.username}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedGame.mode === 'pass-through'
                            ? '🔄 Pass-Through Mode'
                            : '⚡ Walls Mode'}
                        </p>
                      </div>
                      <Button
                        onClick={() => setSelectedGame(null)}
                        variant="outline"
                        className="border-primary/30"
                      >
                        Stop Watching
                      </Button>
                    </div>
                  </Card>

                  <div className="flex justify-center">
                    <GameCanvas gameState={simulatedState} gridSize={20} />
                  </div>

                  <Card className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Current Score</p>
                        <p className="text-3xl font-bold neon-text">
                          {simulatedState.score}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Duration</p>
                        <p className="text-lg font-semibold">
                          {Math.floor(
                            (Date.now() - new Date(selectedGame.startedAt).getTime()) / 1000 / 60
                          )}{' '}
                          min
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground text-lg">
                    Select a game from the list to start watching
                  </p>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-secondary">Active Players</h2>
              {loading ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">Loading...</p>
                </Card>
              ) : liveGames.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">No live games</p>
                </Card>
              ) : (
                liveGames.map((game) => (
                  <Card
                    key={game.id}
                    className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
                      selectedGame?.id === game.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleWatchGame(game)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-bold">{game.username}</p>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                          LIVE
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {game.mode === 'pass-through' ? '🔄' : '⚡'} {game.currentScore} pts
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Watch;
