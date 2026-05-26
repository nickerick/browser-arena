import { TICK_RATE } from '@browser-arena/shared';
import { Projectile } from './Projectile';

const SERVER_TICK_S = 1 / TICK_RATE;

/** A server-confirmed projectile from another player, interpolated between server ticks. */
export class RemoteProjectile extends Projectile {
  /** Interpolation source position (where we were at the last server update). */
  private fromX: number;
  private fromY: number;
  /** Interpolation target position (where the server says we should be). */
  private toX: number;
  private toY: number;
  /** Normalized interpolation progress from 0 (just received update) to 1 (fully arrived). */
  private lerpT = 1;

  constructor(x: number, y: number, vx: number, vy: number) {
    super(x, y, vx, vy);
    this.fromX = x;
    this.fromY = y;
    this.toX = x;
    this.toY = y;
  }

  /** Store the latest authoritative state from the server. Applied during the next update(). */
  setServerState(x: number, y: number, vx: number, vy: number) {
    this.fromX = this.x;
    this.fromY = this.y;
    this.toX = x;
    this.toY = y;
    this.lerpT = 0;
    this.vx = vx;
    this.vy = vy;
  }

  /** Interpolate toward the server position, then advance physics one frame. */
  update(dt: number) {
    this.lerpT = Math.min(1, this.lerpT + dt / SERVER_TICK_S);
    this.x = this.fromX + (this.toX - this.fromX) * this.lerpT;
    this.y = this.fromY + (this.toY - this.fromY) * this.lerpT;
    this.advancePhysics(dt);
  }
}
