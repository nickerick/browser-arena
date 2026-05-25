import {
  WORLD_W,
  WORLD_H,
  PROJECTILE_RADIUS,
  PROJECTILE_SPEED,
  PROJECTILE_LIFETIME,
} from '@browser-arena/shared';

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
}

export class ProjectileSystem {
  private projectiles: Projectile[] = [];

  fire(x: number, y: number, dirX: number, dirY: number) {
    this.projectiles.push({
      x,
      y,
      vx: dirX * PROJECTILE_SPEED,
      vy: dirY * PROJECTILE_SPEED,
      age: 0,
    });
  }

  update(dt: number) {
    for (const p of this.projectiles) {
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
    this.projectiles = this.projectiles.filter((p) => p.age < PROJECTILE_LIFETIME);
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.projectiles) {
      const fade = 1 - p.age / PROJECTILE_LIFETIME;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.shadowColor = '#ffe066';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.arc(p.x, p.y, PROJECTILE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
