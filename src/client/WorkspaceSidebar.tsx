/** Two-level workspace/session browser with a persistent global recent block. */
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import {
  Button, IconArchiveOutlineRegular, IconBranchOutlineRegular, IconChevronRightOutlineMedium,
  IconClockOutlineRegular, IconCloseFillMedium, IconCopyOutlineRegular, IconEditOutlineRegular,
  IconEllipsisOutlineRegular, IconFolderCloseRegular, IconFolderOpenOutlineRegular, IconLinkOutlineRegular,
  IconPlusOutlineRegular, IconProjectAddOutlineRegular, IconSearchOutlineRegular, IconTrashOutlineRegular,
  Menu, Modal, StateDot, writeClipboard,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { WorkspaceId } from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { SessionPaths, SidebarProps } from './contract.ts'
import {
  applyPinned, deriveRecent, deriveWorkspaceGroups, deriveWorkspaceSessionGroups,
  deriveWorkspaceSessions, deriveWorkspaces, extractPinnedGroups, localMatches, UNGROUPED,
  workspaceKeyForSession, type PendingInteractionMap, type SessionRow, type WorkspaceRow,
} from './model.ts'
import {
  getPinnedOrder, getUnread, markRead, markUnread, subscribePinned, subscribeUnread, togglePinned,
} from './session-flags.ts'
import type { SessionActionMode } from './settings.ts'
import {
  getActionMode, getRecentViewportHeight, RECENT_MIN_HEIGHT, setActionMode,
  setRecentViewportHeight, subscribeActionMode, subscribeRecentViewportHeight,
} from './settings.ts'
import { VirtualRecentList } from './VirtualRecentList.tsx'
import { WorkspacePickFlow } from './WorkspacePicker.tsx'

const SEARCH_DEBOUNCE_MS = 250
const SEARCH_MAX = 500
/** Minimum height kept for the workspace browser below the recent block. */
const MIN_WORKSPACE = 120

function sanitized(value: string): string {
  return value.replaceAll('\0', '').slice(0, SEARCH_MAX)
}

function relativeTime(updatedAt: number, now: number, t: SidebarProps['t']): string {
  const diff = Math.max(0, now - updatedAt)
  const minute = 60_000
  if (diff < minute) return t('now')
  if (diff < 60 * minute) return t('minutes', { n: Math.floor(diff / minute) })
  if (diff < 24 * 60 * minute) return t('hours', { n: Math.floor(diff / (60 * minute)) })
  if (diff < 30 * 24 * 60 * minute) return t('days', { n: Math.floor(diff / (24 * 60 * minute)) })
  if (diff < 365 * 24 * 60 * minute) return t('months', { n: Math.floor(diff / (30 * 24 * 60 * minute)) })
  return t('years', { n: Math.floor(diff / (365 * 24 * 60 * minute)) })
}

/** Format a date group's localized title from its dayOffset and `YYYY-MM-DD` key. */
function dateGroupLabel(group: { dateKey: string; dayOffset: number }, now: number, t: SidebarProps['t']): string {
  if (group.dayOffset === 0) return t('today')
  if (group.dayOffset === 1) return t('yesterday')
  const parts = group.dateKey.split('-')
  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])
  const nowDate = new Date(now)
  if (year === nowDate.getFullYear()) return t('date', { m: month, d: day })
  return t('dateYear', { y: year, m: month, d: day })
}

/** Row status priority: interaction > running > unread > completed reminder. */
function SessionStatus({ row, unread }: { row: SessionRow; unread: boolean }) {
  if (row.pendingInteraction !== undefined) return <StateDot state="warning" />
  if (row.running) return <StateDot state="ongoing" />
  if (unread) return <span className="ya-unread-dot" aria-hidden="true" />
  if (row.completed) return <StateDot state="done" />
  return null
}

/** Pinned-row marker (self-drawn pin glyph; color via the skin tokens). */
function PinMark({ size = 12 }: { size?: number }) {
  return (
    <svg className="ya-pin-mark" width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M9.8 1.2 14.8 6.2 13.4 7.6 12.7 6.9 9.6 10 9.9 12.1 8.4 13.6 5.6 10.8 2.5 13.9 1.4 12.8 4.5 9.7 1.7 6.9 3.2 5.4 5.3 5.7 8.4 2.6 7.7 1.9 3.1 1.2Z"
      />
    </svg>
  )
}

