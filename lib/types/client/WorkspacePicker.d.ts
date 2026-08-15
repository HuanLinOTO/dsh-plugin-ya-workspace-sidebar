/** Existing-workspace menu plus composed directory-adoption flow. */
import type { ReactNode, RefObject } from 'react';
import type { WorkspaceId, WorkspaceListState, WorkspaceView } from '@deepseek-ai/dsh-client-runtime/client';
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-ui-slots';
import type { DirectoryFlowOwnerProps, PickerProps } from './contract.ts';
interface FlowProps {
    t: PickerProps['t'];
    open: boolean;
    anchorRef?: RefObject<HTMLElement | null>;
    useWorkspaces: <S>(selector: (state: WorkspaceListState) => S) => S;
    createWorkspace: (input: {
        path: string;
    }) => Promise<WorkspaceView>;
    useDirectoryFlow: SnapshotSelectorHook<boolean>;
    renderDirectoryFlow: (owner: DirectoryFlowOwnerProps) => ReactNode;
    onPick: (workspaceId: WorkspaceId) => void;
    onClose: () => void;
    addOnly?: boolean;
    side?: 'bottom' | 'top' | 'right';
    selectedId?: WorkspaceId;
}
/** Render the workspace target menu and directory picking conversation. */
export declare function WorkspacePickFlow({ t, open, anchorRef, useWorkspaces, createWorkspace, useDirectoryFlow, renderDirectoryFlow, onPick, onClose, addOnly, side, selectedId, }: FlowProps): import("react").JSX.Element;
/** Fill the conversation hero's workspace picker seat. */
export declare function WorkspacePicker({ open, anchorRef, useWorkspaces, selectedId, onPick, onClose, createWorkspace, useDirectoryFlow, renderSlot, t, }: PickerProps): import("react").JSX.Element;
export {};
