# server

Fastify HTTP server + WebSocket game server.

## Structure

```
src/
  index.ts          # Bootstrap — registers plugins, handlers, and the game gateway
  handlers/
    health.ts       # GET /api/health, GET /api/ping
    stats.ts        # POST /api/getStats
  game/
    gateway.ts      # WebSocket server — manages player connections and routes messages
    GameRoom.ts     # Game session — tick loop, physics, state broadcast
  store/
    playerStore.ts  # Data access layer — hardcoded now, DB later
  lib/
    rpc.ts          # rpc() helper — wraps handlers in ApiResponse, validates request body
```

## Conventions

- All API endpoints are POST with a JSON request body — no query params.
- Handlers use `rpc()` from `lib/rpc.ts` which wraps responses in `ApiResponse<T>` and catches errors automatically.
- New domains get a file in `handlers/` and one `app.register()` line in `index.ts`.
- Store functions are plain async functions — no framework coupling, easy to unit test.
