/* The ground: light or dark. Until a grown-up picks one in Settings it follows the iPad's setting; the choice is kept
   per browser and set before the first paint so nothing flashes. From web-agent/web/src/app/ground.ts. */
export type Theme = "system" | "light" | "dark";

const KEY = "tile-builder.theme";

export function currentTheme(): Theme {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    /* a private window: no store; the system setting stands */
  }
  return "system";
}

export function applyTheme(theme: Theme = currentTheme()): Theme {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  return theme;
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* the choice lasts the page */
  }
}

/** Whether the page is showing dark now, whichever way it got there. */
export function isDark(): boolean {
  const t = document.documentElement.dataset.theme;
  if (t === "dark") return true;
  if (t === "light") return false;
  return typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;
}
