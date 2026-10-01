import { describe, it, expect, afterEach, vi } from 'vitest'
import { siteUrl } from './site-url'

describe('siteUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns the configured URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://mapacnc.com')
    vi.stubEnv('NODE_ENV', 'production')
    expect(siteUrl()).toBe('https://mapacnc.com')
  })

  it('falls back to localhost outside production', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('NODE_ENV', 'development')
    expect(siteUrl()).toBe('http://localhost:3000')
  })

  it('throws in production when the variable is unset', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('NODE_ENV', 'production')
    expect(() => siteUrl()).toThrow(/NEXT_PUBLIC_SITE_URL/)
  })
})
