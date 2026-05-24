export interface PlayerState {
  id: string;
  x: number;
  y: number;
}

export type ServerMessage =
  | { type: 'init'; id: string }
  | { type: 'state_update'; players: PlayerState[] };

export type ClientMessage = { type: 'input'; keys: string[] };
