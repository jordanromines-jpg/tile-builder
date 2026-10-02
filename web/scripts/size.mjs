// No source file over 500 lines (the plan's V4): web/src, web/scripts, design and the projects. Generated tokens.css aside.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("../../", import.meta.url));
const roots = ["web/src", "web/scripts", "web/e2e", "design"];
const skip = new Set(["web/src/tokens.css"]);
const LIMIT = 500;
const over = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "__pycache__" || name === "plates") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|mjs|js|py|css)$/.test(name)) {
      const rel = relative(repo, p);
      const n = readFileSync(p, "utf8").split("\n").length;
      if (!skip.has(rel) && n > LIMIT) over.push(`${rel}: ${n} lines`);
    }
  }
}
for (const r of roots) walk(join(repo, r));
if (over.length) {
  console.error(`Over ${LIMIT} lines:\n` + over.join("\n"));
  process.exit(1);
}
console.log(`every source file is ${LIMIT} lines or fewer`);
