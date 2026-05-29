import {
  WORLD_W,
  WORLD_H,
  PROJECTILE_RADIUS,
  PROJECTILE_SPEED,
  PROJECTILE_LIFETIME,
  TICK_RATE,
  testHit,
} from '@browser-arena/shared';
import type { ConnectedPlayer } from './PlayerSystem';

const DT = 1 / TICK_RATE;

interface ServerProjectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
}

/** Emitted by tick() for each projectile that landed on a player this tick. */
export interface HitEvent {
  targetId: string;
  shooterId: string;
  projectileId: string;
}

/** Manages all in-flight projectile state. */
export class ProjectileSystem {
  private projectiles = new Map<string, ServerProjectile>();

  /** Spawn a new projectile from the given player's current position. */
  spawn(ownerId: string, x: number, y: number, dirX: number, dirY: number) {
    const id = crypto.randomUUID();
    this.projectiles.set(id, {
      id,
      ownerId,
      x,
      y,
      vx: dirX * PROJECTILE_SPEED,
      vy: dirY * PROJECTILE_SPEED,
      age: 0,
    });
  }

  /**
   * Advance all projectile physics one tick.
   * Returns hit events for any projectiles that connected with a player.
   */
  tick(players: ConnectedPlayer[]): HitEvent[] {
    const hits: HitEvent[] = [];

    for (const [id, p] of this.projectiles) {
      p.age += DT;
      p.x += p.vx * DT;
      p.y += p.vy * DT;

      if (p.x - PROJECTILE_RADIUS < 0) { p.x = PROJECTILE_RADIUS; p.vx = Math.abs(p.vx); }
      if (p.x + PROJECTILE_RADIUS > WORLD_W) { p.x = WORLD_W - PROJECTILE_RADIUS; p.vx = -Math.abs(p.vx); }
      if (p.y - PROJECTILE_RADIUS < 0) { p.y = PROJECTILE_RADIUS; p.vy = Math.abs(p.vy); }
      if (p.y + PROJECTILE_RADIUS > WORLD_H) { p.y = WORLD_H - PROJECTILE_RADIUS; p.vy = -Math.abs(p.vy); }

      if (p.age >= PROJECTILE_LIFETIME) {
        this.projectiles.delete(id);
        continue;
      }

      for (const player of players) {
        if (player.id === p.ownerId) continue;
        if (testHit(p.x, p.y, player.x, player.y)) {
          this.projectiles.delete(id);
          hits.push({ targetId: player.id, shooterId: p.ownerId, projectileId: id });
          break;
        }
      }
    }

    return hits;
  }

  /** Current projectile positions for inclusion in the state_update broadcast. */
  get snapshot() {
    return [...this.projectiles.values()].map(({ id, x, y, vx, vy, ownerId }) => ({
      id, x, y, vx, vy, ownerId,
    }));
  }
}
