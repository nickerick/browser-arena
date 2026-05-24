import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import path from 'path';
import { healthHandlers } from './handlers/health';
import { statsHandlers } from './handlers/stats';
import { registerGameGateway } from './game/gateway';

const app = Fastify({ logger: true });

app.register(fastifyCors, { origin: true });
app.register(healthHandlers, { prefix: '/api' });
app.register(statsHandlers, { prefix: '/api' });

if (process.env.NODE_ENV === 'production') {
  app.register(fastifyStatic, {
    root: path.join(__dirname, '../../client/dist'),
  });
}

app.listen({ port: 3001, host: '0.0.0.0' }, (err) => {
  if (err) process.exit(1);
  registerGameGateway(app.server);
});
