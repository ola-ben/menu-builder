import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import useSEO from '../hooks/useSEO.js'


const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: 'We collect information you provide directly to us when creating a MenuLink account or setting up your restaurant profile. This includes your email address, restaurant name, tagline, logo image, and your WhatsApp phone number. For diners, we temporarily store cart selections and table numbers on their local browser to facilitate order assembly.'
  },
  {
    title: '2. How We Use Your Information',
    content: 'We use the collected information to provision and manage your vendor dashboard, host your interactive digital menu, compile QR code placards, and route diner orders to your WhatsApp number. We may also use your contact details to communicate platform updates or offer billing support.'
  },
  {
    title: '3. Data Storage & Third-Party Services',
    content: 'MenuLink utilizes secure third-party hosting and backend infrastructure to store data (e.g. Supabase for user account authentication and database storage, Vercel for hosting). All communication routing to WhatsApp is processed directly through standard WhatsApp web links, passing structured cart messages directly from the diner\'s device to Meta\'s WhatsApp chat client.'
  },
  {
    title: '4. Cookies & Browser Local Storage',
    content: 'We use browser local storage and cookies to maintain authenticated sessions for vendors, store theme configurations, and temporarily save active diner cart items. We do not use third-party tracking pixels or ad-retargeting cookies.'
  },
  {
    title: '5. Information Sharing & Disclosure',
    content: 'We do not sell, rent, or trade your personal data to third parties for marketing purposes. Your menu details and restaurant WhatsApp number are shared publicly for the sole purpose of allowing diners to view and order from your menu.'
  },
  {
    title: '6. Data Security',
    content: 'We implement standard industry security practices, including Secure Socket Layer (SSL/TLS) encryption and Supabase Row Level Security (RLS) policies, to protect your accounts and menus from unauthorized access.'
  },
  {
    title: '7. Your Rights & Choice',
    content: 'You can update or delete your restaurant profile, categories, and menu items directly from the vendor dashboard at any time. To request complete deletion of your user account, please reach out to us via email or WhatsApp.'
  }
]

export default function Privacy() {
  useSEO({
    title: 'Privacy Policy | MenuLink',
    description: 'Read the Privacy Policy for using MenuLink.',
  })

  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-10">
      <header>
        <div className="flex items-center gap-2">
          <Link to="/" className="btn-ghost py-1 px-2.5 text-xs inline-flex items-center gap-1">
            <Icon d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" className="h-3.5 w-3.5" />
            Home
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="eyebrow !m-0">Legal</span>
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Privacy <span className="text-gradient">Policy</span>
        </h1>
        <p className="mt-3 text-sm text-slate-650 dark:text-slate-400">
          Last updated: July 7, 2026. Please read this policy carefully to understand our privacy practices.
        </p>
      </header>

      <div className="card divide-y divide-slate-100 p-6 dark:divide-slate-800/60 sm:p-8 space-y-6">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          At MenuLink, we value the privacy of our restaurant partners and their diners. This Privacy Policy describes how we collect, protect, and handle data when you use our platform.
        </p>

        <div className="space-y-6 pt-6">
          {SECTIONS.map((sec) => (
            <div key={sec.title} className="space-y-2">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {sec.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-400">
                {sec.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500">
          Have questions about your data? <Link to="/contact" className="text-brand-600 hover:underline dark:text-brand-400">Contact Support</Link>
        </p>
      </div>
    </div>
  )
}
