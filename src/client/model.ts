/** Pure sidebar projections shared by the browser and unit tests. */
import type { SessionListState, SessionSummary } from '@deepseek-ai/dsh-api-session-controller/client'
import type { WorkspaceId, WorkspaceView } from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/** Pending-interaction kinds surfaced as a row status dot. */
export type PendingInteractionKind = 'approval' | 'plan-review' | 'question'

/** Renderer-visible view of ui-session's pending-interaction snapshot entries. */
export type PendingInteractionEntry = { readonly kind: string }

/** Pending-interaction snapshot consumed by the derive functions. */
export type PendingInteractionMap = ReadonlyMap<SessionId, PendingInteractionEntry>

/** Resolve the visible status-dot kind for one session, if any. */
function pendingKindOf(
  pending: PendingInteractionMap,
  id: SessionId,
): PendingInteractionKind | undefined {
  const kind = pending.get(id)?.kind
  return kind === 'approval' || kind === 'plan-review' || kind === 'question' ? kind : undefined
}

/** Navigation key for sessions not accounted to a real workspace. */
export const UNGROUPED = '__ya_ungrouped__' as const

/** One sidebar session row. */
export interface SessionRow {
  id: SessionId
  title: string
  blank: boolean
  running: boolean
  pendingInteraction?: PendingInteractionKind
  completed: boolean
  updatedAt: number
  workspaceKey: WorkspaceId | typeof UNGROUPED
  workspaceTitle: string
}

/** One date-bucketed group. Empty `dateKey` is the undated trailing bucket. */
export interface DateGroup<T> {
  /** Local calendar date `YYYY-MM-DD`, or `''` for rows with no timestamp. */
  dateKey: string
  /** Days between today's local date and this group's local date (0=today, 1=yesterday, …). */
  dayOffset: number
  rows: T[]
}

/** One date-bucketed group of session rows for the real-workspace level. */
export type SessionDateGroup = DateGroup<SessionRow>

/** One date-bucketed group of first-level workspace rows. */
export type WorkspaceDateGroup = DateGroup<WorkspaceRow>

/** One first-level workspace row. */
export interface WorkspaceRow {
  key: WorkspaceId | typeof UNGROUPED
  title: string
  path?: string
  createdAt?: string
  /** Newest visible session `updatedAt`; empty real workspaces fall back to `createdAt`. */
  lastUsedAt?: number
  count: number
  real: boolean
}

function visible(summary: SessionSummary, current: SessionId | undefined, archived: ReadonlySet<SessionId>): boolean {
  return summary.origin !== 'subagent'
    && !archived.has(summary.id)
    && (!summary.blank || summary.id === current)
}

function rowOf(
  summary: SessionSummary,
  workspaceKey: WorkspaceId | typeof UNGROUPED,
  workspaceTitle: string,
  pending: PendingInteractionMap,
): SessionRow {
  const pendingInteraction = pendingKindOf(pending, summary.id)
  return {
    id: summary.id,
    title: summary.blank ? 'New Session' : summary.displayTitle,
    blank: summary.blank,
    running: summary.running,
    ...(pendingInteraction === undefined ? {} : { pendingInteraction }),
    completed: summary.completed === true,
    updatedAt: summary.updatedAt,
    workspaceKey,
    workspaceTitle,
  }
}

function ownerIndex(workspaces: readonly WorkspaceView[]): Map<SessionId, WorkspaceView> {
  const result = new Map<SessionId, WorkspaceView>()
  for (const workspace of workspaces) {
    for (const sessionId of workspace.sessionIds) result.set(sessionId, workspace)
  }
  return result
}

/** Resolve the first/second-level destination for one session. */
export function workspaceKeyForSession(
  sessionId: SessionId | undefined,
  workspaces: readonly WorkspaceView[],
): WorkspaceId | typeof UNGROUPED | null {
  if (sessionId === undefined) return null
  return ownerIndex(workspaces).get(sessionId)?.workspaceId ?? UNGROUPED
}

/** Derive global recent sessions, newest first. */
export function deriveRecent(
  list: SessionListState,
  workspaces: readonly WorkspaceView[],
  archivedSessionIds: readonly SessionId[],
  pending: PendingInteractionMap,
  limit = 5,
): SessionRow[] {
  const archived = new Set(archivedSessionIds)
  const owners = ownerIndex(workspaces)
  return list.ids
    .map(id => list.byId[id])
    .filter((summary): summary is SessionSummary => summary !== undefined && visible(summary, list.current, archived))
    .sort((a, b) => b.updatedAt - a.updatedAt || String(a.id).localeCompare(String(b.id)))
    .slice(0, limit)
    .map((summary) => {
      const workspace = owners.get(summary.id)
      return rowOf(summary, workspace?.workspaceId ?? UNGROUPED, workspace?.title ?? 'Ungrouped', pending)
    })
}

