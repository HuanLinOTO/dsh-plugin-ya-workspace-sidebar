# 会话右键菜单（置顶 / 未读 / 路径操作）设计

- 日期：2026-09-14
- 状态：待用户确认（三项假设见「开放问题」）
- 范围：`ya-workspace-sidebar` 插件，session 行右键菜单 + 菜单项扩充

## 目标

session 行（最近会话 / 工作区二级列表 / 搜索结果三处）支持鼠标右键弹出完整菜单；
现有 … 按钮菜单同步扩充为同一份菜单。菜单按用户需求分两部分：

```
第一部分（会话管理）        第二部分（路径与系统）
────────────────          ──────────────────────
置顶 / 取消置顶             在资源管理器中打开
重命名                      复制路径
分支（现有）                 复制任务路径
标记为未读 / 标记为已读       复制日志路径
──────                     复制会话 ID
归档 / 删除（现有）
```

## 非目标

- 置顶 / 未读不跨设备同步（浏览器 localStorage，与 actionMode / recentHeight 同策略）
- 不改 Host 会话数据：置顶、未读是纯客户端视图概念，不进会话日志
- 搜索结果不应用置顶排序（按匹配展示）
- 不做 sqlite 部署的日志导出 / 打开

## 关键事实（调查结论）

1. DSH 无 pin / unread 服务 API → 插件本地实现。
2. `SessionSummary` 携带 `cwd`；`SessionRow` 目前未透传 → 补上。
3. jsonl 部署（DSH 默认）布局：`$DSH_HOME/sessions/--<projectKey(cwd)>--/<encodeSegment(id)>/vN.jsonl(.zstd)`；
   官方包 `@deepseek-ai/dsh-session-persistence-jsonl` 导出 `sessionDir` / `parseGenerationLogFilename` 等纯函数。
4. **本机实际部署是 `@morlay/better-session`（sqlite，sessions.sqlite）**：会话没有独立目录 / 日志文件 →
   任务路径、日志路径两项需要 Host 探测，不存在则禁用。
5. 浏览器不能 spawn 进程 → 「在资源管理器中打开」走 Host 路由（DSH-better-sidebar 先例：
   `ctx.webServer.register` + `explorer.exe /select,` / `open -R` / `xdg-open`）。
6. 右键菜单定位：`Menu` 组件 `portal` + `getAnchorRect={() => new DOMRect(x, y, 0, 0)}` + `anchor={<span />}`。
7. 剪贴板：`writeClipboard`（`@deepseek-ai/dsh-client-ui-primitives`，失败返回 false）。

## 方案

### 菜单语义

| 菜单项 | 行为 | 可用性 |
|---|---|---|
| 置顶 / 取消置顶 | 本地 pinned 集合增删；置顶行在最近列表与工作区列表最上方成组展示（含 📌 标记） | 非 blank 会话 |
| 重命名 | 复用现有 rename Modal | 非 blank |
| 分支 | 现有 forkSession | 非 blank |
| 标记为未读 / 标记为已读 | 本地 unread 集合；未读行标题加粗 + 状态槽蓝点；`open(id)` 时自动清除 | 非 blank |
| 在资源管理器中打开 | Host 路由 reveal `cwd`（目录） | 需 `cwd` 存在 |
| 复制路径 | `writeClipboard(cwd)` | 需 `cwd` |
| 复制任务路径 | Host 探测会话存储目录存在 → 复制 | jsonl 部署 |
| 复制日志路径 | Host 探测目录内最新 `vN.jsonl(.zstd)` → 复制 | jsonl 部署 |
| 复制会话 ID | `writeClipboard(sessionId)` | 总是 |

状态点优先级：pendingInteraction > running > **unread（蓝点）** > completed（绿点）。
菜单打开时预取路径探测结果（本地 fs，毫秒级）；未返回或不可用时对应项禁用并带 tooltip 说明。

### 客户端改动

- `model.ts`：`SessionRow` 增加 `cwd?: string`（`rowOf` 透传）；新增纯函数
  `applyPinned(rows, pinnedOrder)`（置顶行按置顶顺序提到最前）与
  `extractPinnedGroups(groups, pinnedOrder)`（从日期分组中抽出置顶行组成最上「置顶」组）。
