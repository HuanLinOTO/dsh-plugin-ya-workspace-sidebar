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
 */
import { Service, type Context } from '@deepseek-ai/cordis'
import type {
  ISessions, SessionListState,
} from '@deepseek-ai/dsh-api-session-controller/client'
import type { ClientRemote, DirectoryListing } from '@deepseek-ai/dsh-api-remotes/client'
import type {
  IWorkspaces, WorkspaceId, WorkspaceView,
} from '@deepseek-ai/dsh-api-workspace-controller/client'
// Type-only: the official service face this plugin replaces. The stand-in
// satisfies the same members so every official consumer keeps compiling.
import type { UiWorkspace } from '@deepseek-ai/dsh-client-ui-workspace/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/** Implements Workspace navigation and directory UI operations. */
export class YaWorkspaceNavigation extends Service implements UiWorkspace {
  private readonly connecting = new Map<WorkspaceId, Promise<SessionId>>()

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

  async connectWorkspace(workspaceId: WorkspaceId): Promise<SessionId> {
    const workspace = this.workspaces.list.getSnapshot().items
      .find(item => item.workspaceId === workspaceId)
    if (workspace === undefined) {
      throw new Error(`ya-workspace-sidebar: unknown workspace "${workspaceId}"`)
    }
    const inflight = this.connecting.get(workspaceId)
    if (inflight !== undefined) return inflight

    const archived = this.workspaces.list.getSnapshot().archivedSessionIds
    const sessions = this.sessions.list.getSnapshot()
    for (const id of sessions.ids) {
      const summary = sessions.byId[id]
      if (summary !== undefined && summary.blank && summary.cwd === workspace.path
        && workspace.sessionIds.includes(summary.id) && !archived.includes(summary.id)) {
        return summary.id
      }
    }

    const attempt = this.sessions.create({ workspaceId })
      .finally(() => { this.connecting.delete(workspaceId) })
    this.connecting.set(workspaceId, attempt)
    return attempt
  }

  startSession(workspaceId?: WorkspaceId): void {
    const workspaces = this.workspaces.list.getSnapshot()
    const sessions = this.sessions.list.getSnapshot()
    const current = sessions.current
    const currentWorkspaceId = current === undefined
      ? undefined
      : workspaces.items.find(item => item.sessionIds.includes(current))?.workspaceId
    const recent = workspaces.phase === 'ready' && sessions.phase === 'ready'
      ? recentWorkspace(workspaces.items, sessions.byId)
      : undefined
    const target = workspaceId ?? currentWorkspaceId ?? recent
    if (target === undefined) {
      this.sessions.clear()
      return
    }
    void this.connectWorkspace(target).then(
      (sessionId) => { this.sessions.open(sessionId) },
      (reason: unknown) => { console.warn('ya-workspace-sidebar: new session failed:', reason) },
    )
  }

  async archiveSession(sessionId: SessionId): Promise<void> {
    await this.workspaces.archiveSession(sessionId)
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
    let disposed = false
    const reconcile = (): void => {
      if (disposed) return
      if (this.clearArchivedCurrent()) return
      if (initial !== 'waiting') return
      const workspaces = this.workspaces.list.getSnapshot()
      const sessions = this.sessions.list.getSnapshot()
      if (workspaces.phase !== 'ready' || sessions.phase !== 'ready') return
      if (sessions.current !== undefined) {
        initial = 'done'
        return
      }
      const target = recentWorkspace(workspaces.items, sessions.byId)
      if (target === undefined) {
        initial = 'done'
        return
      }
      initial = 'connecting'
      void this.connectWorkspace(target).then(
        (sessionId) => {
          if (disposed) return
          if (this.sessions.list.getSnapshot().current === undefined) {
            this.sessions.open(sessionId)
          }
          initial = 'done'
        },
        (reason: unknown) => {
          if (disposed) return
          initial = 'waiting'
          console.warn('ya-workspace-sidebar: initial workspace selection failed:', reason)
        },
      )
    }
    const disposeWorkspaces = this.workspaces.list.subscribe(reconcile)
    const disposeSessions = this.sessions.list.subscribe(reconcile)
    reconcile()
    return () => {
      disposed = true
      disposeSessions()
      disposeWorkspaces()
    }
  }

  /** @returns true when an archived current selection was cleared. */
  private clearArchivedCurrent(): boolean {
    const current = this.sessions.list.getSnapshot().current
    if (current === undefined
      || !this.workspaces.list.getSnapshot().archivedSessionIds.includes(current)) return false
    this.sessions.clear()
    return true
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
