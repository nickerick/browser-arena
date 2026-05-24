import type { FastifyPluginAsync } from 'fastify';
import type { ApiResponse, PlayerStats } from '@browser-arena/shared';
import { getPlayerStats } from '../store/playerStore';

export const statsHandlers: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Reply: ApiResponse<PlayerStats> }>('/getStats', async () => {
    return { ok: true, data: getPlayerStats() };
  });
};
