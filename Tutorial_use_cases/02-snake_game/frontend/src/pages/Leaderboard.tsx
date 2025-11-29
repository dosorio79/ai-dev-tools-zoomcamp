import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockApi, LeaderboardEntry } from '@/api/mockApi';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'all' | 'pass-through' | 'walls'>('all');
  const { user } = useAuth();

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      const data = await mockApi.leaderboard.getTopScores(
        mode === 'all' ? undefined : mode
      );
      setEntries(data);
      setLoading(false);
    };

    loadLeaderboard();
  }, [mode]);

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-primary';
    if (index === 1) return 'text-secondary';
    if (index === 2) return 'text-accent';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold neon-text mb-2">Leaderboard</h1>
            <p className="text-muted-foreground">
              Top players across all game modes
            </p>
          </div>

          <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All Modes</TabsTrigger>
              <TabsTrigger value="pass-through">Pass-Through</TabsTrigger>
              <TabsTrigger value="walls">Walls</TabsTrigger>
            </TabsList>

            <TabsContent value={mode} className="space-y-4">
              {loading ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Loading leaderboard...</p>
                </Card>
              ) : entries.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No scores yet. Be the first!</p>
                </Card>
              ) : (
                entries.map((entry, index) => (
                  <Card
                    key={entry.id}
                    className={`p-6 transition-all ${
                      user?.username === entry.username
                        ? 'border-primary/50 bg-primary/5'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div
                          className={`text-3xl font-bold ${getRankColor(index)} min-w-[3rem]`}
                        >
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-lg flex items-center gap-2">
                            {entry.username}
                            {user?.username === entry.username && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.mode === 'pass-through' ? '🔄 Pass-Through' : '⚡ Walls'} •{' '}
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold neon-text">{entry.score}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
