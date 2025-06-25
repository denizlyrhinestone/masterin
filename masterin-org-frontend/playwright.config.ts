// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Read environment variables from .env.local for base URL construction if needed
// Note: Playwright tests run in a Node environment, so process.env can be used here.
// If your .env.local contains NEXT_PUBLIC_ variables that influence the app's behavior during E2E tests,
// ensure they are somehow available to the Next.js instance started by webServer.
// Often, for baseURL, it's simpler to construct it directly if the port is known.
// require('dotenv').config({ path: path.resolve(__dirname, '.env.local') }); // Optional

const PORT = process.env.PORT || '3000'; // Default Next.js port
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  // Directory where E2E test files are located.
  testDir: './tests-e2e',

  // Run tests in files in parallel.
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI if necessary.
  // workers: process.env.CI ? 1 : undefined, // Default is to use all available cores

  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: 'html', // Generates playwright-report/index.html

  // Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions.
  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: baseURL,

    // Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
    trace: 'on-first-retry', // Other options: 'retain-on-failure', 'on', 'off'

    // Viewport size for tests.
    // viewport: { width: 1280, height: 720 }, // Default is often fine
  },

  // Configure projects for major browsers.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // To run tests in other browsers, uncomment them.
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  // Optional: Folder for test artifacts such as screenshots, videos, traces, etc.
  // outputDir: 'test-results/',

  // Run your Next.js dev server before starting the tests.
  // This ensures your application is running and accessible by Playwright.
  webServer: {
    // Command to start the development server.
    // Ensure this matches your project's dev script in package.json.
    command: 'npm run dev',
    // URL to use to check if the server is ready.
    url: baseURL,
    // Reuse an existing server if one is already running on the port.
    // Set to false if you always want a fresh server for tests (e.g., on CI).
    reuseExistingServer: !process.env.CI,
    // Timeout for the server to start (in milliseconds).
    timeout: 120 * 1000, // 2 minutes
    // You can pipe stdout/stderr if needed for debugging server startup.
    // stdout: 'pipe',
    // stderr: 'pipe',
    // env: { // Pass environment variables to the dev server if needed
    //   NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3001/api' // Example
    // }
  },
});
