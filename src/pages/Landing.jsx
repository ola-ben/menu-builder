import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import Icon, { WhatsappIcon } from '../components/Icon.jsx'
import { formatNaira } from '../utils/format.js'

const TEST_MENU = [
  { id: '1', name: 'Jollof Rice & Chicken', price: 3500, desc: 'Smoky party jollof served with fried plantain and peppered chicken.', img: '/jollof.png' },
  { id: '2', name: 'Catfish Pepper Soup', price: 2500, desc: 'Hot and spicy catfish soup infused with native herbs.', img: '/catfish.png' },
  { id: '3', name: 'Zobo Drink', price: 1000, desc: 'Hibiscus drink brewed with ginger, pineapple, and cloves.', img: '/zobo.png' },
]

export default function Landing() {
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
      <div className="mx-auto w-full max-w-5xl lg:max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 space-y-28">

      {/* Simulated Order Preview Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm animate-fade-in dark:bg-ink/80">
          <div className="card w-full max-w-md p-6">
            <h3 className="font-display text-lg font-semibold tracking-tight text-ink dark:text-paper">🎉 Order Ready for WhatsApp!</h3>
            <p className="mt-2 text-sm text-ink/60 dark:text-paper/55">
              This is the exact structured message that will land in your restaurant's WhatsApp:
            </p>
            
            <div className="mt-4 border border-ink/12 bg-brand-100 p-4 font-mono text-xs text-ink dark:border-paper/12 dark:bg-white/[0.04] dark:text-paper">
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

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="btn-primary w-full"
              >
                Awesome, got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live QR Placard Customizer Section */}
      <section className="card p-8 sm:p-12">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          {/* Customizer Control Inputs */}
          <div>
            <p className="eyebrow flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-whatsapp-500" />
              Real-Time Creator
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-display text-ink dark:text-paper">
              Create your custom Table Placard
            </h2>
            <p className="mt-4 text-sm text-ink/65 dark:text-paper/60">
              Type your bukka or restaurant's name and choose a table number to see how your printable QR code tent changes instantly.
            </p>

            <div className="mt-6 space-y-4 max-w-md">
              <div>
                <label htmlFor="sim-name" className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-wider text-ink/55 dark:text-paper/50">
                  Restaurant Name
                </label>
                <input
                  id="sim-name"
                  type="text"
                  className="input-base"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Bukka Express"
                />
              </div>
              <div>
                <label htmlFor="sim-table" className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-wider text-ink/55 dark:text-paper/50">
                  Table Number
                </label>
                <input
                  id="sim-table"
                  type="number"
                  min="1"
                  className="input-base"
                  value={customTable}
                  onChange={(e) => setCustomTable(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Interactive QR Tent Placard Preview */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-[280px] border border-ink/15 bg-paper p-6 text-center animate-float-slow dark:border-paper/15 dark:bg-ink">
              {/* Top Accent Hole */}
              <div className="mx-auto mb-4 h-3 w-12 bg-ink/10 dark:bg-paper/10" />
              
              <p className="font-display text-base font-semibold text-ink dark:text-paper truncate">
                {customName || 'My Restaurant'}
              </p>
              
              {/* QR Canvas */}
              <div className="my-5 mx-auto grid h-[160px] w-[160px] place-items-center border border-ink/12 bg-paper p-3 dark:border-paper/12 dark:bg-ink">
                <QRCodeCanvas value={customMenuUrl} size={135} level="H" includeMargin />
              </div>

              <span className="badge mt-2">
                TABLE {customTable || '1'}
              </span>

              <p className="mt-4 font-mono text-[9px] uppercase tracking-widest text-ink/45 dark:text-paper/45">
                📱 SCAN TO BROWSE &amp; ORDER
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section id="how-it-works" className="scroll-mt-24">
        <div className="text-center">
          <span className="eyebrow">Diner Lifecycle</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Table-to-Kitchen order flow in 3 steps
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="card card-hover p-6 relative overflow-hidden group">
            <span className="absolute -right-4 -top-4 font-display text-7xl font-bold text-brand-500/10 transition group-hover:text-brand-500/20 dark:text-brand-400/15">
              1
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-glow">
              <Icon d="M3.75 4.5h6v6h-6v-6zm10.5 0h6v6h-6v-6zm-10.5 9h6v6h-6v-6zm10.5 3h3m-3 3h6m0-6v.01" className="h-6 w-6" />
            </span>
            <h3 className="mt-6 font-display text-lg font-bold text-slate-900 dark:text-white">Scan Table QR</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Diners scan the table QR code with their own phone camera. Your interactive digital menu opens instantly in their browser.
            </p>
          </div>

          <div className="card card-hover p-6 relative overflow-hidden group">
            <span className="absolute -right-4 -top-4 font-display text-7xl font-bold text-brand-500/10 transition group-hover:text-brand-500/20 dark:text-brand-400/15">
              2
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-glow">
              <Icon d="M4 6h16M4 12h16M4 18h10" className="h-6 w-6" />
            </span>
            <h3 className="mt-6 font-display text-lg font-bold text-slate-900 dark:text-white">Select Dishes</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              They browse through categorized sections, check tasty photos, customize portions, and add delicious meals to their order cart.
            </p>
          </div>

          <div className="card card-hover p-6 relative overflow-hidden group">
            <span className="absolute -right-4 -top-4 font-display text-7xl font-bold text-brand-500/10 transition group-hover:text-brand-500/20 dark:text-brand-400/15">
              3
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-whatsapp-500 to-whatsapp-600 text-white shadow-glow-green">
              <WhatsappIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-6 font-display text-lg font-bold text-slate-900 dark:text-white">Order to WhatsApp</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              With 1 tap, the system bundles their selections and opens WhatsApp to send the structured order directly to the waiter or kitchen chat.
            </p>
          </div>
        </div>
      </section>

      {/* Commission Savings Calculator Section */}
      <section className="card p-8 sm:p-12 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-dots text-brand-500/5 dark:text-brand-500/10" />
        
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <span className="eyebrow">Zero Commission</span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-display text-ink dark:text-paper">
              See how much you save
            </h2>
          </div>

          {/* Calculator Controls (2-Columns Grid) */}
          <div className="mt-8 grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-center">
            {/* Input Slider */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-ink/55 dark:text-paper/50">Estimated Monthly Sales</span>
                <span className="font-display text-base font-semibold text-ink dark:text-paper">
                  {formatNaira(monthlySales)}
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="5000000"
                step="50000"
                className="w-full accent-brand-500 cursor-pointer"
                value={monthlySales}
                onChange={(e) => setMonthlySales(Number(e.target.value))}
              />
            </div>
            
            {/* Savings Output block */}
            <div className="border-t md:border-t-0 md:border-l border-ink/12 pt-6 md:pt-0 md:pl-8 dark:border-paper/12">
              <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-ink/55 dark:text-paper/50">Your Annual Savings</span>
              <h3 className="mt-2 font-display text-4xl font-semibold tracking-display text-brand-500">
                {formatNaira(yearlySavings)}
              </h3>
              <p className="mt-1 text-xs text-ink/45 dark:text-paper/45">At 0% commission instead of 20% third-party cut.</p>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Link to="/dashboard" className="btn-primary">
              Keep 100% of your profits
            </Link>
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}
