import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { type PlayerStats, GetStatsRequestSchema } from '@browser-arena/shared';
import { getPlayerStats } from '../store/playerStore';
import { rpc } from '../lib/rpc';

export const statsHandlers: FastifyPluginAsyncZod = async (fastify) => {
  rpc(fastify, '/getStats', GetStatsRequestSchema, async (): Promise<PlayerStats> => {
    return getPlayerStats();
  });
};
