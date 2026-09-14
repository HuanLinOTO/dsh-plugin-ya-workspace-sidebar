# 会话右键菜单实施计划（置顶 / 未读 / 路径操作）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给 ya-workspace-sidebar 的 session 行加右键菜单（contextmenu）并同步扩充 … 按钮菜单：置顶、重命名、标记未读 + 在资源管理器中打开、复制路径（工作目录）、复制任务路径（会话存储目录）、复制日志路径、复制会话 ID。

**Architecture:** 置顶/未读是浏览器本地概念（localStorage store，照抄 settings.ts 模式）；路径探测与"在资源管理器中打开"走插件 host 半场新增的两条 webServer 路由（client 同源 fetch）；会话存储目录探测自实现 encodeSegment + 目录扫描（不依赖 jsonl 后端包），sqlite 部署（本机 better-session）下探测失败 → 菜单项禁用。

**Tech Stack:** TypeScript / React 18 / cordis 插件双半场（src/index.ts host + src/client browser）/ vitest / tsdown。

**Spec:** `docs/plans/2026-09-14-session-context-menu-design.md`（同目录设计文档，含用户澄清："路径"= 工作目录所在文件夹即 cwd；右键与 … 菜单合一；sqlite 部署路径项禁用）。

## Global Constraints

- `dsh/` checkout 只读；零源码 patch（插件合规红线）。
- 置顶/未读不跨设备同步：localStorage per-browser（与 actionMode 同策），不进会话日志、不调 Host 写接口。
- 皮肤契约：颜色只用 `--dsw-*` / `--dsw-static-*` token，无硬编码色值。
- i18n：新词条进 `src/client/locales.ts`（zh/en），`dictionaries.ts` 的 better-locale 覆盖词典类型放宽为 Partial（缺 key 回退主词典 en）。
- Host bundle（tsdown host 配置）将 `@deepseek-ai/dsh-home-paths` 内联，不加运行时 peer；devDependencies 加 link: 供 typecheck。
- 测试命令：`pnpm test`（vitest run）、`pnpm run typecheck`、`pnpm run build`；workdir 一律 `ya-workspace-sidebar/`。
- 每任务一个 commit；信息用 conventional 风格（feat/test/docs）。

## 文件结构总览

| 文件 | 动作 | 职责 |
|---|---|---|
| `src/client/model.ts` | 修改 | SessionRow 加 cwd；applyPinned / extractPinnedGroups 纯函数 |
| `src/client/session-flags.ts` | 新建 | pinned（有序）/ unread（集合）localStorage store |
| `src/client/contract.ts` | 修改 | SidebarInjected 加 revealInExplorer / resolveSessionPaths |
| `src/client/index.ts` | 修改 | 注入方法实现（同源 fetch 两条 host 路由） |
| `src/client/WorkspaceSidebar.tsx` | 修改 | SessionItem 右键 + 共享菜单 + 置顶/未读视觉与排序 + 路径预取 |
| `src/client/locales.ts` | 修改 | 新词条（zh/en） |
| `src/client/dictionaries.ts` | 修改 | 类型放宽 Partial（现有 19 语言词条不动） |
| `src/client/styles.ts` | 修改 | 未读点 / 置顶标记样式 |
| `src/session-artifacts.ts` | 新建 | encodeSegment + 会话目录/日志文件探测（纯逻辑，fs 注入） |
| `src/reveal.ts` | 新建 | 平台 opener 命令构造 + spawn（argv 数组） |
| `src/trust-fence.ts` | 新建 | Host 头 loopback/trusted + Sec-Fetch-Site/Origin fence |
| `src/index.ts` | 修改 | inject ['webServer']；挂 /paths /reveal 路由（title-cache 逻辑保留） |
| `package.json` | 修改 | devDependencies + link dsh-home-paths；版本 0.7.0 |
| `tests/*.spec.ts` | 新建/修改 | 见各任务 |
| `README.md` / `AGENTS.md` | 修改 | 功能与行为约束文档 |

---

### Task 1: model.ts — cwd 透传 + 置顶排序纯函数

**Files:**
- Modify: `src/client/model.ts`（`rowOf` 约 76-92 行；新增导出在 `deriveRecent` 附近）
- Test: `tests/model.spec.ts`（扩展）

**Interfaces:**
- Consumes: 现有 `SessionRow` / `SessionDateGroup` / `deriveRecent` / `deriveWorkspaceSessionGroups` 签名不变（仅 `SessionRow` 增可选字段）。
- Produces:
  - `SessionRow.cwd?: string`
  - `applyPinned(rows: readonly SessionRow[], pinnedOrder: readonly SessionId[]): SessionRow[]`（置顶行按 pinnedOrder 序提到最前，其余保持原序）
  - `extractPinnedGroups(groups: readonly SessionDateGroup[], pinnedOrder: readonly SessionId[]): { pinned: SessionRow[]; groups: SessionDateGroup[] }`（从日期分组抽出置顶行；返回的 groups 不含置顶行且过滤空组；pinned 按 pinnedOrder 排序）

- [ ] **Step 1: 写失败测试**（追加到 tests/model.spec.ts；先看该文件现有 import 与 helper 复用）

```ts
import { applyPinned, extractPinnedGroups } from '../src/client/model.ts'

describe('session row cwd passthrough', () => {
  it('carries cwd onto derived rows', () => {
    // 复用现有 spec 里的 summary 构造 helper；断言 deriveRecent 结果行带 cwd
    const rows = deriveRecent(listWithCwd, [], [], new Map(), 5)
    expect(rows[0]?.cwd).toBe('D:/proj/a')
  })
})

describe('applyPinned', () => {
  it('lifts pinned rows to the front in pinned order and keeps the rest stable', () => {
    const rows = [row('s1'), row('s2'), row('s3'), row('s4')]
    expect(applyPinned(rows, ['s3', 's1']).map(r => r.id)).toEqual(['s3', 's1', 's2', 's4'])
  })
  it('returns the input order when nothing is pinned', () => {
    const rows = [row('s1'), row('s2')]
    expect(applyPinned(rows, []).map(r => r.id)).toEqual(['s1', 's2'])
  })
  it('ignores pinned ids absent from rows', () => {
    const rows = [row('s1')]
    expect(applyPinned(rows, ['gone', 's1']).map(r => r.id)).toEqual(['s1'])
  })
})

describe('extractPinnedGroups', () => {
  it('pulls pinned rows out of date groups into a leading pinned list and drops emptied groups', () => {
    const groups = [
      { dateKey: '2026-09-14', dayOffset: 0, rows: [row('s1'), row('s2')] },
      { dateKey: '2026-09-13', dayOffset: 1, rows: [row('s3')] },
    ]
    const result = extractPinnedGroups(groups, ['s3', 's1'])
    expect(result.pinned.map(r => r.id)).toEqual(['s3', 's1'])
    expect(result.groups).toEqual([{ dateKey: '2026-09-14', dayOffset: 0, rows: [row('s2')] }])
  })
  it('returns groups unchanged when no row is pinned', () => {
    const groups = [{ dateKey: '2026-09-14', dayOffset: 0, rows: [row('s1')] }]
    expect(extractPinnedGroups(groups, [])).toEqual({ pinned: [], groups })
  })
})
```

