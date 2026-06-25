import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'
import { fetchOrders, setOrderStatus } from '../utils/orders.js'
import { formatNaira } from '../utils/format.js'

/** Lists a menu's orders with newest-first sort and pending/fulfilled toggling. */
export default function OrdersPanel({ menuId }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!menuId) return
    setLoading(true)
    setOrders(await fetchOrders(menuId))
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId])

  const toggle = async (o) => {
    const next = o.status === 'fulfilled' ? 'pending' : 'fulfilled'
    setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, status: next } : x)))
    await setOrderStatus(o.id, next)
  }

  const pending = orders.filter((o) => o.status !== 'fulfilled')
  const pendingTotal = pending.reduce((s, o) => s + (Number(o.total) || 0), 0)

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold text-slate-900 dark:text-white">
          <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-brand-500 to-brand-600" />
          Orders
        </h2>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
        >
          <Icon d="M16.023 9.348h4.992V4.356M3.985 14.652H-.008v4.992M4.5 9.349a7.5 7.5 0 0113.02-2.34M19.5 14.65a7.5 7.5 0 01-13.02 2.34" className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {orders.length > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 dark:bg-brand-500/10">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-whatsapp-500 to-whatsapp-600 text-white">
            <Icon d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" className="h-4 w-4" />
          </span>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            <b>{pending.length}</b> pending · <b>{formatNaira(pendingTotal)}</b> to fulfil
          </p>
        </div>
      )}

      {loading ? (
        <p className="py-6 text-center text-sm text-slate-400">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="mt-4 grid place-items-center gap-2 rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
          <Icon d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No orders yet. They appear here when a diner taps “Order” on your menu.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-800 dark:text-slate-200">
                  {o.items.map((i) => `${i.qty}× ${i.name}`).join(', ') || 'Order'}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {(o.createdAt || '').slice(0, 10)} · {formatNaira(o.total)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggle(o)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                  o.status === 'fulfilled'
                    ? 'bg-gradient-to-br from-whatsapp-500 to-whatsapp-600 text-white'
                    : 'border border-slate-300 text-slate-500 hover:border-slate-400 dark:border-slate-600 dark:text-slate-300'
                }`}
              >
                {o.status === 'fulfilled' ? '✓ Fulfilled' : 'Pending'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
