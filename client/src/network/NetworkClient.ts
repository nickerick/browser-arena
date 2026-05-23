const WS_URL = import.meta.env.DEV ? 'ws://localhost:3001' : `wss://${window.location.host}`;

type MessageHandler = (msg: unknown) => void;

export class NetworkClient {
  private socket: WebSocket | null = null;

  connect(onMessage: MessageHandler, onClose: () => void) {
    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (e) => {
      try {
        onMessage(JSON.parse(e.data));
      } catch {
        console.warn('unparseable message:', e.data);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      onClose();
    };
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}
