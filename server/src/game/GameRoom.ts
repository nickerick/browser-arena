import { WebSocket } from 'ws';
import type { ClientMessage, ServerMessage } from '@browser-arena/shared';
import { TICK_RATE } from '@browser-arena/shared';
import { PlayerSystem } from './systems/PlayerSystem';
import { ProjectileSystem } from './systems/ProjectileSystem';
import { CollisionSystem } from './systems/CollisionSystem';

/**
 * Owns the game tick loop and orchestrates all systems.
 * Handles player connections and routes incoming client messages.
 */
export class GameRoom {
  private players = new PlayerSystem();
  private projectiles = new ProjectileSystem();
  private collisions = new CollisionSystem();

  constructor() {
    setInterval(() => this.tick(), 1000 / TICK_RATE);
  }

  /** Register a new player over the given socket and return their assigned ID. */
  addPlayer(socket: WebSocket): string {
    return this.players.add(socket);
  }

  /** Deregister a player when their connection closes. */
  removePlayer(id: string) {
    this.players.remove(id);
  }

  /** Route an incoming client message to the appropriate system. */
  handleMessage(playerId: string, msg: ClientMessage) {
    switch (msg.type) {
      case 'input':
        this.players.setInput(playerId, msg.moveX, msg.moveY);
        break;
      case 'fire': {
        const player = this.players.get(playerId);
        if (player) this.projectiles.spawn(playerId, player.x, player.y, msg.dirX, msg.dirY);
        break;
      }
    }
  }

  /**
   * Core server update step, called once per tick by setInterval.
   * Advances all simulation, resolves hits, then broadcasts the new state to all clients.
   */
  private tick() {
    this.players.processInputs();
    this.collisions.resolve(this.players.all);

    const hits = this.projectiles.tick(this.players.all);
    for (const hit of hits) {
      this.broadcast({ type: 'player_hit', ...hit });
    }

    this.broadcast({
      type: 'state_update',
      players: this.players.all.map(({ id, x, y }) => ({ id, x, y })),
      projectiles: this.projectiles.snapshot,
    });
  }

  /** Serialize a message once and deliver it to every connected player. */
  private broadcast(msg: ServerMessage) {
    const payload = JSON.stringify(msg);
    for (const player of this.players.all) {
      if (player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(payload);
      }
    }
  }
}