/** Fixed occupied height of one recent-sessions row: 33px two-line row + 2px vertical margins. */
export const RECENT_ROW_STRIDE = 35

/** Half-open render window `[start, end)` of a fixed-stride virtual list. */
export interface VirtualWindow {
  start: number
  end: number
}

/**
 * Windowing math for the recent-sessions virtual list (fixed row stride).
 *
 * Clamps `scrollTop` into the valid range, then pads the visible row range
 * with `overscan` rows on both edges. Before the viewport has been measured
 * (`viewportHeight <= 0`) it still returns a small head window so the first
 * paint is never blank.
 */
export function virtualWindow(
  scrollTop: number,
  viewportHeight: number,
  count: number,
  stride: number = RECENT_ROW_STRIDE,
  overscan = 4,
): VirtualWindow {
  if (count <= 0 || stride <= 0) return { start: 0, end: 0 }
  const height = Math.max(0, viewportHeight)
  const top = Math.min(Math.max(0, scrollTop), Math.max(0, count * stride - height))
  const first = Math.floor(top / stride)
  const last = height > 0 ? Math.floor((top + height) / stride) : first
  return {
    start: Math.max(0, first - overscan),
    end: Math.min(count, last + 1 + overscan),
  }
}

function lastUsedOf(timestamps: readonly number[], fallback?: string): number | undefined {
  let newest: number | undefined
  for (const ts of timestamps) {
    if (newest === undefined || ts > newest) newest = ts
  }
  if (newest !== undefined) return newest
  if (fallback === undefined) return undefined
  const created = Date.parse(fallback)
  return Number.isNaN(created) ? undefined : created
}

/** Derive first-level workspaces plus Ungrouped, newest session activity first. */
export function deriveWorkspaces(
  list: SessionListState,
  workspaces: readonly WorkspaceView[],
  archivedSessionIds: readonly SessionId[],
): WorkspaceRow[] {
  const archived = new Set(archivedSessionIds)
  const accounted = new Set<SessionId>()
  const result = workspaces.map((workspace): WorkspaceRow => {
    let count = 0
    const timestamps: number[] = []
    for (const id of workspace.sessionIds) {
      accounted.add(id)
      const summary = list.byId[id]
      if (summary !== undefined && visible(summary, list.current, archived)) {
        count++
        timestamps.push(summary.updatedAt)
      }
    }
    const lastUsedAt = lastUsedOf(timestamps, workspace.createdAt)
    return {
      key: workspace.workspaceId,
      title: workspace.title,
      path: workspace.path,
      createdAt: workspace.createdAt,
      ...(lastUsedAt === undefined ? {} : { lastUsedAt }),
      count,
      real: true,
    }
  })
  let ungrouped = 0
  const ungroupedTimestamps: number[] = []
  for (const id of list.ids) {
    const summary = list.byId[id]
    if (summary !== undefined && !accounted.has(id) && visible(summary, list.current, archived)) {
      ungrouped++
      ungroupedTimestamps.push(summary.updatedAt)
    }
  }
  const ungroupedLastUsed = lastUsedOf(ungroupedTimestamps)
  result.push({
    key: UNGROUPED,
    title: 'Ungrouped',
    count: ungrouped,
    real: false,
    ...(ungroupedLastUsed === undefined ? {} : { lastUsedAt: ungroupedLastUsed }),
  })
  result.sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0) || String(a.key).localeCompare(String(b.key)))
  return result
}

/** Derive the selected workspace's sessions in its canonical order. */
export function deriveWorkspaceSessions(
  key: WorkspaceId | typeof UNGROUPED,
  list: SessionListState,
  workspaces: readonly WorkspaceView[],
  archivedSessionIds: readonly SessionId[],
  pending: PendingInteractionMap,
): SessionRow[] {
  const archived = new Set(archivedSessionIds)
  if (key === UNGROUPED) {
    const accounted = new Set(workspaces.flatMap(workspace => workspace.sessionIds))
    return list.ids
      .map(id => list.byId[id])
      .filter((summary): summary is SessionSummary => summary !== undefined
        && !accounted.has(summary.id)
        && visible(summary, list.current, archived))
      .sort((a, b) => b.updatedAt - a.updatedAt || String(a.id).localeCompare(String(b.id)))
      .map(summary => rowOf(summary, UNGROUPED, 'Ungrouped', pending))
  }
  const workspace = workspaces.find(item => item.workspaceId === key)
  if (workspace === undefined) return []
  return workspace.sessionIds
    .map(id => list.byId[id])
    .filter((summary): summary is SessionSummary => summary !== undefined && visible(summary, list.current, archived))
    .map(summary => rowOf(summary, workspace.workspaceId, workspace.title, pending))
}

