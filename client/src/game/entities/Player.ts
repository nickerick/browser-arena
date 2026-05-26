import { WORLD_W, WORLD_H, PLAYER_RADIUS, PLAYER_SPEED } from '@browser-arena/shared';
import { drawHitFlash } from '../fx/hitFlash';
import { Sprite } from '../sprites/Sprite';
import { PLAYER_SPRITE_CONFIG } from '../sprites/player';
import type { InputState } from '../InputHandler';

export class Player {
  /** World-space position. */
  x: number;
  y: number;

  /** Normalized last movement direction, retained as the fire direction when idle. */
  dirX = 0;
  dirY = -1;

  /** Whether the fire key was held on the previous frame, used to detect the leading edge of a press. */
  private prevSpaceDown = false;
  /** Set to true for exactly one frame when the fire key is first pressed. Read via the fireIntent getter. */
  private _fireIntent = false;
  /** Animated sprite sheet for the player character. */
  private sprite: Sprite;
  /** Seconds remaining on the hit flash overlay. Counts down from 0.3 to 0 after taking damage. */
  private hitFlashTime = 0;
  /** Latest authoritative position received from the server. Reconciled against in update(). */
  private serverX: number | null = null;
  private serverY: number | null = null;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sprite = new Sprite(PLAYER_SPRITE_CONFIG);
  }

  /** True for exactly one frame when the fire key is first pressed. */
  get fireIntent() {
    return this._fireIntent;
  }

  takeDamage() {
    this.hitFlashTime = 0.3;
  }

  /** Advance player state one frame. */
  update(dt: number, { moveX, moveY, moving, fire }: InputState) {
    if (this.hitFlashTime > 0) this.hitFlashTime -= dt;

    if (moving) {
      // normalize direction and keep it as the fire direction when the player stops
      const len = Math.sqrt(moveX * moveX + moveY * moveY);
      this.dirX = moveX / len;
      this.dirY = moveY / len;
      this.sprite.setFacing(
        Math.abs(moveX) >= Math.abs(moveY)
          ? moveX < 0
            ? 'left'
            : 'right'
          : moveY < 0
            ? 'up'
            : 'down'
      );
    }

    this.sprite.update(dt, moving);

    const speed = PLAYER_SPEED * dt;
    this.x = Math.max(PLAYER_RADIUS, Math.min(WORLD_W - PLAYER_RADIUS, this.x + moveX * speed));
    this.y = Math.max(PLAYER_RADIUS, Math.min(WORLD_H - PLAYER_RADIUS, this.y + moveY * speed));

    // reconcile toward the latest server position if we have one
    if (this.serverX !== null && this.serverY !== null) {
      const dx = this.serverX - this.x;
      const dy = this.serverY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 80) {
        this.x = this.serverX;
        this.y = this.serverY;
      } else if (dist > 4 && moving) {
        this.x += dx * 0.2;
        this.y += dy * 0.2;
      }
    }

    // leading-edge detection — true only on the frame the key is first pressed
    this._fireIntent = fire && !this.prevSpaceDown;
    this.prevSpaceDown = fire;
  }

  /** Store the latest authoritative state from the server. Reconciled against in update(). */
  setServerState(x: number, y: number) {
    this.serverX = x;
    this.serverY = y;
  }

  /** Resets position and state without recreating the sprite (avoids image reload). */
  reset(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.dirX = 0;
    this.dirY = -1;
    this.prevSpaceDown = false;
    this._fireIntent = false;
    this.serverX = null;
    this.serverY = null;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const drawn = this.sprite.draw(ctx, this.x, this.y);
    if (!drawn) {
      ctx.fillStyle = '#4ecca3';
      drawHeart(ctx, this.x, this.y);
    }
    drawHitFlash(ctx, this.x, this.y, PLAYER_RADIUS, this.hitFlashTime / 0.3);
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
