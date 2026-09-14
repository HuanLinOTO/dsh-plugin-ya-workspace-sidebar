import { mkdtemp, mkdir, rm, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { readdir, stat } from 'node:fs/promises'
import { encodeSegment, findSessionArtifacts } from '../src/session-artifacts.ts'

const IO = { readdir, stat }

describe('encodeSegment (jsonl backend parity)', () => {
  it('keeps safe characters literal', () => {
    expect(encodeSegment('abc123._-')).toBe('abc123._-')
  })

  it('escapes unsafe characters as ~XXXX uppercase hex', () => {
    expect(encodeSegment('a b/c')).toBe('a~0020b~002Fc')
  })

  it('special-cases dot segments against traversal', () => {
    expect(encodeSegment('.')).toBe('~002E')
    expect(encodeSegment('..')).toBe('~002E~002E')
  })

  it('escapes tilde itself', () => {
    expect(encodeSegment('a~b')).toBe('a~007Eb')
  })
})

describe('findSessionArtifacts', () => {
  let root: string

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'ya-ws-'))
    // Project A holds the newest session dir; project B holds an older copy.
    const dirA = join(root, '--proj-A--', encodeSegment('s1'))
    const dirB = join(root, '--proj-B--', encodeSegment('s1'))
    await mkdir(dirA, { recursive: true })
    await mkdir(dirB, { recursive: true })
    await writeFile(join(dirA, 'v2.jsonl'), '')
    await writeFile(join(dirA, 'v3.jsonl.zstd'), '')
    await writeFile(join(dirA, 'notes.txt'), '')
    await writeFile(join(dirB, 'v1.jsonl'), '')
    const later = new Date(Date.now() + 5000)
    await utimes(dirA, later, later)
  })

  afterAll(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('finds the newest project copy and its highest generation log', async () => {
    const result = await findSessionArtifacts(root, 's1', IO)
    expect(result.dir).toBe(join(root, '--proj-A--', encodeSegment('s1')))
    expect(result.log).toBe(join(result.dir ?? '', 'v3.jsonl.zstd'))
  })

  it('returns double null when the session has no directory', async () => {
    expect(await findSessionArtifacts(root, 'missing', IO)).toEqual({ dir: null, log: null })
  })

  it('returns a null log when the directory holds no generation files', async () => {
    const emptyRoot = await mkdtemp(join(tmpdir(), 'ya-ws-empty-'))
    try {
      const dir = join(emptyRoot, '--proj--', encodeSegment('e1'))
      await mkdir(dir, { recursive: true })
      const result = await findSessionArtifacts(emptyRoot, 'e1', IO)
      expect(result.dir).toBe(dir)
      expect(result.log).toBeNull()
    } finally {
      await rm(emptyRoot, { recursive: true, force: true })
    }
  })
})
