/**
 * Envelope for all HTTP API responses.
 *
 * Every handler returns one of these — success carries typed data,
 * failure carries an error string. Callers discriminate on `ok`.
 *
 * @example
 * const result = await fetchPlayerStats();
 * if (result.ok) {
 *   console.log(result.data.kills);
 * } else {
 *   console.error(result.error);
 * }
 */
export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };
