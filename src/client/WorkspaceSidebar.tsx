/** Two-level workspace/session browser with a persistent global recent block. */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Button, IconArchiveOutline20, IconBranchOutline16, IconChevronRightOutline14,
  IconCloseFill14, IconEditOutline16, IconEllipsisOutline16, IconFolderClose16,
  IconPlusOutline16, IconProjectAddOutline16, IconSearchOutline16, IconTrashOutline16,
  Menu, Modal, StateDot,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { SessionId, WorkspaceId } from '@deepseek-ai/dsh-client-runtime/client'
import type { SidebarProps } from './contract.ts'
import {
  deriveRecent, deriveWorkspaceSessions, deriveWorkspaces, localMatches,
  UNGROUPED, workspaceKeyForSession, type SessionRow, type WorkspaceRow,
} from './model.ts'
import { WorkspacePickFlow } from './WorkspacePicker.tsx'

const SEARCH_DEBOUNCE_MS = 250
const SEARCH_MAX = 500

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

function SessionStatus({ row }: { row: SessionRow }) {
  if (row.pendingInteraction !== undefined) return <StateDot state="warning" />
  if (row.running) return <StateDot state="ongoing" />
  if (row.completed) return <StateDot state="done" />
  return null
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
  drag?: {
    active: boolean
    marker: 'before' | 'after' | null
    start: () => void
    hover: (half: 'before' | 'after') => void
    drop: (half: 'before' | 'after') => void
    end: () => void
  }
}

function rowHalf(event: { clientY: number; currentTarget: HTMLElement }): 'before' | 'after' {
  const rect = event.currentTarget.getBoundingClientRect()
  return event.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
}

function SessionItem({ row, current, now, open, rename, fork, archive, t, context, drag }: SessionRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const title = row.blank ? t('newSession') : row.title
  return (
    <div
      className={`ya-row${row.id === current ? ' ya-selected' : ''}${menuOpen ? ' ya-menu-open' : ''}${drag?.marker === 'before' ? ' ya-drop-before' : ''}${drag?.marker === 'after' ? ' ya-drop-after' : ''}`}
      role="treeitem"
      aria-selected={row.id === current}
      draggable={drag !== undefined}
      onClick={() => { open(row.id) }}
      onDragStart={drag === undefined ? undefined : (event) => { event.dataTransfer.effectAllowed = 'move'; drag.start() }}
      onDragEnd={drag?.end}
      onDragOver={drag === undefined ? undefined : (event) => {
        if (!drag.active) return
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        drag.hover(rowHalf(event))
      }}
      onDrop={drag === undefined ? undefined : (event) => {
        if (!drag.active) return
        event.preventDefault()
        drag.drop(rowHalf(event))
      }}
    >
      <span className="ya-status-slot"><SessionStatus row={row} /></span>
      <span className="ya-row-main">
        <span className="ya-row-line">
          <span className="ya-row-title">{title}</span>
          {!row.blank && <span className="ya-row-meta ya-row-time">{relativeTime(row.updatedAt, now, t)}</span>}
        </span>
        {context === true && <span className="ya-search-workspace">{row.workspaceTitle}</span>}
      </span>
      {!row.blank && (
        <span className="ya-row-actions">
          <Menu
            open={menuOpen}
            onClose={() => { setMenuOpen(false) }}
            items={[
              { id: 'rename', label: t('rename'), icon: <IconEditOutline16 /> },
              { id: 'fork', label: t('fork'), icon: <IconBranchOutline16 /> },
              { id: 'archive', label: t('archive'), icon: <IconArchiveOutline20 size={16} /> },
            ]}
            onSelect={(id) => {
              setMenuOpen(false)
              if (id === 'rename') rename(row)
              if (id === 'fork') fork(row.id)
              if (id === 'archive') archive(row.id)
            }}
            portal
            closeOnPointerLeave
            anchor={(
              <button
                type="button"
                className="ya-icon-button"
                aria-label={`${title} actions`}
                onClick={(event) => { event.stopPropagation(); setMenuOpen(value => !value) }}
              >
                <IconEllipsisOutline16 />
              </button>
            )}
          />
        </span>
      )}
    </div>
  )
}

