import { describe, expect, it } from 'vitest'
import type {
  SessionId, SessionListState, SessionSummary, WorkspaceId, WorkspaceView,
} from '@deepseek-ai/dsh-client-runtime/client'
import {
  deriveRecent, deriveWorkspaceGroups, deriveWorkspaceSessionGroups, deriveWorkspaceSessions,
  deriveWorkspaces, localMatches, UNGROUPED, workspaceKeyForSession,
} from '../src/client/model.ts'

const sid = (value: string) => value as SessionId
const wid = (value: string) => value as WorkspaceId

function session(id: string, updatedAt: number, overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    id: sid(id),
    displayTitle: id,
    running: false,
    blank: false,
    updatedAt,
    ...overrides,
  }
}

function list(rows: SessionSummary[], current?: SessionId): SessionListState {
  return {
    ids: rows.map(row => row.id),
    byId: Object.fromEntries(rows.map(row => [row.id, row])) as Record<SessionId, SessionSummary>,
    current,
  }
}

const workspaces: WorkspaceView[] = [
  {
    workspaceId: wid('alpha'),
    title: 'Alpha',
    path: 'C:/alpha',
    createdAt: '2026-08-01T00:00:00.000Z',
    sessionIds: [sid('a-old'), sid('a-new')],
  },
  {
    workspaceId: wid('beta'),
    title: 'Beta',
    path: 'C:/beta',
    createdAt: '2026-08-02T00:00:00.000Z',
    sessionIds: [sid('b-one')],
  },
]

describe('sidebar projections', () => {
  it('derives five global recent rows and preserves official visibility filters', () => {
    const rows = [
      session('a-old', 1), session('a-new', 9), session('b-one', 8),
      session('stray', 7), session('four', 6), session('five', 5), session('six', 4),
      session('archived', 100), session('child', 101, { origin: 'subagent' }),
      session('blank-hidden', 102, { blank: true }),
      session('blank-current', 103, { blank: true }),
    ]
    const result = deriveRecent(list(rows, sid('blank-current')), workspaces, [sid('archived')])
    expect(result.map(row => row.id)).toEqual([
      sid('blank-current'), sid('a-new'), sid('b-one'), sid('stray'), sid('four'),
    ])
    expect(result.find(row => row.id === sid('stray'))?.workspaceKey).toBe(UNGROUPED)
  })

  it('sorts workspaces and Ungrouped by newest visible session activity', () => {
    const rows = [session('a-old', 1), session('a-new', 2), session('b-one', 3), session('stray', 4)]
    const result = deriveWorkspaces(list(rows), workspaces, [sid('a-old')])
    expect(result.map(row => [row.key, row.count, row.real, row.lastUsedAt])).toEqual([
      [UNGROUPED, 1, false, 4],
      [wid('beta'), 1, true, 3],
      [wid('alpha'), 1, true, 2],
    ])
  })

  it('falls empty real workspaces back to createdAt and sinks missing lastUsedAt', () => {
    const empty: WorkspaceView[] = [
      { workspaceId: wid('gamma'), title: 'Gamma', path: 'C:/gamma', createdAt: '2026-08-03T00:00:00.000Z', sessionIds: [] },
      { workspaceId: wid('delta'), title: 'Delta', path: 'C:/delta', sessionIds: [] },
    ]
    const result = deriveWorkspaces(list([]), empty, [])
    expect(result.map(row => row.key)).toEqual([wid('gamma'), UNGROUPED, wid('delta')])
    expect(result[0].lastUsedAt).toBe(Date.parse('2026-08-03T00:00:00.000Z'))
    expect(result[1].lastUsedAt).toBeUndefined()
    expect(result[2].lastUsedAt).toBeUndefined()
  })

  it('groups root workspaces by local calendar date of lastUsedAt', () => {
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    const now = today.getTime()
    const noonOn = (dayOffset: number): number =>
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOffset, 12, 0, 0, 0).getTime()
    const rows = [
      session('a-old', noonOn(2)),
      session('a-new', noonOn(2) + 1000),
      session('b-one', now - 1000),
      session('stray', noonOn(1) + 1000),
    ]
    const groups = deriveWorkspaceGroups(deriveWorkspaces(list(rows), workspaces, []), now)
    expect(groups.map(g => g.dayOffset)).toEqual([0, 1, 2])
    expect(groups[0].rows.map(r => r.key)).toEqual([wid('beta')])
    expect(groups[1].rows.map(r => r.key)).toEqual([UNGROUPED])
    expect(groups[2].rows.map(r => r.key)).toEqual([wid('alpha')])
  })

  it('trails undated workspace rows without a date header', () => {
    const empty: WorkspaceView[] = [
      { workspaceId: wid('gamma'), title: 'Gamma', path: 'C:/gamma', createdAt: '2026-08-03T00:00:00.000Z', sessionIds: [] },
      { workspaceId: wid('delta'), title: 'Delta', path: 'C:/delta', sessionIds: [] },
    ]
    const now = Date.parse('2026-08-10T12:00:00.000Z')
    const groups = deriveWorkspaceGroups(deriveWorkspaces(list([]), empty, []), now)
    expect(groups).toHaveLength(2)
    expect(groups[0].dateKey).not.toBe('')
    expect(groups[0].rows.map(r => r.key)).toEqual([wid('gamma')])
    expect(groups[1].dateKey).toBe('')
    expect(groups[1].rows.map(r => r.key)).toEqual([UNGROUPED, wid('delta')])
  })

  it('keeps canonical workspace order and uses recency for Ungrouped', () => {
    const rows = [
      session('a-old', 1), session('a-new', 99), session('b-one', 3),
      session('stray-old', 4), session('stray-new', 8),
    ]
    const state = list(rows)
    expect(deriveWorkspaceSessions(wid('alpha'), state, workspaces, []).map(row => row.id))
      .toEqual([sid('a-old'), sid('a-new')])
    expect(deriveWorkspaceSessions(UNGROUPED, state, workspaces, []).map(row => row.id))
      .toEqual([sid('stray-new'), sid('stray-old')])
  })

  it('resolves navigation and local search context', () => {
    expect(workspaceKeyForSession(sid('a-new'), workspaces)).toBe(wid('alpha'))
    expect(workspaceKeyForSession(sid('stray'), workspaces)).toBe(UNGROUPED)
    expect(workspaceKeyForSession(undefined, workspaces)).toBeNull()
    const rows = deriveRecent(list([session('a-new', 2), session('stray', 1)]), workspaces, [], 20)
    expect(localMatches(rows, 'alpha').map(row => row.id)).toEqual([sid('a-new')])
  })

  it('uses displayTitle for non-blank rows so cold sessions fall back to the cwd basename across restarts', () => {
    // Cold session: no durable title in the projection cache → displayTitle
    // falls back to the cwd basename (workspace name). The row surfaces it
    // directly: stable across restarts, no host-cache dependency.
    const cold = session('cold', 1, { displayTitle: 'Alpha' })
    // Warm session: durable title projected by the host.
    const warm = session('warm', 2, { title: 'Fix the parser bug', displayTitle: 'Fix the parser bug' })
    // Blank session: never has a title; the renderer substitutes "New Session".
    // Blank rows are only visible when current, so blank must be the selected session.
    const blank = session('blank', 3, { displayTitle: 'Alpha', blank: true })
    const result = deriveRecent(list([cold, warm, blank], sid('blank')), workspaces, [], 20)
    const coldRow = result.find(row => row.id === sid('cold'))
    const warmRow = result.find(row => row.id === sid('warm'))
    const blankRow = result.find(row => row.id === sid('blank'))
    expect(coldRow?.title).toBe('Alpha') // displayTitle: cwd basename fallback, stable across restarts
    expect(warmRow?.title).toBe('Fix the parser bug') // real title when host cache has it
    expect(blankRow?.title).toBe('New Session') // blank always shows the placeholder
  })
})

