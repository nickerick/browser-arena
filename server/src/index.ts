import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import { WebSocketServer } from 'ws';
import path from 'path';
import { GameRoom } from './game/GameRoom';
import { healthHandlers } from './handlers/health';
import { statsHandlers } from './handlers/stats';

const app = Fastify({ logger: true });
const room = new GameRoom();

app.register(fastifyCors, { origin: true });
app.register(healthHandlers, { prefix: '/api' });
app.register(statsHandlers, { prefix: '/api' });

if (process.env.NODE_ENV === 'production') {
  app.register(fastifyStatic, {
    root: path.join(__dirname, '../../client/dist'),
  });
}

const wss = new WebSocketServer({ server: app.server });

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

app.listen({ port: 3001, host: '0.0.0.0' }, (err) => {
  if (err) process.exit(1);
});