（`row(id)` / `listWithCwd` 为本 spec 内构造 `SessionRow` / `SessionListState` 的小 helper，按现有 spec 的夹具风格写。）

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test -- model`
Expected: FAIL —— applyPinned / extractPinnedGroups 未导出。

- [ ] **Step 3: 实现**

`src/client/model.ts`：
1. `SessionRow` 接口加 `cwd?: string`（带 JSDoc：会话工作目录，供路径菜单）。
2. `rowOf` 返回对象加 `...(summary.cwd !== undefined ? { cwd: summary.cwd } : {})`。
3. 新增导出：

```ts
/** Lift pinned rows (in pinned order) to the front; the rest keep their order. */
export function applyPinned(
  rows: readonly SessionRow[],
  pinnedOrder: readonly SessionId[],
): SessionRow[] {
  if (pinnedOrder.length === 0) return [...rows]
  const byId = new Map(rows.map(row => [row.id, row]))
  const pinned: SessionRow[] = []
  for (const id of pinnedOrder) {
    const row = byId.get(id)
    if (row === undefined) continue
    byId.delete(id)
    pinned.push(row)
  }
  return [...pinned, ...byId.values()]
}

/** Split date-grouped rows into a leading pinned list (pinned order) and the remaining groups (emptied groups dropped). */
export function extractPinnedGroups(
  groups: readonly SessionDateGroup[],
  pinnedOrder: readonly SessionId[],
): { pinned: SessionRow[]; groups: SessionDateGroup[] } {
  if (pinnedOrder.length === 0) return { pinned: [], groups: groups.map(g => ({ ...g, rows: [...g.rows] })) }
  const pinnedSet = new Set(pinnedOrder)
  const pinnedRows = new Map<SessionId, SessionRow>()
  const remaining: SessionDateGroup[] = []
  for (const group of groups) {
    const kept = group.rows.filter(row => {
      if (!pinnedSet.has(row.id)) return true
      pinnedRows.set(row.id, row)
      return false
    })
    if (kept.length > 0) remaining.push({ ...group, rows: kept })
  }
  const pinned = pinnedOrder.flatMap(id => {
    const row = pinnedRows.get(id)
    return row === undefined ? [] : [row]
  })
  return { pinned, groups: remaining }
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm test -- model` → PASS（含原有用例不回归）。

- [ ] **Step 5: Commit**

```bash
git add src/client/model.ts tests/model.spec.ts
git commit -m "feat(model): session rows carry cwd; pinned ordering helpers"
```

---

### Task 2: session-flags.ts — 置顶 / 未读 localStorage store

**Files:**
- Create: `src/client/session-flags.ts`
- Test: `tests/session-flags.spec.ts`

**Interfaces:**
- Produces（后续任务消费的确切签名）:
  - `getPinnedOrder(): readonly SessionId[]`
  - `isPinned(id: SessionId): boolean`
  - `togglePinned(id: SessionId): void`（未置顶 → unshift 到最前；已置顶 → 移除）
  - `subscribePinned(listener: () => void): () => void`
  - `getUnread(): ReadonlySet<SessionId>`
  - `isUnread(id: SessionId): boolean`
  - `markUnread(id: SessionId): void`
  - `markRead(id: SessionId): void`（不存在则 no-op，不通知）
  - `subscribeUnread(listener: () => void): () => void`
  - `__resetSessionFlagsForTest(): void`（测试隔离：清内存态并重载）

- [ ] **Step 1: 写失败测试**（照抄 settings.spec.ts 的 stubGlobal window/localStorage 模式）

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  __resetSessionFlagsForTest, getPinnedOrder, getUnread, isPinned, isUnread,
  markRead, markUnread, subscribePinned, subscribeUnread, togglePinned,
} from '../src/client/session-flags.ts'

describe('pinned session order', () => {
  let stored: Record<string, string> = {}
  beforeEach(() => {
    stored = {}
    vi.stubGlobal('window', { localStorage: {
      getItem: (k: string) => stored[k] ?? null,
      setItem: (k: string, v: string) => { stored[k] = v },
      removeItem: (k: string) => { delete stored[k] },
    } })
    __resetSessionFlagsForTest()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('starts empty and unshifts newly pinned ids', () => {
    togglePinned('s1')
    togglePinned('s2')
    expect(getPinnedOrder()).toEqual(['s2', 's1'])
    expect(isPinned('s1')).toBe(true)
    expect(stored['ya-workspace-sidebar:pinned']).toBe('["s2","s1"]')
  })
  it('toggling a pinned id removes it', () => {
    togglePinned('s1'); togglePinned('s2'); togglePinned('s1')
    expect(getPinnedOrder()).toEqual(['s2'])
    expect(isPinned('s1')).toBe(false)
  })
  it('notifies subscribers on change only', () => {
    const listener = vi.fn()
    const off = subscribePinned(listener)
    togglePinned('s1')
    expect(listener).toHaveBeenCalledTimes(1)
    togglePinned('s1'); togglePinned('s1') // remove then re-add: two more notifications
    expect(listener).toHaveBeenCalledTimes(3)
    off()
    togglePinned('s2')
    expect(listener).toHaveBeenCalledTimes(3)
  })
  it('survives localStorage failure without throwing', () => {
    vi.stubGlobal('window', { localStorage: {
      getItem: () => { throw new Error('denied') },
      setItem: () => { throw new Error('denied') },
      removeItem: () => { throw new Error('denied') },
    } })
    __resetSessionFlagsForTest()
    expect(() => togglePinned('s1')).not.toThrow()
    expect(isPinned('s1')).toBe(true)
  })
  it('drops malformed stored JSON to empty', () => {
    stored['ya-workspace-sidebar:pinned'] = '{oops'
    __resetSessionFlagsForTest()
    expect(getPinnedOrder()).toEqual([])
  })
})

describe('unread session set', () => {
  let stored: Record<string, string> = {}
  beforeEach(() => {
    stored = {}
    vi.stubGlobal('window', { localStorage: {
      getItem: (k: string) => stored[k] ?? null,
      setItem: (k: string, v: string) => { stored[k] = v },
      removeItem: (k: string) => { delete stored[k] },
    } })
    __resetSessionFlagsForTest()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('marks and clears unread ids, persisting the set', () => {
    markUnread('s1')
    expect(isUnread('s1')).toBe(true)
    expect(getUnread().has('s1')).toBe(true)
    expect(stored['ya-workspace-sidebar:unread']).toBe('["s1"]')
    markRead('s1')
    expect(isUnread('s1')).toBe(false)
    expect(stored['ya-workspace-sidebar:unread']).toBe('[]')
  })
  it('markRead on a read id is a silent no-op', () => {
    const listener = vi.fn()
    const off = subscribeUnread(listener)
    markRead('s1')
    expect(listener).not.toHaveBeenCalled()
    off()
  })
  it('notifies subscribers on membership changes', () => {
    const listener = vi.fn()
    const off = subscribeUnread(listener)
    markUnread('s1')
    markUnread('s1') // idempotent: no duplicate notification
    markRead('s1')
    expect(listener).toHaveBeenCalledTimes(2)
    off()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test -- session-flags` → FAIL（模块不存在）。

- [ ] **Step 3: 实现**（模式逐句对照 settings.ts：模块级单例 + try/catch localStorage + listeners 广播）

```ts
/** Browser-local pinned/unread session flags for the sidebar rows.
 *
 * Pinned order is an array (index 0 renders first); unread is a set. Both
 * persist to localStorage like the action-mode preference: per-browser by
 * design, never synced, never sent to the Host. Failures fall back to the
 * in-memory value driving the current page.
 */
import type { SessionId } from '@deepseek-ai/dsh-session/types'

const PINNED_KEY = 'ya-workspace-sidebar:pinned'
const UNREAD_KEY = 'ya-workspace-sidebar:unread'

function readIds(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((v): v is string => typeof v === 'string')
  } catch {
    return []
  }
}

function writeIds(key: string, ids: readonly string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids))
  } catch {
    // localStorage may be unavailable (private mode, quota); in-memory value still drives this page.
  }
}

let pinnedOrder: string[] = readIds(PINNED_KEY)
const pinnedListeners = new Set<() => void>()

let unreadIds: string[] = readIds(UNREAD_KEY)
const unreadListeners = new Set<() => void>()

/** Current pinned order (newest pin first). */
export function getPinnedOrder(): readonly string[] {
  return pinnedOrder
}

/** Whether one session is pinned. */
export function isPinned(id: SessionId): boolean {
  return pinnedOrder.includes(id)
}

/** Pin (to the front) or unpin one session. */
export function togglePinned(id: SessionId): void {
  const next = pinnedOrder.includes(id)
    ? pinnedOrder.filter(item => item !== id)
    : [id, ...pinnedOrder]
  pinnedOrder = next
  writeIds(PINNED_KEY, next)
  for (const listener of [...pinnedListeners]) listener()
}

/** Subscribe to pinned changes; returns an unsubscribe disposer. */
export function subscribePinned(listener: () => void): () => void {
  pinnedListeners.add(listener)
  return () => { pinnedListeners.delete(listener) }
}

/** Current unread set snapshot. */
export function getUnread(): ReadonlySet<SessionId> {
  return new Set(unreadIds)
}

/** Whether one session is marked unread. */
export function isUnread(id: SessionId): boolean {
  return unreadIds.includes(id)
}

/** Mark one session unread. */
export function markUnread(id: SessionId): void {
  if (unreadIds.includes(id)) return
  unreadIds = [...unreadIds, id]
  writeIds(UNREAD_KEY, unreadIds)
  for (const listener of [...unreadListeners]) listener()
}

/** Clear one session's unread mark (no-op when already read). */
export function markRead(id: SessionId): void {
  if (!unreadIds.includes(id)) return
  unreadIds = unreadIds.filter(item => item !== id)
  writeIds(UNREAD_KEY, unreadIds)
  for (const listener of [...unreadListeners]) listener()
}

/** Subscribe to unread changes; returns an unsubscribe disposer. */
export function subscribeUnread(listener: () => void): () => void {
  unreadListeners.add(listener)
  return () => { unreadListeners.delete(listener) }
}

/** Test-only: drop in-memory state and reload from storage. */
export function __resetSessionFlagsForTest(): void {
  pinnedOrder = readIds(PINNED_KEY)
  unreadIds = readIds(UNREAD_KEY)
}
```

注意：模块顶层读 localStorage 需要 `window` 存在——client bundle 只在浏览器/jsdom 加载，与 settings.ts 同前提。

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm test -- session-flags` → PASS。

- [ ] **Step 5: Commit**

```bash
git add src/client/session-flags.ts tests/session-flags.spec.ts
git commit -m "feat(flags): pinned/unread session localStorage stores"
```

---

### Task 3: host 纯函数 — 会话目录探测 + 平台 reveal 命令

**Files:**
- Create: `src/session-artifacts.ts`、`src/reveal.ts`
- Test: `tests/session-artifacts.spec.ts`、`tests/reveal.spec.ts`

**Interfaces:**
- Produces:
  - `encodeSegment(raw: string): string`（官方 jsonl 后端同名规则的独立实现：safe 字符直留，其余 `~XXXX` 大写十六进制，`.`/`..` 特判）
  - `findSessionArtifacts(root: string, sessionId: string, io: { readdir; stat }): Promise<{ dir: string | null; log: string | null }>`（扫描 root 下 `--…--` 项目目录里的 `<encodeSegment(id)>` 子目录；多个命中取 mtime 最新；log 取目录内版本号最大的 `vN.jsonl` / `vN.jsonl.zstd`；目录不存在 → 双 null）
  - `revealCommand(path: string, platform: NodeJS.Platform): { command: string; args: string[] }`（win32 `explorer.exe /select,`、darwin `open -R`、其他 `xdg-open <parent>`）
  - `launchReveal(path: string): { started: true }`（detached spawn，stdio ignore，error 事件吞掉）
- 规则依据（钉住兼容性）：`dsh/packages/session/session-persistence-jsonl/src/format.ts` 的 `encodeSegment` 与 `generationLogFilename`（v0 无前缀；v1+ 为 `vN.jsonl(.zstd)`）。

- [ ] **Step 1: 写失败测试**

`tests/reveal.spec.ts`：

```ts
import { describe, expect, it } from 'vitest'
import { revealCommand } from '../src/reveal.ts'

describe('revealCommand per platform', () => {
  it('win32 selects the path in Explorer as one argv entry', () => {
    expect(revealCommand('C:/a/b', 'win32')).toEqual({
      command: 'explorer.exe', args: ['/select,C:/a/b'],
    })
  })
  it('darwin reveals with open -R', () => {
    expect(revealCommand('/a/b', 'darwin')).toEqual({ command: 'open', args: ['-R', '/a/b'] })
  })
  it('linux opens the parent directory', () => {
    expect(revealCommand('/a/b/c.txt', 'linux')).toEqual({ command: 'xdg-open', args: ['/a/b'] })
  })
})
```

`tests/session-artifacts.spec.ts`（node 环境，真实临时目录）：

```ts
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { encodeSegment, findSessionArtifacts } from '../src/session-artifacts.ts'

describe('encodeSegment (jsonl backend parity)', () => {
  it('keeps safe characters literal', () => {
    expect(encodeSegment('abc123._-')).toBe('abc123._-')
  })
  it('escapes unsafe characters as ~XXXX uppercase hex', () => {
    expect(encodeSegment('a b/c')).toBe('a~0020b~002Fc')
  })
  it('special-cases dot segments against traversal', () => {
    expect(encodeSegment('.')).toBe('~002E')
    expect(encodeSegment('..')).toBe('~002E~002E')
  })
  it('escapes tilde itself', () => {
    expect(encodeSegment('a~b')).toBe('a~007Eb')
  })
})

describe('findSessionArtifacts', () => {
  let root: string
  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'ya-ws-'))
    // project A holds the newest session dir; project B holds an older copy.
    const dirA = join(root, '--proj-A--', encodeSegment('s1'))
    const dirB = join(root, '--proj-B--', encodeSegment('s1'))
    await mkdir(dirA, { recursive: true })
    await mkdir(dirB, { recursive: true })
    await writeFile(join(dirA, 'v2.jsonl'), '')
    await writeFile(join(dirA, 'v3.jsonl.zstd'), '')
    await writeFile(join(dirA, 'notes.txt'), '')           // not a log generation
    await writeFile(join(dirB, 'v1.jsonl'), '')
    // give A a strictly newer mtime
    const later = new Date(Date.now() + 5000)
    const { utimes } = await import('node:fs/promises')
    await utimes(dirA, later, later)
  })
  afterAll(async () => { await rm(root, { recursive: true, force: true }) })

  it('finds the newest project copy and its highest generation log', async () => {
    const io = { readdir: await import('node:fs/promises').then(m => m.readdir), stat: await import('node:fs/promises').then(m => m.stat) }
    const result = await findSessionArtifacts(root, 's1', io)
    expect(result.dir).toBe(join(root, '--proj-A--', encodeSegment('s1')))
    expect(result.log).toBe(join(result.dir!, 'v3.jsonl.zstd'))
  })
  it('returns double null when the session has no directory', async () => {
    const io = { readdir: await import('node:fs/promises').then(m => m.readdir), stat: await import('node:fs/promises').then(m => m.stat) }
    expect(await findSessionArtifacts(root, 'missing', io)).toEqual({ dir: null, log: null })
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test -- reveal session-artifacts` → FAIL（模块不存在）。

- [ ] **Step 3: 实现**

`src/reveal.ts`：

```ts
/** Platform opener commands for revealing a path in the OS file manager. */
import { spawn } from 'node:child_process'
import { dirname } from 'node:path'

/** Reveal/select a path in the OS file manager (pure, platform injectable). */
export function revealCommand(path: string, platform: NodeJS.Platform): { command: string; args: string[] } {
  switch (platform) {
    case 'darwin':
      return { command: 'open', args: ['-R', path] }
    case 'win32':
      // Explorer expects /select,<path> as ONE argument; never a shell string.
      return { command: 'explorer.exe', args: [`/select,${path}`] }
    default:
      return { command: 'xdg-open', args: [dirname(path)] }
  }
}

/** Launch the reveal opener detached; opener failures surface via the OS. */
export function launchReveal(path: string): { started: true } {
  const spec = revealCommand(path, process.platform)
  const child = spawn(spec.command, spec.args, { detached: true, stdio: 'ignore' })
  child.on('error', () => { /* opener missing/denied: the OS dialog is the outcome */ })
  child.unref()
  return { started: true }
}
```

`src/session-artifacts.ts`：

```ts
/** Locate a session's jsonl storage directory and newest log file.
 *
 * The official jsonl backend lays sessions out as
 * `<root>/<projectKey(cwd)>/<encodeSegment(id)>/vN.jsonl(.zstd)`. We mirror
 * only `encodeSegment` (id → one safe segment) and SCAN the project
 * directories instead of reimplementing `projectKey` (its lossy slug rules
 * are the fragile half); a session with several historical project copies
 * resolves to the newest directory mtime. sqlite-backed deployments (e.g.
 * @morlay/better-session) produce no directories at all → double null, which
 * the client renders as disabled menu rows.
 */
import { basename, join } from 'node:path'

/** Encode an arbitrary string as one safe path segment (jsonl backend parity). */
export function encodeSegment(raw: string): string {
  if (raw.length === 0) throw new Error('cannot encode an empty path segment')
  if (raw === '.') return '~002E'
  if (raw === '..') return '~002E~002E'
  let out = ''
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i)
    const ch = String.fromCharCode(code)
    if (ch !== '~' && /^[A-Za-z0-9._-]$/.test(ch)) out += ch
    else out += '~' + code.toString(16).toUpperCase().padStart(4, '0')
  }
  return out
}

