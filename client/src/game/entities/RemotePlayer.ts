import { TICK_RATE, PLAYER_RADIUS } from '@browser-arena/shared';
import { drawHitFlash } from '../fx/hitFlash';
import { drawEgg } from './egg';

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
  /** Walk cycle phase in radians, drives foot animation. */
  private walkPhase = 0;
  /** Last movement direction, used to orient the barrel. */
  private dirX = 0;
  private dirY = -1;

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

  /** Called when the server sends a new authoritative position for this player. */
  moveTo(toX: number, toY: number) {
    this.fromX = this.x;
    this.fromY = this.y;
    this.toX = toX;
    this.toY = toY;
    this.lerpT = 0;
  }

  /** Advance interpolation and timers one frame. */
  update(dt: number) {
    if (this.hitFlashTime > 0) this.hitFlashTime -= dt;

    this.lerpT = Math.min(1, this.lerpT + dt / SERVER_TICK_S);
    const prevX = this.x;
    const prevY = this.y;
    this.x = this.fromX + (this.toX - this.fromX) * this.lerpT;
    this.y = this.fromY + (this.toY - this.fromY) * this.lerpT;

    const dx = this.x - prevX;
    const dy = this.y - prevY;
    const moving = dx * dx + dy * dy > 0.01;
    if (moving) {
      const len = Math.sqrt(dx * dx + dy * dy);
      this.dirX = dx / len;
      this.dirY = dy / len;
      this.walkPhase += dt * 8;
    }
  }

  draw(ctx: CanvasRenderingContext2D, name: string) {
    const aimAngle = Math.atan2(this.dirY, this.dirX);
    drawEgg(ctx, this.x, this.y, aimAngle, this.walkPhase, '#ff69b4');
    drawHitFlash(ctx, this.x, this.y, PLAYER_RADIUS, this.hitFlashTime / 0.3);
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(name, this.x, this.y - PLAYER_RADIUS * 1.4);
  }
}
