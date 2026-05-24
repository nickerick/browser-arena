import type { ApiResponse, PlayerStats } from '@browser-arena/shared';

export async function fetchPlayerStats(): Promise<ApiResponse<PlayerStats>> {
  const res = await fetch('/api/stats');
  if (!res.ok) return { ok: false, error: 'request failed' };
  return res.json();
}
