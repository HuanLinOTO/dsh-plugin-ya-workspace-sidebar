/** Pure sidebar projections shared by the browser and unit tests. */
import type { SessionId, SessionListState, SessionSummary, WorkspaceId, WorkspaceView } from '@deepseek-ai/dsh-client-runtime/client';
/** Navigation key for sessions not accounted to a real workspace. */
export declare const UNGROUPED: "__ya_ungrouped__";
/** One sidebar session row. */
export interface SessionRow {
    id: SessionId;
    title: string;
    blank: boolean;
    running: boolean;
    pendingInteraction?: SessionSummary['pendingInteraction'];
    completed: boolean;
    updatedAt: number;
    workspaceKey: WorkspaceId | typeof UNGROUPED;
    workspaceTitle: string;
}
/** One date-bucketed group of session rows for the real-workspace level. */
export interface SessionDateGroup {
    /** Local calendar date `YYYY-MM-DD`, stable key. */
    dateKey: string;
    /** Days between today's local date and this group's local date (0=today, 1=yesterday, …). */
    dayOffset: number;
    rows: SessionRow[];
}
/** One first-level workspace row. */
export interface WorkspaceRow {
    key: WorkspaceId | typeof UNGROUPED;
    title: string;
    path?: string;
    createdAt?: string;
    count: number;
    real: boolean;
}
/** Resolve the first/second-level destination for one session. */
export declare function workspaceKeyForSession(sessionId: SessionId | undefined, workspaces: readonly WorkspaceView[]): WorkspaceId | typeof UNGROUPED | null;
/** Derive global recent sessions, newest first. */
export declare function deriveRecent(list: SessionListState, workspaces: readonly WorkspaceView[], archivedSessionIds: readonly SessionId[], limit?: number): SessionRow[];
/** Derive first-level real workspaces plus the virtual Ungrouped row. */
export declare function deriveWorkspaces(list: SessionListState, workspaces: readonly WorkspaceView[], archivedSessionIds: readonly SessionId[]): WorkspaceRow[];
/** Derive the selected workspace's sessions in its canonical order. */
export declare function deriveWorkspaceSessions(key: WorkspaceId | typeof UNGROUPED, list: SessionListState, workspaces: readonly WorkspaceView[], archivedSessionIds: readonly SessionId[]): SessionRow[];
/**
 * Derive the selected real workspace's sessions grouped by local calendar date.
 *
 * - Only real workspaces: `Ungrouped` falls back to {@link deriveWorkspaceSessions}.
 * - Groups are ordered by date descending; rows within a group by `updatedAt` descending.
 * - {@link visible} filter is reused (archived / subagent / blank visibility).
 * - Future timestamps clamp to today's bucket (`dayOffset` 0).
 * - `now` is the reference timestamp for "today"; pass `Date.now()` in production.
 */
export declare function deriveWorkspaceSessionGroups(key: WorkspaceId | typeof UNGROUPED, list: SessionListState, workspaces: readonly WorkspaceView[], archivedSessionIds: readonly SessionId[], now: number): SessionDateGroup[];
/** Case-insensitive local title/workspace matching used beside Host content search. */
export declare function localMatches(rows: readonly SessionRow[], query: string): SessionRow[];
