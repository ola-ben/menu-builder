/*
 * Shared Groq caller for MenuLink's "Menu Assistant".
 * Used by the Vercel serverless function (api/assist.js) and the Vite dev
 * middleware (vite.config.js). The key stays server-side in both.
 * Get a free key at https://console.groq.com/keys → .env as GROQ_API_KEY.
 */

const SYSTEM = `You are the friendly "Menu Assistant" for MenuLink, a tool that lets Nigerian
restaurants, bukas and food vendors build a digital menu with a QR code for each table and
take orders on WhatsApp.

Help vendors: build their menu (categories + dishes with photos, Naira prices, descriptions),
write tasty dish descriptions, set up their table QR code, understand how diners order on
WhatsApp, and manage their orders.

Style: warm, friendly Nigerian English. Keep replies short — 2 to 4 sentences. Use the
occasional emoji, not too many. Be practical and specific. If you don't know something about
the app, say so briefly. Never invent features that don't exist.`

export async function generateReply(messages, apiKey = process.env.GROQ_API_KEY, model, context) {
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')
  const modelId = model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

  const system = context
    ? `${SYSTEM}\n\nLive data for THIS vendor's menu (use it to answer accurately):\n${context}`
    : SYSTEM

  const chat = [{ role: 'system', content: system }]
  for (const m of messages || []) {
    if (!m || !m.text) continue
    chat.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })
  }
  if (!chat.some((m) => m.role === 'user')) chat.push({ role: 'user', content: 'Hello' })

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: modelId, messages: chat, temperature: 0.6, max_tokens: 400 }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Groq ${res.status}: ${detail.slice(0, 200)}`)
  }
  const data = await res.json()
  const text = (data?.choices?.[0]?.message?.content || '').trim()
  if (!text) throw new Error('Groq returned an empty reply')
  return text
}
