import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const ORIGINAL = { ...process.env }

async function load() {
  vi.resetModules()
  return (await import('./site-url')).siteUrl
}

function clear() {
  delete process.env.NEXT_PUBLIC_SITE_URL
  delete process.env.VERCEL_URL
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL
}

describe('siteUrl', () => {
  beforeEach(clear)
  afterEach(() => {
    process.env = { ...ORIGINAL }
  })

  it('uses NEXT_PUBLIC_SITE_URL when set', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://mapacnc.com'
    expect((await load())()).toBe('https://mapacnc.com')
  })

  it('strips a trailing slash, so joined paths never double up', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://mapacnc.com/'
    expect((await load())()).toBe('https://mapacnc.com')
  })

  it("prefers the explicit variable over Vercel's inferred hostname", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://mapacnc.com'
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'mapac.vercel.app'
    expect((await load())()).toBe('https://mapacnc.com')
  })

  it("falls back to Vercel's production domain, adding the protocol", async () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'mapac.vercel.app'
    expect((await load())()).toBe('https://mapac.vercel.app')
  })

  it('falls back to the per-deployment URL for preview builds', async () => {
    process.env.VERCEL_URL = 'mapac-git-abc123.vercel.app'
    expect((await load())()).toBe('https://mapac-git-abc123.vercel.app')
  })

  it('prefers the stable production domain over the per-deployment one', async () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'mapac.vercel.app'
    process.env.VERCEL_URL = 'mapac-git-abc123.vercel.app'
    expect((await load())()).toBe('https://mapac.vercel.app')
  })

  it('falls back to localhost in development', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect((await load())()).toBe('http://localhost:3000')
    vi.unstubAllEnvs()
  })

  it('throws in production when nothing resolves, rather than shipping localhost', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const fn = await load()
    expect(() => fn()).toThrow(/NEXT_PUBLIC_SITE_URL/)
    vi.unstubAllEnvs()
  })
})
