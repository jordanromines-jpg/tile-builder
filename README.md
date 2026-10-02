# Tile Steps

(The repo and the research use the working name Tile Builder.)

**Live: https://jordanromines-jpg.github.io/tile-builder/** (open on an iPad, then Share → Add to Home Screen).

A web app for children aged 3 to 10 who build with magnet tiles. A grown-up enters the family's tiles once. A child
picks a project, sees whether it fits the tiles they have, and builds it one step at a time from a 3D model (tap the speaker to hear a step).
It works offline from the Home Screen and keeps everything on the iPad.

- 30 hand-written projects: 10 for 3–5, 12 for 6–8, 8 for 9–10. Every one passes a checker that proves it can be built,
  step by step, with real tiles, under every brand's tall triangle.
- Brands: Magna-Tiles, PicassoTiles, Connetix and generic 3-inch tiles; five set presets.
- "Need 2 more" is drawn as the missing tiles; swaps (four short triangles for a lower roof) are offered, never purchases.
- No account, ads, purchases, camera, streaks or scores. A backup file is the only way data moves.

For families: [`docs/parents.md`](docs/parents.md).

## What it keeps, and where

Everything is in the browser's storage on the iPad (IndexedDB): the tile counts, the settings, and one saved step per
project. Nothing is sent anywhere. The app is static files on GitHub Pages; there is no server of ours.

## Run it

    cd web
    npm ci
    npm run dev          # http://localhost:5173/tile-builder/
    npm test             # unit tests
    npm run check:projects
    npm run build && npm run test:e2e

See [`web/README.md`](web/README.md) for the folders and rules, and [`design/README.md`](design/README.md) for the design
tokens.

## Where things are

| What | Where |
|---|---|
| The brief: who it's for, its one job, what it never does | [`PRODUCT.md`](PRODUCT.md) |
| The design system | [`DESIGN.md`](DESIGN.md); live at `#/design` in the app |
| The plan, with its build log and results | [`plans/2026-10-02-tile-builder.md`](plans/2026-10-02-tile-builder.md) |
| The tile engine and the checker's rules | [`web/src/engine/README.md`](web/src/engine/README.md) |
| The research, summarised on one page | [`docs/research/README.md`](docs/research/README.md) |
| The features and engine maps | [`docs/maps/`](docs/maps) |
| The 3D castle prototype | [`docs/prototype/magnet-tile-castle.html`](docs/prototype/magnet-tile-castle.html) |
| What changed | [`CHANGELOG.md`](CHANGELOG.md) |
