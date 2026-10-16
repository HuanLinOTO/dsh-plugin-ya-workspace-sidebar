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
 *
 * dsh 0.2.1-alpha.5 widened the service face: `startSession`/`connectWorkspace`/
 * `openWorkspace` accept `StartSessionOptions` (an Agent preset plus draft
 * initialization content — ui-agent-preset launches presets through
 * `startSession(undefined, { agentPreset })`), `forkSession` forwards
 * `allowMigration`, plain `startSession()` mints a fresh Session instead of
 * reusing a mounted blank, connections coalesce per (Workspace, preset), a
 * saved blank reopens under the preset its log recorded, and an empty profile
 * bootstraps the default Workspace before auto-selection.
 */
import { Service, type Context } from '@deepseek-ai/cordis';
import type { ISessions, SessionTarget } from '@deepseek-ai/dsh-api-session-controller/client';
import type { ClientRemote, DirectoryListing } from '@deepseek-ai/dsh-api-remotes/client';
import type { IWorkspaces, WorkspaceId } from '@deepseek-ai/dsh-api-workspace-controller/client';
import type { UiWorkspace } from '@deepseek-ai/dsh-client-ui-workspace/client';
import type { DraftInitializationOptions } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/** Content preparation and Agent preset for the Session a Workspace flow opens. */
export interface StartSessionOptions extends DraftInitializationOptions {
    /** Agent preset the Session runs; the Host default when omitted. */
    readonly agentPreset?: string;
}
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
    /** The latest in-flight connection per Workspace; a request joins it only when both name the same preset. */
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
    connectWorkspace(workspaceId: WorkspaceId, options?: Pick<StartSessionOptions, 'agentPreset'>): Promise<SessionId>;
    /**
     * @param reuse - preset for the reused or created blank; absent creates a fresh Session.
     */
    private connectBlank;
    private createInWorkspace;
    /**
     * Create through the Host. A named blank the Host declined may still read as
     * blank from stale cached list metadata, which hides it from the Session tree;
     * its projections are reloaded so the row reflects its log.
     */
    private createNamed;
    /**
     * Reopen a saved blank Session under the preset its log recorded, or under
     * the Host default once that preset no longer activates. Listed values are
     * cached hints that can lag the log after an unclean Host exit, so the
     * Session's projections are reloaded before the preset is read.
     */
    private restoreBlank;
    openSession(target: SessionTarget): void;
    openWorkspace(workspaceId: WorkspaceId, beforeOpen?: (sessionId: SessionId) => void, options?: Pick<StartSessionOptions, 'agentPreset'>): Promise<void>;
    private openWorkspaceSession;
    forkSession(sessionId: SessionId, onCreated?: (childId: SessionId) => void, options?: Pick<Parameters<ISessions['fork']>[0], 'allowMigration'>): Promise<SessionId>;
    startSession(workspaceId?: WorkspaceId, options?: StartSessionOptions): void;
    private prepareDraft;
    private draftPreparationFailed;
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
    private initializeDefaultWorkspace;
    /** @returns true when an archived current selection was cleared. */
    private clearArchivedCurrent;
    private clearMain;
    private replaceMain;
}
