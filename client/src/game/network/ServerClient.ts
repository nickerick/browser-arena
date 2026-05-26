import type { ServerMessage } from '@browser-arena/shared';
import type { PlayerSystem } from '../systems/PlayerSystem';
import type { ProjectileSystem } from '../systems/ProjectileSystem';
import type { InputState } from '../InputHandler';
import { socket } from '../../api/socket';

/**
 * Manages all communication between the client and server.
 *
 * Outbound: sends player input and fire events each frame.
 *
 * Inbound: incoming server messages are held in a queue and applied synchronously
 * at the top of each game loop tick via flush(), keeping async network traffic
 * tied to the deterministic game loop rather than landing at arbitrary times.
 */
export class ServerClient {
  private players: PlayerSystem;
  private projectiles: ProjectileSystem;
  private unsubscribe: (() => void) | null = null;
  private messageQueue: ServerMessage[] = [];

  constructor(players: PlayerSystem, projectiles: ProjectileSystem) {
    this.players = players;
    this.projectiles = projectiles;
  }

  connect() {
    this.unsubscribe = socket.on((msg) => this.messageQueue.push(msg));
  }

  destroy() {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  sendInput({ moveX, moveY }: InputState) {
    const keys: string[] = [];
    if (moveY < 0) keys.push('w');
    if (moveY > 0) keys.push('s');
    if (moveX < 0) keys.push('a');
    if (moveX > 0) keys.push('d');
    socket.send({ type: 'input', keys });
  }

  sendFire(dirX: number, dirY: number) {
    socket.send({ type: 'fire', dirX, dirY });
  }

  /** Drains the message queue and applys all pending server updates.*/
  flush() {
    for (const msg of this.messageQueue) this.handle(msg);
    this.messageQueue = [];
  }

  private handle(msg: ServerMessage) {
    const myId = socket.playerId ?? '';
    if (msg.type === 'state_update') {
      this.players.applyServerUpdate(msg.players, myId);
      this.projectiles.setServerState(msg.projectiles, myId);
    } else if (msg.type === 'init') {
      this.players.reset();
    } else if (msg.type === 'player_hit') {
      this.projectiles.removeHit(msg.projectileId, msg.shooterId, myId);
      this.players.takeDamage(msg.targetId, myId);
    }
  }
}
