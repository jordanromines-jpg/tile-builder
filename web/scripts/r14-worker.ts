// One worker of `npm run check:physics` (4.2): proves R14 for the builds it is given and posts each result.
// Bundled with esbuild by scripts/check-physics.mjs (worker threads can't run TypeScript).
import { parentPort, workerData } from "node:worker_threads";
import { rapier } from "../src/physics/rapier";
import { proveBuild } from "../src/physics/r14";
import { PROJECTS } from "../src/projects/index";

const { ids } = workerData as { ids: string[] };
const R = await rapier();
for (const id of ids) {
  const p = PROJECTS.find((x) => x.id === id)!;
  const t0 = performance.now();
  const r = proveBuild(R, p);
  parentPort!.postMessage({ ...r, ms: Math.round(performance.now() - t0) });
}
parentPort!.postMessage({ done: true });
