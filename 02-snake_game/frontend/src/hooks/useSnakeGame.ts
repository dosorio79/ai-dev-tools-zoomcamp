import { useState, useEffect, useCallback, useRef } from 'react';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'pass-through' | 'walls';
export type Position = { x: number; y: number };

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
}

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

export const useSnakeGame = (mode: GameMode, onGameOver?: (score: number) => void) => {
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: 'RIGHT',
    score: 0,
    isGameOver: false,
    isPaused: false,
  });

  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const directionRef = useRef<Direction>('RIGHT');
  const lastDirectionRef = useRef<Direction>('RIGHT');

  const generateFood = useCallback((snake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setGameState({
      snake: initialSnake,
      food: generateFood(initialSnake),
      direction: 'RIGHT',
      score: 0,
      isGameOver: false,
      isPaused: false,
    });
    setSpeed(INITIAL_SPEED);
    directionRef.current = 'RIGHT';
    lastDirectionRef.current = 'RIGHT';
  }, [generateFood]);

  const changeDirection = useCallback((newDirection: Direction) => {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    if (opposites[newDirection] !== lastDirectionRef.current) {
      directionRef.current = newDirection;
    }
  }, []);

  const moveSnake = useCallback(() => {
    if (gameState.isGameOver || gameState.isPaused) return;

    setGameState((prev) => {
      const head = prev.snake[0];
      const direction = directionRef.current;
      lastDirectionRef.current = direction;

      const moves: Record<Direction, Position> = {
        UP: { x: head.x, y: head.y - 1 },
        DOWN: { x: head.x, y: head.y + 1 },
        LEFT: { x: head.x - 1, y: head.y },
        RIGHT: { x: head.x + 1, y: head.y },
      };

      let newHead = moves[direction];

      // Handle wall collision based on mode
      if (mode === 'pass-through') {
        // Wrap around
        if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
        if (newHead.x >= GRID_SIZE) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
        if (newHead.y >= GRID_SIZE) newHead.y = 0;
      } else {
        // walls mode - check collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          onGameOver?.(prev.score);
          return { ...prev, isGameOver: true };
        }
      }

      // Check self collision
      if (prev.snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        onGameOver?.(prev.score);
        return { ...prev, isGameOver: true };
      }

      const newSnake = [newHead, ...prev.snake];

      // Check food collision
      if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
        const newScore = prev.score + 10;
        const newFood = generateFood(newSnake);
        
        // Increase speed every 50 points
        if (newScore % 50 === 0) {
          setSpeed((s) => Math.max(50, s - 10));
        }

        return {
          ...prev,
          snake: newSnake,
          food: newFood,
          score: newScore,
          direction,
        };
      }

      // Remove tail
      newSnake.pop();

      return {
        ...prev,
        snake: newSnake,
        direction,
      };
    });
  }, [gameState.isGameOver, gameState.isPaused, mode, onGameOver, generateFood]);

  const togglePause = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  useEffect(() => {
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [moveSnake, speed]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.isGameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [changeDirection, togglePause, gameState.isGameOver]);

  return {
    gameState,
    changeDirection,
    resetGame,
    togglePause,
    GRID_SIZE,
  };
};
