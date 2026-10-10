// `npm run check:physics` (4.2, R14): every build stands, proved in the physics. Each build's result is kept in
// src/projects/proofs/r14.json under a key (the build's tiles and steps, the physics code, the Rapier version), so a
// run simulates only builds whose key changed, plus one kept build chosen at random that must come out the same.
// A real fall fails the check: every build must stand (the allow-list of 4.2a is gone, 9 Oct 2026).
//   node scripts/check-physics.mjs [--cold] [--cores N] [--report]
import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

const args = process.argv.slice(2);
const cold = args.includes("--cold");
const report = args.includes("--report");
const cores = Number(args[args.indexOf("--cores") + 1]) || Math.max(1, cpus().length - 2);
const root = fileURLToPath(new URL("..", import.meta.url));
const read = (f) => readFileSync(join(root, f), "utf8");
const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

// the physics' own key: the source R14 is proved with (not the truck runs'), the Rapier version
const physicsSrc = ["r14.ts", "rapier.ts", "scene.ts", "tilt.ts", "units.ts"].map((f) => read(`src/physics/${f}`)).join("\n");
const rapierVersion = JSON.parse(read("node_modules/@dimforge/rapier3d-deterministic-compat/package.json")).version;
const physicsKey = hash(physicsSrc + rapierVersion);

const builds = readdirSync(join(root, "public/projects"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(read(`public/projects/${f}`)));
const keyOf = (p) => hash(JSON.stringify({ placed: p.placed, steps: p.steps.map((s) => s.tiles), theme: p.theme }) + physicsKey);

const proofFile = "src/projects/proofs/r14.json";
let kept = {};
try {
  kept = JSON.parse(read(proofFile));
} catch {
  kept = {};
}

const todo = builds.filter((p) => cold || kept[p.id]?.key !== keyOf(p)).map((p) => p.id);
// one kept build, simulated again: the physics must give the same answer
const keptIds = builds.filter((p) => kept[p.id]?.key === keyOf(p)).map((p) => p.id);
const sample = !cold && keptIds.length ? keptIds[Math.floor(Math.random() * keptIds.length)] : null;
const run = sample ? [...todo, sample] : todo;

const out = join(root, "node_modules/.cache/r14-worker.mjs");
await build({
  entryPoints: [join(root, "scripts/r14-worker.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: out,
  logLevel: "error",
  banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" },
});

const t0 = performance.now();
const results = {};
const shards = Array.from({ length: Math.min(cores, run.length) }, () => []);
// the biggest builds first, dealt round the cores, so they finish together
run
  .sort((a, b) => builds.find((p) => p.id === b).placed.length - builds.find((p) => p.id === a).placed.length)
  .forEach((id, i) => shards[i % shards.length].push(id));
await Promise.all(
  shards.map(
    (ids) =>
      new Promise((done, fail) => {
        const w = new Worker(out, { workerData: { ids } });
        w.on("message", (m) => (m.done ? done() : (results[m.id] = m)));
        w.on("error", fail);
      }),
  ),
);

let bad = 0;
if (sample) {
  const before = kept[sample];
  const now = results[sample];
  if (JSON.stringify(before.falls) !== JSON.stringify(now.falls) || before.sags !== now.sags) {
    console.log(`FAIL ${sample}: simulated again it came out differently (${before.falls.length} → ${now.falls.length} falls)`);
    bad++;
  }
}
for (const id of todo) {
  const r = results[id];
  kept[id] = { key: keyOf(builds.find((p) => p.id === id)), falls: r.falls, sags: r.sags, worstMm: Math.round(r.worstMm), ms: r.ms };
}
const sorted = Object.fromEntries(Object.keys(kept).filter((id) => builds.some((p) => p.id === id)).sort().map((id) => [id, kept[id]]));
mkdirSync(join(root, "src/projects/proofs"), { recursive: true });
writeFileSync(join(root, proofFile), JSON.stringify(sorted, null, 1) + "\n");

const falling = Object.entries(sorted).filter(([, r]) => r.falls.length);
for (const [id, r] of falling) {
  const f = r.falls[0];
  const line = `${id}: ${r.falls.length} state(s) fall; first at step ${f.step}, tile ${f.tile} moves ${f.mm} mm, tips ${f.deg}° (${f.phase})`;
  console.log(`FAIL ${line}`);
  bad++;
}
const sags = Object.values(sorted).reduce((n, r) => n + r.sags, 0);
console.log(
  `${builds.length} builds; simulated ${run.length} in ${((performance.now() - t0) / 1000).toFixed(0)} s on ${shards.length} cores; ` +
    `${falling.length} with a fall; ${sags} states sag a little`,
);
if (report) {
  mkdirSync(join(root, "test-results"), { recursive: true });
  writeFileSync(
    join(root, "test-results/r14-report.md"),
    ["# R14 report", "", "| Build | Falls | First fall | Sags |", "|---|---|---|---|"]
      .concat(Object.entries(sorted).filter(([, r]) => r.falls.length || r.sags).map(([id, r]) => `| ${id} | ${r.falls.length} | ${r.falls[0] ? `step ${r.falls[0].step}, tile ${r.falls[0].tile}, ${r.falls[0].mm} mm` : "-"} | ${r.sags} |`))
      .join("\n") + "\n",
  );
}
process.exit(bad ? 1 : 0);
