/**
 * Host half for the browser-only ya-workspace-sidebar plugin.
 *
 * Two independent fixes for cold Session titles in the workspace sidebar:
 *
 * 1. The projection cache's write-behind can fail silently: `cache.write(session)`
 *    snapshots `sessionProjections.checkpoint(session)`, which can return
 *    non-JSON-serializable values (live LLM state) during a turn, so `put()`
 *    throws and the fail-soft mandatory/throttle writes drop the row. On
 *    `session/title` we first retry the official write (it usually succeeds
 *    outside a mid-turn window), and on failure merge a title-only row into
 *    the session's per-record cache document ourselves so the cold title
 *    survives restart.
 * 2. At boot we backfill titles for stored sessions the cache cannot serve:
 *    `sessionQuery.observeSession` folds the log once and the resulting
 *    title is merged into the same per-record document.
 *
 * The cache domain is `per-record` since spec v7: each session lives at
 * `<storages>/session_projcache/sessions/<id>.json` as
 * `{version: <stamp>, record: {identity, rows}}`. Writing merges into the
 * existing document (other units' rows are preserved) and updates the title
 * row only when the observed seq is newer. Writes are atomic (tmp + rename),
 * debounced per event, and fail-soft: a lost write only costs a longer cold
 * tail replay.
 */
import { mkdir, readdir, rename, stat, writeFile } from 'node:fs/promises'
import { readFileSync, type Dirent } from 'node:fs'
import { isAbsolute, join, posix as pathPosix, win32 as pathWin32 } from 'node:path'
import type { IncomingHttpHeaders } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import { findSessionArtifacts } from './session-artifacts.ts'
import { launchReveal } from './reveal.ts'
import { isTrustedRouteRequest } from './trust-fence.ts'

export const name = 'ya-workspace-sidebar'

/** Per-record cache documents live one level below the domain directory. */
const CACHE_DIR = join(dshHomePath('storages'), 'session_projcache', 'sessions')
/** Stamp matching `projectionCacheDomainSpec.version` at dsh 0.2.2-rc.1 (accepted set: 3–7). */
const CACHE_DOMAIN_VERSION = 7
/** The title unit's persisted row version (session-title stateVersion). */
const TITLE_ROW_VERSION = 1

/** Lifecycle identity fields the listing faces match (fold-only cut omitted). */
interface TitleIdentity {
  formatVersion?: number
  createdAt?: number
  cwd?: string
  isSeeded?: boolean
}

interface TitlePayload {
  seq: number
  title: string
  identity: TitleIdentity
}

/** Minimal faces of the host services this workaround touches. */
interface CacheFace {
  write(session: unknown): Promise<void>
  cachedSnapshot(header: unknown): { values: Record<string, unknown> } | undefined
  cachedPredecessorTitle(header: unknown): { values: Record<string, unknown> } | undefined
}
interface PersistenceFace {
  list(): Promise<readonly { header: { id: string; version: number; createdAt: number; cwd?: string; isSeeded: boolean } }[]>
}
interface QueryFace {
  observeSession(id: string, options: { projectionMode: 'all' }): Promise<{ projections?: { values: Record<string, unknown>; asOfSeq?: number } } & Disposable>
}

/** Read one per-record document; absent or foreign content resolves empty. */
function readRecordFile(path: string): { version: number; record: { identity: TitleIdentity; rows: Record<string, { ver: number; seq: number; val: unknown }> } } {
  try {
    const doc = JSON.parse(readFileSync(path, 'utf8')) as { version?: unknown; record?: unknown }
    const record = doc.record as { identity?: TitleIdentity; rows?: Record<string, { ver: number; seq: number; val: unknown }> } | undefined
    return {
      version: typeof doc.version === 'number' ? doc.version : CACHE_DOMAIN_VERSION,
      record: {
        identity: record?.identity ?? {},
        rows: record?.rows ?? {},
      },
    }
  } catch {
    return { version: CACHE_DOMAIN_VERSION, record: { identity: {}, rows: {} } }
  }
}

