import type { ClientMessage, ServerMessage } from '@browser-arena/shared';

const WS_URL = import.meta.env.DEV
  ? 'ws://localhost:3001'
  : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

type MessageHandler = (msg: ServerMessage) => void;

class GameSocket {
  private ws: WebSocket | null = null;
  private handlers = new Set<MessageHandler>();
  playerId: string | null = null;

  on(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  connect(onClose: () => void) {
    this.ws = new WebSocket(WS_URL);
    this.ws.onmessage = (e) => {
      try {
        const msg: ServerMessage = JSON.parse(e.data);
        if (msg.type === 'init') this.playerId = msg.id;
        this.handlers.forEach(h => h(msg));
      } catch {
        console.warn('unparseable message:', e.data);
      }
    };
    this.ws.onclose = () => {
      this.playerId = null;
      onClose();
    };
  }

  send(msg: ClientMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}

export const socket = new GameSocket();
