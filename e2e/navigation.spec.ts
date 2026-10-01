import { test, expect } from '@playwright/test'

const ROUTES = [
  '/',
  '/about',
  '/elections',
  '/get-involved',
  '/news',
  '/donate',
  '/contact',
  '/privacy-policy',
]

test.describe('navigation', () => {
  for (const route of ROUTES) {
    test(`${route} renders with a single h1`, async ({ page }) => {
      const response = await page.goto(route)
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1')).toHaveCount(1)
    })
  }

  test('the skip link is the first focusable element and reveals itself', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()
  })

  test('no page links to the retired 2026 primary page', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route)
      await expect(page.locator('a[href*="2026primary"]')).toHaveCount(0)
    }
  })

  test('the elections page renders no endorsements section while none are published', async ({
    page,
  }) => {
    await page.goto('/elections')
    await expect(page.getByRole('heading', { name: 'Our endorsements' })).toHaveCount(0)
  })

  test('every rubric table totals 100 points', async ({ page }) => {
    await page.goto('/elections')
    const totals = page.locator('tfoot td')
    const count = await totals.count()
    expect(count).toBe(5)
    for (let i = 0; i < count; i++) {
      await expect(totals.nth(i)).toHaveText('100')
    }
  })

  test('each criterion expands when its button is activated', async ({ page }) => {
    await page.goto('/elections')
    const first = page.getByRole('button', { name: /1\. Engagement with the Muslim Community/ })
    await expect(first).toHaveAttribute('aria-expanded', 'false')
    await first.click()
    await expect(first).toHaveAttribute('aria-expanded', 'true')
  })

  test('no page scrolls horizontally at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 })
    for (const route of ROUTES) {
      await page.goto(route)
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      )
      expect(overflows, `${route} must not scroll horizontally at 400px`).toBe(false)
    }
  })
})

test.describe('mobile navigation', () => {
  test.use({ viewport: { width: 400, height: 800 } })

  test('the menu button opens and closes the panel', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: 'Open menu' })
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(
      page.locator('#mobile-nav-panel').getByRole('link', { name: 'Elections' }),
    ).toBeVisible()
  })
})
