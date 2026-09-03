/** Fixed-stride virtual scroller for the global recent-sessions block. */
import { type ReactNode } from 'react';
import { type SessionRow } from './model.ts';
interface VirtualRecentListProps {
    rows: readonly SessionRow[];
    renderItem: (row: SessionRow) => ReactNode;
    ariaLabel: string;
    /** Receives the viewport element for external geometry (the drag resizer). */
    viewportRef?: (node: HTMLDivElement | null) => void;
    /** Overrides the stylesheet's default viewport cap, in px. */
    maxHeight?: number;
}
/**
 * Renders `rows` inside a bounded, scrollable viewport while mounting only
 * the visible slice (plus overscan). The row stride is fixed
 * ({@link RECENT_ROW_STRIDE}), so windowing is pure arithmetic — no per-row
 * measurement — and the scroll position survives session-list updates.
 */
export declare function VirtualRecentList({ rows, renderItem, ariaLabel, viewportRef, maxHeight }: VirtualRecentListProps): import("react").JSX.Element;
export {};
