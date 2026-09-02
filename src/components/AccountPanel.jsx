import { useState, useEffect, useRef } from 'react'
import { supabase, isSupabaseEnabled, signOut } from '../lib/supabase.js'
import useToast from '../hooks/useToast.js'
import Toast from './Toast.jsx'
import Icon from './Icon.jsx'

export default function AccountPanel() {
  const [isAnon, setIsAnon] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { toast, showToast } = useToast()
  const googleBtnRef = useRef(null)

  const isSimulated = localStorage.getItem('qr-menu:simulated_login') === 'true'
  const displayIsAnon = isSimulated ? false : isAnon
  const displayEmail = isSimulated ? 'owner@bukkaexpress.com' : userEmail
  const displayIsSupabaseEnabled = isSimulated ? true : isSupabaseEnabled

  useEffect(() => {
    let cancelled = false
    if (isSupabaseEnabled) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!cancelled && session) {
          const anonymous = session.user?.is_anonymous ?? (!session.user?.email || session.user?.app_metadata?.provider === 'anonymous')
          setIsAnon(anonymous)
          setUserEmail(session.user?.email || '')
        }
      })
    }
    return () => {
      cancelled = true
    }
  }, [])

  // Initialize Google Sign-In client library
  useEffect(() => {
    if (!displayIsAnon || !displayIsSupabaseEnabled) return

    const initGoogleGsi = () => {
      /* global google */
      if (typeof google !== 'undefined' && googleBtnRef.current) {
        try {
          google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: async (response) => {
              setError(null)
              setLoading(true)
              try {
                // Send the ID token received from Google to Supabase
                const { error: err } = await supabase.auth.signInWithIdToken({
                  provider: 'google',
                  token: response.credential,
                })
                if (err) throw err
                
                showToast('Menu secured successfully! 🎉', 'success')
                setTimeout(() => {
                  window.location.reload()
                }, 1000)
              } catch (err) {
                setError(err.message || 'Google sign in failed.')
              } finally {
                setLoading(false)
              }
            },
          })
          
          google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            shape: 'rectangular',
            width: googleBtnRef.current.parentElement?.clientWidth || 320,
          })
        } catch (e) {
          console.error('Failed to initialize Google Sign-In:', e)
        }
      }
    }

    initGoogleGsi()
    // Retry initialization in case script loads slowly
    const interval = setInterval(() => {
      if (typeof google !== 'undefined') {
        initGoogleGsi()
        clearInterval(interval)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [displayIsAnon])

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out? Your menu details and dishes will remain safe in the database.')) {
      if (isSimulated) {
        localStorage.removeItem('qr-menu:simulated_login')
        localStorage.removeItem('qr-menu:restaurant')
        localStorage.removeItem('qr-menu:orders')
      } else {
        await signOut()
      }
      window.location.reload()
    }
  }

  return (
    <div className="card p-6 sm:p-8">
      <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800">
        <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          Account &amp; Menu Backup
        </h2>
        <p className="mt-1 text-sm text-slate-550 dark:text-slate-400">
          Secure your dishes, categories, and customer orders.
        </p>
      </div>

      {!displayIsSupabaseEnabled ? (
        <div className="border border-amber-500/20 bg-amber-500/[0.06] p-4 text-sm text-amber-600 dark:text-amber-400 rounded-2xl">
          ⚠️ Database integration is not configured. Account backups require Supabase env configurations.
        </div>
      ) : displayIsAnon ? (
        <div className="space-y-6">
          <div className="border border-brand-500/20 bg-brand-500/[0.04] p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-355 rounded-2xl">
            <p className="font-semibold text-brand-650 dark:text-brand-400 flex items-center gap-1.5 mb-1.5">
              <Icon d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="h-5 w-5 text-brand-600 dark:text-brand-400" strokeWidth={2} />
              Your menu is currently saved in this browser.
            </p>
            Protect your business from being lost if you clear your browser cache. Sign in with Google to secure your menu and access it from any device.
          </div>

          {error && (
            <div className="border border-rose-500/20 bg-rose-500/[0.06] p-4 text-sm text-rose-600 dark:text-rose-400 rounded-2xl">
              {error}
            </div>
          )}

          {!import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <div className="border border-amber-500/20 bg-amber-500/[0.06] p-4 text-sm text-amber-655 dark:text-amber-400 rounded-2xl">
              ⚠️ Google Client ID is not configured. Please define <code>VITE_GOOGLE_CLIENT_ID</code> in your <code>.env</code> file.
            </div>
          ) : (
            <div className="space-y-4 max-w-md">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-350">
                Link with Google:
              </p>
              <div className="flex w-full min-h-[44px]">
                <div ref={googleBtnRef} className="w-full"></div>
              </div>
              {loading && <p className="text-xs text-slate-400">Securing your account...</p>}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border border-brand-500/25 bg-brand-500/[0.06] p-4 text-sm text-slate-755 dark:text-slate-300 rounded-2xl">
            <h4 className="font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1.5 mb-2">
              <Icon d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="h-5 w-5 text-brand-655" strokeWidth={2} />
              Your menu is fully secured &amp; backed up!
            </h4>
            You are logged in with a permanent account. Your dishes, categories, and orders are stored safely in the database and can be accessed from any device.
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-5 dark:border-slate-800">
            <p className="text-sm font-mono tracking-wide text-slate-600 dark:text-slate-400">
              Connected Email: <b className="text-slate-900 dark:text-white">{displayEmail}</b>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-505">
              Session state: Permanent verified account.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleSignOut}
              className="btn-ghost text-rose-500 border-rose-500/20 hover:border-rose-500 hover:bg-rose-500/[0.04] text-xs font-semibold uppercase tracking-wider"
            >
              Sign Out of Account
            </button>
          </div>
        </div>
      )
}

      <Toast toast={toast} />
    </div>
  )
}
