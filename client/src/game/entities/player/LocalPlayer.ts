import { WORLD_W, WORLD_H, PLAYER_RADIUS, PLAYER_SPEED, MAX_HP } from '@browser-arena/shared';
import { drawHitFlash } from '../../fx/hitFlash';
import { drawHpBar } from '../../fx/drawHeart';
import { drawEgg } from './egg';
import type { InputState } from '../../InputHandler';
import { Player } from './Player';

/** The local player entity, controlled by keyboard input with client-side prediction. */
export class LocalPlayer extends Player {
  /** Normalized last movement direction, retained as the fire direction when the player is idle. */
  dirX = 0;
  dirY = -1;

  /** Whether the fire key was held on the previous frame, used to detect the leading edge of a press. */
  private prevSpaceDown = false;

  /** Set to true for exactly one frame when the fire key is first pressed. Read via the fireIntent getter. */
  private _fireIntent = false;

  /** Walk cycle phase in radians, drives foot animation. */
  private walkPhase = 0;

  /** Latest authoritative position received from the server. Reconciled against in update(). */
  private serverX: number | null = null;
  private serverY: number | null = null;

  constructor(x: number, y: number) {
    super(x, y);
  }

  /** True for exactly one frame when the fire key is first pressed. */
  get fireIntent() {
    return this._fireIntent;
  }

  /** Advance player state one frame. */
  update(dt: number, input: InputState = { moveX: 0, moveY: 0, moving: false, fire: false }) {
    const { moveX, moveY, moving, fire } = input;

    if (this.hitFlashTime > 0) this.hitFlashTime -= dt;

    if (moving) {
      const len = Math.sqrt(moveX * moveX + moveY * moveY);
      this.dirX = moveX / len;
      this.dirY = moveY / len;
      this.walkPhase += dt * 8;
    }

    const speed = PLAYER_SPEED * dt;
    this.x = Math.max(PLAYER_RADIUS, Math.min(WORLD_W - PLAYER_RADIUS, this.x + moveX * speed));
    this.y = Math.max(PLAYER_RADIUS, Math.min(WORLD_H - PLAYER_RADIUS, this.y + moveY * speed));

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

    this._fireIntent = fire && !this.prevSpaceDown;
    this.prevSpaceDown = fire;
  }

  /** Store the latest authoritative state from the server. Position is reconciled in update(); HP is applied directly. */
  setServerState(x: number, y: number, hp: number) {
    this.serverX = x;
    this.serverY = y;
    this.hp = hp;
  }

  /** Resets position and state without recreating the sprite (avoids image reload). */
  reset(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.hp = MAX_HP;
    this.dirX = 0;
    this.dirY = -1;
    this.prevSpaceDown = false;
    this._fireIntent = false;
    this.serverX = null;
    this.serverY = null;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const aimAngle = Math.atan2(this.dirY, this.dirX);
    drawEgg(ctx, this.x, this.y, aimAngle, this.walkPhase, '#4ecca3');
    drawHitFlash(ctx, this.x, this.y, PLAYER_RADIUS, this.hitFlashTime / 0.3);
    drawHpBar(ctx, this.x, this.y - PLAYER_RADIUS * 1.4 - 14, this.hp, MAX_HP);
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('you', this.x, this.y - PLAYER_RADIUS * 1.4);
  }
}