/** Format a local calendar date as `YYYY-MM-DD` (locale-agnostic, no padding surprises). */
function localDateKey(year: number, month: number, day: number): string {
  const mm = month < 9 ? `0${month + 1}` : `${month + 1}`
  const dd = day < 10 ? `0${day}` : `${day}`
  return `${year}-${mm}-${dd}`
}

/** Whole-day difference between two local calendar dates (a - b) using UTC midnight. */
function dayDiff(a: { year: number; month: number; day: number }, b: { year: number; month: number; day: number }): number {
  const msA = Date.UTC(a.year, a.month, a.day)
  const msB = Date.UTC(b.year, b.month, b.day)
  return Math.round((msA - msB) / 86_400_000)
}

function groupByLocalDate<T>(
  rows: readonly T[],
  timestampOf: (row: T) => number,
  compare: (a: T, b: T) => number,
  now: number,
): DateGroup<T>[] {
  if (rows.length === 0) return []
  const nowDate = new Date(now)
  const today = { year: nowDate.getFullYear(), month: nowDate.getMonth(), day: nowDate.getDate() }
  const buckets = new Map<string, { dayOffset: number; rows: T[] }>()
  for (const row of rows) {
    const ts = Math.min(timestampOf(row), now)
    const d = new Date(ts)
    const date = { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() }
    const dateKey = localDateKey(date.year, date.month, date.day)
    let bucket = buckets.get(dateKey)
    if (bucket === undefined) {
      bucket = { dayOffset: Math.max(0, dayDiff(today, date)), rows: [] }
      buckets.set(dateKey, bucket)
    }
    bucket.rows.push(row)
  }
  const groups: DateGroup<T>[] = []
  for (const [dateKey, bucket] of buckets) {
    bucket.rows.sort(compare)
    groups.push({ dateKey, dayOffset: bucket.dayOffset, rows: bucket.rows })
  }
  groups.sort((a, b) => a.dayOffset - b.dayOffset || a.dateKey.localeCompare(b.dateKey))
  return groups
}

/**
 * Derive the selected real workspace's sessions grouped by local calendar date.
 *
 * - Only real workspaces: `Ungrouped` falls back to {@link deriveWorkspaceSessions}.
 * - Groups are ordered by date descending; rows within a group by `updatedAt` descending.
 * - {@link visible} filter is reused (archived / subagent / blank visibility).
 * - Future timestamps clamp to today's bucket (`dayOffset` 0).
 * - `now` is the reference timestamp for "today"; pass `Date.now()` in production.
 */
export function deriveWorkspaceSessionGroups(
  key: WorkspaceId | typeof UNGROUPED,
  list: SessionListState,
  workspaces: readonly WorkspaceView[],
  archivedSessionIds: readonly SessionId[],
  pending: PendingInteractionMap,
  now: number,
): SessionDateGroup[] {
  if (key === UNGROUPED) return []
  const workspace = workspaces.find(item => item.workspaceId === key)
  if (workspace === undefined) return []
  const archived = new Set(archivedSessionIds)
  const rows = workspace.sessionIds
    .map(id => list.byId[id])
    .filter((summary): summary is SessionSummary => summary !== undefined && visible(summary, list.current, archived))
    .map(summary => rowOf(summary, workspace.workspaceId, workspace.title, pending))
  return groupByLocalDate(
    rows,
    row => row.updatedAt,
    (a, b) => b.updatedAt - a.updatedAt || String(a.id).localeCompare(String(b.id)),
    now,
  )
}

/** Group root workspace rows by local calendar date of `lastUsedAt`; undated rows trail with empty `dateKey`. */
export function deriveWorkspaceGroups(rows: readonly WorkspaceRow[], now: number): WorkspaceDateGroup[] {
  const dated: WorkspaceRow[] = []
  const undated: WorkspaceRow[] = []
  for (const row of rows) {
    if (row.lastUsedAt === undefined) undated.push(row)
    else dated.push(row)
  }
  const groups = groupByLocalDate(
    dated,
    row => row.lastUsedAt ?? 0,
    (a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0) || String(a.key).localeCompare(String(b.key)),
    now,
  )
  if (undated.length > 0) groups.push({ dateKey: '', dayOffset: Number.POSITIVE_INFINITY, rows: [...undated] })
  return groups
}

/** Case-insensitive local title/workspace matching used beside Host content search. */
export function localMatches(rows: readonly SessionRow[], query: string): SessionRow[] {
  const normalized = query.trim().toLocaleLowerCase()
  if (normalized === '') return []
  return rows.filter(row => `${row.title}\n${row.workspaceTitle}`.toLocaleLowerCase().includes(normalized))
}
