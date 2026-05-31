import { WORLD_W, WORLD_H, PLAYER_RADIUS, PLAYER_SPEED } from '@browser-arena/shared';
import { drawHitFlash } from '../fx/hitFlash';
import { drawEgg } from './egg';
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
  /** Seconds remaining on the hit flash overlay. Counts down from 0.3 to 0 after taking damage. */
  private hitFlashTime = 0;
  /** Walk cycle phase in radians, drives foot animation. */
  private walkPhase = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
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
      this.walkPhase += dt * 8;
    }

    const speed = PLAYER_SPEED * dt;
    this.x = Math.max(PLAYER_RADIUS, Math.min(WORLD_W - PLAYER_RADIUS, this.x + moveX * speed));
    this.y = Math.max(PLAYER_RADIUS, Math.min(WORLD_H - PLAYER_RADIUS, this.y + moveY * speed));

    // leading-edge detection — true only on the frame the key is first pressed
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
    const aimAngle = Math.atan2(this.dirY, this.dirX);
    drawEgg(ctx, this.x, this.y, aimAngle, this.walkPhase, '#4ecca3');
    drawHitFlash(ctx, this.x, this.y, PLAYER_RADIUS, this.hitFlashTime / 0.3);
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('you', this.x, this.y - PLAYER_RADIUS * 1.4);
  }
}
