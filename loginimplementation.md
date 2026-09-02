# Google-Only Sign-In Implementation Guide (Supabase Auth)

This guide documents how to implement a clean **"Sign In with Google Only"** flow using Supabase. This approach completely bypasses the default Supabase login screens and does not require users to input their emails or verify OTP codes.

---

## How It Works

Instead of redirecting users to a Supabase-hosted login page or using passwordless email codes (OTP), this flow uses the **Google Identity Services (GSI) SDK** directly on the frontend. 

1. The frontend loads the official Google Identity Services library.
2. The user clicks the native Google Sign-In button and logs in via a Google pop-up window.
3. Google returns a secure Identity Token (ID Token JWT) directly to the frontend.
4. The frontend passes this token to Supabase using `supabase.auth.signInWithIdToken()`.
5. Supabase verifies the token with Google, logs the user in, and marks their email as verified automatically.

---

## Step 1: Supabase & Google Cloud Console Configuration

To make this work, you need to configure your Google Client ID:

1. **Get a Google Client ID:**
   * Go to the [Google Cloud Console](https://console.cloud.google.com/).
   * Create a project and navigate to **APIs & Services > Credentials**.
   * Configure your **OAuth consent screen** (set User Type to External, and add your app details).
   * Create an **OAuth 2.0 Client ID** for a **Web Application**.
   * Add your local development URL (e.g., `http://localhost:5173`) and production URL to **Authorized JavaScript origins**.

2. **Configure Supabase (Optional but recommended):**
   * Go to your **Supabase Dashboard > Authentication > Providers > Google**.
   * Paste your **Client ID** and **Client Secret** (from the Google Cloud Credentials screen).
   * Note: The SDK approach can also verify client-side tokens directly if you provide the Client ID.

---

## Step 2: Load Google Identity Services Script

Add the Google Sign-in script to your `index.html` file so it is loaded globally:

```html
<!-- index.html -->
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

---

## Step 3: Implement the Frontend Modal / Component (React)

Here is a clean React component example for the Login Modal. It initializes Google Sign-In and renders the official Google Button inside a reference container:

```jsx
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@supabase/supabase-js'

// Initialize your Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function AuthModal({ isOpen, onClose }) {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const googleBtnRef = useRef(null)

  // Listen for successful authentication state changes
  useEffect(() => {
    let cancelled = false
    if (isOpen) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (cancelled) return
        if (session) {
          // If a valid session is detected, reload page to load user workspace/store
          window.location.reload()
        }
      })
      return () => {
        cancelled = true
        subscription.unsubscribe()
      }
    }
  }, [isOpen])

  // Initialize Google Sign-In client library
  useEffect(() => {
    if (!isOpen) return

    const initGoogleGsi = () => {
      /* global google */
      if (typeof google !== 'undefined' && googleBtnRef.current) {
        try {
          google.accounts.id.initialize({
            // Your Google Web Client ID
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: async (response) => {
              setError(null)
              setLoading(true)
              try {
                // Send the ID token received from Google to Supabase
                const { error: err } = await supabase.auth.signInWithIdToken({
                  provider: 'google',
                  token: response.credential,
                })
                if (err) throw err
                
                window.location.reload()
              } catch (err) {
                setError(err.message || 'Google sign in failed.')
              } finally {
                setLoading(false)
              }
            },
          })
          
          // Render the official Google Sign-In button
          google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            shape: 'rectangular',
            width: googleBtnRef.current.parentElement?.clientWidth || 336,
          })
        } catch (e) {
          console.error('Failed to initialize Google Sign-In:', e)
        }
      }
    }

    initGoogleGsi()
    // Retry initialization in case script loads slowly
    const interval = setInterval(() => {
      if (typeof google !== 'undefined') {
        initGoogleGsi()
        clearInterval(interval)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl rounded-lg text-white">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-white/50 hover:text-white"
        >
          ✕
        </button>

        <div>
          <h3 className="font-semibold text-lg mb-1">Sign In to Your Account</h3>
          <p className="text-xs text-white/60 mb-6">
            Sign in with Google to create or manage your menu storefront.
          </p>

          {error && (
            <div className="mb-4 border border-rose-500/20 bg-rose-500/[0.06] p-3 text-xs text-rose-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* The Google Button will render inside this container */}
            <div className="flex justify-center w-full min-h-[44px]">
              <div ref={googleBtnRef} className="w-full flex justify-center"></div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full py-2.5 text-sm text-white/70 hover:text-white border border-white/10 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
```

---

## Why This is Better Than standard Email Flows

1. **Zero SMTP Server Setup:** Because Google handles verification and provides a verified email claim, Supabase trusts the email automatically. You don't need to configure a custom SMTP server (like Resend or Gmail) or deal with rate limits on default Supabase emails.
2. **No DNS Verification Required:** You do not need to configure DNS TXT records (SPF, DKIM) to send verification codes since no emails are sent from your server/database.
3. **Frictionless Sign In:** Users sign in with a single click instead of opening their mailboxes to copy verification codes.
