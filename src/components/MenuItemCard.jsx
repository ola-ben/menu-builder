import Icon from './Icon.jsx'
import { formatNaira } from '../utils/format.js'

const PHOTO_PLACEHOLDER =
  'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6 18.75h12A2.25 2.25 0 0020.25 16.5V7.5A2.25 2.25 0 0018 5.25H6A2.25 2.25 0 003.75 7.5v9A2.25 2.25 0 006 18.75z'

/**
 * A single menu item. Two modes:
 *  - "manage": shows edit/delete (dashboard)
 *  - "shop":   shows price + add/stepper (public menu); needs qty, onAdd, onInc, onDec
 */
export default function MenuItemCard({ item, mode = 'shop', qty = 0, onAdd, onInc, onDec, onEdit, onDelete }) {
  const out = item.available === false

  return (
    <div className="card card-hover flex gap-3 p-3">
      {/* Thumbnail */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-300 dark:text-slate-600">
            <Icon d={PHOTO_PLACEHOLDER} className="h-8 w-8" />
          </div>
        )}
        {out && (
          <span className="absolute inset-0 grid place-items-center bg-slate-900/60 text-xs font-semibold text-white">
            Sold out
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-white">{item.name}</h3>
          {item.tag && (
            <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              {item.tag}
            </span>
          )}
        </div>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-base font-bold text-slate-900 dark:text-white">
            {item.priceNaira !== '' && item.priceNaira != null ? formatNaira(item.priceNaira) : '—'}
          </span>

          {mode === 'shop' ? (
            qty > 0 ? (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onDec?.(item)} aria-label="Remove one" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                  <Icon d="M5 12h14" className="h-4 w-4" strokeWidth={2.2} />
                </button>
                <span className="w-5 text-center font-semibold tabular-nums">{qty}</span>
                <button type="button" onClick={() => onInc?.(item)} aria-label="Add one" className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-glow transition hover:brightness-110">
                  <Icon d="M12 5v14M5 12h14" className="h-4 w-4" strokeWidth={2.2} />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => onAdd?.(item)} disabled={out} className="btn-primary px-3 py-1.5 text-xs">
                <Icon d="M12 5v14M5 12h14" className="h-3.5 w-3.5" strokeWidth={2.2} />
                Add
              </button>
            )
          ) : (
            <div className="flex gap-1">
              <button type="button" onClick={() => onEdit?.(item)} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                <Icon d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onDelete?.(item)} aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-rose-500 transition hover:bg-rose-50 dark:border-slate-600 dark:hover:bg-rose-500/10">
                <Icon d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v12a1 1 0 001 1h6a1 1 0 001-1V7" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