/** Minimal fs surface (readdir withFileTypes + stat), injectable for tests. */
export interface ArtifactsIo {
  readdir(path: string, options: { withFileTypes: true }): Promise<import('node:fs').Dirent[]>
  stat(path: string): Promise<{ mtimeMs: number }>
}

/** Parse `vN.jsonl` / `vN.jsonl.zstd` (and the version-zero `.jsonl`) into N. */
function logGeneration(filename: string): number | undefined {
  const match = /^v(\d+)\.jsonl(\.zstd)?$/.exec(filename)
  if (match !== null) return Number(match[1])
  return filename === '.jsonl' ? 0 : undefined
}

/** Find the session's storage dir and newest log file under root, or double null. */
export async function findSessionArtifacts(
  root: string,
  sessionId: string,
  io: ArtifactsIo,
): Promise<{ dir: string | null; log: string | null }> {
  const segment = encodeSegment(sessionId)
  let best: { dir: string; mtimeMs: number } | undefined
  for (const entry of await io.readdir(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('--') || !entry.name.endsWith('--')) continue
    const candidate = join(root, entry.name, segment)
    try {
      const stats = await io.stat(candidate)
      if (best === undefined || stats.mtimeMs > best.mtimeMs) best = { dir: candidate, mtimeMs: stats.mtimeMs }
    } catch {
      // not present under this project directory; keep scanning
    }
  }
  if (best === undefined) return { dir: null, log: null }
  let log: string | undefined
  let logVersion = -1
  for (const entry of await io.readdir(best.dir, { withFileTypes: true })) {
    if (!entry.isFile()) continue
    const version = logGeneration(entry.name)
    if (version !== undefined && version >= logVersion) {
      logVersion = version
      log = join(best.dir, entry.name)
    }
  }
  return { dir: best.dir, log: log ?? null }
}

