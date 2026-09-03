/** Slot contracts and injected Host actions for ya-workspace-sidebar. */
import type {
  HostObservable, PropsLocale, PropsRenderSlots, PropsRuntime, SnapshotSelectorHook,
} from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionSearchResultItem } from '@deepseek-ai/dsh-api-session-controller/client'
import type {
  WorkspaceId, WorkspaceSnapshot, WorkspaceView,
} from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
// Type-only: pulls the sidebar shell's SlotMap owner merge (wide / expandSidebar).
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
// Type-only: pulls the conversation hero's SlotMap owner merge (picker seat).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls ui-session's GlobalStandardProps merge (useSessions /
// useSessionPendingInteraction) into PropsRuntime.
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type { YaWorkspaceKey } from './locales.ts'

/** Directory-picker conversation owned by each trigger surface. */
export interface DirectoryFlowOwnerProps {
  open: boolean
  busy: boolean
  onPicked: (path: string) => void
  onCancel: () => void
  onError: (message: string) => void
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  /** The official ui-workspace provider is disabled by this bundle's patch,
   * so this plugin owns the global workspaces selector hook (bound from the
   * Workspace Controller snapshot this apply installs via slots.provideRoot). */
  interface GlobalStandardProps {
    useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>
  }

  interface SlotMap {
    'sidebar.workspaces.directoryFlow': { kind: 'single'; scope: 'root'; owner: DirectoryFlowOwnerProps }
    'conversation.hero.workspace.directoryFlow': { kind: 'single'; scope: 'root'; owner: DirectoryFlowOwnerProps }
  }

  interface LocaleNamespaceMap {
    'ya-workspace-sidebar': YaWorkspaceKey
  }
}

/** Shared directory-flow occupancy source. */
export interface DirectoryInjected {
  hooks: { directoryFlow: HostObservable<boolean> }
}

/** Browser-private Host operations. */
export type SidebarInjected = DirectoryInjected & {
  startSession: (workspaceId?: WorkspaceId) => void
  open: (sessionId: SessionId) => void
  searchSessions: (
    query: string,
    signal: AbortSignal,
  ) => Promise<{ items: readonly SessionSearchResultItem[]; hasMore: boolean }>
  searchResultLimit: number
  renameSession: (sessionId: SessionId, title: string) => Promise<void>
  forkSession: (sessionId: SessionId) => void
  renameWorkspace: (workspaceId: WorkspaceId, title: string) => Promise<void>
  deleteWorkspace: (workspaceId: WorkspaceId) => Promise<void>
  archiveSession: (sessionId: SessionId) => Promise<void>
  insertSessionBefore: (
    workspaceId: WorkspaceId,
    sessionId: SessionId,
    beforeSessionId?: SessionId,
  ) => Promise<void>
  createWorkspace: (input: { path: string }) => Promise<WorkspaceView>
}

/** Full sidebar component props. */
export type SidebarProps = PropsRuntime<'sidebar.workspaces'>
  & PropsRenderSlots<'sidebar.workspaces.directoryFlow'>
  & Omit<SidebarInjected, 'hooks'>
  & { useDirectoryFlow: SnapshotSelectorHook<boolean> }
  & PropsLocale<'ya-workspace-sidebar'>

/** Conversation hero picker operations. */
export type PickerInjected = DirectoryInjected & {
  createWorkspace: (input: { path: string }) => Promise<WorkspaceView>
}

/** Full conversation hero picker props. */
export type PickerProps = PropsRuntime<'conversation.hero.workspace'>
  & PropsRenderSlots<'conversation.hero.workspace.directoryFlow'>
  & Omit<PickerInjected, 'hooks'>
  & { useDirectoryFlow: SnapshotSelectorHook<boolean> }
  & PropsLocale<'ya-workspace-sidebar'>
