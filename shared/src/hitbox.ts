import { HITBOX_SHAPE, HITBOX_W, HITBOX_H, PLAYER_RADIUS } from './constants';

/**
 * Returns true if a projectile at (projX, projY) overlaps the player hitbox
 * centered at (playerX, playerY). Shape is controlled by HITBOX_SHAPE.
 */
export function testHit(projX: number, projY: number, playerX: number, playerY: number): boolean {
  const dx = projX - playerX;
  const dy = projY - playerY;
  if (HITBOX_SHAPE === 'circle') {
    return dx * dx + dy * dy < PLAYER_RADIUS * PLAYER_RADIUS;
  }
  return Math.abs(dx) < HITBOX_W / 2 && Math.abs(dy) < HITBOX_H / 2;
}