/** Whether a path is absolute (route input guard). */
export function isAbsolutePath(path: string): boolean {
  return path.length > 0 && (path.startsWith('/') || path.startsWith('\\') || /^[A-Za-z]:[\\/]/.test(path) || basename(path) === path && false)
}
```

（`isAbsolutePath` 简化为 `(path) => pathPosix.isAbsolute(path) || pathWin32.isAbsolute(path)`——实现时直接用 node:path 的两个 isAbsolute，删掉上面的手写版本。）

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm test -- reveal session-artifacts` → PASS。

- [ ] **Step 5: Commit**

```bash
git add src/reveal.ts src/session-artifacts.ts tests/reveal.spec.ts tests/session-artifacts.spec.ts
git commit -m "feat(host): session artifact discovery and platform reveal commands"
```

---

### Task 4: host 路由 — trust fence + webServer 挂载

**Files:**
- Create: `src/trust-fence.ts`
- Modify: `src/index.ts`（保留 title-cache 修复；新增 inject 与路由）、`tests/plugin-shape.spec.ts`
- Modify: `package.json`（devDependencies 加 `"@deepseek-ai/dsh-home-paths": "link:D:/Projects/deepseek-harness/dsh/packages/util/home-paths"`）

**Interfaces:**
- Consumes: Task 3 的 `findSessionArtifacts` / `launchReveal`；`dshHomePath`（`@deepseek-ai/dsh-home-paths`，tsdown 内联）。
- Produces（client 侧 Task 5 消费的 HTTP 契约）:
  - `POST /ya-workspace-sidebar/paths` body `{ sessionId: string; cwd?: string }` → 200 `{ dir: string | null; log: string | null }`
  - `POST /ya-workspace-sidebar/reveal` body `{ path: string }` → 200 `{ started: true }`；路径非绝对或非目录 → 400 `{ error: string }`
  - fence 拒绝 → 403；body 坏 JSON → 400

