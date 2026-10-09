# Truck runs, Watch it build, and real physics (4.0 · 4.1 · 4.2)

Status: approved 9 Oct 2026 (Jordan approved this plan after asking for "a detailed plan"; his decisions D1–D10
below), in progress.

## Context
Jordan, 9 Oct 2026, after 3.7–3.9 (Get your tiles, All steps, Pip helps):
- "next I want to see the monster truck run the track and crash the courses as intended when it's complete. and an
  auto build mode that has a speed selector that goes through it one step at a time." (with a picture of a finished
  truck build: "Crunch! The truck landed right on the car.")
- References for the truck: github.com/juanputrerasm/JSTruckViewer (a three.js viewer of Monster Truck Madness 2
  trucks: pickup body, roll cage, light bars, huge lugged tyres, yellow coil-overs, link bars) and
  sketchfab.com/tags/monsterjam (Monster Jam's character trucks: very high stance, giant tyres, a character body over
  an open tube chassis). Both are trademarked or game art: **we copy nothing, we design our own in code.**
- Physics: he pointed to ammo.js (Bullet's `btRaycastVehicle`, "to perfectly mimic a 1/64 scale toy") and cannon-es
  ("tire friction to emulate plastic toy wheels sliding across smooth Hot Wheels track pieces"), then "use real physics
  for the whole site", "EVERYWHERE".
- "need to plan first", "detailed plan", "make sure it's detailed".

## Decisions (Jordan, 9 Oct 2026)
| # | Question | Answer |
|---|---|---|
| D1 | Who gets Watch it build | Every age |
| D2 | Does watching move the saved step | "both": watching keeps its own place; **Build from here** makes it the child's |
| D3 | The truck | A **Pip truck** (Pip as a Monster Jam-style truck) |
| D4 | Its colours | **Only tile colours** (red, orange, yellow, green, blue, purple) |
| D5 | Truck review | Send the truck sheet and keep going |
| D6 | Order | Both at once (agents in parallel) |
| D7 | Physics, where | Everywhere: proofs, build-mode snap, finish tiles, truck runs, and every moving thing |
| D8 | Engine | **Rapier, deterministic** (`@dimforge/rapier3d-deterministic-compat`), on the build machine only |
| D9 | On the iPad | **Proved, recorded, played**: runs shipped as recordings; live effects use exact physics formulas (gravity, springs, bounces); no engine on the iPad |
| D10 | The hand (R14) | After each step, **everything from earlier steps stands alone**; this step's tiles may be held; the finished build stands alone |
| D11 | R14 without real-tile tests | **Block only real falls** (a tile moves > 20 mm or tips > 15° anywhere in the test); smaller sags are reported, not blocked; magnets set from the physical estimate |
| D12 | Auto-merge | **Left off**: each PR is merged at a check-in when its CI is green |

## What the code is today (read 9 Oct)
- 50 truck builds in `web/src/projects/trucks-1.ts` … `trucks-6.ts`, made with `projects/track-kit.ts` (`lane`, `ramp`,
  `kicker`, `crushCar`, `dominoes`, `crashWall`, `tunnel`, `tower`, `bigTower`, `arenaWall`, `fence`) plus hand-placed
  decks. **The kit is not called in driving order** (`truck-stair-step-drops` places a car before its ramp,
  `truck-rollover-pit` its wall first; `truck-double-decker-race`, `truck-world-finals-freestyle` are towers whose roads
  are lids), so each build needs a written route.
- Units (`engine/catalog.ts`): one square = 76.2 mm; gravity is 128.7 squares/s². Tiles are ~6 mm (0.08 square) thick.
  A 1:64 truck is 7–8 cm long, ~5 cm wide (`track-kit.ts` header). Ramps are 30°.
- `engine/check.ts` `analyse()` already finds where tiles meet edge to edge (`meets`): these are the magnet joints.
  R10 (`hold.ts`) is checked on the finished build only ("a child holds a wall while building the corner that braces
  it"); R12 (`stability.ts`) is slenderness, k = 4 trucks / 6 others.
- The 3D: `three/Model.tsx` merges settled tiles into one mesh (`Settled`, a contiguous run from index 0); tiles glide
  in on an arc (`three/anim.ts` `snap`, `DROP_S` 0.5 s); `three/Viewer.tsx` has `Turntable` (cubic ease, `TURN_MS`),
  `CameraRig` (ease), frameloop "demand". `friend/Guide.tsx` moves Pip with Web Animations. `ui/kid/TileConfetti.tsx`
  is a DOM shower (CSS `confetti-fall`). The `motion` library is already a dependency (`ui/motion.ts`
  `useUiTransition` is a spring). CSS keyframes: `confetti-fall`, `photo-in`, `pip-bob`, `pip-hop`, `friend-*` (idle
  life); CSS transitions in `app.css` (`.press`, `.lift`), `ui/grownups/{Field,Button}.tsx`, `ui/kid/{AgePicker,
  Celebration,ThemeFilter}.tsx`, and the four `looks/*/look.css`.
- Project pictures are not in the install; they're cached at runtime and prefetched when idle (`vite.config.ts`
  `globIgnores`, `src/pwa.ts`). Recordings will work the same way.
- CI (`.github/workflows/ci.yml`): one job, ubuntu, 20-min timeout, about 10 min today; `check:projects` takes 1.5 s.
  Playwright runs with `reducedMotion: "reduce"`; motion tests opt out (as `viewer.spec.ts` does).

## The shape of it
- **The build machine (Node) does the physics.** A new `web/src/physics/` module on Rapier (a dev dependency only):
  tiles as thin solids, magnets at every joint, the Pip truck as a raycast vehicle. It **proves** every build stands
  (R14) and every truck run works (R13f), and **records** each truck run (`npm run runs` → `public/runs/`).
- **The iPad plays.** Truck runs are played from the recordings (exactly the proved run). Everything live uses small,
  exact physics formulas in `web/src/motion/` (gravity arcs with bounces, damped springs): the tiles' flight and magnet
  snap, All steps' drops, the turntable, Pip's hops and tosses, the finish's falling tiles, the screens' springs.
- Nothing new is downloaded to the iPad except the recordings (under 1 MB for all 50, fetched like pictures).

---

## Phase 0 · Housekeeping (now, ~15 min)
1. 3.9 (#45) CI is green: `gh pr merge 45 --squash`; confirm the `pages.yml` run on main.
2. On `plans-4-0-4-1`: rebase on main; replace `plans/2026-10-09-truck-runs-autobuild.md` with this plan (repo plan
   format, status "approved", its build log kept); `plans/2026-10-09-build-helpers.md`: "3.9 merged" row, status done;
   `plans/README.md` and `plans/CHANGELOG.md`; CLAUDE.md "Start here" points at the new plan. Ship as a docs PR.
3. Send Jordan the 3.9 summary (already sent: the video and sheets).

## Order and parallel work (D6)
```
Wave 1 (parallel):  A: 4.1 Watch      B: 4.0a Courses     C: 4.0b Pip truck     me: P0 physics spike
Wave 2:             me: P1 physics core + R14 report-only  → agents D/E: 4.2a build fixes (batches)
                    F: 4.2d motion everywhere (agent)       G: 4.2c finish tiles (agent, after F's motion module)
Wave 3:             me: 4.0c truck runs (needs 4.0a, 4.0b, P1)   then me: 4.2b magnet snap + fall replays
```
Ship order: 4.1 → 4.0a → 4.0b → P1 → 4.2a (one PR per batch, R14 blocking in the last) → 4.2d → 4.2c → 4.0c → 4.2b.
At most three agents at a time (Agent tool, worktrees, never Workflow). Each agent commits on its own branch, runs
every check, looks at what it made and reports; none pushes. I review each (diff, sheets, checks), fix or send it back,
then ship: rebase on main, checks again, draft PR, subscribe (auto-fix), merge (squash) when CI is green (by hand: the
repo doesn't allow auto-merge), confirm `pages.yml`, then a plain-words note to Jordan. Plates only after looking;
files ≤ 500 lines; strings in `strings.ts`; build-log row in the same commit; no model names in commits.

Expected conflicts and who resolves them: `strings.ts`, `app.css`, `e2e/helpers.ts` (everyone: I merge by hand);
`Build.tsx` (A, later 4.2d/4.2b: A first); `Model.tsx`/`Viewer.tsx` (4.2d, 4.0c, 4.2b: in ship order); `engine/schema.ts`
(B, then 4.0c); truck builds (B's routes, then 4.2a's fixes: R13 re-runs on every change, so a fix that breaks a route
fails `check:projects`).

---

## PR 4.1 · Watch it build (agent A, ~3 h)
**Goal:** Build mode plays itself one step at a time at a chosen speed.
1. `screens/build/Watch.tsx` (new) + a `useWatch` hook; a **Watch** button in the top bar after All steps (`KidButton`,
   `showLabel={false}`, a play icon, `ts-watch-button`, `pressed` while on) opens a bar in the panel's place (as
   `StepTray` does).
2. The bar: Pause/Play; speed as a Radix radio group (`@radix-ui/react-radio-group`, already a dependency): **Slow**
   6 s/step, **Medium** 3.5 s, **Fast** 1.5 s; "Step N of M"; **Build from here** (primary); close.
3. Playing: a timer advances a **watch step** (its own state, D2); the Viewer shows it; Pip guides each step
   (`Guide` `arrival` "next"; new `pace` prop: Fast halves his hop and hold, and the Model `hold` matches). The line is
   said at Slow/Medium when the voice is on; not at Fast.
4. Saving (D2): watching never calls `saveStep`. **Build from here** = `go(watchStep)` (saves, speaks) and closes.
   Close = back to the child's step.
5. Pauses on: a tap on the stage, Back, a dot, All steps, the tiles list, the rest screen.
6. At the last step: navigate to `/done/$pid?watched=1`; `Done.tsx` skips `clearStep` when `watched` is set.
7. The speed is remembered on this iPad: a `watchSpeed` field in the settings store (Dexie migration v4, default
   "medium") or, if the store pattern doesn't fit, localStorage in try/catch as `looks/apply.ts` does.
8. Motion reduced: still plays; tiles appear; Pip stays home.
**Tests:** e2e `watch.spec.ts`: Fast on the fish reaches the finish; a tap pauses (step stops changing); watching
leaves `savedStep` unchanged and Build from here saves the watched step; the speed survives a reload; axe on the bar in
all four looks (`looks.spec.ts`). Unit: the pace timings. Shots: a `build-watch` screen in `scripts/shots.mjs`.
**Accept:** all checks green; sheets of the bar in 4 looks × light/dark × landscape/portrait/half looked at.
**Docs:** PRODUCT.md build mode; CHANGELOG `4.1.0`; build-log row.

## PR 4.0a · Courses: features, routes, R13a–e (agent B, ~4 h)
**Goal:** every truck build knows its course and how a truck drives it; the checker proves the route is sound.
1. `projects/helpers.ts`: `Builder.features: Feature[]`, `Builder.route(items)`, `Builder.deck(name, tiles)`.
   ```ts
   type Surface = { kind: "flat"; y: number; poly: [number, number][] } | { kind: "slope"; from: V3; to: V3; width: number };
   interface Feature { name: string; kind: "lane" | "ramp" | "kicker" | "deck" | "tunnel" | "car" | "wall" | "dominoes";
                       surface?: Surface; dir: Dir; tiles: number[] }
   type RouteItem = string | { down: string } | { jump: string } | { through: string } | { to: [number, number, number] };
   ```
2. `track-kit.ts`: each driving or crashing piece records its feature (names numbered by kind: `lane-1`, `ramp-2`,
   `car-1`, …): lane → flat; ramp/kicker → slope (bottom edge's middle to top edge's middle, width = lanes);
   `tower(… lid)`/`bigTower(… deck)` → deck at the lid's height; tunnel → flat with a roof; crushCar → car (roof flat at
   y 1); crashWall → wall; dominoes → dominoes. Scenery records nothing.
3. `engine/schema.ts`: `Project.course?: { features; route; truck?: Colour }` (Zod); `projects/serialize.ts` and
   `npm run projects` write it; the catalogue is unchanged.
4. `engine/route.ts` (new): `compileRoute(project, leg): Leg[]` turns the route into legs:
   `{ kind: "drive" | "climb" | "descend" | "fly" | "crush" | "smash"; from: V3; to: V3; surface; target?: string }`;
   a fly gets its take-off lip, landing surface and the ballistic solution: speed
   `v = sqrt(g·d² / (2·cos²θ·(d·tanθ − h)))` for distance d, drop h, angle θ (30° off a ramp, 0 off a deck).
5. **R13 (trucks only)** in `engine/run-rules.ts`, called from `check.ts` for every leg length:
   R13a names exist and the route compiles; R13b legs join within 0.5 square at the same height unless a fly;
   R13c a fly's arc (the truck as 1.0 × 0.67 × 0.62, sampled every 0.02 s) clears every tile but its target and lands
   ≥ 0.3 square inside a surface; R13d no drive passes through a non-target tile; R13e every `crash` tile belongs to a
   target the route hits. Each problem names the build, leg and tile, in words a builder understands.
6. **The 50 routes**, one `b.route([...])` line per build, read from each build's own steps and line (what it says the
   truck does). Where a course can't be driven as its line says, fix the build under R1–R12 (a lane added, a lid where
   it lands), `npm run projects`, `npm run pictures`, restore unchanged pictures; every fix logged.
