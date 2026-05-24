import type { ServerMessage } from '@browser-arena/shared';
import { InputHandler } from './InputHandler';
import { socket } from '../api/socket';

const RADIUS = 20;
// Matches server: 20px/tick * 20ticks/s
const SPEED_PPS = 400;
const WORLD_W = 800;
const WORLD_H = 500;
const SERVER_TICK_MS = 1000 / 20;

interface RemotePlayer {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  lastUpdateAt: number;
}

export class Game {
  private ctx: CanvasRenderingContext2D;
  private input: InputHandler;
  private animationFrame: number | null = null;
  private unsubscribe: () => void;
  private w: number;
  private h: number;

  private remotePlayers = new Map<string, RemotePlayer>();
  private myX = WORLD_W / 2;
  private myY = WORLD_H / 2;
  private lastTimestamp: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.input = new InputHandler();
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
      const now = performance.now();
      const myId = socket.playerId;

      for (const p of msg.players) {
        if (p.id === myId) continue;
        const existing = this.remotePlayers.get(p.id);
        this.remotePlayers.set(p.id, {
          id: p.id,
          fromX: existing ? this.interpolatedPos(existing).x : p.x,
          fromY: existing ? this.interpolatedPos(existing).y : p.y,
          toX: p.x,
          toY: p.y,
          lastUpdateAt: now,
        });
      }

      // Remove players who left
      const ids = new Set(msg.players.map((p) => p.id));
      for (const id of this.remotePlayers.keys()) {
        if (!ids.has(id)) this.remotePlayers.delete(id);
      }

      const me = msg.players.find((p) => p.id === myId);
      if (me) {
        const dx = me.x - this.myX;
        const dy = me.y - this.myY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 80) {
          this.myX = me.x;
          this.myY = me.y;
        } else if (dist > 4 && this.isMoving()) {
          // Only soft-correct while moving — stopping causes the server to lag
          // behind our prediction, and reconciling it back causes visible rubberband
          this.myX += dx * 0.2;
          this.myY += dy * 0.2;
        }
      }
    } else if (msg.type === 'init') {
      this.myX = WORLD_W / 2;
      this.myY = WORLD_H / 2;
      this.remotePlayers.clear();
    }
  }

  private interpolatedPos(p: RemotePlayer): { x: number; y: number } {
    const t = Math.min(1, (performance.now() - p.lastUpdateAt) / SERVER_TICK_MS);
    return {
      x: p.fromX + (p.toX - p.fromX) * t,
      y: p.fromY + (p.toY - p.fromY) * t,
    };
  }

  start() {
    this.animationFrame = requestAnimationFrame((t) => this.loop(t));
  }

  private loop(timestamp: number) {
    const dt = this.lastTimestamp !== null ? (timestamp - this.lastTimestamp) / 1000 : 0;
    this.lastTimestamp = timestamp;

    this.predictMovement(dt);
    this.sendInput();
    this.render();
    this.animationFrame = requestAnimationFrame((t) => this.loop(t));
  }

  private isMoving() {
    const { input } = this;
    return (
      input.isDown('w') ||
      input.isDown('s') ||
      input.isDown('a') ||
      input.isDown('d') ||
      input.isDown('arrowup') ||
      input.isDown('arrowdown') ||
      input.isDown('arrowleft') ||
      input.isDown('arrowright')
    );
  }

  private predictMovement(dt: number) {
    const speed = SPEED_PPS * dt;
    if (this.input.isDown('w') || this.input.isDown('arrowup')) this.myY -= speed;
    if (this.input.isDown('s') || this.input.isDown('arrowdown')) this.myY += speed;
    if (this.input.isDown('a') || this.input.isDown('arrowleft')) this.myX -= speed;
    if (this.input.isDown('d') || this.input.isDown('arrowright')) this.myX += speed;

    this.myX = Math.max(RADIUS, Math.min(WORLD_W - RADIUS, this.myX));
    this.myY = Math.max(RADIUS, Math.min(WORLD_H - RADIUS, this.myY));
  }

  private sendInput() {
    const keys: string[] = [];
    if (this.input.isDown('w') || this.input.isDown('arrowup')) keys.push('w');
    if (this.input.isDown('s') || this.input.isDown('arrowdown')) keys.push('s');
    if (this.input.isDown('a') || this.input.isDown('arrowleft')) keys.push('a');
    if (this.input.isDown('d') || this.input.isDown('arrowright')) keys.push('d');
    socket.send({ type: 'input', keys });
  }

  private drawHeart(x: number, y: number) {
    const { ctx } = this;
    const r = RADIUS;
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, r * 0.35);
    ctx.bezierCurveTo(r * 0.5, r * 0.1, r, -r * 0.35, r * 0.5, -r * 0.65);
    ctx.bezierCurveTo(r * 0.2, -r * 0.9, 0, -r * 0.7, 0, -r * 0.35);
    ctx.bezierCurveTo(0, -r * 0.7, -r * 0.2, -r * 0.9, -r * 0.5, -r * 0.65);
    ctx.bezierCurveTo(-r, -r * 0.35, -r * 0.5, r * 0.1, 0, r * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private render() {
    const { ctx, w, h } = this;

    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, w, h);

    // Local player
    if (socket.playerId) {
      ctx.fillStyle = '#4ecca3';
      this.drawHeart(this.myX, this.myY);
      ctx.fillStyle = '#fff';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('you', this.myX, this.myY - RADIUS - 6);
    }

    // Remote players — interpolated
    for (const remote of this.remotePlayers.values()) {
      const { x, y } = this.interpolatedPos(remote);
      ctx.fillStyle = '#ff69b4';
      this.drawHeart(x, y);
      ctx.fillStyle = '#fff';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Babbi', x, y - RADIUS - 6);
    }
  }

  destroy() {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.input.destroy();
    this.unsubscribe();
  }
}
