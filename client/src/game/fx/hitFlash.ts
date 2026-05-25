/**
 * Draws a red flash overlay centered at (x, y).
 * @param t - normalized intensity from 1.0 (just hit) to 0.0 (faded out)
 */
export function drawHitFlash(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  t: number
) {
  if (t <= 0) return;
  ctx.save();
  ctx.globalAlpha = 0.6 * t;
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
