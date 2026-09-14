/**
 * Browser-local pinned/unread session flags for the sidebar rows.
 *
 * Pinned order is an array (index 0 renders first); unread is a set. Both
 * persist to localStorage like the action-mode preference: per-browser by
 * design, never synced, never sent to the Host. Storage failures fall back
 * to the in-memory value driving the current page.
 */
import { SessionId } from '@deepseek-ai/dsh-session/types';
/** Current pinned order (newest pin first). */
export declare function getPinnedOrder(): readonly SessionId[];
/** Whether one session is pinned. */
export declare function isPinned(id: SessionId): boolean;
/** Pin one session to the front, or unpin it when already pinned. */
export declare function togglePinned(id: SessionId): void;
/** Subscribe to pinned changes; returns an unsubscribe disposer. */
export declare function subscribePinned(listener: () => void): () => void;
/** Current unread set snapshot. */
export declare function getUnread(): ReadonlySet<SessionId>;
/** Whether one session is marked unread. */
export declare function isUnread(id: SessionId): boolean;
/** Mark one session unread (idempotent). */
export declare function markUnread(id: SessionId): void;
/** Clear one session's unread mark (no-op, no notification, when already read). */
export declare function markRead(id: SessionId): void;
/** Subscribe to unread changes; returns an unsubscribe disposer. */
export declare function subscribeUnread(listener: () => void): () => void;
/** Test-only: drop in-memory state and reload from storage. */
export declare function __resetSessionFlagsForTest(): void;
