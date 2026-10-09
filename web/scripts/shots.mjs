// Screenshots of every screen in a look (3.0), to look at before and after a change, and a contact sheet of them.
//   npm run shots -- <look> [port] [outdir] [screens]   e.g. npm run shots -- toy 5211 /tmp/toy library,finish
// Light and dark, iPad landscape (1180 × 820) and portrait (820 × 1180), at 2×, with the GPU (Metal on a Mac), motion
// reduced so every screenshot is of a still screen. Serves the app with Vite, as `npm run pictures` does.
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { createServer } from "vite";
import { mkdirSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [look = "classic", portArg = "5210", outArg, only] = process.argv.slice(2);
const port = Number(portArg);
const root = fileURLToPath(new URL("..", import.meta.url));
const out = outArg ?? join(root, "test-results", `shots-${look}`);
mkdirSync(out, { recursive: true });

const ALL = [
  ["library", "#/"],
  ["library-age", "#/", 0, "3 to 5"],
  ["build-first", "#/build/castle"],
  ["build-middle", "#/build/castle", 10],
  ["build-last", "#/build/castle", 30],
  ["build-big", "#/build/truck-ultimate-arena", 20],
  ["build-flower", "#/build/flower-kansas-sunflower-vase", 8],
  ["finish", "#/done/castle"],
  ["gate", "#/grownups"],
  ["design", "#/design"],
];
const SCREENS = only ? ALL.filter(([n]) => only.split(",").includes(n)) : ALL;

// in a git worktree node_modules may be a link to the main checkout's: let Vite serve files from where it really is
const real = realpathSync(join(root, "node_modules"));
const server = await createServer({ root, server: { port, strictPort: true, host: "127.0.0.1", fs: { allow: [root, dirname(real)] } }, logLevel: "error" });
await server.listen();
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const shots = [];
try {
  for (const [orient, viewport] of [["landscape", { width: 1180, height: 820 }], ["portrait", { width: 820, height: 1180 }]]) {
    for (const scheme of ["light", "dark"]) {
      const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: scheme, reducedMotion: "reduce" });
      await ctx.addInitScript((l) => {
        localStorage.setItem("tile-builder.look", l);
      }, look);
      const page = await ctx.newPage();
      page.on("pageerror", (e) => console.error(`page error (${orient} ${scheme}):`, e.message));
      for (const [name, path, steps = 0, age] of SCREENS) {
        await page.goto(`http://127.0.0.1:${port}/tile-builder/${path}`);
        await page.waitForTimeout(1800);
        // the first-run card, once
        const ok = page.getByRole("button", { name: "Got it" });
        if (await ok.count()) {
          if (name === "library") {
            const file = join(out, `${orient}-${scheme}-first-run.png`);
            await page.screenshot({ path: file });
            shots.push(file);
          }
          await ok.first().click();
          await page.waitForTimeout(300);
        }
        if (age) {
          await page.getByRole("group", { name: /age/i }).getByRole("button", { name: new RegExp(age.replace(/ to /, ".")) }).first().click();
          await page.waitForTimeout(1200);
        }
        const next = page.getByRole("button", { name: "Next", exact: true });
        for (let i = 0; i < steps && (await next.count()); i++) {
          await next.click();
          await page.waitForTimeout(120);
        }
        if (steps) await page.waitForTimeout(1200);
        const file = join(out, `${orient}-${scheme}-${name}.png`);
        await page.screenshot({ path: file });
        shots.push(file);
      }
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  await server.close();
}

// one contact sheet a orientation, four across
for (const orient of ["landscape", "portrait"]) {
  const files = shots.filter((f) => f.includes(`/${orient}-`));
  const w = orient === "landscape" ? 590 : 410;
  const h = orient === "landscape" ? 410 : 590;
  const lab = 22;
  const cols = 4;
  const tiles = [];
  for (const [i, f] of files.entries()) {
    const x = (i % cols) * w;
    const y = Math.floor(i / cols) * (h + lab);
    const name = f.split("/").pop().replace(".png", "");
    tiles.push({ input: Buffer.from(`<svg width="${w}" height="${lab}"><rect width="100%" height="100%" fill="#111"/><text x="6" y="16" font-family="sans-serif" font-size="13" fill="#fff">${look} · ${name}</text></svg>`), left: x, top: y });
    tiles.push({ input: await sharp(f).resize(w, h).png().toBuffer(), left: x, top: y + lab });
  }
  const sheet = join(out, `sheet-${orient}.png`);
  await sharp({ create: { width: cols * w, height: Math.ceil(files.length / cols) * (h + lab), channels: 3, background: "#777" } }).composite(tiles).png().toFile(sheet);
  console.log(sheet);
}
