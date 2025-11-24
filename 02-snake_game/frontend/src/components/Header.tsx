import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold neon-text">CYBER SNAKE</h1>
          </Link>

          <nav className="flex items-center gap-4">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/leaderboard" className="text-foreground hover:text-primary transition-colors">
              Leaderboard
            </Link>
            <Link to="/watch" className="text-foreground hover:text-primary transition-colors">
              Watch
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, <span className="text-primary font-semibold">{user.username}</span>
                </span>
                <Button variant="outline" onClick={logout} className="border-primary/30">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" className="border-primary/30">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="game-button">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
