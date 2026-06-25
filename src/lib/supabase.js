import { createClient } from '@supabase/supabase-js'

// From your Supabase project (Settings → API). Put them in a `.env` file as
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. See SUPABASE.md.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** True when both env vars are present, so the app can use the cloud backend. */
export const isSupabaseEnabled = Boolean(url && anonKey)

/**
 * The Supabase client — or null when env vars aren't set, in which case the app
 * gracefully falls back to localStorage (the original MVP behaviour).
 */
export const supabase = isSupabaseEnabled
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

/**
 * Ensure we have a session. Uses Supabase anonymous auth so each browser gets a
 * real user id (auth.uid()) without a login screen — that id owns the menu and
 * RLS lets only that owner edit it. Returns the session, or null on failure.
 */
export async function ensureSession() {
  if (!supabase) return null
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) return session
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) {
    console.warn('[supabase] anonymous sign-in failed:', error.message)
    return null
  }
  return data.session
}
