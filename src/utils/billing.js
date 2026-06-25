import { supabase, isSupabaseEnabled } from '../lib/supabase.js'

/** Read a menu's billing row (public read). Returns null when unavailable. */
export async function fetchBilling(menuId) {
  if (!isSupabaseEnabled) return null
  try {
    const { data, error } = await supabase
      .from('menu_billing')
      .select('*')
      .eq('menu_id', menuId)
      .maybeSingle()
    if (error) throw error
    return data
  } catch (e) {
    console.warn('[billing] fetch failed:', e.message)
    return null
  }
}

/**
 * Decide whether a menu is live, from its billing row.
 * Returns { live, state: 'trial'|'active'|'expired', daysLeft }.
 * No row (local dev / missing) => treated as live.
 */
export function computeBilling(row) {
  if (!row) return { live: true, state: 'active', daysLeft: null }
  const now = Date.now()
  const trialEnds = row.trial_ends_at ? new Date(row.trial_ends_at).getTime() : 0
  const expires = row.expires_at ? new Date(row.expires_at).getTime() : 0
  const inTrial = now < trialEnds
  const paidLive = row.active && (!row.expires_at || now < expires)
  const live = inTrial || paidLive
  let state = 'expired'
  if (paidLive) state = 'active'
  else if (inTrial) state = 'trial'
  const ref = paidLive ? expires : trialEnds
  const daysLeft = ref ? Math.max(0, Math.ceil((ref - now) / 86400000)) : null
  return { live, state, daysLeft, trialEndsAt: row.trial_ends_at, expiresAt: row.expires_at }
}
