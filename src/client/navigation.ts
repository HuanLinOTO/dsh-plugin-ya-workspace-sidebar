/**
 * Stand-in for the `uiWorkspace` navigation service owned by the official
 * ui-workspace client entry, which this bundle's patch disables.
 *
 * Since DSH v0.1.2-alpha.1 the ui-sidebar, ui-conversation, ui-agent-preset,
 * and the composed directory-picker client entries all inject `uiWorkspace`;
 * without a provider their fibers park forever and the whole WebUI boot
 * deadlocks. This port carries the semantics that moved here from the
 * pre-split client runtime: reuse-or-create Workspace connection, the
 * explicit/current/recent New Session fallback, archived-current clearing,
 * boot auto-selection, and the directory-picking wire calls.
 *
 * dsh 0.1.7-rc.1 moved the Session selection out of the Session Controller
 * (`SessionListState.current` / `ISessions.open` / `ISessions.clear` are gone)
 * into this service: a retained `mainReference` plus a persisted selection
 * store (`dsh.sessions.current`). This port mirrors the shipped
 * `UiWorkspaceService` selection mechanics.
 */
import { Service, type Context } from '@deepseek-ai/cordis'
import type {
  ISessions, SessionListState, SessionReference, SessionTarget,
} from '@deepseek-ai/dsh-api-session-controller/client'
import type { ClientRemote, DirectoryListing } from '@deepseek-ai/dsh-api-remotes/client'
import type {
  IWorkspaces, WorkspaceId, WorkspaceView,
} from '@deepseek-ai/dsh-api-workspace-controller/client'
// Type-only: the official service face this plugin replaces. The stand-in
// satisfies the same members so every official consumer keeps compiling.
import type { UiWorkspace } from '@deepseek-ai/dsh-client-ui-workspace/client'
// Type-only: pulls the layout service merge (ctx.layout) used by navigation.
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
// Type-only: pulls the ui-session Context merge and the `mainView` reference
// source this service retains under.
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/** One persisted selection: the current Session and its optional subagent address. */
export interface SessionSelection {
  readonly sessionId?: SessionId
  readonly subagentAddress?: SessionTarget
}

/** Persisted selection store (the official `dsh.sessions.current` key). */
class SelectionStore implements HostObservable<SessionSelection> {
  private readonly listeners = new Set<() => void>()
  private value: SessionSelection

  constructor(private readonly key = 'dsh.sessions.current') {
    this.value = this.read()
  }

  getSnapshot = (): SessionSelection => this.value

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  set = (value: SessionSelection): void => {
    this.value = value
    try { globalThis.localStorage?.setItem(this.key, JSON.stringify(value)) } catch { /* storage unavailable (tests/private mode) */ }
    for (const listener of [...this.listeners]) listener()
  }

  private read(): SessionSelection {
    try {
      const raw = globalThis.localStorage?.getItem(this.key)
      return raw === null || raw === undefined ? {} : JSON.parse(raw) as SessionSelection
    } catch {
      return {}
    }
  }
}

/** Implements Workspace navigation and directory UI operations. */
export class YaWorkspaceNavigation extends Service implements UiWorkspace {
  private readonly connecting = new Map<WorkspaceId, Promise<SessionId>>()
  private readonly lifetime = new AbortController()
  private readonly selection = new SelectionStore()
  private mainReference: SessionReference | undefined

  /**
   * @param ctx - Client root Context.
   * @param directoryPicker - the directory-picking Remote namespace.
   * @param workspaces - pure Workspace Controller.
   * @param sessions - pure Session Controller.
   */
  constructor(
    ctx: Context,
    private readonly directoryPicker: ClientRemote['directoryPicker'],
    private readonly workspaces: IWorkspaces,
    private readonly sessions: ISessions,
  ) {
    super(ctx, 'uiWorkspace')
    ctx.effect(
      () => this.watchNavigation(),
      'ya-workspace-sidebar: Workspace navigation policy',
    )
  }

  /** The Session currently shown in the main view, or undefined. */
  get currentSessionId(): SessionId | undefined {
    return this.mainReference?.sessionId
  }

  /** Observe the current selection (the sidebar's blank-row filter and highlight). */
  subscribeSelection(listener: () => void): () => void {
    return this.selection.subscribe(listener)
  }

  async connectWorkspace(workspaceId: WorkspaceId): Promise<SessionId> {
    const workspace = this.workspaces.list.getSnapshot().items
      .find(item => item.workspaceId === workspaceId)
    if (workspace === undefined) {
      throw new Error(`ya-workspace-sidebar: unknown workspace "${workspaceId}"`)
    }
    const inflight = this.connecting.get(workspaceId)
    if (inflight !== undefined) return inflight

    const attempt = this.reuseOrCreateBlank(workspace).finally(() => { this.connecting.delete(workspaceId) })
    this.connecting.set(workspaceId, attempt)
    return attempt
  }

