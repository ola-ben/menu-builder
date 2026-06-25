import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Local-dev backend for the chatbot. Vercel functions (api/*.js) don't run under
// `vite dev`, so this serves POST /api/assist locally with the same Groq caller.
// The key is read server-side from .env — never exposed to the browser.
function devAssistApi(env) {
  return {
    name: 'dev-assist-api',
    configureServer(server) {
      server.middlewares.use('/api/assist', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', async () => {
          res.setHeader('content-type', 'application/json')
          try {
            const { messages, context } = JSON.parse(body || '{}')
            const { generateReply } = await import('./api/_assistant.js')
            const text = await generateReply(messages, env.GROQ_API_KEY, env.GROQ_MODEL, context)
            res.end(JSON.stringify({ text }))
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(e?.message || e) }))
          }
        })
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      devAssistApi(env),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['menu.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'MenuLink — Digital Menu + Table QR',
          short_name: 'MenuLink',
          description: 'A digital menu with a QR code for every table. Diners scan, browse, and order on WhatsApp.',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#fffaf5',
          theme_color: '#ea580c',
          icons: [
            { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
      }),
    ],
  }
})
