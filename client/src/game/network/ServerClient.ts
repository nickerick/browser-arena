import type { ServerMessage, PlayerState, ProjectileState } from '@browser-arena/shared';
import { WORLD_W, WORLD_H } from '@browser-arena/shared';
import type { Player } from '../entities/Player';
import { RemotePlayer } from '../entities/RemotePlayer';
import type { InputHandler, InputState } from '../InputHandler';
import type { ProjectileSystem } from '../systems/ProjectileSystem';
import { socket } from '../../api/socket';

export class ServerClient {
  private player: Player;
  private remotePlayers: Map<string, RemotePlayer>;
  private input: InputHandler;
  private projectiles: ProjectileSystem;
  private unsubscribe: (() => void) | null = null;

  constructor(
    player: Player,
    remotePlayers: Map<string, RemotePlayer>,
    input: InputHandler,
    projectiles: ProjectileSystem
  ) {
    this.player = player;
    this.remotePlayers = remotePlayers;
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

  sendInput({ dx, dy }: InputState) {
    const keys: string[] = [];
    if (dy < 0) keys.push('w');
    if (dy > 0) keys.push('s');
    if (dx < 0) keys.push('a');
    if (dx > 0) keys.push('d');
    socket.send({ type: 'input', keys });
  }

  sendFire(dirX: number, dirY: number) {
    socket.send({ type: 'fire', dirX, dirY });
  }

  handle(msg: ServerMessage) {
    if (msg.type === 'state_update') {
      this.applyStateUpdate(msg.players, msg.projectiles);
    } else if (msg.type === 'init') {
      this.player.reset(WORLD_W / 2, WORLD_H / 2);
      this.remotePlayers.clear();
    } else if (msg.type === 'player_hit') {
      const myId = socket.playerId ?? '';
      this.projectiles.removeHit(msg.projectileId, msg.shooterId, myId);
      if (msg.targetId === myId) {
        this.player.takeDamage();
      } else {
        this.remotePlayers.get(msg.targetId)?.takeDamage();
      }
    }
  }

  private applyStateUpdate(players: PlayerState[], projectiles: ProjectileState[]) {
    const myId = socket.playerId;

    for (const p of players) {
      if (p.id === myId) continue;
      const existing = this.remotePlayers.get(p.id);
      if (existing) {
        existing.moveTo(p.x, p.y);
      } else {
        this.remotePlayers.set(p.id, new RemotePlayer(p.id, p.x, p.y));
      }
    }

    const ids = new Set(players.map((p) => p.id));
    for (const id of this.remotePlayers.keys()) {
      if (!ids.has(id)) this.remotePlayers.delete(id);
    }

    const me = players.find((p) => p.id === myId);
    if (me) {
      this.player.reconcile(me.x, me.y, this.input.read().moving);
    }

    this.projectiles.updateRemote(projectiles, myId ?? '');
  }
}
