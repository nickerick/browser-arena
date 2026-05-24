import type { FastifyPluginAsync } from 'fastify';
import type { ApiResponse, PlayerStats, GetStatsRequest } from '@browser-arena/shared';
import { getPlayerStats } from '../store/playerStore';

export const statsHandlers: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: GetStatsRequest; Reply: ApiResponse<PlayerStats> }>('/getStats', async () => {
    return { ok: true, data: getPlayerStats() };
  });
};
