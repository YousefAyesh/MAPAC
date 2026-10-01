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

  it('does not gate monthly giving on a separate Price id', async () => {
    // Monthly subscriptions are built from inline price_data in the checkout route, so
    // no predefined Stripe Price is needed. A secret key alone enables everything.
    process.env.STRIPE_SECRET_KEY = 'sk_test_x'
    delete process.env.STRIPE_RECURRING_PRICE_ID
    const { isStripeConfigured } = await import('./stripe')
    expect(isStripeConfigured()).toBe(true)
  })

  it('no longer exports a separate recurring-configured check', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x'
    const stripe = await import('./stripe')
    expect('isRecurringConfigured' in stripe).toBe(false)
  })

  it('throws a clear error if the client is requested while unconfigured', async () => {
    delete process.env.STRIPE_SECRET_KEY
    const { getStripe } = await import('./stripe')
    expect(() => getStripe()).toThrow(/STRIPE_SECRET_KEY/)
  })
})
