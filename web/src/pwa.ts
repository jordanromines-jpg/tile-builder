/* The service worker: registered once the page has loaded; when it has cached the app, a one-time note says the app now
   works without Wi-Fi. Nothing here talks to a server of ours: there is none. */
import { registerSW } from "virtual:pwa-register";

const KEY = "tile-builder.offline-ready-shown";

export function startPwa(onOfflineReady: () => void): void {
  if (!("serviceWorker" in navigator) || import.meta.env.DEV) return;
  registerSW({
    immediate: true,
    onOfflineReady() {
      try {
        if (localStorage.getItem(KEY)) return;
        localStorage.setItem(KEY, "1");
      } catch {
        /* no store: say it this once */
      }
      onOfflineReady();
    },
  });
}
