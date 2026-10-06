import { supabase, isSupabaseEnabled } from '../lib/supabase.js'

const LOCAL_STORAGE_KEY_PREFIX = 'menulink_reviews_'

/**
 * Fetch reviews for a given menu id.
 * Uses Supabase when available, with localStorage caching & offline fallback.
 */
export async function fetchMenuReviews(menuId) {
  if (!menuId) return []

  if (isSupabaseEnabled && supabase) {
    try {
      const { data, error } = await supabase
        .from('menu_reviews')
        .select('*')
        .eq('menu_id', menuId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        // Cache to localStorage
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + menuId, JSON.stringify(data))
        } catch (_) {}
        return data
      }
    } catch (err) {
      console.warn('[reviews] failed to fetch from cloud, falling back to local:', err?.message)
    }
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + menuId)
    if (raw) return JSON.parse(raw)
  } catch (_) {}

  return []
}

/**
 * Submit a new customer review for a menu.
 */
export async function createMenuReview(menuId, { author_name, rating, comment, item_id = null }) {
  if (!menuId || !rating) return { error: 'Rating is required' }

  const newReview = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rev_${Date.now()}`,
    menu_id: menuId,
    item_id: item_id || null,
    author_name: (author_name || 'Verified Diner').trim(),
    rating: Math.min(5, Math.max(1, Number(rating))),
    comment: (comment || '').trim(),
    verified: true,
    created_at: new Date().toISOString()
  }

  if (isSupabaseEnabled && supabase) {
    try {
      const { data, error } = await supabase
        .from('menu_reviews')
        .insert([{
          menu_id: newReview.menu_id,
          item_id: newReview.item_id,
          author_name: newReview.author_name,
          rating: newReview.rating,
          comment: newReview.comment,
          verified: newReview.verified,
        }])
        .select()
        .single()

      if (!error && data) {
        return { data }
      }
      if (error) console.warn('[reviews] insert error:', error.message)
    } catch (err) {
      console.warn('[reviews] cloud submit failed:', err?.message)
    }
  }

  // Fallback: save to localStorage
  try {
    const existing = await fetchMenuReviews(menuId)
    const updated = [newReview, ...existing]
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + menuId, JSON.stringify(updated))
    return { data: newReview }
  } catch (err) {
    return { error: err?.message || 'Failed to save review' }
  }
}

/**
 * Calculate summary review metrics: average rating, total count, star breakdown.
 */
export function computeRatingStats(reviews = []) {
  if (!reviews || reviews.length === 0) {
    return { average: 5.0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
  }

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let sum = 0

  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)))
    breakdown[star] = (breakdown[star] || 0) + 1
    sum += Number(r.rating) || 5
  }

  const average = Number((sum / reviews.length).toFixed(1))
  return {
    average,
    count: reviews.length,
    breakdown
  }
}
