import { WORLD_W, WORLD_H } from '@browser-arena/shared';

const GRID_SIZE = 80;

/** Draws the background for the current map. */
export class Arena {
  draw(ctx: CanvasRenderingContext2D) {
    // background
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    // grid lines
    ctx.strokeStyle = '#1e1e30';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= WORLD_W; x += GRID_SIZE) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, WORLD_H);
    }
    for (let y = 0; y <= WORLD_H; y += GRID_SIZE) {
      ctx.moveTo(0, y);
      ctx.lineTo(WORLD_W, y);
    }
    ctx.stroke();
  }
}
