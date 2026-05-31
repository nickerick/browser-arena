import { InputHandler, type InputState } from './InputHandler';
import { Camera } from './world/Camera';
import { PlayerSystem } from './systems/PlayerSystem';
import { ProjectileSystem } from './systems/ProjectileSystem';
import { Arena } from './world/Arena';
import { ServerClient } from './network/ServerClient';

export class Game {
  // rendering + input
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputHandler;
  private camera: Camera;

  // game world
  private arena: Arena;
  private players: PlayerSystem;
  private projectiles: ProjectileSystem;

  // network
  private server: ServerClient;

  // loop bookkeeping
  private rafHandle: number | null = null; // used to cancel the render loop on destroy
  private prevFrameTimestamp: number | null = null; // used to calculate delta time each frame

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.input = new InputHandler();
    this.camera = new Camera(canvas);
    this.arena = new Arena();
    this.players = new PlayerSystem();
    this.projectiles = new ProjectileSystem();
    this.server = new ServerClient(this.players, this.projectiles);
    this.server.connect();

    canvas.style.cursor = 'crosshair';

    window.addEventListener('keydown', this.onKeyDown);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  /** Kicks off the render loop. Call once after the game is ready to run. */
  start() {
    this.rafHandle = requestAnimationFrame((t) => this.loop(t));
  }

  /**
   * Core update step, called once per frame by requestAnimationFrame.
   * Computes and advances game state and then hands off to render().
   */
  private loop(timestamp: number) {
    // calculate delta time from the browser-provided timestamp
    const dt = this.prevFrameTimestamp !== null ? (timestamp - this.prevFrameTimestamp) / 1000 : 0;
    this.prevFrameTimestamp = timestamp;

    // apply all server messages that arrived since last frame
    this.server.flush();

    // update state
    const input = this.readInput();
    this.players.update(dt, input);
    this.camera.follow(this.players.local.x, this.players.local.y, dt); // follow after updating player position
    if (this.players.local.fireIntent) {
      this.projectiles.fire(
        this.players.local.x,
        this.players.local.y,
        this.players.local.dirX,
        this.players.local.dirY
      );
      this.server.sendFire(this.players.local.dirX, this.players.local.dirY);
    }
    this.projectiles.update(dt);

    // flush input to server
    this.server.sendInput(input);

    this.render();
    this.rafHandle = requestAnimationFrame((t) => this.loop(t));
  }

  /**
   * Read-only draw step — takes a snapshot of current game state and paints a frame.
   */
  private render() {
    const { ctx, canvas } = this;

    // clear the canvas in screen space before applying the camera transform
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    this.camera.apply(ctx);
    this.arena.draw(ctx);
    this.players.draw(ctx);
    this.projectiles.draw(ctx);
    this.camera.restore(ctx);
  }

  /** Combines raw input with camera-converted mouse coords into a full InputState. */
  private readInput(): InputState {
    const raw = this.input.read();
    const { x: worldMouseX, y: worldMouseY } = this.camera.toWorld(raw.clientMouseX, raw.clientMouseY);
    return { ...raw, worldMouseX, worldMouseY };
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      this.camera.spectator = !this.camera.spectator;
    }
  };

  destroy() {
    if (this.rafHandle !== null) cancelAnimationFrame(this.rafHandle);
    window.removeEventListener('keydown', this.onKeyDown);
    this.input.destroy();
    this.server.destroy();
  }
}
