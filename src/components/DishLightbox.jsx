'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatNaira } from '../utils/format.js'

export default function DishLightbox({ isOpen, onClose, dish, onAddToCart, onReviewDish }) {
  const [portionQty, setPortionQty] = useState(1)

  if (!isOpen || !dish) return null

  const handleAdd = () => {
    if (onAddToCart) {
      for (let i = 0; i < portionQty; i++) {
        onAddToCart(dish)
      }
    }
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-ink/10 bg-paper shadow-2xl dark:border-paper/15 dark:bg-zinc-900 z-10"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3.5 top-3.5 z-20 rounded-full bg-black/50 p-2 text-white hover:bg-black/75 backdrop-blur-sm transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Dish Image */}
          <div className="relative h-60 sm:h-72 w-full bg-ink/5 dark:bg-paper/5 overflow-hidden">
            {dish.imageUrl ? (
              <img
                src={dish.imageUrl}
                alt={dish.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-5xl">
                🍲
              </div>
            )}
            {dish.tag && (
              <span className="absolute left-4 top-4 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-black shadow-md">
                {dish.tag}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-ink dark:text-paper">
                  {dish.name}
                </h3>
                <p className="mt-1 font-display text-xl font-extrabold text-brand-600 dark:text-brand-400">
                  {formatNaira(dish.priceNaira)}
                </p>
              </div>

              {onReviewDish && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onReviewDish(dish)
                  }}
                  className="shrink-0 text-xs font-medium text-amber-500 hover:text-amber-600 underline flex items-center gap-1"
                >
                  <span>★</span> Review this dish
                </button>
              )}
            </div>

            {dish.description && (
              <p className="mt-3 text-sm text-ink/70 dark:text-paper/70 leading-relaxed">
                {dish.description}
              </p>
            )}

            {/* Quantity Selector & Add button */}
            <div className="mt-6 flex items-center gap-4 pt-4 border-t border-ink/10 dark:border-paper/10">
              <div className="flex items-center rounded-xl border border-ink/15 bg-ink/[0.02] p-1 dark:border-paper/15 dark:bg-paper/[0.02]">
                <button
                  type="button"
                  onClick={() => setPortionQty((q) => Math.max(1, q - 1))}
                  className="h-8 w-8 rounded-lg font-bold text-ink/70 hover:bg-ink/10 dark:text-paper/70 dark:hover:bg-paper/10"
                >
                  −
                </button>
                <span className="w-8 text-center font-display font-bold text-sm text-ink dark:text-paper">
                  {portionQty}
                </span>
                <button
                  type="button"
                  onClick={() => setPortionQty((q) => q + 1)}
                  className="h-8 w-8 rounded-lg font-bold text-ink/70 hover:bg-ink/10 dark:text-paper/70 dark:hover:bg-paper/10"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="btn-primary flex-1 py-3 text-sm font-bold shadow-lg shadow-brand-500/20"
              >
                Add {portionQty > 1 ? `(${portionQty})` : ''} to Table Order • {formatNaira(dish.priceNaira * portionQty)}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
