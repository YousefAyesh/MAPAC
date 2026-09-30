import { describe, it, expect, beforeEach, vi } from 'vitest'
import { __resetRateLimit } from '@/lib/rate-limit'

vi.mock('@/lib/email', () => ({
  isEmailConfigured: () => true,
  notificationRecipient: () => 'mail@mapacnc.com',
  sendNotification: vi.fn(async () => ({ sent: true })),
}))

function post(body: unknown, ip = '1.2.3.4') {
  return new Request('http://localhost/api/newsletter', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  })
}

describe('POST /api/newsletter', () => {
  beforeEach(() => {
    __resetRateLimit()
  })

  it('accepts a valid signup', async () => {
    const { POST } = await import('./newsletter/route')
    const res = await POST(post({ name: 'Aisha', email: 'a@example.com' }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ ok: true })
  })

  it('returns 400 with field errors for an invalid email', async () => {
    const { POST } = await import('./newsletter/route')
    const res = await POST(post({ name: 'Aisha', email: 'nope' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.errors.email).toBeTruthy()
  })

  it('returns 400 for malformed JSON rather than throwing', async () => {
    const { POST } = await import('./newsletter/route')
    const res = await POST(
      new Request('http://localhost/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': '9.9.9.9' },
        body: '{not json',
      }),
    )
    expect(res.status).toBe(400)
  })

  it('silently accepts a filled honeypot without emailing, so bots learn nothing', async () => {
    const email = await import('@/lib/email')
    const { POST } = await import('./newsletter/route')
    const before = vi.mocked(email.sendNotification).mock.calls.length
    const res = await POST(post({ name: 'Bot', email: 'b@example.com', botField: 'spam' }))
    expect(res.status).toBe(200)
    expect(vi.mocked(email.sendNotification).mock.calls.length).toBe(before)
  })

  it('rate limits after five submissions from one address', async () => {
    const { POST } = await import('./newsletter/route')
    for (let i = 0; i < 5; i++) {
      await POST(post({ name: 'Aisha', email: 'a@example.com' }, '7.7.7.7'))
    }
    const res = await POST(post({ name: 'Aisha', email: 'a@example.com' }, '7.7.7.7'))
    expect(res.status).toBe(429)
    expect(res.headers.get('retry-after')).toBeTruthy()
  })
})