/** Merge one title row into the session's per-record document, atomically. */
async function mergeTitleRow(id: string, payload: TitlePayload): Promise<void> {
  const path = join(CACHE_DIR, `${id}.json`)
  const { version, record } = readRecordFile(path)
  record.identity = { ...record.identity, ...payload.identity }
  const current = record.rows.title
  if (current !== undefined && current.seq > payload.seq) return
  record.rows.title = { ver: TITLE_ROW_VERSION, seq: payload.seq, val: payload.title }
  await mkdir(CACHE_DIR, { recursive: true })
  const tmp = `${path}.tmp-${process.pid}`
  await writeFile(tmp, `${JSON.stringify({ version, record }, null, 2)}\n`, 'utf8')
  await rename(tmp, path)
}

/** Identity carried by the title payload, projected from a SessionHeader-shaped source. */
function identityOf(header: { version?: number; createdAt?: number; cwd?: string; isSeeded?: boolean }): TitleIdentity {
  return {
    ...(typeof header.version === 'number' ? { formatVersion: header.version } : {}),
    ...(typeof header.createdAt === 'number' ? { createdAt: header.createdAt } : {}),
    ...(header.cwd !== undefined ? { cwd: header.cwd } : {}),
    ...(typeof header.isSeeded === 'boolean' ? { isSeeded: header.isSeeded } : {}),
  }
}

export function apply(ctx: Context): void {
  const cache = ctx.get('sessionProjectionCache') as CacheFace | undefined
  let pending: Map<string, TitlePayload> = new Map()
  let timer: ReturnType<typeof setTimeout> | undefined

  function flush(): void {
    timer = undefined
    const batch = pending
    pending = new Map()
    for (const [id, payload] of batch) {
      mergeTitleRow(id, payload).catch((error: unknown) => {
        ctx.logger.warn(`ya-workspace-sidebar: title cache row for "${id}" not persisted: ${String(error)}`)
      })
    }
  }

  ctx.events.on('session/event', (
    session: { id: string; header: { version?: number; createdAt?: number; cwd?: string; isSeeded?: boolean } },
    event: { type: string; seq: number; data?: { title?: string } },
  ) => {
    if (event.type !== 'session/title') return
    if (event.data?.title === undefined) return

    // Preferred path: the official checkpoint write. It usually succeeds once
    // the mid-turn window has passed, and persists every unit's row.
    if (cache !== undefined) {
      cache.write(session).catch(() => {
        pending.set(session.id, { seq: event.seq, title: event.data!.title!, identity: identityOf(session.header) })
        timer ??= setTimeout(flush, 2000)
      })
      return
    }
    pending.set(session.id, { seq: event.seq, title: event.data.title, identity: identityOf(session.header) })
    timer ??= setTimeout(flush, 2000)
  })

  // Boot-time backfill: sessions the cache cannot serve a title for get one
  // computed from their own log (bounded, sequential, fail-soft per session).
  queueMicrotask(() => {
    void (async () => {
      const persistence = ctx.get('sessionPersistence') as PersistenceFace | undefined
      const query = ctx.get('sessionQuery') as QueryFace | undefined
      if (persistence === undefined || query === undefined) return
      let snapshots: Awaited<ReturnType<PersistenceFace['list']>>
      try {
        snapshots = await persistence.list()
      } catch (error) {
        ctx.logger.warn(`ya-workspace-sidebar: title backfill list failed: ${String(error)}`)
        return
      }
      for (const snapshot of snapshots) {
        const header = snapshot.header
        try {
          const known = cache?.cachedSnapshot(header)?.values?.title
            ?? cache?.cachedPredecessorTitle(header)?.values?.title
          if (typeof known === 'string' && known !== '') continue
          const observation = await query.observeSession(header.id, { projectionMode: 'all' })
          try {
            const title = observation.projections?.values?.title
            const seq = observation.projections?.asOfSeq
            if (typeof title === 'string' && title !== '' && typeof seq === 'number') {
              await mergeTitleRow(header.id, { seq, title, identity: identityOf(header) })
            }
          } finally {
            observation[Symbol.dispose]()
          }
        } catch {
          // One unreadable or live session never blocks the rest; the sidebar
          // falls back to its on-demand refreshProjections path.
        }
      }
    })()
  })

    // Session-path actions for the sidebar's context menu. Mounted through the
  // runtime inject so the title-cache listener above keeps working in
  // deployments without a webServer (CLI profiles); the routes themselves
  // only exist under `dsh web`. The service rides the CALLBACK's scoped ctx —
  // the outer plugin ctx has no webServer property (the inject declaration
  // belongs to the inner fiber, not this one).
  ctx.inject(['webServer'], (wctx) => {
    const webServer = (wctx as unknown as { webServer: WebServerFace }).webServer
    const disposeRoutes = [
      webServer.register({
        kind: 'exact',
        path: '/ya-workspace-sidebar/paths',
        handler: pathsRoute,
      }),
      webServer.register({
        kind: 'exact',
        path: '/ya-workspace-sidebar/reveal',
        handler: revealRoute,
      }),
    ]
    return () => {
      for (const dispose of disposeRoutes) dispose()
    }
  })
}

