import { TICK_RATE, PLAYER_RADIUS } from '@browser-arena/shared';
import { drawHitFlash } from '../fx/hitFlash';

const SERVER_TICK_MS = 1000 / TICK_RATE;

export class RemotePlayer {
  readonly id: string;

  private fromX: number;
  private fromY: number;
  private toX: number;
  private toY: number;
  /** performance.now() timestamp of the last server update, used for interpolation. */
  private lastUpdateAt: number;

  private hitAt: number | null = null;

  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.fromX = x;
    this.fromY = y;
    this.toX = x;
    this.toY = y;
    this.lastUpdateAt = performance.now();
  }

  takeDamage() {
    this.hitAt = performance.now();
  }

  /** Called when the server sends a new authoritative position for this player. */
  moveTo(toX: number, toY: number) {
    const { x, y } = this.pos;
    this.fromX = x;
    this.fromY = y;
    this.toX = toX;
    this.toY = toY;
    this.lastUpdateAt = performance.now();
  }

  /** Current interpolated position between the last two server updates. */
  get pos(): { x: number; y: number } {
    const t = Math.min(1, (performance.now() - this.lastUpdateAt) / SERVER_TICK_MS);
    return {
      x: this.fromX + (this.toX - this.fromX) * t,
      y: this.fromY + (this.toY - this.fromY) * t,
    };
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y } = this.pos;
    ctx.fillStyle = '#ff69b4';
    drawHeart(ctx, x, y);
    if (this.hitAt !== null) {
      const elapsed = performance.now() - this.hitAt;
      const HIT_FLASH_MS = 300;
      if (elapsed < HIT_FLASH_MS) {
        drawHitFlash(ctx, x, y, PLAYER_RADIUS, 1 - elapsed / HIT_FLASH_MS);
      } else {
        this.hitAt = null;
      }
    }
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Babbi', x, y - PLAYER_RADIUS - 6);
  }
}

/** Draws a heart shape centered at (x, y). Placeholder until remote sprites are implemented. */
function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number) {
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
