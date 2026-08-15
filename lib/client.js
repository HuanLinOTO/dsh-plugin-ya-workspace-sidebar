window.__ModuleLoader__.load({
	id: "@huanlin/dsh-plugin-ya-workspace-sidebar",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/locales.ts
		/** Product copy for the replacement workspace browser. */
		const zh = {
			workspaces: "工作区",
			sessions: "会话",
			recent: "最近会话",
			ungrouped: "未分组",
			newSession: "新会话",
			untitled: "未命名会话",
			addWorkspace: "添加工作区",
			addWorkspaceMenu: "添加工作区…",
			search: "搜索会话",
			searchPlaceholder: "搜索名称、关键词…",
			clearSearch: "清除搜索",
			searching: "正在搜索会话历史…",
			searchUnavailable: "内容搜索暂不可用，仅显示名称匹配。",
			noMatches: "无匹配会话",
			noSessions: "暂无会话",
			noWorkspaces: "暂无工作区",
			loading: "正在加载工作区…",
			rename: "重命名",
			renameWorkspace: "重命名工作区",
			renameSession: "重命名会话",
			deleteWorkspace: "删除工作区",
			deleteDescription: "将把“{name}”从工作区列表中移除。文件夹与会话记录会保留。",
			fork: "分叉会话",
			archive: "归档会话",
			cancel: "取消",
			confirm: "确认",
			retry: "重新选择",
			folderError: "无法打开文件夹",
			workspaceName: "工作区名称",
			sessionName: "会话名称",
			count: "{n} 个会话",
			now: "刚刚",
			minutes: "{n}分钟",
			hours: "{n}小时",
			days: "{n}天",
			months: "{n}个月",
			years: "{n}年",
			running: "进行中",
			waiting: "等待交互",
			completed: "已完成",
			collapse: "折叠",
			expand: "展开"
		};
		const en = {
			workspaces: "Workspaces",
			sessions: "Sessions",
			recent: "Recent Sessions",
			ungrouped: "Ungrouped",
			newSession: "New Session",
			untitled: "Untitled session",
			addWorkspace: "Add workspace",
			addWorkspaceMenu: "Add workspace…",
			search: "Search sessions",
			searchPlaceholder: "Search name, keywords...",
			clearSearch: "Clear search",
			searching: "Searching session history…",
			searchUnavailable: "Content search is unavailable. Showing name matches.",
			noMatches: "No matching sessions",
			noSessions: "No sessions yet",
			noWorkspaces: "No workspaces yet",
			loading: "Loading workspaces…",
			rename: "Rename",
			renameWorkspace: "Rename workspace",
			renameSession: "Rename session",
			deleteWorkspace: "Delete workspace",
			deleteDescription: "This removes “{name}” from the workspace list. The folder and session logs remain.",
			fork: "Fork session",
			archive: "Archive session",
			cancel: "Cancel",
			confirm: "Confirm",
			retry: "Choose again",
			folderError: "Couldn’t open folder",
			workspaceName: "Workspace name",
			sessionName: "Session name",
			count: "{n} sessions",
			now: "now",
			minutes: "{n}min",
			hours: "{n}h",
			days: "{n}d",
			months: "{n}mo",
			years: "{n}y",
			running: "Running",
			waiting: "Waiting for interaction",
			completed: "Completed",
			collapse: "Collapse",
			expand: "Expand"
		};
		const NS = "ya-workspace-sidebar";
		//#endregion
		//#region src/client/styles.ts
		/** One scoped stylesheet injected for the lifetime of the client activation. */
		const CSS = `
[data-ya-workspace-sidebar] { flex:1; min-height:0; display:flex; flex-direction:column; box-sizing:border-box; padding-right:var(--dsh-sidebar-inline-padding); color:var(--dsw-alias-label-primary); }
[data-ya-workspace-sidebar].ya-rail { padding-right:0; }
.ya-section-header { flex:none; height:36px; display:flex; align-items:center; justify-content:flex-end; gap:4px; padding-left:12px; margin-bottom:4px; box-sizing:border-box; color:var(--dsw-alias-label-tertiary); }
.ya-section-title { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:14px; }
.ya-icon-button { flex:none; width:28px; height:28px; border:0; border-radius:50%; padding:0; display:inline-flex; align-items:center; justify-content:center; color:var(--dsw-alias-label-secondary); background:transparent; cursor:pointer; }
.ya-icon-button:hover { background:var(--dsw-alias-interactive-bg-hover); }
.ya-search { flex:none; height:38px; margin:0 2px 10px; padding:0 14px; display:flex; align-items:center; gap:8px; box-sizing:border-box; border:1px solid var(--dsw-alias-border-l2); border-radius:24px; background:var(--dsw-static-neutral-bluish-75); color:var(--dsw-alias-label-caption); }
body[data-ds-dark-theme] .ya-search { background:var(--dsw-static-neutral-bluish-900); }
.ya-search-input { flex:1; min-width:0; border:0; outline:0; background:transparent; color:var(--dsw-alias-label-primary); font:inherit; font-size:14px; }
.ya-search-input::placeholder { color:var(--dsw-alias-label-tertiary); }
.ya-search-icon { flex:none; display:inline-flex; border:0; padding:0; color:inherit; background:transparent; }
.ya-body { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; margin-right:calc(-1 * var(--dsh-sidebar-inline-padding)); padding-right:var(--dsh-sidebar-inline-padding); }
.ya-recent { flex:none; padding-bottom:8px; border-bottom:1px solid var(--dsw-alias-border-l2); }
.ya-recent-collapsed { padding-bottom:0; border-bottom-color:transparent; }
.ya-recent-list-wrap { display:grid; grid-template-rows:1fr; transition:grid-template-rows 220ms ease-out; }
.ya-recent-collapsed .ya-recent-list-wrap { grid-template-rows:0fr; }
.ya-recent-list { display:flex; flex-direction:column; overflow:hidden; min-height:0; }
.ya-block-label { height:26px; display:flex; align-items:center; gap:2px; padding:0 8px; color:var(--dsw-alias-label-tertiary); font-size:12px; font-weight:600; letter-spacing:.02em; text-transform:uppercase; }
.ya-block-label-toggle { flex:none; width:20px; height:20px; margin-left:auto; border:0; border-radius:6px; padding:0; display:inline-flex; align-items:center; justify-content:center; background:transparent; color:var(--dsw-alias-label-tertiary); cursor:pointer; transition:transform 180ms ease-out; }
.ya-block-label-toggle:hover { background:var(--dsw-alias-interactive-bg-hover); color:var(--dsw-alias-label-secondary); }
.ya-block-label-toggle.ya-collapsed { transform:rotate(-90deg); }
.ya-breadcrumb { flex:none; height:34px; display:flex; align-items:center; gap:2px; padding:0 6px; color:var(--dsw-alias-label-tertiary); font-size:13px; }
.ya-crumb { border:0; padding:4px 3px; border-radius:6px; background:transparent; color:inherit; font:inherit; cursor:default; min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
button.ya-crumb:hover { background:var(--dsw-alias-interactive-bg-hover); color:var(--dsw-alias-label-primary); cursor:pointer; }
.ya-scroll { flex:1; min-height:0; overflow-y:auto; padding-bottom:12px; }
.ya-row { position:relative; min-height:34px; display:flex; align-items:center; gap:6px; margin:1px 0; padding:0 7px; border-radius:9px; box-sizing:border-box; color:var(--dsw-alias-label-primary); cursor:pointer; user-select:none; }
.ya-row:hover, .ya-row.ya-menu-open { background:var(--dsw-alias-interactive-bg-hover); }
.ya-row.ya-selected { background:var(--dsw-alias-interactive-bg-selected); }
.ya-workspace-row { min-height:40px; }
.ya-row-main { flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center; }
.ya-row-line { display:flex; align-items:center; min-width:0; gap:6px; }
.ya-row-title { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; line-height:18px; }
.ya-row-meta { flex:none; color:var(--dsw-alias-label-tertiary); font-size:11px; white-space:nowrap; }
.ya-workspace-path { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--dsw-alias-label-tertiary); font-size:11px; line-height:15px; }
.ya-row-actions { flex:none; display:flex; align-items:center; gap:2px; opacity:0; pointer-events:none; transition:opacity 120ms ease-out; }
.ya-row:hover .ya-row-actions, .ya-menu-open .ya-row-actions { opacity:1; pointer-events:auto; }
.ya-status-slot { flex:none; width:16px; height:16px; display:inline-flex; align-items:center; justify-content:center; color:var(--dsw-alias-label-tertiary); }
.ya-recent .ya-row { min-height:31px; }
.ya-search-workspace { color:var(--dsw-alias-label-tertiary); font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ya-empty, .ya-status { padding:18px 10px; color:var(--dsw-alias-label-tertiary); text-align:center; font-size:13px; }
.ya-warning { color:var(--dsw-alias-status-warning); }
.ya-rename-input { width:100%; height:38px; box-sizing:border-box; border:1px solid var(--dsw-alias-border-l2); border-radius:9px; padding:0 11px; background:transparent; color:var(--dsw-alias-label-primary); outline:none; }
.ya-error { margin-top:8px; color:var(--dsw-alias-status-error); font-size:12px; }
.ya-drop-before::before, .ya-drop-after::after { content:''; position:absolute; left:8px; right:8px; height:2px; border-radius:2px; background:var(--dsw-alias-label-link); }
.ya-drop-before::before { top:-2px; } .ya-drop-after::after { bottom:-2px; }
.ya-rail .ya-section-header { padding-left:0; margin-bottom:12px; }
.ya-rail .ya-icon-button, .ya-rail .ya-search { width:36px; height:36px; padding:0; margin:0 0 12px; border-color:transparent; background:transparent; }
.ya-rail .ya-search { justify-content:center; }
.ya-rail .ya-search-icon { cursor:pointer; color:var(--dsw-alias-label-primary); }
.ya-picker-error { color:var(--dsw-alias-status-error); white-space:pre-wrap; }
@keyframes ya-slide-in-forward { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } }
@keyframes ya-slide-in-backward { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
.ya-level-enter-forward { animation:ya-slide-in-forward 180ms ease-out; }
.ya-level-enter-backward { animation:ya-slide-in-backward 180ms ease-out; }
`;
		/** Install the stylesheet and return its disposer. */
		function installStyles() {
			const style = document.createElement("style");
			style.setAttribute("data-ya-workspace-sidebar-style", "");
			style.textContent = CSS;
			document.head.appendChild(style);
			return () => {
				style.remove();
			};
		}
		//#endregion
		//#region src/client/WorkspacePicker.tsx
		const ADD = "::ya-add-workspace";
		/** Render the workspace target menu and directory picking conversation. */
		function WorkspacePickFlow({ t, open, anchorRef, useWorkspaces, createWorkspace, useDirectoryFlow, renderDirectoryFlow, onPick, onClose, addOnly = false, side = "bottom", selectedId }) {
			const snapshot = useWorkspaces((state) => state);
			const flowAvailable = useDirectoryFlow((value) => value);
			const [flowOpen, setFlowOpen] = (0, react.useState)(false);
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const getAnchorRect = (0, react.useCallback)(() => anchorRef?.current?.getBoundingClientRect() ?? null, [anchorRef]);
			(0, react.useEffect)(() => {
				if (flowOpen && !flowAvailable) setFlowOpen(false);
			}, [flowAvailable, flowOpen]);
			const openFlow = (0, react.useCallback)(() => {
				onClose();
				setError(null);
				setFlowOpen(true);
			}, [onClose]);
			const addEntries = flowAvailable ? [{
				id: ADD,
				label: t("addWorkspaceMenu"),
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, { size: 16 }),
				disabled: flowOpen || busy
			}] : [];
			const pinnedAdd = !addOnly && snapshot.items.length > 0;
			const items = pinnedAdd ? snapshot.items.map((workspace) => ({
				id: workspace.workspaceId,
				label: workspace.title,
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderClose16, { size: 16 }),
				disabled: flowOpen || busy
			})) : addEntries;
			const settled = addOnly || snapshot.phase === "ready";
			const onlyAdd = !pinnedAdd && settled && addEntries.length === 1;
			(0, react.useEffect)(() => {
				if (open && onlyAdd && !flowOpen && !busy) openFlow();
			}, [
				busy,
				flowOpen,
				onlyAdd,
				open,
				openFlow
			]);
			const owner = {
				open: flowOpen,
				busy,
				onPicked: (path) => {
					setBusy(true);
					createWorkspace({ path }).then((workspace) => {
						setFlowOpen(false);
						onPick(workspace.workspaceId);
					}).catch((reason) => {
						setFlowOpen(false);
						setError(reason instanceof Error ? reason.message : String(reason));
					}).finally(() => {
						setBusy(false);
					});
				},
				onCancel: () => {
					setFlowOpen(false);
				},
				onError: (message) => {
					setFlowOpen(false);
					setError(message);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
					open: open && !onlyAdd && items.length > 0,
					anchor: null,
					items,
					...pinnedAdd ? { footer: addEntries } : {},
					selectedId,
					onSelect: (id) => {
						if (id === ADD) openFlow();
						else onPick(id);
					},
					onClose,
					side,
					portal: true,
					getAnchorRect
				}),
				open && !onlyAdd && snapshot.phase === "pending" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "ya-status",
					children: t("loading")
				}),
				renderDirectoryFlow(owner),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open: error !== null,
					onClose: () => {
						setError(null);
					},
					closeLabel: t("cancel"),
					title: t("folderError"),
					footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						onClick: () => {
							setError(null);
						},
						children: t("cancel")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						disabled: !flowAvailable,
						onClick: openFlow,
						children: t("retry")
					})] }),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "ya-picker-error",
						role: "alert",
						children: error
					})
				})
			] });
		}
		/** Fill the conversation hero's workspace picker seat. */
		function WorkspacePicker({ open, anchorRef, useWorkspaces, selectedId, onPick, onClose, createWorkspace, useDirectoryFlow, renderSlot, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WorkspacePickFlow, {
				t,
				open,
				anchorRef,
				useWorkspaces,
				selectedId,
				onPick,
				onClose,
				createWorkspace,
				useDirectoryFlow,
				renderDirectoryFlow: (owner) => renderSlot("conversation.hero.workspace.directoryFlow", owner)
			});
		}
		//#endregion
		//#region src/client/model.ts
		/** Navigation key for sessions not accounted to a real workspace. */
		const UNGROUPED = "__ya_ungrouped__";
		function visible(summary, current, archived) {
			return summary.origin !== "subagent" && !archived.has(summary.id) && (!summary.blank || summary.id === current);
		}
		function rowOf(summary, workspaceKey, workspaceTitle) {
			return {
				id: summary.id,
				title: summary.blank ? "New Session" : summary.displayTitle,
				hasTitle: summary.title !== void 0,
				blank: summary.blank,
				running: summary.running,
				...summary.pendingInteraction === void 0 ? {} : { pendingInteraction: summary.pendingInteraction },
				completed: summary.completed === true,
				updatedAt: summary.updatedAt,
				workspaceKey,
				workspaceTitle
			};
		}
		function ownerIndex(workspaces) {
			const result = /* @__PURE__ */ new Map();
			for (const workspace of workspaces) for (const sessionId of workspace.sessionIds) result.set(sessionId, workspace);
			return result;
		}
		/** Resolve the first/second-level destination for one session. */
		function workspaceKeyForSession(sessionId, workspaces) {
			if (sessionId === void 0) return null;
			return ownerIndex(workspaces).get(sessionId)?.workspaceId ?? "__ya_ungrouped__";
		}
		/** Derive global recent sessions, newest first. */
		function deriveRecent(list, workspaces, archivedSessionIds, limit = 5) {
			const archived = new Set(archivedSessionIds);
			const owners = ownerIndex(workspaces);
			return list.ids.map((id) => list.byId[id]).filter((summary) => summary !== void 0 && visible(summary, list.current, archived)).sort((a, b) => b.updatedAt - a.updatedAt || String(a.id).localeCompare(String(b.id))).slice(0, limit).map((summary) => {
				const workspace = owners.get(summary.id);
				return rowOf(summary, workspace?.workspaceId ?? "__ya_ungrouped__", workspace?.title ?? "Ungrouped");
			});
		}
		/** Derive first-level real workspaces plus the virtual Ungrouped row. */
		function deriveWorkspaces(list, workspaces, archivedSessionIds) {
			const archived = new Set(archivedSessionIds);
			const accounted = /* @__PURE__ */ new Set();
			const result = workspaces.map((workspace) => {
				let count = 0;
				for (const id of workspace.sessionIds) {
					accounted.add(id);
					const summary = list.byId[id];
					if (summary !== void 0 && visible(summary, list.current, archived)) count++;
				}
				return {
					key: workspace.workspaceId,
					title: workspace.title,
					path: workspace.path,
					createdAt: workspace.createdAt,
					count,
					real: true
				};
			});
			let ungrouped = 0;
			for (const id of list.ids) {
				const summary = list.byId[id];
				if (summary !== void 0 && !accounted.has(id) && visible(summary, list.current, archived)) ungrouped++;
			}
			result.push({
				key: UNGROUPED,
				title: "Ungrouped",
				count: ungrouped,
				real: false
			});
			return result;
		}
		/** Derive the selected workspace's sessions in its canonical order. */
		function deriveWorkspaceSessions(key, list, workspaces, archivedSessionIds) {
			const archived = new Set(archivedSessionIds);
			if (key === "__ya_ungrouped__") {
				const accounted = new Set(workspaces.flatMap((workspace) => workspace.sessionIds));
				return list.ids.map((id) => list.byId[id]).filter((summary) => summary !== void 0 && !accounted.has(summary.id) && visible(summary, list.current, archived)).sort((a, b) => b.updatedAt - a.updatedAt || String(a.id).localeCompare(String(b.id))).map((summary) => rowOf(summary, UNGROUPED, "Ungrouped"));
			}
			const workspace = workspaces.find((item) => item.workspaceId === key);
			if (workspace === void 0) return [];
			return workspace.sessionIds.map((id) => list.byId[id]).filter((summary) => summary !== void 0 && visible(summary, list.current, archived)).map((summary) => rowOf(summary, workspace.workspaceId, workspace.title));
		}
		/** Case-insensitive local title/workspace matching used beside Host content search. */
		function localMatches(rows, query) {
			const normalized = query.trim().toLocaleLowerCase();
			if (normalized === "") return [];
			return rows.filter((row) => `${row.title}\n${row.workspaceTitle}`.toLocaleLowerCase().includes(normalized));
		}
		//#endregion
		//#region src/client/WorkspaceSidebar.tsx
		/** Two-level workspace/session browser with a persistent global recent block. */
		const SEARCH_DEBOUNCE_MS = 250;
		const SEARCH_MAX = 500;
		function sanitized(value) {
			return value.replaceAll("\0", "").slice(0, SEARCH_MAX);
		}
		function relativeTime(updatedAt, now, t) {
			const diff = Math.max(0, now - updatedAt);
			const minute = 6e4;
			if (diff < minute) return t("now");
			if (diff < 60 * minute) return t("minutes", { n: Math.floor(diff / minute) });
			if (diff < 1440 * minute) return t("hours", { n: Math.floor(diff / (60 * minute)) });
			if (diff < 43200 * minute) return t("days", { n: Math.floor(diff / (1440 * minute)) });
			if (diff < 525600 * minute) return t("months", { n: Math.floor(diff / (43200 * minute)) });
			return t("years", { n: Math.floor(diff / (525600 * minute)) });
		}
		function SessionStatus({ row }) {
			if (row.pendingInteraction !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "warning" });
			if (row.running) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" });
			if (row.completed) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "done" });
			return null;
		}
		function rowHalf(event) {
			const rect = event.currentTarget.getBoundingClientRect();
			return event.clientY < rect.top + rect.height / 2 ? "before" : "after";
		}
		function SessionItem({ row, current, now, open, rename, fork, archive, t, context, drag }) {
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			const title = row.blank ? t("newSession") : row.hasTitle ? row.title : t("untitled");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `ya-row${row.id === current ? " ya-selected" : ""}${menuOpen ? " ya-menu-open" : ""}${drag?.marker === "before" ? " ya-drop-before" : ""}${drag?.marker === "after" ? " ya-drop-after" : ""}`,
				role: "treeitem",
				"aria-selected": row.id === current,
				draggable: drag !== void 0,
				onClick: () => {
					open(row.id);
				},
				onDragStart: drag === void 0 ? void 0 : (event) => {
					event.dataTransfer.effectAllowed = "move";
					drag.start();
				},
				onDragEnd: drag?.end,
				onDragOver: drag === void 0 ? void 0 : (event) => {
					if (!drag.active) return;
					event.preventDefault();
					event.dataTransfer.dropEffect = "move";
					drag.hover(rowHalf(event));
				},
				onDrop: drag === void 0 ? void 0 : (event) => {
					if (!drag.active) return;
					event.preventDefault();
					drag.drop(rowHalf(event));
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "ya-status-slot",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionStatus, { row })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "ya-row-main",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "ya-row-line",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "ya-row-title",
								children: title
							}), !row.blank && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "ya-row-meta ya-row-time",
								children: relativeTime(row.updatedAt, now, t)
							})]
						}), context === true && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "ya-search-workspace",
							children: row.workspaceTitle
						})]
					}),
					!row.blank && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "ya-row-actions",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
							open: menuOpen,
							onClose: () => {
								setMenuOpen(false);
							},
							items: [
								{
									id: "rename",
									label: t("rename"),
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutline16, {})
								},
								{
									id: "fork",
									label: t("fork"),
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBranchOutline16, {})
								},
								{
									id: "archive",
									label: t("archive"),
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconArchiveOutline20, { size: 16 })
								}
							],
							onSelect: (id) => {
								setMenuOpen(false);
								if (id === "rename") rename(row);
								if (id === "fork") fork(row.id);
								if (id === "archive") archive(row.id);
							},
							portal: true,
							closeOnPointerLeave: true,
							anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ya-icon-button",
								"aria-label": `${title} actions`,
								onClick: (event) => {
									event.stopPropagation();
									setMenuOpen((value) => !value);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEllipsisOutline16, {})
							})
						})
					})
				]
			});
		}
		function WorkspaceItem({ row, enter, create, rename, remove, t }) {
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `ya-row ya-workspace-row${menuOpen ? " ya-menu-open" : ""}`,
				role: "treeitem",
				onClick: enter,
				title: row.path,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "ya-status-slot",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderClose16, {})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "ya-row-main",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "ya-row-line",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "ya-row-title",
								children: row.real ? row.title : t("ungrouped")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "ya-row-meta",
								children: t("count", { n: row.count })
							})]
						}), row.path !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "ya-workspace-path",
							children: row.path
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "ya-row-actions",
						children: [row.real && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
							open: menuOpen,
							onClose: () => {
								setMenuOpen(false);
							},
							items: [{
								id: "rename",
								label: t("rename"),
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutline16, {})
							}, {
								id: "delete",
								label: t("deleteWorkspace"),
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutline16, {}),
								danger: true
							}],
							onSelect: (id) => {
								setMenuOpen(false);
								if (id === "rename") rename();
								if (id === "delete") remove();
							},
							portal: true,
							closeOnPointerLeave: true,
							anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ya-icon-button",
								onClick: (event) => {
									event.stopPropagation();
									setMenuOpen((value) => !value);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEllipsisOutline16, {})
							})
						}), row.real && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ya-icon-button",
							onClick: (event) => {
								event.stopPropagation();
								create();
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, {})
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, {})
				]
			});
		}
		/** Fill `sidebar.workspaces` with the replacement browser. */
		function WorkspaceSidebar(props) {
			const { wide, expandSidebar, useSessions, useWorkspaces, startSession, open, searchSessions, searchResultLimit, renameSession, forkSession, renameWorkspace, deleteWorkspace, archiveSession, insertSessionBefore, createWorkspace, useDirectoryFlow, renderSlot, t } = props;
			const sessions = useSessions((state) => state);
			const workspaceState = useWorkspaces((state) => state);
			const workspaces = workspaceState.items;
			const archived = workspaceState.archivedSessionIds;
			const directoryFlowAvailable = useDirectoryFlow((value) => value);
			const allRows = (0, react.useMemo)(() => deriveRecent(sessions, workspaces, archived, Number.MAX_SAFE_INTEGER), [
				archived,
				sessions,
				workspaces
			]);
			const recent = allRows.slice(0, 5);
			const workspaceRows = (0, react.useMemo)(() => deriveWorkspaces(sessions, workspaces, archived), [
				archived,
				sessions,
				workspaces
			]);
			const [selectedKey, setSelectedKey] = (0, react.useState)(null);
			const [direction, setDirection] = (0, react.useState)("forward");
			const [hasMounted, setHasMounted] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				setHasMounted(true);
			}, []);
			const observedCurrent = (0, react.useRef)(void 0);
			const initialized = (0, react.useRef)(false);
			(0, react.useEffect)(() => {
				if (initialized.current && observedCurrent.current === sessions.current) return;
				initialized.current = true;
				observedCurrent.current = sessions.current;
				if (sessions.current !== void 0) {
					setDirection("forward");
					setSelectedKey(workspaceKeyForSession(sessions.current, workspaces));
				}
			}, [sessions.current, workspaces]);
			(0, react.useEffect)(() => {
				if (selectedKey !== null && selectedKey !== "__ya_ungrouped__" && !workspaces.some((workspace) => workspace.workspaceId === selectedKey)) setSelectedKey(UNGROUPED);
			}, [selectedKey, workspaces]);
			const selectedWorkspace = selectedKey === null || selectedKey === "__ya_ungrouped__" ? void 0 : workspaces.find((workspace) => workspace.workspaceId === selectedKey);
			const levelRows = selectedKey === null ? [] : deriveWorkspaceSessions(selectedKey, sessions, workspaces, archived);
			const now = Date.now();
			const [query, setQuery] = (0, react.useState)("");
			const normalizedQuery = sanitized(query).trim();
			const [remote, setRemote] = (0, react.useState)({
				query: "",
				status: "idle",
				items: [],
				hasMore: false
			});
			(0, react.useEffect)(() => {
				if (normalizedQuery === "") {
					setRemote({
						query: "",
						status: "idle",
						items: [],
						hasMore: false
					});
					return;
				}
				const controller = new AbortController();
				setRemote({
					query: normalizedQuery,
					status: "loading",
					items: [],
					hasMore: false
				});
				const timer = window.setTimeout(() => {
					searchSessions(normalizedQuery, controller.signal).then((result) => {
						if (!controller.signal.aborted) setRemote({
							query: normalizedQuery,
							status: "ready",
							items: result.items,
							hasMore: result.hasMore
						});
					}).catch(() => {
						if (!controller.signal.aborted) setRemote({
							query: normalizedQuery,
							status: "error",
							items: [],
							hasMore: false
						});
					});
				}, SEARCH_DEBOUNCE_MS);
				return () => {
					window.clearTimeout(timer);
					controller.abort();
				};
			}, [normalizedQuery, searchSessions]);
			const searchRows = (0, react.useMemo)(() => {
				if (normalizedQuery === "") return [];
				const byId = new Map(localMatches(allRows, normalizedQuery).map((row) => [row.id, row]));
				if (remote.query === normalizedQuery) for (const item of remote.items) {
					const row = allRows.find((candidate) => candidate.id === item.sessionId);
					if (row !== void 0) byId.set(row.id, row);
				}
				return [...byId.values()].slice(0, searchResultLimit);
			}, [
				allRows,
				normalizedQuery,
				remote,
				searchResultLimit
			]);
			const [pickerOpen, setPickerOpen] = (0, react.useState)(false);
			const pickerAnchor = (0, react.useRef)(null);
			const [recentCollapsed, setRecentCollapsed] = (0, react.useState)(false);
			const [workspaceRename, setWorkspaceRename] = (0, react.useState)(null);
			const [sessionRename, setSessionRename] = (0, react.useState)(null);
			const [renameDraft, setRenameDraft] = (0, react.useState)("");
			const [renameError, setRenameError] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			const [deleteTarget, setDeleteTarget] = (0, react.useState)(null);
			const [drag, setDrag] = (0, react.useState)(null);
			const beginWorkspaceRename = (row) => {
				setWorkspaceRename(row);
				setRenameDraft(row.title);
				setRenameError(null);
			};
			const beginSessionRename = (row) => {
				setSessionRename(row);
				setRenameDraft(row.title);
				setRenameError(null);
			};
			const closeRename = () => {
				if (!busy) {
					setWorkspaceRename(null);
					setSessionRename(null);
					setRenameError(null);
				}
			};
			const commitRename = () => {
				const title = renameDraft.trim();
				if (title === "" || busy) return;
				setBusy(true);
				(workspaceRename !== null && workspaceRename.key !== "__ya_ungrouped__" ? renameWorkspace(workspaceRename.key, title) : sessionRename !== null ? renameSession(sessionRename.id, title) : Promise.resolve()).then(() => {
					setWorkspaceRename(null);
					setSessionRename(null);
				}).catch((reason) => {
					setRenameError(reason instanceof Error ? reason.message : String(reason));
				}).finally(() => {
					setBusy(false);
				});
			};
			const confirmDelete = () => {
				if (deleteTarget === null || deleteTarget.key === "__ya_ungrouped__" || busy) return;
				setBusy(true);
				deleteWorkspace(deleteTarget.key).then(() => {
					setDeleteTarget(null);
				}).catch((reason) => {
					setRenameError(reason instanceof Error ? reason.message : String(reason));
				}).finally(() => {
					setBusy(false);
				});
			};
			const archive = (id) => {
				archiveSession(id).catch((reason) => {
					console.warn("session archive rejected:", reason);
				});
			};
			const fork = (id) => {
				forkSession(id);
			};
			const sessionItem = (row, context = false, index) => {
				const draggable = selectedKey !== null && selectedKey !== "__ya_ungrouped__" && index !== void 0;
				const marker = drag?.over?.id === row.id ? drag.over.half : null;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionItem, {
					row,
					current: sessions.current,
					now,
					open,
					rename: beginSessionRename,
					fork,
					archive,
					t,
					context,
					...draggable && selectedKey !== null && selectedKey !== "__ya_ungrouped__" ? { drag: {
						active: drag !== null,
						marker,
						start: () => {
							setDrag({
								id: row.id,
								over: null
							});
						},
						hover: (half) => {
							setDrag((value) => value === null ? value : {
								...value,
								over: {
									id: row.id,
									half
								}
							});
						},
						drop: (half) => {
							if (drag === null) return;
							const anchor = half === "before" ? row.id : levelRows[(index ?? 0) + 1]?.id;
							const sourceIndex = levelRows.findIndex((item) => item.id === drag.id);
							const anchorIndex = anchor === void 0 ? levelRows.length : levelRows.findIndex((item) => item.id === anchor);
							setDrag(null);
							if (anchor === drag.id || sourceIndex === anchorIndex || sourceIndex + 1 === anchorIndex) return;
							insertSessionBefore(selectedKey, drag.id, anchor).catch((reason) => {
								console.warn("session reorder rejected:", reason);
							});
						},
						end: () => {
							setDrag(null);
						}
					} } : {}
				}, row.id);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				"data-ya-workspace-sidebar": true,
				className: wide ? "" : "ya-rail",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "ya-section-header",
						children: [
							wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "ya-section-title",
								children: t("workspaces")
							}),
							directoryFlowAvailable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								ref: pickerAnchor,
								type: "button",
								className: "ya-icon-button",
								"aria-label": t("addWorkspace"),
								onClick: () => {
									setPickerOpen((value) => !value);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconProjectAddOutline16, { size: wide ? 16 : 18 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(WorkspacePickFlow, {
								t,
								open: pickerOpen,
								anchorRef: pickerAnchor,
								useWorkspaces,
								createWorkspace,
								useDirectoryFlow,
								renderDirectoryFlow: (owner) => renderSlot("sidebar.workspaces.directoryFlow", owner),
								addOnly: true,
								side: "right",
								onPick: (workspaceId) => {
									setPickerOpen(false);
									startSession(workspaceId);
								},
								onClose: () => {
									setPickerOpen(false);
								}
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "ya-search",
						onClick: () => {
							if (!wide) expandSidebar();
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ya-search-icon",
								"aria-label": t("search"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutline16, { size: wide ? 14 : 18 })
							}),
							wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: "ya-search-input",
								value: query,
								maxLength: SEARCH_MAX,
								placeholder: t("searchPlaceholder"),
								onChange: (event) => {
									setQuery(sanitized(event.target.value));
								}
							}),
							wide && query !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ya-icon-button",
								"aria-label": t("clearSearch"),
								onClick: () => {
									setQuery("");
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseFill14, {})
							})
						]
					}),
					wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "ya-body",
						children: normalizedQuery !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "ya-scroll",
							role: "tree",
							"aria-label": t("search"),
							children: [
								searchRows.map((row) => sessionItem(row, true)),
								remote.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "ya-status",
									children: t("searching")
								}),
								remote.status === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "ya-status ya-warning",
									children: t("searchUnavailable")
								}),
								remote.status !== "loading" && searchRows.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "ya-empty",
									children: t("noMatches")
								})
							]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: `ya-recent${recentCollapsed ? " ya-recent-collapsed" : ""}`,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "ya-block-label",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("recent") }), recent.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: `ya-block-label-toggle${recentCollapsed ? " ya-collapsed" : ""}`,
										"aria-label": recentCollapsed ? t("expand") : t("collapse"),
										"aria-expanded": !recentCollapsed,
										onClick: (event) => {
											event.stopPropagation();
											setRecentCollapsed((value) => !value);
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, {})
									})]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "ya-recent-list-wrap",
									children: recent.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "ya-empty",
										children: t("noSessions")
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "ya-recent-list",
										children: recent.map((row) => sessionItem(row, true))
									})
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "ya-breadcrumb",
								children: selectedKey === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "ya-crumb",
									children: t("workspaces")
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "ya-crumb",
										onClick: () => {
											setDirection("backward");
											setSelectedKey(null);
										},
										children: t("workspaces")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, {}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "ya-crumb",
										children: selectedKey === "__ya_ungrouped__" ? t("ungrouped") : selectedWorkspace?.title
									}),
									selectedKey !== "__ya_ungrouped__" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "ya-icon-button",
										"aria-label": t("newSession"),
										onClick: () => {
											startSession(selectedKey);
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, {})
									})
								] })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "ya-scroll",
								role: "tree",
								"aria-label": selectedKey === null ? t("workspaces") : t("sessions"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: hasMounted ? `ya-level-enter-${direction}` : void 0,
									children: [
										selectedKey === null ? workspaceRows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WorkspaceItem, {
											row,
											enter: () => {
												setDirection("forward");
												setSelectedKey(row.key);
											},
											create: () => {
												if (row.key !== "__ya_ungrouped__") startSession(row.key);
											},
											rename: () => {
												beginWorkspaceRename(row);
											},
											remove: () => {
												setDeleteTarget(row);
												setRenameError(null);
											},
											t
										}, row.key)) : levelRows.map((row, index) => sessionItem(row, false, index)),
										selectedKey === null && workspaceRows.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "ya-empty",
											children: t("noWorkspaces")
										}),
										selectedKey !== null && levelRows.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "ya-empty",
											children: t("noSessions")
										})
									]
								}, selectedKey ?? "root")
							})
						] })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: workspaceRename !== null || sessionRename !== null,
						onClose: closeRename,
						closeLabel: t("cancel"),
						title: workspaceRename !== null ? t("renameWorkspace") : t("renameSession"),
						footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: busy,
							onClick: closeRename,
							children: t("cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							disabled: busy || renameDraft.trim() === "",
							onClick: commitRename,
							children: t("rename")
						})] }),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "ya-rename-input",
							value: renameDraft,
							autoFocus: true,
							disabled: busy,
							"aria-label": workspaceRename !== null ? t("workspaceName") : t("sessionName"),
							onChange: (event) => {
								setRenameDraft(event.target.value);
								setRenameError(null);
							}
						}), renameError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "ya-error",
							role: "alert",
							children: renameError
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: deleteTarget !== null,
						onClose: () => {
							if (!busy) setDeleteTarget(null);
						},
						closeLabel: t("cancel"),
						title: t("deleteWorkspace"),
						description: deleteTarget === null ? void 0 : t("deleteDescription", { name: deleteTarget.title }),
						footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: busy,
							onClick: () => {
								setDeleteTarget(null);
							},
							children: t("cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: busy,
							onClick: confirmDelete,
							children: t("deleteWorkspace")
						})] }),
						children: renameError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "ya-error",
							role: "alert",
							children: renameError
						})
					})
				]
			});
		}
		//#endregion
		//#region src/client/index.ts
		/** Services required by both replacement client entries. */
		const inject = [
			"slots",
			"sessions",
			"workspaces",
			"locale"
		];
		/** Register the sidebar browser and conversation hero picker. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ya-workspace-sidebar: dictionaries");
			ctx.effect(installStyles, "ya-workspace-sidebar: styles");
			const flowSource = (name) => ({
				getSnapshot: () => ctx.slots.entries(name).length > 0,
				subscribe: (listener) => ctx.slots.subscribe(name, listener)
			});
			const sidebarFlow = flowSource("sidebar.workspaces.directoryFlow");
			const pickerFlow = flowSource("conversation.hero.workspace.directoryFlow");
			const createWorkspace = (input) => ctx.workspaces.create(input);
			const searchSessions = async (query, signal) => {
				const result = await ctx.sessions.search(query, signal);
				if (!result.ok) throw new Error(result.error.message);
				return result.value;
			};
			const sidebarInjected = () => ({
				startSession: (workspaceId) => {
					ctx.workspaces.startSession(workspaceId);
				},
				open: (sessionId) => {
					ctx.sessions.open(sessionId);
				},
				searchSessions,
				searchResultLimit: ctx.sessions.searchResultLimit,
				renameSession: async (sessionId, title) => {
					const session = ctx.sessions.binding(sessionId)?.session;
					if (session === void 0) throw new Error(`unknown session "${sessionId}"`);
					const result = await session.rename(title);
					if (!result.ok) throw new Error(result.error.message);
				},
				forkSession: (sessionId) => {
					ctx.sessions.fork({
						sessionId,
						increaseTitle: true
					}).then((childId) => {
						ctx.sessions.open(childId);
					}).catch(() => {});
				},
				renameWorkspace: async (workspaceId, title) => {
					await ctx.workspaces.rename(workspaceId, title);
				},
				deleteWorkspace: async (workspaceId) => {
					await ctx.workspaces.delete(workspaceId);
				},
				archiveSession: async (sessionId) => {
					await ctx.workspaces.archiveSession(sessionId);
				},
				insertSessionBefore: async (workspaceId, sessionId, beforeSessionId) => {
					await ctx.workspaces.insertSessionBefore(workspaceId, sessionId, beforeSessionId);
				},
				createWorkspace,
				hooks: { directoryFlow: sidebarFlow }
			});
			const pickerInjected = () => ({
				createWorkspace,
				hooks: { directoryFlow: pickerFlow }
			});
			ctx.slots.inject("sidebar.workspaces", () => ctx.slots.register({
				name: "sidebar.workspaces",
				children: { "sidebar.workspaces.directoryFlow": {
					kind: "single",
					scope: "root"
				} },
				inject: sidebarInjected,
				locale: NS
			}, WorkspaceSidebar));
			ctx.slots.inject("conversation.hero.workspace", () => ctx.slots.register({
				name: "conversation.hero.workspace",
				children: { "conversation.hero.workspace.directoryFlow": {
					kind: "single",
					scope: "root"
				} },
				inject: pickerInjected,
				locale: NS
			}, WorkspacePicker));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map