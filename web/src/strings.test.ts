/* Plan key 7i: every word a child sees or hears lives in strings.ts (or in a project's own data). The kid-side files
   hold no words of their own: no text between tags and no label written in place. */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const here = join(__dirname);
const KID = ["ui/kid", "screens/build"].flatMap((d) => readdirSync(join(here, d)).filter((f) => f.endsWith(".tsx") && !f.includes(".test.")).map((f) => `${d}/${f}`));
const FILES = [...KID, "screens/Build.tsx", "screens/Done.tsx", "screens/Library.tsx", "screens/FirstRunCard.tsx", "router.tsx"];

describe("kid words live in strings.ts", () => {
  it("no kid-side file writes words in place", () => {
    const found: string[] = [];
    for (const f of FILES) {
      readFileSync(join(here, f), "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (/>\s*[A-Z][a-z]+[ ,.!?'][^<{]*</.test(line) || /(aria-label|label|title|text)="[A-Z][a-z]/.test(line)) found.push(`${f}:${i + 1}: ${line.trim()}`);
        });
    }
    expect(found).toEqual([]);
  });
});
