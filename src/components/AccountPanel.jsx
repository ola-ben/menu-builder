'use client'

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

  const [isSimulated, setIsSimulated] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSimulated(localStorage.getItem('qr-menu:simulated_login') === 'true')
    }
  }, [])

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

  const handleGoogleSignIn = async () => {
    if (!displayIsSupabaseEnabled || !supabase) {
      setError('Supabase is not configured.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      })
      if (err) throw err
    } catch (err) {
      setError(err.message || 'Google sign-in failed.')
      setLoading(false)
    }
  }

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

          <div className="space-y-4 max-w-md pt-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 disabled:opacity-60"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loading ? 'Redirecting to Google…' : 'Continue with Google'}</span>
            </button>
          </div>
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
      )}

      <Toast toast={toast} />
    </div>
  )
}
