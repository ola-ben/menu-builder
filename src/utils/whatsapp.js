import { formatNaira } from './format.js'

/**
 * Normalize a Nigerian phone number into the international format WhatsApp
 * expects (digits only, no + sign). Examples:
 *   "0803 123 4567" -> "2348031234567"
 *   "+234 803..."   -> "234803..."
 *   "803 123 4567"  -> "234803..."
 */
export function normalizeWhatsappNumber(raw) {
  if (!raw) return ''
  let digits = String(raw).replace(/\D/g, '')

  if (digits.startsWith('234')) {
    // already international
  } else if (digits.startsWith('0')) {
    digits = '234' + digits.slice(1)
  } else if (digits.length === 10) {
    digits = '234' + digits
  }
  return digits
}

/** Build a wa.me link with an optional pre-filled message. */
export function buildWhatsappLink(number, message = '') {
  const normalized = normalizeWhatsappNumber(number)
  if (!normalized) return ''
  const base = `https://wa.me/${normalized}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/**
 * Build an itemized order message from cart lines.
 * lines: [{ name, qty, priceNaira }]
 */
export function buildMenuOrderMessage(restaurantName, lines, tableLabel = '') {
  const name = restaurantName || 'there'
  const rows = lines
    .map((l) => `• ${l.qty}x ${l.name}${l.priceNaira ? ` — ${formatNaira(l.priceNaira * l.qty)}` : ''}`)
    .join('\n')
  const total = lines.reduce((sum, l) => sum + (Number(l.priceNaira) || 0) * l.qty, 0)

  return (
    `Hello ${name}! 👋 I'd like to place an order:\n\n` +
    `${rows}\n\n` +
    `*Total: ${formatNaira(total)}*` +
    (tableLabel ? `\n\nTable: ${tableLabel}` : '')
  )
}

/** Build a general greeting message. */
export function buildGreetingMessage(restaurantName) {
  const name = restaurantName || 'there'
  return `Hello ${name}! 👋 I have a question about your menu.`
}
