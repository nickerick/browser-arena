import { z } from 'zod';

// RPC envelope — every HTTP response is one of these
export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

// WebSocket message types
export interface PlayerState {
  id: string;
  x: number;
  y: number;
}

export type ServerMessage =
  | { type: 'init'; id: string }
  | { type: 'state_update'; players: PlayerState[] };

export type ClientMessage = { type: 'input'; keys: string[] };

// HTTP API schemas — Zod is the source of truth, TypeScript types are derived
export const PlayerStatsSchema = z.object({
  kills: z.number(),
  deaths: z.number(),
  wins: z.number(),
  gamesPlayed: z.number(),
});

export type PlayerStats = z.infer<typeof PlayerStatsSchema>;
