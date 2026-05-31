import { PLAYER_RADIUS, PROJECTILE_RADIUS } from './constants';

const HIT_RADIUS = PLAYER_RADIUS + PROJECTILE_RADIUS;

/**
 * Continuous collision detection — checks if the projectile swept along a line
 * from (x0, y0) to (x1, y1) comes within HIT_RADIUS of the player at (playerX, playerY).
 *
 * This prevents fast projectiles from tunneling through players between server ticks.
 * Mathematically: finds the closest point on the line segment to the player center,
 * then checks if that distance is less than the combined hit radius.
 */
export function testHit(
  x0: number, y0: number,  // projectile position last tick
  x1: number, y1: number,  // projectile position this tick
  playerX: number,
  playerY: number
): boolean {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const lenSq = dx * dx + dy * dy;

  // if the projectile barely moved, just do a point check
  let t = 0;
  if (lenSq > 0) {
    // project the player center onto the movement line, clamped to [0, 1]
    t = Math.max(0, Math.min(1, ((playerX - x0) * dx + (playerY - y0) * dy) / lenSq));
  }

  // closest point on the swept path to the player
  const closestX = x0 + t * dx;
  const closestY = y0 + t * dy;

  const distSq = (closestX - playerX) ** 2 + (closestY - playerY) ** 2;
  return distSq < HIT_RADIUS * HIT_RADIUS;
}
