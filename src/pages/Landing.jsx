import { Link } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import Icon, { WhatsappIcon } from '../components/Icon.jsx'

const STEPS = [
  {
    title: 'Build your menu',
    desc: 'Add categories and dishes — photo, price in Naira, a short description. Editable anytime.',
    icon: 'M4 6h16M4 12h16M4 18h10',
  },
  {
    title: 'Print your QR',
    desc: 'Get a QR code for every table. Customers scan and your full menu opens on their phone.',
    icon: 'M3.75 4.5h6v6h-6v-6zm10.5 0h6v6h-6v-6zm-10.5 9h6v6h-6v-6zm10.5 3h3m-3 3h6m0-6v.01',
  },
  {
    title: 'Get orders on WhatsApp',
    desc: 'Guests tap to add dishes, then send the whole order to your WhatsApp in one message.',
    icon: 'M2.25 12.76c0 1.6 1.12 2.99 2.7 3.23.97.15 1.95.27 2.95.36V21l4.05-4.05a2.25 2.25 0 011.59-.66c1.04 0 2.08-.07 3.11-.2 1.58-.2 2.85-1.56 2.85-3.18V6.74c0-1.6-1.12-2.98-2.7-3.22A48.39 48.39 0 0012 3c-2.39 0-4.74.18-7.05.52C3.37 3.76 2.25 5.14 2.25 6.74v6.02z',
  },
]

const STATS = [
  { value: 'Free', label: 'To get started' },
  { value: '0%', label: 'Order commission' },
  { value: '1 tap', label: 'To WhatsApp' },
]

export default function Landing() {
  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="relative">
        {/* Decorative gradient orbs */}
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-400/30 blur-3xl dark:bg-brand-500/20" />
        <div aria-hidden className="pointer-events-none absolute -right-10 top-20 -z-10 h-56 w-56 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-500/10" />

        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <span className="eyebrow">For restaurants, bukas &amp; vendors</span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              Your menu,{' '}
              <span className="text-gradient">one scan away</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300 lg:mx-0">
              Turn your menu into a QR code for every table. Customers scan, browse with photos, and
              send their order straight to your WhatsApp. No reprints, no apps to download.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link to="/dashboard" className="btn-primary px-6 py-3 text-base">
                Build your menu — free
              </Link>
              <a href="#how" className="btn-ghost px-6 py-3 text-base">
                See how it works
              </a>
            </div>

            {/* Stat row */}
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-slate-200/70 pt-6 dark:border-slate-800 lg:mx-0">
              {STATS.map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <dt className="font-display text-2xl font-bold text-slate-900 dark:text-white">{s.value}</dt>
                  <dd className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Visual — floating phone-ish QR card */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-brand-500/20 to-amber-400/20 blur-2xl" />
            <div className="card card-hover animate-float-slow rounded-[2.5rem] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                    <Icon d="M4 6h16M4 12h16M4 18h10" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-slate-900 dark:text-white">Mama Nkechi’s</p>
                    <p className="text-[11px] text-slate-400">Table 4 · Scan to order</p>
                  </div>
                </div>
                <span className="rounded-full bg-whatsapp-50 px-2 py-1 text-[10px] font-bold text-whatsapp-700 dark:bg-whatsapp-500/10 dark:text-whatsapp-400">
                  OPEN
                </span>
              </div>

              <div className="mt-5 grid place-items-center rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700">
                <QRCodeCanvas value="https://menulink.demo" size={150} level="M" includeMargin />
              </div>

              <div className="mt-5 space-y-2">
                {['Jollof Rice & Chicken', 'Pepper Soup', 'Chapman'].map((d, i) => (
                  <div key={d} className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3 py-2 dark:bg-slate-800/50">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{d}</span>
                    <span className="font-display text-sm font-bold text-brand-600 dark:text-brand-400">
                      ₦{[3500, 2500, 1500][i].toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <button type="button" className="btn-whatsapp mt-5 w-full">
                <WhatsappIcon className="h-4 w-4" />
                Send order on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20">
        <div className="text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Three steps to taking orders
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card card-hover group relative overflow-hidden p-6">
              <span className="pointer-events-none absolute -right-4 -top-4 font-display text-7xl font-bold text-brand-500/10 transition group-hover:text-brand-500/20 dark:text-brand-400/10">
                {i + 1}
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-glow">
                <Icon d={s.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="relative overflow-hidden">
        <div className="card mx-auto max-w-3xl overflow-hidden p-8 text-center sm:p-12">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-dots text-whatsapp-500/10" />
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-whatsapp-500 to-whatsapp-600 text-white shadow-glow-green">
            <WhatsappIcon className="h-7 w-7" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Orders land in your WhatsApp
          </h2>
          <p className="mx-auto mt-4 max-w-lg leading-relaxed text-slate-600 dark:text-slate-400">
            No commission, no new app to learn. This is a free demo build — your menu is saved right
            in your browser, and every order goes straight to your own chat.
          </p>
          <Link to="/dashboard" className="btn-primary mt-7 px-6 py-3 text-base">
            Start building →
          </Link>
        </div>
      </section>
    </div>
  )
}
