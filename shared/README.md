# shared

Types and schemas shared between client and server.

## Structure

```
src/
  api.ts       # ApiResponse<T> — the RPC response envelope
  messages.ts  # WebSocket message types — ServerMessage, ClientMessage, PlayerState
  stats.ts     # PlayerStats schema and type, GetStatsRequest schema and type
  index.ts     # Re-exports everything
```

## Conventions

- Zod schemas are the source of truth — TypeScript types are derived via `z.infer<>`, never defined separately.
- Each HTTP domain gets its own file with a request schema and a response schema.
- WebSocket message types live in `messages.ts` and are plain TypeScript interfaces (no Zod needed).
- If only the server or only the client needs a type, it stays in that package — shared is for types both sides use.
