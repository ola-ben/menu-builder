import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'My Menu' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

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

  return (
    <>
      <header className={
        isHome 
          ? "absolute top-0 left-0 right-0 z-30 border-b border-white/10 bg-transparent" 
          : "sticky top-0 z-20 border-b border-ink/12 bg-paper/90 backdrop-blur-sm dark:border-paper/12 dark:bg-ink/90"
      }>
        <nav className="mx-auto flex max-w-5xl lg:max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5">
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

          {/* Desktop Navigation Links */}
          <div className="hidden sm:flex items-center gap-2">
            <ul className="flex items-center gap-1">
              {links.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `relative px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                        isHome 
                          ? isActive 
                            ? 'text-white' 
                            : 'text-white/60 hover:text-white'
                          : isActive
                            ? 'text-ink dark:text-paper'
                            : 'text-ink/45 hover:text-ink dark:text-paper/45 dark:hover:text-paper'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {label}
                        {isActive && (
                          <span className={`absolute inset-x-3 bottom-0 h-px ${
                            isHome ? 'bg-white' : 'bg-whatsapp-600'
                          }`} />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Menu Icon Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`p-2 sm:hidden ${
              isHome 
                ? 'text-white hover:bg-white/[0.04]' 
                : 'text-ink hover:bg-ink/[0.04] dark:text-paper dark:hover:bg-paper/[0.04]'
            }`}
            aria-label="Open menu"
          >
            <svg className="h-5 w-5 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </header>

      {/* Fullscreen Mobile Menu Overlay with Framer Motion */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -32 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/60 px-6 py-6 backdrop-blur-xl border border-white/10 sm:hidden"
          >
            {/* Top Bar inside mobile menu */}
            <div className="flex items-center justify-between">
              <Link
                to="/"
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
            <div className="relative my-auto flex flex-col items-center justify-center py-10">
              {/* Glowing Brand Aura behind links */}
              <div className="pointer-events-none absolute h-56 w-56 rounded-full bg-gradient-to-t from-brand-500/25 via-amber-500/15 to-transparent blur-3xl" />

              <nav className="relative z-10 flex flex-col items-center gap-8 text-center">
                {links.map(({ to, label, end }, index) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + index * 0.05, duration: 0.25, ease: 'easeOut' }}
                  >
                    <NavLink
                      to={to}
                      end={end}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block font-display text-3xl font-bold tracking-tight transition-all duration-200 ${
                          isActive
                            ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                            : 'text-white/70 hover:text-white hover:scale-105'
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Bottom Sign In Action Button */}
            <div className="border-t border-white/10 pt-6">
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-full bg-white py-4 text-center font-display text-sm font-bold tracking-normal text-ink shadow-lg transition-all duration-200 hover:bg-paper hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
