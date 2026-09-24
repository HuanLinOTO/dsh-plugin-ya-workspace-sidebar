import { Context } from '@deepseek-ai/cordis'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  ISessions, SessionListState, SessionSummary,
} from '@deepseek-ai/dsh-api-session-controller/client'
import type { ClientRemote, DirectoryListing } from '@deepseek-ai/dsh-api-remotes/client'
import type {
  IWorkspaces, WorkspaceId, WorkspaceSnapshot, WorkspaceView,
} from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { YaWorkspaceNavigation } from '../src/client/navigation.ts'

const sid = (value: string) => value as SessionId
const wid = (value: string) => value as WorkspaceId

/** Minimal localStorage shim so the persisted selection store works under node. */
class MemoryStorage {
  private readonly map = new Map<string, string>()
  getItem(key: string): string | null { return this.map.get(key) ?? null }
  setItem(key: string, value: string): void { this.map.set(key, value) }
  removeItem(key: string): void { this.map.delete(key) }
  clear(): void { this.map.clear() }
}

beforeEach(() => {
  (globalThis as { localStorage?: unknown }).localStorage = new MemoryStorage()
})

afterEach(() => {
  vi.restoreAllMocks()
  delete (globalThis as { localStorage?: unknown }).localStorage
})

function workspace(
  id: string,
  sessionIds: readonly SessionId[] = [],
  createdAt = '2026-01-01T00:00:00.000Z',
): WorkspaceView {
  return {
    workspaceId: wid(id),
    path: `/w/${id}`,
    title: id,
    sessionIds,
    createdAt,
    updatedAt: createdAt,
  }
}

function summary(id: string, overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    id: sid(id),
    displayTitle: id,
    running: false,
    blank: false,
    updatedAt: 0,
    ...overrides,
  }
}

function sessionState(
  summaries: readonly SessionSummary[] = [],
  phase: SessionListState['phase'] = 'ready',
): SessionListState {
  return {
    ids: summaries.map(item => item.id),
    byId: Object.fromEntries(summaries.map(item => [item.id, item])),
    phase,
    projectionsBySession: {},
  } as unknown as SessionListState
}

function workspaceState(
  items: WorkspaceSnapshot['items'] = [],
  archivedSessionIds: readonly SessionId[] = [],
  phase: WorkspaceSnapshot['phase'] = 'ready',
): WorkspaceSnapshot {
  return {
    items,
    archivedSessionIds,
    phase,
    state: phase === 'ready' ? 'idle' : 'loading',
    error: null,
  }
}

class MutableSource<T> {
  private readonly listeners = new Set<() => void>()

  constructor(private value: T) {}

  getSnapshot(): T {
    return this.value
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  update(update: (value: T) => T): void {
    this.value = update(this.value)
    for (const listener of [...this.listeners]) listener()
  }
}

class FakeSessions {
  readonly list: MutableSource<SessionListState>
  readonly create: ReturnType<typeof vi.fn<ISessions['create']>>
  /** Retained SessionReferences, in retain order. */
  readonly retained: SessionId[] = []
  readonly released: SessionId[] = []
  readonly fork: ReturnType<typeof vi.fn<ISessions['fork']>>

  constructor(initial: SessionListState) {
    this.list = new MutableSource(initial)
    this.create = vi.fn<ISessions['create']>(async options =>
      options?.sessionId ?? sid(`created-${String(options?.workspaceId ?? 'none')}`))
    this.fork = vi.fn<ISessions['fork']>(async options => sid(`forked-${String(options.sessionId)}`))
  }

  retain(target: SessionId | { readonly sessionId?: SessionId }): { sessionId: SessionId; release: () => void } {
    const sessionId = (typeof target === 'string' ? target : target.sessionId) ?? sid('unknown')
    this.retained.push(sessionId)
    return {
      sessionId,
      release: () => { this.released.push(sessionId) },
    }
  }

  subagentAddress(): undefined {
    return undefined
  }
}

class FakeWorkspaces {
  readonly list: MutableSource<WorkspaceSnapshot>
  readonly archiveCalls: SessionId[] = []

  constructor(initial: WorkspaceSnapshot) {
    this.list = new MutableSource(initial)
  }

