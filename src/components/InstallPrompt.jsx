'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from './Icon.jsx'

const DISMISS_KEY = 'menulink:install-dismissed'

/**
 * Animated "Install app" banner that smoothly pushes the page content down on reveal
 * and animates back up to 0 height when dismissed.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(DISMISS_KEY)) return
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
    if (standalone) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    if (ios) {
      setIsIOS(true)
      // Slight delay so the user sees the smooth push-down animation
      const t = setTimeout(() => setShow(true), 300)
      return () => clearTimeout(t)
    }

    const onPrompt = (e) => {
      e.preventDefault()
      setDeferred(e)
      setShow(true)
    }
    const onInstalled = () => {
      setShow(false)
      localStorage.setItem(DISMISS_KEY, '1')
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const dismiss = () => {
    setShow(false)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice.catch(() => {})
    setDeferred(null)
    dismiss()
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-40 w-full overflow-hidden border-b border-brand-500/20 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white shadow-md"
        >
          <div className="mx-auto flex max-w-5xl lg:max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
            <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white shadow-sm p-1.5">
              <img src="/menu.svg" alt="" className="h-full w-full object-contain brightness-0 invert" />
            </span>

            <div className="min-w-0 flex-1">
              {isIOS ? (
                <p className="text-xs sm:text-sm text-zinc-200">
                  Install MenuLink: tap{' '}
                  <span className="inline-flex items-center font-bold text-white">
                    Share <Icon d="M7.5 7.5l4.5-4.5m0 0l4.5 4.5M12 3v13.5" className="mx-1 h-3.5 w-3.5 inline" strokeWidth={2.5} />
                  </span>{' '}
                  then <span className="font-bold text-white">“Add to Home Screen.”</span>
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-zinc-200">
                  <span className="font-bold text-white">Install MenuLink</span> — Add to your home screen for 1-tap fast access.
                </p>
              )}
            </div>

            {!isIOS && (
              <button
                type="button"
                onClick={install}
                className="btn-primary shrink-0 py-1.5 px-3.5 text-xs font-bold rounded-lg shadow-sm"
              >
                Install
              </button>
            )}

            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss banner"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Icon d="M6 18L18 6M6 6l12 12" className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

