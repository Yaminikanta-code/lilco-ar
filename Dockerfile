# syntax=docker/dockerfile:1

# --- builder: full deps, build the Vite frontend -----------------------
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# --- runtime: production deps only, serve dist/ + the API from Hono ----
FROM oven/bun:1 AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY server ./server
COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["bun", "run", "server/serve.mjs"]
