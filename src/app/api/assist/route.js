import { generateReply } from '../../../../api/_assistant.js'

export async function POST(request) {
  try {
    const body = await request.json()
    const text = await generateReply(body.messages, undefined, undefined, body.context)
    return Response.json({ text })
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
