import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSnakeGame } from '@/hooks/useSnakeGame';

describe('useSnakeGame Hook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSnakeGame('pass-through'));

    expect(result.current.gameState.snake).toHaveLength(1);
    expect(result.current.gameState.score).toBe(0);
    expect(result.current.gameState.isGameOver).toBe(false);
    expect(result.current.gameState.isPaused).toBe(false);
  });

  it('should change direction', () => {
    const { result } = renderHook(() => useSnakeGame('pass-through'));

    act(() => {
      result.current.changeDirection('UP');
    });

    expect(result.current.gameState.direction).toBe('UP');
  });

  it('should not allow opposite direction change', () => {
    const { result } = renderHook(() => useSnakeGame('pass-through'));

    act(() => {
      result.current.changeDirection('RIGHT');
    });

    act(() => {
      result.current.changeDirection('LEFT');
    });

    // Should still be RIGHT as LEFT is opposite
    expect(result.current.gameState.direction).toBe('RIGHT');
  });

  it('should reset game state', () => {
    const { result } = renderHook(() => useSnakeGame('pass-through'));

    act(() => {
      result.current.changeDirection('UP');
    });

    act(() => {
      result.current.resetGame();
    });

    expect(result.current.gameState.score).toBe(0);
    expect(result.current.gameState.direction).toBe('RIGHT');
  });

  it('should toggle pause', () => {
    const { result } = renderHook(() => useSnakeGame('pass-through'));

    act(() => {
      result.current.togglePause();
    });

    expect(result.current.gameState.isPaused).toBe(true);

    act(() => {
      result.current.togglePause();
    });

    expect(result.current.gameState.isPaused).toBe(false);
  });

  it('should handle pass-through mode boundaries', async () => {
    const { result } = renderHook(() => useSnakeGame('pass-through'));

    // This test verifies the hook initializes correctly for pass-through mode
    expect(result.current.GRID_SIZE).toBe(20);
    expect(result.current.gameState.snake[0].x).toBeGreaterThanOrEqual(0);
    expect(result.current.gameState.snake[0].x).toBeLessThan(20);
  });

  it('should handle walls mode', () => {
    const { result } = renderHook(() => useSnakeGame('walls'));

    // Verify walls mode initialization
    expect(result.current.gameState.isGameOver).toBe(false);
  });
});
