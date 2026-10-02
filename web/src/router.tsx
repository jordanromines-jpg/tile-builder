/* The routes, on the URL's hash so GitHub Pages serves one page and a Home Screen app keeps its place:
   #/  the Library · #/build/:pid · #/done/:pid · #/grownups (+ /tiles, /settings) · #/design · #/thumb/:pid */
import { createHashHistory, createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { Placeholder } from "./screens/Placeholder";
import { Design } from "./screens/Design";
import { S } from "./strings";

const root = createRootRoute({ component: () => <Outlet /> });

const library = createRoute({ getParentRoute: () => root, path: "/", component: () => <Placeholder name={S.screens.library} /> });
const build = createRoute({ getParentRoute: () => root, path: "/build/$pid", component: () => <Placeholder name={S.screens.build} /> });
const done = createRoute({ getParentRoute: () => root, path: "/done/$pid", component: () => <Placeholder name={S.screens.done} /> });
const grownups = createRoute({ getParentRoute: () => root, path: "/grownups", component: () => <Placeholder name={S.screens.grownups} /> });
const tiles = createRoute({ getParentRoute: () => root, path: "/grownups/tiles", component: () => <Placeholder name={S.screens.tiles} /> });
const settings = createRoute({ getParentRoute: () => root, path: "/grownups/settings", component: () => <Placeholder name={S.screens.settings} /> });
const design = createRoute({ getParentRoute: () => root, path: "/design", component: Design });

const tree = root.addChildren([library, build, done, grownups, tiles, settings, design]);

export const router = createRouter({ routeTree: tree, history: createHashHistory() });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
