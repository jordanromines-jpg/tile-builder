// Why a truck run goes wrong (4.0c): its legs, then the truck every few steps (where, how fast, how upright, each
// spring's force, what it touches: a tile index, "c" an unbroken crash tile, "x" a broken one), then its problems.
//   npx vite-node scripts/trace-run.ts <id> [nudge] [from s] [to s] [every n steps]
import { rapier } from "../src/physics/rapier";
import { simulateRun } from "../src/physics/run";
import { compileRoute } from "../src/engine/route";
import { PROJECTS } from "../src/projects/index";
const [id, n, from, to, every] = process.argv.slice(2);
const R = await rapier();
const p = PROJECTS.find((x) => x.id === id)!;
for (const [i, l] of compileRoute(p, 1.867).entries()) console.log(`leg ${i} (route item ${l.item + 1}) ${l.kind} ${l.feature ?? l.target ?? ""} ${l.from.map((v) => v.toFixed(2))} -> ${l.to.map((v) => v.toFixed(2))}`);
let k = 0;
const r = simulateRun(R, p, Number(n ?? 0), ({ t, leg, kind, truck, scene, broken }) => {
  if (t < Number(from ?? 0) || t > Number(to ?? 99) || k++ % Number(every ?? 24)) return;
  const b = truck.body;
  const v = b.linvel(); const q = b.rotation(); const P = b.translation();
  const touch: string[] = [];
  for (let ci = 0; ci < b.numColliders(); ci++) {
    const c = b.collider(ci);
    scene.world.contactPairsWith(c, (o) => {
      let m = 0; scene.world.contactPair(c, o, (mf) => (m += mf.numContacts()));
      if (!m) return;
      const i = scene.bodies.findIndex((x) => x.handle === o.parent()?.handle);
      touch.push(`${ci ? "t" + (ci - 1) : "ch"}>${i < 0 ? "table" : i + (p.placed[i].role === "crash" ? (broken.has(i) ? "x" : "c") : "")}`);
    });
  }
  console.log(`t ${t.toFixed(2)} leg ${leg} ${kind} pos ${[P.x, P.y, P.z].map((x) => x.toFixed(2))} v ${[v.x, v.y, v.z].map((x) => x.toFixed(2))} upY ${(1 - 2 * (q.x * q.x + q.z * q.z)).toFixed(2)} f ${[0,1,2,3].map((w) => truck.vehicle.wheelSuspensionForce(w).toFixed(0))} ${touch.join(" ")}`);
});
for (const pr of r.problems) console.log(pr);
