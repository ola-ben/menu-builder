import Icon, { WhatsappIcon, TikTokIcon } from '../components/Icon.jsx'

const CONTACTS = [
  {
    label: 'WhatsApp',
    value: '0706 302 6374',
    href: 'https://wa.me/2347063026374?text=' + encodeURIComponent("Hi! I'd like to know more about MenuLink."),
    glyph: 'whatsapp',
    accent: true,
  },
  {
    label: 'Call',
    value: '0706 302 6374',
    href: 'tel:+2347063026374',
    glyph: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z',
  },
  {
    label: 'Email',
    value: 'olaben09@gmail.com',
    href: 'mailto:olaben09@gmail.com',
    glyph: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
  },
  {
    label: 'TikTok',
    value: '@benjaminsdevs',
    href: 'https://www.tiktok.com/@benjaminsdevs',
    glyph: 'tiktok',
    external: true,
  },
]

export default function Contact() {
  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <header>
        <span className="eyebrow">Get in touch</span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          <span className="text-gradient">Contact</span>
        </h1>
        <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">
          Questions, a free menu setup, or help going live? Reach out on any of these — I reply fastest on WhatsApp.
        </p>
      </header>

      <div className="card mt-6 divide-y divide-slate-100 overflow-hidden dark:divide-slate-800">
        {CONTACTS.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.external || c.glyph === 'whatsapp' ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="group flex items-center gap-4 px-5 py-4 transition hover:bg-brand-50/60 dark:hover:bg-slate-800/40"
          >
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                c.accent
                  ? 'bg-gradient-to-br from-whatsapp-500 to-whatsapp-600 text-white'
                  : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300'
              }`}
            >
              {c.glyph === 'whatsapp' ? (
                <WhatsappIcon className="h-5 w-5" />
              ) : c.glyph === 'tiktok' ? (
                <TikTokIcon className="h-5 w-5" />
              ) : (
                <Icon d={c.glyph} className="h-5 w-5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{c.label}</p>
              <p className="truncate font-medium text-slate-900 dark:text-white">{c.value}</p>
            </div>
            <Icon
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-brand-500 dark:text-slate-600"
            />
          </a>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">MenuLink · Made in Nigeria 🇳🇬</p>
    </div>
  )
}
