import type { ServerMessage } from '@browser-arena/shared';
import type { PlayerSystem } from '../systems/PlayerSystem';
import type { ProjectileSystem } from '../systems/ProjectileSystem';
import type { InputHandler, InputState } from '../InputHandler';
import { socket } from '../../api/socket';

export class ServerClient {
  private players: PlayerSystem;
  private projectiles: ProjectileSystem;
  private input: InputHandler;
  private unsubscribe: (() => void) | null = null;

  constructor(players: PlayerSystem, input: InputHandler, projectiles: ProjectileSystem) {
    this.players = players;
    this.input = input;
    this.projectiles = projectiles;
  }

  connect() {
    this.unsubscribe = socket.on((msg) => this.handle(msg));
  }

  destroy() {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  /** True once the server has assigned us a player ID. */
  get isConnected() {
    return !!socket.playerId;
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
