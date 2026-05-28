import { PROJECTILE_RADIUS, WORLD_W, WORLD_H } from '@browser-arena/shared';
import type { Entity } from '../Entity';

/** Abstract base class for all projectile entities. Owns shared physics and the draw contract. */
export abstract class Projectile implements Entity {
  x: number;
  y: number;
  protected vx: number;
  protected vy: number;
  protected age = 0;

  constructor(x: number, y: number, vx: number, vy: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }

  /** Advance velocity integration and wall bouncing one frame. */
  protected advancePhysics(dt: number) {
    this.age += dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.x - PROJECTILE_RADIUS < 0) { this.x = PROJECTILE_RADIUS; this.vx = Math.abs(this.vx); }
    if (this.x + PROJECTILE_RADIUS > WORLD_W) { this.x = WORLD_W - PROJECTILE_RADIUS; this.vx = -Math.abs(this.vx); }
    if (this.y - PROJECTILE_RADIUS < 0) { this.y = PROJECTILE_RADIUS; this.vy = Math.abs(this.vy); }
    if (this.y + PROJECTILE_RADIUS > WORLD_H) { this.y = WORLD_H - PROJECTILE_RADIUS; this.vy = -Math.abs(this.vy); }
  }

  abstract update(dt: number): void;

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, PROJECTILE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}
