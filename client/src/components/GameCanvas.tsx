import { useEffect, useRef } from 'react';
import { Game } from '../game/Game';
import { NetworkClient } from '../network/NetworkClient';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const network = new NetworkClient();
    const game = new Game(canvas, network);

    network.connect(
      (msg) => game.onServerMessage(msg),
      () => console.log('disconnected from server'),
    );

    game.start();

    return () => {
      game.destroy();
      network.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: 800, height: 500, border: '1px solid #333' }}
    />
  );
}
