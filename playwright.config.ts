import { defineConfig, devices } from '@playwright/test';

const testPort = 4173;

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
    url: `http://localhost:${testPort}`,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    baseURL: `http://localhost:${testPort}`,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/posts-sync.spec.ts', '**/project-detail.spec.ts'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: ['**/posts-sync.spec.ts', '**/project-detail.spec.ts'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: ['**/posts-sync.spec.ts', '**/project-detail.spec.ts'],
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: ['**/posts-sync.spec.ts', '**/project-detail.spec.ts'],
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testIgnore: ['**/posts-sync.spec.ts', '**/project-detail.spec.ts'],
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
    },
  ],
});
