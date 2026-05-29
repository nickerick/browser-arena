import { WebSocket } from 'ws';
import { WORLD_W, WORLD_H, PLAYER_RADIUS, PLAYER_SPEED, TICK_RATE } from '@browser-arena/shared';

const MOVE_SPEED = PLAYER_SPEED * (1 / TICK_RATE);

export interface ConnectedPlayer {
  id: string;
  x: number;
  y: number;
  socket: WebSocket;
  moveX: number;
  moveY: number;
}

/** Manages all connected player state. */
export class PlayerSystem {
  private players = new Map<string, ConnectedPlayer>();

  /** All currently connected players. */
  get all(): ConnectedPlayer[] {
    return [...this.players.values()];
  }

  get(id: string): ConnectedPlayer | undefined {
    return this.players.get(id);
  }

  /** Register a new player, send them their init message, and return their assigned ID. */
  add(socket: WebSocket): string {
    const id = crypto.randomUUID();
    this.players.set(id, {
      id,
      x: Math.random() * (WORLD_W - PLAYER_RADIUS * 4) + PLAYER_RADIUS * 2,
      y: Math.random() * (WORLD_H - PLAYER_RADIUS * 4) + PLAYER_RADIUS * 2,
      socket,
      moveX: 0,
      moveY: 0,
    });
    socket.send(JSON.stringify({ type: 'init', id }));
    return id;
  }

  remove(id: string) {
    this.players.delete(id);
  }

  /** Store the latest input vector for a player. Applied during the next processInputs(). */
  setInput(id: string, moveX: number, moveY: number) {
    const player = this.players.get(id);
    if (!player) return;
    player.moveX = moveX;
    player.moveY = moveY;
  }

  /** Apply each player's stored input vector to their position. */
  processInputs() {
    for (const player of this.players.values()) {
      let { moveX, moveY } = player;

      // normalize so diagonal movement isn't faster than cardinal
      const len = Math.sqrt(moveX * moveX + moveY * moveY);
      if (len > 0) { moveX /= len; moveY /= len; }

      player.x = Math.max(PLAYER_RADIUS, Math.min(WORLD_W - PLAYER_RADIUS, player.x + moveX * MOVE_SPEED));
      player.y = Math.max(PLAYER_RADIUS, Math.min(WORLD_H - PLAYER_RADIUS, player.y + moveY * MOVE_SPEED));
    }
  }
}
