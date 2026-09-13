// Production entry for the single-container Fly.io deployment, run under
// Bun (see Dockerfile) — one process serves the built frontend (dist/) AND
// the /api/classify-card route from the same Hono app. Local dev is
// unaffected: it still uses Vite's own dev server + server/node.mjs (Node).
import { serveStatic } from 'hono/bun'
import app from './app.mjs'

app.use('/*', serveStatic({ root: './dist' }))
// SPA fallback: any GET that didn't match a static file or the API route
// falls through to index.html so client-side routes (react-router) work on
// a hard refresh / direct link.
app.get('*', serveStatic({ path: './dist/index.html' }))

const port = Number(process.env.PORT) || 8080

console.log(`[lilco-ar] serving on http://0.0.0.0:${port}`)

export default { fetch: app.fetch, port }
