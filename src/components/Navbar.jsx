import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'My Menu' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/60 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/60">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-glow transition group-hover:-rotate-6 group-hover:scale-105">
            <img src="/menu.svg" alt="" className="h-5 w-5 brightness-0 invert" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Menu<span className="text-gradient">Link</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <ul className="flex items-center gap-1 rounded-full border border-slate-200/60 bg-white/50 p-1 dark:border-slate-800 dark:bg-slate-900/50">
            {links.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-glow'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
