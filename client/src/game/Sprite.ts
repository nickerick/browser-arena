export type RowEntry = number | { row: number; flipX: boolean };

export interface SpriteConfig {
  src: string;
  frameW: number;
  frameH: number;
  frameCount: number;
  fps: number;
  rows: Record<string, RowEntry>;
  defaultFacing: string;
}

export class Sprite {
  private config: SpriteConfig;
  private image: HTMLImageElement | null = null;
  private frameIndex = 0;
  private frameTimer = 0;
  private facing: string;

  constructor(config: SpriteConfig) {
    this.config = config;
    this.facing = config.defaultFacing;
    const img = new Image();
    img.src = config.src;
    img.onload = () => {
      this.image = img;
    };
  }

  setFacing(facing: string) {
    this.facing = facing;
  }

  update(dt: number, moving: boolean) {
    if (moving) {
      this.frameTimer += dt;
      if (this.frameTimer >= 1 / this.config.fps) {
        this.frameIndex = (this.frameIndex + 1) % this.config.frameCount;
        this.frameTimer = 0;
      }
    } else {
      this.frameIndex = 0;
      this.frameTimer = 0;
    }
  }

  /** Returns false if image not yet loaded (caller can fall back to a placeholder). */
  draw(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
    if (!this.image) return false;
    const { frameW, frameH, rows } = this.config;
    const entry = rows[this.facing] ?? 0;
    const row = typeof entry === 'number' ? entry : entry.row;
    const flipX = typeof entry === 'object' && entry.flipX;

    const sx = this.frameIndex * frameW;
    const sy = row * frameH;

    ctx.save();
    if (flipX) {
      ctx.translate(x, y - frameH / 2);
      ctx.scale(-1, 1);
      ctx.drawImage(this.image, sx, sy, frameW, frameH, -frameW / 2, 0, frameW, frameH);
    } else {
      ctx.drawImage(
        this.image,
        sx,
        sy,
        frameW,
        frameH,
        x - frameW / 2,
        y - frameH / 2,
        frameW,
        frameH
      );
    }
    ctx.restore();
    return true;
  }

  get halfH() {
    return this.config.frameH / 2;
  }
  get halfW() {
    return this.config.frameW / 2;
  }
}
