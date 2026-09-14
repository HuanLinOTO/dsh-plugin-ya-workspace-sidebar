/** 19-language override dictionaries for the better-locale store.
 *
 * Partial on purpose: an override language covers the keys it translated and
 * falls back to the primary dictionary (en) for the rest, so new keys ship
 * without forcing translations of every language up front.
 */
import type { YaWorkspaceKey } from './locales.ts';
export declare const dicts: Record<string, Partial<Record<YaWorkspaceKey, string>>>;
