/**
 * Host half for the browser-only ya-workspace-sidebar plugin.
 *
 * The projection cache's write-behind is broken: `cache.write(session)`
 * calls `sessionProjections.checkpoint(session)` which can return
 * non-JSON-serializable values (live LLM state) during a turn, causing
 * `put()` to throw `TypeError: projection checkpoint is not losslessly
 * JSON-serializable`. Both the `turn/end` mandatory write and the throttle
 * writes fail silently (fail-soft), so titles are never durably checkpointed
 * and are lost on host restart.
 *
 * This listener works around the host bug by writing a title-only row
 * directly to the cache file when a `session/title` event lands. The row
 * format matches what `cachedSnapshot` reads: `{ identity, rows: { title } }`.
 * The write is debounced and fail-soft to avoid blocking the event loop or
 * corrupting the file on concurrent writes.
 */
import { readdir, stat } from 'node:fs/promises'
import { readFileSync, writeFileSync, type Dirent } from 'node:fs'
import { homedir } from 'node:os'
import { isAbsolute, join, posix as pathPosix, win32 as pathWin32 } from 'node:path'
import type { IncomingHttpHeaders } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import { findSessionArtifacts } from './session-artifacts.ts'
import { launchReveal } from './reveal.ts'
import { isTrustedRouteRequest } from './trust-fence.ts'

export const name = 'ya-workspace-sidebar'

const CACHE_PATH = join(homedir(), '.dsh', 'storages', 'session_projcache.json')

interface TitlePayload {
  seq: number
  title: string
  createdAt: number
  cwd?: string
}

export function apply(ctx: Context): void {
  let pending: Map<string, TitlePayload> = new Map()
  let timer: ReturnType<typeof setTimeout> | undefined

  function flush(): void {
    timer = undefined
    const batch = pending
    pending = new Map()
    if (batch.size === 0) return

    try {
      const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'))
      const sessions = cache.tables?.sessions ?? {}
      for (const [id, payload] of batch) {
        const identity: { createdAt: number; cwd?: string } = { createdAt: payload.createdAt }
        if (payload.cwd !== undefined) identity.cwd = payload.cwd
        const existing = sessions[id]
        if (existing === undefined) {
          sessions[id] = { identity, rows: { title: { ver: 1, seq: payload.seq, val: payload.title } } }
        } else {
          existing.identity = identity
          if (existing.rows === undefined) existing.rows = {}
          if (existing.rows.title === undefined || existing.rows.title.seq <= payload.seq) {
            existing.rows.title = { ver: 1, seq: payload.seq, val: payload.title }
          }
        }
      }
      cache.tables.sessions = sessions
      writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + '\n', 'utf8')
    } catch (error) {
      ctx.logger.warn(`ya-workspace-sidebar: title cache flush failed: ${String(error)}`)
    }
  }

  ctx.events.on('session/event', (session: { id: string; header: { createdAt: number; cwd?: string } }, event: { type: string; seq: number; data?: { title?: string } }) => {
    if (event.type !== 'session/title') return
    if (event.data?.title === undefined) return

    pending.set(session.id, {
      seq: event.seq,
      title: event.data.title,
      createdAt: session.header.createdAt,
      cwd: session.header.cwd,
    })

    if (timer === undefined) {
      timer = setTimeout(flush, 2000)
    }
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
