# client

React + Vite frontend.

## Structure

```
src/
  api/
    socket.ts       # WebSocket singleton — connects to the game server
    stats.ts        # HTTP fetch wrapper for the stats API
  game/
    Game.ts         # Canvas game loop — rendering, physics prediction, input
    InputHandler.ts # Keyboard state tracker
  components/
    GameCanvas.tsx  # Mounts the canvas and manages the game/socket lifecycle
```

## Conventions

- `api/` — anything that talks to the server. `socket.ts` for the WebSocket connection, one file per HTTP domain.
- `game/` — imperative canvas code, no React state. Subscribes to socket events via `socket.on()`.
- New HTTP endpoints get a fetch wrapper in `api/` and a SWR hook in `hooks/` (when added).
