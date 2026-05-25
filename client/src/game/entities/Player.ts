import { WORLD_W, WORLD_H, PLAYER_RADIUS, PLAYER_SPEED } from '@browser-arena/shared';
import { Sprite } from '../Sprite';
import { PLAYER_SPRITE_CONFIG } from '../sprites/player';
import type { InputState } from '../InputHandler';

export class Player {
  /** World-space position. */
  x: number;
  y: number;

  /** Normalized last movement direction, retained as the fire direction when idle. */
  dirX = 0;
  dirY = -1;

  private prevSpaceDown = false;
  private _fireIntent = false;
  private sprite: Sprite;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sprite = new Sprite(PLAYER_SPRITE_CONFIG);
  }

  /** True for exactly one frame when the fire key is first pressed. */
  get fireIntent() { return this._fireIntent; }

  /**
   * Applies input to movement and sprite animation, and detects fire intent.
   * Call once per frame before reading fireIntent.
   */
  update(dt: number, { dx, dy, moving, fire }: InputState) {
    if (moving) {
      const len = Math.sqrt(dx * dx + dy * dy);
      this.dirX = dx / len;
      this.dirY = dy / len;
      this.sprite.setFacing(
        Math.abs(dx) >= Math.abs(dy)
          ? dx < 0 ? 'left' : 'right'
          : dy < 0 ? 'up' : 'down'
      );
    }

    this.sprite.update(dt, moving);

    const speed = PLAYER_SPEED * dt;
    this.x = Math.max(PLAYER_RADIUS, Math.min(WORLD_W - PLAYER_RADIUS, this.x + dx * speed));
    this.y = Math.max(PLAYER_RADIUS, Math.min(WORLD_H - PLAYER_RADIUS, this.y + dy * speed));

    this._fireIntent = fire && !this.prevSpaceDown;
    this.prevSpaceDown = fire;
  }

  /**
   * Soft-corrects local position toward the server-authoritative position.
   * Snaps immediately if the gap is large (e.g. teleport), otherwise nudges
   * gently while moving to avoid visible rubberbanding when stopped.
   */
  reconcile(serverX: number, serverY: number, isMoving: boolean) {
    const dx = serverX - this.x;
    const dy = serverY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 80) {
      this.x = serverX;
      this.y = serverY;
    } else if (dist > 4 && isMoving) {
      this.x += dx * 0.2;
      this.y += dy * 0.2;
    }
  }

  /** Resets position and state without recreating the sprite (avoids image reload). */
  reset(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.dirX = 0;
    this.dirY = -1;
    this.prevSpaceDown = false;
    this._fireIntent = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const drawn = this.sprite.draw(ctx, this.x, this.y);
    if (!drawn) {
      ctx.fillStyle = '#4ecca3';
      drawHeart(ctx, this.x, this.y);
    }
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('you', this.x, this.y - this.sprite.halfH - 6);
  }
}

/** Draws a heart shape centered at (x, y). Placeholder until sprites load. */
function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const r = PLAYER_RADIUS;
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, r * 0.35);
  ctx.bezierCurveTo(r * 0.5, r * 0.1, r, -r * 0.35, r * 0.5, -r * 0.65);
  ctx.bezierCurveTo(r * 0.2, -r * 0.9, 0, -r * 0.7, 0, -r * 0.35);
  ctx.bezierCurveTo(0, -r * 0.7, -r * 0.2, -r * 0.9, -r * 0.5, -r * 0.65);
  ctx.bezierCurveTo(-r, -r * 0.35, -r * 0.5, r * 0.1, 0, r * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
