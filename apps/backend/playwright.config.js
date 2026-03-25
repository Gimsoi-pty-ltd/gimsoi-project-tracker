import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/api",
  globalSetup: "./tests/setup/globalSetup.js",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL: "http://localhost:5001",
  },
  webServer: {
    command: "npx cross-env NODE_ENV=test npm run start",
    port: 5001,
    reuseExistingServer: false,
  },
  reporter: [["list"], ["html", { outputFolder: "playwright-report" }]],
});
