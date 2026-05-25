import type { ProjectileState } from '@browser-arena/shared';
import {
  PROJECTILE_RADIUS,
  PROJECTILE_SPEED,
  PROJECTILE_LIFETIME,
  WORLD_W,
  WORLD_H,
} from '@browser-arena/shared';

interface SimProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
}

export class ProjectileSystem {
  /** Client-predicted shots fired by the local player. */
  private local: SimProjectile[] = [];
  /** Server-confirmed remote projectiles, simulated locally between ticks. */
  private remote = new Map<string, SimProjectile>();

  /** Spawn a new client-predicted projectile from the local player. */
  fire(x: number, y: number, dirX: number, dirY: number) {
    this.local.push({ x, y, vx: dirX * PROJECTILE_SPEED, vy: dirY * PROJECTILE_SPEED, age: 0 });
  }

  /** Advance all projectile state one frame. */
  update(dt: number) {
    for (const p of this.local) advance(p, dt);
    this.local = this.local.filter((p) => p.age < PROJECTILE_LIFETIME);

    for (const p of this.remote.values()) advance(p, dt);
  }

  /** Immediately remove a projectile that the server confirmed as a hit. */
  removeHit(projectileId: string, shooterId: string, myId: string) {
    this.remote.delete(projectileId);
    if (shooterId === myId) this.local.shift();
  }

  /**
   * Reconcile tracked remote projectiles against server state.
   * New projectiles start simulating immediately; existing ones nudge toward
   * server position to correct drift; gone ones are removed.
   */
  updateRemote(serverProjectiles: ProjectileState[], myId: string) {
    const serverIds = new Set<string>();

    for (const sp of serverProjectiles) {
      if (sp.ownerId === myId) continue;
      serverIds.add(sp.id);

      const tracked = this.remote.get(sp.id);
      if (!tracked) {
        this.remote.set(sp.id, { x: sp.x, y: sp.y, vx: sp.vx, vy: sp.vy, age: 0 });
      } else {
        const dx = sp.x - tracked.x;
        const dy = sp.y - tracked.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 60) {
          tracked.x = sp.x;
          tracked.y = sp.y;
        } else {
          tracked.x += dx * 0.3;
          tracked.y += dy * 0.3;
        }
        tracked.vx = sp.vx;
        tracked.vy = sp.vy;
      }
    }

    for (const id of this.remote.keys()) {
      if (!serverIds.has(id)) this.remote.delete(id);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.shadowColor = '#ffe066';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffe066';
    for (const p of this.local) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, PROJECTILE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const p of this.remote.values()) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, PROJECTILE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function advance(p: SimProjectile, dt: number) {
  p.age += dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  if (p.x - PROJECTILE_RADIUS < 0) {
    p.x = PROJECTILE_RADIUS;
    p.vx = Math.abs(p.vx);
  }
  if (p.x + PROJECTILE_RADIUS > WORLD_W) {
    p.x = WORLD_W - PROJECTILE_RADIUS;
    p.vx = -Math.abs(p.vx);
  }
  if (p.y - PROJECTILE_RADIUS < 0) {
    p.y = PROJECTILE_RADIUS;
    p.vy = Math.abs(p.vy);
  }
  if (p.y + PROJECTILE_RADIUS > WORLD_H) {
    p.y = WORLD_H - PROJECTILE_RADIUS;
    p.vy = -Math.abs(p.vy);
  }
}
