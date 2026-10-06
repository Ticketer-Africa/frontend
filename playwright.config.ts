import { defineConfig, devices } from "playwright/test";

// Start the real frontend/backend separately. Never load the project's .env
// automatically: it can point at production services.
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    serviceWorkers: "block",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    {
      name: "mobile-chromium",
      testMatch: /responsive\.spec\.ts/,
      use: { ...devices["Pixel 7"], channel: "chrome" },
    },
  ],
});
