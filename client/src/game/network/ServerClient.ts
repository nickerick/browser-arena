import type { ServerMessage } from '@browser-arena/shared';
import type { PlayerSystem } from '../systems/PlayerSystem';
import type { ProjectileSystem } from '../systems/ProjectileSystem';
import type { InputHandler, InputState } from '../InputHandler';
import { socket } from '../../api/socket';

/**
 * Manages all communication between the client and server.
 *
 * Outbound: sends player input and events each frame.
 * Inbound: receives server messages and routes them to the appropriate systems
 * (PlayerSystem for position updates, ProjectileSystem for projectile state, etc).
 */
export class ServerClient {
  private players: PlayerSystem;
  private projectiles: ProjectileSystem;
  private input: InputHandler;
  private unsubscribe: (() => void) | null = null;
  
  /** Incoming server messages waiting to be applied at the top of the next frame. */
  private queue: ServerMessage[] = [];

  constructor(players: PlayerSystem, input: InputHandler, projectiles: ProjectileSystem) {
    this.players = players;
    this.input = input;
    this.projectiles = projectiles;
  }

  connect() {
    this.unsubscribe = socket.on((msg) => this.queue.push(msg));
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
    for (const msg of this.queue) this.handle(msg);
    this.queue = [];
  }

  private handle(msg: ServerMessage) {
    const myId = socket.playerId ?? '';
    if (msg.type === 'state_update') {
      this.players.applyServerUpdate(msg.players, myId, this.input.read().moving);
      this.projectiles.updateRemote(msg.projectiles, myId);
    } else if (msg.type === 'init') {
      this.players.reset();
    } else if (msg.type === 'player_hit') {
      this.projectiles.removeHit(msg.projectileId, msg.shooterId, myId);
      this.players.takeDamage(msg.targetId, myId);
    }
  }
}
