/** Pure sidebar projections shared by the browser and unit tests. */
import type {
  SessionId, SessionListState, SessionSummary, WorkspaceId, WorkspaceView,
} from '@deepseek-ai/dsh-client-runtime/client'

/** Navigation key for sessions not accounted to a real workspace. */
export const UNGROUPED = '__ya_ungrouped__' as const

/** One sidebar session row. */
export interface SessionRow {
  id: SessionId
  title: string
  blank: boolean
  running: boolean
  pendingInteraction?: SessionSummary['pendingInteraction']
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
): SessionRow {
  return {
    id: summary.id,
    title: summary.blank ? 'New Session' : summary.displayTitle,
    blank: summary.blank,
    running: summary.running,
    ...(summary.pendingInteraction === undefined ? {} : { pendingInteraction: summary.pendingInteraction }),
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
      return rowOf(summary, workspace?.workspaceId ?? UNGROUPED, workspace?.title ?? 'Ungrouped')
    })
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
      .map(summary => rowOf(summary, UNGROUPED, 'Ungrouped'))
  }
  const workspace = workspaces.find(item => item.workspaceId === key)
  if (workspace === undefined) return []
  return workspace.sessionIds
    .map(id => list.byId[id])
    .filter((summary): summary is SessionSummary => summary !== undefined && visible(summary, list.current, archived))
    .map(summary => rowOf(summary, workspace.workspaceId, workspace.title))
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
  now: number,
): SessionDateGroup[] {
  if (key === UNGROUPED) return []
  const workspace = workspaces.find(item => item.workspaceId === key)
  if (workspace === undefined) return []
  const archived = new Set(archivedSessionIds)
  const rows = workspace.sessionIds
    .map(id => list.byId[id])
    .filter((summary): summary is SessionSummary => summary !== undefined && visible(summary, list.current, archived))
    .map(summary => rowOf(summary, workspace.workspaceId, workspace.title))
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
