import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

// MenuLink app icon: warm orange gradient + a white menu card with rows.
const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fb923c"/><stop offset="1" stop-color="#ea580c"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <rect x="156" y="118" width="200" height="276" rx="24" fill="#ffffff"/>
  <circle cx="196" cy="172" r="9" fill="#ea580c"/>
  <rect x="216" y="164" width="106" height="16" rx="8" fill="#ea580c"/>
  <circle cx="196" cy="216" r="9" fill="#fdba74"/>
  <rect x="216" y="208" width="106" height="14" rx="7" fill="#fdba74"/>
  <circle cx="196" cy="258" r="9" fill="#fdba74"/>
  <rect x="216" y="250" width="80" height="14" rx="7" fill="#fdba74"/>
  <circle cx="196" cy="300" r="9" fill="#fdba74"/>
  <rect x="216" y="292" width="106" height="14" rx="7" fill="#fdba74"/>
</svg>`)

const targets = [
  ['pwa-192.png', 192],
  ['pwa-512.png', 512],
  ['maskable-512.png', 512],
  ['apple-touch-icon.png', 180],
]

for (const [name, size] of targets) {
  await sharp(svg).resize(size, size).png().toFile(join(out, name))
  console.log('wrote', name, size)
}