interface SessionRowProps {
  row: SessionRow
  current: SessionId | undefined
  now: number
  open: (id: SessionId) => void
  rename: (row: SessionRow) => void
  fork: (id: SessionId) => void
  archive: (id: SessionId) => void
  t: SidebarProps['t']
  context?: boolean
  actionMode: SessionActionMode
  pinned: boolean
  unread: boolean
  paths: SessionPaths | undefined
  onOpenMenu: (row: SessionRow) => void
  onReveal: (cwd: string) => void
  onCopy: (text: string) => void
}

function SessionItem({
  row, current, now, open, rename, fork, archive, t, context, actionMode,
  pinned, unread, paths, onOpenMenu, onReveal, onCopy,
}: SessionRowProps) {
  const [menuOpenButton, setMenuOpenButton] = useState(false)
  const [menuAt, setMenuAt] = useState<{ x: number; y: number } | null>(null)
  const menuOpen = menuOpenButton || menuAt !== null
  const closeMenu = (): void => { setMenuOpenButton(false); setMenuAt(null) }
  const title = row.blank ? t('newSession') : row.title
  const isDelete = actionMode === 'delete'
  const actionLabel = isDelete ? t('deleteSession') : t('archive')
  const actionIcon = isDelete ? <IconTrashOutlineRegular /> : <IconArchiveOutlineRegular size={16} />
  const hasCwd = row.cwd !== undefined
  const pathsKnown = paths !== undefined
  return (
    <div
      className={`ya-row${row.id === current ? ' ya-selected' : ''}${menuOpen ? ' ya-menu-open' : ''}${unread ? ' ya-unread' : ''}${pinned ? ' ya-pinned' : ''}`}
      role="treeitem"
      aria-selected={row.id === current}
      onClick={() => { open(row.id) }}
      onContextMenu={(event) => {
        if (row.blank) return
        event.preventDefault()
        onOpenMenu(row)
        setMenuAt({ x: event.clientX, y: event.clientY })
      }}
    >
      <span className="ya-status-slot"><SessionStatus row={row} unread={unread} /></span>
      <span className="ya-row-main">
        <span className="ya-row-line">
          {pinned && <PinMark />}
          <span className="ya-row-title">{title}</span>
          {!row.blank && <span className="ya-row-meta ya-row-time">{relativeTime(row.updatedAt, now, t)}</span>}
        </span>
        {context === true && <span className="ya-search-workspace">{row.workspaceTitle}</span>}
      </span>
      {!row.blank && (
        <span className="ya-row-actions">
          <Menu
            open={menuOpen}
            onClose={closeMenu}
            items={[
              { id: 'pin', label: pinned ? t('unpin') : t('pin'), icon: <PinMark size={14} /> },
              { id: 'rename', label: t('rename'), icon: <IconEditOutlineRegular /> },
              { id: 'fork', label: t('fork'), icon: <IconBranchOutlineRegular /> },
              { id: 'unread', label: unread ? t('markRead') : t('markUnread'), icon: <IconClockOutlineRegular /> },
              { type: 'separator', id: 'sep-manage' },
              { id: 'reveal', label: t('revealInExplorer'), icon: <IconFolderOpenOutlineRegular />, disabled: !hasCwd },
              { id: 'copy-path', label: t('copyPath'), icon: <IconCopyOutlineRegular />, disabled: !hasCwd },
              { id: 'copy-dir', label: t('copySessionDir'), icon: <IconCopyOutlineRegular />, disabled: !pathsKnown || paths?.dir == null },
              { id: 'copy-log', label: t('copyLogPath'), icon: <IconCopyOutlineRegular />, disabled: !pathsKnown || paths?.log == null },
              { id: 'copy-id', label: t('copySessionId'), icon: <IconLinkOutlineRegular /> },
              { type: 'separator', id: 'sep-archive' },
              { id: 'archive', label: actionLabel, icon: actionIcon, danger: isDelete },
            ]}
            onSelect={(id) => {
              closeMenu()
              if (id === 'pin') { togglePinned(row.id); return }
              if (id === 'unread') { if (unread) markRead(row.id); else markUnread(row.id); return }
              if (id === 'rename') { rename(row); return }
              if (id === 'fork') { fork(row.id); return }
              if (id === 'reveal' && row.cwd !== undefined) { onReveal(row.cwd); return }
              if (id === 'copy-path' && row.cwd !== undefined) { onCopy(row.cwd); return }
              if (id === 'copy-dir' && paths?.dir != null) { onCopy(paths.dir); return }
              if (id === 'copy-log' && paths?.log != null) { onCopy(paths.log); return }
              if (id === 'copy-id') { onCopy(row.id); return }
              if (id === 'archive') archive(row.id)
            }}
            portal
            closeOnPointerLeave={menuAt === null}
            {...(menuAt === null ? {} : { getAnchorRect: () => new DOMRect(menuAt.x, menuAt.y, 0, 0) })}
            anchor={(
              <button
                type="button"
                className="ya-icon-button"
                aria-label={`${title} actions`}
                onClick={(event) => { event.stopPropagation(); onOpenMenu(row); setMenuOpenButton(value => !value) }}
              >
                <IconEllipsisOutlineRegular />
              </button>
            )}
          />
        </span>
      )}
    </div>
  )
}

