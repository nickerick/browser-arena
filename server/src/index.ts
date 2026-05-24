import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import path from 'path';
import { healthHandlers } from './handlers/health';
import { statsHandlers } from './handlers/stats';
import { registerGameGateway } from './game/gateway';

const app = Fastify({ logger: true });

// Plugins
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifyCors, { origin: true });

// Serves client bundle in production build
if (process.env.NODE_ENV === 'production') {
  app.register(fastifyStatic, {
    root: path.join(__dirname, '../../client/dist'),
  });
}

// Handlers
app.register(healthHandlers, { prefix: '/api' });
app.register(statsHandlers, { prefix: '/api' });

// WebSockets
registerGameGateway(app.server);

app.listen({ port: 3001, host: '0.0.0.0' }, (err) => {
  if (err) process.exit(1);
});
