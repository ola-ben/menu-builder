import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'
import { fetchBilling, computeBilling } from '../utils/billing.js'

/** Shows the vendor's plan status: trial countdown, active, or paused warning. */
export default function BillingBanner({ menuId }) {
  const [b, setB] = useState(null)
  const [showNote, setShowNote] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (menuId) fetchBilling(menuId).then((row) => !cancelled && setB(computeBilling(row)))
    return () => {
      cancelled = true
    }
  }, [menuId])

  if (!b) return null
  if (b.state === 'active' && b.daysLeft == null) return null // local / no enforcement

  const subscribe = (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setShowNote((s) => !s)}
        className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-600 dark:text-slate-300"
      >
        Subscribe to stay live
      </button>
      {showNote && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          💳 Online payments (Paystack) are coming soon. For now, contact us to activate your menu.
        </p>
      )}
    </div>
  )

  if (!b.live) {
    return (
      <div className="card border-rose-300/60 bg-rose-50/80 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
        <div className="flex items-start gap-3">
          <Icon d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" strokeWidth={2} />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Your menu is paused</p>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
              Your trial has ended, so your menu link/QR shows as unavailable to diners. Subscribe to bring it back live.
            </p>
            {subscribe}
          </div>
        </div>
      </div>
    )
  }

  if (b.state === 'trial') {
    return (
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <Icon d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Free trial — {b.daysLeft} day{b.daysLeft === 1 ? '' : 's'} left
            </p>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
              Your menu is live and taking orders. Subscribe before the trial ends to keep your QR active.
            </p>
            {subscribe}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card flex items-center gap-2.5 p-4">
      <Icon d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="h-5 w-5 shrink-0 text-whatsapp-600" strokeWidth={2} />
      <p className="text-sm text-slate-700 dark:text-slate-200">
        Subscription active · <b>{b.daysLeft} days</b> left
      </p>
    </div>
  )
}
