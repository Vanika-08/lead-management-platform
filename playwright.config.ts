import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config. Assumes the app is running at BASE_URL (default localhost:3000)
 * with a seeded database. Start the server (npm run dev) then run npm run test:e2e,
 * or let Playwright boot it via the webServer block below.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
