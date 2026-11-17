import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playtest',
  fullyParallel: true,
  workers: 1,
  timeout: 90000,
  expect: { timeout: 45000 },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'on',
    video: process.env.CI ? 'on' : 'off',
    launchOptions: { executablePath: process.env.CHROMIUM_PATH, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }
  },
  projects: [
    { name: 'phone', use: { viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true } },
    { name: 'tablet', use: { viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } }
  ],
  webServer: { command: 'npm exec vite -- preview --host 127.0.0.1 --port 4173 --strictPort', url: 'http://127.0.0.1:4173' }
});
