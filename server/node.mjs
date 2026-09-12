// Plain Node runner for the Hono app — local dev and generic self-hosting
// (no Vercel-specific glue). Run with `npm run server` (see package.json).
import { serve } from '@hono/node-server'
import app from './app.mjs'

const port = Number(process.env.PORT) || 8787

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[classify-card server] listening on http://localhost:${info.port}`)
})
