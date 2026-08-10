/** Slot contracts and injected Host actions for ya-workspace-sidebar. */
import type {
  HostObservable, PropsLocale, PropsRenderSlots, PropsRuntime, SnapshotSelectorHook,
} from '@deepseek-ai/dsh-client-ui-slots'
import type {
  SessionId, SessionSearchResultItem, WorkspaceId, WorkspaceView,
} from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
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
