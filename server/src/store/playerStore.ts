import type { PlayerStats } from '@browser-arena/shared';

export function getPlayerStats(): PlayerStats {
  return {
    kills: 12,
    deaths: 4,
    wins: 3,
    gamesPlayed: 8,
  };
}
