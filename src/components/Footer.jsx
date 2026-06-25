import { Link } from 'react-router-dom'
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
  'grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400'

export default function Footer() {
  return (
    <footer className="border-t border-white/40 bg-white/40 backdrop-blur dark:border-white/5 dark:bg-slate-950/40">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-6 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} <span className="font-display font-bold text-gradient">MenuLink</span>. Your menu, one scan away.
        </p>

        <div className="flex items-center gap-2">
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
             className={`${iconCls} hover:!border-whatsapp-500 hover:!text-whatsapp-600`}>
            <WhatsappIcon className="h-4 w-4" />
          </a>
          <a href={TIKTOK} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={iconCls}>
            <TikTokIcon className="h-4 w-4" />
          </a>
          <a href={`mailto:${EMAIL}`} aria-label="Email" className={iconCls}>
            <Icon d={MAIL_ICON} className="h-4 w-4" />
          </a>
          <a href={PORTFOLIO} target="_blank" rel="noopener noreferrer" aria-label="My portfolio website" className={iconCls}>
            <Icon d={GLOBE_ICON} className="h-4 w-4" />
          </a>
          <Link to="/contact" aria-label="Contact page" className={iconCls}>
            <Icon d={CHAT_ICON} className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
