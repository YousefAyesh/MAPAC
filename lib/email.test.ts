import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const ORIGINAL_ENV = { ...process.env }

describe('email configuration', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('reports unconfigured when RESEND_API_KEY is absent', async () => {
    delete process.env.RESEND_API_KEY
    const { isEmailConfigured } = await import('./email')
    expect(isEmailConfigured()).toBe(false)
  })

  it('reports configured when RESEND_API_KEY is present', async () => {
    process.env.RESEND_API_KEY = 're_test_key'
    const { isEmailConfigured } = await import('./email')
    expect(isEmailConfigured()).toBe(true)
  })

  it('refuses to send when unconfigured, rather than throwing', async () => {
    delete process.env.RESEND_API_KEY
    const { sendNotification } = await import('./email')
    const result = await sendNotification({ subject: 'S', text: 'T' })
    expect(result.sent).toBe(false)
    expect(result.reason).toMatch(/not configured/i)
  })
})