function WorkspaceItem({ row, enter, create, reveal, copy, rename, remove, now, t }: {
  row: WorkspaceRow
  enter: () => void
  create: () => void
  reveal: (path: string) => void
  copy: (text: string) => void
  rename: () => void
  remove: () => void
  now: number
  t: SidebarProps['t']
}) {
  // Cursor-anchored context menu; mounted only while open so closed rows carry
  // zero chrome and the freed right edge stays clear for the path line.
  const [menuAt, setMenuAt] = useState<{ x: number; y: number } | null>(null)
  const hasPath = row.path !== undefined
  return (
    <div
      className={`ya-row ya-workspace-row${menuAt !== null ? ' ya-menu-open' : ''}`}
      role="treeitem"
      onClick={enter}
      title={row.path}
      onContextMenu={(event) => {
        if (!row.real) return
        event.preventDefault()
        setMenuAt({ x: event.clientX, y: event.clientY })
      }}
    >
      <span className="ya-status-slot"><IconFolderCloseRegular /></span>
      <span className="ya-row-main">
        <span className="ya-row-line">
          <span className="ya-row-title">{row.real ? row.title : t('ungrouped')}</span>
          {row.lastUsedAt !== undefined && (
            <span className="ya-row-meta ya-row-time">{relativeTime(row.lastUsedAt, now, t)}</span>
          )}
        </span>
        {row.path !== undefined && <span className="ya-workspace-path">{row.path}</span>}
      </span>
      <IconChevronRightOutlineMedium />
      {row.real && menuAt !== null && (
        <Menu
          open
          onClose={() => { setMenuAt(null) }}
          items={[
            { id: 'create', label: t('newSession'), icon: <IconPlusOutlineRegular /> },
            { type: 'separator', id: 'sep-ws-paths' },
            { id: 'reveal', label: t('revealInExplorer'), icon: <IconFolderOpenOutlineRegular />, disabled: !hasPath },
            { id: 'copy-path', label: t('copyPath'), icon: <IconCopyOutlineRegular />, disabled: !hasPath },
            { type: 'separator', id: 'sep-ws-manage' },
            { id: 'rename', label: t('rename'), icon: <IconEditOutlineRegular /> },
            { id: 'delete', label: t('deleteWorkspace'), icon: <IconTrashOutlineRegular />, danger: true },
          ]}
          onSelect={(id) => {
            setMenuAt(null)
            if (id === 'create') create()
            if (id === 'reveal' && row.path !== undefined) { reveal(row.path); return }
            if (id === 'copy-path' && row.path !== undefined) { copy(row.path); return }
            if (id === 'rename') rename()
            if (id === 'delete') remove()
          }}
          portal
          getAnchorRect={() => new DOMRect(menuAt.x, menuAt.y, 0, 0)}
          anchor={<span aria-hidden="true" />}
        />
      )}
    </div>
  )
}

interface RemoteState {
  query: string
  status: 'idle' | 'loading' | 'ready' | 'error'
  items: readonly { sessionId: SessionId; snippet: string }[]
  hasMore: boolean
}

