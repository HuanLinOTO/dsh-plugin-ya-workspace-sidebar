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
import type { Dirent } from 'node:fs';
/** Minimal fs surface (readdir withFileTypes + stat), injectable for tests. */
export interface ArtifactsIo {
    readdir(path: string, options: {
        withFileTypes: true;
    }): Promise<Dirent[]>;
    stat(path: string): Promise<{
        mtimeMs: number;
    }>;
}
/**
 * Encode an arbitrary string as one safe path segment, injectively over all
 * JS strings (parity with the official jsonl backend's segment encoder: safe
 * units literal, every other unit `~XXXX`, dot segments traversal-proofed).
 * @param raw - the string to encode; must be non-empty.
 * @returns the escaped single path segment.
 */
export declare function encodeSegment(raw: string): string;
/**
 * Find the session's storage dir and newest log file under a sessions root.
 * @param root - sessions root directory (`$DSH_HOME/sessions`).
 * @param sessionId - raw session id (encoded here before any filesystem use).
 * @param io - fs surface; a stat miss under one project directory keeps the scan going.
 * @returns the newest owning directory and its highest-generation log file,
 *   either null when absent (sqlite deployments, unflushed sessions).
 */
export declare function findSessionArtifacts(root: string, sessionId: string, io: ArtifactsIo): Promise<{
    dir: string | null;
    log: string | null;
}>;
