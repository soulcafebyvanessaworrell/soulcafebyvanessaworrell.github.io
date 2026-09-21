import { defineConfig, devices } from "@playwright/test";
import { PREVIEW_PORT, SITE_BASE } from "./src/lib/constants";

// The site is served under a base path (SITE_BASE, see src/lib/constants.ts).
// `astro preview` listens on PREVIEW_PORT (distinct from the dev server's
// port, so a running `astro dev` never gets reused by mistake) and serves
// ./dist, so a build must exist first (CI builds before `test:e2e`; locally
// run `bun run build`).
const PORT = PREVIEW_PORT;
const ORIGIN = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // A test that passes only on its retry is flaky, and in CI that is a failure, not a pass.
  failOnFlakyTests: !!process.env.CI,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  // Routes in the spec carry the full base path (e.g. <base>/about/), so the
  // baseURL is just the origin. Keeping the base out of baseURL avoids the
  // URL()-resolution trap where an absolute "/about/" would drop the base.
  use: {
    baseURL: ORIGIN,
    trace: "on-first-retry",
    // Take the reduced-motion path of the scroll-reveal (src/scripts/site.ts):
    // content is visible immediately, so visibility assertions are deterministic.
    reducedMotion: "reduce",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // ~iPhone width: exercises the always-visible mobile nav breakpoint.
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: "bun run preview",
    // Astro 7 detaches `astro preview` when it detects an agent environment,
    // which Playwright reads as "exited early" and which leaves an orphan on
    // the port. This keeps the server in the foreground so Playwright owns it.
    env: { ASTRO_PREVIEW_BACKGROUND: "1" },
    url: `${ORIGIN}${SITE_BASE}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
