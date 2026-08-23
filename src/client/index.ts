/** Client assembly for the replacement workspace sidebar and hero picker. */
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { PickerInjected, SidebarInjected } from './contract.ts'
import { dicts } from './dictionaries.ts'
import { en, NS, zh } from './locales.ts'
import { installStyles } from './styles.ts'
import { WorkspacePicker } from './WorkspacePicker.tsx'
import { WorkspaceSidebar } from './WorkspaceSidebar.tsx'

/** Services required by both replacement client entries. */
export const inject = ['slots', 'sessions', 'workspaces', 'locale']

/** Register the sidebar browser and conversation hero picker. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ya-workspace-sidebar: dictionaries')
  ctx.effect(() => {
    let dispose: (() => void) | undefined
    const sync = (): void => {
      dispose?.()
      dispose = undefined
      const store = (ctx as unknown as {
        get(name: string): {
          register(ns: string, dicts: Record<string, Record<string, string>>): () => void
        } | undefined
      }).get('betterLocale')
      if (store !== undefined) {
        dispose = store.register(NS, dicts)
      }
    }
    sync()
    const unsubscribe = (ctx.locale as unknown as { subscribe(fn: () => void): () => void }).subscribe(sync)
    return () => {
      unsubscribe()
      dispose?.()
    }
  }, 'ya-workspace-sidebar: better-locale override dicts')
  ctx.effect(installStyles, 'ya-workspace-sidebar: styles')

  const flowSource = (
    name: 'sidebar.workspaces.directoryFlow' | 'conversation.hero.workspace.directoryFlow',
  ): HostObservable<boolean> => ({
    getSnapshot: () => ctx.slots.entries(name).length > 0,
    subscribe: listener => ctx.slots.subscribe(name, listener),
  })
  const sidebarFlow = flowSource('sidebar.workspaces.directoryFlow')
  const pickerFlow = flowSource('conversation.hero.workspace.directoryFlow')
  const createWorkspace = (input: { path: string }) => ctx.workspaces.create(input)

  const searchSessions: SidebarInjected['searchSessions'] = async (query, signal) => {
    const result = await ctx.sessions.search(query, signal)
    if (!result.ok) throw new Error(result.error.message)
    return result.value
  }
  const sidebarInjected = (): SidebarInjected => ({
    startSession: workspaceId => { ctx.workspaces.startSession(workspaceId) },
    open: sessionId => { ctx.sessions.open(sessionId) },
    searchSessions,
    searchResultLimit: ctx.sessions.searchResultLimit,
    renameSession: async (sessionId, title) => {
      const session = ctx.sessions.binding(sessionId)?.session
      if (session === undefined) throw new Error(`unknown session "${sessionId}"`)
      const result = await session.rename(title)
      if (!result.ok) throw new Error(result.error.message)
    },
    forkSession: sessionId => {
      ctx.sessions.fork({ sessionId, increaseTitle: true })
        .then(childId => { ctx.sessions.open(childId) })
        .catch(() => {})
    },
    renameWorkspace: async (workspaceId, title) => { await ctx.workspaces.rename(workspaceId, title) },
    deleteWorkspace: async workspaceId => { await ctx.workspaces.delete(workspaceId) },
    archiveSession: async sessionId => { await ctx.workspaces.archiveSession(sessionId) },
    insertSessionBefore: async (workspaceId, sessionId, beforeSessionId) => {
      await ctx.workspaces.insertSessionBefore(workspaceId, sessionId, beforeSessionId)
    },
    createWorkspace,
    hooks: { directoryFlow: sidebarFlow },
  })
  const pickerInjected = (): PickerInjected => ({
    createWorkspace,
    hooks: { directoryFlow: pickerFlow },
  })

  ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register({
    name: 'sidebar.workspaces',
    children: { 'sidebar.workspaces.directoryFlow': { kind: 'single', scope: 'root' } },
    inject: sidebarInjected,
    locale: NS,
  }, WorkspaceSidebar))

  ctx.slots.inject('conversation.hero.workspace', () => ctx.slots.register({
    name: 'conversation.hero.workspace',
    children: { 'conversation.hero.workspace.directoryFlow': { kind: 'single', scope: 'root' } },
    inject: pickerInjected,
    locale: NS,
  }, WorkspacePicker))
}
