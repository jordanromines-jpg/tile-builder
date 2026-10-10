// npm run runs (4.0c): simulates every Monster-truck build's run, proves it (R13f), and records it for the iPad to
// play: public/runs/<id>.bin.gz and public/runs/manifest.json. A run must do what its route says as recorded, and in
// at least 6 of 8 nudged runs (a little off at the start, a little faster or slower), so no recording is a fluke.
// It also writes src/projects/runs.json (each run's key), so the app asks for each recording by its key and never plays
// a stale one it kept.
//   node scripts/runs.mjs [id,id,...] [--check] [--nudges N] [--verify]
//   --check: simulate and report only (writes nothing)
//   --verify: (CI) every recording is for its build as it is now, and two of them, at random, simulated again, come
//   out the same byte for byte (Rapier is deterministic, so this Mac and the CI runner agree)
import { createHash } from "node:crypto";
import { build } from "esbuild";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

const args = process.argv.slice(2);
const check = args.includes("--check");
const verify = args.includes("--verify");
const nudges = args.includes("--nudges") ? Number(args[args.indexOf("--nudges") + 1]) : 8;
const only = args.find((a) => !a.startsWith("--") && !/^\d+$/.test(a))?.split(",");
/** of the nudged runs, how many may go wrong */
const SPARE = 2;

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (f) => readFileSync(join(root, f), "utf8");
const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);
const out = join(root, "node_modules/.cache/runs-worker.mjs");
await build({ entryPoints: [join(root, "scripts/runs-worker.ts")], bundle: true, platform: "node", format: "esm", outfile: out, logLevel: "error",
  banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" } });

// a recording's key: its build, the physics and the format it was made with
// (Make your own's live scene and its worker (5.0) are never part of a run: a change to them keeps the runs)
const LIVE_ONLY = new Set(["live.ts", "worker.ts"]);
const physicsSrc = readdirSync(join(root, "src/physics")).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts") && !LIVE_ONLY.has(f)).sort().map((f) => read(`src/physics/${f}`)).join("\n");
const rapierVersion = JSON.parse(read("node_modules/@dimforge/rapier3d-deterministic-compat/package.json")).version;
const engineKey = hash(physicsSrc + read("src/engine/run-format.ts") + read("src/engine/route.ts") + rapierVersion);
const keyOf = (p) => hash(JSON.stringify({ placed: p.placed, course: p.course }) + engineKey);

let trucks = JSON.parse(read("src/projects/catalog.json")).filter((p) => p.theme === "trucks").map((p) => p.id).filter((id) => !only || only.includes(id));

if (verify) {
  const manifest = JSON.parse(read("public/runs/manifest.json"));
  const stale = trucks.filter((id) => manifest.runs[id]?.key !== keyOf(JSON.parse(read(`public/projects/${id}.json`))));
  if (stale.length) {
    console.log(`these runs were recorded for an older build or physics: npm run runs ${stale.join(",")}`);
    process.exit(1);
  }
  trucks = [...trucks].sort(() => Math.random() - 0.5).slice(0, 2);
}
const cores = Math.min(trucks.length, Math.max(1, cpus().length - 2));
const shards = Array.from({ length: cores }, () => []);
trucks.forEach((id, i) => shards[i % cores].push(id));
const rows = [];
const t0 = performance.now();
await Promise.all(
  shards.map(
    (ids) =>
      new Promise((done, fail) => {
        const w = new Worker(out, { workerData: { ids, nudges: verify ? 0 : nudges, record: !check } });
        w.on("message", (m) => (m.done ? done() : rows.push(m)));
        w.on("error", fail);
      }),
  ),
);
rows.sort((a, b) => a.id.localeCompare(b.id));

let bad = 0;
for (const r of rows) {
  const wrong = r.nudged.filter((n) => n.problems.length);
  const ok = !r.problems.length && wrong.length <= SPARE;
  if (!ok) bad++;
  const said = [...r.problems, ...wrong.flatMap((n) => n.problems.map((p) => `nudge ${n.n}: ${p}`))];
  console.log(`${ok ? "ok  " : "FAIL"} ${r.id} (${r.seconds.toFixed(1)} s, ${nudges - wrong.length} of ${nudges} nudged runs work, ${(r.ms / 1000).toFixed(0)} s to prove)${said.length ? ": " + [...new Set(said)].slice(0, 4).join("; ") : ""}`);
}
console.log(`${rows.length - bad} of ${rows.length} runs work (${((performance.now() - t0) / 1000).toFixed(0)} s)`);

if (verify) {
  const { gunzipSync } = await import("node:zlib");
  for (const r of rows) {
    const kept = gunzipSync(readFileSync(join(root, `public/runs/${r.id}.bin.gz`)));
    const now = gunzipSync(Buffer.from(r.bytes));
    const same = kept.equals(now);
    console.log(`${same ? "same" : "DIFFERENT"} ${r.id}, simulated again`);
    if (!same) bad++;
  }
} else if (!check) {
  const dir = join(root, "public/runs");
  mkdirSync(dir, { recursive: true });
  let manifest = { version: 1, runs: {} };
  try {
    manifest = JSON.parse(read("public/runs/manifest.json"));
  } catch {
    // a first recording
  }
  let total = 0;
  for (const r of rows) {
    if (!r.bytes) continue;
    const p = JSON.parse(read(`public/projects/${r.id}.json`));
    writeFileSync(join(dir, `${r.id}.bin.gz`), Buffer.from(r.bytes));
    manifest.runs[r.id] = { key: keyOf(p), frames: r.frames, bytes: r.bytes.length };
  }
  manifest.runs = Object.fromEntries(Object.entries(manifest.runs).sort());
  for (const v of Object.values(manifest.runs)) total += v.bytes;
  writeFileSync(join(dir, "manifest.json"), JSON.stringify(manifest, null, 1) + "\n");
  writeFileSync(join(root, "src/projects/runs.json"), JSON.stringify(Object.fromEntries(Object.entries(manifest.runs).map(([id, v]) => [id, v.key])), null, 1) + "\n");
  console.log(`recorded to public/runs (${Object.keys(manifest.runs).length} runs, ${(total / 1024).toFixed(0)} KB)`);
}
if (bad) process.exit(1);