**Tests:** unit: features of a lane, a ramp (slope endpoints), a car's roof; R13 on hand-made bad routes (a gap with no
jump, an arc through a tower, a wall nobody hits, an unknown name); `check:projects` all 50 × every leg.
**Accept:** 445 builds pass; the route list reviewed by me against each build's line.
**Docs:** engine/README.md (R13); build-log row.

## PR 4.0b · The Pip truck (agent C, ~6 h)
**Goal:** a fully designed monster truck that is Pip, in tile colours only, in the Monster Jam stance.
1. `web/src/three/truck/spec.ts` (pure data, shared with the physics): length 1.00, body width 0.62, track 0.78 (tyres
   outside the body), wheelbase 0.60, wheel radius 0.22, tyre width 0.20, ride height (body bottom) 0.30 at rest,
   suspension travel 0.10, mass 60 g, centre of mass 0.32 up; axle and shock mount points. Every number in one place.
2. `body.ts`: Pip's square face is the front (orange); eyes are the headlights (yellow lenses, purple pupils, glowing
   at `high`); the smile is the grille; two yellow triangle ears stand on the roof; the purple triangle tail is the
   rear spoiler; green arm squares are the mirrors; the cab has blue-tinted windows. Bevelled `ExtrudeGeometry`
   panels drawn in the tiles' own material (`three/tile.ts`: coloured frame + glassy panel), so it reads as made of
   magnet tiles.
