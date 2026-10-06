'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import Icon, { WhatsappIcon } from '../components/Icon.jsx'
import { supabase, isSupabaseEnabled } from '../lib/supabase.js'
import { formatNaira } from '../utils/format.js'
import useToast from '../hooks/useToast.js'
import Toast from '../components/Toast.jsx'

export default function AdminDashboard() {
  const { toast, showToast } = useToast()
  const [menus, setMenus] = useState([])
  const [billingMap, setBillingMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeDropdownId, setActiveDropdownId] = useState(null)
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)

  const dropdownRef = useRef(null)
  const bulkRef = useRef(null)

  // Outside click & ESC listeners to fix buggy CSS hover
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

  useEffect(() => {
    loadData()
  }, [])

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

  return (
    <div className="min-h-screen pb-20">
      {/* Admin Top Header */}
      <div className="border-b border-ink/10 bg-paper/80 backdrop-blur-md dark:border-paper/10 dark:bg-zinc-950/80 sticky top-0 z-30 px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-lg font-bold text-ink dark:text-paper">
              🍽️ MenuLink <span className="rounded bg-brand-500/15 px-2 py-0.5 font-mono text-[10px] text-brand-600 dark:text-brand-400">ADMIN</span>
            </Link>
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

            <button
              type="button"
              onClick={loadData}
              className="rounded-xl border border-ink/15 p-2 text-ink/60 hover:text-ink dark:border-paper/15 dark:text-paper/60 dark:hover:text-paper"
              title="Refresh"
            >
              ↻
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
            No restaurant menus found.
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
