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
