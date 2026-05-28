import { PLAYER_RADIUS } from '@browser-arena/shared';

/** Draws a heart shape centered at (x, y). Placeholder until sprites are implemented. */
export function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const r = PLAYER_RADIUS;
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, r * 0.35);
  ctx.bezierCurveTo(r * 0.5, r * 0.1, r, -r * 0.35, r * 0.5, -r * 0.65);
  ctx.bezierCurveTo(r * 0.2, -r * 0.9, 0, -r * 0.7, 0, -r * 0.35);
  ctx.bezierCurveTo(0, -r * 0.7, -r * 0.2, -r * 0.9, -r * 0.5, -r * 0.65);
  ctx.bezierCurveTo(-r, -r * 0.35, -r * 0.5, r * 0.1, 0, r * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
