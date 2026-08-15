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
  /** Whether the session has a durable log-backed title (summary.title !== undefined). */
  hasTitle: boolean
  blank: boolean
  running: boolean
  pendingInteraction?: SessionSummary['pendingInteraction']
  completed: boolean
  updatedAt: number
  workspaceKey: WorkspaceId | typeof UNGROUPED
  workspaceTitle: string
}

/** One first-level workspace row. */
export interface WorkspaceRow {
  key: WorkspaceId | typeof UNGROUPED
  title: string
  path?: string
  createdAt?: string
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
    hasTitle: summary.title !== undefined,
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

/** Derive first-level real workspaces plus the virtual Ungrouped row. */
export function deriveWorkspaces(
  list: SessionListState,
  workspaces: readonly WorkspaceView[],
  archivedSessionIds: readonly SessionId[],
): WorkspaceRow[] {
  const archived = new Set(archivedSessionIds)
  const accounted = new Set<SessionId>()
  const result = workspaces.map((workspace): WorkspaceRow => {
    let count = 0
    for (const id of workspace.sessionIds) {
      accounted.add(id)
      const summary = list.byId[id]
      if (summary !== undefined && visible(summary, list.current, archived)) count++
    }
    return {
      key: workspace.workspaceId,
      title: workspace.title,
      path: workspace.path,
      createdAt: workspace.createdAt,
      count,
      real: true,
    }
  })
  let ungrouped = 0
  for (const id of list.ids) {
    const summary = list.byId[id]
    if (summary !== undefined && !accounted.has(id) && visible(summary, list.current, archived)) ungrouped++
  }
  result.push({ key: UNGROUPED, title: 'Ungrouped', count: ungrouped, real: false })
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

/** Case-insensitive local title/workspace matching used beside Host content search. */
export function localMatches(rows: readonly SessionRow[], query: string): SessionRow[] {
  const normalized = query.trim().toLocaleLowerCase()
  if (normalized === '') return []
  return rows.filter(row => `${row.title}\n${row.workspaceTitle}`.toLocaleLowerCase().includes(normalized))
}
