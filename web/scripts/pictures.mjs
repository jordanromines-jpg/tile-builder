// Draws the app's 3D pictures (src/pictures.ts) and saves them under public/pictures/, with a manifest of each
// project's fingerprint. Run with `npm run pictures` after changing a project, a tile's look or the colours; commit the
// result. It serves pictures.html with Vite, opens it in Playwright's Chromium and saves each picture as WebP (sharp).
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { createServer } from "vite";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = join(root, "public", "pictures");

const server = await createServer({ root, server: { port: 5179, strictPort: true }, logLevel: "error" });
await server.listen();
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => {
    throw e;
  });
  await page.goto("http://127.0.0.1:5179/tile-builder/pictures.html");
  await page.waitForFunction(() => !!window.pictures, null, { timeout: 120_000 });
  const files = await page.evaluate(() => window.pictures.files());
  rmSync(out, { recursive: true, force: true });
  for (const [i, file] of files.entries()) {
    const url = await page.evaluate((f) => window.pictures.draw(f), file);
    const png = Buffer.from(url.split(",")[1], "base64");
    const dest = join(out, file);
    mkdirSync(dirname(dest), { recursive: true });
    await sharp(png).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(dest);
    process.stdout.write(`\r${i + 1}/${files.length} ${file}                    `);
  }
  const hashes = await page.evaluate(() => window.pictures.hashes());
  writeFileSync(join(out, "manifest.json"), JSON.stringify({ files, projects: hashes }, null, 1) + "\n");
  console.log(`\n${files.length} pictures written to public/pictures/`);
} finally {
  await browser.close();
  await server.close();
}
