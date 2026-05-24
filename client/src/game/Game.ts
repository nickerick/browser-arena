import type { PlayerState, ServerMessage } from '@browser-arena/shared';
import { InputHandler } from './InputHandler';
import { NetworkClient } from '../network/NetworkClient';

const RADIUS = 20;
// Matches server: 20px/tick * 20ticks/s
const SPEED_PPS = 400;
const WORLD_W = 800;
const WORLD_H = 500;

export class Game {
  private ctx: CanvasRenderingContext2D;
  private input: InputHandler;
  private network: NetworkClient;
  private animationFrame: number | null = null;
  private w: number;
  private h: number;

  private players: PlayerState[] = [];
  private myX = WORLD_W / 2;
  private myY = WORLD_H / 2;
  private lastTimestamp: number | null = null;

  constructor(canvas: HTMLCanvasElement, network: NetworkClient) {
    this.ctx = canvas.getContext('2d')!;
    this.input = new InputHandler();
    this.network = network;

    const dpr = window.devicePixelRatio || 1;
    this.w = canvas.clientWidth;
    this.h = canvas.clientHeight;
    canvas.width = this.w * dpr;
    canvas.height = this.h * dpr;
    this.ctx.scale(dpr, dpr);
  }

  onServerMessage(msg: ServerMessage) {
    if (msg.type === 'state_update') {
      this.players = msg.players;
      const me = msg.players.find(p => p.id === this.network.playerId);
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
      // Will get our spawn position on the first state_update; reset to center for now
      this.myX = WORLD_W / 2;
      this.myY = WORLD_H / 2;
    }
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
    return input.isDown('w') || input.isDown('s') || input.isDown('a') || input.isDown('d')
        || input.isDown('arrowup') || input.isDown('arrowdown') || input.isDown('arrowleft') || input.isDown('arrowright');
  }

  private predictMovement(dt: number) {
    const speed = SPEED_PPS * dt;
    if (this.input.isDown('w') || this.input.isDown('arrowup'))    this.myY -= speed;
    if (this.input.isDown('s') || this.input.isDown('arrowdown'))  this.myY += speed;
    if (this.input.isDown('a') || this.input.isDown('arrowleft'))  this.myX -= speed;
    if (this.input.isDown('d') || this.input.isDown('arrowright')) this.myX += speed;

    this.myX = Math.max(RADIUS, Math.min(WORLD_W - RADIUS, this.myX));
    this.myY = Math.max(RADIUS, Math.min(WORLD_H - RADIUS, this.myY));
  }

  private sendInput() {
    const keys: string[] = [];
    if (this.input.isDown('w') || this.input.isDown('arrowup'))    keys.push('w');
    if (this.input.isDown('s') || this.input.isDown('arrowdown'))  keys.push('s');
    if (this.input.isDown('a') || this.input.isDown('arrowleft'))  keys.push('a');
    if (this.input.isDown('d') || this.input.isDown('arrowright')) keys.push('d');
    this.network.send({ type: 'input', keys });
  }

  private render() {
    const { ctx, w, h } = this;
    const myId = this.network.playerId;

    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, w, h);

    for (const player of this.players) {
      const isMe = player.id === myId;
      const x = isMe ? this.myX : player.x;
      const y = isMe ? this.myY : player.y;

      ctx.fillStyle = isMe ? '#4ecca3' : '#f4a261';
      ctx.beginPath();
      ctx.arc(x, y, RADIUS, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isMe ? 'you' : 'enemy', x, y - RADIUS - 6);
    }
  }

  destroy() {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.input.destroy();
  }
}
