import { supabase, isSupabaseEnabled } from './supabase.js'

export const STORAGE_KEY = 'qr-menu:restaurant'

export function makeEmptyRestaurant() {
  return {
    id: `menu-${Date.now().toString(36)}`,
    name: '',
    tagline: '',
    logoUrl: '',
    whatsappNumber: '',
    categories: [], // [{ id, name }]
    items: [], // [{ id, categoryId, name, priceNaira, description, imageUrl, available, tag }]
  }
}

/* ── Mapping between the DB row (snake_case) and the app shape (camelCase) ───── */

export function fromRow(row) {
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

export function toRow(r, ownerId) {
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

/* ── Read access for the public menu page ──────────────────────────────────── */

/** Synchronous read of the locally-cached restaurant (fallback when cloud off). */
export function readRestaurant() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const DEMO_RESTAURANT = {
  id: 'demo',
  name: "Mama Nkechi's Kitchen",
  tagline: 'Authentic Nigerian Jollof, Pepper Soups & Refreshing Drinks',
  logoUrl: '',
  whatsappNumber: '2348012345678',
  categories: [
    { id: 'cat-1', name: 'Main Dishes' },
    { id: 'cat-2', name: 'Soups & Pepper Specials' },
    { id: 'cat-3', name: 'Chilled Drinks' },
  ],
  items: [
    {
      id: 'item-1',
      categoryId: 'cat-1',
      name: 'Smoky Party Jollof & Peppered Chicken',
      priceNaira: 3500,
      description: 'Firewood smoky party jollof served with fried sweet dodo and spicy peppered chicken.',
      imageUrl: '/jollof.png',
      available: true,
      tag: 'Best Seller 🔥',
    },
    {
      id: 'item-2',
      categoryId: 'cat-2',
      name: 'Catfish Pepper Soup',
      priceNaira: 2500,
      description: 'Fresh point-and-kill catfish simmered in hot native spices, uziza, and scent leaves.',
      imageUrl: '/catfish.png',
      available: true,
      tag: 'Hot & Spicy',
    },
    {
      id: 'item-3',
      categoryId: 'cat-3',
      name: 'Chilled Zobo Drink',
      priceNaira: 1000,
      description: 'Freshly brewed hibiscus infused with ginger, pineapple juice, and aromatic cloves.',
      imageUrl: '/zobo.png',
      available: true,
      tag: 'Freshly Brewed',
    },
  ],
}

/**
 * Fetch a menu by its id for the public page. Uses Supabase when enabled (so any
 * diner on any device can load it), otherwise falls back to the local menu.
 * Returns the restaurant object, or null if not found.
 */
export async function fetchMenuById(id) {
  if (isSupabaseEnabled && supabase) {
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
