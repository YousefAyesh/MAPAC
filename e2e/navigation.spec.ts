import { test, expect } from '@playwright/test'

const ROUTES = [
  '/',
  '/about',
  '/elections',
  '/get-involved',
  '/news',
  '/donate',
  '/contact',
  '/gallery',
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

  // One test per route rather than one test looping all eight. Eight sequential
  // page.goto calls sharing a single 30s budget is a coin flip on a loaded machine,
  // and a gate that fails randomly is a gate people stop trusting. Per-route tests
  // each get their own budget, and a failure names the offending route.
  for (const route of ROUTES) {
    test(`${route} does not scroll horizontally at phone width`, async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 800 })
      await page.goto(route)
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      )
      expect(overflows, `${route} must not scroll horizontally at 400px`).toBe(false)
    })
  }
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

test.describe('latest carousel', () => {
  test('shows recent news and never announces an absence of events', async ({ page }) => {
    await page.goto('/')
    const carousel = page.locator('[aria-roledescription="carousel"]')
    await expect(carousel).toHaveCount(1)
    // The old WordPress site rendered a widget saying it had none. That is worse than
    // silence: it tells a visitor only that the organisation looks inactive.
    await expect(page.getByText(/no upcoming events/i)).toHaveCount(0)
  })

  test('rotation can be paused, and arrows change the slide', async ({ page }) => {
    await page.goto('/')
    const pause = page.getByRole('button', { name: /pause automatic rotation/i })
    await expect(pause).toBeVisible()
    await pause.click()
    await expect(page.getByRole('button', { name: /play automatic rotation/i })).toBeVisible()

    const first = await page.locator('[aria-roledescription="slide"]:not([hidden]) h3').innerText()
    await page.getByRole('button', { name: 'Next' }).click()
    const second = await page.locator('[aria-roledescription="slide"]:not([hidden]) h3').innerText()
    expect(second).not.toBe(first)
  })

  test('hidden slides keep their links out of the tab order', async ({ page }) => {
    await page.goto('/')
    const hiddenLinks = page.locator('[aria-roledescription="slide"][hidden] a')
    const n = await hiddenLinks.count()
    for (let i = 0; i < n; i++) {
      await expect(hiddenLinks.nth(i)).toBeHidden()
    }
  })
})
