/* The routes, on the URL's hash so GitHub Pages serves one page and a Home Screen app keeps its place:
   #/  the Library · #/build/:pid · #/done/:pid · #/grownups (+ /tiles, /settings) · #/design
   The screens with 3D load on first use, so the Library opens fast. */
import { createHashHistory, createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { lazy, Suspense, type ComponentType } from "react";
import { GrownupsHome } from "./screens/grownups/Home";
import { Settings } from "./screens/grownups/Settings";
import { Tiles } from "./screens/grownups/Tiles";
import { Library } from "./screens/Library";
import { S } from "./strings";

const Design = lazy(() => import("./screens/Design").then((m) => ({ default: m.Design })));
const Build = lazy(() => import("./screens/Build").then((m) => ({ default: m.Build })));
const Done = lazy(() => import("./screens/Done").then((m) => ({ default: m.Done })));

function later(C: ComponentType) {
  return function Later() {
    return (
      <Suspense fallback={<div className="min-h-dvh" />}>
        <C />
      </Suspense>
    );
  };
}

/** If a screen breaks: a calm way back, never a stack trace. */
function Oops() {
  return (
    <main className="safe grid min-h-dvh place-items-center text-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="font-display text-[length:var(--fs-kid-label-b)] font-semibold">{S.oops}</h1>
        <a href="#/" className="kid inline-flex min-h-[88px] items-center rounded-lg bg-accent px-8 font-kid text-[length:var(--fs-kid-label-c)] font-bold text-accent-ink">
          {S.done.back}
        </a>
      </div>
    </main>
  );
}

const root = createRootRoute({ component: () => <Outlet />, errorComponent: Oops });

const library = createRoute({ getParentRoute: () => root, path: "/", component: Library });
const build = createRoute({ getParentRoute: () => root, path: "/build/$pid", component: later(Build) });
const done = createRoute({ getParentRoute: () => root, path: "/done/$pid", component: later(Done) });
const grownups = createRoute({ getParentRoute: () => root, path: "/grownups", component: GrownupsHome });
const tiles = createRoute({ getParentRoute: () => root, path: "/grownups/tiles", component: Tiles });
const settings = createRoute({ getParentRoute: () => root, path: "/grownups/settings", component: Settings });
const design = createRoute({ getParentRoute: () => root, path: "/design", component: later(Design) });

const tree = root.addChildren([library, build, done, grownups, tiles, settings, design]);

export const router = createRouter({ routeTree: tree, history: createHashHistory() });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
