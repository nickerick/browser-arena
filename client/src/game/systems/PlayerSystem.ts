import { WORLD_W, WORLD_H } from '@browser-arena/shared';
import { Player } from '../entities/Player';
import { RemotePlayer } from '../entities/RemotePlayer';
import type { InputState } from '../InputHandler';

export class PlayerSystem {
  /** The local player controlled by this client. */
  readonly local: Player;
  /** All other connected players, keyed by player ID. */
  readonly remote = new Map<string, RemotePlayer>();

  constructor() {
    this.local = new Player(WORLD_W / 2, WORLD_H / 2);
  }

  /** Advance all player state one frame. */
  update(dt: number, input: InputState) {
    this.local.update(dt, input);
    for (const remote of this.remote.values()) remote.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.local.draw(ctx);
    for (const remote of this.remote.values()) remote.draw(ctx);
  }

  /** Apply a server state update — reconcile local player and sync remote players. */
  applyServerUpdate(players: { id: string; x: number; y: number }[], myId: string, isMoving: boolean) {
    const me = players.find((p) => p.id === myId);
    if (me) this.local.reconcile(me.x, me.y, isMoving);

    for (const p of players) {
      if (p.id === myId) continue;
      const existing = this.remote.get(p.id);
      if (existing) {
        existing.moveTo(p.x, p.y);
      } else {
        this.remote.set(p.id, new RemotePlayer(p.id, p.x, p.y));
      }
    }

    const serverIds = new Set(players.map((p) => p.id));
    for (const id of this.remote.keys()) {
      if (!serverIds.has(id)) this.remote.delete(id);
    }
  }

  /** Trigger a hit flash on the player with the given ID. */
  takeDamage(targetId: string, myId: string) {
    if (targetId === myId) {
      this.local.takeDamage();
    } else {
      this.remote.get(targetId)?.takeDamage();
    }
  }

  /** Reset local player position and clear all remote players. */
  reset() {
    this.local.reset(WORLD_W / 2, WORLD_H / 2);
    this.remote.clear();
  }
}
