/** Existing-workspace menu plus composed directory-adoption flow. */
import type { ReactNode, RefObject } from 'react'
import { useCallback, useEffect, useState } from 'react'
import {
  Button, IconFolderClose16, IconPlusOutline16, Menu, Modal, type MenuEntry,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  WorkspaceId, WorkspaceSnapshot, WorkspaceView,
} from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-ui-slots'
import type { DirectoryFlowOwnerProps, PickerProps } from './contract.ts'

const ADD = '::ya-add-workspace'

interface FlowProps {
  t: PickerProps['t']
  open: boolean
  anchorRef?: RefObject<HTMLElement | null>
  useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>
  createWorkspace: (input: { path: string }) => Promise<WorkspaceView>
  useDirectoryFlow: SnapshotSelectorHook<boolean>
  renderDirectoryFlow: (owner: DirectoryFlowOwnerProps) => ReactNode
  onPick: (workspaceId: WorkspaceId) => void
  onClose: () => void
  addOnly?: boolean
  side?: 'bottom' | 'top' | 'right'
  selectedId?: WorkspaceId
}

/** Render the workspace target menu and directory picking conversation. */
export function WorkspacePickFlow({
  t, open, anchorRef, useWorkspaces, createWorkspace, useDirectoryFlow,
  renderDirectoryFlow, onPick, onClose, addOnly = false, side = 'bottom', selectedId,
}: FlowProps) {
  const snapshot = useWorkspaces(state => state)
  const flowAvailable = useDirectoryFlow(value => value)
  const [flowOpen, setFlowOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const getAnchorRect = useCallback(
    () => anchorRef?.current?.getBoundingClientRect() ?? null,
    [anchorRef],
  )
  useEffect(() => {
    if (flowOpen && !flowAvailable) setFlowOpen(false)
  }, [flowAvailable, flowOpen])

  const openFlow = useCallback(() => {
    onClose()
    setError(null)
    setFlowOpen(true)
  }, [onClose])
  const addEntries: MenuEntry[] = flowAvailable
    ? [{ id: ADD, label: t('addWorkspaceMenu'), icon: <IconPlusOutline16 size={16} />, disabled: flowOpen || busy }]
    : []
  const pinnedAdd = !addOnly && snapshot.items.length > 0
  const items: MenuEntry[] = pinnedAdd
    ? snapshot.items.map(workspace => ({
      id: workspace.workspaceId,
      label: workspace.title,
      icon: <IconFolderClose16 size={16} />,
      disabled: flowOpen || busy,
    }))
    : addEntries
  const settled = addOnly || snapshot.phase === 'ready'
  const onlyAdd = !pinnedAdd && settled && addEntries.length === 1
  useEffect(() => {
    if (open && onlyAdd && !flowOpen && !busy) openFlow()
  }, [busy, flowOpen, onlyAdd, open, openFlow])

  const owner: DirectoryFlowOwnerProps = {
    open: flowOpen,
    busy,
    onPicked: (path) => {
      setBusy(true)
      createWorkspace({ path }).then(workspace => {
        setFlowOpen(false)
        onPick(workspace.workspaceId)
      }).catch((reason: unknown) => {
        setFlowOpen(false)
        setError(reason instanceof Error ? reason.message : String(reason))
      }).finally(() => { setBusy(false) })
    },
    onCancel: () => { setFlowOpen(false) },
    onError: (message) => { setFlowOpen(false); setError(message) },
  }

  return (
    <>
      <Menu
        open={open && !onlyAdd && items.length > 0}
        anchor={null}
        items={items}
        {...pinnedAdd ? { footer: addEntries } : {}}
        selectedId={selectedId}
        onSelect={(id) => { if (id === ADD) openFlow(); else onPick(id as WorkspaceId) }}
        onClose={onClose}
        side={side}
        portal
        getAnchorRect={getAnchorRect}
      />
      {open && !onlyAdd && snapshot.phase === 'pending' && <div className="ya-status">{t('loading')}</div>}
      {renderDirectoryFlow(owner)}
      <Modal
        open={error !== null}
        onClose={() => { setError(null) }}
        closeLabel={t('cancel')}
        title={t('folderError')}
        footer={(
          <>
            <Button variant="outline" onClick={() => { setError(null) }}>{t('cancel')}</Button>
            <Button variant="primary" disabled={!flowAvailable} onClick={openFlow}>{t('retry')}</Button>
          </>
        )}
      >
        <div className="ya-picker-error" role="alert">{error}</div>
      </Modal>
    </>
  )
}

/** Fill the conversation hero's workspace picker seat. */
export function WorkspacePicker({
  open, anchorRef, useWorkspaces, selectedId, onPick, onClose,
  createWorkspace, useDirectoryFlow, renderSlot, t,
}: PickerProps) {
  return (
    <WorkspacePickFlow
      t={t}
      open={open}
      anchorRef={anchorRef}
      useWorkspaces={useWorkspaces}
      selectedId={selectedId}
      onPick={onPick}
      onClose={onClose}
      createWorkspace={createWorkspace}
      useDirectoryFlow={useDirectoryFlow}
      renderDirectoryFlow={owner => renderSlot('conversation.hero.workspace.directoryFlow', owner)}
    />
  )
}
