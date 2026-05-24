import type { ClientMessage, ServerMessage } from '@browser-arena/shared';

const WS_URL = import.meta.env.DEV
  ? 'ws://localhost:3001'
  : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

export class NetworkClient {
  private socket: WebSocket | null = null;
  playerId: string | null = null;

  connect(onMessage: (msg: ServerMessage) => void, onClose: () => void) {
    this.socket = new WebSocket(WS_URL);

    this.socket.onmessage = (e) => {
      try {
        const msg: ServerMessage = JSON.parse(e.data);
        if (msg.type === 'init') this.playerId = msg.id;
        onMessage(msg);
      } catch {
        console.warn('unparseable message:', e.data);
      }
    };

    this.socket.onclose = () => {
      this.playerId = null;
      onClose();
    };
  }

  send(msg: ClientMessage) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    }
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}
