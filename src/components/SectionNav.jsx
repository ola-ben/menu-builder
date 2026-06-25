import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'
import { useOpenPanel, togglePanel, setOpenPanel, setNavMounted } from '../hooks/useFloatingPanel.js'

/**
 * A floating "jump to section" menu for the long dashboard. Its launcher sits in
 * the bottom-right, stacked just above the chat bubble. Opening it closes the
 * chat (and vice versa) — they share one open-panel store. Tap a section to
 * smooth-scroll there; the section currently in view stays highlighted.
 *
 * `sections` = [{ id, label, d }]  where `id` matches an element id on the page
 * and `d` is an SVG path for the Icon.
 */
export default function SectionNav({ sections }) {
  const open = useOpenPanel() === 'nav'
  const [active, setActive] = useState(sections[0]?.id)

  // Let the chat widget know this stacked launcher is on screen, so its panel
  // opens higher and doesn't overlap. Also close any open panel on unmount.
  useEffect(() => {
    setNavMounted(true)
    return () => {
      setNavMounted(false)
      setOpenPanel(null)
    }
  }, [])

  // Highlight whichever section is currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpenPanel(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id) => {
    const el = document.getElementById(id)
    if (el) {
      // Offset for the sticky navbar (~60px) so the heading isn't hidden.
      const y = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
    setOpenPanel(null)
  }

  return (
    <>
      {/* Click-away backdrop */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpenPanel(null)} aria-hidden />}

      {/* Panel — opens upward from the launcher, bottom-right */}
      {open && (
        <nav
          aria-label="Jump to section"
          className="animate-slide-up fixed bottom-40 right-5 z-50 w-56 overflow-hidden rounded-2xl border border-white/60 bg-white shadow-lift dark:border-white/10 dark:bg-slate-900"
        >
          <p className="border-b border-slate-100 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800">
            Jump to
          </p>
          <ul className="p-2">
            {sections.map(({ id, label, d }) => {
              const isActive = active === id
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => go(id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors ${
                      isActive
                        ? 'bg-brand-500/10 text-brand-700 dark:text-brand-400'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${
                        isActive
                          ? 'border-brand-500/40 text-brand-600 dark:text-brand-400'
                          : 'border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500'
                      }`}
                    >
                      <Icon d={d} className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      {/* Launcher — stacked directly above the chat bubble (neutral, to read as a
          distinct control from the brand-gradient chat button) */}
      <button
        type="button"
        onClick={() => togglePanel('nav')}
        aria-label={open ? 'Close section menu' : 'Open section menu'}
        aria-expanded={open}
        className="fixed bottom-[5.5rem] right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-slate-900 text-white shadow-lift transition-transform hover:scale-105 dark:bg-white dark:text-slate-900"
      >
        <Icon
          d={open ? 'M6 18L18 6M6 6l12 12' : 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'}
          className="h-6 w-6"
          strokeWidth={2}
        />
      </button>
    </>
  )
}
