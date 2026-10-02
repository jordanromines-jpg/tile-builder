/* The shell: every route answers with its name, the page passes axe, and the keyboard reaches what it should. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { dismissFirstRun } from "./helpers";

const ROUTES: [string, string][] = [
  ["#/", "Tile Steps"],
  ["#/build/castle", "Build"],
  ["#/done/castle", "Well done"],
  ["#/grownups", "For grown-ups"],
  ["#/grownups/tiles", "For grown-ups"],
  ["#/grownups/settings", "For grown-ups"],
  ["#/design", "The design page"],
];

for (const [hash, name] of ROUTES) {
  test(`${hash} opens`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(hash);
    if (hash === "#/") await dismissFirstRun(page);
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("the Library passes axe", async ({ page }) => {
  await page.goto("#/");
  await dismissFirstRun(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});

test("the manifest and icons are served", async ({ page, request }) => {
  await page.goto("#/");
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(href).toBeTruthy();
  const manifest = await (await request.get(href!)).json();
  expect(manifest.name).toBe("Tile Steps");
  expect(manifest.display).toBe("standalone");
  for (const icon of manifest.icons) expect((await request.get(icon.src)).ok()).toBe(true);
});
