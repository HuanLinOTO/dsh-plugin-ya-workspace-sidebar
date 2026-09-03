/** Pure sidebar projections shared by the browser and unit tests. */
import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client';
import type { WorkspaceId, WorkspaceView } from '@deepseek-ai/dsh-api-workspace-controller/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/** Pending-interaction kinds surfaced as a row status dot. */
export type PendingInteractionKind = 'approval' | 'plan-review' | 'question';
/** Renderer-visible view of ui-session's pending-interaction snapshot entries. */
export type PendingInteractionEntry = {
    readonly kind: string;
};
/** Pending-interaction snapshot consumed by the derive functions. */
export type PendingInteractionMap = ReadonlyMap<SessionId, PendingInteractionEntry>;
/** Navigation key for sessions not accounted to a real workspace. */
export declare const UNGROUPED: "__ya_ungrouped__";
/** One sidebar session row. */
export interface SessionRow {
    id: SessionId;
    title: string;
    blank: boolean;
    running: boolean;
    pendingInteraction?: PendingInteractionKind;
    completed: boolean;
    updatedAt: number;
    workspaceKey: WorkspaceId | typeof UNGROUPED;
    workspaceTitle: string;
}
/** One date-bucketed group. Empty `dateKey` is the undated trailing bucket. */
export interface DateGroup<T> {
    /** Local calendar date `YYYY-MM-DD`, or `''` for rows with no timestamp. */
    dateKey: string;
    /** Days between today's local date and this group's local date (0=today, 1=yesterday, …). */
    dayOffset: number;
    rows: T[];
}
/** One date-bucketed group of session rows for the real-workspace level. */
export type SessionDateGroup = DateGroup<SessionRow>;
/** One date-bucketed group of first-level workspace rows. */
export type WorkspaceDateGroup = DateGroup<WorkspaceRow>;
/** One first-level workspace row. */
export interface WorkspaceRow {
    key: WorkspaceId | typeof UNGROUPED;
    title: string;
    path?: string;
    createdAt?: string;
    /** Newest visible session `updatedAt`; empty real workspaces fall back to `createdAt`. */
    lastUsedAt?: number;
    count: number;
    real: boolean;
}
/** Resolve the first/second-level destination for one session. */
export declare function workspaceKeyForSession(sessionId: SessionId | undefined, workspaces: readonly WorkspaceView[]): WorkspaceId | typeof UNGROUPED | null;
/** Derive global recent sessions, newest first. */
export declare function deriveRecent(list: SessionListState, workspaces: readonly WorkspaceView[], archivedSessionIds: readonly SessionId[], pending: PendingInteractionMap, limit?: number): SessionRow[];
/** Fixed occupied height of one recent-sessions row: 33px two-line row + 2px vertical margins. */
export declare const RECENT_ROW_STRIDE = 35;
/** Half-open render window `[start, end)` of a fixed-stride virtual list. */
export interface VirtualWindow {
    start: number;
    end: number;
}
/**
 * Windowing math for the recent-sessions virtual list (fixed row stride).
 *
 * Clamps `scrollTop` into the valid range, then pads the visible row range
 * with `overscan` rows on both edges. Before the viewport has been measured
 * (`viewportHeight <= 0`) it still returns a small head window so the first
 * paint is never blank.
 */
export declare function virtualWindow(scrollTop: number, viewportHeight: number, count: number, stride?: number, overscan?: number): VirtualWindow;
/** Derive first-level workspaces plus Ungrouped, newest session activity first. */
export declare function deriveWorkspaces(list: SessionListState, workspaces: readonly WorkspaceView[], archivedSessionIds: readonly SessionId[]): WorkspaceRow[];
/** Derive the selected workspace's sessions in its canonical order. */
export declare function deriveWorkspaceSessions(key: WorkspaceId | typeof UNGROUPED, list: SessionListState, workspaces: readonly WorkspaceView[], archivedSessionIds: readonly SessionId[], pending: PendingInteractionMap): SessionRow[];
/**
 * Derive the selected real workspace's sessions grouped by local calendar date.
 *
 * - Only real workspaces: `Ungrouped` falls back to {@link deriveWorkspaceSessions}.
 * - Groups are ordered by date descending; rows within a group by `updatedAt` descending.
 * - {@link visible} filter is reused (archived / subagent / blank visibility).
 * - Future timestamps clamp to today's bucket (`dayOffset` 0).
 * - `now` is the reference timestamp for "today"; pass `Date.now()` in production.
 */
export declare function deriveWorkspaceSessionGroups(key: WorkspaceId | typeof UNGROUPED, list: SessionListState, workspaces: readonly WorkspaceView[], archivedSessionIds: readonly SessionId[], pending: PendingInteractionMap, now: number): SessionDateGroup[];
/** Group root workspace rows by local calendar date of `lastUsedAt`; undated rows trail with empty `dateKey`. */
export declare function deriveWorkspaceGroups(rows: readonly WorkspaceRow[], now: number): WorkspaceDateGroup[];
/** Case-insensitive local title/workspace matching used beside Host content search. */
export declare function localMatches(rows: readonly SessionRow[], query: string): SessionRow[];
