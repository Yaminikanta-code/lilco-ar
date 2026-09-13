// Local-dev API server (Bun-native — no @hono/node-server needed). Serves
// only /api/classify-card; the frontend is served separately by Vite's own
// dev server, which proxies /api/* here (see vite.config.js). The
// production entry (server/serve.mjs) additionally serves the built static
// files from one process, which is what actually runs in the Fly.io deploy.
import app from './app.mjs'

const port = Number(process.env.PORT) || 8787

console.log(`[classify-card server] listening on http://localhost:${port}`)

export default { fetch: app.fetch, port }
