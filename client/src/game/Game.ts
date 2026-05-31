import { WORLD_W, WORLD_H } from '@browser-arena/shared';
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

    // update camera — spectator zooms out to world center, normal follows the player
    const targetX = this.spectator ? WORLD_W / 2 : this.players.local.x;
    const targetY = this.spectator ? WORLD_H / 2 : this.players.local.y;
    this.camera.zoom = this.spectator ? this.camera.zoomToFit : 1;
    this.camera.follow(targetX, targetY, dt);

    this.render();
    this.rafHandle = requestAnimationFrame((t) => this.loop(t));
  }

  /**
   * Read-only draw step — takes a snapshot of current game state and paints a frame.
   */
  private render() {
    this.clearScreen();

    // shift + scale the canvas so world coordinates map correctly to the screen
    this.camera.apply(this.ctx);
    this.arena.draw(this.ctx);
    this.players.draw(this.ctx);
    this.projectiles.draw(this.ctx);

    // undo the camera transform — anything drawn after here is fixed to the screen (HUD, etc.)
    this.camera.restore(this.ctx);
  }

  /** Clears the entire canvas in screen space before each frame. */
  private clearScreen() {
    this.ctx.fillStyle = '##1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
  }

  /** Combines raw input with camera-converted mouse coords into a full InputState. */
  private readInput(): InputState {
    const raw = this.input.read();
    const { x: worldMouseX, y: worldMouseY } = this.camera.toWorld(
      raw.clientMouseX,
      raw.clientMouseY
    );
    return { ...raw, worldMouseX, worldMouseY };
  }

  private spectator = false;

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      this.spectator = !this.spectator;
    }
  };

  destroy() {
    if (this.rafHandle !== null) cancelAnimationFrame(this.rafHandle);
    window.removeEventListener('keydown', this.onKeyDown);
    this.input.destroy();
    this.server.destroy();
  }
}
