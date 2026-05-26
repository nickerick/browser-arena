import { TICK_RATE, PROJECTILE_RADIUS, WORLD_W, WORLD_H } from '@browser-arena/shared';

const SERVER_TICK_S = 1 / TICK_RATE;

/** A server-confirmed remote projectile, simulated locally between server ticks. */
export class Projectile {
  x: number;
  y: number;
  private vx: number;
  private vy: number;
  private age = 0;

  /** Interpolation source position (where we were at the last server update). */
  private fromX: number;
  private fromY: number;
  /** Interpolation target position (where the server says we should be). */
  private toX: number;
  private toY: number;
  /** Normalized interpolation progress from 0 (just received update) to 1 (fully arrived). */
  private lerpT = 1;

  constructor(x: number, y: number, vx: number, vy: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.fromX = x;
    this.fromY = y;
    this.toX = x;
    this.toY = y;
  }

  /** Store the latest authoritative state from the server. Applied during the next update(). */
  setServerState(x: number, y: number, vx: number, vy: number) {
    this.fromX = this.x;
    this.fromY = this.y;
    this.toX = x;
    this.toY = y;
    this.lerpT = 0;
    this.vx = vx;
    this.vy = vy;
  }

  /** Advance projectile state one frame. */
  update(dt: number) {
    // interpolate toward server position
    this.lerpT = Math.min(1, this.lerpT + dt / SERVER_TICK_S);
    this.x = this.fromX + (this.toX - this.fromX) * this.lerpT;
    this.y = this.fromY + (this.toY - this.fromY) * this.lerpT;

    // advance simulation forward from reconciled position
    this.age += dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.x - PROJECTILE_RADIUS < 0) { this.x = PROJECTILE_RADIUS; this.vx = Math.abs(this.vx); }
    if (this.x + PROJECTILE_RADIUS > WORLD_W) { this.x = WORLD_W - PROJECTILE_RADIUS; this.vx = -Math.abs(this.vx); }
    if (this.y - PROJECTILE_RADIUS < 0) { this.y = PROJECTILE_RADIUS; this.vy = Math.abs(this.vy); }
    if (this.y + PROJECTILE_RADIUS > WORLD_H) { this.y = WORLD_H - PROJECTILE_RADIUS; this.vy = -Math.abs(this.vy); }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, PROJECTILE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}
