import { useState, useEffect } from 'react'
import { supabase, isSupabaseEnabled, signOut } from '../lib/supabase.js'
import useToast from '../hooks/useToast.js'
import Toast from './Toast.jsx'
import Icon from './Icon.jsx'

export default function AccountPanel() {
  const [isAnon, setIsAnon] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { toast, showToast } = useToast()

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

  const handleSendBackupOtp = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setError(null)
    setLoading(true)

    try {
      if (!isSupabaseEnabled) {
        throw new Error('Supabase is not configured.')
      }

      // updateUser initiates linking the email to the current anonymous account
      const { error: err } = await supabase.auth.updateUser({
        email: email.trim(),
      })

      if (err) throw err

      setOtpSent(true)
      showToast('Verification code sent!', 'success')
    } catch (err) {
      setError(err.message || 'Failed to initiate backup.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyBackupOtp = async (e) => {
    e.preventDefault()
    if (!token.trim()) return

    setError(null)
    setLoading(true)

    try {
      // Verifying an email update/link to an anonymous user uses 'email_change' type
      const { error: err } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'email_change',
      })

      if (err) throw err

      showToast('Menu backed up successfully! 🎉', 'success')
      setIsAnon(false)
      setUserEmail(email.trim())
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out? Your menu details and dishes will remain safe in the database.')) {
      await signOut()
      window.location.reload()
    }
  }

  return (
    <div className="card p-6 sm:p-8">
      <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800">
        <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          Account &amp; Menu Backup
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Secure your dishes, categories, and customer orders.
        </p>
      </div>

      {!isSupabaseEnabled ? (
        <div className="border border-amber-500/20 bg-amber-500/[0.06] p-4 text-sm text-amber-600 dark:text-amber-400 rounded-2xl">
          ⚠️ Database integration is not configured. Account backups require Supabase env configurations.
        </div>
      ) : isAnon ? (
        <div className="space-y-6">
          <div className="border border-brand-500/20 bg-brand-500/[0.04] p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-350 rounded-2xl">
            <p className="font-semibold text-brand-650 dark:text-brand-400 flex items-center gap-1.5 mb-1.5">
              <Icon d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="h-5 w-5 text-brand-600 dark:text-brand-400" strokeWidth={2} />
              Your menu is currently saved in this browser.
            </p>
            Protect your business from being deleted if you clear your browser history or cache. Enter an email address below to receive a verification code and secure your menu across all devices.
          </div>

          {error && (
            <div className="border border-rose-500/20 bg-rose-500/[0.06] p-4 text-sm text-rose-600 dark:text-rose-400 rounded-2xl">
              {error}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendBackupOtp} className="space-y-4 max-w-md">
              <div>
                <label htmlFor="bk-email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <input
                  id="bk-email"
                  type="email"
                  required
                  disabled={loading}
                  className="input-base"
                  placeholder="e.g. yourbusiness@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="btn-primary w-full sm:w-auto"
              >
                {loading ? 'Sending code…' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyBackupOtp} className="space-y-4 max-w-md">
              <div>
                <label htmlFor="bk-token" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Verification Code
                </label>
                <input
                  id="bk-token"
                  type="text"
                  maxLength={6}
                  required
                  disabled={loading}
                  className="input-base font-mono text-center text-lg tracking-[0.25em] pl-[0.25em]"
                  placeholder="000000"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || token.trim().length < 6}
                  className="btn-primary w-full sm:w-auto"
                >
                  {loading ? 'Verifying…' : 'Verify & Secure Menu'}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setError(null)
                    setOtpSent(false)
                    setToken('')
                  }}
                  className="btn-ghost w-full sm:w-auto text-xs font-semibold uppercase tracking-wider"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border border-brand-500/25 bg-brand-500/[0.06] p-4 text-sm text-slate-750 dark:text-slate-300 rounded-2xl">
            <h4 className="font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1.5 mb-2">
              <Icon d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="h-5 w-5 text-brand-650" strokeWidth={2} />
              Your menu is fully secured &amp; backed up!
            </h4>
            You are logged in with a permanent account. Your dishes, categories, and orders are stored safely in the database and can be accessed from any device.
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-5 dark:border-slate-800">
            <p className="text-sm font-mono tracking-wide text-slate-600 dark:text-slate-400">
              Connected Email: <b className="text-slate-900 dark:text-white">{userEmail}</b>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
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
