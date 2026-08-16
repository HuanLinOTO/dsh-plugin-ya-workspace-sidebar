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