  archiveSession(sessionId: SessionId): Promise<void> {
    this.archiveCalls.push(sessionId)
    this.list.update(state => ({
      ...state,
      archivedSessionIds: [...state.archivedSessionIds, sessionId],
    }))
    return Promise.resolve()
  }
}

const listing: DirectoryListing = {
  path: '/home/u',
  home: '/home/u',
  crumbs: [{ name: '/', path: '/', hidden: false }],
  entries: [{ name: 'project', path: '/home/u/project', hidden: false }],
  truncated: false,
}

class FakeDirectoryPicker {
  readonly calls: string[] = []

  onPick: () => Promise<RemoteResult<string | null>> = () => Promise.resolve({ ok: true, value: null })
  onList: () => Promise<RemoteResult<DirectoryListing>> = () => Promise.resolve({ ok: true, value: listing })
  onCreateDirectory: () => Promise<RemoteResult<string>> =
    () => Promise.resolve({ ok: true, value: '/home/u/new' })

  readonly remote: ClientRemote['directoryPicker'] = {
    pick: () => this.record('pick', this.onPick()),
    list: (path?: string) => this.record(`list:${String(path)}`, this.onList()),
    createDirectory: (path: string, name: string) =>
      this.record(`createDirectory:${path}/${name}`, this.onCreateDirectory()),
  }

