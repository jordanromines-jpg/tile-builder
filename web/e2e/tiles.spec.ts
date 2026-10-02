/* The tile pictures on the design page: every chip is named, axe passes in both themes, and the 3D row draws. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const ground of ["Light", "Dark"]) {
  test(`the design page passes axe in ${ground.toLowerCase()}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("#/design");
    await page.getByRole("button", { name: ground }).click();
    await expect(page.getByRole("img", { name: "red square" }).first()).toBeVisible();
    await expect(page.getByRole("img", { name: "purple tall triangle" })).toBeVisible();
    await expect(page.locator("canvas")).toBeVisible();
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
}
