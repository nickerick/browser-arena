import { useEffect, useRef } from 'react';
import { Game } from '../game/Game';
import { socket } from '../api/socket';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = new Game(canvas);
    socket.connect(() => console.log('disconnected from server'));
    game.start();

    return () => {
      game.destroy();
      socket.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '70vh', outline: '2px solid red' }}
    />
  );
}
