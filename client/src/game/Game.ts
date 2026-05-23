import { InputHandler } from './InputHandler';

const SPEED = 10;
const RADIUS = 20;

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputHandler;
  private animationFrame: number | null = null;

  private x: number;
  private y: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.input = new InputHandler();
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
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
    const { input, canvas } = this;

    if (input.isDown('w') || input.isDown('arrowup'))    this.y -= SPEED;
    if (input.isDown('s') || input.isDown('arrowdown'))  this.y += SPEED;
    if (input.isDown('a') || input.isDown('arrowleft'))  this.x -= SPEED;
    if (input.isDown('d') || input.isDown('arrowright')) this.x += SPEED;

    // clamp to canvas bounds
    this.x = Math.max(RADIUS, Math.min(canvas.width - RADIUS, this.x));
    this.y = Math.max(RADIUS, Math.min(canvas.height - RADIUS, this.y));
  }

  private render() {
    const { ctx, canvas } = this;

    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
