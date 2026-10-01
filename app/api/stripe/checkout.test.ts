import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { __resetRateLimit } from '@/lib/rate-limit'

/** Just enough of Stripe's session-create params shape for these assertions. */
type SessionCreateArgs = {
  mode: string
  line_items: Array<{ price_data: { unit_amount: number } }>
}

const createSession = vi.fn<(params: SessionCreateArgs) => Promise<{ url: string }>>(async () => ({
  url: 'https://checkout.stripe.com/c/pay/test',
}))

vi.mock('@/lib/stripe', () => ({
  isStripeConfigured: () => true,
  siteUrl: () => 'https://example.org',
  getStripe: () => ({ checkout: { sessions: { create: createSession } } }),
}))

function post(body: unknown, ip = '1.2.3.4') {
  return new Request('http://localhost/api/stripe/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  })
}

describe('POST /api/stripe/checkout', () => {
  beforeEach(() => {
    __resetRateLimit()
    createSession.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns a checkout url for a valid one-time donation', async () => {
    const { POST } = await import('./checkout/route')
    const res = await POST(post({ amount: 50, frequency: 'once' }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ url: expect.stringContaining('stripe.com') })
  })

  it('charges the server-validated amount, not a client-supplied cents value', async () => {
    const { POST } = await import('./checkout/route')
    // A hostile client sends amount 1 plus a bogus amountCents of 1 cent.
    await POST(post({ amount: 1, frequency: 'once', amountCents: 1 }))
    const arg = createSession.mock.calls[0]![0]
    expect(arg.line_items[0].price_data.unit_amount).toBe(100)
  })

  it('rejects an amount below the minimum with 400', async () => {
    const { POST } = await import('./checkout/route')
    const res = await POST(post({ amount: 0.5, frequency: 'once' }))
    expect(res.status).toBe(400)
    expect(createSession).not.toHaveBeenCalled()
  })

  it('rejects a negative amount with 400', async () => {
    const { POST } = await import('./checkout/route')
    const res = await POST(post({ amount: -100, frequency: 'once' }))
    expect(res.status).toBe(400)
    expect(createSession).not.toHaveBeenCalled()
  })

  it('rejects an unknown frequency with 400', async () => {
    const { POST } = await import('./checkout/route')
    const res = await POST(post({ amount: 50, frequency: 'weekly' }))
    expect(res.status).toBe(400)
    expect(createSession).not.toHaveBeenCalled()
  })

  it('uses subscription mode for a monthly donation', async () => {
    const { POST } = await import('./checkout/route')
    await POST(post({ amount: 50, frequency: 'monthly' }))
    const arg = createSession.mock.calls[0]![0]
    expect(arg.mode).toBe('subscription')
  })

  it('uses payment mode for a one-time donation', async () => {
    const { POST } = await import('./checkout/route')
    await POST(post({ amount: 50, frequency: 'once' }))
    const arg = createSession.mock.calls[0]![0]
    expect(arg.mode).toBe('payment')
  })

  it('rate limits repeated attempts from one address', async () => {
    const { POST } = await import('./checkout/route')
    for (let i = 0; i < 10; i++) await POST(post({ amount: 25, frequency: 'once' }, '8.8.8.8'))
    const res = await POST(post({ amount: 25, frequency: 'once' }, '8.8.8.8'))
    expect(res.status).toBe(429)
  })
})
