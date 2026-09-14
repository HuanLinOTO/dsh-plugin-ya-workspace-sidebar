import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  __resetSessionFlagsForTest, getPinnedOrder, getUnread, isPinned, isUnread,
  markRead, markUnread, subscribePinned, subscribeUnread, togglePinned,
} from '../src/client/session-flags.ts'

describe('pinned session order', () => {
  let stored: Record<string, string> = {}

  beforeEach(() => {
    stored = {}
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => stored[key] ?? null,
        setItem: (key: string, value: string) => { stored[key] = value },
        removeItem: (key: string) => { delete stored[key] },
      },
    })
    __resetSessionFlagsForTest()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts empty and unshifts newly pinned ids', () => {
    togglePinned('s1')
    togglePinned('s2')
    expect(getPinnedOrder()).toEqual(['s2', 's1'])
    expect(isPinned('s1')).toBe(true)
    expect(stored['ya-workspace-sidebar:pinned']).toBe('["s2","s1"]')
  })

  it('toggling a pinned id removes it', () => {
    togglePinned('s1')
    togglePinned('s2')
    togglePinned('s1')
    expect(getPinnedOrder()).toEqual(['s2'])
    expect(isPinned('s1')).toBe(false)
  })

  it('notifies subscribers on every membership change', () => {
    const listener = vi.fn()
    const unsubscribe = subscribePinned(listener)
    togglePinned('s1')
    expect(listener).toHaveBeenCalledTimes(1)
    togglePinned('s1')
    togglePinned('s1')
    expect(listener).toHaveBeenCalledTimes(3)
    unsubscribe()
    togglePinned('s2')
    expect(listener).toHaveBeenCalledTimes(3)
  })

  it('survives a localStorage failure without throwing', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => { throw new Error('denied') },
        setItem: () => { throw new Error('denied') },
        removeItem: () => { throw new Error('denied') },
      },
    })
    __resetSessionFlagsForTest()
    expect(() => togglePinned('s1')).not.toThrow()
    expect(isPinned('s1')).toBe(true)
  })

  it('drops malformed stored JSON to empty', () => {
    stored['ya-workspace-sidebar:pinned'] = '{oops'
    __resetSessionFlagsForTest()
    expect(getPinnedOrder()).toEqual([])
  })
})

describe('unread session set', () => {
  let stored: Record<string, string> = {}

  beforeEach(() => {
    stored = {}
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => stored[key] ?? null,
        setItem: (key: string, value: string) => { stored[key] = value },
        removeItem: (key: string) => { delete stored[key] },
      },
    })
    __resetSessionFlagsForTest()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('marks and clears unread ids, persisting the set', () => {
    markUnread('s1')
    expect(isUnread('s1')).toBe(true)
    expect(getUnread().has('s1')).toBe(true)
    expect(stored['ya-workspace-sidebar:unread']).toBe('["s1"]')
    markRead('s1')
    expect(isUnread('s1')).toBe(false)
    expect(stored['ya-workspace-sidebar:unread']).toBe('[]')
  })

  it('markRead on a read id is a silent no-op', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeUnread(listener)
    markRead('s1')
    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('notifies subscribers on membership changes only', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeUnread(listener)
    markUnread('s1')
    markUnread('s1')
    markRead('s1')
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
  })
})
