import { describe, it, expect, beforeEach } from 'vitest';
import { mockApi } from '@/api/mockApi';

describe('Mock API - Auth', () => {
  beforeEach(async () => {
    await mockApi.auth.logout();
  });

  it('should login with valid credentials', async () => {
    const result = await mockApi.auth.login('test@example.com', 'password123');
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.username).toBe('test');
  });

  it('should reject login with short password', async () => {
    await expect(mockApi.auth.login('test@example.com', '123')).rejects.toThrow();
  });

  it('should signup with valid data', async () => {
    const result = await mockApi.auth.signup('new@example.com', 'newuser', 'password123');
    expect(result.user).toBeDefined();
    expect(result.user.username).toBe('newuser');
  });

  it('should get current user after login', async () => {
    await mockApi.auth.login('test@example.com', 'password123');
    const user = mockApi.auth.getCurrentUser();
    expect(user).not.toBeNull();
    expect(user?.email).toBe('test@example.com');
  });

  it('should clear user after logout', async () => {
    await mockApi.auth.login('test@example.com', 'password123');
    await mockApi.auth.logout();
    const user = mockApi.auth.getCurrentUser();
    expect(user).toBeNull();
  });
});

describe('Mock API - Leaderboard', () => {
  it('should get top scores', async () => {
    const scores = await mockApi.leaderboard.getTopScores();
    expect(scores).toBeDefined();
    expect(Array.isArray(scores)).toBe(true);
    expect(scores.length).toBeGreaterThan(0);
  });

  it('should filter scores by mode', async () => {
    const wallsScores = await mockApi.leaderboard.getTopScores('walls');
    expect(wallsScores.every((s) => s.mode === 'walls')).toBe(true);
  });

  it('should submit score when logged in', async () => {
    await mockApi.auth.login('test@example.com', 'password123');
    await expect(mockApi.leaderboard.submitScore(100, 'walls')).resolves.not.toThrow();
  });
});

describe('Mock API - Live Games', () => {
  it('should get live games', async () => {
    const games = await mockApi.liveGames.getLiveGames();
    expect(games).toBeDefined();
    expect(Array.isArray(games)).toBe(true);
  });

  it('should get game by id', async () => {
    const games = await mockApi.liveGames.getLiveGames();
    if (games.length > 0) {
      const game = await mockApi.liveGames.getGameById(games[0].id);
      expect(game).toBeDefined();
      expect(game?.id).toBe(games[0].id);
    }
  });
});
