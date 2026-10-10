# Make your own: a real-physics builder (5.0)

Status: approved 10 Oct 2026 (Jordan's answers M1–M4 below, and his go), in progress.

## Context
Jordan, 10 Oct 2026, after 4.4.1 (faster truck runs, #58):
- "can you make a real physics builder page now on this site? this would be to select tiles and make your own
  design."
- Until now every build is ours, proved on the build machine, and the iPad never simulates (D9). This page lets a
  child build anything, with tiles that behave like real ones while they build.

## Decisions (Jordan, 10 Oct 2026)
| # | Question | Answer |
|---|---|---|
| M1 | How the physics works | **Live, always on**: every tile is held by magnets and falls if nothing holds it. Changes D9: Rapier runs on the iPad, on this page only |
| M2 | How a tile is placed | **Both**: pick a tile and tap a glowing edge, or drag it from the tray onto an edge |
| M3 | Which tiles | **Unlimited**: any shape, any colour |
| M4 | What a design becomes | **Saved on the iPad**, **turned into steps** for Build mode, and **the Pip truck drives it** |

## What the code is today (read 10 Oct)
- A build is a `Project` (`engine/types.ts`): `placed` tiles, each `pos` + `rot` = [tilt about its base edge, turn
  about vertical], as `Builder.add` writes them (`projects/helpers.ts`). The 3D view (`three/Viewer.tsx`, `Model.tsx`),
  Build mode, Watch it build, All steps and Get your tiles all take a `Project`; so does the checker (`engine/check.ts`
  `analyse`: each tile's polygon and normal, and `meets`, where tiles join edge to edge).
- The physics (`physics/`, Rapier deterministic 0.21, 4.4 MB unpacked, about 1.5 MB gzipped) is pure TypeScript with
  no Node APIs: `scene.ts` `buildScene` (tile slabs, magnet hinges with friction, the contact filter, the flat-tile
  cap, the seated hand of 4.4), `vehicle.ts` + `hand.ts` (the Pip truck's wheels and the child's push), `run.ts`
  (`breakTile`: a magnet lets go on a hard hit, `BREAK_FORCE`). `boundary.test.ts` forbids app code from importing
  `physics/` (D9).
- Routes in `router.tsx` (screens loaded lazily with `later`); the Library (`screens/Library.tsx`, shelves in
  `engine/themes.ts` `SECTIONS`); storage in Dexie (`store/db.ts`, versions 1–4; `store/backup.ts`); `useProject`
  (`projects/load.ts`) loads `public/projects/<id>.json`.
- Kid UI: `ui/kid/KidButton`, `TileChip`, tile pictures for every shape × 8 colours; strings in `strings.ts`; four
  looks; `useStill` for reduced motion; Pip and his tips (`friend/`); truck sounds (`sound/truck.ts`).

## The shape of it
- **The iPad simulates, on this page only.** A Web Worker loads Rapier and keeps a scene that grows as tiles are put
  on; it steps at 240 Hz and sends the tiles' poses each frame. The page draws them with the existing tile meshes.
- **A design is a `Project`** made by the same placing rule as `Builder.add`, so everything that already reads builds
  (the checker, Build mode, Watch, the truck) reads designs too.
- Nothing leaves the iPad: designs live in Dexie and in the backup file.

## Order
5.0a → 5.0b → 5.0c → 5.0d, one PR each, all by me (no agents). Each: checks, draft PR, CI, squash-merge, `pages.yml`
confirmed, a plain-words note to Jordan.

## PR 5.0a · Live physics in the app (~4 h)
**Goal:** the physics runs on the iPad, off the main thread, and a scene can grow tile by tile.
1. `physics/live.ts`: `scene.ts`'s tile body, hinge and contact-filter code become shared functions; `LiveScene`
   adds a tile (its body, and hinges to the tiles it meets, from where they now lie), removes one, steps, and reports
   poses. A magnet lets go past `BREAK_FORCE` (moved from `run.ts` to `units.ts`), so a hard knock brings tiles down.
   Same gravity, friction and hand as R14 (`calibration.test.ts` covers it).
2. `make/physics.worker.ts`: loads Rapier, runs a `LiveScene` at 1/240 s (four substeps a frame), posts poses as one
   `Float32Array` per frame; messages `add`, `remove`, `hold`, `drive`, `reset`.
3. `boundary.test.ts`: app code may import `physics/` only through the worker entry.
4. Precache: the worker chunk and Rapier are fetched on the first visit to /make and kept for offline (as pictures and
   runs are, `pwa.ts`).
**Tests:** unit (Node): a square on the table stands; a square out on one edge droops and falls; a ring of four stands;
a tile hit at `BREAK_FORCE` lets go; adding a tile next to fallen ones joins only what it really meets.
**Accept:** 200 tiles step at 60 fps in the worker on the Mac's Metal run; the UI thread under 17 ms a frame.
**Docs:** DESIGN.md (D9′), engine README (physics on the iPad), build-log row.

## PR 5.0b · The Make screen (~6 h)
**Goal:** a child picks tiles and builds anything, and it stands or falls as real tiles do.
1. Route `/make` and `/make/$id`; a **Make your own** card at the top of the Library for every age.
2. Layout as Build mode: the 3D stage (Viewer: turntable, orbit), a **tray** along the bottom: the shapes (Connetix
   extras behind **More**), the eight colours, unlimited (M3).
3. **Tap an edge** (default, M2): pick a shape and colour; every free edge it can join glows (edges of placed tiles
   with no neighbour, and the table as a grid of square cells); tap one: a ghost tile shows there; **Turn** steps its
   tilt (standing, leaning 60°, ramp 30°, flat out, flat in), **Flip** swaps the side; **Put it on** places it. The
   placing rule is `Builder.add`'s: `pos` the edge's start, `turn` the edge's direction, `tilt` from Turn, so the tile
   meets the edge exactly (`analyse().meets` finds the join).
4. **Drag** (M2, a toggle in the top bar): drag from the tray; the ghost jumps to the nearest free edge within half a
   square; let go to place; drop it back on the tray to put it away.
5. **Live** (M1): a placed tile joins the physics; the hand holds it for a second (as R14's hand), then lets go; if
   nothing holds it, it falls and stays where it lands. **Undo**, **Take off** (tap a tile, then the bin), **Start
   again**.
6. Pip: "It fell! A wall beside it holds it up." when a tile falls; a clap on a tower four high.
7. Reduced motion: no glide in; physics still runs, a fall shown at its end.
**Tests:** unit: placement maths (a tile placed on each kind of edge meets it); e2e `make.spec.ts`: a ring of four
built by tapping edges stands (poses still after 2 s), a lone square falls; Drag places a tile; axe in all four looks.
**Accept:** shots of the screen in 4 looks × light/dark × landscape/portrait/half, looked at; kid targets ≥ the age
sizes (`design.spec.ts`).
**Docs:** PRODUCT.md (Make your own), DESIGN.md (the tray, the glowing edges), strings, CHANGELOG `5.0.0`, build-log
row.

## PR 5.0c · Saved designs and their steps (~3 h)
**Goal:** a design is kept, comes back, and can be built again step by step (M4).
1. Dexie v5: `designs` `{ id, name, placed, order, updated, picture }`, saved on every change; the picture is the stage
   at rest (a small WebP). A **My designs** shelf first on the Library when there are any; a design opens in /make.
2. **Make the steps:** the tiles in the order placed; one tile a step for 3–5, grouped by layer and touching tiles for
   older ages (`engine/ages.ts`); words from templates ("Stand a red square on the blue one's top edge."). The checker
   (R1–R12) and a quick R14 tilt (in the worker) run first; what they find is said in plain words and never stops a
   save. The design then opens in Build mode and Watch (`useProject` reads `my-…` ids from Dexie).
3. Backup and restore (`store/backup.ts`) carry designs.
**Tests:** unit: steps from a small house pass the checker; the Dexie migration keeps settings, tiles and progress;
e2e: save, reload, the design is on My designs; Make the steps opens Build mode at step 1; a backup round trip keeps
it.
**Docs:** PRODUCT.md, build-log row.

## PR 5.0d · Drive the Pip truck on a design (~3 h)
**Goal:** the truck drives what the child built and crashes into it (M4).
1. **Drive**: the Pip truck (`three/truck/`, `physics/vehicle.ts`) drops onto the table in front of the design; big
   **Go**, **Left**, **Right** and **Stop** buttons push it (`hand.drive`, as the recorded runs do); it climbs ramps,
   flies off kickers and smashes walls, which come apart as their magnets let go (5.0a). Engine, whoosh, thud and
   crunch (`sound/truck.ts`); the camera follows (the rig's `follow`, with the crash shake of 4.4.1).
2. **Put it back** returns the design to how it was before the drive.
**Tests:** unit: the truck on a flat table moves forward on Go and stops on Stop; e2e: Drive, Go, the truck moves;
Put it back restores every tile's pose.
**Accept:** a video of a build and a drive, sent to Jordan.
**Docs:** PRODUCT.md, DESIGN.md, build-log row.

## Verification (each PR, then end to end)
- All repo checks (CLAUDE.md), with the usual `NODE_OPTIONS` on this Mac; `check:physics` unchanged for the 445 builds.
- End to end on the live site (via the Actions run): build a small house by tapping edges, watch an unsupported tile
  fall, save, reload, Make the steps, step through it in Build mode, then Drive the truck into it; offline after one
  visit.

## Risks and what we do
- **Too slow on an older iPad** → the worker keeps the UI smooth; sleeping bodies at rest; a tile cap (300) with a
  friendly line.
- **Rapier's download (about 1.5 MB)** → loaded only on /make, cached after the first visit; the rest of the app is
  unchanged.
- **Tiles placed through others** → a ghost that overlaps a tile shows red and can't be put on.
- **Steps that can't be built in the order placed** → the checker's words say which, and offer "Build it in a sturdier
  order" (layers first) when that passes.

## Estimate
| Work | Who | Hours |
|---|---|---|
| 5.0a Live physics | me | 4 |
| 5.0b Make screen | me | 6 |
| 5.0c Designs and steps | me | 3 |
| 5.0d Drive the truck | me | 3 |
About 16 hours.

## Build log (append, never rewrite)
| When (UTC) | PR · keys | Commit | Hours (est · used) | Result / re-evaluation | Next |
|---|---|---|---|---|---|
| 2026-10-10 | spec | — | — · 0.3 | Written after Jordan's answers M1–M4. | Jordan's go |
| 2026-10-10 | 5.0a + 5.0b | branch `make-5-0a` | 10 · 4 | Shipped as one PR (5.0a alone changes nothing on the site: the worker is only bundled once a page starts it). `physics/live.ts` (`LiveScene`: tiles join what their edges meet where they now lie; held 1 s, then let go; magnets let go past 1.5 N; 10 solver passes and sleeping tiles: 200 tiles step in about 2 ms a frame here), `physics/worker.ts`, `screens/make/{physics,place,MakeStage}.ts(x)`, `screens/Make.tsx`, route `/make`, a Make your own card on the Library. The worker (4.4 MB, Rapier) is cached on first use, not in the install. Seen in the browser: a wall stands, a square put flat out from its top edge tips it over and both lie flat, "It fell!". Found while looking: the glowing edges were too thin to tap (now an unseen tap area round each) and a settled tile's edges are a hair off level (a 2% tolerance). e2e `make.spec.ts` (a ring stands, the flat square brings the wall down, axe, the card). Drag mode built, not yet in e2e. | 5.0c designs and steps |
| 2026-10-10 | 5.0c | branch `make-5-0c` | 3 · 1.5 | Shipped as 5.1.0. `engine/design.ts` (a design, its ids, steps in the order put on: one tile a step for 3–5, alike tiles in a row together for older ages, words from templates) and `design-steps.ts` (the checker's R6/R10/R11 add "Hold it until the next tile is on." and never stop a save; loaded only when a design is opened). Dexie v5 `designs`; saved 0.8 s after every change, fallen tiles left out, an empty design deleted; `/make?d=my-…` puts the tiles back on; **Make the steps** opens Build mode (`useProject` reads `my-…` ids). A **My builds** shelf first on the Library. Backups carry designs (still version 1; older backups have none). Changed from the plan: no WebP picture: designs are drawn from their tiles (the SVG drawing), so nothing is captured. Named "My build N" (a child can't easily type). Seen: the shelf, a reopened design, its steps and Get your tiles. | 5.0d drive the truck |
| 2026-10-10 | 5.0d | branch `make-5-0d` | 3 · 1 | Shipped as 5.2.0. `LiveScene` gets the Pip truck (`truckOn`, `truckOff`, `drive(go, steer)`, `truckPose`): the runs' hand pushes it at 2.4 squares a second toward a point two squares ahead turned by the steer; a truck hit of 0.3 N lets a tile's magnets go (the runs' HIT_FORCE), other knocks 1.5 N; `capChange` as in the runs. Worker messages `truckOn`, `truckOff`, `drive`; `reset` is safe mid-step and answers with the new ids. `make/Drive.tsx`: Go/Stop, Left/Right (a tap turns for 0.45 s), Put it back, Done driving; engine hum and crunch (`sound/truck.ts`); the view's middle follows the truck. Unit: Go moves it, Stop stops it, left is left, a ring it hits comes apart. e2e: drive into a ring, Put it back stands it up. Seen in a 4-frame sheet: the truck in front, driving in, the walls down, put back. The runs' key (`scripts/runs.mjs`) now leaves out `live.ts` and `worker.ts`, which no run uses, so Make changes keep the runs (re-recorded once for the new key: 50 of 50 work). Not done: the camera shake (the runs' playback has it; a live drive would need its own hit detection on the page). | Plan done; Jordan's look |
