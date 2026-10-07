// Saves every project as data (2.4): public/projects/<id>.json, and the catalogue src/projects/catalog.json that the
// Library reads. Run with `npm run projects` after changing a project; commit the result. A unit test
// (src/projects/catalog.test.ts) fails when they are out of date.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { PROJECTS } from "../src/projects/index";
import { serialize, summarize } from "../src/projects/serialize";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = join(root, "public", "projects");
mkdirSync(out, { recursive: true });
for (const f of readdirSync(out)) rmSync(join(out, f));
for (const p of PROJECTS) writeFileSync(join(out, `${p.id}.json`), JSON.stringify(serialize(p)));
writeFileSync(join(root, "src", "projects", "catalog.json"), JSON.stringify(PROJECTS.map(summarize)) + "\n");
console.log(`${PROJECTS.length} projects written to public/projects/ and src/projects/catalog.json`);
