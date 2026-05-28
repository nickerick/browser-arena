import type { Entity } from '../Entity';

/** Abstract base class for all player entities. Owns shared state and the takeDamage contract. */
export abstract class Player implements Entity {
  /** World-space position. */
  x: number;
  y: number;
  
  /** Seconds remaining on the hit flash overlay. Counts down from 0.3 to 0 after taking damage. */
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
