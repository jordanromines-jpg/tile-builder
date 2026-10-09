# Tile Steps

(The repo and the research use the working name Tile Builder.)

**Live: https://jordanromines-jpg.github.io/tile-builder/** (open on an iPad, then Share → Add to Home Screen).

An iPad web app for families who build with magnet tiles. A grown-up enters the family's tiles once (Magna-Tiles,
PicassoTiles, Connetix or other 3-inch tiles). A child picks a project, sees whether it fits the tiles they have, and
builds it one step at a time from a 3D model, read aloud, with Pip the tile friend showing where each tile goes. It
works offline from the Home Screen and keeps everything on the iPad.

- **445 projects** for five age bands: 0–3 (80, built by a grown-up), 3–5 (33), 6–8 (56), 9–10 (86) and 11–16 (190),
  in ten themes, with a Monster trucks shelf (50 courses) and a Wildflowers shelf (50).
- **Every build is proved.** A checker (rules R1–R13) proves each step can be built with real tiles under every
  brand's tall triangle, and a physics check (R14, Rapier on the build machine) proves each step stands up.
- **Monster trucks run their course.** A finished truck build plays the Pip truck driving it, jumping and crashing,
  from a run proved and recorded in the physics.
- **Built in your colours.** Each brand's colours are known (PicassoTiles adds light blue and pink); builds are drawn
  and named in the colours the family's tiles come in.
- **Watch it build** plays the steps by itself at three speeds; **All steps** jumps anywhere; **Get your tiles** lists
  what to gather.
- "Need 2 more" is drawn as the missing tiles; swaps (four short triangles for a lower roof) are offered, never
  purchases. Four looks to choose from, light and dark.
- No account, ads, purchases, camera, analytics, streaks or scores. A backup file is the only way data moves.

For families: [`docs/parents.md`](docs/parents.md).

## What it keeps, and where

Everything is in the browser's storage on the iPad (IndexedDB): the tile counts, the settings, and one saved step per
project. Nothing is sent anywhere. The app is static files on GitHub Pages; there is no server of ours.

## Run it

    cd web
    npm ci
    npm run dev          # http://localhost:5173/tile-builder/
    npm test             # unit tests
    npm run check:projects   # the checker, R1–R13
    npm run check:physics    # R14: every build stands
    npm run build && npm run test:e2e

See [`web/README.md`](web/README.md) for the folders and rules, and [`design/README.md`](design/README.md) for the design
tokens.

## Where things are

| What | Where |
|---|---|
| The brief: who it's for, its one job, what it never does | [`PRODUCT.md`](PRODUCT.md) |
| The design system | [`DESIGN.md`](DESIGN.md); live at `#/design` in the app |
| The plans, with their build logs and results | [`plans/README.md`](plans/README.md) |
| Notes for every working session | [`CLAUDE.md`](CLAUDE.md) |
| The tile engine and the checker's rules | [`web/src/engine/README.md`](web/src/engine/README.md) |
| The research, summarised on one page | [`docs/research/README.md`](docs/research/README.md) |
| The features and engine maps | [`docs/maps/`](docs/maps) |
| The 3D castle prototype | [`docs/prototype/magnet-tile-castle.html`](docs/prototype/magnet-tile-castle.html) |
| What changed | [`CHANGELOG.md`](CHANGELOG.md) |
