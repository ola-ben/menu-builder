/** Format a number as Naira, e.g. 5000 -> "₦5,000". */
export function formatNaira(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '₦0'
  return '₦' + n.toLocaleString('en-NG', { maximumFractionDigits: 0 })
}

/** Create a short unique id. */
export function createId(prefix = 'id') {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}${rand}`
}
