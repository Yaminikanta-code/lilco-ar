// Portable Hono app for card classification — no platform-specific code here.
// Mounted by server/node.mjs (plain Node, local dev / self-hosting) and by
// netlify/functions/classify-card.js (Netlify Functions), both thin wrappers
// around this same app via Hono's runtime adapters.
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import OpenAI from 'openai'
import referenceImages from './reference-images.mjs'

const SYSTEM_PROMPT = `You identify which of a fixed set of known reference postcards a photo shows.
Each reference is a distinct educational physics/math postcard with a short diagram and a title.
You will be shown all reference images first (each labeled with its index and title), then a new
photo taken by a phone camera of one of these physical postcards — it may be at an angle, under
different lighting, or slightly blurry.
Respond with ONLY a JSON object, no other text: {"matchIndex": <integer 0-based index or null>, "confidence": "high"|"medium"|"low"}.
Use null for matchIndex if the photo clearly does not show any of the references, or you cannot tell.`

function buildReferenceContent() {
  return referenceImages.targets.flatMap((target) => [
    { type: 'text', text: `Reference ${target.index}: "${target.title}"` },
    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${target.image}` } },
  ])
}

function parseClassification(raw) {
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  const index = parsed?.matchIndex
  if (!Number.isInteger(index) || index < 0 || index >= referenceImages.targets.length) return null
  return { index, confidence: parsed.confidence ?? null }
}

const app = new Hono()

app.use('/api/*', cors())

app.post('/api/classify-card', async (c) => {
  const apiKey = process.env.LLM_API_KEY
  if (!apiKey) return c.json({ error: 'Server is missing LLM_API_KEY.' }, 500)

  let body
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Expected a JSON body.' }, 400)
  }
  if (typeof body.image !== 'string' || !body.image) {
    return c.json({ error: 'Missing "image" (base64 JPEG) in request body.' }, 400)
  }

  const client = new OpenAI({ apiKey, baseURL: process.env.LLM_BASE_URL || undefined })
  const model = process.env.LLM_MODEL || 'gpt-4o-mini'

  let response
  try {
    response = await client.chat.completions.create({
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            ...buildReferenceContent(),
            { type: 'text', text: 'Here is the newly captured photo. Which reference does it match?' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${body.image}` } },
          ],
        },
      ],
    })
  } catch (err) {
    console.error('[classify-card] LLM request failed:', err)
    return c.json({ error: 'Classification request failed.' }, 502)
  }

  const raw = response.choices?.[0]?.message?.content
  const result = raw ? parseClassification(raw) : null

  console.log('[classify-card]', { model, usage: response.usage, raw, result })

  if (!result) return c.json({ index: null })
  return c.json({ index: result.index, confidence: result.confidence })
})

export default app
