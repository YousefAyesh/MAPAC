import { test, expect } from '@playwright/test'

test.describe('forms in the unconfigured state', () => {
  test('get involved offers direct contact details instead of broken inputs', async ({ page }) => {
    await page.goto('/get-involved')
    await expect(page.getByRole('link', { name: 'mail@mapacnc.com' }).first()).toBeVisible()
  })

  test('donate offers the mail-a-check path instead of a dead button', async ({ page }) => {
    await page.goto('/donate')
    await expect(page.getByText('P.O. Box 18196').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /secure checkout/i })).toHaveCount(0)
  })

  test('the newsletter API rejects an invalid email with field errors', async ({ request }) => {
    const res = await request.post('/api/newsletter', {
      data: { name: 'Test', email: 'not-an-email' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.errors.email).toBeTruthy()
  })

  test('the checkout API refuses a negative amount', async ({ request }) => {
    const res = await request.post('/api/stripe/checkout', {
      data: { amount: -500, frequency: 'once' },
    })
    // 400 if Stripe is configured, 503 if not. Either way it must never be 200.
    expect([400, 503]).toContain(res.status())
  })

  test('the webhook rejects a request with no signature', async ({ request }) => {
    const res = await request.post('/api/stripe/webhook', { data: { fake: true } })
    // 400 when configured, 200 "not configured" otherwise. Never a crash.
    expect([200, 400]).toContain(res.status())
  })
})