  private record<T>(label: string, result: Promise<T>): Promise<T> {
    this.calls.push(label)
    return result
  }
}

function bench(options: {
  workspaces?: WorkspaceSnapshot
  sessions?: SessionListState
} = {}) {
  const ctx = new Context()
  let pending = new AbortController()
  const selectPanel = vi.fn(() => { pending.abort() })
  ctx.provide('layout', {
    selectPanel,
    beginNavigation: () => {
      pending.abort()
      pending = new AbortController()
      return pending.signal
    },
    toggleSidebar: () => {},
    openRightbar: () => {},
    closeRightbar: () => {},
  })
  const directoryPicker = new FakeDirectoryPicker()
  const workspaces = new FakeWorkspaces(options.workspaces ?? workspaceState())
  const sessions = new FakeSessions(options.sessions ?? sessionState())
  const navigation = new YaWorkspaceNavigation(
    ctx,
    directoryPicker.remote,
    workspaces as unknown as IWorkspaces,
    sessions as unknown as ISessions,
  )
  return { ctx, directoryPicker, sessions, navigation, workspaces, selectPanel }
}

const settle = (): Promise<void> => new Promise(resolve => { setTimeout(resolve, 0) })

describe('uiWorkspace stand-in', () => {
  it('registers the service so injected UI domains stop pending', () => {
    const { ctx } = bench()
    expect(ctx.get('uiWorkspace')).toBeDefined()
  })

  it('reuses an unarchived member blank and coalesces concurrent creation', async () => {
    const { navigation, sessions, workspaces } = bench({
      workspaces: workspaceState([workspace('alpha', [sid('blank-a')])]),
      sessions: sessionState([summary('blank-a', { blank: true, cwd: '/w/alpha' })]),
    })
    await settle()
    sessions.create.mockClear()
    // 0.1.7 adopts a reusable blank through `create({workspaceId, sessionId})`.
    await expect(navigation.connectWorkspace(wid('alpha'))).resolves.toBe(sid('blank-a'))
    expect(sessions.create).toHaveBeenCalledWith({ workspaceId: wid('alpha'), sessionId: sid('blank-a') })

    sessions.create.mockClear()
    workspaces.list.update(state => ({
      ...state,
      items: [...state.items, workspace('beta')],
    }))
    const [first, second] = [navigation.connectWorkspace(wid('beta')), navigation.connectWorkspace(wid('beta'))]
    await expect(first).resolves.toBe(sid('created-beta'))
    await expect(second).resolves.toBe(sid('created-beta'))
    expect(sessions.create).toHaveBeenCalledTimes(1)
  })

  it('rejects an unknown workspace', async () => {
    const { navigation } = bench()
    await expect(navigation.connectWorkspace(wid('ghost')))
      .rejects.toThrow('ya-workspace-sidebar: unknown workspace "ghost"')
  })

  it('startSession targets the explicit workspace', async () => {
    const { navigation, sessions } = bench({
      workspaces: workspaceState([workspace('alpha')]),
    })
    navigation.startSession(wid('alpha'))
    await settle()
    expect(sessions.create).toHaveBeenCalledWith({ workspaceId: wid('alpha') })
    expect(sessions.retained).toContain(sid('created-alpha'))
  })

  it('unscoped startSession inherits the current session workspace before recency', async () => {
    const inherited = bench({
      workspaces: workspaceState([workspace('alpha'), workspace('beta', [sid('b-one')])]),
      sessions: sessionState([summary('b-one', { updatedAt: 1 })]),
    })
    // Select b-one first; the current selection now lives in the service.
    inherited.navigation.openSession(sid('b-one'))
    inherited.navigation.startSession()
    await settle()
    expect(inherited.sessions.create).toHaveBeenCalledWith({ workspaceId: wid('beta') })

    const recent = bench({
      workspaces: workspaceState([
        workspace('alpha', [sid('a-old')], '2026-01-01T00:00:00.000Z'),
        workspace('beta', [sid('b-new')]),
      ]),
      sessions: sessionState([
        summary('a-old', { updatedAt: 1 }),
        summary('b-new', { updatedAt: 9 }),
      ]),
    })
    recent.navigation.startSession()
    await settle()
    expect(recent.sessions.create).toHaveBeenCalledWith({ workspaceId: wid('beta') })
  })

  it('startSession clears the selection when no workspace is available', () => {
    const { navigation, sessions, selectPanel } = bench()
    navigation.openSession(sid('some-session'))
    navigation.startSession()
    expect(navigation.currentSessionId).toBeUndefined()
    expect(sessions.create).not.toHaveBeenCalled()
    expect(selectPanel).toHaveBeenCalledWith(null)
  })

  it('openSession selects before revealing the Conversation panel', () => {
    const { navigation, sessions, selectPanel } = bench()
    navigation.openSession(sid('target'))
    expect(navigation.currentSessionId).toBe(sid('target'))
    expect(sessions.retained).toContain(sid('target'))
    expect(selectPanel).toHaveBeenCalledWith(null)
  })

  it('openWorkspace connects, runs preparation, then opens', async () => {
    const { navigation, sessions } = bench({
      workspaces: workspaceState([workspace('alpha')]),
      sessions: sessionState([summary('current')]),
    })
    const beforeOpen = vi.fn()
    await navigation.openWorkspace(wid('alpha'), beforeOpen)
    expect(sessions.create).toHaveBeenCalledWith({ workspaceId: wid('alpha') })
    expect(beforeOpen).toHaveBeenCalledWith(sid('created-alpha'))
    expect(navigation.currentSessionId).toBe(sid('created-alpha'))
  })

  it('skips opening a superseded openWorkspace request', async () => {
    const { navigation, sessions, selectPanel } = bench({
      workspaces: workspaceState([workspace('alpha')]),
      sessions: sessionState([summary('current')]),
    })
    await navigation.openWorkspace(wid('alpha'), () => { selectPanel('panel-a' as never) })
    expect(selectPanel).toHaveBeenCalledWith('panel-a')
    expect(navigation.currentSessionId).toBeUndefined()
    // The superseded request retains then releases the prepared reference.
    expect(sessions.released).toContain(sid('created-alpha'))
  })

  it('forkSession forks with an incremented title without changing the selection', async () => {
    const { navigation, sessions } = bench()
    await navigation.forkSession(sid('source'))
    expect(sessions.fork).toHaveBeenCalledWith({ sessionId: sid('source'), increaseTitle: true })
    expect(sessions.retained).not.toContain(sid('forked-source'))
  })

  it('delegates archiving to the Workspace Controller', async () => {
    const { navigation, workspaces } = bench()
    await navigation.archiveSession(sid('idle'))
    expect(workspaces.archiveCalls).toEqual([sid('idle')])
  })

  it('delegates unarchive/pin/unpin to the Workspace Controller', async () => {
    const { navigation, workspaces } = bench()
    const calls: string[] = []
    ;(workspaces as unknown as Record<string, unknown>).unarchiveSession = (id: SessionId) => { calls.push(`unarchive:${String(id)}`); return Promise.resolve() }
    ;(workspaces as unknown as Record<string, unknown>).pinSession = (id: SessionId) => { calls.push(`pin:${String(id)}`); return Promise.resolve() }
    ;(workspaces as unknown as Record<string, unknown>).unpinSession = (id: SessionId) => { calls.push(`unpin:${String(id)}`); return Promise.resolve() }
    await navigation.unarchiveSession(sid('s'))
    await navigation.pinSession(sid('s'))
    await navigation.unpinSession(sid('s'))
    expect(calls).toEqual(['unarchive:s', 'pin:s', 'unpin:s'])
  })

  it('drives the directory-picking wire and maps failures', async () => {
    const ok = bench()
    await expect(ok.navigation.pickDirectory()).resolves.toBeNull()
    ok.directoryPicker.onPick = () => Promise.resolve({ ok: true, value: '/w/alpha' })
    await expect(ok.navigation.pickDirectory()).resolves.toBe('/w/alpha')
    await expect(ok.navigation.listDirectory()).resolves.toEqual(listing)
    await expect(ok.navigation.listDirectory('/home/u')).resolves.toEqual(listing)
    await expect(ok.navigation.createDirectory('/home/u', 'new')).resolves.toBe('/home/u/new')
    expect(ok.directoryPicker.calls).toContain('list:/home/u')
    expect(ok.directoryPicker.calls).toContain('createDirectory:/home/u/new')

    const denied = bench()
    denied.directoryPicker.onPick = () =>
      Promise.resolve({ ok: false, error: { code: 'E_PICKER', message: 'no chooser' } })
    denied.directoryPicker.onList = () =>
      Promise.resolve({ ok: false, error: { code: 'E_LIST', message: 'denied' } })
    denied.directoryPicker.onCreateDirectory = () =>
      Promise.resolve({ ok: false, error: { code: 'E_CREATE', message: 'conflict' } })
    await expect(denied.navigation.pickDirectory()).rejects.toThrow('directory picker failed: no chooser')
    await expect(denied.navigation.listDirectory('/private'))
      .rejects.toThrow('directory browse failed: E_LIST: denied')
    await expect(denied.navigation.createDirectory('/home/u', 'new'))
      .rejects.toThrow('directory browse failed: E_CREATE: conflict')
  })
})

describe('navigation policy', () => {
  it('auto-opens the most recent workspace when boot leaves no current session', async () => {
    const { sessions, workspaces } = bench({
      workspaces: workspaceState(
        [workspace('alpha', [sid('a-old')], '2026-01-01T00:00:00.000Z'), workspace('beta', [sid('b-new')])],
      ),
      sessions: sessionState([
        summary('a-old', { updatedAt: 1 }),
        summary('b-new', { updatedAt: 9 }),
      ]),
    })
    workspaces.list.update(state => ({ ...state }))
    await settle()
    expect(sessions.create).toHaveBeenCalledWith({ workspaceId: wid('beta') })
    expect(sessions.retained).toContain(sid('created-beta'))

    sessions.create.mockClear()
    sessions.retained.length = 0
    workspaces.list.update(state => ({ ...state }))
    await settle()
    expect(sessions.retained).toEqual([])
    expect(sessions.create).not.toHaveBeenCalled()
  })

  it('keeps a persisted current selection untouched', async () => {
    globalThis.localStorage?.setItem('dsh.sessions.current', JSON.stringify({ sessionId: 'a-one' }))
    const { sessions } = bench({
      workspaces: workspaceState([workspace('alpha', [sid('a-one')])]),
      sessions: sessionState([summary('a-one')]),
    })
    await settle()
    expect(sessions.create).not.toHaveBeenCalled()
    expect(sessions.retained).toContain(sid('a-one'))
  })

  it('waits for both projections to become ready before selecting', async () => {
    const { sessions, workspaces } = bench({
      workspaces: workspaceState([workspace('alpha', [sid('a-one')])], [], 'pending'),
      sessions: sessionState([summary('a-one')], 'ready'),
    })
    await settle()
    expect(sessions.retained).not.toContain(sid('created-alpha'))

    workspaces.list.update(state => ({ ...state, phase: 'ready', state: 'idle' }))
    await settle()
    expect(sessions.retained).toContain(sid('created-alpha'))
  })

  it('clears the current selection when it gets archived', async () => {
    const { sessions, workspaces, navigation, selectPanel } = bench({
      workspaces: workspaceState([workspace('alpha', [sid('a-one')])]),
      sessions: sessionState([summary('a-one')]),
    })
    workspaces.list.update(state => ({ ...state }))
    await settle()
    navigation.openSession(sid('a-one'))
    selectPanel.mockClear()

    await navigation.archiveSession(sid('a-one'))
    await settle()
    expect(navigation.currentSessionId).toBeUndefined()
    expect(selectPanel).toHaveBeenCalledWith(null)
  })
})
