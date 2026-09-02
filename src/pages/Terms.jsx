import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import useSEO from '../hooks/useSEO.js'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing or using MenuLink, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms apply to all restaurant owners, staff, and visitors who access or use the service.'
  },
  {
    title: '2. Service Description & Eligibility',
    content: 'MenuLink provides digital menu hosting and QR code generation tools, routing diner selections directly to the merchant\'s WhatsApp number. You must be at least 18 years old or represent a legally registered business entity to create a vendor account and publish menus.'
  },
  {
    title: '3. Free Trial & Subscriptions',
    content: 'All new menus start with a free 30-day trial period, requiring no credit card upfront. Upon expiration of the 30 days, you must subscribe to an active plan to keep your menu live and accessible to diners. Subscriptions are billed on a recurring basis and are non-refundable.'
  },
  {
    title: '4. WhatsApp Communication & Disclaimer',
    content: 'MenuLink simplifies order routing by launching structured WhatsApp messages from diners to vendors. We do not process payments directly on WhatsApp, nor do we act as an intermediary in any commercial transactions, delivery, or food preparation dispute. WhatsApp is a third-party service owned by Meta, and we hold no liability for its service disruptions.'
  },
  {
    title: '5. Acceptable Use',
    content: 'Vendors are solely responsible for all content uploaded to their digital menus (including pricing, images, and descriptions). You agree not to upload illegal, fraudulent, harmful, or defamatory content. We reserve the right to suspend any account violating these guidelines.'
  },
  {
    title: '6. Limitation of Liability',
    content: 'To the maximum extent permitted by applicable law, MenuLink and its developers shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services, including lost profits or data loss.'
  },
  {
    title: '7. Governing Law',
    content: 'These terms and conditions are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. You irrevocably submit to the exclusive jurisdiction of the courts in that state or location.'
  }
]

export default function Terms() {
  useSEO({
    title: 'Terms of Service | MenuLink',
    description: 'Read the Terms of Service agreement for using MenuLink.',
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
          Terms of <span className="text-gradient">Service</span>
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Last updated: July 7, 2026. Please read these terms carefully before using our platform.
        </p>
      </header>

      <div className="card divide-y divide-slate-100 p-6 dark:divide-slate-800/60 sm:p-8 space-y-6">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Welcome to MenuLink! These Terms of Service ("Terms") govern your access to and use of the MenuLink website, mobile applications, and services. By creating an account or hosting a menu, you confirm your agreement to these Terms.
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
          Questions about our Terms? <Link to="/contact" className="text-brand-600 hover:underline dark:text-brand-400">Contact Support</Link>
        </p>
      </div>
    </div>
  )
}
