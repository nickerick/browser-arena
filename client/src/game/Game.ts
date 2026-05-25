import { InputHandler } from './InputHandler';
import { PlayerSystem } from './systems/PlayerSystem';
import { ProjectileSystem } from './systems/ProjectileSystem';
import { Arena } from './world/Arena';
import { ServerClient } from './network/ServerClient';

export class Game {
  // rendering + input
  private ctx: CanvasRenderingContext2D;
  private input: InputHandler;

  // network
  private server: ServerClient;

  // loop bookkeeping
  /** Handle returned by requestAnimationFrame, used to cancel the loop on destroy. */
  private animationFrame: number | null = null;
  /** Timestamp of the previous frame, used to compute dt (delta time in seconds). */
  private lastTimestamp: number | null = null;

  // game world
  private arena: Arena;
  private players: PlayerSystem;
  private projectiles: ProjectileSystem;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.input = new InputHandler();
    this.arena = new Arena();
    this.players = new PlayerSystem();
    this.projectiles = new ProjectileSystem();
    this.server = new ServerClient(this.players, this.input, this.projectiles);
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
    this.players.update(dt, input);
    if (this.players.local.fireIntent) {
      this.projectiles.fire(this.players.local.x, this.players.local.y, this.players.local.dirX, this.players.local.dirY);
      this.server.sendFire(this.players.local.dirX, this.players.local.dirY);
    }
    this.projectiles.update(dt);

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
    this.players.draw(ctx);
    this.projectiles.draw(ctx);
  }

  /** Stops the render loop and tears down all event listeners and socket subscriptions. */
  destroy() {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.input.destroy();
    this.server.destroy();
  }
}
