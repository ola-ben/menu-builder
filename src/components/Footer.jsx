import Link from 'next/link'
import Icon, { WhatsappIcon, TikTokIcon } from './Icon.jsx'

const WHATSAPP = 'https://wa.me/2347063026374'
const TIKTOK = 'https://www.tiktok.com/@benjaminsdevs'
const EMAIL = 'olaben09@gmail.com'
const PORTFOLIO = 'https://benjaminolaoluwa.vercel.app/'

const MAIL_ICON =
  'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75'
const CHAT_ICON = 'M8 10.5h8M8 14h5m-9 6l3.5-2.5H18a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14z'
const GLOBE_ICON = 'M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9 4.5 4.03 4.5 9-2.015 9-4.5 9zM3 12h18'

const iconCls =
  'grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:scale-105 dark:border-slate-700 dark:text-slate-400'

const SOCIAL_LINKS = [
  {
    href: WHATSAPP,
    label: 'WhatsApp',
    external: true,
    hoverClass: 'hover:!border-whatsapp-500 hover:!text-whatsapp-600',
    icon: <WhatsappIcon className="h-4 w-4" />
  },
  {
    href: TIKTOK,
    label: 'TikTok',
    external: true,
    hoverClass: 'hover:!border-pink-500 hover:!text-pink-500',
    icon: <TikTokIcon className="h-4 w-4" />
  },
  {
    href: `mailto:${EMAIL}`,
    label: 'Email',
    external: false,
    hoverClass: 'hover:!border-brand-500 hover:!text-brand-500',
    icon: <Icon d={MAIL_ICON} className="h-4 w-4" />
  },
  {
    href: PORTFOLIO,
    label: 'Portfolio',
    external: true,
    hoverClass: 'hover:!border-blue-500 hover:!text-blue-500',
    icon: <Icon d={GLOBE_ICON} className="h-4 w-4" />
  },
  {
    href: '/contact',
    label: 'Contact',
    isNextLink: true,
    hoverClass: 'hover:!border-brand-500 hover:!text-brand-500',
    icon: <Icon d={CHAT_ICON} className="h-4 w-4" />
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/40 bg-white/40 backdrop-blur dark:border-white/5 dark:bg-slate-950/40">
      <div className="mx-auto flex max-w-5xl lg:max-w-7xl flex-col items-center gap-4 px-4 py-6 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <div className="text-center sm:text-left space-y-1">
          <p>
            © {new Date().getFullYear()} <span className="font-display font-bold text-gradient">MenuLink</span>. Your menu, one scan away.
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-400 dark:text-slate-500 sm:justify-start">
            <Link href="/terms" className="hover:text-brand-600 transition-colors dark:hover:text-brand-400">Terms of Service</Link>
            <span className="text-slate-200 dark:text-slate-800">•</span>
            <Link href="/privacy" className="hover:text-brand-600 transition-colors dark:hover:text-brand-400">Privacy Policy</Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {SOCIAL_LINKS.map((item) => (
            <div key={item.label} className="relative group">
              {item.isNextLink ? (
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className={`${iconCls} ${item.hoverClass}`}
                >
                  {item.icon}
                </Link>
              ) : (
                <a
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  aria-label={item.label}
                  className={`${iconCls} ${item.hoverClass}`}
                >
                  {item.icon}
                </a>
              )}

              {/* Tooltip Badge on Hover */}
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 shadow-md transition-all duration-150 group-hover:-top-9 group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900 z-50">
                {item.label}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

