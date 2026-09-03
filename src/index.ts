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
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'

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
}
