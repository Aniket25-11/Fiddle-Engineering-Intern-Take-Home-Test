import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import axios from 'axios'
import LRU from 'lru-cache'
import { z } from 'zod'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

const MODEL = process.env.MISTRAL_MODEL || 'mistral-small-latest'
const PORT = process.env.PORT || 8787

const cache = new LRU({
  max: parseInt(process.env.CACHE_MAX || '200', 10),
  ttl: parseInt(process.env.CACHE_TTL_MS || '300000', 10)
})

const BodySchema = z.object({
  text: z.string().min(1, 'text is required'),
  formality: z.enum(['Formal','Neutral','Casual']),
  warmth: z.enum(['Stern','Neutral','Friendly']),
  intensity: z.number().int().min(0).max(2)
})

app.post('/api/tone', async (req, res) => {
  const parsed = BodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors.map(e => e.message).join(', ') })
  }
  const { text, formality, warmth, intensity } = parsed.data

  const cacheKey = JSON.stringify({ t: text, f: formality, w: warmth, i: intensity, m: MODEL })
  const cached = cache.get(cacheKey)
  if (cached) {
    return res.json({ text: cached, cached: true })
  }

  const system = [
    'You are an expert copy editor.',
    'Rewrite the user\'s text to match the requested tone.',
    'Tone:',
    `- Formality: ${formality}`,
    `- Warmth: ${warmth}`,
    'Rules:',
    '- Preserve the original meaning and key facts.',
    '- Keep length roughly similar (±10%).',
    '- Maintain existing markdown, emojis, and inline code snippets when present.',
    '- Keep the same language as the input.',
    '- Return only the revised text without any extra commentary.'
  ].join('\n')

  const temp = [0.2, 0.35, 0.55][intensity] || 0.35

  try {
    const r = await axios.post('https://api.mistral.ai/v1/chat/completions', {
      model: MODEL,
      temperature: temp,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: text }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 20000
    })

    const out = r.data?.choices?.[0]?.message?.content
    if (!out || typeof out !== 'string') {
      throw new Error('Invalid API response')
    }
    cache.set(cacheKey, out)
    res.json({ text: out, cached: false })
  } catch (err) {
    const status = err.response?.status || 500
    const detail = err.response?.data || err.message || 'Unknown error'
    res.status(status).json({ error: typeof detail === 'string' ? detail : (detail.error || JSON.stringify(detail)), code: status })
  }
})

// 👇 NEW ROOT ROUTE
app.get('/', (req, res) => {
  res.send('<h2>✅ Tone Picker backend is running</h2><p>Use <code>POST /api/tone</code> for tone rewriting or <code>/health</code> for status.</p>')
})

app.get('/health', (req, res) => res.json({ ok: true }))


export default app;
