/**
 * Locate a session's jsonl storage directory and newest log file.
 *
 * The official jsonl backend lays sessions out as
 * `<root>/<projectKey(cwd)>/<encodeSegment(id)>/vN.jsonl(.zstd)`. This module
 * mirrors only {@link encodeSegment} (id → one safe path segment) and SCANS
 * the project directories instead of reimplementing `projectKey` (its lossy
 * slug rules are the fragile half); a session with several historical project
 * copies resolves to the newest directory mtime. sqlite-backed deployments
 * (e.g. @morlay/better-session) produce no directories at all → double null,
 * which the client renders as disabled menu rows.
 */
import type { Dirent } from 'node:fs'
import { join } from 'node:path'

/** Minimal fs surface (readdir withFileTypes + stat), injectable for tests. */
export interface ArtifactsIo {
  readdir(path: string, options: { withFileTypes: true }): Promise<Dirent[]>
  stat(path: string): Promise<{ mtimeMs: number }>
}

/**
 * Encode an arbitrary string as one safe path segment, injectively over all
 * JS strings (parity with the official jsonl backend's segment encoder: safe
 * units literal, every other unit `~XXXX`, dot segments traversal-proofed).
 * @param raw - the string to encode; must be non-empty.
 * @returns the escaped single path segment.
 */
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

/**
 * Parse one committed generation filename into its format version.
 * @param filename - candidate entry from a session directory.
 * @returns the generation version (`vN.jsonl` / `vN.jsonl.zstd`; version-zero
 *   is the suffix-only `.jsonl`), or undefined for non-generation names.
 */
function logGeneration(filename: string): number | undefined {
  const match = /^v(\d+)\.jsonl(\.zstd)?$/.exec(filename)
  if (match !== null) return Number(match[1])
  return filename === '.jsonl' ? 0 : undefined
}

/**
 * Find the session's storage dir and newest log file under a sessions root.
 * @param root - sessions root directory (`$DSH_HOME/sessions`).
 * @param sessionId - raw session id (encoded here before any filesystem use).
 * @param io - fs surface; a stat miss under one project directory keeps the scan going.
 * @returns the newest owning directory and its highest-generation log file,
 *   either null when absent (sqlite deployments, unflushed sessions).
 */
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
      if (best === undefined || stats.mtimeMs > best.mtimeMs) {
        best = { dir: candidate, mtimeMs: stats.mtimeMs }
      }
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
