import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/health', async () => ({ status: 'ok' }));
  fastify.get('/api/ping', async () => ({ message: 'pong', timestamp: Date.now() }));
};
