'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isSupabaseEnabled } from '../lib/supabase.js'

const ADMIN_EMAILS = [
  'olaben09@gmail.com',
  'benjaminsolaben@gmail.com',
  ...(process.env.NEXT_PUBLIC_ADMIN_EMAIL ? [process.env.NEXT_PUBLIC_ADMIN_EMAIL.toLowerCase().trim()] : [])
]

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const pathname = usePathname()
  const isHome = pathname === '/'

  // Track user auth status
  useEffect(() => {
    if (isSupabaseEnabled && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null)
      })
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null)
      })
      return () => subscription?.unsubscribe()
    }
  }, [])

  // Lock body scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const isLoggedIn = Boolean(user && !user.is_anonymous && user.email)
  const isAdmin = Boolean(isLoggedIn && ADMIN_EMAILS.includes(user.email.toLowerCase().trim()))

  const links = isAdmin
    ? [
        { href: '/', label: 'Home' },
        { href: '/admin', label: 'Admin Portal 🛡️' },
        { href: '/contact', label: 'Contact' },
      ]
    : [
        { href: '/', label: 'Home' },
        { href: '/dashboard', label: 'My Menu' },
        { href: '/contact', label: 'Contact' },
      ]

  return (
    <>
      <header className={
        isHome 
          ? "absolute top-0 left-0 right-0 z-30 border-b border-white/10 bg-transparent" 
          : "sticky top-0 z-20 border-b border-ink/12 bg-paper/90 backdrop-blur-sm dark:border-paper/12 dark:bg-ink/90"
      }>
        <nav className="mx-auto flex max-w-5xl lg:max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className={`grid h-9 w-9 place-items-center transition-colors ${
              isHome 
                ? 'bg-white text-ink group-hover:bg-whatsapp-600 group-hover:text-white' 
                : 'bg-ink text-paper group-hover:bg-whatsapp-600 dark:bg-paper dark:text-ink dark:group-hover:bg-whatsapp-600 dark:group-hover:text-white'
            }`}>
              <img src="/menu.svg" alt="" className={`h-5 w-5 ${
                isHome 
                  ? 'brightness-0 dark:brightness-0 group-hover:invert' 
                  : 'brightness-0 invert dark:invert-0 dark:group-hover:invert'
              }`} />
            </span>
            <span className={`font-display text-base font-semibold tracking-tight ${
              isHome ? 'text-white' : 'text-ink dark:text-paper'
            }`}>
              Menu<span className={isHome ? 'text-whatsapp-500' : 'text-gradient'}>Link</span>
            </span>
          </Link>

          {/* Desktop Navigation Links & Action Button for sm, md, lg */}
          <div className="hidden sm:flex items-center gap-4 md:gap-6">
            <ul className="flex items-center gap-1">
              {links.map(({ href, label }) => {
                const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`relative px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                        isHome 
                          ? isActive 
                            ? 'text-white font-bold' 
                            : 'text-white/70 hover:text-white'
                          : isActive
                            ? 'text-ink dark:text-paper font-bold'
                            : 'text-ink/60 hover:text-ink dark:text-paper/60 dark:hover:text-paper'
                      }`}
                    >
                      {label}
                      {isActive && (
                        <span className={`absolute inset-x-3 bottom-0 h-0.5 ${
                          isHome ? 'bg-white' : 'bg-whatsapp-600'
                        }`} />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Desktop Action Button - Plain Background without green dot */}
            <div className="flex items-center pl-2 border-l border-white/15 dark:border-paper/15">
              {isAdmin ? (
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider font-semibold transition-colors ${
                    isHome
                      ? 'text-brand-400 hover:text-white'
                      : 'text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-white'
                  }`}
                >
                  <span>🛡️ Admin</span>
                </Link>
              ) : isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider font-semibold transition-colors ${
                    isHome
                      ? 'text-white/80 hover:text-white'
                      : 'text-ink/70 hover:text-ink dark:text-paper/70 dark:hover:text-paper'
                  }`}
                >
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider font-semibold transition-colors ${
                    isHome
                      ? 'text-white/80 hover:text-white'
                      : 'text-ink/70 hover:text-ink dark:text-paper/70 dark:hover:text-paper'
                  }`}
                >
                  <span>Sign In →</span>
                </Link>
              )}
            </div>
          </div>

          {/* Clean Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`p-2 rounded-lg sm:hidden ${
              isHome 
                ? 'text-white hover:bg-white/[0.08]' 
                : 'text-ink hover:bg-ink/[0.08] dark:text-paper dark:hover:bg-paper/[0.08]'
            }`}
            aria-label="Open menu"
          >
            <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </header>

      {/* Fullscreen Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/90 px-6 py-6 backdrop-blur-xl border-l border-white/10 sm:hidden overflow-y-auto"
          >
            {/* Top Bar inside mobile menu */}
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="group flex items-center gap-2.5"
              >
                <span className="grid h-9 w-9 place-items-center bg-white text-ink transition-colors group-hover:bg-whatsapp-600 group-hover:text-white">
                  <img src="/menu.svg" alt="" className="h-5 w-5 brightness-0" />
                </span>
                <span className="font-display text-base font-semibold tracking-tight text-white">
                  Menu<span className="text-whatsapp-500">Link</span>
                </span>
              </Link>

              {/* Close Button [X] */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/[0.04] text-white/80 transition-colors hover:border-white/40 hover:bg-white/[0.08] hover:text-white"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Center Navigation Links with Brand Glow Aura */}
            <div className="relative my-auto flex flex-col items-center justify-center py-8">
              <div className="pointer-events-none absolute h-56 w-56 rounded-full bg-gradient-to-t from-brand-500/25 via-amber-500/15 to-transparent blur-3xl" />

              <nav className="relative z-10 flex flex-col items-center gap-7 text-center">
                {links.map(({ href, label }, index) => {
                  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
                  return (
                    <motion.div
                      key={href}
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + index * 0.05, duration: 0.25, ease: 'easeOut' }}
                    >
                      <Link
                        href={href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block font-display text-2xl font-bold tracking-tight transition-all duration-200 ${
                          isActive
                            ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                            : 'text-white/70 hover:text-white hover:scale-105'
                        }`}
                      >
                        {label}
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>
            </div>

            {/* Bottom Mobile Action Buttons */}
            <div className="border-t border-white/10 pt-5 space-y-3">
              {isAdmin ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2 text-xs text-white/70 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="truncate max-w-[220px]">Admin: {user.email}</span>
                    </span>
                  </div>

                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3.5 text-center font-display text-sm font-bold tracking-normal text-white shadow-lg transition-all duration-200 hover:bg-brand-600 active:scale-[0.98]"
                  >
                    <span>🛡️</span>
                    <span>Open Admin Control Panel</span>
                  </Link>
                </div>
              ) : isLoggedIn ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2 text-xs text-white/70">
                    <span className="flex items-center gap-1.5 font-mono">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="truncate max-w-[220px]">{user.email}</span>
                    </span>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-white py-3.5 text-center font-display text-sm font-bold tracking-normal text-ink shadow-lg transition-all duration-200 hover:bg-paper active:scale-[0.98]"
                  >
                    Go to My Menu Dashboard →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsMobileMenuOpen(false)
                      if (isSupabaseEnabled && supabase) {
                        await supabase.auth.signInWithOAuth({
                          provider: 'google',
                          options: {
                            redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
                          },
                        })
                      }
                    }}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white py-3.5 px-4 font-display text-sm font-bold text-slate-900 shadow-xl transition-all duration-200 hover:bg-slate-50 active:scale-[0.98]"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign In with Google</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
