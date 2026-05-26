import { PROJECTILE_RADIUS, PROJECTILE_SPEED, PROJECTILE_LIFETIME, WORLD_W, WORLD_H } from '@browser-arena/shared';

/** A client-predicted projectile fired by the local player. No server reconciliation — pure simulation. */
export class LocalProjectile {
  x: number;
  y: number;
  private vx: number;
  private vy: number;
  private age = 0;

  constructor(x: number, y: number, dirX: number, dirY: number) {
    this.x = x;
    this.y = y;
    this.vx = dirX * PROJECTILE_SPEED;
    this.vy = dirY * PROJECTILE_SPEED;
  }

  get expired() {
    return this.age >= PROJECTILE_LIFETIME;
  }

  /** Advance projectile state one frame. */
  update(dt: number) {
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
