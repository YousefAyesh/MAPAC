import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

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

for (const route of ROUTES) {
  test(`${route} has no WCAG A or AA violations`, async ({ page }) => {
    await page.goto(route)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(
      results.violations,
      results.violations.map((v) => `${v.id}: ${v.help}`).join('\n'),
    ).toEqual([])
  })
}
