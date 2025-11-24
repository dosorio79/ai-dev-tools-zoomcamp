// Centralized mock API for all backend interactions
// Easy to replace with real backend calls later

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  mode: 'pass-through' | 'walls';
  date: string;
}

export interface LiveGame {
  id: string;
  username: string;
  currentScore: number;
  mode: 'pass-through' | 'walls';
  startedAt: string;
}

// Mock data
let currentUser: User | null = null;

const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'SnakeMaster', score: 2500, mode: 'walls', date: '2024-01-20' },
  { id: '2', username: 'NeonRider', score: 2200, mode: 'walls', date: '2024-01-19' },
  { id: '3', username: 'CyberSnake', score: 1900, mode: 'pass-through', date: '2024-01-18' },
  { id: '4', username: 'PixelHunter', score: 1750, mode: 'walls', date: '2024-01-17' },
  { id: '5', username: 'ArcadeKing', score: 1600, mode: 'pass-through', date: '2024-01-16' },
  { id: '6', username: 'RetroGamer', score: 1450, mode: 'walls', date: '2024-01-15' },
  { id: '7', username: 'NeonDreams', score: 1300, mode: 'pass-through', date: '2024-01-14' },
  { id: '8', username: 'SnakeCharmer', score: 1150, mode: 'walls', date: '2024-01-13' },
];

const mockLiveGames: LiveGame[] = [
  { id: '1', username: 'SnakeMaster', currentScore: 450, mode: 'walls', startedAt: new Date().toISOString() },
  { id: '2', username: 'NeonRider', currentScore: 320, mode: 'pass-through', startedAt: new Date().toISOString() },
  { id: '3', username: 'CyberSnake', currentScore: 180, mode: 'walls', startedAt: new Date().toISOString() },
];

// Auth API
export const mockApi = {
  auth: {
    async login(email: string, password: string): Promise<{ user: User }> {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (password.length < 6) {
        throw new Error('Invalid credentials');
      }
      
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: email.split('@')[0],
        email,
      };
      
      currentUser = user;
      return { user };
    },

    async signup(email: string, username: string, password: string): Promise<{ user: User }> {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        email,
      };
      
      currentUser = user;
      return { user };
    },

    async logout(): Promise<void> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      currentUser = null;
    },

    getCurrentUser(): User | null {
      return currentUser;
    },
  },

  leaderboard: {
    async getTopScores(mode?: 'pass-through' | 'walls'): Promise<LeaderboardEntry[]> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      let filtered = [...mockLeaderboard];
      if (mode) {
        filtered = filtered.filter((entry) => entry.mode === mode);
      }
      
      return filtered.sort((a, b) => b.score - a.score);
    },

    async getUserScore(userId: string): Promise<LeaderboardEntry | null> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const entry = mockLeaderboard.find((e) => e.id === userId);
      return entry || null;
    },

    async submitScore(score: number, mode: 'pass-through' | 'walls'): Promise<void> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      if (currentUser) {
        mockLeaderboard.push({
          id: Math.random().toString(36).substr(2, 9),
          username: currentUser.username,
          score,
          mode,
          date: new Date().toISOString(),
        });
      }
    },
  },

  liveGames: {
    async getLiveGames(): Promise<LiveGame[]> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...mockLiveGames];
    },

    async getGameById(gameId: string): Promise<LiveGame | null> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockLiveGames.find((g) => g.id === gameId) || null;
    },
  },
};
