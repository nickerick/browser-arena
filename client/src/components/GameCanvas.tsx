import { useEffect, useRef } from 'react';
import { Game } from '../game/Game';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = new Game(canvas);
    game.start();

    return () => game.destroy();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: 800, height: 500, border: '1px solid #333' }}
    />
  );
}
