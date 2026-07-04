import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import Icon, { WhatsappIcon } from '../components/Icon.jsx'
import { formatNaira } from '../utils/format.js'

const TEST_MENU = [
  { id: '1', name: 'Jollof Rice & Chicken', price: 3500, desc: 'Smoky party jollof served with fried plantain and peppered chicken.', img: '🍚' },
  { id: '2', name: 'Catfish Pepper Soup', price: 2500, desc: 'Hot and spicy catfish soup infused with native herbs.', img: '🐟' },
  { id: '3', name: 'Zobo Drink', price: 1000, desc: 'Hibiscus drink brewed with ginger, pineapple, and cloves.', img: '🍹' },
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
      {/* Hero Section */}
      <section className="relative">

        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Column: Hero Text */}
          <div className="text-center lg:text-left">
            <p className="eyebrow flex items-center gap-2 justify-center lg:justify-start">
              <span className="h-1.5 w-1.5 bg-whatsapp-500" />
              For Bukas, Restaurants &amp; Food Vendors
            </p>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[0.98] tracking-display text-ink dark:text-paper sm:text-6xl lg:text-7xl">
              Turn your menu into a <span className="text-gradient">Table QR</span> code
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink/65 dark:text-paper/60 lg:mx-0">
              Customers scan, browse your menu with photos, and send their order directly to your WhatsApp. No expensive app installs. No printing costs. 100% commission-free.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link to="/dashboard" className="btn-primary">
                Build your menu — free
              </Link>
              <a href="#how-it-works" className="btn-ghost">
                How it works
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-ink/12 pt-8 dark:border-paper/12 lg:mx-0">
              <div>
                <dt className="font-display text-2xl font-bold text-ink dark:text-paper">Free</dt>
                <dd className="mt-0.5 text-xs text-ink/45 dark:text-paper/45">14-day trial</dd>
              </div>
              <div>
                <dt className="font-display text-2xl font-bold text-ink dark:text-paper">0%</dt>
                <dd className="mt-0.5 text-xs text-ink/45 dark:text-paper/45">Order commissions</dd>
              </div>
              <div>
                <dt className="font-display text-2xl font-bold text-ink dark:text-paper">10 Min</dt>
                <dd className="mt-0.5 text-xs text-ink/45 dark:text-paper/45">Simple setup</dd>
              </div>
            </div>
          </div>

          {/* Right Column: Diner Menu Simulator */}
          <div className="relative mx-auto w-full max-w-[325px]">
            {/* Phone Shadow Glow (Neutral Blur) */}
            <div className="absolute inset-0 -z-10 rounded-[3rem] bg-slate-200/50 dark:bg-slate-900/40 blur-2xl" />
            
            {/* Phone Mockup Frame */}
            <div className="relative border-8 border-slate-900 bg-slate-950 p-2 shadow-2xl rounded-[3rem]">
              {/* Camera Notch */}
              <div className="absolute left-1/2 top-4 h-4 w-28 -translate-x-1/2 rounded-full bg-slate-900 z-20" />

              {/* Screen Content */}
              <div className="bg-[#fffdfb] dark:bg-slate-900 h-[480px] flex flex-col rounded-[2.5rem] p-4 pt-8 text-left">
                {/* Header */}
                <div className="mb-2 border-b border-ink/12 pb-2 dark:border-paper/12">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center bg-ink font-display text-sm font-semibold text-paper dark:bg-paper dark:text-ink">
                      M
                    </span>
                    <div>
                      <h4 className="font-display text-xs font-bold text-ink dark:text-paper leading-tight">Mama Nkechi’s Kitchen</h4>
                      <p className="text-[10px] text-ink/45 dark:text-paper/45 mt-0.5">Table 4 · Scan to Order</p>
                    </div>
                  </div>
                </div>

                {/* Diner Menu Feed */}
                <div className="space-y-2 mt-2">
                  {TEST_MENU.map(item => {
                    const qty = cart[item.id] || 0
                    return (
                      <div key={item.id} className="flex gap-2.5 border-b border-ink/8 py-2.5 last:border-0 dark:border-paper/8">
                        <span className="grid h-10 w-10 shrink-0 place-items-center bg-ink/5 text-xl dark:bg-paper/5">
                          {item.img}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-display text-xs font-bold text-ink dark:text-paper truncate">{item.name}</h5>
                          <p className="text-[10px] text-ink/50 dark:text-paper/45 mt-0.5 line-clamp-1 leading-relaxed">{item.desc}</p>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-ink dark:text-paper">{formatNaira(item.price)}</span>
                            
                            {/* Qty selectors */}
                            <div className="flex items-center gap-1.5">
                              {qty > 0 ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => updateCart(item.id, -1)}
                                    className="grid h-5 w-5 place-items-center border border-ink/15 bg-paper text-xs text-ink hover:bg-brand-100 dark:border-paper/15 dark:bg-ink dark:text-paper"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs font-bold text-ink dark:text-paper">{qty}</span>
                                </>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => updateCart(item.id, 1)}
                                className="grid h-5 w-5 place-items-center bg-ink text-xs text-paper hover:opacity-85 dark:bg-paper dark:text-ink"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Simulated Floating Cart Bar */}
                {totalQty > 0 && (
                  <div className="mt-auto border-t border-ink/10 pt-3 dark:border-paper/10">
                    <button
                      type="button"
                      onClick={() => setShowOrderModal(true)}
                      className="btn-whatsapp py-2 w-full text-xs font-semibold rounded flex items-center justify-center gap-1 shadow-glow-green"
                    >
                      <WhatsappIcon className="h-3 w-3" />
                      Order {totalQty} Item{totalQty > 1 ? 's' : ''} ({formatNaira(totalPrice)})
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Interactive hint overlay */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <span className="pointer-events-auto flex items-center gap-1.5 whitespace-nowrap border border-brand-200 bg-brand-100/50 px-3.5 py-1 font-mono text-[10px] uppercase tracking-wider text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/5 dark:text-brand-450 animate-bounce">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                💡 Tap buttons to test diner app
              </span>
            </div>
          </div>
        </div>
      </section>

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
  )
}
