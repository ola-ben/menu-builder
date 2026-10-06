'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  const hasRestaurant = Boolean(restaurant?.name?.trim() && restaurant?.whatsappNumber?.trim())

  const [step, setStep] = useState(() => {
    if (typeof window === 'undefined') return 1
    try {
      const saved = localStorage.getItem('qr-menu:setup_wizard_step')
      return saved ? parseInt(saved, 10) : 1
    } catch {
      return 1
    }
  })
  const [isAnon, setIsAnon] = useState(true)
  const { toast, showToast } = useToast()

  const isSimulated = localStorage.getItem('qr-menu:simulated_login') === 'true'

  // If simulated, override isAnon to false and skip Step 1 if step is currently 1
  useEffect(() => {
    if (isSimulated) {
      setIsAnon(false)
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
  }, [isSimulated])

  // Step 1 Google Sign-in state
  const [authError, setAuthError] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)
  const googleBtnRef = useRef(null)

  const isAccountStep = isSupabaseEnabled && step === 1
  const isProfileStep = step === (isSupabaseEnabled ? 2 : 1)
  const isProductStep = step === (isSupabaseEnabled ? 3 : 2)
  const isShareStep = step === (isSupabaseEnabled ? 4 : 3)

  // Fetch session on mount and listen to auth changes
  useEffect(() => {
    let cancelled = false
    if (isSimulated) return // Bypass session fetch if simulating
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

  // Redirect returning users who already have a configured menu ONLY if they finished the wizard
  useEffect(() => {
    let savedStep = null
    try {
      savedStep = localStorage.getItem('qr-menu:setup_wizard_step')
    } catch {
      // Ignore
    }
    const isCompleted = localStorage.getItem('qr-menu:setup_wizard_completed') === 'true'
    if (hasRestaurant && isCompleted && !savedStep) {
      router.replace('/dashboard')
    }
  }, [hasRestaurant, router])

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
    () => (typeof window !== 'undefined' ? `${window.location.origin}/menu/${restaurant?.id}` : `/menu/${restaurant?.id}`),
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

  const handleGoogleSignIn = async () => {
    if (!isSupabaseEnabled || !supabase) {
      setAuthError('Supabase backend is not configured.')
      return
    }
    setAuthError(null)
    setAuthLoading(true)
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      })
      if (err) throw err
    } catch (err) {
      setAuthError(err.message || 'Google sign-in failed.')
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
      localStorage.setItem('qr-menu:setup_wizard_completed', 'true')
      localStorage.removeItem('qr-menu:setup_wizard_step')
    } catch {
      // Ignore
    }
    router.replace('/dashboard')
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
                        ? 'bg-whatsapp-500 text-white'
                        : isActive
                        ? 'bg-brand-500 text-white shadow-glow'
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? '✓' : s.num}
                  </span>
                  <span
                    className={`hidden sm:inline text-xs font-medium ${
                      isActive ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS_META.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      step > s.num ? 'bg-whatsapp-500' : 'bg-slate-200 dark:bg-slate-800'
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
        {/* Step 1: Create Account / Sign In with Google */}
        {isAccountStep && (
          <div>
            <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800">
              <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                Create Your Account
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Sign in with Google to secure your digital menu, dishes, and WhatsApp orders across devices.
              </p>
            </div>

            {authError && (
              <div className="mb-4 border border-rose-500/20 bg-rose-500/[0.06] p-3 text-xs text-rose-600 dark:text-rose-400 rounded-xl">
                {authError}
              </div>
            )}

            <div className="space-y-4 py-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 disabled:opacity-60"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{authLoading ? 'Redirecting to Google…' : 'Continue with Google'}</span>
              </button>

              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="font-mono text-xs uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                >
                  Continue as Guest for now →
                </button>
              </div>
            </div>
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
                    isOptional={true}
                  />
                </div>
                <div>
                  <label htmlFor="w-name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Restaurant name <span className="text-brand-600 font-semibold">* (Required)</span>
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
                    WhatsApp number <span className="text-brand-600 font-semibold">* (Required)</span>
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
                    Tagline <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(Optional)</span>
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
