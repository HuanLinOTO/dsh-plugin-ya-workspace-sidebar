/** Minimal DSH platform declarations for standalone external-plugin builds. */
declare module '@deepseek-ai/dsh-client-runtime/client' {
  import type { ComponentType } from 'react'

  export type SessionId = string & { readonly __sessionId: unique symbol }
  export type WorkspaceId = string & { readonly __workspaceId: unique symbol }
  export interface SessionSearchResultItem { sessionId: SessionId; snippet: string }
  export interface SessionSummary {
    id: SessionId
    displayTitle: string
    origin?: 'subagent'
    running: boolean
    pendingInteraction?: 'approval' | 'plan-review' | 'question'
    completed?: boolean
    blank: boolean
    updatedAt: number
  }
  export interface SessionListState {
    ids: SessionId[]
    byId: Record<SessionId, SessionSummary>
    current: SessionId | undefined
  }
  export interface WorkspaceView {
    workspaceId: WorkspaceId
    title: string
    path: string
    createdAt: string
    sessionIds: SessionId[]
  }
  export interface WorkspaceListState {
    items: readonly WorkspaceView[]
    archivedSessionIds: readonly SessionId[]
    phase: 'pending' | 'ready'
  }
  export interface ClientContext {
    effect: (factory: () => void | (() => void), label: string) => void
    locale: { register: (ns: string, dictionaries: Record<string, Record<string, string>>) => () => void }
    slots: {
      entries: (name: string) => readonly unknown[]
      subscribe: (name: string, listener: () => void) => () => void
      inject: (name: string, factory: () => (() => void)) => void
      register: (options: Record<string, unknown>, component: ComponentType<never>) => () => void
    }
    sessions: {
      search: (query: string, signal: AbortSignal) => Promise<
        | { ok: true; value: { items: readonly SessionSearchResultItem[]; hasMore: boolean } }
        | { ok: false; error: { message: string } }
      >
      searchResultLimit: number
      open: (sessionId: SessionId) => void
      binding: (sessionId: SessionId) => {
        session: { rename: (title: string) => Promise<{ ok: true } | { ok: false; error: { message: string } }> }
      } | undefined
      fork: (options: { sessionId: SessionId; increaseTitle: boolean }) => Promise<SessionId>
    }
    workspaces: {
      startSession: (workspaceId?: WorkspaceId) => void
      rename: (workspaceId: WorkspaceId, title: string) => Promise<void>
      delete: (workspaceId: WorkspaceId) => Promise<void>
      archiveSession: (sessionId: SessionId) => Promise<void>
      insertSessionBefore: (workspaceId: WorkspaceId, sessionId: SessionId, beforeSessionId?: SessionId) => Promise<void>
      create: (input: { path: string }) => Promise<WorkspaceView>
    }
  }
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  import type { ReactNode, RefObject } from 'react'
  import type {
    SessionListState, WorkspaceId, WorkspaceListState,
  } from '@deepseek-ai/dsh-client-runtime/client'

  export interface SlotMap {}
  export interface LocaleNamespaceMap {}
  export interface HostObservable<T> { getSnapshot: () => T; subscribe: (listener: () => void) => () => void }
  export type SnapshotSelectorHook<T> = <S>(selector: (state: T) => S) => S
  type StandardRuntime = {
    useSessions: SnapshotSelectorHook<SessionListState>
    useWorkspaces: SnapshotSelectorHook<WorkspaceListState>
  }
  export type PropsRuntime<K extends string> = StandardRuntime & (
    K extends 'sidebar.workspaces'
      ? { wide: boolean; expandSidebar: () => void }
      : K extends 'conversation.hero.workspace'
        ? {
          open: boolean
          anchorRef?: RefObject<HTMLElement>
          selectedId?: WorkspaceId
          onPick: (workspaceId: WorkspaceId) => void
          onClose: () => void
        }
        : Record<string, never>
  )
  export type PropsRenderSlots<K extends string> = {
    renderSlot: (name: K, owner: SlotMap[K & keyof SlotMap] extends { owner: infer O } ? O : never) => ReactNode
  }
  export type PropsLocale<N extends string> = {
    t: (key: N extends keyof LocaleNamespaceMap ? LocaleNamespaceMap[N] : string, params?: Record<string, string | number>) => string
  }
}

declare module '@deepseek-ai/dsh-client-ui-primitives' {
  import type { ComponentType, ReactNode } from 'react'
  export interface MenuEntry { id: string; label: string; icon?: ReactNode; disabled?: boolean; danger?: boolean }
  export const Button: ComponentType<{ variant: 'outline' | 'primary'; disabled?: boolean; onClick: () => void; children?: ReactNode }>
  export const Menu: ComponentType<{
    open: boolean
    onClose: () => void
    items: MenuEntry[]
    footer?: MenuEntry[]
    selectedId?: string
    onSelect: (id: string) => void
    anchor: ReactNode
    side?: 'bottom' | 'top' | 'right'
    portal?: boolean
    closeOnPointerLeave?: boolean
    getAnchorRect?: () => DOMRect | null
  }>
  export const Modal: ComponentType<{
    open: boolean
    onClose: () => void
    closeLabel: string
    title: string
    description?: string
    footer?: ReactNode
    children?: ReactNode
  }>
  export const StateDot: ComponentType<{ state: 'warning' | 'ongoing' | 'done' }>
  type Icon = ComponentType<{ size?: number; className?: string }>
  export const IconArchiveOutline20: Icon
  export const IconBranchOutline16: Icon
  export const IconChevronRightOutline14: Icon
  export const IconCloseFill14: Icon
  export const IconEditOutline16: Icon
  export const IconEllipsisOutline16: Icon
  export const IconFolderClose16: Icon
  export const IconPlusOutline16: Icon
  export const IconProjectAddOutline16: Icon
  export const IconSearchOutline16: Icon
  export const IconTrashOutline16: Icon
}

declare module '@deepseek-ai/dsh-client-locale/client' {}
declare module '@deepseek-ai/dsh-client-ui-sidebar/client' {}
declare module '@deepseek-ai/dsh-client-ui-conversation/client' {}

declare module '@deepseek-ai/dsh-invariants' {
  export type InvariantInstaller = () => void
}
