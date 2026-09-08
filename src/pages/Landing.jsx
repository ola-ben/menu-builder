import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import Icon, { WhatsappIcon } from '../components/Icon.jsx'
import { formatNaira } from '../utils/format.js'
import { motion, AnimatePresence } from 'framer-motion'

const TEST_MENU = [
  { id: '1', name: 'Jollof Rice & Chicken', price: 3500, desc: 'Smoky party jollof served with fried plantain and peppered chicken.', img: '/jollof.png' },
  { id: '2', name: 'Catfish Pepper Soup', price: 2500, desc: 'Hot and spicy catfish soup infused with native herbs.', img: '/catfish.png' },
  { id: '3', name: 'Zobo Drink', price: 1000, desc: 'Hibiscus drink brewed with ginger, pineapple, and cloves.', img: '/zobo.png' },
]

export default function Landing() {
  // Screen size detection for lg view on-and-off scroll animations
  const [isLg, setIsLg] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : false)

  useEffect(() => {
    const handleResize = () => setIsLg(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Live Menu Simulator State
  const [cart, setCart] = useState({ 1: 1 })
  const [showOrderModal, setShowOrderModal] = useState(false)

  // Live QR Customizer State
  const [customName, setCustomName] = useState("Mama Nkechi's Kitchen")
  const [customTable, setCustomTable] = useState("4")

  // Savings Calculator State
  const [monthlySales, setMonthlySales] = useState(1500000)

  const cartItems = useMemo(() => {
    return TEST_MENU.map(item => ({
      item,
      qty: cart[item.id] || 0
    })).filter(c => c.qty > 0)
  }, [cart])

  const totalQty = cartItems.reduce((acc, c) => acc + c.qty, 0)
  const totalPrice = cartItems.reduce((acc, c) => acc + (c.item.price * c.qty), 0)

  const updateCart = (id, delta) => {
    setCart(prev => {
      const next = { ...prev }
      const current = next[id] || 0
      const updated = current + delta
      if (updated <= 0) {
        delete next[id]
      } else {
        next[id] = updated
      }
      return next
    })
  }

  // Savings calculations
  const deliveryCommission = useMemo(() => monthlySales * 0.20, [monthlySales]) // average 20% commission
  const yearlySavings = useMemo(() => deliveryCommission * 12, [deliveryCommission])

  // Custom QR preview link
  const customMenuUrl = useMemo(() => {
    const slug = (customName || 'my-restaurant').toLowerCase().replace(/[^a-z0-9]/g, '-')
    return `${window.location.origin}/menu/${slug}?table=${customTable}`
  }, [customName, customTable])

  return (
    <div className="space-y-28">
      {/* Hero Section - Full Bleed Background */}
      <section 
        className="relative w-full min-h-[105vh] bg-cover bg-center overflow-hidden border-b border-ink/12 dark:border-paper/12 flex flex-col justify-center pb-12 lg:pb-16"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(11, 11, 11, 0.45), rgba(11, 11, 11, 0.65)), url('/hero_food_bg.jpg')"
        }}
      >
        {/* Glow Ribbon Loop (SVG at bottom) */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none h-32 z-10">
          <svg className="w-full h-full" viewBox="0 0 1440 160" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M-100,120 C200,120 300,140 400,110 C500,80 450,20 350,40 C250,60 300,120 500,130 C700,140 900,100 1100,115 C1300,130 1400,100 1600,120" 
              stroke="#22c55e" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              className="opacity-75 filter drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]"
            />
            <path 
              d="M-80,125 C210,125 305,142 395,112 C485,82 440,25 355,42 C270,60 310,118 495,127 C680,136 880,102 1085,117 C1290,132 1390,102 1580,122" 
              stroke="#10b981" 
              strokeWidth="1" 
              className="opacity-40 filter drop-shadow-[0_0_3px_rgba(16,185,129,0.5)]"
            />
          </svg>
        </div>

        {/* Centered Hero Content Column */}
        <div className="mx-auto w-full max-w-5xl lg:max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:pt-24 lg:pb-16 md:px-8 lg:px-10 relative z-20">
          <div className="grid items-center gap-8 lg:gap-14 xl:gap-16 lg:grid-cols-[1.18fr_0.82fr]">
            {/* Left Column: Hero Text */}
            <div className="text-center lg:text-left">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-white/50 flex items-center gap-2 justify-center lg:justify-start">
                <span className="h-1.5 w-1.5 bg-brand-500 animate-pulse" />
                For Bukas, Restaurants &amp; Food Vendors
              </p>
              <h1 className="mt-4 lg:mt-5 font-display text-4xl font-semibold leading-[1.02] tracking-display text-glass sm:text-5xl lg:text-[3.5rem] xl:text-[4.15rem]">
                From Smoky Jollof to Pepper Soup, serve guests in <span className="text-glass-amber">seconds</span>.
              </h1>
              <p className="mx-auto mt-4 lg:mt-5 max-w-xl lg:max-w-2xl text-sm sm:text-base lg:text-base leading-relaxed text-white/70 lg:mx-0">
                Diners scan the table QR code to browse your menu, choose portions, and send their order straight to your WhatsApp. Zero commissions, zero printing costs.
              </p>
              <div className="mt-6 lg:mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Link to="/dashboard" className="btn-primary">
                  Build your menu — free
                </Link>
                <a href="#how-it-works" className="btn-ghost border-white/20 text-white hover:border-white hover:bg-white/[0.04]">
                  How it works
                </a>
              </div>

              {/* Quick trust metrics */}
              <div className="mt-7 lg:mt-8 grid max-w-md lg:max-w-lg grid-cols-3 gap-6 lg:gap-8 border-t border-white/10 pt-5 lg:mx-0">
                <div>
                  <dt className="font-display text-2xl font-bold text-white">Free</dt>
                  <dd className="mt-0.5 text-xs text-white/50">30 days trial</dd>
                </div>
                <div>
                  <dt className="font-display text-2xl font-bold text-white">0%</dt>
                  <dd className="mt-0.5 text-xs text-white/50">Order commissions</dd>
                </div>
                <div>
                  <dt className="font-display text-2xl font-bold text-white">1 Min</dt>
                  <dd className="mt-0.5 text-xs text-white/50">Simple setup</dd>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Overlap Composition */}
            <div className="relative mx-auto w-full max-w-[360px] h-[460px] lg:max-w-[430px] lg:h-[480px]">
              {/* Table Placard QR Stand (Center-Left Background) */}
              <div className="absolute left-2 top-2 z-0 w-[175px] lg:w-[195px] rounded-2xl border border-ink/12 bg-paper p-3.5 text-center shadow-md dark:border-paper/12 dark:bg-white/[0.02]">
                <div className="mx-auto mb-2.5 h-1.5 w-8 bg-ink/10 dark:bg-paper/10" />
                <p className="font-display text-[11px] font-bold text-ink dark:text-paper leading-tight truncate">
                  Mama Nkechi’s Kitchen
                </p>
                <div className="my-2.5 mx-auto grid h-[95px] w-[95px] place-items-center border border-ink/8 bg-white p-1 rounded-lg">
                  <QRCodeCanvas value={customMenuUrl} size={85} level="H" />
                </div>
                <span className="inline-block rounded-md border border-ink/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink/60 dark:border-paper/15 dark:text-paper/55">
                  Table 4
                </span>
                <p className="mt-2.5 font-mono text-[8px] uppercase tracking-widest text-ink/40 dark:text-paper/40 leading-none">
                  📲 SCAN &amp; ORDER
                </p>
              </div>

              {/* Catfish Pepper Soup Card (Top Foreground) */}
              {(() => {
                const item = TEST_MENU[1]; // Catfish Pepper Soup
                const qty = cart[item.id] || 0;
                return (
                  <div className="absolute right-2 top-0 z-10 w-[190px] lg:w-[215px] rotate-2 rounded-2xl border border-ink/12 bg-paper p-3 shadow-lg transition-all duration-300 hover:rotate-0 hover:scale-105 dark:border-paper/12 dark:bg-white/[0.02]">
                    <div className="relative h-18 lg:h-20 w-full overflow-hidden rounded-xl bg-ink/5 dark:bg-paper/5">
                      <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
                      <span className="absolute left-2 top-2 z-10 bg-brand-600 text-white font-mono text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm">
                        Hot &amp; Spicy
                      </span>
                    </div>
                    <h5 className="mt-2 font-display text-xs font-bold text-ink dark:text-paper leading-snug truncate">{item.name}</h5>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-ink dark:text-paper">{formatNaira(item.price)}</span>
                      <div className="flex items-center gap-1.5">
                        {qty > 0 && (
                          <>
                            <button
                              type="button"
                              onClick={() => updateCart(item.id, -1)}
                              className="grid h-5 w-5 place-items-center border border-ink/15 bg-paper text-xs text-ink hover:bg-brand-100 dark:border-paper/15 dark:bg-ink dark:text-paper rounded"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-ink dark:text-paper">{qty}</span>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => updateCart(item.id, 1)}
                          className="grid h-5 w-5 place-items-center bg-ink text-xs text-paper hover:opacity-85 dark:bg-paper dark:text-ink rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Smoky Party Jollof Card (Center Foreground) */}
              {(() => {
                const item = TEST_MENU[0]; // Jollof Rice
                const qty = cart[item.id] || 0;
                return (
                  <div className="absolute right-0 top-28 lg:top-32 z-20 w-[210px] lg:w-[240px] -rotate-1 rounded-2xl border border-ink/15 bg-paper p-3 shadow-xl transition-all duration-300 hover:rotate-0 hover:scale-105 dark:border-paper/15 dark:bg-white/[0.02]">
                    <div className="relative h-22 lg:h-24 w-full overflow-hidden rounded-xl bg-ink/5 dark:bg-paper/5">
                      <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
                      <span className="absolute left-2 top-2 z-10 bg-rose-600 text-white font-mono text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm">
                        Best Seller 🔥
                      </span>
                    </div>
                    <h5 className="mt-2 font-display text-xs font-bold text-ink dark:text-paper leading-snug truncate">{item.name}</h5>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-ink dark:text-paper">{formatNaira(item.price)}</span>
                      <div className="flex items-center gap-1.5">
                        {qty > 0 && (
                          <>
                            <button
                              type="button"
                              onClick={() => updateCart(item.id, -1)}
                              className="grid h-5 w-5 place-items-center border border-ink/15 bg-paper text-xs text-ink hover:bg-brand-100 dark:border-paper/15 dark:bg-ink dark:text-paper rounded"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-ink dark:text-paper">{qty}</span>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => updateCart(item.id, 1)}
                          className="grid h-5 w-5 place-items-center bg-ink text-xs text-paper hover:opacity-85 dark:bg-paper dark:text-ink rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Chilled Zobo Drink Card (Bottom Foreground) */}
              {(() => {
                const item = TEST_MENU[2]; // Zobo
                const qty = cart[item.id] || 0;
                return (
                  <div className="absolute left-2 bottom-6 lg:bottom-8 z-30 w-[180px] lg:w-[205px] -rotate-3 rounded-2xl border border-ink/12 bg-paper p-3 shadow-lg transition-all duration-300 hover:rotate-0 hover:scale-105 dark:border-paper/12 dark:bg-white/[0.02]">
                    <div className="relative h-18 lg:h-20 w-full overflow-hidden rounded-xl bg-ink/5 dark:bg-paper/5">
                      <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
                      <span className="absolute left-2 top-2 z-10 bg-whatsapp-600 text-white font-mono text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm">
                        Freshly Brewed
                      </span>
                    </div>
                    <h5 className="mt-2 font-display text-xs font-bold text-ink dark:text-paper leading-snug truncate">{item.name}</h5>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-ink dark:text-paper">{formatNaira(item.price)}</span>
                      <div className="flex items-center gap-1.5">
                        {qty > 0 && (
                          <>
                            <button
                              type="button"
                              onClick={() => updateCart(item.id, -1)}
                              className="grid h-5 w-5 place-items-center border border-ink/15 bg-paper text-xs text-ink hover:bg-brand-100 dark:border-paper/15 dark:bg-ink dark:text-paper rounded"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-ink dark:text-paper">{qty}</span>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => updateCart(item.id, 1)}
                          className="grid h-5 w-5 place-items-center bg-ink text-xs text-paper hover:opacity-85 dark:bg-paper dark:text-ink rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Simulated Floating Cart Bar / WhatsApp Alert bubble */}
              {totalQty > 0 && (
                <div className="absolute -bottom-4 left-1/2 z-40 w-[280px] lg:w-[310px] -translate-x-1/2 animate-slide-up">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(true)}
                    className="btn-whatsapp w-full py-2.5 px-4 text-xs font-semibold rounded-2xl flex items-center justify-center gap-1.5 shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <WhatsappIcon className="h-4 w-4" />
                    Order Table 4 ({totalQty} items · {formatNaira(totalPrice)})
                  </button>
                </div>
              )}

              {totalQty === 0 && (
                <div className="absolute -bottom-4 left-1/2 z-40 -translate-x-1/2 pointer-events-none">
                  <span className="pointer-events-auto flex items-center gap-1.5 whitespace-nowrap border border-ink/15 bg-paper px-3.5 py-1 font-mono text-[9px] uppercase tracking-wider text-ink/65 dark:border-paper/15 dark:bg-ink dark:text-paper/60 animate-bounce rounded-full shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                    💡 Tap buttons to test diner ordering
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Centered Main Page Contents Wrap */}
      <div className="mx-auto w-full max-w-5xl lg:max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 space-y-16 lg:space-y-20">

      {/* Simulated Order Preview Modal */}
      <AnimatePresence>
        {showOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="card w-full max-w-md p-6 shadow-2xl border border-ink/15 dark:border-paper/15"
            >
              <h3 className="font-display text-lg font-semibold tracking-tight text-ink dark:text-paper flex items-center gap-2">
                <span>🎉</span> Order Ready for WhatsApp!
              </h3>
              <p className="mt-2 text-xs text-ink/60 dark:text-paper/55">
                Exact structured message sent to your restaurant's WhatsApp:
              </p>
              
              <div className="mt-4 border border-ink/12 bg-brand-100/60 p-3.5 font-mono text-xs text-ink dark:border-paper/12 dark:bg-white/[0.04] dark:text-paper rounded-xl">
                <p className="font-bold text-whatsapp-700 dark:text-whatsapp-500">📲 WhatsApp Message:</p>
                <div className="mt-2 space-y-1">
                  <p>Hello *Mama Nkechi’s Kitchen*, I would like to place an order:</p>
                  <p>---</p>
                  {cartItems.map(c => (
                    <p key={c.item.id}>• {c.qty}x *{c.item.name}* ({formatNaira(c.item.price)})</p>
                  ))}
                  <p>---</p>
                  <p>📍 *Table 4*</p>
                  <p>💰 Total: *{formatNaira(totalPrice)}*</p>
                </div>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="btn-primary w-full py-2.5 text-xs font-bold"
                >
                  Awesome, got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. How It Works Steps (2-Column Editorial Layout) */}
      <motion.section
        id="how-it-works"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: !isLg, amount: isLg ? 0.25 : 0.1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="scroll-mt-24 py-4"
      >
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-12 items-start">
          {/* Left Column: Heading */}
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-ink/45 dark:text-paper/45">
              How It Works
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink dark:text-paper leading-[1.12]">
              From table to WhatsApp in three steps.
            </h2>
          </div>

          {/* Right Column: Divided Step Rows */}
          <div className="lg:col-span-7 lg:border-l lg:border-ink/12 lg:pl-10 lg:dark:border-paper/12">
            <div className="divide-y divide-ink/10 dark:divide-paper/10">
              {[
                {
                  title: 'Scan table QR',
                  desc: 'Guests scan the table QR placard with their phone camera. Instant interactive menu, zero app downloads.',
                },
                {
                  title: 'Pick meals & portions',
                  desc: 'Diners browse categories, choose portions, and add dishes directly to their order cart.',
                },
                {
                  title: 'Get orders on WhatsApp',
                  desc: 'One tap bundles the full order with table number and sends it straight to your WhatsApp chat.',
                },
              ].map((s, i) => (
                <motion.div 
                  key={s.title} 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: !isLg, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: isLg ? i * 0.08 : 0 }}
                  className="grid grid-cols-[auto,1fr] gap-6 py-6 first:pt-0 last:pb-0"
                >
                  <span className="font-mono text-sm text-ink/35 dark:text-paper/35">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight text-ink dark:text-paper">
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/60 dark:text-paper/55">
                      {s.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. Why MenuLink / Value Props Grid (2x2 Quadrant) */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: !isLg, amount: isLg ? 0.25 : 0.1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="py-6 sm:py-10"
      >
        <div className="grid gap-10 lg:gap-12 lg:grid-cols-12 items-start">
          {/* Left Column: Heading */}
          <div className="lg:col-span-4">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-ink/45 dark:text-paper/45">
              Why MenuLink
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink dark:text-paper leading-[1.15]">
              Everything you need, nothing you don’t.
            </h2>
          </div>

          {/* Right Column: 2x2 Quadrant Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-ink/10 dark:border-paper/10">
              {[
                {
                  id: '01',
                  title: 'No commission, ever',
                  desc: 'Orders go straight to your WhatsApp. No middleman taking a cut of your restaurant sales.',
                },
                {
                  id: '02',
                  title: 'A QR code for everything',
                  desc: 'Put it on table tents, flyers, packaging, and counter stands. Scan, browse, order.',
                },
                {
                  id: '03',
                  title: 'Looks great on any phone',
                  desc: 'A clean, lightning-fast digital menu that loads instantly — even on 3G connections.',
                },
                {
                  id: '04',
                  title: 'Set up in minutes',
                  desc: 'No app to download, no developer needed. If you can chat on WhatsApp, you can run your digital menu.',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: !isLg, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: isLg ? index * 0.07 : 0 }}
                  className="border-r border-b border-ink/10 dark:border-paper/10 p-6 sm:p-8 flex flex-col justify-between hover:bg-ink/[0.02] dark:hover:bg-paper/[0.02] transition-colors"
                >
                  <span className="font-mono text-xs text-ink/35 dark:text-paper/35">
                    /{item.id}
                  </span>
                  <div className="mt-4 sm:mt-6">
                    <h3 className="font-display text-base sm:text-lg font-bold text-ink dark:text-paper tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-ink/65 dark:text-paper/60 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* 3. Live QR Placard Customizer Section (Modern & Compact) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: !isLg, amount: isLg ? 0.25 : 0.1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="card p-6 sm:p-10 relative overflow-hidden group border border-ink/10 dark:border-paper/10 shadow-lg"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-500/10 blur-3xl" />

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-center relative z-10">
          {/* Customizer Control Inputs */}
          <div>
            <p className="eyebrow flex items-center gap-2 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-whatsapp-500 animate-pulse" />
              Live Generator
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-paper">
              Custom Table Tent in seconds
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-ink/65 dark:text-paper/60 max-w-md">
              Type your restaurant name and table number to preview your printable QR placard live.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
              <div>
                <label htmlFor="sim-name" className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-ink/55 dark:text-paper/50">
                  Restaurant Name
                </label>
                <input
                  id="sim-name"
                  type="text"
                  className="input-base py-2 text-xs"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Mama Nkechi’s Kitchen"
                />
              </div>
              <div>
                <label htmlFor="sim-table" className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-wider text-ink/55 dark:text-paper/50">
                  Table Number
                </label>
                <input
                  id="sim-table"
                  type="number"
                  min="1"
                  className="input-base py-2 text-xs"
                  value={customTable}
                  onChange={(e) => setCustomTable(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Interactive Floating QR Tent Placard */}
          <div className="flex justify-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              whileHover={{ scale: 1.02 }}
              className="relative w-full max-w-[240px] rounded-2xl border border-ink/15 bg-paper p-5 text-center shadow-xl dark:border-paper/15 dark:bg-zinc-900"
            >
              <div className="mx-auto mb-3 h-2 w-10 rounded-full bg-ink/10 dark:bg-paper/10" />
              
              <motion.p
                key={customName}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                className="font-display text-sm font-bold text-ink dark:text-paper truncate"
              >
                {customName || 'My Restaurant'}
              </motion.p>
              
              <div className="relative my-4 mx-auto grid h-[130px] w-[130px] place-items-center rounded-xl border border-ink/10 bg-white p-2.5 shadow-inner">
                <QRCodeCanvas value={customMenuUrl} size={110} level="H" includeMargin />
              </div>

              <motion.span
                key={customTable}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="badge bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20 font-bold text-[10px] px-2.5 py-0.5"
              >
                TABLE {customTable || '1'}
              </motion.span>

              <p className="mt-3 font-mono text-[8px] uppercase tracking-widest text-ink/40 dark:text-paper/40">
                📲 SCAN &amp; ORDER
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      </div>

      {/* 4. Full-Width Deep Dark Savings Section (Matching Image 2) */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: !isLg, amount: isLg ? 0.2 : 0.1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative border-t border-ink/15 bg-ink text-paper dark:border-paper/15 dark:bg-black py-16 sm:py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-5xl lg:max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-paper/15 pb-4 mb-8 gap-2">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-paper/45">
                Zero Commission
              </p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Calculate your savings
              </h2>
            </div>
            <p className="text-xs text-paper/50 font-mono">
              0% MenuLink fee vs 20% third-party cuts
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-paper/60">
                  Estimated Monthly Sales
                </span>
                <span className="font-display text-base font-bold text-white">
                  {formatNaira(monthlySales)}
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="5000000"
                step="50000"
                className="w-full accent-brand-500 cursor-pointer h-2 bg-white/15 rounded-lg"
                value={monthlySales}
                onChange={(e) => setMonthlySales(Number(e.target.value))}
              />
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-paper/15 pt-6 md:pt-0 md:pl-8">
              <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-paper/60">
                Your Annual Savings
              </span>
              <motion.h3
                key={yearlySavings}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className="mt-1 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-400"
              >
                {formatNaira(yearlySavings)}
              </motion.h3>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-paper/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-paper/65 text-center sm:text-left">
              Keep 100% of every order sent directly to your WhatsApp.
            </p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 hover:bg-brand-400 text-black px-7 py-3 text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg shadow-brand-500/20 hover:scale-[1.02] shrink-0"
            >
              Build your menu free →
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
