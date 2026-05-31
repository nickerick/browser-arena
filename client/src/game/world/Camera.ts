import { WORLD_W, WORLD_H } from '@browser-arena/shared';

/**
 * Owns the viewport transform — maps between screen space and world space.
 *
 * Usage each frame:
 *   1. camera.follow(x, y, dt)    — smooth-track a world position
 *   2. camera.apply(ctx)          — push the world transform (ctx.save + translate + scale)
 *   3. ... draw world-space things ...
 *   4. camera.restore(ctx)        — pop back to screen space (ctx.restore)
 *   5. ... draw screen-space HUD ...
 */
export class Camera {
  /** World-space position the camera is centered on. */
  x: number;
  y: number;
  /** Zoom factor. 1 = no zoom. Set from outside each frame based on game mode. */
  zoom = 1;

  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.x = WORLD_W / 2;
    this.y = WORLD_H / 2;
  }

  /** Smoothly moves the camera toward (targetX, targetY). */
  follow(targetX: number, targetY: number, dt: number) {
    const speed = 12;
    this.x += (targetX - this.x) * Math.min(1, speed * dt);
    this.y += (targetY - this.y) * Math.min(1, speed * dt);
  }

  /**
   * Pushes a world-space transform onto the canvas context.
   * Every draw call after this is in world coordinates until restore() is called.
   */
  apply(ctx: CanvasRenderingContext2D) {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  /** Pops the camera transform, returning to screen space. */
  restore(ctx: CanvasRenderingContext2D) {
    ctx.restore();
  }

  /** Converts raw client mouse coordinates into world-space coordinates. */
  toWorld(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const { clientWidth: w, clientHeight: h } = this.canvas;
    return {
      x: (clientX - rect.left - w / 2) / this.zoom + this.x,
      y: (clientY - rect.top - h / 2) / this.zoom + this.y,
    };
  }

  /** The zoom level required to fit the entire world in the viewport. */
  get zoomToFit(): number {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    return Math.min(w / WORLD_W, h / WORLD_H);
  }
}
