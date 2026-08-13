import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import * as plugin from '../src/index.ts'
import * as invariant from '../src/invariant.ts'

describe('plugin shape', () => {
  it('uses named function-plugin exports without a default', () => {
    expect(plugin.name).toBe('ya-workspace-sidebar')
    expect(typeof plugin.apply).toBe('function')
    expect('default' in plugin).toBe(false)
    expect(invariant.name).toBe('ya-workspace-sidebar-invariant')
    expect(invariant.inject).toEqual(['invariants'])
  })

  it('disables ui-workspace and inserts the replacement package', () => {
    const path = fileURLToPath(new URL('../cordis.patch.yml', import.meta.url))
    const patch = readFileSync(path, 'utf8')
    expect(patch).toContain('- id: ui-workspace')
    expect(patch).toContain('disabled: true')
    expect(patch).toContain("name: '@huanlin/dsh-plugin-ya-workspace-sidebar'")
  })
})
