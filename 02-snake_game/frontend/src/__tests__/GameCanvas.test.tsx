import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GameCanvas } from '@/components/GameCanvas';
import { GameState } from '@/hooks/useSnakeGame';

describe('GameCanvas Component', () => {
  const mockGameState: GameState = {
    snake: [
      { x: 10, y: 10 },
      { x: 10, y: 9 },
    ],
    food: { x: 15, y: 15 },
    direction: 'RIGHT',
    score: 0,
    isGameOver: false,
    isPaused: false,
  };

  it('should render canvas element', () => {
    const { container } = render(<GameCanvas gameState={mockGameState} gridSize={20} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should have correct canvas dimensions', () => {
    const { container } = render(<GameCanvas gameState={mockGameState} gridSize={20} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('width', '600');
    expect(canvas).toHaveAttribute('height', '600');
  });

  it('should render with game over state', () => {
    const gameOverState: GameState = {
      ...mockGameState,
      isGameOver: true,
      score: 150,
    };

    const { container } = render(<GameCanvas gameState={gameOverState} gridSize={20} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render with paused state', () => {
    const pausedState: GameState = {
      ...mockGameState,
      isPaused: true,
    };

    const { container } = render(<GameCanvas gameState={pausedState} gridSize={20} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
