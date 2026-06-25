import { useState } from 'react'
import Icon from './Icon.jsx'

/** Add and remove menu categories (e.g. Rice, Soups, Drinks). */
export default function CategoryManager({ categories, onAdd, onRemove }) {
  const [name, setName] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name)
    setName('')
  }

  return (
    <div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          className="input-base"
          placeholder="Add a category, e.g. Rice dishes"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn-primary shrink-0 px-3">
          <Icon d="M12 5v14M5 12h14" className="h-4 w-4" strokeWidth={2.2} />
          Add
        </button>
      </form>

      {categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {c.name}
              <button
                type="button"
                onClick={() => onRemove(c.id)}
                aria-label={`Remove ${c.name}`}
                className="text-slate-400 transition hover:text-rose-500"
              >
                <Icon d="M6 18L18 6M6 6l12 12" className="h-3.5 w-3.5" strokeWidth={2.2} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