/** Fill `sidebar.workspaces` with the replacement browser. */
export function WorkspaceSidebar(props: SidebarProps) {
  const {
    wide, expandSidebar, useSessions, useSessionStatus, useCurrentSession, useWorkspaces, startSession,
    open, searchSessions, searchResultLimit, renameSession, forkSession, renameWorkspace,
    deleteWorkspace, archiveSession, createWorkspace, useDirectoryFlow, renderSlot, t,
    resolveSessionPaths, revealInExplorer,
  } = props
  const sessions = useSessions(state => state)
  // dsh 0.1.7-rc.1: the selected Session moved out of SessionListState into the
  // uiWorkspace service; merge it back for the pure projections.
  const current = useCurrentSession(value => value)
  const sessionsView = useMemo(() => ({ ...sessions, current }), [sessions, current])
  const workspaceState = useWorkspaces(state => state)
  const workspaces = workspaceState.items
  const archived = workspaceState.archivedSessionIds
  // ui-session's unified status snapshot replaced the pending-interaction map.
  const pendingInteractions: PendingInteractionMap = useSessionStatus(state => state)
  const directoryFlowAvailable = useDirectoryFlow(value => value)
  // Browser-local pinned/unread flags (localStorage-backed stores).
  const [pinnedOrder, setPinnedOrder] = useState<readonly SessionId[]>(() => getPinnedOrder())
  const [unreadSet, setUnreadSet] = useState<ReadonlySet<SessionId>>(() => getUnread())
  useEffect(() => subscribePinned(() => { setPinnedOrder(getPinnedOrder()) }), [])
  useEffect(() => subscribeUnread(() => { setUnreadSet(getUnread()) }), [])
  // Host-probed jsonl storage paths per session (undefined = not probed yet;
  // double-null = probed, absent — sqlite deployments keep the menu rows disabled).
  const pathsCache = useRef(new Map<SessionId, SessionPaths>())
  const [, setPathsTick] = useState(0)
  const prefetchPaths = (row: SessionRow): void => {
    if (row.blank || pathsCache.current.has(row.id)) return
    pathsCache.current.set(row.id, { dir: null, log: null })
    void resolveSessionPaths({ sessionId: row.id, ...(row.cwd !== undefined ? { cwd: row.cwd } : {}) })
      .then(result => {
        pathsCache.current.set(row.id, result)
        setPathsTick(tick => tick + 1)
      })
      .catch(() => { /* probe failure leaves the placeholder double-null */ })
  }
  const allRows = useMemo(
    () => deriveRecent(sessionsView, workspaces, archived, pendingInteractions, Number.MAX_SAFE_INTEGER),
    [archived, pendingInteractions, sessionsView, workspaces],
  )
  // Full recency list; the block virtualizes instead of capping at five rows.
  // Pinned rows lift to the front (browser-local ordering overlay).
  const recent = useMemo(
    () => applyPinned(allRows, pinnedOrder),
    [allRows, pinnedOrder],
  )
  const workspaceRows = useMemo(
    () => deriveWorkspaces(sessionsView, workspaces, archived),
    [archived, sessionsView, workspaces],
  )
  const now = Date.now()
  const workspaceGroups = useMemo(
    () => deriveWorkspaceGroups(workspaceRows, now),
    [workspaceRows, now],
  )
  const [selectedKey, setSelectedKey] = useState<WorkspaceId | typeof UNGROUPED | null>(null)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => { setHasMounted(true) }, [])
  const observedCurrent = useRef<SessionId | undefined>(undefined)
  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current && observedCurrent.current === current) return
    initialized.current = true
    observedCurrent.current = current
    if (current !== undefined) { setDirection('forward'); setSelectedKey(workspaceKeyForSession(current, workspaces)) }
  }, [current, workspaces])
  useEffect(() => {
    if (selectedKey !== null && selectedKey !== UNGROUPED
      && !workspaces.some(workspace => workspace.workspaceId === selectedKey)) setSelectedKey(UNGROUPED)
  }, [selectedKey, workspaces])
  const selectedWorkspace = selectedKey === null || selectedKey === UNGROUPED
    ? undefined
    : workspaces.find(workspace => workspace.workspaceId === selectedKey)
  // Real workspace level renders date-bucketed groups; Ungrouped keeps the flat recency view.
  const levelGroups = useMemo(
    () => selectedKey !== null && selectedKey !== UNGROUPED
      ? deriveWorkspaceSessionGroups(selectedKey, sessionsView, workspaces, archived, pendingInteractions, now)
      : [],
    [archived, pendingInteractions, sessionsView, workspaces, selectedKey, now],
  )
  const levelPinned = useMemo(
    () => extractPinnedGroups(levelGroups, pinnedOrder),
    [levelGroups, pinnedOrder],
  )
  const levelRows = useMemo(
    () => applyPinned(
      selectedKey === UNGROUPED
        ? deriveWorkspaceSessions(UNGROUPED, sessionsView, workspaces, archived, pendingInteractions)
        : [],
      pinnedOrder,
    ),
    [archived, pendingInteractions, sessionsView, workspaces, selectedKey, pinnedOrder],
  )
  const levelEmpty = selectedKey === UNGROUPED ? levelRows.length === 0 : levelGroups.every(g => g.rows.length === 0)

  const [query, setQuery] = useState('')
  const normalizedQuery = sanitized(query).trim()
  const [remote, setRemote] = useState<RemoteState>({ query: '', status: 'idle', items: [], hasMore: false })
  useEffect(() => {
    if (normalizedQuery === '') {
      setRemote({ query: '', status: 'idle', items: [], hasMore: false })
      return
    }
    const controller = new AbortController()
    setRemote({ query: normalizedQuery, status: 'loading', items: [], hasMore: false })
    const timer = window.setTimeout(() => {
      searchSessions(normalizedQuery, controller.signal).then(result => {
        if (!controller.signal.aborted) setRemote({ query: normalizedQuery, status: 'ready', items: result.items, hasMore: result.hasMore })
      }).catch(() => {
        if (!controller.signal.aborted) setRemote({ query: normalizedQuery, status: 'error', items: [], hasMore: false })
      })
    }, SEARCH_DEBOUNCE_MS)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [normalizedQuery, searchSessions])
  const searchRows = useMemo(() => {
    if (normalizedQuery === '') return []
    const byId = new Map(localMatches(allRows, normalizedQuery).map(row => [row.id, row]))
    if (remote.query === normalizedQuery) {
      for (const item of remote.items) {
        const row = allRows.find(candidate => candidate.id === item.sessionId)
        if (row !== undefined) byId.set(row.id, row)
      }
    }
    return [...byId.values()].slice(0, searchResultLimit)
  }, [allRows, normalizedQuery, remote, searchResultLimit])

  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerAnchor = useRef<HTMLButtonElement>(null)
  const [recentCollapsed, setRecentCollapsed] = useState(false)
  const [workspaceRename, setWorkspaceRename] = useState<WorkspaceRow | null>(null)
  const [sessionRename, setSessionRename] = useState<SessionRow | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [renameError, setRenameError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceRow | null>(null)
  const [actionMode, setActionModeState] = useState<SessionActionMode>(() => getActionMode())
  const [sessionDeleteTarget, setSessionDeleteTarget] = useState<SessionRow | null>(null)

  useEffect(() => subscribeActionMode(() => setActionModeState(getActionMode())), [])

  // Recent-block height preference (drag separator / arrow keys).
  const [recentHeight, setRecentHeight] = useState<number | undefined>(() => getRecentViewportHeight())
  const [recentResizing, setRecentResizing] = useState(false)
  useEffect(() => subscribeRecentViewportHeight(() => { setRecentHeight(getRecentViewportHeight()) }), [])
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const recentBlockRef = useRef<HTMLDivElement | null>(null)
  const breadcrumbRef = useRef<HTMLDivElement | null>(null)
  const resizerRef = useRef<HTMLDivElement | null>(null)
  const recentViewportRef = useRef<HTMLDivElement | null>(null)
  const recentDrag = useRef<{
    pointerId: number
    startY: number
    startHeight: number
    max: number
    moved: boolean
  } | null>(null)

  /** Effective max-height base and the largest height that keeps MIN_WORKSPACE visible. */
  const measureRecentBounds = (): { base: number; max: number } | null => {
    const viewport = recentViewportRef.current
    const body = bodyRef.current
    const resizer = resizerRef.current
    if (viewport === null || body === null || resizer === null) return null
    const computed = Number.parseFloat(window.getComputedStyle(viewport).maxHeight)
    const base = Number.isFinite(computed) ? computed : viewport.clientHeight
    const breadcrumb = breadcrumbRef.current
    const block = recentBlockRef.current
    const chrome = (block !== null ? block.offsetHeight : 0) - viewport.clientHeight
      + (breadcrumb !== null ? breadcrumb.offsetHeight : 0) + resizer.offsetHeight
    return { base, max: Math.max(RECENT_MIN_HEIGHT, Math.round(body.clientHeight - chrome - MIN_WORKSPACE)) }
  }
  const beginRecentResize = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !event.isPrimary) return
    const bounds = measureRecentBounds()
    if (bounds === null) return
    event.preventDefault()
    recentDrag.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: bounds.base,
      max: bounds.max,
      moved: false,
    }
    resizerRef.current?.setPointerCapture(event.pointerId)
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
    setRecentResizing(true)
  }
  const moveRecentResize = (event: PointerEvent<HTMLDivElement>) => {
    const drag = recentDrag.current
    const viewport = recentViewportRef.current
    if (drag === null || viewport === null || event.pointerId !== drag.pointerId) return
    drag.moved = true
    // Write the style directly: avoids re-rendering the whole sidebar per move.
    const next = Math.round(Math.min(drag.max, Math.max(RECENT_MIN_HEIGHT, drag.startHeight + event.clientY - drag.startY)))
    viewport.style.maxHeight = `${next}px`
  }
  const endRecentResize = (event: PointerEvent<HTMLDivElement>) => {
    const drag = recentDrag.current
    if (drag === null) return
    recentDrag.current = null
    const resizer = resizerRef.current
    if (resizer !== null && resizer.hasPointerCapture(event.pointerId)) resizer.releasePointerCapture(event.pointerId)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    setRecentResizing(false)
    if (!drag.moved) return
    const viewport = recentViewportRef.current
    if (viewport === null) return
    const written = Number.parseFloat(viewport.style.maxHeight)
    if (!Number.isFinite(written)) return
    const height = Math.round(written)
    setRecentHeight(height)
    setRecentViewportHeight(height)
  }
  const keyRecentResize = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    const bounds = measureRecentBounds()
    if (bounds === null) return
    const delta = event.key === 'ArrowUp' ? -35 : 35
    const next = Math.round(Math.min(bounds.max, Math.max(RECENT_MIN_HEIGHT, (recentHeight ?? bounds.base) + delta)))
    setRecentHeight(next)
    setRecentViewportHeight(next)
  }
  const resetRecentHeight = () => {
    const viewport = recentViewportRef.current
    if (viewport !== null) viewport.style.maxHeight = ''
    setRecentHeight(undefined)
    setRecentViewportHeight(undefined)
  }

  const beginWorkspaceRename = (row: WorkspaceRow) => { setWorkspaceRename(row); setRenameDraft(row.title); setRenameError(null) }
  const beginSessionRename = (row: SessionRow) => { setSessionRename(row); setRenameDraft(row.title); setRenameError(null) }
  const closeRename = () => { if (!busy) { setWorkspaceRename(null); setSessionRename(null); setRenameError(null) } }
  const commitRename = () => {
    const title = renameDraft.trim()
    if (title === '' || busy) return
    setBusy(true)
    const task = workspaceRename !== null && workspaceRename.key !== UNGROUPED
      ? renameWorkspace(workspaceRename.key, title)
      : sessionRename !== null ? renameSession(sessionRename.id, title) : Promise.resolve()
    task.then(() => { setWorkspaceRename(null); setSessionRename(null) })
      .catch((reason: unknown) => { setRenameError(reason instanceof Error ? reason.message : String(reason)) })
      .finally(() => { setBusy(false) })
  }
  const confirmDelete = () => {
    if (deleteTarget === null || deleteTarget.key === UNGROUPED || busy) return
    setBusy(true)
    deleteWorkspace(deleteTarget.key).then(() => { setDeleteTarget(null) })
      .catch((reason: unknown) => { setRenameError(reason instanceof Error ? reason.message : String(reason)) })
      .finally(() => { setBusy(false) })
  }
  const archive = (id: SessionId) => {
    if (actionMode === 'delete') {
      const row = allRows.find(candidate => candidate.id === id)
        ?? levelRows.find(candidate => candidate.id === id)
        ?? levelGroups.flatMap(g => g.rows).find(candidate => candidate.id === id)
        ?? recent.find(candidate => candidate.id === id)
      setSessionDeleteTarget(row ?? { id, title: '', blank: false, running: false, completed: false, updatedAt: 0, workspaceKey: UNGROUPED, workspaceTitle: '' })
      setRenameError(null)
      return
    }
    archiveSession(id).catch(reason => { console.warn('session archive rejected:', reason) })
  }
  const confirmSessionDelete = () => {
    if (sessionDeleteTarget === null || busy) return
    setBusy(true)
    archiveSession(sessionDeleteTarget.id).then(() => { setSessionDeleteTarget(null) })
      .catch((reason: unknown) => { setRenameError(reason instanceof Error ? reason.message : String(reason)) })
      .finally(() => { setBusy(false) })
  }
  const toggleActionMode = () => { setActionMode(actionMode === 'archive' ? 'delete' : 'archive') }
  const fork = (id: SessionId) => { forkSession(id) }
  // Opening a session is reading it: clear the local unread mark first.
  const openRow = (id: SessionId) => { markRead(id); open(id) }
  const reveal = (cwd: string) => { void revealInExplorer(cwd) }
  const copy = (text: string) => { void writeClipboard(text) }

  const sessionItem = (row: SessionRow, context = false) => (
    <SessionItem
      key={row.id}
      row={row}
      current={current}
      now={now}
      open={openRow}
      rename={beginSessionRename}
      fork={fork}
      archive={archive}
      t={t}
      context={context}
      actionMode={actionMode}
      pinned={pinnedOrder.includes(row.id)}
      unread={unreadSet.has(row.id)}
      paths={pathsCache.current.get(row.id)}
      onOpenMenu={prefetchPaths}
      onReveal={reveal}
      onCopy={copy}
    />
  )

  return (
    <div data-ya-workspace-sidebar className={wide ? '' : 'ya-rail'}>
      <div className="ya-section-header">
        {wide && <span className="ya-section-title">{t('workspaces')}</span>}
        <button
          type="button"
          className={`ya-icon-button ya-action-mode-toggle${actionMode === 'delete' ? ' ya-action-mode-delete' : ''}`}
          aria-label={t('toggleActionMode')}
          aria-pressed={actionMode === 'delete'}
          title={actionMode === 'delete' ? t('deleteMode') : t('archiveMode')}
          onClick={(event) => { event.stopPropagation(); toggleActionMode() }}
        >
          {actionMode === 'delete' ? <IconTrashOutlineRegular size={wide ? 16 : 18} /> : <IconArchiveOutlineRegular size={wide ? 16 : 18} />}
        </button>
        {directoryFlowAvailable && (
          <button ref={pickerAnchor} type="button" className="ya-icon-button" aria-label={t('addWorkspace')} onClick={() => { setPickerOpen(value => !value) }}>
            <IconProjectAddOutlineRegular size={wide ? 16 : 18} />
          </button>
        )}
        <WorkspacePickFlow
          t={t}
          open={pickerOpen}
          anchorRef={pickerAnchor}
          useWorkspaces={useWorkspaces}
          createWorkspace={createWorkspace}
          useDirectoryFlow={useDirectoryFlow}
          renderDirectoryFlow={owner => renderSlot('sidebar.workspaces.directoryFlow', owner)}
          addOnly
          side="right"
          onPick={(workspaceId) => { setPickerOpen(false); startSession(workspaceId) }}
          onClose={() => { setPickerOpen(false) }}
        />
      </div>

      <div className="ya-search" onClick={() => { if (!wide) expandSidebar() }}>
        <button type="button" className="ya-search-icon" aria-label={t('search')}><IconSearchOutlineRegular size={wide ? 14 : 18} /></button>
        {wide && <input className="ya-search-input" value={query} maxLength={SEARCH_MAX} placeholder={t('searchPlaceholder')} onChange={event => { setQuery(sanitized(event.target.value)) }} />}
        {wide && query !== '' && <button type="button" className="ya-icon-button" aria-label={t('clearSearch')} onClick={() => { setQuery('') }}><IconCloseFillMedium /></button>}
      </div>

      {wide && (
        <div ref={bodyRef} className="ya-body">
          {normalizedQuery !== '' ? (
            <div className="ya-scroll" role="tree" aria-label={t('search')}>
              {searchRows.map(row => sessionItem(row, true))}
              {remote.status === 'loading' && <div className="ya-status">{t('searching')}</div>}
              {remote.status === 'error' && <div className="ya-status ya-warning">{t('searchUnavailable')}</div>}
              {remote.status !== 'loading' && searchRows.length === 0 && <div className="ya-empty">{t('noMatches')}</div>}
            </div>
          ) : (
            <>
              <div ref={recentBlockRef} className={`ya-recent${recentCollapsed ? ' ya-recent-collapsed' : ''}`}>
                <div className="ya-block-label">
                  <span>{t('recent')}</span>
                  {recent.length > 0 && (
                    <button
                      type="button"
                      className={`ya-block-label-toggle${recentCollapsed ? ' ya-collapsed' : ''}`}
                      aria-label={recentCollapsed ? t('expand') : t('collapse')}
                      aria-expanded={!recentCollapsed}
                      onClick={(event) => { event.stopPropagation(); setRecentCollapsed(value => !value) }}
                    >
                      <IconChevronRightOutlineMedium />
                    </button>
                  )}
                </div>
                <div className="ya-recent-list-wrap">
                  {recent.length === 0
                    ? <div className="ya-empty">{t('noSessions')}</div>
                    : (
                      <VirtualRecentList
                        rows={recent}
                        ariaLabel={t('recent')}
                        renderItem={row => sessionItem(row, true)}
                        viewportRef={node => { recentViewportRef.current = node }}
                        maxHeight={recentHeight}
                      />
                    )}
                </div>
              </div>
              {!recentCollapsed && (
                <div
                  ref={resizerRef}
                  className={`ya-recent-resizer${recentResizing ? ' ya-resizing' : ''}`}
                  role="separator"
                  aria-orientation="horizontal"
                  aria-label={t('resizeRecent')}
                  aria-valuenow={recentHeight}
                  tabIndex={0}
                  onPointerDown={beginRecentResize}
                  onPointerMove={moveRecentResize}
                  onPointerUp={endRecentResize}
                  onPointerCancel={endRecentResize}
                  onDoubleClick={resetRecentHeight}
                  onKeyDown={keyRecentResize}
                />
              )}
              <div ref={breadcrumbRef} className="ya-breadcrumb">
                {selectedKey === null ? (
                  <span className="ya-crumb">{t('workspaces')}</span>
                ) : (
                  <>
                    <button type="button" className="ya-crumb" onClick={() => { setDirection('backward'); setSelectedKey(null) }}>{t('workspaces')}</button>
                    <IconChevronRightOutlineMedium />
                    <span className="ya-crumb">{selectedKey === UNGROUPED ? t('ungrouped') : selectedWorkspace?.title}</span>
                    {selectedKey !== UNGROUPED && (
                      <button type="button" className="ya-icon-button" aria-label={t('newSession')} onClick={() => { startSession(selectedKey) }}><IconPlusOutlineRegular /></button>
                    )}
                  </>
                )}
              </div>
              <div className="ya-scroll" role="tree" aria-label={selectedKey === null ? t('workspaces') : t('sessions')}>
                <div key={selectedKey ?? 'root'} className={hasMounted ? `ya-level-enter-${direction}` : undefined}>
                  {selectedKey === null
                    ? workspaceGroups.flatMap(group => [
                      ...(group.dateKey === ''
                        ? []
                        : [<div key={`ws-group-${group.dateKey}`} className="ya-date-group-label" role="separator">
                          {dateGroupLabel(group, now, t)}
                        </div>]),
                      ...group.rows.map(row => (
                        <WorkspaceItem
                          key={row.key}
                          row={row}
                          enter={() => { setDirection('forward'); setSelectedKey(row.key) }}
                          create={() => { if (row.key !== UNGROUPED) startSession(row.key) }}
                          reveal={reveal}
                          copy={copy}
                          rename={() => { beginWorkspaceRename(row) }}
                          remove={() => { setDeleteTarget(row); setRenameError(null) }}
                          now={now}
                          t={t}
                        />
                      )),
                    ])
                    : selectedKey === UNGROUPED
                      ? levelRows.map(row => sessionItem(row, false))
                      : [
                        ...(levelPinned.pinned.length > 0
                          ? [<div key="group-pinned" className="ya-date-group-label" role="separator">
                            {t('pinnedGroup')}
                          </div>]
                          : []),
                        ...levelPinned.pinned.map(row => sessionItem(row, false)),
                        ...levelPinned.groups.flatMap(group => [
                          <div key={`group-${group.dateKey}`} className="ya-date-group-label" role="separator">
                            {dateGroupLabel(group, now, t)}
                          </div>,
                          ...group.rows.map(row => sessionItem(row, false)),
                        ]),
                      ]}
                  {selectedKey === null && workspaceRows.length === 0 && <div className="ya-empty">{t('noWorkspaces')}</div>}
                  {selectedKey !== null && levelEmpty && <div className="ya-empty">{t('noSessions')}</div>}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <Modal
        open={workspaceRename !== null || sessionRename !== null}
        onClose={closeRename}
        closeLabel={t('cancel')}
        title={workspaceRename !== null ? t('renameWorkspace') : t('renameSession')}
        footer={(
          <>
            <Button variant="outline" disabled={busy} onClick={closeRename}>{t('cancel')}</Button>
            <Button variant="primary" disabled={busy || renameDraft.trim() === ''} onClick={commitRename}>{t('rename')}</Button>
          </>
        )}
      >
        <input className="ya-rename-input" value={renameDraft} autoFocus disabled={busy} aria-label={workspaceRename !== null ? t('workspaceName') : t('sessionName')} onChange={event => { setRenameDraft(event.target.value); setRenameError(null) }} />
        {renameError !== null && <div className="ya-error" role="alert">{renameError}</div>}
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => { if (!busy) setDeleteTarget(null) }}
        closeLabel={t('cancel')}
        title={t('deleteWorkspace')}
        description={deleteTarget === null ? undefined : t('deleteDescription', { name: deleteTarget.title })}
        footer={(
          <>
            <Button variant="outline" disabled={busy} onClick={() => { setDeleteTarget(null) }}>{t('cancel')}</Button>
            <Button variant="outline" disabled={busy} onClick={confirmDelete}>{t('deleteWorkspace')}</Button>
          </>
        )}
      >
        {renameError !== null && <div className="ya-error" role="alert">{renameError}</div>}
      </Modal>

      <Modal
        open={sessionDeleteTarget !== null}
        onClose={() => { if (!busy) setSessionDeleteTarget(null) }}
        closeLabel={t('cancel')}
        title={t('deleteSessionTitle')}
        description={t('deleteSessionConfirm')}
        footer={(
          <>
            <Button variant="outline" disabled={busy} onClick={() => { setSessionDeleteTarget(null) }}>{t('cancel')}</Button>
            <Button variant="outline" disabled={busy} onClick={confirmSessionDelete}>{t('deleteSession')}</Button>
          </>
        )}
      >
        {renameError !== null && <div className="ya-error" role="alert">{renameError}</div>}
      </Modal>
    </div>
  )
}