  private reuseOrCreateBlank(workspace: WorkspaceView): Promise<SessionId> {
    const archived = this.workspaces.list.getSnapshot().archivedSessionIds
    const sessions = this.sessions.list.getSnapshot()
    for (const id of sessions.ids) {
      const summary = sessions.byId[id]
      if (summary === undefined || !summary.blank || summary.cwd !== workspace.path
        || !workspace.sessionIds.includes(id) || archived.includes(id)) continue
      return this.reuseBlank(workspace.workspaceId, id)
    }
    return this.sessions.create({ workspaceId: workspace.workspaceId })
  }

  private async reuseBlank(workspaceId: WorkspaceId, sessionId: SessionId): Promise<SessionId> {
    try {
      return await this.sessions.create({ workspaceId, sessionId })
    } catch (error) {
      if (!(error instanceof Error) || error.name !== 'SessionCreateError') throw error
      if ((error as { rpcError?: { code?: string } }).rpcError?.code !== 'session/writer-held') throw error
      return this.sessions.create({ workspaceId })
    }
  }

  openSession(target: SessionTarget): void {
    this.replaceMain(target, this.lifetime.signal, 'reveal')
  }

  async openWorkspace(workspaceId: WorkspaceId, beforeOpen?: (sessionId: SessionId) => void): Promise<void> {
    const navigation = AbortSignal.any([this.ctx.layout.beginNavigation(), this.lifetime.signal])
    let sessionId: SessionId
    try {
      sessionId = await this.connectWorkspace(workspaceId)
    } catch (error) {
      if (!navigation.aborted) console.warn('ya-workspace-sidebar: workspace open failed:', error)
      throw error
    }
    if (navigation.aborted) return
    this.replaceMain(sessionId, navigation, 'reveal', beforeOpen)
  }

  async forkSession(sessionId: SessionId): Promise<void> {
    // 0.1.7-rc.1: fork does not change the selection; the child arrives through
    // the Host list and the caller navigates explicitly if it wants to.
    await this.sessions.fork({ sessionId, increaseTitle: true })
  }

  startSession(workspaceId?: WorkspaceId): void {
    const workspaces = this.workspaces.list.getSnapshot()
    const sessions = this.sessions.list.getSnapshot()
    const current = this.mainReference?.sessionId
    const currentWorkspaceId = current === undefined
      ? undefined
      : workspaces.items.find(item => item.sessionIds.includes(current))?.workspaceId
    const recent = workspaces.phase === 'ready' && sessions.phase === 'ready'
      ? recentWorkspace(workspaces.items, sessions.byId)
      : undefined
    const target = workspaceId ?? currentWorkspaceId ?? recent
    if (target === undefined) {
      this.clearMain()
      return
    }
    void this.openWorkspace(target).then(
      () => {},
      (reason: unknown) => { console.warn('ya-workspace-sidebar: new session failed:', reason) },
    )
  }

  async archiveSession(sessionId: SessionId, options: { readonly stopActivity?: boolean } = {}): Promise<void> {
    await this.workspaces.archiveSession(sessionId, options)
    if (this.mainReference?.sessionId === sessionId) this.clearMain()
  }

  async unarchiveSession(sessionId: SessionId): Promise<void> {
    await this.workspaces.unarchiveSession(sessionId)
  }

  async pinSession(sessionId: SessionId): Promise<void> {
    await this.workspaces.pinSession(sessionId)
  }

  async unpinSession(sessionId: SessionId): Promise<void> {
    await this.workspaces.unpinSession(sessionId)
  }

  async pickDirectory(): Promise<string | null> {
    const result = await this.directoryPicker.pick()
    if (!result.ok) throw new Error(`directory picker failed: ${result.error.message}`)
    return result.value
  }

  async listDirectory(path?: string, signal?: AbortSignal): Promise<DirectoryListing> {
    const result = await this.directoryPicker.list(path, signal)
    if (!result.ok) throw new Error(`directory browse failed: ${result.error.code}: ${result.error.message}`)
    return result.value
  }

  async createDirectory(path: string, name: string): Promise<string> {
    const result = await this.directoryPicker.createDirectory(path, name)
    if (!result.ok) throw new Error(`directory browse failed: ${result.error.code}: ${result.error.message}`)
    return result.value
  }

