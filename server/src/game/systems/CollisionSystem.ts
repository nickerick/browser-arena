import { WORLD_W, WORLD_H, PLAYER_RADIUS } from '@browser-arena/shared';
import type { ConnectedPlayer } from './PlayerSystem';

/** Resolves physical overlap between players by pushing them apart. */
export class CollisionSystem {
  /**
   * Single-pass circle-circle collision resolution.
   *
   * Checks every unique pair of players (i/j loop avoids duplicates and self-checks).
   * For each overlapping pair: measures how deep the overlap is, normalizes the A→B
   * vector into a collision normal (nx/ny), then slides both players apart along that
   * axis by half the overlap each. World bounds are clamped after each push.
   *
   * Note: single-pass means pairs near walls may not fully separate — running multiple
   * passes per tick would converge to a more accurate result if needed.
   */
  resolve(players: ConnectedPlayer[]) {
    // two circles overlap when center distance < sum of radii (both same radius here)
    const minDist = PLAYER_RADIUS * 2;

    // i/j pattern checks every unique pair exactly once — no self-checks, no duplicates
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const a = players[i];
        const b = players[j];

        // distance between centers via Pythagorean theorem
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // skip if not overlapping, or exactly on top of each other (avoids divide-by-zero below)
        if (dist === 0 || dist >= minDist) continue;

        // how far they're overlapping, split equally so both players move half
        const overlap = (minDist - dist) / 2;

        // normalize dx/dy into a unit vector (the collision normal — direction from A to B)
        const nx = dx / dist;
        const ny = dy / dist;

        // push A and B apart along the collision normal by their half-overlap
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

        // clamp both players back inside world bounds after the push
        a.x = Math.max(PLAYER_RADIUS, Math.min(WORLD_W - PLAYER_RADIUS, a.x));
        a.y = Math.max(PLAYER_RADIUS, Math.min(WORLD_H - PLAYER_RADIUS, a.y));
        b.x = Math.max(PLAYER_RADIUS, Math.min(WORLD_W - PLAYER_RADIUS, b.x));
        b.y = Math.max(PLAYER_RADIUS, Math.min(WORLD_H - PLAYER_RADIUS, b.y));
      }
    }
  }
}
