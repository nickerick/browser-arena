import { WORLD_W, WORLD_H } from '@browser-arena/shared';

/**
 * Owns the viewport transform — maps between screen space and world space.
 *
 * Usage each frame:
 *   1. camera.follow(player.x, player.y, dt)   — smooth-track the target (skipped in spectator mode)
 *   2. camera.apply(ctx)                        — push the world transform
 *   3. ... draw all world-space things ...
 *   4. camera.restore(ctx)                      — pop back to screen space
 *   5. ... draw any screen-space HUD ...
 */
export class Camera {
  /** World-space position the camera is currently centered on. */
  x: number;
  y: number;
  /** Current zoom factor. Driven by mode. */
  private _zoom: number;
  /** Whether spectator mode is active (shows whole world). */
  spectator = false;

  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this._zoom = 1;
    // start centered on the world
    this.x = WORLD_W / 2;
    this.y = WORLD_H / 2;
  }

  /** Zoom level that fits the entire world in the viewport. */
  private get spectatorZoom() {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    return Math.min(w / WORLD_W, h / WORLD_H);
  }

  /**
   * Smoothly moves the camera toward (targetX, targetY).
   * No-ops in spectator mode — camera locks to world center instead.
   */
  follow(targetX: number, targetY: number, dt: number) {
    const speed = 12;
    if (this.spectator) {
      // smoothly pan back to world center
      this.x += (WORLD_W / 2 - this.x) * Math.min(1, speed * dt);
      this.y += (WORLD_H / 2 - this.y) * Math.min(1, speed * dt);
      this._zoom += (this.spectatorZoom - this._zoom) * Math.min(1, speed * dt);
    } else {
      this.x += (targetX - this.x) * Math.min(1, speed * dt);
      this.y += (targetY - this.y) * Math.min(1, speed * dt);
      this._zoom += (1 - this._zoom) * Math.min(1, speed * dt);
    }
  }

  /**
   * Pushes a world-space transform onto the canvas context.
   * Every draw call after this is in world coordinates until restore() is called.
   */
  apply(ctx: CanvasRenderingContext2D) {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(this._zoom, this._zoom);
    ctx.translate(-this.x, -this.y);
  }

  /** Pops the world-space transform, returning to screen space. */
  restore(ctx: CanvasRenderingContext2D) {
    ctx.restore();
  }
  
  /**
   * Converts raw client mouse coordinates (from MouseEvent.clientX/Y)
   * into world-space coordinates.
   */
  toWorld(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;
    const { clientWidth: w, clientHeight: h } = this.canvas;
    return {
      x: (canvasX - w / 2) / this._zoom + this.x,
      y: (canvasY - h / 2) / this._zoom + this.y,
    };
  }
}
