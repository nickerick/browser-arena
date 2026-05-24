import { WebSocket } from 'ws';
import { PlayerState, ServerMessage, ClientMessage } from '@browser-arena/shared';

const SPEED = 20;
const WORLD_W = 800;
const WORLD_H = 500;
const RADIUS = 20;

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
      x: Math.random() * (WORLD_W - RADIUS * 4) + RADIUS * 2,
      y: Math.random() * (WORLD_H - RADIUS * 4) + RADIUS * 2,
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
    this.broadcast({
      type: 'state_update',
      players: [...this.players.values()].map(({ id, x, y }) => ({ id, x, y })),
    });
  }

  private processInputs() {
    for (const player of this.players.values()) {
      if (player.keys.includes('w')) player.y -= SPEED;
      if (player.keys.includes('s')) player.y += SPEED;
      if (player.keys.includes('a')) player.x -= SPEED;
      if (player.keys.includes('d')) player.x += SPEED;

      player.x = Math.max(RADIUS, Math.min(WORLD_W - RADIUS, player.x));
      player.y = Math.max(RADIUS, Math.min(WORLD_H - RADIUS, player.y));
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
