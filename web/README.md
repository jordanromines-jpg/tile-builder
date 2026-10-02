# web/: the Tile Steps app

React 19, TypeScript, Vite 7, Tailwind 4 on our tokens, TanStack Router (hash), three.js through react-three-fiber,
Dexie, vite-plugin-pwa. Served from GitHub Pages at `/tile-builder/`. Read `../PRODUCT.md` and `../DESIGN.md` before
changing anything people see.

## Commands

    npm ci                  # once
    npm run dev             # http://localhost:5173/tile-builder/
    npm run check           # types
    npm test                # unit tests (Vitest, jsdom)
    npm run check:projects  # every project against the checker
    npm run size            # no source file over 500 lines
    npm run build           # types, then dist/ with the service worker
    npm run test:e2e        # the built app in Chromium as an iPad, both orientations (builds first: run npm run build)
    npm run icons           # redraw public/icons/ (rarely)

From the repo root: `python3 -m design.tokens write` after changing `design/tokens.json`; never edit `src/tokens.css`.

Playwright is pinned to 1.56.1 because that is the Chromium preinstalled in the cloud session; CI installs the same
build, so plates made in either place match. To update a plate: `npx playwright test --update-snapshots`, on Linux only.

## Folders

| Path | What |
|---|---|
| `src/main.tsx`, `src/router.tsx` | Start-up and the hash routes |
| `src/strings.ts` | Every word the app shows or says |
| `src/ground.ts` | Light, dark or the iPad's setting |
| `src/screens/` | One file a screen; `screens/grownups/` behind the door |
| `src/ui/` | Components: `ui/kid/` for children, `ui/grownups/` for grown-ups |
| `src/engine/` | Tile shapes, brands, sets, the checker, matching |
| `src/projects/` | The hand-written projects, by age band |
| `src/three/` | The 3D tiles and viewer |
| `src/store/` | Dexie: settings, inventory, progress; backup |
| `src/speech/` | Read-aloud |
| `e2e/` | Playwright specs; `e2e/plates/` their screenshots |
| `scripts/` | Icons, thumbnails, the project checker, the size check |

## Rules

- No source file over 500 lines.
- Text never under 13 px on the grown-ups side or 26 px on the kid side.
- No photos or real names of children anywhere in the repo; no keys or tokens; no analytics.
- Every kid action is a tap. Colour never alone: tiles also have a pattern and a spoken name.
