const RADIUS = 5;
const SPEED = 550;
const LIFETIME = 2.5;

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
    this.projectiles.push({ x, y, vx: dirX * SPEED, vy: dirY * SPEED, age: 0 });
  }

  update(dt: number, worldW: number, worldH: number) {
    for (const p of this.projectiles) {
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x - RADIUS < 0) { p.x = RADIUS; p.vx = Math.abs(p.vx); }
      if (p.x + RADIUS > worldW) { p.x = worldW - RADIUS; p.vx = -Math.abs(p.vx); }
      if (p.y - RADIUS < 0) { p.y = RADIUS; p.vy = Math.abs(p.vy); }
      if (p.y + RADIUS > worldH) { p.y = worldH - RADIUS; p.vy = -Math.abs(p.vy); }
    }
    this.projectiles = this.projectiles.filter((p) => p.age < LIFETIME);
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.projectiles) {
      const fade = 1 - p.age / LIFETIME;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.shadowColor = '#ffe066';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.arc(p.x, p.y, RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
