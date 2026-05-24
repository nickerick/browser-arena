import type { FastifyPluginAsync } from 'fastify';
import type { ApiResponse, PlayerStats } from '@browser-arena/shared';
import { getPlayerStats } from '../store/playerStore';

export const statsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Reply: ApiResponse<PlayerStats> }>('/api/stats', async () => {
    return { ok: true, data: getPlayerStats() };
  });
};
