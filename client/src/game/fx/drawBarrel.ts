import { PLAYER_RADIUS } from '@browser-arena/shared';

const BARREL_LENGTH = 14;
const BARREL_WIDTH = 5;
const BARREL_OFFSET = PLAYER_RADIUS * 0.6;

/** Draws a small gun barrel extending from (x, y) in the direction (dirX, dirY). */
export function drawBarrel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dirX: number,
  dirY: number
) {
  const baseX = x + dirX * BARREL_OFFSET;
  const baseY = y + dirY * BARREL_OFFSET;
  const tipX = x + dirX * (BARREL_OFFSET + BARREL_LENGTH);
  const tipY = y + dirY * (BARREL_OFFSET + BARREL_LENGTH);

  ctx.save();
  ctx.lineCap = 'round';

  // dark outline drawn first, slightly wider
  ctx.strokeStyle = '#333';
  ctx.lineWidth = BARREL_WIDTH + 2;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  // barrel fill on top
  ctx.strokeStyle = '#aaa';
  ctx.lineWidth = BARREL_WIDTH;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  ctx.restore();
}
