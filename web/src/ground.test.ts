import { afterEach, describe, expect, it } from "vitest";
import { applyTheme, currentTheme, setTheme } from "./ground";

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe("the ground", () => {
  it("follows the system until a grown-up picks one", () => {
    expect(currentTheme()).toBe("system");
    applyTheme();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it("keeps the choice and sets it on the page", () => {
    setTheme("dark");
    expect(currentTheme()).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    setTheme("system");
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});
