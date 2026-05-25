import { WORLD_W, WORLD_H } from '@browser-arena/shared';
import { InputHandler } from './InputHandler';
import { Player } from './entities/Player';
import { RemotePlayer } from './entities/RemotePlayer';
import { ProjectileSystem } from './systems/ProjectileSystem';
import { Arena } from './world/Arena';
import { ServerClient } from './network/ServerClient';

export class Game {
  /** 2D drawing context for the canvas. */
  private ctx: CanvasRenderingContext2D;
  /** Reads keyboard state each frame. */
  private input: InputHandler;
  /** The local player. */
  private player: Player;
  /** Other connected players, keyed by player ID. */
  private remotePlayers = new Map<string, RemotePlayer>();
  /** Manages all in-flight projectiles. */
  private projectiles: ProjectileSystem;
  /** Current map — responsible for drawing the background. */
  private arena: Arena;
  /** Routes server messages to the appropriate entities. */
  private server: ServerClient;
  /** Handle returned by requestAnimationFrame, used to cancel the loop on destroy. */
  private animationFrame: number | null = null;
  /** Canvas logical width in CSS pixels (not scaled by devicePixelRatio). */
  private w: number;
  /** Canvas logical height in CSS pixels (not scaled by devicePixelRatio). */
  private h: number;
  /** Timestamp of the previous frame, used to compute dt (delta time in seconds). */
  private lastTimestamp: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.input = new InputHandler();
    this.player = new Player(WORLD_W / 2, WORLD_H / 2);
    this.projectiles = new ProjectileSystem();
    this.arena = new Arena();
    this.server = new ServerClient(this.player, this.remotePlayers, this.input);
    this.server.connect();

    const dpr = window.devicePixelRatio || 1;
    this.w = canvas.clientWidth;
    this.h = canvas.clientHeight;
    canvas.width = this.w * dpr;
    canvas.height = this.h * dpr;
    this.ctx.scale(dpr, dpr);
  }

  start() {
    this.animationFrame = requestAnimationFrame((t) => this.loop(t));
  }

  private loop(timestamp: number) {
    const dt = this.lastTimestamp !== null ? (timestamp - this.lastTimestamp) / 1000 : 0;
    this.lastTimestamp = timestamp;

    const input = this.input.read();
    this.player.update(dt, input);
    if (this.player.fireIntent) {
      this.projectiles.fire(this.player.x, this.player.y, this.player.dirX, this.player.dirY);
    }
    this.projectiles.update(dt, WORLD_W, WORLD_H);
    this.server.sendInput(input);
    this.render();
    this.animationFrame = requestAnimationFrame((t) => this.loop(t));
  }

  private render() {
    const { ctx } = this;
    this.arena.draw(ctx);

    if (this.server.isConnected) this.player.draw(ctx);
    this.projectiles.draw(ctx);
    for (const remote of this.remotePlayers.values()) remote.draw(ctx);
  }

  destroy() {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.input.destroy();
    this.server.destroy();
  }
}
