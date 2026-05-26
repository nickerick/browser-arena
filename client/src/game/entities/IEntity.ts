/** Base contract for all game entities. Every entity must be updatable and drawable. */
export interface IEntity {
  update(dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}
