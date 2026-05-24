import type { ApiResponse, PlayerStats, GetStatsRequest } from '@browser-arena/shared';

export async function fetchPlayerStats(body: GetStatsRequest = {}): Promise<ApiResponse<PlayerStats>> {
  const res = await fetch('/api/getStats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return { ok: false, error: 'request failed' };
  return res.json();
}