- [ ] **Step 1: 写失败测试**（plugin-shape 扩展 + trust-fence spec）

`tests/plugin-shape.spec.ts` 追加：

```ts
it('declares webServer inject for the route mount', () => {
  expect(plugin.inject).toContain('webServer')
})
```

`tests/trust-fence.spec.ts`：

```ts
import { describe, expect, it } from 'vitest'
import { isTrustedRouteRequest } from '../src/trust-fence.ts'

const req = (headers: Record<string, string>) => ({ headers })

describe('route trust fence', () => {
  it('accepts a loopback host with same-origin markers', () => {
    expect(isTrustedRouteRequest(req({ host: '127.0.0.1:3080', origin: 'http://127.0.0.1:3080' }))).toBe(true)
    expect(isTrustedRouteRequest(req({ host: 'localhost:3080' }))).toBe(true)
  })
  it('refuses a non-loopback host outside the trusted list', () => {
    expect(isTrustedRouteRequest(req({ host: 'evil.example:3080' }))).toBe(false)
  })
  it('accepts a configured trusted authority', () => {
    expect(isTrustedRouteRequest(req({ host: 'box.lan:3080' }), ['box.lan:3080'])).toBe(true)
  })
  it('refuses cross-site fetch markers', () => {
    expect(isTrustedRouteRequest(req({ host: '127.0.0.1:3080', 'sec-fetch-site': 'cross-site' }))).toBe(false)
  })
  it('refuses a foreign origin on a loopback host', () => {
    expect(isTrustedRouteRequest(req({ host: '127.0.0.1:3080', origin: 'http://evil.example' }))).toBe(false)
  })
  it('refuses the opaque null origin', () => {
    expect(isTrustedRouteRequest(req({ host: '127.0.0.1:3080', origin: 'null' }))).toBe(false)
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test -- plugin-shape trust-fence` → FAIL。

- [ ] **Step 3: 实现**

`src/trust-fence.ts`（精简自 DSH-better-sidebar 同名模块的 Host/Origin/SFS 判定，无 trustedHosts 来源逻辑——列表由调用方注入）：

```ts
/** Browser-trust fence for this plugin's routes: Host-header loopback (or a
 * caller-supplied trusted authority) plus same-origin browser markers. This
 * is a DNS-rebinding / cross-site defense, not authentication. */
import type { IncomingHttpHeaders } from 'node:http'

function header(headers: IncomingHttpHeaders, name: string): string | undefined {
  const value = headers[name]
  return typeof value === 'string' ? value : undefined
}

function parseAuthority(authority: string): URL | undefined {
  try { return new URL(`http://${authority}`) } catch { return undefined }
}

function isLoopbackHostname(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '[::1]') return true
  const parts = hostname.split('.')
  return parts.length === 4 && parts[0] === '127'
    && parts.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255)
}

/** Whether one plugin route request may proceed. */
export function isTrustedRouteRequest(
  request: { headers: IncomingHttpHeaders },
  trustedHosts: readonly string[] = [],
): boolean {
  const host = header(request.headers, 'host')
  if (host === undefined) return false
  const hostUrl = parseAuthority(host)
  if (hostUrl === undefined) return false
  const trusted = isLoopbackHostname(hostUrl.hostname)
    || trustedHosts.some(entry => {
      const entryUrl = parseAuthority(entry)
      return entryUrl !== undefined && entryUrl.hostname === hostUrl.hostname
    })
  if (!trusted) return false
  if (header(request.headers, 'sec-fetch-site') === 'cross-site') return false
  const origin = header(request.headers, 'origin')
  if (origin === undefined) return true
  if (origin === 'null') return false
  try { return new URL(origin).hostname === hostUrl.hostname } catch { return false }
}
```

`src/index.ts` 改造（完整替换头部声明与 apply 结构；title-cache 部分原样保留在 apply 内）：

```ts
// ...（文件头注释与 title-cache 修复代码不动）...
import { readdir, stat } from 'node:fs/promises'
import { isAbsolute, win32 as pathWin32, posix as pathPosix } from 'node:path'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import { findSessionArtifacts } from './session-artifacts.ts'
import { launchReveal } from './reveal.ts'
import { isTrustedRouteRequest } from './trust-fence.ts'

