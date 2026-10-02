/* Keeping the tiles (plan key 5b): ask the browser to keep this site's store, and know whether the app runs from the
   Home Screen (where iPadOS keeps it) or in a Safari tab (where it may be cleared after seven days unused). */
export async function requestPersist(): Promise<boolean | null> {
  try {
    if (!navigator.storage?.persist) return null;
    if (await navigator.storage.persisted?.()) return true;
    return await navigator.storage.persist();
  } catch {
    return null;
  }
}

export function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || (typeof matchMedia === "function" && matchMedia("(display-mode: standalone)").matches);
}

/** An iPad in Safari: iPadOS reports itself as a Mac with a touch screen. */
export function isIPad(): boolean {
  return /iPad/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/** Which first-run card to show: "home" (add to Home Screen) in a Safari tab on an iPad, "build" (stand the iPad up)
    once in the app, or none. */
export function firstRunCard(s: { firstRunSeen: boolean; homeScreenCardSeen: boolean }): "home" | "build" | null {
  if (!isStandalone() && isIPad() && !s.homeScreenCardSeen) return "home";
  if (!s.firstRunSeen) return "build";
  return null;
}
