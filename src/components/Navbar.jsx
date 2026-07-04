import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'My Menu' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 border-b border-ink/12 bg-paper/90 backdrop-blur-sm dark:border-paper/12 dark:bg-ink/90">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center bg-ink text-paper transition-colors group-hover:bg-whatsapp-600 dark:bg-paper dark:text-ink dark:group-hover:bg-whatsapp-600 dark:group-hover:text-white">
            <img src="/menu.svg" alt="" className="h-5 w-5 brightness-0 invert dark:invert-0 dark:group-hover:invert" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-ink dark:text-paper">
            Menu<span className="text-gradient">Link</span>
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
                      isActive
                        ? 'text-ink dark:text-paper'
                        : 'text-ink/45 hover:text-ink dark:text-paper/45 dark:hover:text-paper'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && (
                        <span className="absolute inset-x-3 bottom-0 h-px bg-whatsapp-600" />
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
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-ink hover:bg-ink/[0.04] dark:text-paper dark:hover:bg-paper/[0.04] sm:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg className="h-5 w-5 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Dropdown Panel */}
      {isMobileMenuOpen && (
        <div className="border-t border-ink/12 bg-paper py-3 px-4 dark:border-paper/12 dark:bg-ink sm:hidden">
          <ul className="flex flex-col gap-2">
            {links.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'text-brand-500 font-semibold'
                        : 'text-ink/65 hover:text-ink dark:text-paper/60 dark:hover:text-paper'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
