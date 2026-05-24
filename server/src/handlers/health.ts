import type { FastifyPluginAsync } from 'fastify';

export const healthHandlers: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => ({ status: 'ok' }));
  fastify.get('/ping', async () => ({ message: 'pong', timestamp: Date.now() }));
};
