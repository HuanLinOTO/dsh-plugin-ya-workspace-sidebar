# ya-workspace-sidebar Agent Guide

- Bundle patch disables official `ui-workspace`; this plugin must continue to provide both `sidebar.workspaces` and `conversation.hero.workspace`.
- Since DSH v0.1.2-alpha.1 the official ui-sidebar/ui-conversation/ui-agent-preset and directory-picker client entries inject the `uiWorkspace` service; this plugin's client entry provides the stand-in (`src/client/navigation.ts`) carrying the reuse-or-create, current/recent fallback, archived-current clearing, and boot auto-selection semantics. Removing it re-creates the WebUI boot deadlock.
- `dsh/` is read-only. Do not patch official client packages.
- Recent Sessions is global, newest-first, virtual-scrolled (fixed 35px row stride, bounded scroll viewport, shows the full recency list rather than five rows), and hidden during search.
- A draggable (and arrow-key adjustable, double-click resettable) separator between Recent Sessions and the workspace browser sets the recent viewport height; the preference persists per-browser in `localStorage` and clamps so the workspace area keeps a minimum.
- Root navigation lists real workspaces plus virtual Ungrouped, grouped by local calendar date of last session activity (Ungrouped participates; undated rows trail without a header); each row shows relative last-used time instead of session count. Level two lists only the selected workspace's sessions.
- Manual breadcrumb back remains at root until the current session id changes.
- Real workspace level groups sessions by local calendar date (newest date first, `updatedAt` descending within a group); drag-to-reorder is disabled.
- Build artifacts in `lib/` are prebuilt and must remain publishable.
