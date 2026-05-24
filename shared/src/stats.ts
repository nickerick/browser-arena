import { z } from 'zod';

/** Lifetime stats for a player */
export const PlayerStatsSchema = z.object({
  kills: z.number(),
  deaths: z.number(),
  wins: z.number(),
  gamesPlayed: z.number(),
});
export type PlayerStats = z.infer<typeof PlayerStatsSchema>;

export const GetStatsRequestSchema = z.object({});
export type GetStatsRequest = z.infer<typeof GetStatsRequestSchema>;
