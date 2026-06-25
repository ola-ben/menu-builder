import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'

const DISMISS_KEY = 'menulink:install-dismissed'

/**
 * Drop-down "Install app" banner.
 * - Android/Chrome: captures `beforeinstallprompt` and offers a real Install button.
 * - iOS/Safari: shows the manual "Share → Add to Home Screen" hint.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
    if (standalone) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    if (ios) {
      setIsIOS(true)
      setShow(true)
      return
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

  if (!show) return null

  return (
    <div className="animate-fade-in fixed inset-x-0 top-0 z-[60] border-b border-white/40 bg-white/90 backdrop-blur dark:border-white/5 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg">
          <img src="/pwa-192.png" alt="" className="h-full w-full object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          {isIOS ? (
            <p className="text-sm text-slate-700 dark:text-slate-200">
              Install MenuLink: tap{' '}
              <span className="inline-flex items-center font-semibold text-slate-900 dark:text-white">
                Share <Icon d="M7.5 7.5l4.5-4.5m0 0l4.5 4.5M12 3v13.5" className="mx-0.5 h-3.5 w-3.5" strokeWidth={2} />
              </span>{' '}
              then <span className="font-semibold text-slate-900 dark:text-white">“Add to Home Screen.”</span>
            </p>
          ) : (
            <p className="text-sm text-slate-700 dark:text-slate-200">
              <span className="font-semibold text-slate-900 dark:text-white">Install MenuLink</span> — add it to your
              home screen for one-tap access.
            </p>
          )}
        </div>
        {!isIOS && (
          <button type="button" onClick={install} className="btn-primary shrink-0 px-4 py-2 text-xs">
            Install
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="grid h-8 w-8 shrink-0 place-items-center text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
        >
          <Icon d="M6 18L18 6M6 6l12 12" className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