export const name = 'ya-workspace-sidebar'
export const inject = ['webServer']

interface RouteServer {
  register(route: {
    kind: 'exact'; path: string
    handler: (req: { headers: import('node:http').IncomingHttpHeaders; on: typeof import('node:http').IncomingMessage.prototype.on }, res: {
      statusCode: number; setHeader(k: string, v: string): void; end(body?: string): void
    }) => void | Promise<void>
  }): () => void
}

export function apply(ctx: Context): void {
  // ...（title-cache 修复原样）...

  const webServer = (ctx as unknown as { get(name: string): unknown }).get('webServer') as RouteServer | undefined
  if (webServer !== undefined) {
    ctx.effect(() => webServer.register({ kind: 'exact', path: '/ya-workspace-sidebar/paths', handler: pathsRoute }), 'ya-workspace-sidebar: paths route')
    ctx.effect(() => webServer.register({ kind: 'exact', path: '/ya-workspace-sidebar/reveal', handler: revealRoute }), 'ya-workspace-sidebar: reveal route')
  }
}
```

路由处理函数（同文件，模块级）：

```ts
type RouteReq = { headers: import('node:http').IncomingHttpHeaders; on(event: 'data', cb: (chunk: Buffer) => void): void }
type RouteRes = { statusCode: number; setHeader(k: string, v: string): void; end(body?: string): void }

function readBody(req: RouteReq): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', chunk => { chunks.push(chunk) })
    req.on('end', () => { resolve(Buffer.concat(chunks).toString('utf8')) })
    req.on('error', reject)
  })
}

function json(res: RouteRes, statusCode: number, body: unknown): void {
  res.statusCode = statusCode
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(body))
}

async function pathsRoute(req: RouteReq, res: RouteRes): Promise<void> {
  if (!isTrustedRouteRequest(req)) { json(res, 403, { error: 'untrusted' }); return }
  let parsed: { sessionId?: unknown }
  try { parsed = JSON.parse(await readBody(req)) } catch { json(res, 400, { error: 'bad json' }); return }
  if (typeof parsed?.sessionId !== 'string' || parsed.sessionId.length === 0) { json(res, 400, { error: 'sessionId required' }); return }
  try {
    const result = await findSessionArtifacts(dshHomePath('sessions'), parsed.sessionId, {
      readdir: (p, o) => readdir(p, o), stat: p => stat(p),
    })
    json(res, 200, result)
  } catch (error) {
    json(res, 500, { error: String(error) })
  }
}

async function revealRoute(req: RouteReq, res: RouteRes): Promise<void> {
  if (!isTrustedRouteRequest(req)) { json(res, 403, { error: 'untrusted' }); return }
  let parsed: { path?: unknown }
  try { parsed = JSON.parse(await readBody(req)) } catch { json(res, 400, { error: 'bad json' }); return }
  const path = parsed?.path
  if (typeof path !== 'string' || !(isAbsolute(path) || pathWin32.isAbsolute(path) || pathPosix.isAbsolute(path))) {
    json(res, 400, { error: 'absolute path required' }); return
  }
  try {
    const stats = await stat(path)
    if (!stats.isDirectory()) { json(res, 400, { error: 'not a directory' }); return }
  } catch { json(res, 400, { error: 'path not found' }); return }
  json(res, 200, launchReveal(path))
}
```

（实现时以 DSH-better-sidebar `src/index.ts` 的路由读取模式为准校正 `RouteReq`/`RouteRes` 的结构化类型；req body 读取用 `data`/`end` 事件。）

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm test` → 全 PASS；`pnpm run typecheck` → 0 error。

- [ ] **Step 5: Commit**

```bash
git add src/trust-fence.ts src/index.ts tests/trust-fence.spec.ts tests/plugin-shape.spec.ts package.json
git commit -m "feat(host): fenced paths/reveal routes over webServer"
```

---

### Task 5: contract + client 注入方法

**Files:**
- Modify: `src/client/contract.ts`、`src/client/index.ts`

**Interfaces:**
- Produces（Task 6 UI 消费）:
  - `interface SessionPaths { dir: string | null; log: string | null }`
  - `SidebarInjected` 增加：
    - `resolveSessionPaths(input: { sessionId: SessionId; cwd?: string }): Promise<SessionPaths>`（fetch 失败 → 双 null，不抛）
    - `revealInExplorer(cwd: string): Promise<void>`（fetch 失败静默 console.warn）

- [ ] **Step 1: 实现 contract 类型**（`src/client/contract.ts` 在 `SidebarInjected` 的 `createWorkspace` 之后加两个成员声明 + `SessionPaths` 导出接口，JSDoc 注明路由与失败语义）。

- [ ] **Step 2: 实现 client/index.ts 注入**（`sidebarInjected()` 内追加）：

```ts
resolveSessionPaths: async input => {
  try {
    const response = await fetch('/ya-workspace-sidebar/paths', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!response.ok) return { dir: null, log: null }
    return await response.json() as SessionPaths
  } catch {
    return { dir: null, log: null }
  }
},
revealInExplorer: async cwd => {
  try {
    await fetch('/ya-workspace-sidebar/reveal', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: cwd }),
    })
  } catch (reason) {
    console.warn('reveal request rejected:', reason)
  }
},
```

- [ ] **Step 3: 验证**

Run: `pnpm run typecheck && pnpm test` → PASS（plugin-shape/其余不回归）。

- [ ] **Step 4: Commit**

```bash
git add src/client/contract.ts src/client/index.ts
git commit -m "feat(client): injected session-path resolution and reveal"
```

---

### Task 6: UI 接线 — 右键菜单 / 置顶 / 未读 / 路径项

**Files:**
- Modify: `src/client/WorkspaceSidebar.tsx`、`src/client/locales.ts`、`src/client/dictionaries.ts`、`src/client/styles.ts`

**Interfaces:**
- Consumes: Task 1 `applyPinned`/`extractPinnedGroups`/`SessionRow.cwd`；Task 2 全部导出；Task 5 `resolveSessionPaths`/`revealInExplorer`；`writeClipboard`、`Menu`（`getAnchorRect`）、`IconCopyOutline16`、`IconFolderOpenOutline16`、`IconLinkOutline16`、`IconClockOutline16`（ui-primitives）。
- Produces: 最终用户面。

