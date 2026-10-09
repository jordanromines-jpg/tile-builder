/* The service worker: registered once the page has loaded; when it has cached the app, a one-time note says the app now
   works without Wi-Fi. Nothing here talks to a server of ours: there is none. */
import { registerSW } from "virtual:pwa-register";
import { projectFile, pictureUrl } from "./pictures";
import { PROJECT_INFO } from "./projects/load";
import { hasRun, runUrl } from "./three/run/load";

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

/** Fetches the project pictures (and the truck runs) the worker has not kept yet, a few at a time, when the iPad is
    idle: after this, the whole Library works offline (2.4: they are no longer part of the install, so the app is ready
    sooner). */
export function warmPictures(): void {
  if (!("serviceWorker" in navigator) || import.meta.env.DEV || typeof caches === "undefined") return;
  const idle = (f: () => void) => ("requestIdleCallback" in window ? window.requestIdleCallback(f, { timeout: 5000 }) : setTimeout(f, 2000));
  void navigator.serviceWorker.ready.then(() =>
    idle(async () => {
      const pictures = await caches.open("project-pictures");
      const runs = await caches.open("project-runs");
      // the pictures first; then the truck runs' recordings (4.0c), so every finish plays offline too
      const queue = [
        ...PROJECT_INFO.map((p) => ({ url: pictureUrl(projectFile(p.id)), kept: pictures })),
        ...PROJECT_INFO.filter((p) => hasRun(p.id)).map((p) => ({ url: runUrl(p.id), kept: runs })),
      ];
      const next = async (): Promise<void> => {
        const item = queue.shift();
        if (!item) return;
        const { url, kept } = item;
        try {
          if (!(await kept.match(url))) {
            // put it in the worker's own cache directly, whether or not the page is controlled yet
            const r = await fetch(url);
            if (r.ok) await kept.put(url, r);
          }
        } catch {
          /* offline or busy: it is fetched when it is shown */
        }
        return next();
      };
      await Promise.all([next(), next(), next()]);
    }),
  );
}
