import { Inter, Space_Grotesk } from 'next/font/google'
import Script from 'next/script'
import InstallPrompt from '../components/InstallPrompt.jsx'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

export const viewport = {
  themeColor: '#ea580c',
}

export const metadata = {
  metadataBase: new URL('https://menulink.vercel.app'),
  title: {
    default: 'MenuLink — Your Digital Menu + Table QR',
    template: '%s | MenuLink',
  },
  description:
    'Build a digital menu for your restaurant, get a QR code for your tables, and take orders on WhatsApp. Free and made for Nigerian food businesses.',
  icons: {
    icon: '/menu.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'MenuLink',
    title: 'MenuLink — Your Digital Menu + Table QR',
    description:
      'A digital menu with a QR code for every table. Diners scan, browse, and order on WhatsApp. Free, made for Nigerian food businesses.',
    url: 'https://menulink.vercel.app',
    images: [
      {
        url: '/og-cover.png',
        width: 1200,
        height: 630,
        alt: 'MenuLink — Digital Menu + Table QR',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MenuLink — Your Digital Menu + Table QR',
    description:
      'A digital menu with a QR code for every table. Scan, browse, order on WhatsApp.',
    images: ['/og-cover.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevent dark mode theme flash before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('qr-menu:theme')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <InstallPrompt />
        {children}
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  )
}
