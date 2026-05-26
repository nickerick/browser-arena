import type { IEntity } from '../IEntity';

/** Abstract base class for all player entities. Owns shared state and the takeDamage contract. */
export abstract class Player implements IEntity {
  x: number;
  y: number;
  protected hitFlashTime = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  takeDamage() {
    this.hitFlashTime = 0.3;
  }

  abstract update(dt: number): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;
}
