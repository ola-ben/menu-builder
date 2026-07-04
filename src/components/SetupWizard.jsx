import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useMenu from '../hooks/useMenu.js'
import ImageUpload from './ImageUpload.jsx'
import ItemForm from './ItemForm.jsx'
import ShareCard from './ShareCard.jsx'
import Icon from './Icon.jsx'
import { isSupabaseEnabled, supabase } from '../lib/supabase.js'
import useToast from '../hooks/useToast.js'
import Toast from './Toast.jsx'

export default function SetupWizard() {
  const { restaurant, updateRestaurant, addItem } = useMenu()
  const navigate = useNavigate()

  const hasRestaurant = Boolean(restaurant?.name?.trim() && restaurant?.whatsappNumber?.trim())

  const [step, setStep] = useState(() => {
    try {
      const saved = localStorage.getItem('qr-menu:setup_wizard_step')
      return saved ? parseInt(saved, 10) : 1
    } catch {
      return 1
    }
  })
  const [isAnon, setIsAnon] = useState(true)
  const { toast, showToast } = useToast()

  // Step 1 OTP state
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)

  // Fetch session on mount and listen to auth changes
  useEffect(() => {
    let cancelled = false
    if (isSupabaseEnabled) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!cancelled && session) {
          const anonymous = session.user?.is_anonymous ?? (!session.user?.email || session.user?.app_metadata?.provider === 'anonymous')
          setIsAnon(anonymous)
          if (!anonymous) {
            // Already logged in permanently
            // Only set step if no saved step exists
            let saved = null
            try {
              saved = localStorage.getItem('qr-menu:setup_wizard_step')
            } catch {
              // Ignore
            }
            if (!saved || saved === '1') {
              setStep(2)
            }
          }
        }
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (cancelled) return
        if (session) {
          const anonymous = session.user?.is_anonymous ?? (!session.user?.email || session.user?.app_metadata?.provider === 'anonymous')
          setIsAnon(anonymous)
          if (!anonymous) {
            // If they just logged in, check if they have a menu
            try {
              const ownerId = session.user.id
              const { data: existingMenu, error } = await supabase
                .from('menus')
                .select('*')
                .eq('owner_id', ownerId)
                .maybeSingle()

              if (!cancelled && !error) {
                if (existingMenu && existingMenu.name?.trim() && existingMenu.whatsapp_number?.trim()) {
                  // Menu already exists and is configured: reload window to mount dashboard with full menu details and orders
                  window.location.reload()
                } else {
                  setStep((currentStep) => (currentStep === 1 ? 2 : currentStep))
                }
              }
            } catch (err) {
              console.warn('[supabase] error looking up menu on auth change:', err.message)
            }
          }
        }
      })

      return () => {
        cancelled = true
        subscription.unsubscribe()
      }
    }
  }, [])

  // Redirect returning users who already have a configured menu
  useEffect(() => {
    let savedStep = null
    try {
      savedStep = localStorage.getItem('qr-menu:setup_wizard_step')
    } catch {
      // Ignore
    }
    if (hasRestaurant && !savedStep) {
      navigate('/dashboard', { replace: true })
    }
  }, [hasRestaurant, navigate])

  const [detailsForm, setDetailsForm] = useState({
    name: '',
    whatsappNumber: '',
    tagline: '',
    logoUrl: '',
  })

  // Buffer details once restaurant loads
  useEffect(() => {
    if (restaurant) {
      setDetailsForm({
        name: restaurant.name || '',
        whatsappNumber: restaurant.whatsappNumber || '',
        tagline: restaurant.tagline || '',
        logoUrl: restaurant.logoUrl || '',
      })
    }
  }, [restaurant])

  const menuUrl = useMemo(
    () => `${window.location.origin}/menu/${restaurant?.id}`,
    [restaurant?.id],
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl)
      showToast('Menu link copied!', 'success')
    } catch {
      showToast('Could not copy — long-press the link to copy.', 'error')
    }
  }

  const handleDownloadQr = () => {
    const canvas = document.querySelector('#menu-qr canvas')
    if (!canvas) {
      showToast('Could not save the QR code.', 'error')
      return
    }
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `${restaurant.name || 'menu'}-qr.png`
    link.click()
    showToast('QR code saved 📥', 'success')
  }

  const handleGoogleLogin = async () => {
    setAuthError(null)
    setAuthLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard/setup`,
        }
      })
      if (error) throw error
    } catch (err) {
      setAuthError(err.message || 'Failed to initialize Google login.')
      setAuthLoading(false)
    }
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setAuthError(null)
    setAuthLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true, // Auto-registers new accounts
          emailRedirectTo: `${window.location.origin}/dashboard/setup`,
        }
      })
      if (error) throw error

      setOtpSent(true)
    } catch (err) {
      setAuthError(err.message || 'Failed to send verification code. Please check your email.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!token.trim()) return

    setAuthError(null)
    setAuthLoading(true)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'email', // Generic verification type
      })
      if (error) throw error

      const ownerId = data.user.id
      const { data: existingMenu } = await supabase
        .from('menus')
        .select('*')
        .eq('owner_id', ownerId)
        .maybeSingle()

      if (existingMenu && existingMenu.name?.trim() && existingMenu.whatsapp_number?.trim()) {
        // Menu already exists and is configured: reload window to mount dashboard with full menu details and orders
        window.location.reload()
      } else {
        // Authenticated but no menu setup yet (or empty menu profile row exists)
        setIsAnon(false)
        setStep(2)
      }
    } catch (err) {
      setAuthError(err.message || 'Verification failed. Please check the code and try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSaveDetails = (e) => {
    e.preventDefault()
    if (!detailsForm.name.trim() || !detailsForm.whatsappNumber.trim()) return

    updateRestaurant({
      name: detailsForm.name.trim(),
      whatsappNumber: detailsForm.whatsappNumber.trim(),
      tagline: detailsForm.tagline.trim(),
      logoUrl: detailsForm.logoUrl,
    })
    setStep(isSupabaseEnabled ? 3 : 2)
  }

  const handleAddProduct = (data) => {
    addItem(data)
    setStep(isSupabaseEnabled ? 4 : 3)
  }

  const handleFinish = () => {
    try {
      localStorage.removeItem('qr-menu:setup_wizard_step')
    } catch {
      // Ignore
    }
    navigate('/dashboard')
  }

  // Scroll to top of the page on step changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  // Persist step changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qr-menu:setup_wizard_step', step.toString())
    } catch {
      // Ignore
    }
  }, [step])

  const STEPS_META = useMemo(() => {
    if (!isSupabaseEnabled) {
      return [
        { num: 1, label: 'Restaurant Profile' },
        { num: 2, label: 'First Dish' },
        { num: 3, label: 'Go Live!' },
      ]
    }
    return [
      { num: 1, label: 'Create Account' },
      { num: 2, label: 'Restaurant Profile' },
      { num: 3, label: 'First Dish' },
      { num: 4, label: 'Go Live!' },
    ]
  }, [])

  const isAccountStep = isSupabaseEnabled && step === 1
  const isProfileStep = step === (isSupabaseEnabled ? 2 : 1)
  const isProductStep = step === (isSupabaseEnabled ? 3 : 2)
  const isShareStep = step === (isSupabaseEnabled ? 4 : 3)

  return (
    <div className="mx-auto w-full max-w-xl animate-fade-in">
      {/* Wizard Progress Header */}
      <div className="mb-8 card border border-brand-200/50 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent p-6 text-slate-800 dark:border-brand-500/10 dark:text-slate-100 dark:from-slate-900/60 dark:to-slate-950/20 shadow-md">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Guided Setup</p>
          <p className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
            Step {step} of {isSupabaseEnabled ? 4 : 3}
          </p>
        </div>

        {/* Step dots */}
        <div className="mt-4 flex items-center justify-between gap-2">
          {STEPS_META.map((s, idx) => {
            const isCompleted = step > s.num
            const isActive = step === s.num
            return (
              <div key={s.num} className="flex-1 flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full font-mono text-xs font-semibold ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isActive
                        ? 'bg-brand-600 text-white border border-brand-600'
                        : 'border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isCompleted ? '✓' : s.num}
                  </span>
                  <span
                    className={`hidden sm:inline font-mono text-[10px] uppercase tracking-wider ${
                      isActive ? 'text-slate-800 dark:text-white font-semibold' : isCompleted ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS_META.length - 1 && (
                  <div
                    className={`h-px flex-1 min-w-[20px] ${
                      step > s.num ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Contents */}
      <div className="card p-6 sm:p-8">
        {/* Step 1: Create Account / Sign In with OTP */}
        {isAccountStep && (
          <div>
            {!otpSent ? (
              // Screen 1a: Email Input
              <div>
                <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800">
                  <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                    Enter Your Email
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    We will send a 6-digit verification code to your inbox to secure your menu.
                  </p>
                </div>

                {authError && (
                  <div className="mb-4 border border-rose-500/20 bg-rose-500/[0.06] p-3 text-xs text-rose-600 dark:text-rose-400 rounded-xl">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label htmlFor="auth-email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <input
                      id="auth-email"
                      type="email"
                      required
                      disabled={authLoading}
                      className="input-base"
                      placeholder="e.g. you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="submit"
                      disabled={authLoading || !email.trim()}
                      className="btn-primary w-full py-2.5 font-semibold text-sm"
                    >
                      {authLoading ? 'Sending code…' : 'Send Verification Code'}
                    </button>
                  </div>

                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                    </div>
                    <span className="relative bg-white px-3 font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                      or
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={authLoading}
                    onClick={handleGoogleLogin}
                    className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-transparent py-2.5 font-mono text-xs uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 14.98 1 12 1 7.35 1 3.39 3.65 1.5 7.56l3.87 3a7.02 7.02 0 016.63-5.52z"/>
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.46a5.53 5.53 0 01-2.4 3.63v3.01h3.87c2.26-2.08 3.56-5.14 3.56-8.74z"/>
                      <path fill="#FBBC05" d="M5.37 14.56a7.02 7.02 0 010-5.12l-3.87-3A11.96 11.96 0 001 12c0 2.2.6 4.27 1.5 6.06l3.87-3.5z"/>
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.87-3.01c-1.07.72-2.45 1.15-4.09 1.15-3.14 0-5.81-2.11-6.75-4.96l-3.87 3A11.96 11.96 0 0012 23z"/>
                    </svg>
                    Continue with Google
                  </button>
                </form>
              </div>
            ) : (
              // Screen 1b: Code Verification / Confirm Email
              <div>
                <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800">
                  <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                    Check your email
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    We sent a sign-in link and verification code to <b className="text-slate-850 dark:text-white">{email}</b>.
                  </p>
                  <div className="mt-3 p-3 bg-brand-500/[0.08] border border-brand-500/20 text-xs text-slate-700 dark:text-slate-300 rounded-xl animate-pulse">
                    <span className="font-semibold text-brand-650 dark:text-brand-400 block mb-1">How to sign in:</span>
                    Click the link in the email to sign in automatically, or enter the 6-digit code below.
                  </div>
                </div>

                {authError && (
                  <div className="mb-4 border border-rose-500/20 bg-rose-500/[0.06] p-3 text-xs text-rose-600 dark:text-rose-400 rounded-xl">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label htmlFor="auth-token" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Verification Code
                    </label>
                    <input
                      id="auth-token"
                      type="text"
                      maxLength={6}
                      required
                      disabled={authLoading}
                      className="input-base font-mono text-center text-lg tracking-[0.25em] pl-[0.25em]"
                      placeholder="000000"
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="submit"
                      disabled={authLoading || token.trim().length < 6}
                      className="btn-primary w-full py-2.5 font-semibold text-sm"
                    >
                      {authLoading ? 'Verifying…' : 'Verify & Continue'}
                    </button>

                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={() => {
                        setAuthError(null)
                        setOtpSent(false)
                        setToken('')
                      }}
                      className="text-center font-mono text-xs uppercase tracking-wider text-brand-600 hover:text-brand-700 transition-colors py-1 dark:text-brand-400"
                    >
                      Change Email Address
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Restaurant Profile */}
        {isProfileStep && (
          <div>
            <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800">
              <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                Create Your Restaurant Profile
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Tell guests your restaurant's name and WhatsApp number to take orders.
              </p>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <ImageUpload
                    value={detailsForm.logoUrl}
                    onChange={(v) => setDetailsForm((f) => ({ ...f, logoUrl: v }))}
                    label="Restaurant logo"
                  />
                </div>
                <div>
                  <label htmlFor="w-name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Restaurant name <span className="text-brand-600">*</span>
                  </label>
                  <input
                    id="w-name"
                    required
                    className="input-base"
                    placeholder="e.g. Mama Nkechi’s Kitchen"
                    value={detailsForm.name}
                    onChange={(e) => setDetailsForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="w-wa" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    WhatsApp number <span className="text-brand-600">*</span>
                  </label>
                  <input
                    id="w-wa"
                    required
                    className="input-base"
                    placeholder="e.g. 0803 123 4567"
                    inputMode="tel"
                    value={detailsForm.whatsappNumber}
                    onChange={(e) => setDetailsForm((f) => ({ ...f, whatsappNumber: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="w-tag" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tagline
                  </label>
                  <input
                    id="w-tag"
                    className="input-base"
                    placeholder="e.g. Hot, fresh Naija dishes — dine in or takeaway"
                    value={detailsForm.tagline}
                    onChange={(e) => setDetailsForm((f) => ({ ...f, tagline: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                {isSupabaseEnabled && isAnon ? (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-ghost text-xs"
                  >
                    <Icon d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" className="h-4 w-4 mr-1" />
                    Back
                  </button>
                ) : (
                  <div />
                )}
                <button
                  type="submit"
                  disabled={!detailsForm.name.trim() || !detailsForm.whatsappNumber.trim()}
                  className="btn-primary w-full sm:w-auto"
                >
                  Save &amp; Continue
                  <Icon d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" className="h-4 w-4 ml-1" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: First Menu Item */}
        {isProductStep && (
          <div>
            <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800 flex items-baseline justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  Add Your First Dish
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Let customers see what delicious food you serve.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(isSupabaseEnabled ? 4 : 3)}
                className="font-mono text-xs uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350"
              >
                Skip
              </button>
            </div>

            <ItemForm onSubmit={handleAddProduct} categories={restaurant.categories || []} />

            <div className="mt-6 flex justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep(isSupabaseEnabled ? 2 : 1)}
                className="btn-ghost flex-1 text-xs"
              >
                <Icon d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" className="h-4 w-4 mr-1" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(isSupabaseEnabled ? 4 : 3)}
                className="btn-ghost flex-1 text-xs"
              >
                Skip for now
                <Icon d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Go Live! */}
        {isShareStep && (
          <div>
            <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800">
              <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                Your Menu is Ready! 🍕🇳🇬
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Print the QR code for your tables, or share the link on social media.
              </p>
            </div>

            <ShareCard menuUrl={menuUrl} onCopy={handleCopy} onDownloadQr={handleDownloadQr} disabled={false} />

            <div className="mt-6 flex flex-col gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(isSupabaseEnabled ? 3 : 2)}
                  className="btn-ghost flex-1 text-xs"
                >
                  <Icon d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" className="h-4 w-4 mr-1" />
                  Back
                </button>
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary bg-gradient-to-br from-whatsapp-500 to-whatsapp-600 hover:from-whatsapp-600 hover:to-whatsapp-700 flex-1 text-xs text-center flex items-center justify-center gap-1.5"
                >
                  <Icon d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" className="h-4 w-4" />
                  View Menu
                </a>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="btn-primary w-full mt-2"
              >
                Go to Dashboard
                <Icon d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
      <Toast toast={toast} />
    </div>
  )
}
