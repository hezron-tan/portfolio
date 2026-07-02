import { defineConfig, devices } from '@playwright/test';

/** Dedicated port so tests don't reuse another local app (e.g. on 4173). */
const testPort = Number(process.env.PLAYWRIGHT_TEST_PORT ?? 43173);
const baseURL = `http://localhost:${testPort}`;

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'e2e-report' }],
  ],

  webServer: {
    command: `npm run build:posts && npm run build:ts && npx serve . -l ${testPort} --no-clipboard --no-port-switching`,
    url: `${baseURL}/assets/data/portfolio-data.json`,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/posts-sync.spec.ts', '**/project-detail.spec.ts', '**/experience/**/*.spec.ts'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: ['**/posts-sync.spec.ts', '**/project-detail.spec.ts', '**/experience/**/*.spec.ts'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: ['**/posts-sync.spec.ts', '**/project-detail.spec.ts', '**/experience/**/*.spec.ts'],
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: ['**/posts-sync.spec.ts', '**/project-detail.spec.ts', '**/experience/**/*.spec.ts'],
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testIgnore: ['**/posts-sync.spec.ts', '**/project-detail.spec.ts', '**/experience/**/*.spec.ts'],
    },
    {
      name: 'experience',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/experience/**/*.spec.ts'],
    },
    {
      name: 'experience-mobile',
      use: { ...devices['Pixel 5'] },
      testMatch: ['**/experience/**/*.spec.ts'],
      grep: /mobile viewport/,
    },
    {
      name: 'posts-sync',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/posts-sync.spec.ts'],
    },
    {
      name: 'project-detail',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/project-detail.spec.ts'],
      dependencies: ['posts-sync'],
    },
  ],
});
