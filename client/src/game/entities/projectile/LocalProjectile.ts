import { PROJECTILE_SPEED, PROJECTILE_LIFETIME } from '@browser-arena/shared';
import { Projectile } from './Projectile';

/** A client-predicted projectile fired by the local player. No server reconciliation — pure simulation. */
export class LocalProjectile extends Projectile {
  constructor(x: number, y: number, dirX: number, dirY: number) {
    super(x, y, dirX * PROJECTILE_SPEED, dirY * PROJECTILE_SPEED);
  }

  /** True once the projectile has exceeded its max lifetime and should be removed. */
  get expired() {
    return this.age >= PROJECTILE_LIFETIME;
  }

  /** Advance physics simulation one frame. */
  update(dt: number) {
    this.advancePhysics(dt);
  }
}
