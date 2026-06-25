/*
 * MenuLink "Menu Assistant" brain. Rule-based + offline by default; upgrades to
 * real AI (Groq) via /api/assist when GROQ_API_KEY is set, with automatic fallback.
 */

export const WELCOME = {
  text: "Hi! 👋 I'm your Menu Assistant. I can help you build your menu, set up your table QR, and take orders on WhatsApp. What do you need?",
  suggestions: [
    'How do I share my menu?',
    'How do diners order?',
    'Help me describe a dish',
    'Does my QR work on any phone?',
  ],
}

const INTENTS = [
  {
    keywords: ['share', 'qr', 'link', 'table', 'scan', 'print'],
    reply:
      'In your dashboard, "Share" gives you a menu link + a QR code you can download and print for each table. Diners scan it and your menu opens on their phone. 📲',
    suggestions: ['How do diners order?', 'Does my QR work on any phone?'],
  },
  {
    keywords: ['order', 'buy', 'diner', 'customer', 'cart', 'checkout'],
    reply:
      'Diners browse your menu, add dishes to a cart, then tap "Order" — it opens WhatsApp with the items and total already typed, sent to your number. 🍽️',
    suggestions: ['How do I add a dish?', 'How do I share my menu?'],
  },
  {
    keywords: ['describe', 'description', 'write', 'dish', 'caption', 'words'],
    reply:
      'When you add a menu item, give it a short, tasty description (e.g. "Smoky jollof rice with grilled chicken 🔥"). Mention key flavours, sides, and portion size to tempt diners.',
    suggestions: ['How do I add a dish?', 'How do diners order?'],
  },
  {
    keywords: ['add', 'item', 'dish', 'menu', 'category', 'food', 'photo', 'price'],
    reply:
      'Go to "Add a menu item": pick a category (Rice, Soups, Drinks…), add a photo, name, price in Naira, and a short description. It appears on your menu instantly. 📸',
    suggestions: ['Help me describe a dish', 'How do diners order?'],
  },
  {
    keywords: ['phone', 'device', 'everyone', 'work', 'everywhere', 'cloud', 'live'],
    reply: 'Yes — once saved, your menu link and QR open on any phone, anywhere (it lives in the cloud). 🌍',
    suggestions: ['How do I share my menu?', 'How do diners order?'],
  },
  {
    keywords: ['hi', 'hello', 'hey', 'start', 'help'],
    reply: "I'm here to help with your menu, QR code, and orders. Pick a question below, or just ask 👇",
    suggestions: WELCOME.suggestions,
  },
  {
    keywords: ['thanks', 'thank', 'nice', 'great'],
    reply: 'Anytime! 💚 Wishing your kitchen plenty orders. Anything else?',
    suggestions: ['How do I share my menu?', 'How do diners order?'],
  },
]

const FALLBACK = {
  text:
    "I'm a simple helper for now 😅. I can explain how to build your menu, set up your QR, take orders, or write dish descriptions. Try one of these:",
  suggestions: WELCOME.suggestions,
}

/** Offline rule-based reply. Returns { text, suggestions }. */
export function getAssistantReply(text) {
  const msg = (text || '').toLowerCase()
  if (!msg.trim()) return FALLBACK
  let best = null
  let bestScore = 0
  for (const intent of INTENTS) {
    const score = intent.keywords.reduce((n, k) => (msg.includes(k) ? n + 1 : n), 0)
    if (score > bestScore) {
      best = intent
      bestScore = score
    }
  }
  return best ? { text: best.reply, suggestions: best.suggestions } : FALLBACK
}

/**
 * Ask the AI assistant (Groq via /api/assist). Falls back to the rule-based reply
 * if the API isn't configured or fails, so the chatbot always responds.
 */
export async function askAssistant(history, latestUserText, context = '') {
  try {
    const messages = history
      .filter((m) => m.text)
      .map((m) => ({ role: m.from === 'user' ? 'user' : 'model', text: m.text }))
    const res = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages, context }),
    })
    if (!res.ok) throw new Error(`assist ${res.status}`)
    const data = await res.json()
    if (!data?.text) throw new Error('empty')
    return { text: data.text, ai: true }
  } catch {
    return { ...getAssistantReply(latestUserText), ai: false }
  }
}
