import { useSyncExternalStore } from 'react'

/**
 * A tiny shared store for the bottom-right floating panels (the section menu and
 * the chat widget). Only one can be open at a time, so opening one closes the
 * other. Lives in a module so the two sibling components stay in sync without a
 * context provider.
 */
let openPanel = null // 'nav' | 'chat' | null
let navMounted = false // is the section-nav launcher on screen (dashboard only)?
const listeners = new Set()

function emit() {
  listeners.forEach((fn) => fn())
}

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** Open the given panel, or close everything when passed null. */
export function setOpenPanel(panel) {
  openPanel = panel
  emit()
}

/** Toggle a panel: open it if closed, close it if already open. */
export function togglePanel(panel) {
  setOpenPanel(openPanel === panel ? null : panel)
}

/** Subscribe to which panel is currently open ('nav' | 'chat' | null). */
export function useOpenPanel() {
  return useSyncExternalStore(subscribe, () => openPanel, () => openPanel)
}

/** Tell the store whether the section-nav launcher is currently mounted. */
export function setNavMounted(v) {
  navMounted = v
  emit()
}

/**
 * True when the section-nav launcher is on screen, so the chat panel can open
 * higher and clear the extra stacked button instead of overlapping it.
 */
export function useNavMounted() {
  return useSyncExternalStore(subscribe, () => navMounted, () => navMounted)
}
