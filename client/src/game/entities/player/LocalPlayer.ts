import { WORLD_W, WORLD_H, PLAYER_RADIUS, PLAYER_SPEED, MAX_HP } from '@browser-arena/shared';
import { drawHitFlash } from '../../fx/hitFlash';
import { drawHeart, drawHpBar } from '../../fx/drawHeart';
import { drawBarrel } from '../../fx/drawBarrel';
import { Sprite } from '../../sprites/Sprite';
import { PLAYER_SPRITE_CONFIG } from '../../sprites/player';
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

  /** Animated sprite sheet for the player character. */
  private sprite: Sprite;

  /** Latest authoritative position received from the server. Reconciled against in update(). */
  private serverX: number | null = null;
  private serverY: number | null = null;

  constructor(x: number, y: number) {
    super(x, y);
    this.sprite = new Sprite(PLAYER_SPRITE_CONFIG);
  }

  /** True for exactly one frame when the fire key is first pressed. */
  get fireIntent() {
    return this._fireIntent;
  }

  /** Advance player state one frame. */
  update(
    dt: number,
    input: InputState = {
      moveX: 0,
      moveY: 0,
      moving: false,
      fire: false,
      worldMouseX: 0,
      worldMouseY: 0,
    }
  ) {
    const { moveX, moveY, moving, fire, worldMouseX, worldMouseY } = input;

    // update aim direction from mouse position in world space
    const aimDx = worldMouseX - this.x;
    const aimDy = worldMouseY - this.y;
    const aimLen = Math.sqrt(aimDx * aimDx + aimDy * aimDy);
    if (aimLen > 0) {
      this.dirX = aimDx / aimLen;
      this.dirY = aimDy / aimLen;
    }

    if (this.hitFlashTime > 0) this.hitFlashTime -= dt;

    if (moving) {
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
        this.x += dx * 0.05;
        this.y += dy * 0.05;
      }
    }

    // leading-edge detection — true only on the frame the key is first pressed
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
    drawBarrel(ctx, this.x, this.y, this.dirX, this.dirY);
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
    drawHpBar(ctx, this.x, this.y - this.sprite.halfH - 24, this.hp, MAX_HP);
  }
}