3. `wheels.ts`: tyres as a lathe of a rounded profile in dark purple (D4), chevron lugs in two offset rows (one lug
   geometry, `InstancedMesh`, 2 × 20 a tyre), dish rims in yellow with a hub and bolts.
4. `chassis.ts`: open tube frame (green); solid axles with diff housings (blue); four link bars a side; coil-overs two
   a corner (yellow helix springs round blue dampers); bump stops; driveshaft.
5. `Truck.tsx`: the rig; prop `pose: TruckPose = { pos: V3; quat: Quat; wheels: { spin; steer; compress }[4] }`;
   shocks stretched between mounts each frame; the driveshaft spins; Pip's eyes blink (as his idle life).
6. Budget: ≤ 14 draw calls, ≤ 30k triangles (merged by material; lugs instanced); a unit test counts them.
7. `#/design`: a "Pip truck" row: turntable, light and dark, beside a ramp tile for scale, a "bounce" button.
8. The truck sheet (D5): stills front ¾, side, rear, top, light and dark, and a 5 s turntable video (Playwright
   `recordVideo` → mp4 with ffmpeg), sent to Jordan when the PR opens; changes he asks for come as a follow-up.
**Tests:** unit (budget, spec consistency: wheels touch the ground at rest); e2e: the design row draws (frames > 0, no
errors); design plates after looking. **Docs:** DESIGN.md (the Pip truck); build-log row.

