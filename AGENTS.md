# ya-workspace-sidebar Agent Guide

- Bundle patch disables official `ui-workspace`; this plugin must continue to provide both `sidebar.workspaces` and `conversation.hero.workspace`.
- `dsh/` is read-only. Do not patch official client packages.
- Recent Sessions is global, newest-first, capped at five, and hidden during search.
- Root navigation lists real workspaces plus virtual Ungrouped, grouped by local calendar date of last session activity (Ungrouped participates; undated rows trail without a header); each row shows relative last-used time instead of session count. Level two lists only the selected workspace's sessions.
- Manual breadcrumb back remains at root until the current session id changes.
- Real workspace level groups sessions by local calendar date (newest date first, `updatedAt` descending within a group); drag-to-reorder is disabled.
- Build artifacts in `lib/` are prebuilt and must remain publishable.
