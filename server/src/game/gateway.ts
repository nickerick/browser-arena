import type { Server } from 'http';
import { WebSocketServer } from 'ws';
import { GameRoom } from './GameRoom';

export function registerGameGateway(server: Server) {
  const wss = new WebSocketServer({ server });
  const room = new GameRoom();

  wss.on('connection', (socket) => {
    const playerId = room.addPlayer(socket);
    console.log(`player connected: ${playerId} — total: ${wss.clients.size}`);

    socket.on('message', (data) => {
      try {
        room.handleMessage(playerId, JSON.parse(data.toString()));
      } catch {}
    });

    socket.on('close', () => {
      room.removePlayer(playerId);
      console.log(`player disconnected: ${playerId} — total: ${wss.clients.size}`);
    });
  });
}
