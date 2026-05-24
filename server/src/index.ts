import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';

const app = Fastify({ logger: true });

app.register(fastifyCors, { origin: true });

if (process.env.NODE_ENV === 'production') {
  app.register(fastifyStatic, {
    root: path.join(__dirname, '../../client/dist'),
  });
}

app.get('/api/health', async () => ({ status: 'ok' }));
app.get('/api/ping', async () => ({ message: 'pong', timestamp: Date.now() }));

const wss = new WebSocketServer({ server: app.server });

wss.on('connection', (socket) => {
  console.log('client connected, total:', wss.clients.size);
  socket.send(JSON.stringify({ type: 'connected', playerCount: wss.clients.size }));

  socket.on('close', () => {
    console.log('client disconnected, total:', wss.clients.size);
  });
});

app.listen({ port: 3001 }, (err) => {
  if (err) process.exit(1);
});
