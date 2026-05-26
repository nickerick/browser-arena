import { TICK_RATE, PLAYER_RADIUS } from '@browser-arena/shared';
import { drawHitFlash } from '../fx/hitFlash';

const SERVER_TICK_S = 1 / TICK_RATE;

export class RemotePlayer {
  readonly id: string;

  /** Current interpolated world-space position. */
  x: number;
  y: number;

  /** Interpolation source position (where we were at the last server update). */
  private fromX: number;
  private fromY: number;
  /** Interpolation target position (where the server says we should be). */
  private toX: number;
  private toY: number;
  /** Normalized interpolation progress from 0 (just received update) to 1 (fully arrived). */
  private lerpT = 1;

  /** Seconds remaining on the hit flash overlay. Counts down from 0.3 to 0 after taking damage. */
  private hitFlashTime = 0;

  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.fromX = x;
    this.fromY = y;
    this.toX = x;
    this.toY = y;
  }

  takeDamage() {
    this.hitFlashTime = 0.3;
  }

  /** Store the latest authoritative state from the server. Applied during the next update(). */
  setServerState(x: number, y: number) {
    this.fromX = this.x;
    this.fromY = this.y;
    this.toX = x;
    this.toY = y;
    this.lerpT = 0;
  }

  /** Advance interpolation and timers one frame. */
  update(dt: number) {
    if (this.hitFlashTime > 0) this.hitFlashTime -= dt;

    this.lerpT = Math.min(1, this.lerpT + dt / SERVER_TICK_S);
    this.x = this.fromX + (this.toX - this.fromX) * this.lerpT;
    this.y = this.fromY + (this.toY - this.fromY) * this.lerpT;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#ff69b4';
    drawHeart(ctx, this.x, this.y);
    drawHitFlash(ctx, this.x, this.y, PLAYER_RADIUS, this.hitFlashTime / 0.3);
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Babbi', this.x, this.y - PLAYER_RADIUS - 6);
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