function WorkspaceItem({ row, enter, create, rename, remove, t }: {
  row: WorkspaceRow
  enter: () => void
  create: () => void
  rename: () => void
  remove: () => void
  t: SidebarProps['t']
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className={`ya-row ya-workspace-row${menuOpen ? ' ya-menu-open' : ''}`} role="treeitem" onClick={enter} title={row.path}>
      <span className="ya-status-slot"><IconFolderClose16 /></span>
      <span className="ya-row-main">
        <span className="ya-row-line">
          <span className="ya-row-title">{row.real ? row.title : t('ungrouped')}</span>
          <span className="ya-row-meta">{t('count', { n: row.count })}</span>
        </span>
        {row.path !== undefined && <span className="ya-workspace-path">{row.path}</span>}
      </span>
      <span className="ya-row-actions">
        {row.real && (
          <Menu
            open={menuOpen}
            onClose={() => { setMenuOpen(false) }}
            items={[
              { id: 'rename', label: t('rename'), icon: <IconEditOutline16 /> },
              { id: 'delete', label: t('deleteWorkspace'), icon: <IconTrashOutline16 />, danger: true },
            ]}
            onSelect={(id) => { setMenuOpen(false); if (id === 'rename') rename(); if (id === 'delete') remove() }}
            portal
            closeOnPointerLeave
            anchor={(
              <button type="button" className="ya-icon-button" onClick={(event) => { event.stopPropagation(); setMenuOpen(value => !value) }}>
                <IconEllipsisOutline16 />
              </button>
            )}
          />
        )}
        {row.real && (
          <button type="button" className="ya-icon-button" onClick={(event) => { event.stopPropagation(); create() }}>
            <IconPlusOutline16 />
          </button>
        )}
      </span>
      <IconChevronRightOutline14 />
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
    wide, expandSidebar, useSessions, useWorkspaces, startSession, open, searchSessions,
    searchResultLimit, renameSession, forkSession, renameWorkspace, deleteWorkspace,
    archiveSession, insertSessionBefore, createWorkspace, useDirectoryFlow, renderSlot, t,
  } = props
  const sessions = useSessions(state => state)
  const workspaceState = useWorkspaces(state => state)
  const workspaces = workspaceState.items
  const archived = workspaceState.archivedSessionIds
  const directoryFlowAvailable = useDirectoryFlow(value => value)
  const allRows = useMemo(
    () => deriveRecent(sessions, workspaces, archived, Number.MAX_SAFE_INTEGER),
    [archived, sessions, workspaces],
  )
  const recent = allRows.slice(0, 5)
  const workspaceRows = useMemo(
    () => deriveWorkspaces(sessions, workspaces, archived),
    [archived, sessions, workspaces],
  )
  const [selectedKey, setSelectedKey] = useState<WorkspaceId | typeof UNGROUPED | null>(null)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => { setHasMounted(true) }, [])
  const observedCurrent = useRef<SessionId | undefined>(undefined)
  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current && observedCurrent.current === sessions.current) return
    initialized.current = true
    observedCurrent.current = sessions.current
    if (sessions.current !== undefined) { setDirection('forward'); setSelectedKey(workspaceKeyForSession(sessions.current, workspaces)) }
  }, [sessions.current, workspaces])
  useEffect(() => {
    if (selectedKey !== null && selectedKey !== UNGROUPED
      && !workspaces.some(workspace => workspace.workspaceId === selectedKey)) setSelectedKey(UNGROUPED)
  }, [selectedKey, workspaces])
  const selectedWorkspace = selectedKey === null || selectedKey === UNGROUPED
    ? undefined
    : workspaces.find(workspace => workspace.workspaceId === selectedKey)
  const levelRows = selectedKey === null
    ? []
    : deriveWorkspaceSessions(selectedKey, sessions, workspaces, archived)
  const now = Date.now()

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
  const [drag, setDrag] = useState<{ id: SessionId; over: { id: SessionId; half: 'before' | 'after' } | null } | null>(null)

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
  const archive = (id: SessionId) => { archiveSession(id).catch(reason => { console.warn('session archive rejected:', reason) }) }
  const fork = (id: SessionId) => { forkSession(id) }

  const sessionItem = (row: SessionRow, context = false, index?: number) => {
    const draggable = selectedKey !== null && selectedKey !== UNGROUPED && index !== undefined
    const marker = drag?.over?.id === row.id ? drag.over.half : null
    return (
      <SessionItem
        key={row.id}
        row={row}
        current={sessions.current}
        now={now}
        open={open}
        rename={beginSessionRename}
        fork={fork}
        archive={archive}
        t={t}
        context={context}
        {...draggable && selectedKey !== null && selectedKey !== UNGROUPED ? {
          drag: {
            active: drag !== null,
            marker,
            start: () => { setDrag({ id: row.id, over: null }) },
            hover: (half: 'before' | 'after') => { setDrag(value => value === null ? value : { ...value, over: { id: row.id, half } }) },
            drop: (half: 'before' | 'after') => {
              if (drag === null) return
              const anchor = half === 'before' ? row.id : levelRows[(index ?? 0) + 1]?.id
              const sourceIndex = levelRows.findIndex(item => item.id === drag.id)
              const anchorIndex = anchor === undefined ? levelRows.length : levelRows.findIndex(item => item.id === anchor)
              setDrag(null)
              if (anchor === drag.id || sourceIndex === anchorIndex || sourceIndex + 1 === anchorIndex) return
              insertSessionBefore(selectedKey, drag.id, anchor).catch(reason => { console.warn('session reorder rejected:', reason) })
            },
            end: () => { setDrag(null) },
          },
        } : {}}
      />
    )
  }

  return (
    <div data-ya-workspace-sidebar className={wide ? '' : 'ya-rail'}>
      <div className="ya-section-header">
        {wide && <span className="ya-section-title">{t('workspaces')}</span>}
        {directoryFlowAvailable && (
          <button ref={pickerAnchor} type="button" className="ya-icon-button" aria-label={t('addWorkspace')} onClick={() => { setPickerOpen(value => !value) }}>
            <IconProjectAddOutline16 size={wide ? 16 : 18} />
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
        <button type="button" className="ya-search-icon" aria-label={t('search')}><IconSearchOutline16 size={wide ? 14 : 18} /></button>
        {wide && <input className="ya-search-input" value={query} maxLength={SEARCH_MAX} placeholder={t('searchPlaceholder')} onChange={event => { setQuery(sanitized(event.target.value)) }} />}
        {wide && query !== '' && <button type="button" className="ya-icon-button" aria-label={t('clearSearch')} onClick={() => { setQuery('') }}><IconCloseFill14 /></button>}
      </div>

      {wide && (
        <div className="ya-body">
          {normalizedQuery !== '' ? (
            <div className="ya-scroll" role="tree" aria-label={t('search')}>
              {searchRows.map(row => sessionItem(row, true))}
              {remote.status === 'loading' && <div className="ya-status">{t('searching')}</div>}
              {remote.status === 'error' && <div className="ya-status ya-warning">{t('searchUnavailable')}</div>}
              {remote.status !== 'loading' && searchRows.length === 0 && <div className="ya-empty">{t('noMatches')}</div>}
            </div>
          ) : (
            <>
              <div className={`ya-recent${recentCollapsed ? ' ya-recent-collapsed' : ''}`}>
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
                      <IconChevronRightOutline14 />
                    </button>
                  )}
                </div>
                <div className="ya-recent-list-wrap">
                  {recent.length === 0
                    ? <div className="ya-empty">{t('noSessions')}</div>
                    : <div className="ya-recent-list">{recent.map(row => sessionItem(row, true))}</div>
                  }
                </div>
              </div>
              <div className="ya-breadcrumb">
                {selectedKey === null ? (
                  <span className="ya-crumb">{t('workspaces')}</span>
                ) : (
                  <>
                    <button type="button" className="ya-crumb" onClick={() => { setDirection('backward'); setSelectedKey(null) }}>{t('workspaces')}</button>
                    <IconChevronRightOutline14 />
                    <span className="ya-crumb">{selectedKey === UNGROUPED ? t('ungrouped') : selectedWorkspace?.title}</span>
                    {selectedKey !== UNGROUPED && (
                      <button type="button" className="ya-icon-button" aria-label={t('newSession')} onClick={() => { startSession(selectedKey) }}><IconPlusOutline16 /></button>
                    )}
                  </>
                )}
              </div>
              <div className="ya-scroll" role="tree" aria-label={selectedKey === null ? t('workspaces') : t('sessions')}>
                <div key={selectedKey ?? 'root'} className={hasMounted ? `ya-level-enter-${direction}` : undefined}>
                  {selectedKey === null
                    ? workspaceRows.map(row => (
                      <WorkspaceItem
                        key={row.key}
                        row={row}
                        enter={() => { setDirection('forward'); setSelectedKey(row.key) }}
                        create={() => { if (row.key !== UNGROUPED) startSession(row.key) }}
                        rename={() => { beginWorkspaceRename(row) }}
                        remove={() => { setDeleteTarget(row); setRenameError(null) }}
                        t={t}
                      />
                    ))
                    : levelRows.map((row, index) => sessionItem(row, false, index))}
                  {selectedKey === null && workspaceRows.length === 0 && <div className="ya-empty">{t('noWorkspaces')}</div>}
                  {selectedKey !== null && levelRows.length === 0 && <div className="ya-empty">{t('noSessions')}</div>}
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
    </div>
  )
}
