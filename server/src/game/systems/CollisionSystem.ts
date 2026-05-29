import { WORLD_W, WORLD_H, PLAYER_RADIUS } from '@browser-arena/shared';
import type { ConnectedPlayer } from './PlayerSystem';

/** Resolves physical overlap between players by pushing them apart. */
export class CollisionSystem {
  resolve(players: ConnectedPlayer[]) {
    const minDist = PLAYER_RADIUS * 2;
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const a = players[i];
        const b = players[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0 || dist >= minDist) continue;

        const overlap = (minDist - dist) / 2;
        const nx = dx / dist;
        const ny = dy / dist;
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

        a.x = Math.max(PLAYER_RADIUS, Math.min(WORLD_W - PLAYER_RADIUS, a.x));
        a.y = Math.max(PLAYER_RADIUS, Math.min(WORLD_H - PLAYER_RADIUS, a.y));
        b.x = Math.max(PLAYER_RADIUS, Math.min(WORLD_W - PLAYER_RADIUS, b.x));
        b.y = Math.max(PLAYER_RADIUS, Math.min(WORLD_H - PLAYER_RADIUS, b.y));
      }
    }
  }
}
