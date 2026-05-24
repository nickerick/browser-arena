# Stage 1: Build everything
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/
RUN npm ci

COPY . .
# shared has no build step — it's compiled directly by client (vite alias) and server (tsc include)
RUN npm run build -w client && npm run build -w server

# Stage 2: Install production deps only (standalone, no workspace overhead)
FROM node:24-alpine AS prod-deps
WORKDIR /app/server
COPY server/package.json ./
RUN npm install --omit=dev

# Stage 3: Lean runtime image
FROM node:24-alpine
WORKDIR /app

COPY --from=builder /app/server/dist ./server/dist
# Server expects client assets at ../../client/dist relative to __dirname (server/dist/server/src)
COPY --from=builder /app/client/dist ./server/dist/client/dist
COPY --from=prod-deps /app/server/node_modules ./server/node_modules

EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "server/dist/server/src/index.js"]
