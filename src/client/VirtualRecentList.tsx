/** Fixed-stride virtual scroller for the global recent-sessions block. */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { RECENT_ROW_STRIDE, virtualWindow, type SessionRow } from './model.ts'

interface VirtualRecentListProps {
  rows: readonly SessionRow[]
  renderItem: (row: SessionRow) => ReactNode
  ariaLabel: string
  /** Receives the viewport element for external geometry (the drag resizer). */
  viewportRef?: (node: HTMLDivElement | null) => void
  /** Overrides the stylesheet's default viewport cap, in px. */
  maxHeight?: number
}

/**
 * Renders `rows` inside a bounded, scrollable viewport while mounting only
 * the visible slice (plus overscan). The row stride is fixed
 * ({@link RECENT_ROW_STRIDE}), so windowing is pure arithmetic — no per-row
 * measurement — and the scroll position survives session-list updates.
 */
export function VirtualRecentList({ rows, renderItem, ariaLabel, viewportRef, maxHeight }: VirtualRecentListProps) {
  const viewportRefInternal = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  // Measure the viewport before first paint and keep it fresh across resizes
  // and the collapse/expand grid animation.
  useLayoutEffect(() => {
    const el = viewportRefInternal.current
    if (el === null) return
    const observer = new ResizeObserver(entries => {
      const entry = entries[0]
      if (entry !== undefined) setViewportHeight(entry.contentRect.height)
    })
    observer.observe(el)
    return () => { observer.disconnect() }
  }, [])

  // Coalesce scroll events into at most one state update per animation frame.
  useEffect(() => () => {
    if (frameRef.current !== 0) window.cancelAnimationFrame(frameRef.current)
  }, [])
  const handleScroll = () => {
    if (frameRef.current !== 0) return
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = 0
      const el = viewportRefInternal.current
      if (el !== null) setScrollTop(el.scrollTop)
    })
  }

  const { start, end } = virtualWindow(scrollTop, viewportHeight, rows.length)
  const slice: ReactNode[] = []
  for (let index = start; index < end; index += 1) {
    const row = rows[index]
    if (row !== undefined) {
      slice.push(
        <div key={row.id} className="ya-virtual-slot" style={{ top: index * RECENT_ROW_STRIDE }}>
          {renderItem(row)}
        </div>,
      )
    }
  }
  const attachViewport = (node: HTMLDivElement | null): void => {
    viewportRefInternal.current = node
    viewportRef?.(node)
  }
  return (
    <div
      ref={attachViewport}
      className="ya-recent-list ya-virtual-viewport"
      role="tree"
      aria-label={ariaLabel}
      style={maxHeight === undefined ? undefined : { maxHeight: `${maxHeight}px` }}
      onScroll={handleScroll}
    >
      <div className="ya-virtual-canvas" style={{ height: rows.length * RECENT_ROW_STRIDE }}>{slice}</div>
    </div>
  )
}
