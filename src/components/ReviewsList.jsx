'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { computeRatingStats } from '../utils/reviews.js'

export default function ReviewsList({ isOpen, onClose, reviews = [], onWriteReview, menuName }) {
  const stats = computeRatingStats(reviews)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer Window */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="relative h-full w-full max-w-md border-l border-ink/10 bg-paper p-6 shadow-2xl dark:border-paper/15 dark:bg-zinc-900 z-10 flex flex-col justify-between overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink/10 pb-4 dark:border-paper/10">
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Customer Feedback
              </p>
              <h2 className="font-display text-xl font-bold text-ink dark:text-paper">
                Diner Reviews
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-ink/50 hover:bg-ink/5 hover:text-ink dark:text-paper/50 dark:hover:bg-paper/10 dark:hover:text-paper"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Rating Summary Card */}
          <div className="my-4 rounded-xl border border-ink/10 bg-ink/[0.02] p-4 dark:border-paper/10 dark:bg-paper/[0.02]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-display text-3xl font-extrabold text-ink dark:text-paper">
                  {stats.count > 0 ? stats.average : '5.0'}
                </span>
                <span className="text-xs text-ink/50 dark:text-paper/50"> / 5.0</span>
                <div className="mt-1 flex text-amber-400 text-sm">
                  {'★'.repeat(Math.round(stats.average))}
                  {'☆'.repeat(5 - Math.round(stats.average))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-ink dark:text-paper">
                  {stats.count} {stats.count === 1 ? 'Review' : 'Reviews'}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  100% Verified Diners
                </p>
              </div>
            </div>
          </div>

          {/* Reviews Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 divide-y divide-ink/5 dark:divide-paper/5">
            {reviews.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-3xl">🍲</p>
                <h4 className="mt-2 font-display text-sm font-semibold text-ink dark:text-paper">
                  No reviews yet
                </h4>
                <p className="mt-1 text-xs text-ink/60 dark:text-paper/60">
                  Be the first diner to leave a review for {menuName || 'this restaurant'}!
                </p>
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold text-ink dark:text-paper">
                      {r.author_name || 'Verified Diner'}
                    </span>
                    <span className="text-xs text-amber-400 font-medium">
                      {'★'.repeat(r.rating || 5)}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="mt-1 text-xs text-ink/70 dark:text-paper/70 leading-relaxed">
                      "{r.comment}"
                    </p>
                  )}
                  <p className="mt-1 font-mono text-[10px] text-ink/35 dark:text-paper/35">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent order'}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer CTA */}
          <div className="border-t border-ink/10 pt-4 dark:border-paper/10">
            <button
              type="button"
              onClick={() => {
                onClose()
                if (onWriteReview) onWriteReview()
              }}
              className="btn-primary w-full py-2.5 text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
            >
              <span>★</span> Write a Review
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
