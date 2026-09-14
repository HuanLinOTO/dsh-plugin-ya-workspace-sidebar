import { describe, expect, it } from 'vitest'
import { revealCommand } from '../src/reveal.ts'

describe('revealCommand per platform', () => {
  it('win32 selects the path in Explorer as one argv entry', () => {
    expect(revealCommand('C:/a/b', 'win32')).toEqual({
      command: 'explorer.exe',
      args: ['/select,C:/a/b'],
    })
  })

  it('darwin reveals with open -R', () => {
    expect(revealCommand('/a/b', 'darwin')).toEqual({ command: 'open', args: ['-R', '/a/b'] })
  })

  it('other platforms open the parent directory', () => {
    expect(revealCommand('/a/b/c.txt', 'linux')).toEqual({ command: 'xdg-open', args: ['/a/b'] })
  })
})
