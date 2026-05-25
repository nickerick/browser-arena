import type { ServerMessage } from '@browser-arena/shared';
import { WORLD_W, WORLD_H } from '@browser-arena/shared';
import { InputHandler, type InputState } from './InputHandler';
import { Player } from './entities/Player';
import { RemotePlayer } from './entities/RemotePlayer';
import { ProjectileSystem } from './ProjectileSystem';
import { Arena } from './world/Arena';
import { socket } from '../api/socket';

export class Game {
  /** 2D drawing context for the canvas. */
  private ctx: CanvasRenderingContext2D;
  /** Reads keyboard state each frame. */
  private input: InputHandler;
  /** The local player. */
  private player: Player;
  /** Other connected players, keyed by player ID. */
  private remotePlayers = new Map<string, RemotePlayer>();
  /** Manages all in-flight projectiles. */
  private projectiles: ProjectileSystem;
  /** Current map — responsible for drawing the background. */
  private arena: Arena;
  /** Handle returned by requestAnimationFrame, used to cancel the loop on destroy. */
  private animationFrame: number | null = null;
  /** Cancels the socket message subscription on destroy. */
  private unsubscribe: () => void;
  /** Canvas logical width in CSS pixels (not scaled by devicePixelRatio). */
  private w: number;
  /** Canvas logical height in CSS pixels (not scaled by devicePixelRatio). */
  private h: number;
  /** Timestamp of the previous frame, used to compute dt (delta time in seconds). */
  private lastTimestamp: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.input = new InputHandler();
    this.player = new Player(WORLD_W / 2, WORLD_H / 2);
    this.projectiles = new ProjectileSystem();
    this.arena = new Arena();
    this.unsubscribe = socket.on((msg) => this.onServerMessage(msg));

    const dpr = window.devicePixelRatio || 1;
    this.w = canvas.clientWidth;
    this.h = canvas.clientHeight;
    canvas.width = this.w * dpr;
    canvas.height = this.h * dpr;
    this.ctx.scale(dpr, dpr);
  }

  onServerMessage(msg: ServerMessage) {
    if (msg.type === 'state_update') {
      const myId = socket.playerId;

      for (const p of msg.players) {
        if (p.id === myId) continue;
        const existing = this.remotePlayers.get(p.id);
        if (existing) {
          existing.moveTo(p.x, p.y);
        } else {
          this.remotePlayers.set(p.id, new RemotePlayer(p.id, p.x, p.y));
        }
      }

      const ids = new Set(msg.players.map((p) => p.id));
      for (const id of this.remotePlayers.keys()) {
        if (!ids.has(id)) this.remotePlayers.delete(id);
      }

      const me = msg.players.find((p) => p.id === myId);
      if (me) {
        this.player.reconcile(me.x, me.y, this.input.read().moving);
      }
    } else if (msg.type === 'init') {
      this.player.reset(WORLD_W / 2, WORLD_H / 2);
      this.remotePlayers.clear();
    }
  }

  start() {
    this.animationFrame = requestAnimationFrame((t) => this.loop(t));
  }

  private loop(timestamp: number) {
    const dt = this.lastTimestamp !== null ? (timestamp - this.lastTimestamp) / 1000 : 0;
    this.lastTimestamp = timestamp;

    const input = this.input.read();
    this.player.update(dt, input);
    if (this.player.fireIntent) {
      this.projectiles.fire(this.player.x, this.player.y, this.player.dirX, this.player.dirY);
    }
    this.projectiles.update(dt, WORLD_W, WORLD_H);
    this.sendInput(input);
    this.render();
    this.animationFrame = requestAnimationFrame((t) => this.loop(t));
  }

  private sendInput({ dx, dy }: InputState) {
    const keys: string[] = [];
    if (dy < 0) keys.push('w');
    if (dy > 0) keys.push('s');
    if (dx < 0) keys.push('a');
    if (dx > 0) keys.push('d');
    socket.send({ type: 'input', keys });
  }

  private render() {
    const { ctx } = this;
    this.arena.draw(ctx);

    if (socket.playerId) this.player.draw(ctx);
    this.projectiles.draw(ctx);
    for (const remote of this.remotePlayers.values()) remote.draw(ctx);
  }

  destroy() {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.input.destroy();
    this.unsubscribe();
  }
}
