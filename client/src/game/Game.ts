import { InputHandler } from './InputHandler';

const SPEED = 10;
const RADIUS = 20;

export class Game {
  private ctx: CanvasRenderingContext2D;
  private input: InputHandler;
  private animationFrame: number | null = null;
  private w: number;
  private h: number;

  private x: number;
  private y: number;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.input = new InputHandler();

    const dpr = window.devicePixelRatio || 1;
    this.w = canvas.clientWidth;
    this.h = canvas.clientHeight;
    canvas.width = this.w * dpr;
    canvas.height = this.h * dpr;
    this.ctx.scale(dpr, dpr);

    this.x = this.w / 2;
    this.y = this.h / 2;
  }

  start() {
    this.loop();
  }

  private loop() {
    this.update();
    this.render();
    this.animationFrame = requestAnimationFrame(() => this.loop());
  }

  private update() {
    const { input, w, h } = this;

    if (input.isDown('w') || input.isDown('arrowup'))    this.y -= SPEED;
    if (input.isDown('s') || input.isDown('arrowdown'))  this.y += SPEED;
    if (input.isDown('a') || input.isDown('arrowleft'))  this.x -= SPEED;
    if (input.isDown('d') || input.isDown('arrowright')) this.x += SPEED;

    this.x = Math.max(RADIUS, Math.min(w - RADIUS, this.x));
    this.y = Math.max(RADIUS, Math.min(h - RADIUS, this.y));
  }

  private render() {
    const { ctx, w, h } = this;

    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#4ecca3';
    ctx.beginPath();
    ctx.arc(this.x, this.y, RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }


  destroy() {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.input.destroy();
  }
}
