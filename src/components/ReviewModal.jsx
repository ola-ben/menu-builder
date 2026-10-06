'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from './Icon.jsx'
import { createMenuReview } from '../utils/reviews.js'

export default function ReviewModal({ isOpen, onClose, menuId, menuName, onReviewAdded, preselectedItem = null }) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) {
      setError('Please select a rating star')
      return
    }
    setSubmitting(true)
    setError(null)

    const res = await createMenuReview(menuId, {
      author_name: name || 'Verified Diner',
      rating,
      comment,
      item_id: preselectedItem?.id || null
    })

    setSubmitting(false)

    if (res.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      if (onReviewAdded) onReviewAdded(res.data)
      setTimeout(() => {
        setSuccess(false)
        setName('')
        setComment('')
        setRating(5)
        onClose()
      }, 1400)
    }
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-2xl border border-ink/10 bg-paper p-6 shadow-2xl dark:border-paper/15 dark:bg-zinc-900 z-10"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-ink/50 hover:bg-ink/5 hover:text-ink dark:text-paper/50 dark:hover:bg-paper/10 dark:hover:text-paper transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {success ? (
            <div className="py-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="mt-4 font-display text-xl font-bold text-ink dark:text-paper">
                Thank you for your feedback!
              </h3>
              <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">
                Your review has been added to {menuName || 'the menu'}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="text-center">
                <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Customer Experience
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-ink dark:text-paper">
                  Rate your dining experience
                </h3>
                {preselectedItem && (
                  <p className="mt-1 text-xs text-ink/60 dark:text-paper/60">
                    Reviewing: <span className="font-semibold text-ink dark:text-paper">{preselectedItem.name}</span>
                  </p>
                )}
              </div>

              {/* Star Selector */}
              <div className="my-6 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-3xl transition-transform hover:scale-125 focus:outline-none"
                  >
                    <span
                      className={
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                          : 'text-ink/20 dark:text-paper/20'
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] font-medium uppercase tracking-wider text-ink/60 dark:text-paper/60 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tunde A. or Verified Diner"
                    className="input-base text-sm py-2"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-medium uppercase tracking-wider text-ink/60 dark:text-paper/60 mb-1">
                    Your Review
                  </label>
                  <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you think of the food, portion sizes, or service?"
                    className="input-base text-sm py-2"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 rounded-xl border border-ink/15 py-2.5 text-xs font-semibold text-ink/70 hover:bg-ink/5 dark:border-paper/15 dark:text-paper/70 dark:hover:bg-paper/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-2/3 py-2.5 text-xs font-bold shadow-lg shadow-brand-500/20"
                >
                  {submitting ? 'Submitting…' : 'Post Review'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
