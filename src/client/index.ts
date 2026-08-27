/** Client assembly for the replacement workspace sidebar and hero picker. */
import type { Context } from '@deepseek-ai/cordis'
// Type-only: pulls the Session Controller's Context merge (ctx.sessions) and list types.
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
// Type-only: pulls the Workspace Controller's Context merge (ctx.workspaces).
import type {} from '@deepseek-ai/dsh-api-workspace-controller/client'
// Type-only: pulls the Client Remote merge (ctx.remote) behind directory picking.
import type {} from '@deepseek-ai/dsh-api-remotes/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the SlotRegistry service merge (ctx.slots).
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'
import type { PickerInjected, SidebarInjected } from './contract.ts'
import { dicts } from './dictionaries.ts'
import { en, NS, zh } from './locales.ts'
import { YaWorkspaceNavigation } from './navigation.ts'
import { installStyles } from './styles.ts'
import { WorkspacePicker } from './WorkspacePicker.tsx'
import { WorkspaceSidebar } from './WorkspaceSidebar.tsx'

/**
 * Services required by the replacement client entries. `remote` and
 * `remote.directoryPicker` feed the uiWorkspace stand-in's directory picking.
 */
export const inject = [
  'slots', 'sessions', 'workspaces', 'locale', 'remote', 'remote.directoryPicker',
]

/** Register the sidebar browser and conversation hero picker. */
export function apply(ctx: Context): void {
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

  // The official ui-workspace (disabled by this bundle's patch) used to own
  // three roles: the global `useWorkspaces` standard hook, the `uiWorkspace`
  // navigation service, and the boot navigation policy. All three move here:
  // the service stand-in keeps the v0.1.2-alpha.1 UI domains (sidebar shell,
  // conversation hero, agent preset, directory pickers) from parking forever,
  // provideRoot binds the Workspace Controller snapshot into the renderer's
  // global standard props, and the navigation class carries the official
  // reuse-or-create, current/recent fallback, and archived-current semantics.
  const navigation = new YaWorkspaceNavigation(
    ctx, ctx.remote.directoryPicker, ctx.workspaces, ctx.sessions)
  ctx.slots.provideRoot({ hooks: { workspaces: ctx.workspaces.list } })

  const searchSessions: SidebarInjected['searchSessions'] = async (query, signal) => {
    const result = await ctx.sessions.search(query, signal)
    if (!result.ok) throw new Error(result.error.message)
    return result.value
  }
  const sidebarInjected = (): SidebarInjected => ({
    startSession: workspaceId => { navigation.startSession(workspaceId) },
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
    archiveSession: async sessionId => { await navigation.archiveSession(sessionId) },
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
