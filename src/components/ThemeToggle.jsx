import useTheme from '../hooks/useTheme.js'
import Icon from './Icon.jsx'

const SUN = 'M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36l-1.42-1.42M6.05 6.05L4.64 4.64m12.72 0l-1.42 1.42M6.05 17.95l-1.41 1.41M16 12a4 4 0 11-8 0 4 4 0 018 0z'
const MOON = 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <Icon d={isDark ? SUN : MOON} className="h-5 w-5" />
    </button>
  )
}
