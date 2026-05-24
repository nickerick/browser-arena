/**
 * Shared WebSocket message types between client and server.
 *
 * `ServerMessage` — server → client (state updates, init)
 * `ClientMessage` — client → server (player input)
 */

/** Position and identity of a player in the game world. */
export interface PlayerState {
  id: string;
  x: number;
  y: number;
}

/** Messages the server sends to clients over the WebSocket. */
export type ServerMessage =
  | { type: 'init'; id: string }
  | { type: 'state_update'; players: PlayerState[] };

/** Messages clients send to the server over the WebSocket. */
export type ClientMessage = { type: 'input'; keys: string[] };
