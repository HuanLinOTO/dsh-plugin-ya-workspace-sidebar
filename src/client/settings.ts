/**
 * Browser-local preference controlling whether the session row's destructive
 * action presents as Archive (default) or Delete. Delete mode renders the
 * row action red with a trash icon and gates the call behind a confirmation
 * modal; the underlying Host verb remains `archiveSession` (the only
 * session-level destructive API exposed by `ctx.workspaces`), which hides
 * the session from grouping surfaces while preserving its log.
 *
 * The preference is persisted to `localStorage` so it survives reloads and
 * remounts without host-side plumbing. Cross-device sync is intentionally
 * out of scope: this is a per-browser UX preference, not a deployment knob.
 */

/** How the session row's destructive action presents and behaves. */
export type SessionActionMode = 'archive' | 'delete'

const STORAGE_KEY = 'ya-workspace-sidebar:action-mode'

const listeners = new Set<() => void>()
let currentMode: SessionActionMode = loadMode()

/** Read the stored preference, falling back to `archive` on any failure. */
function loadMode(): SessionActionMode {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'delete' ? 'delete' : 'archive'
  } catch {
    return 'archive'
  }
}

/** Persist the preference; silently ignores quota or privacy-mode failures. */
function persistMode(mode: SessionActionMode): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // localStorage may be unavailable (private mode, quota exceeded); the
    // in-memory value still drives the current session.
  }
}

/** Current action mode snapshot. */
export function getActionMode(): SessionActionMode {
  return currentMode
}

/** Switch the action mode and notify subscribers. */
export function setActionMode(mode: SessionActionMode): void {
  if (mode === currentMode) return
  currentMode = mode
  persistMode(mode)
  for (const listener of [...listeners]) listener()
}

/** Subscribe to action mode changes; returns an unsubscribe disposer. */
export function subscribeActionMode(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

/**
 * Browser-local height (px) of the recent-sessions virtual viewport, set by
 * dragging the separator between the recent block and the workspace browser
 * (or nudging it with arrow keys). `undefined` means "never adjusted" and the
 * stylesheet default (`min(280px, 40vh)`) applies. Persisted to
 * `localStorage` like the action mode; per-browser by design.
 */

/** Lower bound of the recent-sessions viewport (about two rows). */
export const RECENT_MIN_HEIGHT = 70
/** Absolute cap as a sanity net; the live drag clamps against free space. */
export const RECENT_MAX_HEIGHT = 640

const RECENT_HEIGHT_KEY = 'ya-workspace-sidebar:recent-height'

const recentHeightListeners = new Set<() => void>()
let currentRecentHeight: number | undefined = loadRecentHeight()

function clampRecentHeight(height: number): number {
  return Math.min(RECENT_MAX_HEIGHT, Math.max(RECENT_MIN_HEIGHT, Math.round(height)))
}

/** Read the stored height, falling back to `undefined` on any failure. */
function loadRecentHeight(): number | undefined {
  try {
    const raw = window.localStorage.getItem(RECENT_HEIGHT_KEY)
    if (raw === null) return undefined
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? clampRecentHeight(parsed) : undefined
  } catch {
    return undefined
  }
}

/** Persist the height (or clear the entry for `undefined`); failures ignored. */
function persistRecentHeight(height: number | undefined): void {
  try {
    if (height === undefined) window.localStorage.removeItem(RECENT_HEIGHT_KEY)
    else window.localStorage.setItem(RECENT_HEIGHT_KEY, String(height))
  } catch {
    // localStorage may be unavailable (private mode, quota exceeded); the
    // in-memory value still drives the current session.
  }
}

/** Current recent-sessions viewport height preference, if the user set one. */
export function getRecentViewportHeight(): number | undefined {
  return currentRecentHeight
}

/** Store (or clear with `undefined`) the height preference and notify subscribers. */
export function setRecentViewportHeight(height: number | undefined): void {
  const next = height === undefined ? undefined : clampRecentHeight(height)
  if (next === currentRecentHeight) return
  currentRecentHeight = next
  persistRecentHeight(next)
  for (const listener of [...recentHeightListeners]) listener()
}

/** Subscribe to recent height changes; returns an unsubscribe disposer. */
export function subscribeRecentViewportHeight(listener: () => void): () => void {
  recentHeightListeners.add(listener)
  return () => { recentHeightListeners.delete(listener) }
}
