// One worker of scripts/runs.mjs and runs-all.mjs (4.0c): simulates the truck runs it is given and posts each one's
// problems, its nudged runs' problems (NUDGES=n: nudges ±1 … ±n/2) and, if asked, its recording's bytes.
import { parentPort, workerData } from "node:worker_threads";
import { gzipSync } from "node:zlib";
import { encodeRun } from "../src/engine/run-format";
import { rapier } from "../src/physics/rapier";
import { toRecording } from "../src/physics/record";
import { simulateRun } from "../src/physics/run";
import { PROJECTS } from "../src/projects/index";

const { ids, nudges, record } = workerData as { ids: string[]; nudges: number; record: boolean };
const R = await rapier();
for (const id of ids) {
  const p = PROJECTS.find((x) => x.id === id)!;
  const t0 = performance.now();
  try {
    const r = simulateRun(R, p);
    const nudged = Array.from({ length: nudges }, (_, k) => (k % 2 ? -1 : 1) * (1 + Math.floor(k / 2))).map((n) => ({ n, problems: simulateRun(R, p, n).problems }));
    const bytes = record ? gzipSync(encodeRun(toRecording(r)), { level: 9 }) : null;
    parentPort!.postMessage({ id, seconds: r.truck.length / r.fps, frames: r.truck.length, ms: Math.round(performance.now() - t0), problems: r.problems, nudged, bytes });
  } catch (e) {
    parentPort!.postMessage({ id, seconds: 0, frames: 0, ms: 0, problems: [`crashed: ${(e as Error).message}`], nudged: [], bytes: null });
  }
}
parentPort!.postMessage({ done: true });
