import { mkdir, readdir, rename, stat, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { dirname, isAbsolute, join, posix, resolve, win32 } from "node:path";
import { homedir } from "node:os";
import { spawn } from "node:child_process";
//#region node_modules/.pnpm/@deepseek-ai+dsh-home-paths_2ea830fc8b6f928d66a0ec4e4caf45af/node_modules/@deepseek-ai/dsh-home-paths/lib/index.js
/**
* Shared filesystem path helpers for DeepSeek Harness user data.
*
* @module @deepseek-ai/dsh-home-paths
*/
/** Directory name for the default DeepSeek Harness home under the OS home. */
const DSH_HOME_DIR_NAME = ".dsh";
/** Environment variable that overrides the default DeepSeek Harness home. */
const DSH_HOME_ENV = "DSH_HOME";
/**
* Resolve the default DeepSeek Harness home using Node's platform path rules.
* @returns the absolute default harness home path.
*/
function defaultDshHome() {
	return join(homedir(), DSH_HOME_DIR_NAME);
}
/**
* Expand supported tilde prefixes against the operating-system home.
* @param path - configured path that may begin with `~`, `~/`, or `~\`.
* @returns the expanded path, or the original value when no supported prefix is present.
*/
function expandHomePath(path) {
	if (path === "~") return homedir();
	if (path.startsWith("~/") || path.startsWith("~\\")) return join(homedir(), path.slice(2));
	return path;
}
/**
* Resolve one user-data root from an explicit path, an environment override, and a default.
* @param configured - explicit path, which has highest precedence.
* @param env - environment mapping to read.
* @param envName - environment variable that overrides the default.
* @param fallback - default root, used when neither the explicit path nor the environment provides one.
* @returns the normalized absolute root.
*/
function resolveRoot(configured, env, envName, fallback) {
	const fromEnv = env[envName];
	return resolve(expandHomePath(configured ?? (fromEnv !== void 0 && fromEnv.trim().length > 0 ? fromEnv : fallback())));
}
/**
* Resolve the single-root DeepSeek Harness home.
*
* Precedence, highest first: an explicit configured path, `$DSH_HOME`, then
* `~/.dsh`. The harness keeps all user data under one root. An empty or
* whitespace-only `$DSH_HOME` is treated as unset, so a blank override never
* resolves the home to the current working directory.
* @param configured - explicit harness-home override, which has highest precedence.
* @param env - environment mapping used to read `DSH_HOME`.
* @returns the normalized absolute harness home path.
*/
function resolveDshHome(configured, env = process.env) {
	return resolveRoot(configured, env, DSH_HOME_ENV, defaultDshHome);
}
/**
* Join path segments onto the resolved DeepSeek Harness home.
* @param segments - path segments appended to the Harness home; an empty list returns the home itself.
* @returns the normalized absolute joined path.
*/
function dshHomePath(...segments) {
	return join(resolveDshHome(), ...segments);
}
//#endregion
//#region src/session-artifacts.ts
/**
* Encode an arbitrary string as one safe path segment, injectively over all
* JS strings (parity with the official jsonl backend's segment encoder: safe
* units literal, every other unit `~XXXX`, dot segments traversal-proofed).
* @param raw - the string to encode; must be non-empty.
* @returns the escaped single path segment.
*/
function encodeSegment(raw) {
	if (raw.length === 0) throw new Error("cannot encode an empty path segment");
	if (raw === ".") return "~002E";
	if (raw === "..") return "~002E~002E";
	let out = "";
	for (let i = 0; i < raw.length; i++) {
		const code = raw.charCodeAt(i);
		const ch = String.fromCharCode(code);
		if (ch !== "~" && /^[A-Za-z0-9._-]$/.test(ch)) out += ch;
		else out += "~" + code.toString(16).toUpperCase().padStart(4, "0");
	}
	return out;
}
/**
* Parse one committed generation filename into its format version.
* @param filename - candidate entry from a session directory.
* @returns the generation version (`session.vN.jsonl` / `session.vN.jsonl.zstd`;
*   version-zero is `session.jsonl`), or undefined for non-generation names.
*/
function logGeneration(filename) {
	const match = /^session\.v(\d+)\.jsonl(\.zstd)?$/.exec(filename);
	if (match !== null) return Number(match[1]);
	return filename === "session.jsonl" ? 0 : void 0;
}
/**
* Find the session's storage dir and newest log file under a sessions root.
* @param root - sessions root directory (`$DSH_HOME/sessions`).
* @param sessionId - raw session id (encoded here before any filesystem use).
* @param io - fs surface; a stat miss under one project directory keeps the scan going.
* @returns the newest owning directory and its highest-generation log file,
*   either null when absent (sqlite deployments, unflushed sessions).
*/
async function findSessionArtifacts(root, sessionId, io) {
	const segment = encodeSegment(sessionId);
	let best;
	for (const entry of await io.readdir(root, { withFileTypes: true })) {
		if (!entry.isDirectory() || !entry.name.startsWith("--") || !entry.name.endsWith("--")) continue;
		const candidate = join(root, entry.name, segment);
		try {
			const stats = await io.stat(candidate);
			if (best === void 0 || stats.mtimeMs > best.mtimeMs) best = {
				dir: candidate,
				mtimeMs: stats.mtimeMs
			};
		} catch {}
	}
	if (best === void 0) return {
		dir: null,
		log: null
	};
	let log;
	let logVersion = -1;
	for (const entry of await io.readdir(best.dir, { withFileTypes: true })) {
		if (!entry.isFile()) continue;
		const version = logGeneration(entry.name);
		if (version !== void 0 && version >= logVersion) {
			logVersion = version;
			log = join(best.dir, entry.name);
		}
	}
	return {
		dir: best.dir,
		log: log ?? null
	};
}
//#endregion
//#region src/reveal.ts
/** Platform opener commands for revealing a path in the OS file manager. */
/**
* Build the opener invocation that reveals/selects a path (pure, platform injectable).
* @param path - absolute path to reveal.
* @param platform - Node platform selector; win32 selects the entry, darwin
*   reveals with `open -R`, everything else opens the parent directory.
* @returns the argv invocation (never a shell string).
*/
function revealCommand(path, platform) {
	switch (platform) {
		case "darwin": return {
			command: "open",
			args: ["-R", path]
		};
		case "win32": return {
			command: "explorer.exe",
			args: [`/select,${path}`]
		};
		default: return {
			command: "xdg-open",
			args: [dirname(path)]
		};
	}
}
/**
* Launch the reveal opener detached and return immediately.
* @param path - absolute path to reveal in the OS file manager.
* @returns started acknowledgement; opener failures after the spawn surface
*   through the OS (the child's error event is swallowed on purpose).
*/
function launchReveal(path) {
	const spec = revealCommand(path, process.platform);
	const child = spawn(spec.command, spec.args, {
		detached: true,
		stdio: "ignore"
	});
	child.on("error", () => {});
	child.unref();
	return { started: true };
}
//#endregion
//#region src/trust-fence.ts
function header(headers, name) {
	const value = headers[name];
	return typeof value === "string" ? value : void 0;
}
/** Normalized URL of a Host-header authority, or undefined when unparsable. */
function parseAuthority(authority) {
	try {
		return new URL(`http://${authority}`);
	} catch {
		return;
	}
}
/** Whether a normalized URL hostname names the local loopback authority. */
function isLoopbackHostname(hostname) {
	if (hostname === "localhost" || hostname === "[::1]") return true;
	const parts = hostname.split(".");
	return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}
/**
* Decide whether one plugin route request may proceed.
* @param request - node HTTP request facts (headers).
* @param trustedHosts - non-loopback authorities this deployment serves.
* @returns true when the Host is ours (loopback or trusted) and browser
*   markers are same-origin; absent Origin passes on the bound Host alone,
*   the opaque "null" origin is refused.
*/
function isTrustedRouteRequest(request, trustedHosts = []) {
	const host = header(request.headers, "host");
	if (host === void 0) return false;
	const hostUrl = parseAuthority(host);
	if (hostUrl === void 0) return false;
	if (!(isLoopbackHostname(hostUrl.hostname) || trustedHosts.some((entry) => {
		const entryUrl = parseAuthority(entry);
		return entryUrl !== void 0 && entryUrl.hostname === hostUrl.hostname;
	}))) return false;
	if (header(request.headers, "sec-fetch-site") === "cross-site") return false;
	const origin = header(request.headers, "origin");
	if (origin === void 0) return true;
	if (origin === "null") return false;
	try {
		return new URL(origin).hostname === hostUrl.hostname;
	} catch {
		return false;
	}
}
//#endregion
//#region src/index.ts
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
const name = "ya-workspace-sidebar";
/** Per-record cache documents live one level below the domain directory. */
const CACHE_DIR = join(dshHomePath("storages"), "session_projcache", "sessions");
/** Stamp matching `projectionCacheDomainSpec.version` at dsh 0.2.2-rc.1 (accepted set: 3–7). */
const CACHE_DOMAIN_VERSION = 7;
/** The title unit's persisted row version (session-title stateVersion). */
const TITLE_ROW_VERSION = 1;
/** Read one per-record document; absent or foreign content resolves empty. */
function readRecordFile(path) {
	try {
		const doc = JSON.parse(readFileSync(path, "utf8"));
		const record = doc.record;
		return {
			version: typeof doc.version === "number" ? doc.version : CACHE_DOMAIN_VERSION,
			record: {
				identity: record?.identity ?? {},
				rows: record?.rows ?? {}
			}
		};
	} catch {
		return {
			version: CACHE_DOMAIN_VERSION,
			record: {
				identity: {},
				rows: {}
			}
		};
	}
}
/** Merge one title row into the session's per-record document, atomically. */
async function mergeTitleRow(id, payload) {
	const path = join(CACHE_DIR, `${id}.json`);
	const { version, record } = readRecordFile(path);
	record.identity = {
		...record.identity,
		...payload.identity
	};
	const current = record.rows.title;
	if (current !== void 0 && current.seq > payload.seq) return;
	record.rows.title = {
		ver: TITLE_ROW_VERSION,
		seq: payload.seq,
		val: payload.title
	};
	await mkdir(CACHE_DIR, { recursive: true });
	const tmp = `${path}.tmp-${process.pid}`;
	await writeFile(tmp, `${JSON.stringify({
		version,
		record
	}, null, 2)}\n`, "utf8");
	await rename(tmp, path);
}
/** Identity carried by the title payload, projected from a SessionHeader-shaped source. */
function identityOf(header) {
	return {
		...typeof header.version === "number" ? { formatVersion: header.version } : {},
		...typeof header.createdAt === "number" ? { createdAt: header.createdAt } : {},
		...header.cwd !== void 0 ? { cwd: header.cwd } : {},
		...typeof header.isSeeded === "boolean" ? { isSeeded: header.isSeeded } : {}
	};
}
function apply(ctx) {
	const cache = ctx.get("sessionProjectionCache");
	let pending = /* @__PURE__ */ new Map();
	let timer;
	function flush() {
		timer = void 0;
		const batch = pending;
		pending = /* @__PURE__ */ new Map();
		for (const [id, payload] of batch) mergeTitleRow(id, payload).catch((error) => {
			ctx.logger.warn(`ya-workspace-sidebar: title cache row for "${id}" not persisted: ${String(error)}`);
		});
	}
	ctx.events.on("session/event", (session, event) => {
		if (event.type !== "session/title") return;
		if (event.data?.title === void 0) return;
		if (cache !== void 0) {
			cache.write(session).catch(() => {
				pending.set(session.id, {
					seq: event.seq,
					title: event.data.title,
					identity: identityOf(session.header)
				});
				timer ??= setTimeout(flush, 2e3);
			});
			return;
		}
		pending.set(session.id, {
			seq: event.seq,
			title: event.data.title,
			identity: identityOf(session.header)
		});
		timer ??= setTimeout(flush, 2e3);
	});
	queueMicrotask(() => {
		(async () => {
			const persistence = ctx.get("sessionPersistence");
			const query = ctx.get("sessionQuery");
			if (persistence === void 0 || query === void 0) return;
			let snapshots;
			try {
				snapshots = await persistence.list();
			} catch (error) {
				ctx.logger.warn(`ya-workspace-sidebar: title backfill list failed: ${String(error)}`);
				return;
			}
			for (const snapshot of snapshots) {
				const header = snapshot.header;
				try {
					const known = cache?.cachedSnapshot(header)?.values?.title ?? cache?.cachedPredecessorTitle(header)?.values?.title;
					if (typeof known === "string" && known !== "") continue;
					const observation = await query.observeSession(header.id, { projectionMode: "all" });
					try {
						const title = observation.projections?.values?.title;
						const seq = observation.projections?.asOfSeq;
						if (typeof title === "string" && title !== "" && typeof seq === "number") await mergeTitleRow(header.id, {
							seq,
							title,
							identity: identityOf(header)
						});
					} finally {
						observation[Symbol.dispose]();
					}
				} catch {}
			}
		})();
	});
	ctx.inject(["webServer"], (wctx) => {
		const webServer = wctx.webServer;
		const disposeRoutes = [webServer.register({
			kind: "exact",
			path: "/ya-workspace-sidebar/paths",
			handler: pathsRoute
		}), webServer.register({
			kind: "exact",
			path: "/ya-workspace-sidebar/reveal",
			handler: revealRoute
		})];
		return () => {
			for (const dispose of disposeRoutes) dispose();
		};
	});
}
/** Body size bound of one JSON request (defense against unbounded reads). */
const MAX_BODY_BYTES = 1 << 20;
/** Read and parse one bounded JSON request body; malformed input throws. */
async function readJsonBody(req) {
	const chunks = [];
	let total = 0;
	for await (const chunk of req) {
		const buffer = Buffer.from(chunk);
		total += buffer.length;
		if (total > MAX_BODY_BYTES) throw new Error("request body too large");
		chunks.push(buffer);
	}
	const text = Buffer.concat(chunks).toString("utf8");
	if (text.trim() === "") return {};
	return JSON.parse(text);
}
/** Write one JSON response. */
function writeJson(res, status, body) {
	res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
	res.end(JSON.stringify(body));
}
/** Reject untrusted/fenced requests with 403. */
function refused(res) {
	writeJson(res, 403, { error: "untrusted" });
}
/** POST /ya-workspace-sidebar/paths — probe the session's jsonl storage layout. */
async function pathsRoute(req, res) {
	if (!isTrustedRouteRequest(req)) {
		refused(res);
		return;
	}
	let payload;
	try {
		payload = await readJsonBody(req);
	} catch (error) {
		writeJson(res, 400, { error: error instanceof Error ? error.message : "bad json" });
		return;
	}
	const sessionId = payload?.sessionId;
	if (typeof sessionId !== "string" || sessionId.length === 0) {
		writeJson(res, 400, { error: "sessionId required" });
		return;
	}
	try {
		writeJson(res, 200, await findSessionArtifacts(dshHomePath("sessions"), sessionId, {
			readdir: (path, options) => readdir(path, options),
			stat: (path) => stat(path)
		}));
	} catch (error) {
		writeJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
	}
}
/** POST /ya-workspace-sidebar/reveal — open one existing directory in the OS file manager. */
async function revealRoute(req, res) {
	if (!isTrustedRouteRequest(req)) {
		refused(res);
		return;
	}
	let payload;
	try {
		payload = await readJsonBody(req);
	} catch (error) {
		writeJson(res, 400, { error: error instanceof Error ? error.message : "bad json" });
		return;
	}
	const path = payload?.path;
	if (typeof path !== "string" || !(isAbsolute(path) || win32.isAbsolute(path) || posix.isAbsolute(path))) {
		writeJson(res, 400, { error: "absolute path required" });
		return;
	}
	try {
		if (!(await stat(path)).isDirectory()) {
			writeJson(res, 400, { error: "not a directory" });
			return;
		}
	} catch {
		writeJson(res, 400, { error: "path not found" });
		return;
	}
	writeJson(res, 200, launchReveal(path));
}
//#endregion
export { apply, name };
