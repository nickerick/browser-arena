import type { FastifyInstance } from 'fastify';
import type { ZodTypeAny, z } from 'zod';
import type { ApiResponse } from '@browser-arena/shared';

/**
 * Registers an RPC-style POST handler. The handler returns data directly —
 * rpc() wraps it in ApiResponse and catches errors automatically.
 *
 * @example
 * rpc(fastify, '/getStats', GetStatsRequestSchema, async (): Promise<PlayerStats> => {
 *   return getPlayerStats();
 * });
 */
export function rpc<TBody extends ZodTypeAny, TReply>(
  fastify: FastifyInstance,
  path: string,
  bodySchema: TBody,
  handler: (body: z.infer<TBody>) => Promise<TReply>
) {
  fastify.post<{ Reply: ApiResponse<TReply> }>(
    path,
    { schema: { body: bodySchema } },
    async (req) => {
      try {
        const data = await handler(req.body as z.infer<TBody>);
        return { ok: true as const, data };
      } catch (e) {
        return { ok: false as const, error: e instanceof Error ? e.message : 'unknown error' };
      }
    }
  );
}
