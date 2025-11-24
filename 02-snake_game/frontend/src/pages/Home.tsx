import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold neon-text mb-4">
              CYBER SNAKE
            </h1>
            <p className="text-xl text-muted-foreground">
              Enter the neon grid. Master the controls. Dominate the leaderboard.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link to="/game/pass-through">
              <Card className="p-8 hover:border-primary/50 transition-all hover:shadow-neon cursor-pointer group">
                <div className="space-y-4">
                  <div className="text-4xl">🔄</div>
                  <h2 className="text-2xl font-bold text-primary group-hover:neon-text">
                    Pass-Through Mode
                  </h2>
                  <p className="text-muted-foreground">
                    No boundaries. Wrap around the edges. Perfect for beginners.
                  </p>
                  <Button className="game-button w-full mt-4">
                    Play Now
                  </Button>
                </div>
              </Card>
            </Link>

            <Link to="/game/walls">
              <Card className="p-8 hover:border-accent/50 transition-all hover:shadow-neon cursor-pointer group">
                <div className="space-y-4">
                  <div className="text-4xl">⚡</div>
                  <h2 className="text-2xl font-bold text-accent group-hover:neon-text">
                    Walls Mode
                  </h2>
                  <p className="text-muted-foreground">
                    Hit the wall, game over. Challenge mode for pros.
                  </p>
                  <Button className="game-button w-full mt-4 bg-accent hover:bg-accent/90">
                    Play Now
                  </Button>
                </div>
              </Card>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 bg-card/50">
              <h3 className="font-bold text-lg mb-2 text-primary">Global Leaderboard</h3>
              <p className="text-sm text-muted-foreground">
                Compete with players worldwide
              </p>
            </Card>
            <Card className="p-6 bg-card/50">
              <h3 className="font-bold text-lg mb-2 text-secondary">Live Watching</h3>
              <p className="text-sm text-muted-foreground">
                Watch other players in real-time
              </p>
            </Card>
            <Card className="p-6 bg-card/50">
              <h3 className="font-bold text-lg mb-2 text-accent">Two Game Modes</h3>
              <p className="text-sm text-muted-foreground">
                Choose your challenge level
              </p>
            </Card>
          </div>

          <div className="pt-8">
            <p className="text-sm text-muted-foreground">
              Use <kbd className="px-2 py-1 bg-muted rounded">WASD</kbd> or{' '}
              <kbd className="px-2 py-1 bg-muted rounded">Arrow Keys</kbd> to move •{' '}
              <kbd className="px-2 py-1 bg-muted rounded">Space</kbd> to pause
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
