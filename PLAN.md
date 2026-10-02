# Tile Builder: the plan

Status: phase 0 (planning and design) started 2 Oct 2026. No app code yet.

A web app for kids aged 3 to 10 and their parents. A parent enters the family's magnet tiles. A kid browses a
gallery of build projects, sees which ones they can build with the tiles they have, and follows one step by step in 3D.

## Decisions

| # | Question | Answer |
|---|---|---|
| D1 | Where the code lives | This repo, on its own (Jordan, 2 Oct 2026) |
| D2 | Where data is stored | On the device only, no cloud sync. It is a live web page that is used like an app on iPads (Jordan, 2 Oct 2026) |
| D3 | Claude-generated projects | No: "they shouldn't" (Jordan, 2 Oct 2026). Every project is written by hand and checked by the engine |
| D4 | Brands at launch | Magna-Tiles, PicassoTiles, Connetix and generic 3-inch tiles (Jordan, 2 Oct 2026) |
| D5 | Hosting | GitHub Pages from this repo, built and deployed by a GitHub Action on every merge to `main`. The repo is public, so Pages is free. Nothing private is ever committed; families' data lives only on their iPads |

## What the app is

**Parent side**, behind a grown-ups check (hold a button for 3 seconds and answer a simple sum):
- **Inventory:** tap a shape and set its count with − and +, or start from a set (Magna-Tiles Clear Colors 100,
  Connetix Creative 102, and so on) and adjust. Colours are optional.
- **Kid profiles:** a first name or nickname, a picture chosen from the app's own set, and an age band (3–5, 6–8, 9–10).
- **Settings:** brand and tall-triangle size, voice on or off, "Save a backup" and "Load a backup".

**Kid side**, usable by a child who can't read yet:
- **Who's playing:** big profile pictures.
- **Library:** a gallery of project cards grouped by theme (castles, houses and towns, animals, vehicles, space, gardens,
  fantasy, patterns). Each card shows a picture, difficulty as 1–3 stars, and a badge: green "You can build it!" or
  "Need 2 more ▲" drawn with the missing tiles. Filters are pictures. A kid sees their own age band first and can look
  at the others.
- **Build mode:** the 3D viewer. One step at a time: the tiles for the step are shown as pictures, the step is read
  aloud, a big Next button. ◀ ▶ buttons turn the model; it also turns slowly by itself. Substitutions such as "use
  short triangles instead" are offered when the inventory needs them.
- **My Builds:** "I built it!" opens the camera. The photo goes into that kid's gallery, with a sticker for the
  project. There are no streaks, timers, points to lose, or nagging.
- **For every kid:** themes and colours are not split into "boys'" and "girls'" sections. The palette comes from the
  tiles.

## The stack

The same stack as `web-agent`'s React app (`plans/2026-10-01-redesign-react.md`, RQ1), minus what this app doesn't need:

| Part | Choice | Why |
|---|---|---|
| App | React 19, TypeScript, Vite 7 | Same as `web-agent/web`; its scaffold, config and test setup are copied |
| Styling | Tailwind 4 driven by our own token file | One place for colours, type and spacing |
| Components | Radix primitives (Dialog, Tabs, Toast) under our own components | Accessible behaviour without a borrowed look |
| Routing | TanStack Router with hash history | Works on GitHub Pages with no server rewrites |
| 3D | three.js through `@react-three/fiber` and `@react-three/drei` | The castle prototype is three.js; fiber makes it a React component |
| Storage | IndexedDB through Dexie | Inventory, profiles and photos (as Blobs) on the device |
| Offline | `vite-plugin-pwa` (Workbox) and a web app manifest | Installable to the Home Screen, works with no connection |
| Data checks | zod | Validates every project file and every backup file |
| Motion | Motion (Framer Motion) | Snap and celebration moments; `prefers-reduced-motion` honoured |
| Icons | Phosphor | Already used in `web-agent`; MIT |
| Fonts | Self-hosted through `@fontsource` | Works offline; picked in the design pass |
| Tests | Vitest and Testing Library; Playwright with axe-core | Unit tests for the engine, end-to-end and accessibility checks for the screens |

## The engine

This is what makes the library trustworthy.

1. **Tile catalog** (`src/engine/catalog.ts`). Every shape defined once in units of one square edge: `square`,
   `square-large`, `tri-equilateral`, `tri-right`, `tri-isosceles-tall`, `rect-2x1` and the Connetix extras. Each brand
   maps its pieces onto these, with its own tall-triangle length. Sizes and sources: `docs/research/tiles.md`.
2. **Projects are data** (`src/projects/*.ts`). A project is its title, theme, age band, a list of placed tiles
   (shape, optional colour, position and orientation) and its steps. Projects are written with helpers such as
   `wall()`, `ring()`, `pyramid()` and `bridge()`, the way the castle prototype was built.
3. **The checker** (`src/engine/check.ts`) runs on every project in CI. A project that fails is not built into the app.
   It checks that:
   - every tile edge it relies on meets another tile's edge along its full length (that is where the magnets are)
   - no two tiles pass through each other
   - every tile connects back to a tile resting on the table
   - each step only adds tiles that touch what is already built
   - tall-triangle pyramids use four of the same kind, and the project closes with every brand's triangle length
4. **Matching** (`src/engine/match.ts`). It counts what a project needs by shape, with colour as a preference only. It
   compares that with the inventory and returns "you can build it", what is missing, and the smallest set of swaps
   that makes it buildable (short triangles for tall ones, two right triangles for a square, and so on).
5. **Pictures.** Card thumbnails are rendered from the project data by Playwright when the app is built, so the
   gallery always shows exactly what will be built.

## Phases

| # | What | Done when |
|---|---|---|
| 0 | Plan and research (this pull request); design direction, name and logo; five key screens as mockups: Who's playing, Library, Build mode, Inventory, My Builds | Jordan approves the look |
| 1 | Scaffold from `web-agent/web`; tile catalog; checker; the castle ported as the first project; deploy to Pages | The castle passes the checker in CI and opens on an iPad from the Pages link |
| 2 | Parent side: grown-ups check, inventory with set presets, kid profiles, backup and restore; Home Screen install and `persist()` | Inventory survives closing the app; works with Wi-Fi off |
| 3 | Library: 30 checked projects (about 10 for 3–5, 12 for 6–8, 8 for 9–10) across 8 themes; gallery, filters and badges | Every project passes the checker; the gallery passes axe and works by touch alone |
| 4 | Build mode: steps, read-aloud, turn buttons, swaps, a celebration at the end | A 3- or 4-year-old finishes a build with only the app's help (Jordan tests this) |
| 5 | My Builds: camera, photo gallery per kid, stickers | Photos stay on the iPad and come back after a restart and after a backup is loaded |

## Open questions

| # | Question | Default if nobody answers |
|---|---|---|
| Q1 | The tall triangle's leg length for Magna-Tiles and Connetix | Measure a real tile; until then the parent picks from pictures |
| Q2 | The app's name | Chosen in the design pass; "Tile Builder" until then |
| Q3 | Sound effects beyond the read-aloud voice | Off by default, a switch in parent settings |

## Research

- `docs/research/tiles.md`: shapes, sizes per brand, set contents, with sources and how sure we are.
- `docs/research/kids-and-ipad.md`: touch, gestures and pre-readers; Home Screen storage rules; privacy.
