import { WORLD_W, WORLD_H } from '@browser-arena/shared';

/** Draws the background for the current map. */
export class Arena {
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  }
}
