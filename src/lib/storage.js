import { supabase, ensureSession } from './supabase.js'

/** The public Storage bucket menu-item / logo images live in (see supabase/schema.sql). */
const BUCKET = 'images'

/**
 * Resize an image File to a JPEG Blob (longest side capped at maxSize). Same
 * resize as the old base64 path, but yields a Blob we can upload to Storage.
 */
export function resizeImageToBlob(file, maxSize = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        let { width, height } = img
        if (width > maxSize || height > maxSize) {
          const scale = Math.min(maxSize / width, maxSize / height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('toBlob returned null'))),
          'image/jpeg',
          0.82,
        )
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

/** Inline a Blob as a base64 data URL — the offline / no-Supabase fallback. */
export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

function randomName() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  // Fallback for the rare browser without crypto.randomUUID.
  return `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
}

/**
 * Upload a resized image blob to Supabase Storage and return its public URL.
 * Returns null when Supabase isn't configured or the upload fails, so callers
 * fall back to an inline base64 data URL (keeps the app working offline / in dev).
 * Files are stored under `{owner uid}/...` to satisfy the per-owner RLS policy.
 */
export async function uploadImage(blob) {
  if (!supabase) return null
  const session = await ensureSession()
  if (!session) return null
  const path = `${session.user.id}/${randomName()}.jpg`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
  if (error) {
    console.warn('[storage] upload failed, falling back to base64:', error.message)
    return null
  }
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
