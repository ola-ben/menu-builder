'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import Icon, { WhatsappIcon } from '../components/Icon.jsx'
import { supabase, isSupabaseEnabled } from '../lib/supabase.js'
import { formatNaira } from '../utils/format.js'
import useToast from '../hooks/useToast.js'
import Toast from '../components/Toast.jsx'

const ADMIN_EMAILS = [
  'olaben09@gmail.com',
  'benjaminsolaben@gmail.com',
  ...(process.env.NEXT_PUBLIC_ADMIN_EMAIL ? [process.env.NEXT_PUBLIC_ADMIN_EMAIL.toLowerCase().trim()] : [])
]

export default function AdminDashboard() {
  const { toast, showToast } = useToast()
  const [currentUser, setCurrentUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  const [menus, setMenus] = useState([])
  const [billingMap, setBillingMap] = useState({})
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeDropdownId, setActiveDropdownId] = useState(null)
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)

  const dropdownRef = useRef(null)
  const bulkRef = useRef(null)

  // Auth & Admin check
  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) {
      setAuthLoading(false)
      return
    }

    const checkUser = (user) => {
      setCurrentUser(user)
      const email = user?.email?.toLowerCase().trim() || ''
      const authorized = ADMIN_EMAILS.includes(email)
      setIsAdmin(authorized)
      setAuthLoading(false)
      if (authorized) {
        loadData()
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkUser(session?.user || null)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser(session?.user || null)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Outside click & ESC listeners for dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdownId(null)
      }
      if (bulkRef.current && !bulkRef.current.contains(e.target)) {
        setBulkDropdownOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdownId(null)
        setBulkDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    if (!isSupabaseEnabled || !supabase) {
      setLoading(false)
      return
    }

    try {
      const [{ data: menuRows }, { data: billingRows }] = await Promise.all([
        supabase.from('menus').select('*').order('created_at', { ascending: false }),
        supabase.from('menu_billing').select('*')
      ])

      setMenus(menuRows || [])
      const bMap = {}
      ;(billingRows || []).forEach((b) => {
        bMap[b.menu_id] = b
      })
      setBillingMap(bMap)
    } catch (err) {
      console.warn('[admin] load failed:', err)
      showToast('Could not load administrative data.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminGoogleSignIn = async () => {
    if (!isSupabaseEnabled || !supabase) {
      showToast('Supabase is not configured yet.', 'error')
      return
    }
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      })
      if (error) throw error
    } catch (err) {
      showToast(err.message || 'Google sign-in failed', 'error')
    }
  }

  const handleAdminSignOut = async () => {
    if (!supabase) return
    try {
      await supabase.auth.signOut()
      setCurrentUser(null)
      setIsAdmin(false)
      setMenus([])
      setBillingMap({})
      showToast('Signed out from Admin', 'info')
    } catch (err) {
      showToast('Sign out failed', 'error')
    }
  }

  const filteredMenus = useMemo(() => {
    if (!search.trim()) return menus
    const q = search.toLowerCase()
    return menus.filter(
      (m) =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.whatsapp_number || '').includes(q) ||
        (m.id || '').toLowerCase().includes(q)
    )
  }, [menus, search])

  // Extend trial for a single menu
  const handleExtendTrial = async (menuId, days) => {
    setActionBusy(true)
    setActiveDropdownId(null)
    try {
      const current = billingMap[menuId]
      const baseDate = current?.trial_ends_at ? new Date(current.trial_ends_at) : new Date()
      const newDate = new Date(Math.max(Date.now(), baseDate.getTime()) + days * 86400000)

      const { error } = await supabase
        .from('menu_billing')
        .upsert({
          menu_id: menuId,
          trial_ends_at: newDate.toISOString(),
          active: true
        })

      if (error) throw error
      showToast(`Extended trial by ${days} days! 🎉`, 'success')
      loadData()
    } catch (err) {
      showToast(err.message || 'Failed to extend trial', 'error')
    } finally {
      setActionBusy(false)
    }
  }

  // Bulk extend trials for all filtered menus
  const handleBulkExtend = async (days) => {
    if (!filteredMenus.length) return
    setActionBusy(true)
    setBulkDropdownOpen(false)
    try {
      const updates = filteredMenus.map((m) => {
        const current = billingMap[m.id]
        const baseDate = current?.trial_ends_at ? new Date(current.trial_ends_at) : new Date()
        const newDate = new Date(Math.max(Date.now(), baseDate.getTime()) + days * 86400000)
        return {
          menu_id: m.id,
          trial_ends_at: newDate.toISOString(),
          active: true
        }
      })

      const { error } = await supabase.from('menu_billing').upsert(updates)
      if (error) throw error
      showToast(`Bulk extended ${updates.length} menus by ${days} days! 🚀`, 'success')
      loadData()
    } catch (err) {
      showToast(err.message || 'Bulk extend failed', 'error')
    } finally {
      setActionBusy(false)
    }
  }

  // Delete a single menu
  const handleDeleteMenu = async (menuId, name) => {
    if (!confirm(`Are you sure you want to permanently delete "${name || 'Untitled Restaurant'}" (${menuId})?`)) {
      return
    }
    setActionBusy(true)
    try {
      await Promise.all([
        supabase.from('menu_billing').delete().eq('menu_id', menuId),
        supabase.from('menu_reviews').delete().eq('menu_id', menuId),
        supabase.from('menus').delete().eq('id', menuId),
      ])
      showToast(`Deleted ${name || menuId}`, 'success')
      loadData()
    } catch (err) {
      showToast(err.message || 'Failed to delete menu', 'error')
    } finally {
      setActionBusy(false)
    }
  }

  // Clear all test menus
  const handleClearAllTestData = async () => {
    if (!confirm(`Are you sure you want to permanently delete ALL ${menus.length} test restaurant records? This will leave your database clean for real registrations.`)) {
      return
    }
    setActionBusy(true)
    try {
      const ids = menus.map((m) => m.id)
      if (ids.length > 0) {
        await Promise.all([
          supabase.from('menu_billing').delete().in('menu_id', ids),
          supabase.from('menu_reviews').delete().in('menu_id', ids),
          supabase.from('menus').delete().in('id', ids),
        ])
      }
      showToast(`Cleared all ${menus.length} test menus! Database is fresh.`, 'success')
      loadData()
    } catch (err) {
      showToast(err.message || 'Failed to clear test data', 'error')
    } finally {
      setActionBusy(false)
    }
  }

  // Generate 1-Click Welcome Email
  const getWelcomeEmailLink = (menu) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://menulink.ng'
    const publicUrl = `${origin}/menu/${menu.id}`
    const subject = encodeURIComponent(`Welcome to MenuLink — Your Digital Table Menu is Live! 🍽️`)
    const body = encodeURIComponent(
      `Hello ${menu.name || 'Chef'},\n\n` +
      `Congratulations on launching your digital menu with MenuLink! 🎉\n\n` +
      `Here are your official menu details:\n` +
      `• Restaurant: ${menu.name}\n` +
      `• Live Menu Link: ${publicUrl}\n` +
      `• Orders Route To: ${menu.whatsapp_number || 'Your WhatsApp'}\n\n` +
      `🚀 Quick Tips for Success:\n` +
      `1. Print your Table QR Placards from your dashboard and place them on every dining table.\n` +
      `2. Test your menu by scanning the QR code and sending a test order.\n` +
      `3. Put your menu link in your Instagram & WhatsApp bio for takeaway orders.\n\n` +
      `Need help with anything? Simply reply to this email or chat with our team.\n\n` +
      `Happy serving,\nThe MenuLink Team`
    )
    return `mailto:?subject=${subject}&body=${body}`
  }

  // 1. Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-sm w-full p-8 text-center space-y-3">
          <div className="inline-block animate-spin text-2xl">⏳</div>
          <p className="font-display font-semibold text-ink dark:text-paper">Verifying Admin Permissions…</p>
          <p className="text-xs text-ink/50 dark:text-paper/50 font-mono">Checking security credentials</p>
        </div>
      </div>
    )
  }

  // 2. Unauthorized or Unauthenticated State
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center space-y-6 border border-ink/10 dark:border-paper/10 shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-3xl">
            🛡️
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-ink dark:text-paper">
              Admin Access Required
            </h1>
            <p className="text-xs text-ink/65 dark:text-paper/65 leading-relaxed">
              This dashboard is restricted to authorized platform administrators (<strong>olaben09@gmail.com</strong>).
            </p>
          </div>

          {currentUser ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-600 dark:text-rose-400 space-y-2">
              <p className="font-medium">
                Signed in as: <strong>{currentUser.email}</strong>
              </p>
              <p className="text-[11px] opacity-80">
                This account does not have administrative privileges.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleAdminSignOut}
                  className="rounded-lg border border-rose-500/30 px-3 py-1.5 font-bold hover:bg-rose-500/10 transition-colors"
                >
                  Sign Out & Switch Account
                </button>
              </div>
            </div>
          ) : null}

          <div>
            <button
              type="button"
              onClick={handleAdminGoogleSignIn}
              className="w-full rounded-xl border border-ink/15 bg-paper hover:bg-ink/[0.03] text-ink dark:border-paper/20 dark:bg-zinc-900 dark:hover:bg-paper/5 font-semibold py-3 px-4 shadow-sm flex items-center justify-center gap-3 transition-all duration-150 hover:shadow"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign In as Admin with Google</span>
            </button>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="text-xs font-mono text-ink/50 hover:text-ink dark:text-paper/50 dark:hover:text-paper hover:underline"
            >
              ← Return to MenuLink Home
            </Link>
          </div>
        </div>
        <Toast toast={toast} />
      </div>
    )
  }

  // 3. Authorized Admin View
  return (
    <div className="min-h-screen pb-20">
      {/* Admin Top Header */}
      <div className="border-b border-ink/10 bg-paper/80 backdrop-blur-md dark:border-paper/10 dark:bg-zinc-950/80 sticky top-0 z-30 px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-lg font-bold text-ink dark:text-paper">
              🍽️ MenuLink <span className="rounded bg-brand-500/15 px-2 py-0.5 font-mono text-[10px] text-brand-600 dark:text-brand-400">ADMIN</span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {currentUser?.email}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk Extend Dropdown (Click-to-Toggle) */}
            <div className="relative" ref={bulkRef}>
              <button
                type="button"
                onClick={() => setBulkDropdownOpen((o) => !o)}
                disabled={actionBusy || filteredMenus.length === 0}
                className="btn-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>Bulk Extend Trial</span>
                <span className="text-[10px]">▾</span>
              </button>

              {bulkDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-ink/10 bg-paper p-1.5 shadow-xl dark:border-paper/15 dark:bg-zinc-900 z-50">
                  <p className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-ink/40 dark:text-paper/40">
                    Extend {filteredMenus.length} Menus:
                  </p>
                  {[7, 14, 30, 60, 90].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleBulkExtend(d)}
                      className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-paper/5 transition-colors"
                    >
                      +{d} Days
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear All Test Data */}
            {menus.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllTestData}
                disabled={actionBusy}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors flex items-center gap-1"
                title="Delete all test restaurant data"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">Clear All Test Menus</span>
              </button>
            )}

            <button
              type="button"
              onClick={loadData}
              className="rounded-xl border border-ink/15 p-2 text-ink/60 hover:text-ink dark:border-paper/15 dark:text-paper/60 dark:hover:text-paper"
              title="Refresh"
            >
              ↻
            </button>

            <button
              type="button"
              onClick={handleAdminSignOut}
              className="rounded-xl border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/60 hover:text-rose-600 dark:border-paper/15 dark:text-paper/60 dark:hover:text-rose-400 transition-colors"
              title="Sign Out"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink dark:text-paper">
              Active Restaurant Menus
            </h1>
            <p className="text-xs text-ink/60 dark:text-paper/60">
              Total {menus.length} registered digital menus.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, whatsapp, or ID..."
              className="input-base text-xs py-2"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-ink/50 dark:text-paper/50">
            Loading restaurant records…
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="card p-12 text-center text-xs text-ink/50 dark:text-paper/50">
            No registered restaurant menus yet. Database is completely clean!
          </div>
        ) : (
          <div className="card overflow-hidden border border-ink/10 dark:border-paper/10 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-ink/10 bg-ink/[0.02] dark:border-paper/10 dark:bg-paper/[0.02]">
                  <tr>
                    <th className="p-3.5 font-mono text-[10px] uppercase tracking-wider text-ink/50 dark:text-paper/50">Restaurant</th>
                    <th className="p-3.5 font-mono text-[10px] uppercase tracking-wider text-ink/50 dark:text-paper/50">WhatsApp</th>
                    <th className="p-3.5 font-mono text-[10px] uppercase tracking-wider text-ink/50 dark:text-paper/50">Dishes</th>
                    <th className="p-3.5 font-mono text-[10px] uppercase tracking-wider text-ink/50 dark:text-paper/50">Trial Status</th>
                    <th className="p-3.5 font-mono text-[10px] uppercase tracking-wider text-ink/50 dark:text-paper/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 dark:divide-paper/5">
                  {filteredMenus.map((m) => {
                    const billing = billingMap[m.id]
                    const trialEnds = billing?.trial_ends_at ? new Date(billing.trial_ends_at) : null
                    const isExpired = trialEnds && trialEnds < new Date()
                    const daysLeft = trialEnds ? Math.ceil((trialEnds - new Date()) / 86400000) : 0

                    return (
                      <tr key={m.id} className="hover:bg-ink/[0.01] dark:hover:bg-paper/[0.01]">
                        <td className="p-3.5">
                          <p className="font-display font-bold text-ink dark:text-paper">
                            {m.name || 'Untitled Restaurant'}
                          </p>
                          <a
                            href={`/menu/${m.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[10px] text-brand-600 dark:text-brand-400 hover:underline"
                          >
                            /menu/{m.id} ↗
                          </a>
                        </td>
                        <td className="p-3.5 font-mono text-ink/70 dark:text-paper/70">
                          {m.whatsapp_number || '—'}
                        </td>
                        <td className="p-3.5">
                          <span className="rounded-full bg-ink/5 px-2 py-0.5 font-mono text-[10px] dark:bg-paper/5">
                            {m.items?.length || 0} items
                          </span>
                        </td>
                        <td className="p-3.5">
                          {billing?.active === false ? (
                            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 font-semibold text-[10px] text-rose-600 dark:text-rose-400">
                              Paused
                            </span>
                          ) : isExpired ? (
                            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 font-semibold text-[10px] text-rose-600 dark:text-rose-400">
                              Expired
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-semibold text-[10px] text-emerald-600 dark:text-emerald-400">
                              {daysLeft} days left
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* 1-Click Welcome Email */}
                            <a
                              href={getWelcomeEmailLink(m)}
                              className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                              title="Send Welcome Email"
                            >
                              ✉️ Welcome Email
                            </a>

                            {/* Extend Trial Dropdown (Click-to-Toggle) */}
                            <div className="relative" ref={activeDropdownId === m.id ? dropdownRef : null}>
                              <button
                                type="button"
                                onClick={() => setActiveDropdownId((curr) => (curr === m.id ? null : m.id))}
                                className="rounded-lg border border-ink/15 px-2.5 py-1 text-[11px] font-semibold text-ink/75 hover:bg-ink/5 dark:border-paper/15 dark:text-paper/75 dark:hover:bg-paper/5 transition-colors flex items-center gap-1"
                              >
                                Extend ▾
                              </button>

                              {activeDropdownId === m.id && (
                                <div className="absolute right-0 mt-1 w-36 rounded-xl border border-ink/10 bg-paper p-1 shadow-xl dark:border-paper/15 dark:bg-zinc-900 z-50 text-left">
                                  {[7, 14, 30, 60, 90].map((d) => (
                                    <button
                                      key={d}
                                      type="button"
                                      onClick={() => handleExtendTrial(m.id, d)}
                                      className="w-full rounded-lg px-2 py-1 text-left text-xs text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-paper/5 transition-colors"
                                    >
                                      +{d} Days
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Delete Menu Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteMenu(m.id, m.name)}
                              className="rounded-lg border border-rose-500/20 px-2 py-1 text-[11px] text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="Delete this menu"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Toast toast={toast} />
    </div>
  )
}

