import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getActionMode, getRecentViewportHeight, setActionMode, setRecentViewportHeight,
  subscribeActionMode, subscribeRecentViewportHeight, type SessionActionMode,
} from '../src/client/settings.ts'

describe('session action mode preference', () => {
  let stored: Record<string, string> = {}

  beforeEach(() => {
    stored = {}
    const mockStorage = {
      getItem: (key: string) => stored[key] ?? null,
      setItem: (key: string, value: string) => { stored[key] = value },
      removeItem: (key: string) => { delete stored[key] },
    }
    vi.stubGlobal('window', { localStorage: mockStorage })
    setActionMode('archive')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('defaults to archive mode after reset', () => {
    expect(getActionMode()).toBe('archive')
  })

  it('persists mode to localStorage and notifies subscribers', () => {
    const calls: SessionActionMode[] = []
    const unsubscribe = subscribeActionMode(() => { calls.push(getActionMode()) })
    setActionMode('delete')
    expect(getActionMode()).toBe('delete')
    expect(stored['ya-workspace-sidebar:action-mode']).toBe('delete')
    expect(calls).toEqual(['delete'])
    setActionMode('archive')
    expect(stored['ya-workspace-sidebar:action-mode']).toBe('archive')
    expect(calls).toEqual(['delete', 'archive'])
    unsubscribe()
    setActionMode('delete')
    expect(calls).toEqual(['delete', 'archive'])
  })

  it('does not notify when setting the same mode', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeActionMode(listener)
    setActionMode('archive')
    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('survives a localStorage failure without throwing', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => { throw new Error('denied') },
        setItem: () => { throw new Error('denied') },
        removeItem: () => { throw new Error('denied') },
      },
    })
    expect(() => setActionMode('delete')).not.toThrow()
    expect(getActionMode()).toBe('delete')
  })
})

describe('recent viewport height preference', () => {
  let stored: Record<string, string> = {}

  beforeEach(() => {
    stored = {}
    const mockStorage = {
      getItem: (key: string) => stored[key] ?? null,
      setItem: (key: string, value: string) => { stored[key] = value },
      removeItem: (key: string) => { delete stored[key] },
    }
    vi.stubGlobal('window', { localStorage: mockStorage })
    setRecentViewportHeight(undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts unset and persists a dragged height', () => {
    expect(getRecentViewportHeight()).toBeUndefined()
    expect(stored['ya-workspace-sidebar:recent-height']).toBeUndefined()
    setRecentViewportHeight(280)
    expect(getRecentViewportHeight()).toBe(280)
    expect(stored['ya-workspace-sidebar:recent-height']).toBe('280')
  })

  it('clears the stored entry when reset to undefined', () => {
    setRecentViewportHeight(200)
    setRecentViewportHeight(undefined)
    expect(getRecentViewportHeight()).toBeUndefined()
    expect(stored['ya-workspace-sidebar:recent-height']).toBeUndefined()
  })

  it('clamps values into the supported bounds', () => {
    setRecentViewportHeight(10)
    expect(getRecentViewportHeight()).toBe(70)
    setRecentViewportHeight(9999)
    expect(getRecentViewportHeight()).toBe(640)
  })

  it('does not notify when the height is unchanged', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeRecentViewportHeight(listener)
    setRecentViewportHeight(undefined)
    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('ignores corrupt or out-of-range stored values on load', async () => {
    stored['ya-workspace-sidebar:recent-height'] = 'not-a-number'
    vi.resetModules()
    const fresh = await import('../src/client/settings.ts')
    expect(fresh.getRecentViewportHeight()).toBeUndefined()
    stored['ya-workspace-sidebar:recent-height'] = '9999'
    vi.resetModules()
    const reloaded = await import('../src/client/settings.ts')
    expect(reloaded.getRecentViewportHeight()).toBe(640)
  })
})
