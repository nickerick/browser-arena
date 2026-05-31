import { TICK_RATE, PLAYER_RADIUS, MAX_HP } from '@browser-arena/shared';
import { drawHitFlash } from '../../fx/hitFlash';
import { drawHpBar } from '../../fx/drawHeart';
import { drawEgg } from './egg';
import { Player } from './Player';

const SERVER_TICK_S = 1 / TICK_RATE;

/** A remote player entity, interpolated between server ticks. */
export class RemotePlayer extends Player {
  readonly id: string;

  private fromX: number;
  private fromY: number;
  private toX: number;
  private toY: number;
  private lerpT = 1;

  /** Walk cycle phase in radians, drives foot animation. */
  private walkPhase = 0;
  /** Last movement direction, used to orient the barrel. */
  private dirX = 0;
  private dirY = -1;

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
    const prevX = this.x;
    const prevY = this.y;
    this.x = this.fromX + (this.toX - this.fromX) * this.lerpT;
    this.y = this.fromY + (this.toY - this.fromY) * this.lerpT;

    const dx = this.x - prevX;
    const dy = this.y - prevY;
    const moving = dx * dx + dy * dy > 0.01;
    if (moving) {
      const len = Math.sqrt(dx * dx + dy * dy);
      this.dirX = dx / len;
      this.dirY = dy / len;
      this.walkPhase += dt * 8;
    }
  }

  draw(ctx: CanvasRenderingContext2D, name: string) {
    const aimAngle = Math.atan2(this.dirY, this.dirX);
    drawEgg(ctx, this.x, this.y, aimAngle, this.walkPhase, '#ff69b4');
    drawHitFlash(ctx, this.x, this.y, PLAYER_RADIUS, this.hitFlashTime / 0.3);
    drawHpBar(ctx, this.x, this.y - PLAYER_RADIUS * 1.4 - 14, this.hp, MAX_HP);
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(name, this.x, this.y - PLAYER_RADIUS * 1.4);
  }
}
