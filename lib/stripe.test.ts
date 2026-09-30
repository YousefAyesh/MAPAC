import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const ORIGINAL_ENV = { ...process.env }

describe('stripe configuration', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('reports unconfigured when STRIPE_SECRET_KEY is absent', async () => {
    delete process.env.STRIPE_SECRET_KEY
    const { isStripeConfigured } = await import('./stripe')
    expect(isStripeConfigured()).toBe(false)
  })

  it('reports configured when STRIPE_SECRET_KEY is present', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x'
    const { isStripeConfigured } = await import('./stripe')
    expect(isStripeConfigured()).toBe(true)
  })

  it('reports recurring unavailable without a price id, even with a secret key', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x'
    delete process.env.STRIPE_RECURRING_PRICE_ID
    const { isRecurringConfigured } = await import('./stripe')
    expect(isRecurringConfigured()).toBe(false)
  })

  it('reports recurring available with both a key and a price id', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x'
    process.env.STRIPE_RECURRING_PRICE_ID = 'price_123'
    const { isRecurringConfigured } = await import('./stripe')
    expect(isRecurringConfigured()).toBe(true)
  })

  it('throws a clear error if the client is requested while unconfigured', async () => {
    delete process.env.STRIPE_SECRET_KEY
    const { getStripe } = await import('./stripe')
    expect(() => getStripe()).toThrow(/STRIPE_SECRET_KEY/)
  })
})
