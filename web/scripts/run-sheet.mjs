// Contact sheets of the truck runs (4.0c): every Monster-truck build's finish, its run held at six moments (the start,
// four between, the end), one row a run, ten runs a sheet, to look at after `npm run runs`. Serves the app with Vite and
// draws with the GPU, as `npm run shots` does.
//   node scripts/run-sheet.mjs [outdir] [id,id,...] [port]
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { createServer } from "vite";
import { mkdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [outArg, only, portArg = "5212"] = process.argv.slice(2);
const root = fileURLToPath(new URL("..", import.meta.url));
const out = outArg ?? join(root, "test-results", "run-sheets");
mkdirSync(out, { recursive: true });
const ids = JSON.parse(readFileSync(join(root, "src/projects/catalog.json"), "utf8"))
  .filter((p) => p.theme === "trucks")
  .map((p) => p.id)
  .filter((id) => !only || only.split(",").includes(id));

const real = realpathSync(join(root, "node_modules"));
const server = await createServer({ root, server: { port: Number(portArg), strictPort: true, host: "127.0.0.1", fs: { allow: [root, dirname(real)] } }, logLevel: "error" });
await server.listen();
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1180, height: 820 }, reducedMotion: "no-preference" });

const W = 320;
const H = Math.round((W * 820) / 1180);
const MOMENTS = [0, 0.2, 0.4, 0.6, 0.8, 1];
const rows = [];
for (const id of ids) {
  // a fresh page for each (a hash change alone keeps the finish as it was)
  await page.goto(`http://127.0.0.1:${portArg}/tile-builder/?run=${id}#/done/${id}`);
  await page.getByRole("button", { name: "Well done" }).click({ force: true, timeout: 30_000 });
  await page.waitForFunction(() => (window.__run?.length ?? 0) > 0, null, { timeout: 30_000 });
  const length = await page.evaluate(() => window.__run.length);
  const shots = [];
  for (const k of MOMENTS) {
    await page.evaluate((t) => (window.__runSeek = t), k * length);
    await page.waitForTimeout(300);
    shots.push(await sharp(await page.screenshot()).resize(W, H).png().toBuffer());
  }
  await page.evaluate(() => (window.__runSeek = undefined));
  const label = Buffer.from(`<svg width="${W * 6}" height="28"><text x="8" y="20" font-family="Helvetica" font-size="18" fill="#222">${id} (${length.toFixed(1)} s)</text></svg>`);
  rows.push(
    await sharp({ create: { width: W * 6, height: H + 28, channels: 3, background: "#ffffff" } })
      .composite([{ input: label, top: 0, left: 0 }, ...shots.map((input, i) => ({ input, top: 28, left: i * W }))])
      .png()
      .toBuffer(),
  );
  console.log(`${id}: ${length.toFixed(1)} s`);
}
for (let s = 0; s < rows.length; s += 10) {
  const batch = rows.slice(s, s + 10);
  const file = join(out, `runs-${s / 10 + 1}.png`);
  await sharp({ create: { width: W * 6, height: batch.length * (H + 28), channels: 3, background: "#ffffff" } })
    .composite(batch.map((input, i) => ({ input, top: i * (H + 28), left: 0 })))
    .png()
    .toFile(file);
  console.log(`sheet ${file}`);
}
await browser.close();
await server.close();
