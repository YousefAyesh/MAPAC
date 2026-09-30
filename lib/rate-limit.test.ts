import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { checkRateLimit, __resetRateLimit } from './rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    __resetRateLimit()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests up to the limit', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 }).ok).toBe(true)
    }
  })

  it('blocks the request after the limit is exceeded', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 })
    expect(checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 }).ok).toBe(false)
  })

  it('tracks each key independently', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 })
    expect(checkRateLimit('5.6.7.8', { limit: 5, windowMs: 60_000 }).ok).toBe(true)
  })

  it('allows again once the window has elapsed', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 })
    expect(checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 }).ok).toBe(false)
    vi.advanceTimersByTime(60_001)
    expect(checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 }).ok).toBe(true)
  })

  it('reports how many seconds to wait when blocked', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 })
    const result = checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 })
    expect(result.ok).toBe(false)
    expect(result.retryAfterSeconds).toBeGreaterThan(0)
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(60)
  })
})
