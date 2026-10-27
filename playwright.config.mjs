import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:3196',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox'] }
      : {},
  },
  webServer: {
    command: 'python3 -m http.server 3196 --bind 127.0.0.1',
    url: 'http://127.0.0.1:3196/dist/index.html',
    reuseExistingServer: false,
  },
});
