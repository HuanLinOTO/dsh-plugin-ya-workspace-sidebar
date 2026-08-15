import { describe, expect, it } from 'vitest'
import type {
  SessionId, SessionListState, SessionSummary, WorkspaceId, WorkspaceView,
} from '@deepseek-ai/dsh-client-runtime/client'
import {
  deriveRecent, deriveWorkspaceSessions, deriveWorkspaces, localMatches,
  UNGROUPED, workspaceKeyForSession,
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

  it('lists real workspaces followed by virtual Ungrouped', () => {
    const rows = [session('a-old', 1), session('a-new', 2), session('b-one', 3), session('stray', 4)]
    const result = deriveWorkspaces(list(rows), workspaces, [sid('a-old')])
    expect(result.map(row => [row.key, row.count, row.real])).toEqual([
      [wid('alpha'), 1, true],
      [wid('beta'), 1, true],
      [UNGROUPED, 1, false],
    ])
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

  it('flags hasTitle from summary.title so cold sessions without a title can show a placeholder', () => {
    // Cold session: no durable title → displayTitle falls back to the cwd basename
    // (workspace name), but hasTitle is false so the row can render "未命名会话".
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
    expect(coldRow?.hasTitle).toBe(false)
    expect(coldRow?.title).toBe('Alpha') // displayTitle retained for rename draft prefill
    expect(warmRow?.hasTitle).toBe(true)
    expect(warmRow?.title).toBe('Fix the parser bug')
    expect(blankRow?.hasTitle).toBe(false) // blank sessions never carry a title
    expect(blankRow?.title).toBe('New Session')
  })
})
