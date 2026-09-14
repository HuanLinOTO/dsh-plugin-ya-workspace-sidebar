import { describe, expect, it } from 'vitest'
import { isTrustedRouteRequest } from '../src/trust-fence.ts'

const req = (headers: Record<string, string>): { headers: Record<string, string> } => ({ headers })

describe('route trust fence', () => {
  it('accepts a loopback host with same-origin markers', () => {
    expect(isTrustedRouteRequest(req({ host: '127.0.0.1:3080', origin: 'http://127.0.0.1:3080' }))).toBe(true)
    expect(isTrustedRouteRequest(req({ host: 'localhost:3080' }))).toBe(true)
  })

  it('refuses a non-loopback host outside the trusted list', () => {
    expect(isTrustedRouteRequest(req({ host: 'evil.example:3080' }))).toBe(false)
  })

  it('accepts a configured trusted authority', () => {
    expect(isTrustedRouteRequest(req({ host: 'box.lan:3080' }), ['box.lan:3080'])).toBe(true)
  })

  it('refuses cross-site fetch markers', () => {
    expect(isTrustedRouteRequest(req({ host: '127.0.0.1:3080', 'sec-fetch-site': 'cross-site' }))).toBe(false)
  })

  it('refuses a foreign origin on a loopback host', () => {
    expect(isTrustedRouteRequest(req({ host: '127.0.0.1:3080', origin: 'http://evil.example' }))).toBe(false)
  })

  it('refuses the opaque null origin and a missing host', () => {
    expect(isTrustedRouteRequest(req({ host: '127.0.0.1:3080', origin: 'null' }))).toBe(false)
    expect(isTrustedRouteRequest(req({}))).toBe(false)
  })
})