/** The webServer service face this plugin uses (structural mirror). */
interface WebServerFace {
  register(route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (req: RouteRequest, res: RouteResponse) => void | Promise<void>
  }): () => void
}

/** Structural subset of IncomingMessage the routes read. */
interface RouteRequest {
  method?: string | undefined
  headers: IncomingHttpHeaders
  [Symbol.asyncIterator](): AsyncIterableIterator<string | Uint8Array>
}

/** Structural subset of ServerResponse the routes write. */
interface RouteResponse {
  writeHead(status: number, headers: Record<string, string>): void
  end(body?: string): void
}

/** Body size bound of one JSON request (defense against unbounded reads). */
const MAX_BODY_BYTES = 1 << 20

/** Read and parse one bounded JSON request body; malformed input throws. */
async function readJsonBody(req: RouteRequest): Promise<unknown> {
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk)
    total += buffer.length
    if (total > MAX_BODY_BYTES) throw new Error('request body too large')
    chunks.push(buffer)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  if (text.trim() === '') return {}
  return JSON.parse(text) as unknown
}

/** Write one JSON response. */
function writeJson(res: RouteResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

/** Reject untrusted/fenced requests with 403. */
function refused(res: RouteResponse): void {
  writeJson(res, 403, { error: 'untrusted' })
}

/** POST /ya-workspace-sidebar/paths — probe the session's jsonl storage layout. */
async function pathsRoute(req: RouteRequest, res: RouteResponse): Promise<void> {
  if (!isTrustedRouteRequest(req)) {
    refused(res)
    return
  }
  let payload: unknown
  try {
    payload = await readJsonBody(req)
  } catch (error) {
    writeJson(res, 400, { error: error instanceof Error ? error.message : 'bad json' })
    return
  }
  const sessionId = (payload as { sessionId?: unknown } | null)?.sessionId
  if (typeof sessionId !== 'string' || sessionId.length === 0) {
    writeJson(res, 400, { error: 'sessionId required' })
    return
  }
  try {
    const io = {
      readdir: (path: string, options: { withFileTypes: true }) => readdir(path, options) as Promise<Dirent[]>,
      stat: (path: string) => stat(path),
    }
    const result = await findSessionArtifacts(dshHomePath('sessions'), sessionId, io)
    writeJson(res, 200, result)
  } catch (error) {
    writeJson(res, 500, { error: error instanceof Error ? error.message : String(error) })
  }
}

/** POST /ya-workspace-sidebar/reveal — open one existing directory in the OS file manager. */
async function revealRoute(req: RouteRequest, res: RouteResponse): Promise<void> {
  if (!isTrustedRouteRequest(req)) {
    refused(res)
    return
  }
  let payload: unknown
  try {
    payload = await readJsonBody(req)
  } catch (error) {
    writeJson(res, 400, { error: error instanceof Error ? error.message : 'bad json' })
    return
  }
  const path = (payload as { path?: unknown } | null)?.path
  if (typeof path !== 'string'
    || !(isAbsolute(path) || pathWin32.isAbsolute(path) || pathPosix.isAbsolute(path))) {
    writeJson(res, 400, { error: 'absolute path required' })
    return
  }
  try {
    const stats = await stat(path)
    if (!stats.isDirectory()) {
      writeJson(res, 400, { error: 'not a directory' })
      return
    }
  } catch {
    writeJson(res, 400, { error: 'path not found' })
    return
  }
  writeJson(res, 200, launchReveal(path))
}