/** Package invariant companion for ya-workspace-sidebar. */
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants';
export declare const name = "ya-workspace-sidebar-invariant";
export declare const inject: string[];
interface InvariantContext {
    invariants: {
        register: (name: string, installer: InvariantInstaller) => () => void;
    };
}
/** Register package ownership with the invariant service. */
export declare const apply: (ctx: InvariantContext) => Promise<() => void>;
export {};
