/**
 * Shared WebSocket message types between client and server.
 *
 * `ServerMessage` — server → client (state updates, init)
 * `ClientMessage` — client → server (player input, fire)
 */

/** Position and identity of a player in the game world. */
export interface PlayerState {
  id: string;
  x: number;
  y: number;
}

/** Position, velocity, and identity of an in-flight projectile. */
export interface ProjectileState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ownerId: string;
}

/** Messages the server sends to clients over the WebSocket. */
export type ServerMessage =
  | { type: 'init'; id: string }
  | { type: 'state_update'; players: PlayerState[]; projectiles: ProjectileState[] }
  | { type: 'player_hit'; targetId: string; shooterId: string; projectileId: string };

/** Messages clients send to the server over the WebSocket. */
export type ClientMessage =
  | { type: 'input'; moveX: number; moveY: number }
  | { type: 'fire'; dirX: number; dirY: number };
