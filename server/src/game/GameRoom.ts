import { WebSocket } from 'ws';
import {
  PlayerState,
  ProjectileState,
  ServerMessage,
  ClientMessage,
  WORLD_W,
  WORLD_H,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  TICK_RATE,
  PROJECTILE_SPEED,
  PROJECTILE_RADIUS,
  PROJECTILE_LIFETIME,
  testHit,
} from '@browser-arena/shared';

const DT = 1 / TICK_RATE;
const MOVE_SPEED = PLAYER_SPEED * DT;

interface ConnectedPlayer extends PlayerState {
  socket: WebSocket;
  moveX: number;
  moveY: number;
}

interface ServerProjectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
}

export class GameRoom {
  private players = new Map<string, ConnectedPlayer>();
  private projectiles = new Map<string, ServerProjectile>();

  constructor() {
    setInterval(() => this.tick(), 1000 / TICK_RATE);
  }

  addPlayer(socket: WebSocket): string {
    const id = crypto.randomUUID();
    this.players.set(id, {
      id,
      x: Math.random() * (WORLD_W - PLAYER_RADIUS * 4) + PLAYER_RADIUS * 2,
      y: Math.random() * (WORLD_H - PLAYER_RADIUS * 4) + PLAYER_RADIUS * 2,
      socket,
      moveX: 0,
      moveY: 0,
    });
    this.sendTo(socket, { type: 'init', id });
    return id;
  }

  handleMessage(playerId: string, msg: ClientMessage) {
    const player = this.players.get(playerId);
    if (!player) return;
    switch (msg.type) {
      case 'input':
        player.moveX = msg.moveX;
        player.moveY = msg.moveY;
        break;
      case 'fire':
        this.spawnProjectile(playerId, msg.dirX, msg.dirY);
        break;
    }
  }

  removePlayer(id: string) {
    this.players.delete(id);
  }

  private spawnProjectile(ownerId: string, dirX: number, dirY: number) {
    const owner = this.players.get(ownerId);
    if (!owner) return;
    const id = crypto.randomUUID();
    this.projectiles.set(id, {
      id,
      ownerId,
      x: owner.x,
      y: owner.y,
      vx: dirX * PROJECTILE_SPEED,
      vy: dirY * PROJECTILE_SPEED,
      age: 0,
    });
  }

  private tick() {
    this.processInputs();
    this.resolveCollisions();
    this.tickProjectiles();
    this.broadcast({
      type: 'state_update',
      players: [...this.players.values()].map(({ id, x, y }) => ({ id, x, y })),
      projectiles: [...this.projectiles.values()].map(({ id, x, y, vx, vy, ownerId }) => ({
        id,
        x,
        y,
        vx,
        vy,
        ownerId,
      })),
    });
  }

  private tickProjectiles() {
    for (const [id, p] of this.projectiles) {
      p.age += DT;
      p.x += p.vx * DT;
      p.y += p.vy * DT;

      if (p.x - PROJECTILE_RADIUS < 0) {
        p.x = PROJECTILE_RADIUS;
        p.vx = Math.abs(p.vx);
      }
      if (p.x + PROJECTILE_RADIUS > WORLD_W) {
        p.x = WORLD_W - PROJECTILE_RADIUS;
        p.vx = -Math.abs(p.vx);
      }
      if (p.y - PROJECTILE_RADIUS < 0) {
        p.y = PROJECTILE_RADIUS;
        p.vy = Math.abs(p.vy);
      }
      if (p.y + PROJECTILE_RADIUS > WORLD_H) {
        p.y = WORLD_H - PROJECTILE_RADIUS;
        p.vy = -Math.abs(p.vy);
      }

      if (p.age >= PROJECTILE_LIFETIME) {
        this.projectiles.delete(id);
        continue;
      }

      for (const [playerId, player] of this.players) {
        if (playerId === p.ownerId) continue;
        if (testHit(p.x, p.y, player.x, player.y)) {
          this.projectiles.delete(id);
          this.broadcast({
            type: 'player_hit',
            targetId: playerId,
            shooterId: p.ownerId,
            projectileId: id,
          });
          break;
        }
      }
    }
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
      let { moveX, moveY } = player;

      // normalize so diagonal movement isn't faster than cardinal
      const len = Math.sqrt(moveX * moveX + moveY * moveY);
      if (len > 0) { moveX /= len; moveY /= len; }

      player.x = Math.max(PLAYER_RADIUS, Math.min(WORLD_W - PLAYER_RADIUS, player.x + moveX * MOVE_SPEED));
      player.y = Math.max(PLAYER_RADIUS, Math.min(WORLD_H - PLAYER_RADIUS, player.y + moveY * MOVE_SPEED));
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
