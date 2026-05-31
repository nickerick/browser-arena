import { TICK_RATE, PLAYER_RADIUS, MAX_HP } from '@browser-arena/shared';
import { drawHitFlash } from '../../fx/hitFlash';
import { drawHeart, drawHpBar } from '../../fx/drawHeart';
import { Player } from './Player';

const SERVER_TICK_S = 1 / TICK_RATE;

/** A remote player entity, interpolated between server ticks. */
export class RemotePlayer extends Player {
  readonly id: string;

  /** Interpolation source position (where we were at the last server update). */
  private fromX: number;
  private fromY: number;
  /** Interpolation target position (where the server says we should be). */
  private toX: number;
  private toY: number;
  /** Normalized interpolation progress from 0 (just received update) to 1 (fully arrived). */
  private lerpT = 1;

  constructor(id: string, x: number, y: number) {
    super(x, y);
    this.id = id;
    this.fromX = x;
    this.fromY = y;
    this.toX = x;
    this.toY = y;
  }

  /** Store the latest authoritative state from the server. Applied during the next update(). */
  setServerState(x: number, y: number, hp: number) {
    this.fromX = this.x;
    this.fromY = this.y;
    this.toX = x;
    this.toY = y;
    this.lerpT = 0;
    this.hp = hp;
  }

  /** Advance interpolation and timers one frame. */
  update(dt: number) {
    if (this.hitFlashTime > 0) this.hitFlashTime -= dt;

    this.lerpT = Math.min(1, this.lerpT + dt / SERVER_TICK_S);
    this.x = this.fromX + (this.toX - this.fromX) * this.lerpT;
    this.y = this.fromY + (this.toY - this.fromY) * this.lerpT;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#ff69b4';
    drawHeart(ctx, this.x, this.y);
    drawHitFlash(ctx, this.x, this.y, PLAYER_RADIUS, this.hitFlashTime / 0.3);
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Babbi', this.x, this.y - PLAYER_RADIUS - 6);
    drawHpBar(ctx, this.x, this.y - PLAYER_RADIUS - 24, this.hp, MAX_HP);
  }
}
