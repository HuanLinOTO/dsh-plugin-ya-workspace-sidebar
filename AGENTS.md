# ya-workspace-sidebar Agent Guide

- Bundle patch disables official `ui-workspace`; this plugin must continue to provide both `sidebar.workspaces` and `conversation.hero.workspace`.
- `dsh/` is read-only. Do not patch official client packages.
- Recent Sessions is global, newest-first, capped at five, and hidden during search.
- Root navigation lists real workspaces plus virtual Ungrouped; level two lists only the selected workspace's sessions.
- Manual breadcrumb back remains at root until the current session id changes.
- Real workspace level preserves `workspace.sessionIds` order and drag-to-reorder.
- Build artifacts in `lib/` are prebuilt and must remain publishable.
