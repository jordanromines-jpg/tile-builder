// Every project against the schema and the checker, under every tall-triangle leg (plan keys 4d, 4g). One line a
// project; each problem on its own line as "castle · step 3 · tile 29 · R6: ...". Exits 1 on any problem. Run with
// `npm run check:projects`.
import { checkProject } from "../src/engine/check";
import { describe } from "../src/engine/problems";
import { ProjectZ } from "../src/engine/schema";
import { PROJECTS } from "../src/projects/index";

const started = performance.now();
let bad = 0;
const ids = new Set<string>();
for (const p of PROJECTS) {
  const lines: string[] = [];
  if (ids.has(p.id)) lines.push(`${p.id} · R0: two projects share this id`);
  ids.add(p.id);
  const parsed = ProjectZ.safeParse(p);
  if (!parsed.success) for (const i of parsed.error.issues) lines.push(`${p.id} · R0: ${i.path.join(".")}: ${i.message}`);
  else for (const pr of checkProject(p).problems) lines.push(describe(pr, p.id));
  const tiles = p.placed.length;
  console.log(`${lines.length ? "FAIL" : "ok  "} ${p.id} (${p.age}, ${tiles} tiles, ${p.steps.length} steps)`);
  for (const l of lines) console.log(`     ${l}`);
  if (lines.length) bad++;
}
const secs = ((performance.now() - started) / 1000).toFixed(1);
console.log(`${PROJECTS.length} projects, ${bad} with problems, ${secs} s`);
process.exit(bad ? 1 : 0);
