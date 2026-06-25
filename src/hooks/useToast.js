import { useCallback, useRef, useState } from 'react'

/** Tiny toast manager: showToast(message, type) then auto-dismiss. */
export default function useToast(duration = 2600) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  const showToast = useCallback(
    (message, type = 'info') => {
      if (timer.current) clearTimeout(timer.current)
      setToast({ message, type, id: Date.now() })
      timer.current = setTimeout(() => setToast(null), duration)
    },
    [duration],
  )

  return { toast, showToast }
}
