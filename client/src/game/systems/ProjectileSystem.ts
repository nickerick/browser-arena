import type { ProjectileState } from '@browser-arena/shared';

import { LocalProjectile } from '../entities/projectile/LocalProjectile';
import { RemoteProjectile } from '../entities/projectile/RemoteProjectile';

/** Manages all in-flight projectile state. */
export class ProjectileSystem {
  private local: LocalProjectile[] = [];
  private remote = new Map<string, RemoteProjectile>();

  /** Spawn a new client-predicted projectile from the local player. */
  fire(x: number, y: number, dirX: number, dirY: number) {
    this.local.push(new LocalProjectile(x, y, dirX, dirY));
  }

  /** Route incoming server state to each remote projectile entity. */
  applyServerUpdate(projectiles: ProjectileState[], myId: string) {
    const serverIds = new Set<string>();

    for (const sp of projectiles) {
      if (sp.ownerId === myId) continue;
      serverIds.add(sp.id);
      const existing = this.remote.get(sp.id);
      if (existing) {
        existing.setServerState(sp.x, sp.y, sp.vx, sp.vy);
      } else {
        this.remote.set(sp.id, new RemoteProjectile(sp.x, sp.y, sp.vx, sp.vy));
      }
    }

    for (const id of this.remote.keys()) {
      if (!serverIds.has(id)) this.remote.delete(id);
    }
  }

  /** Immediately remove a projectile the server confirmed as a hit. */
  removeHit(projectileId: string, shooterId: string, myId: string) {
    this.remote.delete(projectileId);
    if (shooterId === myId) this.local.shift();
  }

  /** Advance all projectile state one frame. */
  update(dt: number) {
    for (const p of this.local) p.update(dt);
    this.local = this.local.filter((p) => !p.expired);
    for (const p of this.remote.values()) p.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.shadowColor = '#ffe066';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffe066';
    for (const p of this.local) p.draw(ctx);
    for (const p of this.remote.values()) p.draw(ctx);
    ctx.restore();
  }
}
