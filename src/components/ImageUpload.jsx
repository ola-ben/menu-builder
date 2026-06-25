import { useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { resizeImageToBlob, blobToDataUrl, uploadImage } from '../lib/storage.js'

export default function ImageUpload({ value, onChange, label = 'Photo', rounded = 'rounded-xl' }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const blob = await resizeImageToBlob(file)
      // Prefer Supabase Storage (returns a public URL); fall back to inline
      // base64 when Supabase isn't configured or the upload fails.
      const url = await uploadImage(blob)
      onChange(url || (await blobToDataUrl(blob)))
    } catch {
      // ignore unreadable file
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={`grid h-20 w-20 shrink-0 place-items-center overflow-hidden border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-brand-400 hover:text-brand-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950/40 ${rounded}`}
          aria-label="Upload image"
        >
          {busy ? (
            <Icon d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" className="h-5 w-5 animate-spin" />
          ) : value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon d="M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" className="h-6 w-6" />
          )}
        </button>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <p>{busy ? 'Uploading…' : 'Tap to upload a clear photo.'}</p>
          {value && (
            <button type="button" onClick={() => onChange('')} className="mt-1 font-semibold text-rose-500 hover:underline">
              Remove
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  )
}