  private watchNavigation(): () => void {
    let initial: 'waiting' | 'connecting' | 'done' = 'waiting'
    const reconcile = (): void => {
      if (this.lifetime.signal.aborted) return
      if (this.clearArchivedCurrent()) return
      if (initial !== 'waiting') return
      const workspaces = this.workspaces.list.getSnapshot()
      const sessions = this.sessions.list.getSnapshot()
      if (workspaces.phase !== 'ready' || sessions.phase !== 'ready') return
      if (this.mainReference !== undefined) {
        initial = 'done'
        return
      }
      initial = 'connecting'
      this.restoreSelection(workspaces, sessions).then(
        () => { initial = 'done' },
        (reason: unknown) => {
          if (this.lifetime.signal.aborted) return
          initial = 'waiting'
          console.warn('ya-workspace-sidebar: initial Session restoration failed:', reason)
        },
      )
    }
    const disposeWorkspaces = this.workspaces.list.subscribe(reconcile)
    const disposeSessions = this.sessions.list.subscribe(reconcile)
    reconcile()
    return () => {
      this.lifetime.abort()
      disposeSessions()
      disposeWorkspaces()
    }
  }

  private async restoreSelection(
    workspaces: ReturnType<IWorkspaces['list']['getSnapshot']>,
    sessions: SessionListState,
  ): Promise<void> {
    const saved = this.selection.getSnapshot()
    if (saved.subagentAddress !== undefined) {
      this.replaceMain(saved.subagentAddress, this.lifetime.signal, 'preserve')
      return
    }
    const summary = saved.sessionId === undefined ? undefined : sessions.byId[saved.sessionId]
    const workspace = summary === undefined ? undefined : workspaces.items.find(item => item.sessionIds.includes(summary.id))
    if (summary !== undefined && (!summary.blank || workspace === undefined)) {
      this.replaceMain(summary.id, this.lifetime.signal, 'preserve')
      return
    }
    const navigation = AbortSignal.any([this.ctx.layout.beginNavigation(), this.lifetime.signal])
    let sessionId: SessionId | undefined
    if (summary !== undefined && workspace !== undefined && summary.cwd === workspace.path
      && !workspaces.archivedSessionIds.includes(summary.id)) {
      sessionId = await this.reuseBlank(workspace.workspaceId, summary.id)
    }
    const target = workspace?.workspaceId ?? recentWorkspace(workspaces.items, sessions.byId)
    if (sessionId === undefined && target !== undefined) sessionId = await this.connectWorkspace(target)
    if (sessionId !== undefined && !navigation.aborted) this.replaceMain(sessionId, navigation, 'preserve')
  }

  /** @returns true when an archived current selection was cleared. */
  private clearArchivedCurrent(): boolean {
    const current = this.mainReference?.sessionId
    if (current === undefined
      || !this.workspaces.list.getSnapshot().archivedSessionIds.includes(current)) return false
    this.clearMain()
    return true
  }

  private clearMain(): void {
    const previous = this.mainReference
    this.mainReference = undefined
    this.selection.set({})
    previous?.release()
    this.ctx.layout.selectPanel(null)
  }

  private replaceMain(
    target: SessionTarget,
    signal: AbortSignal,
    panel: 'reveal' | 'preserve',
    beforeOpen?: (sessionId: SessionId) => void,
  ): void {
    signal.throwIfAborted()
    const reference = this.sessions.retain(target, { source: 'mainView' })
    try {
      signal.throwIfAborted()
      beforeOpen?.(reference.sessionId)
      if (signal.aborted) {
        reference.release()
        return
      }
      const subagentAddress = typeof target === 'string' ? this.sessions.subagentAddress(reference.sessionId) : target
      this.selection.set({
        sessionId: reference.sessionId,
        ...subagentAddress === undefined ? {} : { subagentAddress },
      })
    } catch (error) {
      reference.release()
      throw error
    }
    const previous = this.mainReference
    this.mainReference = reference
    previous?.release()
    if (panel === 'reveal') this.ctx.layout.selectPanel(null)
  }
}

/** Stable tie-breaking follows Host Workspace order. */
function recentWorkspace(
  workspaces: readonly WorkspaceView[],
  sessions: SessionListState['byId'],
): WorkspaceId | undefined {
  let selected: WorkspaceId | undefined
  let selectedTime = Number.NEGATIVE_INFINITY
  for (const workspace of workspaces) {
    let latest = Number.NEGATIVE_INFINITY
    for (const sessionId of workspace.sessionIds) {
      const session = sessions[sessionId]
      if (session !== undefined) latest = Math.max(latest, session.updatedAt)
    }
    if (latest === Number.NEGATIVE_INFINITY) latest = Date.parse(workspace.createdAt)
    if (selected === undefined || latest > selectedTime) {
      selected = workspace.workspaceId
      selectedTime = latest
    }
  }
  return selected
}
