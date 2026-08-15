import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** Services required by both replacement client entries. */
export declare const inject: string[];
/** Register the sidebar browser and conversation hero picker. */
export declare function apply(ctx: ClientContext): void;
