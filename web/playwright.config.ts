// The built app in a real browser, as an iPad in both orientations. Plates (screenshots) are made on Linux only
// (the plan's rule 14) and compared within 1% of pixels. Runs against `vite preview` on the dist/ that `npm run build` wrote.
import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));

const ipad = { ...devices["Desktop Chrome"], isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

export default defineConfig({
  testDir: "e2e",
  snapshotPathTemplate: "{testDir}/plates/{arg}-{projectName}{ext}",
  // CI runners are slower than a laptop and draw 3D in software: give each check and each test room
  timeout: 60_000,
  expect: { timeout: 10_000, toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" } },
  fullyParallel: true,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: "http://127.0.0.1:4173/tile-builder/", contextOptions: { reducedMotion: "reduce" } },
  projects: [
    { name: "ipad-landscape", use: { ...ipad, viewport: { width: 1180, height: 820 } } },
    { name: "ipad-portrait", use: { ...ipad, viewport: { width: 820, height: 1180 } } },
  ],
  webServer: {
    command: "npx vite preview --host 127.0.0.1 --port 4173 --strictPort",
    cwd: here,
    url: "http://127.0.0.1:4173/tile-builder/",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