- 新文件 `session-flags.ts`：pinned（有序数组，数组序即展示序，新置顶 unshift 到最前）与
  unread（集合）两个 localStorage store，get / set / subscribe 三件套，模式照抄 `settings.ts`。
- `WorkspaceSidebar.tsx`：
  - `SessionItem` 根节点 `onContextMenu`（preventDefault + 记录坐标 + 打开菜单）；
    菜单与 … 按钮共用一个 `Menu`，`getAnchorRect` 在右键时返回坐标，按钮触发时走 anchor 默认。
  - 打开菜单时预取 `resolveSessionPaths`；unread/pinned 变化经 store 订阅重渲染。
  - `open` 包装：点击行打开会话时 `markRead(id)`。
  - 排序：`deriveRecent` 结果过 `applyPinned`；工作区二级列表过 `extractPinnedGroups`。
- `contract.ts`：`SidebarInjected` 增加 `revealInExplorer(cwd)` 与
  `resolveSessionPaths({ sessionId, cwd? }) → { dir: string | null; log: string | null }`。
- `client/index.ts`：两个注入方法实现（同源 fetch 插件 Host 路由）。
- `locales.ts` / `dictionaries.ts`：zh / en 词条。

### Host 半场改动（`src/index.ts`）

- `export const inject = ['webServer']`（web profile 独占插件，CLI profile 不装；缺服务时插件静默等待，无副作用）。
- 注册两条 exact 路由（均 POST + JSON，经 trust fence：Host 头 loopback/trusted + Sec-Fetch-Site/Origin 校验，
  精简自 DSH-better-sidebar `trust-fence.ts`）：
  - `/ya-workspace-sidebar/paths`：body `{ sessionId, cwd? }` → 用官方包计算
    `sessionDir(dshHomePath('sessions'), cwd, sessionId)`，readdir 探测目录与其中版本号最大的
    `vN.jsonl(.zstd)`；返回 `{ dir, log }`（不存在为 null）。
  - `/ya-workspace-sidebar/reveal`：body `{ path }` → 校验绝对路径 + stat 为目录 → 平台 opener
    （win32 `explorer.exe`、darwin `open`、其他 `xdg-open`，detached spawn，argv 数组无 shell）。
- peerDependencies 增加 `@deepseek-ai/dsh-session-persistence-jsonl`、`@deepseek-ai/dsh-home-paths`
  （均为 base bundle 依赖，web profile node_modules 必在）；devDependencies 对应 link: 钉到本机 checkout。

### 测试（Unit，vitest，随插件仓库）

- `session-flags.spec.ts`：pinned/unread 读写、订阅通知、持久化失败静默。
- `model.spec.ts` 扩展：cwd 透传、applyPinned、extractPinnedGroups（含空/全置顶/混合）。
- host 路径计算 spec：临时目录造 `--proj--/<id>/v2.jsonl + v3.jsonl.zstd` 断言探测结果；目录缺失 → null。
- reveal 命令纯函数 spec（平台参数化，win32/darwin/linux 三分支）。

## 错误处理

- 路由 fetch 失败 / 非 2xx：菜单项禁用，tooltip 显示「不可用」；不抛错不闪 toast。
- 剪贴板拒绝：静默（writeClipboard 返回 false 不显示成功反馈，与 better-sidebar 同策）。
- reveal spawn 失败：child error 吞掉（OS 层提示），路由仍返回 started。
- localStorage 不可用：内存值驱动当次会话（settings.ts 同策）。

## 开放问题（按推荐假设实施，待确认后可改）

1. **「任务路径」= 会话存储目录**（jsonl 部署下每会话一个目录）；「日志路径」= 其内 vN.jsonl。
   若用户意指别的（如 cwd），只需改两个词条指向。
2. **右键菜单与 … 菜单合一**，两处入口同一份菜单。
3. **sqlite 部署降级**：任务路径 / 日志路径菜单项禁用 + tooltip 说明，不降级为 sqlite 文件路径。
