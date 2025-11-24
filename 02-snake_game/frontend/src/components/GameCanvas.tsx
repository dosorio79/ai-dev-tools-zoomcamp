import React, { useEffect, useRef } from 'react';
import { GameState } from '@/hooks/useSnakeGame';

interface GameCanvasProps {
  gameState: GameState;
  gridSize: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, gridSize }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / gridSize;

    // Clear canvas
    ctx.fillStyle = 'hsl(240, 10%, 12%)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'hsl(240, 10%, 15%)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw food with glow
    ctx.fillStyle = 'hsl(280, 100%, 70%)';
    ctx.shadowColor = 'hsl(280, 100%, 70%)';
    ctx.shadowBlur = 15;
    ctx.fillRect(
      gameState.food.x * cellSize + 2,
      gameState.food.y * cellSize + 2,
      cellSize - 4,
      cellSize - 4
    );
    ctx.shadowBlur = 0;

    // Draw snake with gradient and glow
    gameState.snake.forEach((segment, index) => {
      const isHead = index === 0;
      
      if (isHead) {
        ctx.fillStyle = 'hsl(142, 76%, 56%)';
        ctx.shadowColor = 'hsl(142, 76%, 56%)';
        ctx.shadowBlur = 20;
      } else {
        const opacity = 1 - (index / gameState.snake.length) * 0.5;
        ctx.fillStyle = `hsla(142, 76%, 56%, ${opacity})`;
        ctx.shadowColor = 'hsl(142, 76%, 56%)';
        ctx.shadowBlur = 10;
      }

      ctx.fillRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
    });
    
    ctx.shadowBlur = 0;

    // Draw game over overlay
    if (gameState.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'hsl(142, 76%, 56%)';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'hsl(142, 76%, 56%)';
      ctx.shadowBlur = 20;
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
      
      ctx.font = '20px sans-serif';
      ctx.fillText(`Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 20);
      ctx.shadowBlur = 0;
    }

    // Draw pause overlay
    if (gameState.isPaused && !gameState.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'hsl(180, 100%, 50%)';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'hsl(180, 100%, 50%)';
      ctx.shadowBlur = 20;
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
      ctx.shadowBlur = 0;
    }
  }, [gameState, gridSize]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      className="border-2 border-primary/30 rounded-lg neon-glow"
    />
  );
};
