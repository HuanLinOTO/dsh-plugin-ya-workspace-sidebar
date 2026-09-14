import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import * as plugin from '../src/index.ts'

describe('plugin shape', () => {
  it('uses named function-plugin exports without a default', () => {
    expect(plugin.name).toBe('ya-workspace-sidebar')
    expect(typeof plugin.apply).toBe('function')
    expect('default' in plugin).toBe(false)
  })

  it('disables ui-workspace and inserts the replacement package', () => {
    const path = fileURLToPath(new URL('../cordis.patch.yml', import.meta.url))
    const patch = readFileSync(path, 'utf8')
    expect(patch).toContain('- id: ui-workspace')
    expect(patch).toContain('disabled: true')
    expect(patch).toContain("name: '@huanlin/dsh-plugin-ya-workspace-sidebar'")
  })

  it('keeps top-level inject empty so the title-cache fix works without a webServer', () => {
    // The routes mount through the runtime ctx.inject(['webServer'], ...) inside
    // apply; a top-level declaration would park the whole plugin (including the
    // title-cache listener) in CLI profiles that never provide the service.
    expect(plugin.inject).toBeUndefined()
    const source = readFileSync(fileURLToPath(new URL('../src/index.ts', import.meta.url)), 'utf8')
    expect(source).toContain("ctx.inject(['webServer']")
  })

  it('registers both routes on the scoped inject-callback ctx once webServer arrives', () => {
    const registered: string[] = []
    const injectCallbacks: Array<(scoped: unknown) => unknown> = []
    const ctx = {
      events: { on: () => () => {} },
      inject: (_deps: string[], callback: (scoped: unknown) => unknown) => {
        injectCallbacks.push(callback)
        return {}
      },
    }
    plugin.apply(ctx as Parameters<typeof plugin.apply>[0])
    expect(injectCallbacks).toHaveLength(1)
    // The service rides the scoped callback ctx; reading it off the outer
    // plugin ctx (the original bug) throws here as undefined.register.
    const scoped = {
      webServer: {
        register: (route: { path: string }) => {
          registered.push(route.path)
          return () => {}
        },
      },
    }
    expect(() => injectCallbacks[0]?.(scoped)).not.toThrow()
    expect(registered).toEqual(['/ya-workspace-sidebar/paths', '/ya-workspace-sidebar/reveal'])
  })
})