- [ ] **Step 1: locales.ts 新词条**（zh 与 en 同步追加，键名一致）：

```ts
// zh
pin: '置顶',
unpin: '取消置顶',
pinnedGroup: '置顶',
markUnread: '标记为未读',
markRead: '标记为已读',
revealInExplorer: '在资源管理器中打开',
copyPath: '复制路径',
copySessionDir: '复制任务路径',
copyLogPath: '复制日志路径',
copySessionId: '复制会话 ID',
pathsUnavailable: '当前部署没有文件型会话数据（或尚未落盘）',
revealUnavailable: '此会话没有工作目录',
```

```ts
// en
pin: 'Pin',
unpin: 'Unpin',
pinnedGroup: 'Pinned',
markUnread: 'Mark as unread',
markRead: 'Mark as read',
revealInExplorer: 'Reveal in file manager',
copyPath: 'Copy path',
copySessionDir: 'Copy task path',
copyLogPath: 'Copy log path',
copySessionId: 'Copy session ID',
pathsUnavailable: 'No file-backed session data in this deployment (or not yet flushed)',
revealUnavailable: 'This session has no working directory',
```

`dictionaries.ts`：类型改为 `Record<string, Partial<Record<YaWorkspaceKey, string>>>`（现有 19 语言词条不动，missing key 回退主词典 en）。

- [ ] **Step 2: styles.ts 追加**：

```css
.ya-unread-dot { position:relative; flex:none; width:10px; height:10px; }
.ya-unread-dot::before { content:''; position:absolute; inset:0; border-radius:50%; background:var(--dsw-static-deepseek-450); opacity:.1; }
.ya-unread-dot::after { content:''; position:absolute; inset:20%; border-radius:50%; background:var(--dsw-static-deepseek-450); }
.ya-row.ya-unread .ya-row-title { font-weight:600; }
.ya-pin-mark { flex:none; display:inline-flex; color:var(--dsw-alias-label-tertiary); }
.ya-row.ya-pinned .ya-pin-mark { color:var(--dsw-alias-label-secondary); }
```

- [ ] **Step 3: SessionItem 改造**（`WorkspaceSidebar.tsx`）——关键点：

1. `SessionRowProps` 增加 `pinned: boolean`、`unread: boolean`、`paths: SessionPaths | undefined`、`onPin(id)`、`onUnread(id, unread)`、`onReveal(cwd)`、`onCopy(text)`、`t` 已有。
2. 状态：`const [menuAt, setMenuAt] = useState<{ x: number; y: number } | null>(null)`；`menuOpen = menuOpenButton || menuAt !== null`（按钮态沿用现有 `menuOpen` state，改名 `menuOpenButton`）。
3. 根 div 追加：

```tsx
onContextMenu={(event) => { event.preventDefault(); setMenuAt({ x: event.clientX, y: event.clientY }) }}
className={`ya-row${...}${unread ? ' ya-unread' : ''}${pinned ? ' ya-pinned' : ''}`}
```

4. 状态槽（`SessionStatus`）优先级链后插 unread 分支：

```tsx
function SessionStatus({ row, unread }: { row: SessionRow; unread: boolean }) {
  if (row.pendingInteraction !== undefined) return <StateDot state="warning" />
  if (row.running) return <StateDot state="ongoing" />
  if (unread) return <span className="ya-unread-dot" aria-hidden="true" />
  if (row.completed) return <StateDot state="done" />
  return null
}
```

5. 标题前置置顶标记（自画 pin SVG，currentColor）：

```tsx
function PinMark({ size = 12 }: { size?: number }) {
  return (
    <svg className="ya-pin-mark" width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M9.5 1.5 14.5 6.5 12.9 8.1 12.4 7.6 9.2 10.8 9.5 12.6 8.1 14 5.4 10.4 2.6 13.2 2 12.6 4.8 9.8 1.2 7.1 2.6 5.7 4.4 6 7.6 2.8 7.1 2.3 8.7.7Z" opacity=".9"/>
      <path fill="currentColor" d="M9.5 1.5 14.5 6.5 12.9 8.1 8.7 3.9 8.7 3.9Z"/>
    </svg>
  )
}
```

（置于 `.ya-row-line` 内标题前：`{pinned && <PinMark />}`。）

6. Menu（替换现有 items/onSelect；`anchor` 保持按钮；右键时注入坐标 rect）：

```tsx
<Menu
  open={menuOpen}
  onClose={() => { setMenuOpenButton(false); setMenuAt(null) }}
  items={buildSessionMenu(...)}
  onSelect={...}
  portal
  closeOnPointerLeave={menuAt === null}
  {...(menuAt === null ? {} : { getAnchorRect: () => new DOMRect(menuAt.x, menuAt.y, 0, 0) })}
  anchor={(<button ...现有按钮... />)}
/>
```

`buildSessionMenu`（组件内函数或模块级）：

```tsx
const pathsKnown = paths !== undefined
items = [
  { id: 'pin', label: pinned ? t('unpin') : t('pin'), icon: <PinMark size={14} /> },
  { id: 'rename', label: t('rename'), icon: <IconEditOutline16 /> },
  { id: 'fork', label: t('fork'), icon: <IconBranchOutline16 /> },
  { id: 'unread', label: unread ? t('markRead') : t('markUnread'), icon: <IconClockOutline16 /> },
  { type: 'separator', id: 'sep-1' },
  { id: 'reveal', label: t('revealInExplorer'), icon: <IconFolderOpenOutline16 />, disabled: row.cwd === undefined },
  { id: 'copy-path', label: t('copyPath'), icon: <IconCopyOutline16 />, disabled: row.cwd === undefined },
  { id: 'copy-dir', label: t('copySessionDir'), icon: <IconCopyOutline16 />, disabled: !pathsKnown || paths?.dir === null, title: ... },
  { id: 'copy-log', label: t('copyLogPath'), icon: <IconCopyOutline16 />, disabled: !pathsKnown || paths?.log === null },
  { id: 'copy-id', label: t('copySessionId'), icon: <IconLinkOutline16 /> },
  { type: 'separator', id: 'sep-2' },
  { id: 'archive', label: actionLabel, icon: actionIcon, danger: isDelete },
]
```

注意：`MenuItem` 无 `title` 字段——禁用原因提示改为在 disabled 项的 label 后缀 `（不可用）`？**决定：不加后缀**（MenuEntry 无 tooltip 通道），禁用态本身即信号；`pathsUnavailable` 文案保留给将来的 toast。探测中（`paths === undefined`）两项禁用，探测完成（含双 null）后 dir/log 项按 null 禁用。

