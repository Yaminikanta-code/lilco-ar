// Netlify Functions entry — thin wrapper around the shared, portable Hono
// app in server/app.mjs. See netlify.toml for the /api/classify-card redirect
// that routes to this function's actual path.
import { handle } from 'hono/netlify'
import app from '../../server/app.mjs'

export default handle(app)
