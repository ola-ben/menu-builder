import { useEffect, useState } from 'react'
import ImageUpload from './ImageUpload.jsx'
import { suggestItemDescription } from '../utils/copywriter.js'

const EMPTY = {
  name: '',
  priceNaira: '',
  description: '',
  imageUrl: '',
  categoryId: '',
  tag: '',
  available: true,
}

const TAGS = ['', 'Popular', 'New', 'Spicy', 'Chef’s special']

/**
 * Add / edit a menu item. `initial` (optional) pre-fills the form for editing.
 * `categories` is the list of category options.
 */
export default function ItemForm({ initial, categories, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY)
  const isEditing = Boolean(initial)

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial, categoryId: initial.categoryId ?? '' } : EMPTY)
  }, [initial])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit({
      ...form,
      name: form.name.trim(),
      priceNaira: form.priceNaira === '' ? '' : Number(form.priceNaira),
      categoryId: form.categoryId || null,
    })
    if (!isEditing) setForm({ ...EMPTY, categoryId: form.categoryId })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload value={form.imageUrl} onChange={(v) => set('imageUrl', v)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="i-name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Item name <span className="text-brand-600">*</span>
          </label>
          <input
            id="i-name"
            className="input-base"
            placeholder="e.g. Jollof Rice & Chicken"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="i-price" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Price (₦)
          </label>
          <input
            id="i-price"
            type="number"
            min="0"
            className="input-base"
            placeholder="e.g. 3500"
            value={form.priceNaira}
            onChange={(e) => set('priceNaira', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="i-cat" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Category
          </label>
          <select id="i-cat" className="input-base" value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="i-desc" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Description
          </label>
          <button
            type="button"
            onClick={() => set('description', suggestItemDescription(form))}
            disabled={!form.name.trim()}
            title={form.name.trim() ? 'Write a description for me' : 'Add an item name first'}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 disabled:cursor-not-allowed disabled:text-slate-300 dark:text-brand-400 dark:disabled:text-slate-600"
          >
            ✨ Suggest
          </button>
        </div>
        <textarea
          id="i-desc"
          rows={2}
          className="input-base resize-none"
          placeholder="Portion size, sides, spice level…"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
          Tip: type a name (and any details) → tap Suggest. Tap again for another version.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label htmlFor="i-tag" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tag
          </label>
          <select id="i-tag" className="input-base" value={form.tag} onChange={(e) => set('tag', e.target.value)}>
            {TAGS.map((t) => (
              <option key={t || 'none'} value={t}>{t || 'None'}</option>
            ))}
          </select>
        </div>
        <label className="mt-6 flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => set('available', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/40 dark:border-slate-600 dark:bg-slate-800"
          />
          Available
        </label>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">
          {isEditing ? 'Save changes' : 'Add item'}
        </button>
        {isEditing && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
