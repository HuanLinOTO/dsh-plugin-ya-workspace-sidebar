/**
 * Browser-local pinned/unread session flags for the sidebar rows.
 *
 * Pinned order is an array (index 0 renders first); unread is a set. Both
 * persist to localStorage like the action-mode preference: per-browser by
 * design, never synced, never sent to the Host. Storage failures fall back
 * to the in-memory value driving the current page.
 */
import type { SessionId } from '@deepseek-ai/dsh-session/types'

const PINNED_KEY = 'ya-workspace-sidebar:pinned'
const UNREAD_KEY = 'ya-workspace-sidebar:unread'

/** Read one id array; malformed or absent entries resolve to empty. */
function readIds(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((value): value is string => typeof value === 'string')
  } catch {
    return []
  }
}

/** Persist one id array; silently ignores quota or privacy-mode failures. */
function writeIds(key: string, ids: readonly string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids))
  } catch {
    // localStorage may be unavailable (private mode, quota); the in-memory value still drives this page.
  }
}

let pinnedOrder: string[] = readIds(PINNED_KEY)
const pinnedListeners = new Set<() => void>()

let unreadIds: string[] = readIds(UNREAD_KEY)
const unreadListeners = new Set<() => void>()

/** Current pinned order (newest pin first). */
export function getPinnedOrder(): readonly string[] {
  return pinnedOrder
}

/** Whether one session is pinned. */
export function isPinned(id: SessionId): boolean {
  return pinnedOrder.includes(id)
}

/** Pin one session to the front, or unpin it when already pinned. */
export function togglePinned(id: SessionId): void {
  const next = pinnedOrder.includes(id)
    ? pinnedOrder.filter(item => item !== id)
    : [id, ...pinnedOrder]
  pinnedOrder = next
  writeIds(PINNED_KEY, next)
  for (const listener of [...pinnedListeners]) listener()
}

/** Subscribe to pinned changes; returns an unsubscribe disposer. */
export function subscribePinned(listener: () => void): () => void {
  pinnedListeners.add(listener)
  return () => { pinnedListeners.delete(listener) }
}

/** Current unread set snapshot. */
export function getUnread(): ReadonlySet<SessionId> {
  return new Set(unreadIds)
}

/** Whether one session is marked unread. */
export function isUnread(id: SessionId): boolean {
  return unreadIds.includes(id)
}

/** Mark one session unread (idempotent). */
export function markUnread(id: SessionId): void {
  if (unreadIds.includes(id)) return
  unreadIds = [...unreadIds, id]
  writeIds(UNREAD_KEY, unreadIds)
  for (const listener of [...unreadListeners]) listener()
}

/** Clear one session's unread mark (no-op, no notification, when already read). */
export function markRead(id: SessionId): void {
  if (!unreadIds.includes(id)) return
  unreadIds = unreadIds.filter(item => item !== id)
  writeIds(UNREAD_KEY, unreadIds)
  for (const listener of [...unreadListeners]) listener()
}

/** Subscribe to unread changes; returns an unsubscribe disposer. */
export function subscribeUnread(listener: () => void): () => void {
  unreadListeners.add(listener)
  return () => { unreadListeners.delete(listener) }
}

/** Test-only: drop in-memory state and reload from storage. */
export function __resetSessionFlagsForTest(): void {
  pinnedOrder = readIds(PINNED_KEY)
  unreadIds = readIds(UNREAD_KEY)
}
