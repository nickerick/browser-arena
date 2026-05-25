import { WORLD_W, WORLD_H } from '@browser-arena/shared';
import { InputHandler } from './InputHandler';
import { Player } from './entities/Player';
import { RemotePlayer } from './entities/RemotePlayer';
import { ProjectileSystem } from './systems/ProjectileSystem';
import { Arena } from './world/Arena';
import { ServerClient } from './network/ServerClient';

export class Game {
  // Rendering + Input
  /** 2D drawing context for the canvas. */
  private ctx: CanvasRenderingContext2D;
  /** Reads keyboard state each frame. */
  private input: InputHandler;

  // Network
  /** Routes server messages to the appropriate entities. */
  private server: ServerClient;

  // Loop Bookkeeping
  /** Handle returned by requestAnimationFrame, used to cancel the loop on destroy. */
  private animationFrame: number | null = null;
  /** Timestamp of the previous frame, used to compute dt (delta time in seconds). */
  private lastTimestamp: number | null = null;

  // Game World
  /** Current map — responsible for drawing the background. */
  private arena: Arena;
  /** The local player. */
  private player: Player;
  /** Other connected players, keyed by player ID. */
  private remotePlayers = new Map<string, RemotePlayer>();
  /** Manages all in-flight projectiles. */
  private projectiles: ProjectileSystem;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.input = new InputHandler();
    this.player = new Player(WORLD_W / 2, WORLD_H / 2);
    this.projectiles = new ProjectileSystem();
    this.arena = new Arena();
    this.server = new ServerClient(this.player, this.remotePlayers, this.input, this.projectiles);
    this.server.connect();

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  /** Kicks off the render loop. Call once after the game is ready to run. */
  start() {
    this.animationFrame = requestAnimationFrame((t) => this.loop(t));
  }

  /**
   * Core update step, called once per frame by requestAnimationFrame.
   * Computes and advances game state and then hands off to render().
   */
  private loop(timestamp: number) {
    // calculate delta time from the browser-provided timestamp
    const dt = this.lastTimestamp !== null ? (timestamp - this.lastTimestamp) / 1000 : 0;
    this.lastTimestamp = timestamp;

    // update state
    const input = this.input.read();
    this.player.update(dt, input);
    if (this.player.fireIntent) {
      this.projectiles.fire(this.player.x, this.player.y, this.player.dirX, this.player.dirY);
      this.server.sendFire(this.player.dirX, this.player.dirY);
    }
    this.projectiles.update(dt);
    for (const remote of this.remotePlayers.values()) remote.update(dt);

    // flush input to server
    this.server.sendInput(input);

    this.render();
    this.animationFrame = requestAnimationFrame((t) => this.loop(t));
  }

  /**
   * Read-only draw step — takes a snapshot of current game state and paints a frame.
   */
  private render() {
    const { ctx } = this;
    this.arena.draw(ctx);

    if (this.server.isConnected) this.player.draw(ctx);
    this.projectiles.draw(ctx);
    for (const remote of this.remotePlayers.values()) remote.draw(ctx);
  }

  /** Stops the render loop and tears down all event listeners and socket subscriptions. */
  destroy() {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.input.destroy();
    this.server.destroy();
  }
}
