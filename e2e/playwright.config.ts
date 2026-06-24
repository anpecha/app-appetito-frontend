import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro — mobile-first
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 60000,
    reuseExistingServer: true,
  },
});
