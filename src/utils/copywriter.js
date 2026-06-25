import { formatNaira } from './format.js'

/*
 * Free, offline "copywriter" — turns the fields a vendor already typed into a
 * warm, appetising menu-item description. No API key, no network, no cost.
 *
 * Same shape an AI version would have ({ name, priceNaira, description } ->
 * string), so it can later be swapped for a serverless `/api/assist` call
 * (Groq/Haiku) without touching the form UI — just make this async and await it.
 */

const HOOKS = [
  'Freshly made to order 🔥',
  'A customer favourite.',
  'Rich, tasty and filling.',
  'Made with quality ingredients.',
  'Perfect for lunch or dinner.',
  'Hot, fresh and satisfying.',
  'You’ll want seconds 😋',
]

const CTAS = [
  'Tap “Order” to get yours on WhatsApp 💚',
  'Order now on WhatsApp — dine in or takeaway 🍽️',
  'Message us on WhatsApp to order 📲',
  'Add it to your order — we’ll have it ready 🚀',
]

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

/**
 * Build a friendly description from the entered fields. Reuses any details the
 * vendor already typed (portion, sides, spice level) so nothing is lost.
 */
export function suggestItemDescription({ name, priceNaira, description } = {}) {
  const title = (name || '').trim()
  if (!title) return ''

  const detail = (description || '').trim()
  const priceLine = priceNaira !== '' && priceNaira != null ? ` Just ${formatNaira(priceNaira)}.` : ''

  // If the vendor already jotted details, weave them in; otherwise lead with a hook.
  const lead = detail ? `${title} — ${detail}.` : `${title}. ${pick(HOOKS)}`

  return `${lead}${priceLine} ${pick(CTAS)}`.replace(/\.\./g, '.')
}
