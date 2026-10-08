import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  // Retry locally too, not just in CI: this suite runs on a developer machine that may
  // be under heavy load, where a page.goto can exceed its budget for environmental
  // reasons. A real failure still fails twice; a load flake does not fail the gate.
  retries: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3101',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'NEXT_PUBLIC_SITE_URL=http://localhost:3101 npm run build && npm run start -- --port 3101',
    url: 'http://localhost:3101',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // Read only data/, so the suite does not change when MAPAC publishes in Sanity.
    env: { SANITY_DISABLED: '1' },
  },
})
