import { WebSocket } from 'ws';
import {
  PlayerState,
  ServerMessage,
  ClientMessage,
  WORLD_W,
  WORLD_H,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  TICK_RATE,
} from '@browser-arena/shared';

const SPEED = PLAYER_SPEED / TICK_RATE;

interface ConnectedPlayer extends PlayerState {
  socket: WebSocket;
  keys: string[];
}

export class GameRoom {
  private players = new Map<string, ConnectedPlayer>();

  constructor() {
    setInterval(() => this.tick(), 1000 / 20);
  }

  addPlayer(socket: WebSocket): string {
    const id = crypto.randomUUID();
    this.players.set(id, {
      id,
      x: Math.random() * (WORLD_W - PLAYER_RADIUS * 4) + PLAYER_RADIUS * 2,
      y: Math.random() * (WORLD_H - PLAYER_RADIUS * 4) + PLAYER_RADIUS * 2,
      socket,
      keys: [],
    });
    this.sendTo(socket, { type: 'init', id });
    return id;
  }

  handleMessage(playerId: string, msg: ClientMessage) {
    const player = this.players.get(playerId);
    if (!player) return;
    if (msg.type === 'input') {
      player.keys = msg.keys;
    }
  }

  removePlayer(id: string) {
    this.players.delete(id);
  }

  private tick() {
    this.processInputs();
    this.resolveCollisions();
    this.broadcast({
      type: 'state_update',
      players: [...this.players.values()].map(({ id, x, y }) => ({ id, x, y })),
    });
  }

  private resolveCollisions() {
    const players = [...this.players.values()];
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

  private processInputs() {
    for (const player of this.players.values()) {
      if (player.keys.includes('w')) player.y -= SPEED;
      if (player.keys.includes('s')) player.y += SPEED;
      if (player.keys.includes('a')) player.x -= SPEED;
      if (player.keys.includes('d')) player.x += SPEED;

      player.x = Math.max(PLAYER_RADIUS, Math.min(WORLD_W - PLAYER_RADIUS, player.x));
      player.y = Math.max(PLAYER_RADIUS, Math.min(WORLD_H - PLAYER_RADIUS, player.y));
    }
  }

  private broadcast(msg: ServerMessage) {
    const payload = JSON.stringify(msg);
    for (const player of this.players.values()) {
      if (player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(payload);
      }
    }
  }

  private sendTo(socket: WebSocket, msg: ServerMessage) {
    socket.send(JSON.stringify(msg));
  }
}
