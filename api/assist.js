import { generateReply } from './_assistant.js'

/** Vercel serverless function: POST /api/assist { messages, context } -> { text } */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const text = await generateReply(body.messages, undefined, undefined, body.context)
    res.status(200).json({ text })
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) })
  }
}
