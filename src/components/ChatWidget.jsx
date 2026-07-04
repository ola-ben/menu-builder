import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { WELCOME, askAssistant } from '../utils/assistant.js'
import { readRestaurant } from '../hooks/useMenu.js'
import { fetchOrders, summarizeOrders } from '../utils/orders.js'
import { useOpenPanel, togglePanel, useNavMounted } from '../hooks/useFloatingPanel.js'

/** Floating "Menu Assistant" chat bubble. AI (Groq) with rule-based fallback. */
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const playTone = (freq, time, duration) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, time)
      gain.gain.setValueAtTime(0.06, time)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(time)
      osc.stop(time + duration)
    }
    const now = ctx.currentTime
    playTone(523.25, now, 0.15)
    playTone(659.25, now + 0.12, 0.2)
  } catch (err) {
    console.warn('AudioContext failed:', err)
  }
}

export default function ChatWidget() {
  const open = useOpenPanel() === 'chat'
  const navMounted = useNavMounted()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([{ from: 'bot', text: WELCOME.text }])
  const [suggestions, setSuggestions] = useState(WELCOME.suggestions)
  const [busy, setBusy] = useState(false)
  const [context, setContext] = useState('')
  const [showPromo, setShowPromo] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy, open])

  useEffect(() => {
    const timer = setTimeout(() => {
      const fired = sessionStorage.getItem('chat_promo_fired')
      if (!fired) {
        setShowPromo(true)
        playNotificationSound()
        sessionStorage.setItem('chat_promo_fired', 'true')
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      const r = readRestaurant()
      if (!r?.id) return
      const orders = await fetchOrders(r.id)
      if (cancelled) return
      const summary = summarizeOrders(orders)
      setContext(
        `Restaurant: ${r.name || '(not set yet)'}. Menu items: ${r.items?.length || 0}.` +
          (summary ? `\n${summary}` : '\nNo orders recorded yet.'),
      )
    })()
    return () => {
      cancelled = true
    }
  }, [open])

  const send = async (text) => {
    const trimmed = (text ?? input).trim()
    if (!trimmed || busy) return
    const history = [...messages, { from: 'user', text: trimmed }]
    setMessages(history)
    setSuggestions([])
    setInput('')
    setBusy(true)
    try {
      const reply = await askAssistant(history, trimmed, context)
      setMessages((m) => [...m, { from: 'bot', text: reply.text }])
      if (reply.suggestions) setSuggestions(reply.suggestions)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {showPromo && !open && (
        <div 
          onClick={() => {
            togglePanel('chat')
            setShowPromo(false)
          }}
          className="fixed bottom-[1.35rem] right-20 z-50 flex cursor-pointer items-center gap-2 border border-brand-500 bg-paper px-3.5 py-2 font-mono text-[10px] uppercase tracking-wider text-brand-700 hover:bg-brand-100/50 dark:border-brand-500/30 dark:bg-slate-900 dark:text-brand-450 animate-fade-in"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
          <span>👋 Need help? Ask assistant!</span>
          <button 
            type="button" 
            onClick={(e) => {
              e.stopPropagation()
              setShowPromo(false)
            }}
            className="ml-1.5 text-xs font-bold hover:text-ink dark:hover:text-paper"
          >
            ×
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          togglePanel('chat')
          setShowPromo(false)
        }}
        aria-label={open ? 'Close assistant' : 'Open menu assistant'}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center bg-brand-500 text-white transition-transform hover:scale-105 hover:bg-brand-600 dark:border-brand-500/20 dark:bg-brand-500 dark:hover:bg-brand-600 shadow-none"
      >
        <Icon
          d={open ? 'M6 18L18 6M6 6l12 12' : 'M8 10.5h8M8 14h5m-9 6l3.5-2.5H18a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14z'}
          className="h-6 w-6"
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className={`animate-slide-up fixed right-5 z-50 flex h-[28rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-lift dark:border-white/10 dark:bg-slate-900 ${navMounted ? 'bottom-40' : 'bottom-24'}`}>
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white">
              <Icon d="M8 10.5h8M8 14h5m-9 6l3.5-2.5H18a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14z" className="h-4 w-4" strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Menu Assistant</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Free · here to help</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.from === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <p
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.from === 'user'
                      ? 'bg-gradient-to-br from-whatsapp-500 to-whatsapp-600 text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <p className="flex items-center gap-1 rounded-2xl bg-slate-100 px-3 py-2.5 dark:bg-slate-800">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                </p>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            className="flex items-center gap-2 border-t border-slate-100 p-3 dark:border-slate-800"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              placeholder={busy ? 'Thinking…' : 'Ask me anything…'}
              className="min-w-0 flex-1 border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 disabled:opacity-50 dark:border-paper/15 dark:bg-slate-950 dark:text-paper"
            />
            <button
              type="submit"
              disabled={busy}
              aria-label="Send"
              className="grid h-9 w-9 shrink-0 place-items-center bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
            >
              <Icon d="M4.5 19.5l15-7.5-15-7.5v6l9 1.5-9 1.5v6z" className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
