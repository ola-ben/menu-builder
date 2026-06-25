import { useCallback, useEffect, useRef, useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import { createId } from '../utils/format.js'
import { supabase, isSupabaseEnabled, ensureSession } from '../lib/supabase.js'

const STORAGE_KEY = 'qr-menu:restaurant'

function makeEmptyRestaurant() {
  return {
    id: createId('menu'),
    name: '',
    tagline: '',
    logoUrl: '',
    whatsappNumber: '',
    categories: [], // [{ id, name }]
    items: [], // [{ id, categoryId, name, priceNaira, description, imageUrl, available, tag }]
  }
}

/* ── Mapping between the DB row (snake_case) and the app shape (camelCase) ───── */

function fromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name || '',
    tagline: row.tagline || '',
    logoUrl: row.logo_url || '',
    whatsappNumber: row.whatsapp_number || '',
    categories: Array.isArray(row.categories) ? row.categories : [],
    items: Array.isArray(row.items) ? row.items : [],
  }
}

function toRow(r, ownerId) {
  return {
    id: r.id,
    owner_id: ownerId,
    name: r.name ?? '',
    tagline: r.tagline ?? '',
    logo_url: r.logoUrl ?? '',
    whatsapp_number: r.whatsappNumber ?? '',
    categories: r.categories ?? [],
    items: r.items ?? [],
  }
}

/* ── Hook ──────────────────────────────────────────────────────────────────── */

/**
 * Single-restaurant menu state. Persists to Supabase when configured (so QR
 * codes work on any device), and always mirrors to localStorage as a cache +
 * fallback. Returns the restaurant, a `loading` flag, and the management helpers.
 */
export default function useMenu() {
  const [restaurant, setRestaurant] = useLocalStorage(STORAGE_KEY, makeEmptyRestaurant())
  const [loading, setLoading] = useState(isSupabaseEnabled)
  const ownerIdRef = useRef(null)
  const saveTimer = useRef(null)

  // On mount: sign in anonymously, then load the owner's menu (or create it,
  // seeding from any existing local data so the current demo menu migrates up).
  useEffect(() => {
    if (!isSupabaseEnabled) return
    let cancelled = false

    ;(async () => {
      try {
        const session = await ensureSession()
        if (!session) throw new Error('no session')
        const ownerId = session.user.id
        ownerIdRef.current = ownerId

        const { data, error } = await supabase
          .from('menus')
          .select('*')
          .eq('owner_id', ownerId)
          .maybeSingle()
        if (error) throw error
        if (cancelled) return

        if (data) {
          setRestaurant(fromRow(data))
        } else {
          const local = restaurant
          const hasLocalContent = local && (local.name || local.items?.length || local.categories?.length)
          const seed = hasLocalContent ? local : makeEmptyRestaurant()
          const { data: inserted, error: insErr } = await supabase
            .from('menus')
            .insert(toRow(seed, ownerId))
            .select()
            .single()
          if (insErr) throw insErr
          if (!cancelled) setRestaurant(fromRow(inserted))
        }
      } catch (e) {
        console.warn('[supabase] using local menu:', e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced cloud save, called with the next restaurant value after a change.
  const persist = useCallback((next) => {
    if (!isSupabaseEnabled || !ownerIdRef.current) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase.from('menus').upsert(toRow(next, ownerIdRef.current))
      if (error) console.warn('[supabase] save failed:', error.message)
    }, 600)
  }, [])

  // Helper: run a state updater AND schedule a cloud save with the result.
  const apply = useCallback(
    (updater) =>
      setRestaurant((r) => {
        const next = updater(r)
        if (next !== r) persist(next)
        return next
      }),
    [setRestaurant, persist],
  )

  const updateRestaurant = useCallback((patch) => apply((r) => ({ ...r, ...patch })), [apply])

  // --- Categories ---
  const addCategory = useCallback(
    (name) =>
      apply((r) => {
        const trimmed = name.trim()
        if (!trimmed) return r
        return { ...r, categories: [...r.categories, { id: createId('cat'), name: trimmed }] }
      }),
    [apply],
  )

  const renameCategory = useCallback(
    (id, name) =>
      apply((r) => ({
        ...r,
        categories: r.categories.map((c) => (c.id === id ? { ...c, name } : c)),
      })),
    [apply],
  )

  const removeCategory = useCallback(
    (id) =>
      apply((r) => ({
        ...r,
        categories: r.categories.filter((c) => c.id !== id),
        // Items in a deleted category become "uncategorised" (categoryId = null).
        items: r.items.map((it) => (it.categoryId === id ? { ...it, categoryId: null } : it)),
      })),
    [apply],
  )

  // --- Items ---
  const addItem = useCallback(
    (item) =>
      apply((r) => ({
        ...r,
        items: [{ id: createId('item'), available: true, ...item }, ...r.items],
      })),
    [apply],
  )

  const updateItem = useCallback(
    (id, patch) =>
      apply((r) => ({
        ...r,
        items: r.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      })),
    [apply],
  )

  const removeItem = useCallback(
    (id) => apply((r) => ({ ...r, items: r.items.filter((it) => it.id !== id) })),
    [apply],
  )

  return {
    restaurant,
    loading,
    updateRestaurant,
    addCategory,
    renameCategory,
    removeCategory,
    addItem,
    updateItem,
    removeItem,
  }
}

/* ── Read access for the public menu page ──────────────────────────────────── */

/** Synchronous read of the locally-cached restaurant (fallback when cloud off). */
export function readRestaurant() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Fetch a menu by its id for the public page. Uses Supabase when enabled (so any
 * diner on any device can load it), otherwise falls back to the local menu.
 * Returns the restaurant object, or null if not found.
 */
export async function fetchMenuById(id) {
  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase.from('menus').select('*').eq('id', id).maybeSingle()
      if (error) throw error
      if (data) return fromRow(data)
    } catch (e) {
      console.warn('[supabase] fetch failed, trying local:', e.message)
    }
  }
  const local = readRestaurant()
  return local && local.id === id ? local : null
}

/**
 * Group items into their categories, preserving category order. Items with no
 * category are collected under a trailing "More" group.
 */
export function groupItemsByCategory(restaurant) {
  if (!restaurant) return []
  const groups = restaurant.categories.map((c) => ({
    id: c.id,
    name: c.name,
    items: restaurant.items.filter((it) => it.categoryId === c.id),
  }))
  const uncategorised = restaurant.items.filter(
    (it) => !it.categoryId || !restaurant.categories.some((c) => c.id === it.categoryId),
  )
  if (uncategorised.length) {
    groups.push({ id: 'uncategorised', name: 'More', items: uncategorised })
  }
  return groups.filter((g) => g.items.length > 0)
}
