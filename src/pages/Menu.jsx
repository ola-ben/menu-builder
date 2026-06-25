import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchMenuById, groupItemsByCategory } from '../hooks/useMenu.js'
import useToast from '../hooks/useToast.js'
import Toast from '../components/Toast.jsx'
import MenuItemCard from '../components/MenuItemCard.jsx'
import Icon, { WhatsappIcon } from '../components/Icon.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { formatNaira } from '../utils/format.js'
import { buildWhatsappLink, buildMenuOrderMessage } from '../utils/whatsapp.js'
import { createOrder } from '../utils/orders.js'
import { fetchBilling, computeBilling } from '../utils/billing.js'

export default function Menu() {
  const { menuId } = useParams()
  const { toast, showToast } = useToast()
  // undefined = still loading, null = not found, object = loaded
  const [restaurant, setRestaurant] = useState(undefined)
  const [billing, setBilling] = useState(undefined)
  const [cart, setCart] = useState({}) // { [itemId]: qty }
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setRestaurant(undefined)
    setBilling(undefined)
    setCart({})
    fetchMenuById(menuId).then(async (r) => {
      if (cancelled) return
      setRestaurant(r)
      if (r) {
        const row = await fetchBilling(r.id)
        if (!cancelled) setBilling(computeBilling(row))
      } else {
        setBilling(null)
      }
    })
    return () => {
      cancelled = true
    }
  }, [menuId])

  const loading = restaurant === undefined || (restaurant && billing === undefined)
  const notFound = !loading && !restaurant
  const paused = !loading && restaurant && billing && !billing.live

  const groups = useMemo(() => groupItemsByCategory(restaurant), [restaurant])

  const inc = (item) => setCart((c) => ({ ...c, [item.id]: (c[item.id] ?? 0) + 1 }))
  const dec = (item) =>
    setCart((c) => {
      const next = { ...c }
      const q = (next[item.id] ?? 0) - 1
      if (q <= 0) delete next[item.id]
      else next[item.id] = q
      return next
    })

  const lines = useMemo(() => {
    if (!restaurant) return []
    return Object.entries(cart)
      .map(([id, qty]) => {
        const item = restaurant.items.find((i) => i.id === id)
        return item ? { name: item.name, qty, priceNaira: item.priceNaira } : null
      })
      .filter(Boolean)
  }, [cart, restaurant])

  const count = lines.reduce((n, l) => n + l.qty, 0)
  const total = lines.reduce((sum, l) => sum + (Number(l.priceNaira) || 0) * l.qty, 0)

  const sendOrder = () => {
    if (!count) return
    const link = buildWhatsappLink(restaurant.whatsappNumber, buildMenuOrderMessage(restaurant.name, lines))
    if (!link) {
      showToast('This menu has no WhatsApp number set.', 'error')
      return
    }
    // Log the order (fire-and-forget) so it shows in the vendor's dashboard.
    createOrder(restaurant.id, {
      items: lines.map((l) => ({ name: l.name, qty: l.qty, priceNaira: l.priceNaira })),
      total,
    })
    window.open(link, '_blank', 'noopener')
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500 dark:border-slate-700 dark:border-t-brand-400" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading menu…</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Menu not found</h1>
          <p className="mt-2 max-w-md text-slate-500 dark:text-slate-400">
            We couldn’t find this menu. The link may be incorrect, or the menu may have been removed.
          </p>
          <Link to="/" className="btn-primary mt-6">Go home</Link>
        </div>
      </div>
    )
  }

  if (paused) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div className="max-w-md">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
            <Icon d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold text-slate-900 dark:text-white">
            {restaurant.name || 'This menu'} is paused
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            This menu isn’t taking orders right now. Please check back soon — or reach the restaurant directly.
          </p>
          <Link to="/" className="btn-primary mt-6">Create your own free menu</Link>
          <p className="mt-6 text-xs uppercase tracking-widest text-slate-400">Powered by MenuLink</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-white/40 bg-white/70 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-sm font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            🍽️ Powered by MenuLink
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Restaurant header */}
      <header className="relative mx-auto max-w-3xl px-4 pt-10 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-40 w-40 rounded-full bg-brand-400/25 blur-3xl" />
        {restaurant.logoUrl ? (
          <img src={restaurant.logoUrl} alt={restaurant.name} loading="lazy" className="mx-auto h-24 w-24 rounded-3xl object-cover shadow-lift ring-4 ring-white/70 dark:ring-white/10" />
        ) : (
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lift ring-4 ring-white/70 dark:ring-white/10">
            <Icon d="M4 6h16M4 12h16M4 18h10" className="h-10 w-10" />
          </div>
        )}
        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="mx-auto mt-3 max-w-md text-slate-600 dark:text-slate-400">{restaurant.tagline}</p>}
        <div aria-hidden className="mx-auto mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-brand-500 to-amber-400" />
      </header>

      {/* Menu */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        {groups.length === 0 ? (
          <div className="card grid place-items-center gap-2 p-10 text-center">
            <p className="text-slate-500 dark:text-slate-400">This menu has no items yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map((g) => (
              <section key={g.id}>
                <h2 className="mb-4 flex items-center gap-3 font-display text-xl font-bold text-slate-900 dark:text-white">
                  {g.name}
                  <span className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-800" />
                </h2>
                <div className="grid gap-3">
                  {g.items.map((it) => (
                    <MenuItemCard
                      key={it.id}
                      item={it}
                      mode="shop"
                      qty={cart[it.id] ?? 0}
                      onAdd={inc}
                      onInc={inc}
                      onDec={dec}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Cart bar */}
      {count > 0 && (
        <div className="animate-slide-up fixed inset-x-0 bottom-0 z-40 border-t border-white/40 bg-white/90 p-4 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.2)] backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/90">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <button
              type="button"
              onClick={() => setCartOpen((o) => !o)}
              className="flex flex-1 items-center justify-between rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <span>{count} item{count === 1 ? '' : 's'} · {formatNaira(total)}</span>
              <Icon d={cartOpen ? 'M19 9l-7 7-7-7' : 'M5 15l7-7 7 7'} className="h-4 w-4" />
            </button>
            <button type="button" onClick={sendOrder} className="btn-whatsapp px-5 py-2.5">
              <WhatsappIcon className="h-4 w-4" />
              Order
            </button>
          </div>

          {/* Expanded cart detail */}
          {cartOpen && (
            <div className="mx-auto mt-3 max-w-3xl animate-slide-up rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {lines.map((l) => (
                  <li key={l.name} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-slate-700 dark:text-slate-200">{l.qty}× {l.name}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatNaira((Number(l.priceNaira) || 0) * l.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total</span>
                <span className="font-display text-lg font-bold text-slate-900 dark:text-white">{formatNaira(total)}</span>
              </div>
              <button type="button" onClick={() => setCart({})} className="mt-2 text-xs font-semibold text-rose-500 hover:underline">
                Clear order
              </button>
            </div>
          )}
        </div>
      )}

      <Toast toast={toast} />
    </div>
  )
}