describe('deriveWorkspaceSessionGroups', () => {
  // Anchor "today" at local noon to dodge DST/midnight edge cases.
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const now = today.getTime()
  const noonOn = (dayOffset: number): number =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOffset, 12, 0, 0, 0).getTime()
  const yesterday = noonOn(1)
  const twoDaysAgo = noonOn(2)

  const groupedWorkspaces: WorkspaceView[] = [
    {
      workspaceId: wid('alpha'),
      title: 'Alpha',
      path: 'C:/alpha',
      createdAt: '2026-08-01T00:00:00.000Z',
      sessionIds: [sid('a-today-early'), sid('a-today-late'), sid('a-yesterday'), sid('a-old')],
    },
    {
      workspaceId: wid('beta'),
      title: 'Beta',
      path: 'C:/beta',
      createdAt: '2026-08-02T00:00:00.000Z',
      sessionIds: [sid('b-one')],
    },
  ]

  it('groups by local calendar date with newest date first', () => {
    const rows = [
      session('a-old', twoDaysAgo + 1000),
      session('a-today-late', now - 1000),
      session('a-yesterday', yesterday + 1000),
      session('a-today-early', now - 10_000),
    ]
    const groups = deriveWorkspaceSessionGroups(wid('alpha'), list(rows), groupedWorkspaces, [], now)
    expect(groups.map(g => g.dayOffset)).toEqual([0, 1, 2])
    expect(groups[0].rows.map(r => r.id)).toEqual([sid('a-today-late'), sid('a-today-early')])
    expect(groups[1].rows.map(r => r.id)).toEqual([sid('a-yesterday')])
    expect(groups[2].rows.map(r => r.id)).toEqual([sid('a-old')])
  })

  it('sorts rows within a group by updatedAt descending with id tiebreak', () => {
    // All three land in today's bucket; verify intra-group ordering.
    const rows = [
      session('a-today-early', now - 10_000),
      session('a-today-late', now - 1000),
      session('a-today-mid', now - 5000),
    ]
    const workspacesToday: WorkspaceView[] = [{
      workspaceId: wid('alpha'),
      title: 'Alpha',
      sessionIds: [sid('a-today-early'), sid('a-today-late'), sid('a-today-mid')],
    }]
    const groups = deriveWorkspaceSessionGroups(wid('alpha'), list(rows), workspacesToday, [], now)
    expect(groups).toHaveLength(1)
    expect(groups[0].rows.map(r => r.id)).toEqual([sid('a-today-late'), sid('a-today-mid'), sid('a-today-early')])
  })

  it('preserves visibility filters (archived / subagent / blank)', () => {
    const rows = [
      session('a-today-late', now - 1000),
      session('a-today-early', now - 10_000, { origin: 'subagent' }),
      session('a-yesterday', yesterday + 1000, { blank: true }),
      session('a-old', twoDaysAgo + 1000),
    ]
    const state = list(rows, sid('a-yesterday'))
    const groups = deriveWorkspaceSessionGroups(wid('alpha'), state, groupedWorkspaces, [sid('a-old')], now)
    const ids = groups.flatMap(g => g.rows.map(r => r.id))
    // subagent filtered, archived filtered, blank visible only because it's current.
    // Today's bucket comes before yesterday's bucket.
    expect(ids).toEqual([sid('a-today-late'), sid('a-yesterday')])
  })

  it('computes dayOffset for today / yesterday / earlier buckets', () => {
    const rows = [
      session('a-today-late', now - 1000),
      session('a-yesterday', yesterday + 1000),
      session('a-old', twoDaysAgo + 1000),
    ]
    const groups = deriveWorkspaceSessionGroups(wid('alpha'), list(rows), groupedWorkspaces, [], now)
    const byId = Object.fromEntries(groups.map(g => [g.dayOffset, g.dateKey]))
    expect(byId[0]).toBeDefined()
    expect(byId[1]).toBeDefined()
    expect(byId[2]).toBeDefined()
    // dateKey follows YYYY-MM-DD; dayOffset 0 must equal today's local date.
    const todayKey = (() => {
      const d = new Date(now)
      const mm = d.getMonth() < 9 ? `0${d.getMonth() + 1}` : `${d.getMonth() + 1}`
      const dd = d.getDate() < 10 ? `0${d.getDate()}` : `${d.getDate()}`
      return `${d.getFullYear()}-${mm}-${dd}`
    })()
    expect(byId[0]).toBe(todayKey)
  })

  it('clamps future timestamps to today', () => {
    const rows = [
      session('a-future', now + 86_400_000), // 1 day in the future
      session('a-today-late', now - 1000),
    ]
    // Replace a-old in the workspace with a-future so it's actually visible.
    const workspacesWithFuture: WorkspaceView[] = [{
      workspaceId: wid('alpha'),
      title: 'Alpha',
      sessionIds: [sid('a-future'), sid('a-today-late')],
    }]
    const groups = deriveWorkspaceSessionGroups(wid('alpha'), list(rows), workspacesWithFuture, [], now)
    expect(groups).toHaveLength(1)
    expect(groups[0].dayOffset).toBe(0)
    expect(groups[0].rows.map(r => r.id)).toEqual([sid('a-future'), sid('a-today-late')])
  })

  it('returns empty array for Ungrouped key (caller falls back to flat logic)', () => {
    const rows = [session('stray', now - 1000)]
    expect(deriveWorkspaceSessionGroups(UNGROUPED, list(rows), groupedWorkspaces, [], now)).toEqual([])
  })

  it('returns empty array for unknown workspace id', () => {
    const rows = [session('a-today-late', now - 1000)]
    expect(deriveWorkspaceSessionGroups(wid('missing'), list(rows), groupedWorkspaces, [], now)).toEqual([])
  })

  it('returns empty array when the workspace has no visible sessions', () => {
    const rows = [session('a-today-late', now - 1000)]
    expect(deriveWorkspaceSessionGroups(wid('alpha'), list(rows), groupedWorkspaces, [sid('a-today-late')], now)).toEqual([])
  })

  it('Ungrouped still uses deriveWorkspaceSessions for its flat recency list', () => {
    // Sanity check: the parallel code path for Ungrouped is unchanged.
    const rows = [
      session('stray-old', now - 86_400_000),
      session('stray-new', now - 1000),
    ]
    const state = list(rows)
    expect(deriveWorkspaceSessions(UNGROUPED, state, groupedWorkspaces, []).map(r => r.id))
      .toEqual([sid('stray-new'), sid('stray-old')])
  })
})
