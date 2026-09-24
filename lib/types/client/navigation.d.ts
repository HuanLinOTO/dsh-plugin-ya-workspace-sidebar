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
 *
 * dsh 0.1.7-rc.1 moved the Session selection out of the Session Controller
 * (`SessionListState.current` / `ISessions.open` / `ISessions.clear` are gone)
 * into this service: a retained `mainReference` plus a persisted selection
 * store (`dsh.sessions.current`). This port mirrors the shipped
 * `UiWorkspaceService` selection mechanics.
 */
import { Service, type Context } from '@deepseek-ai/cordis';
import type { ISessions, SessionTarget } from '@deepseek-ai/dsh-api-session-controller/client';
import type { ClientRemote, DirectoryListing } from '@deepseek-ai/dsh-api-remotes/client';
import type { IWorkspaces, WorkspaceId } from '@deepseek-ai/dsh-api-workspace-controller/client';
import type { UiWorkspace } from '@deepseek-ai/dsh-client-ui-workspace/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/** One persisted selection: the current Session and its optional subagent address. */
export interface SessionSelection {
    readonly sessionId?: SessionId;
    readonly subagentAddress?: SessionTarget;
}
/** Implements Workspace navigation and directory UI operations. */
export declare class YaWorkspaceNavigation extends Service implements UiWorkspace {
    private readonly directoryPicker;
    private readonly workspaces;
    private readonly sessions;
    private readonly connecting;
    private readonly lifetime;
    private readonly selection;
    private mainReference;
    /**
     * @param ctx - Client root Context.
     * @param directoryPicker - the directory-picking Remote namespace.
     * @param workspaces - pure Workspace Controller.
     * @param sessions - pure Session Controller.
     */
    constructor(ctx: Context, directoryPicker: ClientRemote['directoryPicker'], workspaces: IWorkspaces, sessions: ISessions);
    /** The Session currently shown in the main view, or undefined. */
    get currentSessionId(): SessionId | undefined;
    /** Observe the current selection (the sidebar's blank-row filter and highlight). */
    subscribeSelection(listener: () => void): () => void;
    connectWorkspace(workspaceId: WorkspaceId): Promise<SessionId>;
    private reuseOrCreateBlank;
    private reuseBlank;
    openSession(target: SessionTarget): void;
    openWorkspace(workspaceId: WorkspaceId, beforeOpen?: (sessionId: SessionId) => void): Promise<void>;
    forkSession(sessionId: SessionId): Promise<void>;
    startSession(workspaceId?: WorkspaceId): void;
    archiveSession(sessionId: SessionId, options?: {
        readonly stopActivity?: boolean;
    }): Promise<void>;
    unarchiveSession(sessionId: SessionId): Promise<void>;
    pinSession(sessionId: SessionId): Promise<void>;
    unpinSession(sessionId: SessionId): Promise<void>;
    pickDirectory(): Promise<string | null>;
    listDirectory(path?: string, signal?: AbortSignal): Promise<DirectoryListing>;
    createDirectory(path: string, name: string): Promise<string>;
    private watchNavigation;
    private restoreSelection;
    /** @returns true when an archived current selection was cleared. */
    private clearArchivedCurrent;
    private clearMain;
    private replaceMain;
}
