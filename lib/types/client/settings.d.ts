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
export type SessionActionMode = 'archive' | 'delete';
/** Current action mode snapshot. */
export declare function getActionMode(): SessionActionMode;
/** Switch the action mode and notify subscribers. */
export declare function setActionMode(mode: SessionActionMode): void;
/** Subscribe to action mode changes; returns an unsubscribe disposer. */
export declare function subscribeActionMode(listener: () => void): () => void;
/**
 * Browser-local height (px) of the recent-sessions virtual viewport, set by
 * dragging the separator between the recent block and the workspace browser
 * (or nudging it with arrow keys). `undefined` means "never adjusted" and the
 * stylesheet default (`min(280px, 40vh)`) applies. Persisted to
 * `localStorage` like the action mode; per-browser by design.
 */
/** Lower bound of the recent-sessions viewport (about two rows). */
export declare const RECENT_MIN_HEIGHT = 70;
/** Absolute cap as a sanity net; the live drag clamps against free space. */
export declare const RECENT_MAX_HEIGHT = 640;
/** Current recent-sessions viewport height preference, if the user set one. */
export declare function getRecentViewportHeight(): number | undefined;
/** Store (or clear with `undefined`) the height preference and notify subscribers. */
export declare function setRecentViewportHeight(height: number | undefined): void;
/** Subscribe to recent height changes; returns an unsubscribe disposer. */
export declare function subscribeRecentViewportHeight(listener: () => void): () => void;