`onSelect` 分发：

```tsx
if (id === 'pin') { (pinned ? onUnpin : onPin)(row.id); return }
if (id === 'unread') { onUnread(row.id, !unread); return }
if (id === 'reveal' && row.cwd !== undefined) { void onReveal(row.cwd); return }
if (id === 'copy-path' && row.cwd !== undefined) { void onCopy(row.cwd); return }
if (id === 'copy-dir' && paths?.dir != null) { void onCopy(paths.dir); return }
if (id === 'copy-log' && paths?.log != null) { void onCopy(paths.log); return }
if (id === 'copy-id') { void onCopy(row.id); return }
// rename / fork / archive 走现有分支
```

7. `WorkspaceSidebar` 主体接线：

- flags 订阅（`actionMode` 旁）：

```tsx
const [pinnedOrder, setPinnedOrder] = useState<readonly SessionId[]>(() => getPinnedOrder())
const [unreadSet, setUnreadSet] = useState<ReadonlySet<SessionId>>(() => getUnread())
useEffect(() => subscribePinned(() => { setPinnedOrder(getPinnedOrder()) }), [])
useEffect(() => subscribeUnread(() => { setUnreadSet(getUnread()) }), [])
```

- 路径缓存与预取：

```tsx
const pathsCache = useRef(new Map<SessionId, SessionPaths>())
const [pathsTick, setPathsTick] = useState(0)
const prefetchPaths = (row: SessionRow): void => {
  if (row.blank || pathsCache.current.has(row.id)) return
  pathsCache.current.set(row.id, { dir: null, log: null }) // 占位防重复请求
  void resolveSessionPaths({ sessionId: row.id, ...(row.cwd !== undefined ? { cwd: row.cwd } : {}) })
    .then(result => { pathsCache.current.set(row.id, result); setPathsTick(tick => tick + 1) })
}
```

（`sessionItem` 渲染处把 `paths={pathsCache.current.get(row.id)}` 传入——占位值让"探测中"表现为 disabled 双 null，完成后 tick 重渲染启用。）

- 打开即已读：`const openRow = (id: SessionId) => { markRead(id); open(id) }`（`sessionItem` 的 `open` prop 换成 `openRow`；`open` 仍用于初始 current——不需要，仅行点击走 openRow）。
- 排序：
  - `const recent = useMemo(() => applyPinned(allRows, pinnedOrder), [allRows, pinnedOrder])`
  - 二级列表：`const { pinned: pinnedRows, groups: datedGroups } = extractPinnedGroups(levelGroups, pinnedOrder)`；渲染时置顶组在最上（label `t('pinnedGroup')`，样式复用 `ya-date-group-label`），空则不渲染。
  - Ungrouped 平铺：`applyPinned(levelRows, pinnedOrder)`。
  - 搜索结果：不应用置顶。
- 菜单动作：`onPin={id => togglePinned(id)}`、`onUnread={(id, unread) => { (unread ? markUnread : markRead)(id) }}`、`onReveal={cwd => { void revealInExplorer(cwd) }}`、`onCopy={text => { void writeClipboard(text) }}`（import `writeClipboard`）。
- 右键/按钮打开菜单时预取：`SessionItem` 的 `onContextMenu` 与按钮 onClick 里调用 `prefetchPaths(row)`（经 props 传 `onOpenMenu(row)`）。

- [ ] **Step 4: 验证**

Run: `pnpm run typecheck && pnpm test && pnpm run build` → 全绿；`lib/client.js`、`lib/index.js` 更新。

- [ ] **Step 5: 手动冒烟（用户侧可选，agent 不启动 web）**

按 README 流程：`pnpm run build` → 重启 `dsh web` → 硬刷新 → 右键会话行验证：置顶排序与标记、未读蓝点与打开清除、路径复制（jsonl 会话才有任务/日志路径；本机 sqlite 部署这两项禁用）、reveal 打开工作目录、… 按钮菜单与右键一致。

- [ ] **Step 6: Commit**

```bash
git add src/client/WorkspaceSidebar.tsx src/client/locales.ts src/client/dictionaries.ts src/client/styles.ts
git commit -m "feat(ui): session context menu with pin/unread and path actions"
```

---

### Task 7: 收尾 — 文档 / 版本 / 全量验证

**Files:**
- Modify: `README.md`（功能段落）、`AGENTS.md`（行为约束）、`package.json`（version 0.7.0）

- [ ] **Step 1: README 功能段**（在现有功能描述后追加一句）：

> 会话行支持右键菜单：置顶（本地）、重命名、标记未读（本地，打开自动清除）、在资源管理器中打开工作目录、复制路径 / 任务路径 / 日志路径 / 会话 ID。任务与日志路径仅文件型（jsonl）持久化部署可用；sqlite 型部署（如 @morlay/better-session）对应项自动禁用。

- [ ] **Step 2: AGENTS.md 行为约束**（追加到指南列表）：

> - Session rows open a shared context menu (right-click and the … button): pin/unread are browser-local flags (localStorage, never Host state); pin lifts rows above date groups; unread clears on open; task/log path actions probe the jsonl storage layout via the plugin's fenced host routes and stay disabled on sqlite-backed deployments.

- [ ] **Step 3: 版本 bump**

`package.json` `"version": "0.6.1"` → `"0.7.0"`。

- [ ] **Step 4: 全量验证**

Run: `pnpm run typecheck && pnpm test && pnpm run build` → 全绿；`git status` 干净（lib/ 已重新构建并提交）。

- [ ] **Step 5: Commit**

```bash
git add README.md AGENTS.md package.json lib/
git commit -m "docs+chore: context-menu feature docs, v0.7.0"
```

---

## Self-Review 结论

- **Spec 覆盖**：设计文档菜单表 9 项 ↔ Task 6 items 数组 9 项 + 分隔符；置顶/未读存储 ↔ Task 2；路径探测/reveal ↔ Task 3/4/5；sqlite 降级 ↔ Task 6 disabled 逻辑；README/AGENTS ↔ Task 7。
- **占位符**：无 TBD/TODO；Task 4 的 RouteReq/RouteRes 结构化类型标注了"以 better-sidebar 路由读取模式为准校正"（实现时对齐，不是延迟决策）。
- **类型一致性**：`SessionPaths { dir: string | null; log: string | null }` 在 Task 4（HTTP 响应）、Task 5（contract）、Task 6（pathsCache）三处一致；`applyPinned`/`extractPinnedGroups`/`getPinnedOrder` 等签名跨任务核对一致。
