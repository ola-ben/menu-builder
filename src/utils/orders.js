import { supabase, isSupabaseEnabled } from '../lib/supabase.js'
import { createId } from './format.js'

const LS_KEY = 'qr-menu:orders'

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}
function writeLocal(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

function fromRow(row) {
  return {
    id: row.id,
    menuId: row.menu_id,
    items: Array.isArray(row.items) ? row.items : [],
    total: Number(row.total) || 0,
    note: row.customer_note || '',
    status: row.status || 'pending',
    createdAt: row.created_at,
  }
}

/** Record an order placed from a menu. items = [{ name, qty, priceNaira }]. */
export async function createOrder(menuId, { items, total, note = '' }) {
  const id = createId('order')
  const createdAt = new Date().toISOString()

  if (isSupabaseEnabled) {
    try {
      const { error } = await supabase
        .from('menu_orders')
        .insert({ id, menu_id: menuId, items, total, customer_note: note })
      if (error) throw error
      return { id, menuId, items, total, note, status: 'pending', createdAt }
    } catch (e) {
      console.warn('[orders] save failed, using local:', e.message)
    }
  }
  const order = { id, menuId, items, total, note, status: 'pending', createdAt }
  writeLocal([order, ...readLocal()])
  return order
}

/** Fetch a menu's orders, newest first (owner-only via RLS on the cloud). */
export async function fetchOrders(menuId) {
  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase
        .from('menu_orders')
        .select('*')
        .eq('menu_id', menuId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data.map(fromRow)
    } catch (e) {
      console.warn('[orders] fetch failed, using local:', e.message)
    }
  }
  return readLocal().filter((o) => o.menuId === menuId)
}

/** Mark an order 'pending' or 'fulfilled'. */
export async function setOrderStatus(id, status) {
  if (isSupabaseEnabled) {
    try {
      const { error } = await supabase.from('menu_orders').update({ status }).eq('id', id)
      if (error) throw error
      return
    } catch (e) {
      console.warn('[orders] status update failed, using local:', e.message)
    }
  }
  writeLocal(readLocal().map((o) => (o.id === id ? { ...o, status } : o)))
}

/** Compact summary for the AI assistant. '' when there are no orders. */
export function summarizeOrders(orders) {
  if (!orders || !orders.length) return ''
  const pending = orders.filter((o) => o.status !== 'fulfilled')
  const pendingTotal = pending.reduce((s, o) => s + (Number(o.total) || 0), 0)
  const lines = orders.slice(0, 10).map((o) => {
    const items = o.items.map((i) => `${i.name} x${i.qty}`).join(', ')
    return `- [${o.status}] ${items} — ₦${(Number(o.total) || 0).toLocaleString('en-NG')} (${(o.createdAt || '').slice(0, 10)})`
  })
  return (
    `Orders: ${orders.length} total, ${pending.length} pending ` +
    `(₦${pendingTotal.toLocaleString('en-NG')} pending value).\nMost recent:\n${lines.join('\n')}`
  )
}