## P0 · Physics spike (me, ~6 h, not merged)
**Goal:** prove Rapier and the magnet model are good enough before building on them; numbers decide.
1. Add `@dimforge/rapier3d-deterministic-compat` (exact version, ≥ 2 weeks old) as a **devDependency**.
2. A prototype world: units grams / squares / seconds (1 N = 13 123 units); g = 128.7; fixed step 1/240 s (1/480 s
   while a truck is airborne); solver iterations 8, friction iterations 4.
3. Tiles: a convex hull of the outline extruded ±0.04 about the tile's plane; mass by area (small square 10 g); edges
   that have a joint inset 0.046 (3.5 mm) so neighbours don't overlap; contacts between joined pairs filtered (Rapier
   contact-pair filter hook); tiles on the table lifted half a thickness. Friction tile/tile 0.3, tile/table 0.4,
   restitution 0.1.
4. Two magnet models, the spike keeps the one that passes:
   **M1, magnet forces:** two magnet pairs per shared edge (at ¼ and ¾ along it), each pulling its partner point with
   `F(d) = F0 / (1 + (d/d0)²)`, d0 = 1 mm, cut off at 6 mm; contacts carry compression; the hinge emerges.
   **M2, joints:** a revolute joint per shared edge, broken when it opens > 1 mm for 10 ms.
   F0 starts at 1.0 N per pair for a small-square edge (the agent's range 0.5–2 N), 2.0 N for a big square's.
5. Calibration truths (become the core's unit tests): C1 a lone standing square tips over under the tilt test; C2 a
   ring of four stands; C3 two flat squares bridging a gap, held only at their outer edges, fold at the seam (R10a);
   C4 a 30° two-square ramp with its join in mid-air folds under a 60 g weight, and holds with its brace (Jordan's
   first 2.8 complaint); C5 a 7-high 1-wide ring tower topples under the tilt test, a 7-high 2-wide one stands (R12);
   C6 a crash wall with returns stands, then comes down when a 60 g block hits it at 1.5 sq/s; C7 dominoes fall in
   order.
6. **The tilt test (R14's protocol):** settle 0.5 s; tilt gravity by `1/k` sideways (k = 6, trucks 4: atan(1/6) = 9.5°,
   the angle at which a 6:1 block tips, so R14 agrees with R12 for rigid blocks and catches flexible ones too) in +x,
   −x, +z, −z for 0.5 s each with upright between; pass if no tile moves > 2 mm or turns > 2° from its settled pose and
   no magnet lets go. Settled vs authored < 5 mm is a separate warning.
7. Measure on: a small 3–5 build, the 8-high big tower, The ultimate arena (207 tiles), and one truck run (first-jump).
**Go if:** C1–C7 all right; the arena drifts < 0.2 mm in 2 s untilted with no magnet letting go; R14 agrees with
R10–R12 on ≥ 95% of the states of 30 sampled builds, every disagreement explained; a 207-tile state ≤ 1 s; projected
cold R14 ≤ 4 min on 4 cores after the group cache; the truck run ≤ 1.5 s in Node, its recording ≤ 20 KB gzipped.
**No-go:** the same harness on ammo.js; if that fails too, stop and tell Jordan with the numbers.
The spike's numbers go in the build log; its code becomes P1.

## P1 · Physics core and R14 report-only (me, ~5 h)
1. `web/src/physics/` (Node-only; a lint rule/test forbids importing it from app code): `units.ts`, `world.ts`,
   `tiles.ts`, `magnets.ts` (the chosen model), `tilt.ts` (the protocol), `groups.ts` (split a state into groups of
   touching tiles; a canonical form: moved to the origin, turned to a standard direction, sorted; hashed),
   `calibration.test.ts` (C1–C7).
2. **R14 (D10):** for each build, each step k and each leg: the state = tiles of steps ≤ k; tiles of step k are
   **held** (fixed in place, the child's hand), everything earlier must pass the tilt test; then the finished build
   with nothing held. Crash tiles: treated as standing until hit (they must pass too, R10c's spirit). Truck runs' crash
   behaviour is R13f's.
3. Cache: `web/src/projects/proofs/r14.jsonl`, sorted, one line per group: `{ key, worstMm, worstDeg, broke, ms }`;
   key = hash(canonical group + leg + roles + held set + `physics/**` source hash + Rapier version + calibration +
   protocol). Margins kept: entries within 20% of a limit are re-simulated when physics changes.
4. `scripts/check-physics.ts` → `npm run check:physics`: cached mode (simulate only missing keys + a 2% random sample
   that must reproduce exactly), `--cold`, `--report`; parallel with worker threads (the worker bundled with esbuild,
   as vite-node can't run TS in `worker_threads`).
5. CI: a second job `physics` in `ci.yml`, beside the current one (timeout 20 min); a weekly cold run
   (`physics-weekly.yml`, cron) that fails loudly if the cache is wrong.
6. **Report-only:** current failures go in `web/src/engine/r14-allow.json`; anything not on it fails; the report
   (`test-results/r14-report.md`) lists each failing build, step, leg, the tiles that moved, by how much, and R10–R12's
   view.
**Tests:** C1–C7; determinism (same group twice → identical bytes); the cache hit path; a group split test.
**Accept:** cold run within budget locally; CI's physics job < 10 min cached. **Docs:** engine/README.md (R14), CLAUDE.md
checks list (`npm run check:physics`), build-log row with the failure count.

## 4.2a · Every build stands (agents D, E; me; ~1 h per 10 failing builds)
1. From the report: group failures by cause (a missing return, a tall thin part, a lid on one edge…).
2. Fix in batches of ~20 builds per PR, each build kept itself (the 2.8.2 way): R1–R13 and R14 pass; `npm run
   projects`, `npm run pictures`, unchanged pictures restored; a contact sheet of every changed build looked at; each
   fix named in the log and in CHANGELOG.
3. The last batch empties `r14-allow.json` and deletes it: R14 blocks.
4. If more than 60 builds fail, Jordan gets the list and the causes before the fixes start (he decides scope).

## 4.2d · Motion everywhere, by exact formulas (agent F, ~5 h)
`web/src/motion/` (iPad-side, tiny, no engine): `spring.ts` (closed-form damped spring: position and velocity at time
t for mass, stiffness, damping; critically and under-damped; never stepped, so a long first frame can't blow it up),
`fall.ts` (a body under gravity with bounces: piecewise parabolas with restitution e and rest when the bounce is under
1 mm), `arc.ts` (the ballistic arc between two points in a given time), `css.ts` (a spring sampled into a CSS
`linear()` easing string, with `@supports` fallback to the current ease).
1. **Audit first:** every animation (the keyframes and transitions listed above, Web Animations in `Guide.tsx`, the 3D
   motions) in a table: what it is, what it becomes, kept as is (and why). Goes in the build log.
2. **The tiles' flight** (`three/anim.ts`, `Model.tsx`): the glide from `pS` to `pT` becomes a true ballistic arc
   (launch velocity solved to land at `pT` in `DROP_S` under a scene gravity chosen so it reads, ~1/3 of real), turning
   as it flies; landing hands over to the magnet snap (4.2b; until then the current `snap`).
3. **All steps:** arriving tiles drop from 0.4 square above under gravity with one bounce (e 0.25), ≤ 180 ms; leaving
   tiles lift and fade in 120 ms (Viewer `browse`).
4. **The turntable** (`Viewer.tsx` `Turntable`): a critically damped spring to the quarter (settling in `TURN_MS`),
   exact quarter at rest, `onRest` still fires. OrbitControls stay as they are (their own damping off; no double
   inertia).
5. **The camera** (`CameraRig`): the same spring instead of `easeInOut`.
6. **Pip** (`Guide.tsx`): hops become sampled ballistic keyframes (16 samples, a cartoon gravity in px/s²), a squash on
   landing (scaleY 0.86, scaleX 1.08, springing back); the tossed tiles fly on arcs and spin. His idle life (blink,
   breath) is not motion of a body: kept.
7. **The screens:** `.press`, `.lift`, the grown-ups' buttons and fields, the age picker, the theme chips, the looks'
   transitions, `photo-in`, `pip-bob/hop` use spring easings (`--spring-press`, `--spring-ui`, `--spring-settle` from
   `css.ts`, set on `:root` at start); `Celebration.tsx`'s duration ease becomes a spring.
8. Reduced motion: every one of them still becomes a still or a short fade (as now).
**Tests:** unit: spring settles to the target with the expected overshoot; the fall's bounces and rest; the arc lands
on its point at its time. e2e: the turn still lands on π/2 (viewer.spec), frames stop after landing; plates unchanged
or looked at. **Perf:** Metal script (3.6): stepping the castle, no frame > 33 ms.

## 4.2c · The finish's tiles fall for real (agent G, after 4.2d's module, ~2 h)
1. `three/FallingTiles.tsx` replaces the DOM `TileConfetti` on the finish: 28 small tiles (squares and triangles, six
   colours, as today) dropped from above the model in 3D.
2. Physics by formula (no engine): gravity, spin, a height field of the finished build (its top surface on a 0.25-square
   grid, computed once from the tiles' polygons) and the table; bounces with e 0.3 and friction; each tile comes to
   rest lying on the model or the table; the stage stops drawing when all rest (≤ 3.6 s, `CONFETTI_MS`).
3. A tap skips it (as now); reduced motion: none fall (as now).
**Tests:** unit: every piece ends at rest on a surface (height field or table), never inside; e2e: the finish draws,
then stops drawing; tap skips. Plates after looking.

## 4.0c · Truck runs (me, ~7 h)
1. `physics/vehicle.ts`: Rapier's raycast vehicle controller on a 60 g chassis from `truck/spec.ts`; suspension
   stiffness, damping, rest length and travel tuned so it sags ~10% at rest and bottoms out only on a hard landing;
   friction slip for plastic on plastic (it slides a little, as Jordan said); low roll influence.
2. `physics/driver.ts`: pure-pursuit steering (look-ahead 0.6 square) along the compiled legs (4.0a); speed by a PI
   loop to each leg's target (1.5 sq/s flat, 1.0 climbing, 1.8 descending); for a fly, the take-off speed from
   4.0a's ballistic solution, held up the ramp; brakes at the end. Crash tiles are dynamic bodies held by the magnet
   model (P1), so walls stand until hit and come apart as magnets do; dominoes free-standing.
3. **R13f** in `check:physics`: each truck build's run, simulated, must follow the route (within 0.5 square of each
   leg), land every fly on its target, knock every crash tile down (each ends lying), touch no other tile, end on four
   wheels; and the same under **8 seeded perturbations** (±2% of start pose, speed, friction, magnet strength,
   restitution): all must pass (knife-edge runs fail).
4. `scripts/runs.ts` → `npm run runs`: records each truck build's run at 60 Hz to `public/runs/<id>.bin.gz`, with
   `public/runs/manifest.json` (build hash + physics hash per run). Format v1: header (magic, version, fps, frames,
   tile list); truck per frame (position int16 at 0.001 square, quaternion smallest-three int16 ×3, per wheel
   compress int8, spin uint16, steer int8); each moving tile from its first move to rest (position int16 ×3, quaternion
   ×3); an event list (take-off, landing with its hit, each magnet letting go, each tile touching down). gzip; decoded
   with `DecompressionStream` (an uncompressed `.bin` beside it for iPads without it).
   CI: `check:physics` fails if a recording is stale (hash) and re-simulates two random runs that must match byte for
   byte (Rapier deterministic, so Mac and ubuntu agree).
5. Caching like pictures: not in the install; `project-runs` runtime cache; idle prefetch in `pwa.ts`.
6. **Playback** `three/run/Play.tsx`: loads the recording when a truck build's finish opens; samples by elapsed time ×
   0.6 (a "toy camera": a real 1:64 jump is over in 0.2 s); interpolates (lerp/slerp); poses the `Truck` and the moving
   tiles; `invalidate()` every frame while playing; `window.__run = { t, done, frames }`.
7. `Model.tsx`: `dynamic?: Set<number>` excluded from the `Settled` merge (merged once before the run), drawn as plain
   groups (≤ 40; instancing would break the glass sorting), posed in build coordinates from `poses(i)`; the contact
   shadow drawn without them and redrawn at the end; a blob shadow under the truck.
8. Camera: frames the whole course from the child's side, follows the truck gently (≤ 25° turn), holds for crashes,
   ends where it began.
9. Sound (`sound/sound.ts`): a continuous engine voice (`engine.start/stop/speed`: filtered sawtooth, pitch from wheel
   speed), whoosh in the air, a thud on landing (loudness from the recorded hit), a crunch per magnet letting go and per
   tile touching down (≤ 6/s). Every look's voicing. Muted with the mute.
10. `Done.tsx`, truck builds: after the celebration (or a tap) the run plays instead of the circling view; Pip watches
    (`look`, gaze following the truck), cheers at the end; then the words panel and **Run it again** (play icon).
    Motion reduced: the last frame at once (tiles where they fell, truck parked), no Run it again.
11. Swaps and brands: recordings use the default leg and no swaps; moving tiles are posed by placed index, so a
    swapped square (two corner triangles) moves as one.
**Tests:** unit (Node): the truck at rest sags and stays; rolls down a ramp; off a kicker lands within 0.3 square of
the solution; determinism (two runs, same bytes); recording round-trip (encode → decode within quantisation). R13f for
all 50. e2e `run.spec.ts` (motion on): the first jump's finish plays (`__run.done`), crush car tiles end flat, Run it
again replays; reduced motion shows the end at once; recordings load offline after a first visit. A contact sheet of
six moments (start, take-off, mid-air, impact, crash, end) for **all 50** runs, looked at; a run that doesn't do what its
line says gets its route or build fixed. **Perf:** Metal, toy look at `high`: The ultimate arena and the spiral ramp, no
frame > 33 ms after the first second. **Docs:** PRODUCT.md, DESIGN.md (runs, sound), CHANGELOG `4.0.0`, a video of three
runs sent to Jordan.

## 4.2b · Magnet snap and fall replays (me, ~3 h)
1. The last 3 mm of each tile's flight: a magnet pull modelled as a stiff spring (ζ 0.55: one small overshoot) to the
   exact pose, a click at contact (the existing `snap` sound).
2. **Fall replays** for "It fell down": while R14 runs, steps where the hand matters (earlier steps stand only because
   this step's tiles are held) record how this step's tiles fall without the hand (1.5 s, the same format, only moving
   tiles); `npm run runs` writes them to `public/falls/<id>-<step>.bin.gz`. The FellDown sheet gets **See why** (only
   when a replay exists): the main view plays it, then puts the tiles back.
**Tests:** unit: the snap settles on the exact pose; e2e: See why shows on a step with a replay and plays to the end;
not shown without one. **Docs:** CHANGELOG `4.2.0`; build-log rows.

---

## Verification (each PR, then end to end)
- All repo checks (CLAUDE.md), plus `npm run check:physics` from P1 on; on this Mac the usual `NODE_OPTIONS` flags.
- Shots of every new state in all four looks × light/dark × landscape/portrait/half, contact sheets read before
  plates change; Metal frame measurements where motion changed.
- End to end after 4.2b: on the live site (via the Actions run, as github.io can't be reached from a sandbox), a fresh
  castle (Get your tiles → Watch at Medium → Build from here → Next to the end → finish tiles fall), and The ultimate
  arena (Watch at Fast → finish → the run → Run it again), recorded as a video for Jordan.

## Risks and what we do
- **Rapier can't match the calibration truths** → ammo.js in the same harness; then stop and report (P0 no-go).
- **R14 finds many failing builds** (unknown until P1) → batches; > 60 → Jordan sees the list first.
- **R14 too slow for CI** → group cache, sampling, its own job; weekly cold run.
- **A route can't be driven as the build's line says** → fix the build (logged) or reword its line (Jordan told).
- **Playback frame cost on big courses** → ≤ 40 moving tiles as groups; the frame watch steps quality down.
- **Recordings stale after a build change** → `check:physics` fails on a hash mismatch; `npm run runs` regenerates.
- **iPad without `DecompressionStream`** → the uncompressed `.bin` fallback.

## Estimate
| Work | Who | Hours |
|---|---|---|
| Phase 0 | me | 0.3 |
| 4.1 Watch | A | 3 |
| 4.0a Courses | B | 4 |
| 4.0b Pip truck | C | 6 |
| P0 spike | me | 6 |
| P1 core + R14 report | me | 5 |
| 4.2a fixes | D, E, me | ~1 per 10 failing builds |
| 4.2d motion | F | 5 |
| 4.2c finish tiles | G | 2 |
| 4.0c runs | me | 7 |
| 4.2b snap + replays | me | 3 |
About 42 h of work plus build fixes; with three agents at a time, about 18–20 h end to end.

## Build log (append, never rewrite)
| When (UTC) | PR · keys | Commit | Hours (est · used) | Result / re-evaluation | Next |
|---|---|---|---|---|---|
| 2026-10-09 | spec | — | — · 0.5 | Written while 3.9's CI ran. | Jordan's answers |
| 2026-10-09 | plan | — | — · 1 | Jordan's answers and the reference (JSTruckViewer's screenshot) taken in; the kit read: call order isn't driving order, so each build gets a route and R13 proves it. Detailed plan written; nothing built. | Jordan's go and the three decisions above |
| 2026-10-09 | plan | — | — · 0.3 | Jordan's second reference (Sketchfab, "monsterjam") taken in: the truck becomes an original Monster Jam-style character truck (none of Monster Jam's trucks, names or game models). | Jordan's go and the three decisions |
| 2026-10-09 | plan | — | — · 0.4 | Jordan's answers (a Pip truck, tile colours only, send and keep going, not yet) and his physics links taken in: the runs use cannon-es (not ammo.js, for size), simulated in a worker and played back, and R13f proves every build's run in the same physics. | Jordan reads the plan; his go |
| 2026-10-09 | plan | — | — · 0.3 | Jordan: "use real physics for the whole site": 4.2 added (R14: every step of every build proved to stand in the physics; build mode's magnet snap; the finish's little tiles). | Jordan reads the plan; his go and which parts of 4.2 |
| 2026-10-09 | plan | — | — · 0.2 | Jordan: physics "EVERYWHERE", and all four parts: 4.2d added (the turntable, scrubbing, Pip's arcs and squash, springs for the screens' motion), after an audit of every animation. | Jordan reads the plan; his go |
| 2026-10-09 | plan approved | — | — · 1.5 | A planning agent reviewed the physics design: ship recordings (the proved run is the played run), Rapier for proofs (cannon-es lacks warm starting and load-dependent friction), a tilt test and a group cache to make R14 affordable, the child's hand in R14, a spike with go/no-go numbers. Jordan chose Rapier (deterministic), proved-recorded-played, and "earlier steps stand alone". Plan rewritten in full and approved. 3.9 merged (`68c7686`, #45). | Phase 0 docs PR; wave 1: agents A (4.1), B (4.0a), C (4.0b); me: P0 spike |
| 2026-10-09 | 4.1 Watch it build · agent A | `helpers-4-1-watch` | 3 · 1.5 | Built to the section: `screens/build/{Watch.tsx, useWatch.ts, speeds.ts}`, `friend/pace.ts` (Pip's `pace`; Fast halves hop, hold, toss, cheer), Guide `pace` prop, Watch button (in the `more` slot), settings `watchSpeed` (zod default "medium", Dexie v4), `/done/$pid?watched=1` (Done keeps the saved step). Watch starts at the child's step (step 1 if they are on the last); any `go()` ends watching; All steps takes the panel from the bar and pauses it. Narrow screens (under 641 px) keep the title for screen readers only so the six top buttons fit. e2e `watch.spec.ts`, axe per look. | Review, then ship; 4.0a next |
| 2026-10-09 | 4.0b Pip truck | (this commit, branch `truck-4-0b`) | 6 · 3 | `web/src/three/truck/` (spec, body, chassis, wheels, rig, Truck.tsx) and a "Pip truck" design row (views, bounce, ramp tile for scale). 10 draw calls, 20.2k triangles (budget 14 / 30k), held by a unit test. Looked at in light and dark from five angles and a 5 s turntable; changes after looking: the headlight lens was invisible (inside-out lathe: now double-sided), the face was see-through so shocks showed through it (now solid), the body was raised on a tube frame so the chassis and shocks show (high stance), ears made smaller, tyre rim z-fighting fixed. Deviations: the body is 0.62 wide above the tyres but the tyres' inner faces are at 0.29, so the body rides on a frame above them (tyre top 0.44, body floor 0.50) rather than beside them; `compress` is 0..1 with rest at 0.1 (spec.ts). Truck sheet and video to Jordan with the PR (D5). | 4.0a, P1, then 4.0c |
| 2026-10-09 | 4.1 merged | `04ba5e4` (#47) | — | CI first failed on 5 build plates (the Watch button moved the top bar past CI's tolerance; under it on this Mac); plates regenerated, looked at, CI green, merged. | 4.0b |
| 2026-10-09 | P0 spike | — (branch `physics-spike`) | 6 · 3 | Rapier 0.21.0 (deterministic) as a dev dependency. Tiles as slabs, a magnet hinge per shared edge (revolute joint, magnet friction as a capped motor), contacts left out between tiles that touch at an edge or corner (their slabs overlap; they pushed builds apart). Calibration C1–C8 + C4 both ways: **9 of 9** at magnet friction 0.006 N·m a square of edge with 24 solver iterations (8 iterations made stiff magnets unstable: fake falls in flat pictures). The braced kicker holds a resting 60 g truck (0.5 mm) and folds without its brace (20 mm), as Jordan's first 2.8 complaint said. The tilt test leans atan(1/(1.25k)). Cost: a full cold R14 (6 740 states) ≈ 4 min on 16 cores at 8 iterations, ~2.7× at 24: CI needs the cache by build hash (P1). Jordan asked: finish without him; D11, D12. | P1; R14 list of real falls; 4.0b |

