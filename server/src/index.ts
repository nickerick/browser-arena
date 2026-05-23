import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import path from 'path';

const app = Fastify({ logger: true });

app.register(fastifyCors, { origin: true });

if (process.env.NODE_ENV === 'production') {
  app.register(fastifyStatic, {
    root: path.join(__dirname, '../../client/dist'),
  });
}

app.get('/api/health', async () => ({ status: 'ok' }));

app.listen({ port: 3001 }, (err) => {
  if (err) process.exit(1);
});
