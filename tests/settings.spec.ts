import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getActionMode, setActionMode, subscribeActionMode, type SessionActionMode,
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
