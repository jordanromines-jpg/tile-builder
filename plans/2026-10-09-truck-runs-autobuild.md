# Truck runs and Watch it build (4.0 · 4.1)

Status: **plan, waiting for Jordan's go** (9 Oct 2026; he asked for "a detailed plan" before anything is built).
Decisions already given are marked (Jordan).

What started it: Jordan, 9 Oct 2026, with a picture of a finished truck build ("Crunch! The truck landed right on the
car."): "next I want to see the monster truck run the track and crash the courses as intended when it's complete. and
an auto build mode that has a speed selector that goes through it one step at a time." Answers: Watch it build for
**every age**; saving **"both"**; the truck **"fully designed, I will get you a reference"**, then the reference,
github.com/juanputrerasm/JSTruckViewer (a three.js viewer for Monster Truck Madness 2 trucks) and
sketchfab.com/tags/monsterjam (Monster Jam's trucks); order **"Both at once"**; the truck: **a Pip truck**, **only
tile colours**, **send the truck sheet and keep going**; physics: Jordan pointed to **ammo.js** (Bullet's
`btRaycastVehicle`, "to perfectly mimic a 1/64 scale toy") and **cannon-es** (its vehicle examples, "tire friction to
emulate plastic toy wheels sliding across smooth Hot Wheels track pieces"). Go: **"Not yet"** (he reads the plan first).

## What it is
1. **Truck runs (4.0).** When a Monster trucks build is finished, a monster truck drives the course the child built, in
   3D, the way the build meant (its own line says how: "Crunch! The truck landed right on the car."): along the road,
   up the ramp, through the air, onto the crush car, through the crash wall, over the dominoes, through the tunnel. The
   crash pieces fall as real tiles would. Then it settles, and **Run it again** replays it. All 50 truck builds.
2. **Watch it build (4.1).** In build mode, **Watch** plays the build by itself, a step at a time, at a speed the child
   picks. Pip carries each step's tiles as he does with Next.

## What we know (read 9 Oct)
- The 50 truck builds (`web/src/projects/trucks-1.ts` … `trucks-6.ts`) are made with `track-kit.ts`: `lane`, `ramp`,
  `kicker`, `crushCar`, `dominoes`, `crashWall`, `tunnel`, `tower`, `bigTower`, `arenaWall`, `fence`, plus some tiles
  placed by hand (`b.add`: decks, bridges).
- **The kit is not called in driving order:** e.g. `truck-stair-step-drops` places a crush car before its ramp,
  `truck-rollover-pit` its crash wall first; `truck-double-decker-race` and `truck-world-finals-freestyle` are towers
  only, their roads being tower lids. So the run can't be inferred from call order: each build gets a short **route**
  written in driving order, checked by a new rule (R13).
- Scale (2.7): a 1:64 truck is 7–8 cm long and about 5 cm wide; one small square is 7.5 cm. So the truck is about
  1 square long, 0.67 wide, 0.6 high.
- Ramps are 30°; a kicker is a one-high ramp with a tower under its lip.
- **The reference** (`docs/screenshot.jpg` there: a "GMC 1500 Trophy Truck Evo2"): a pickup body (bonnet, cab,
  bed) with a red/orange livery and white splashes; a roll cage over the bed and windscreen; a roof light bar and four
  round lights on the front bumper; huge black tyres with deep chevron lugs on white dish rims; tall yellow coil-over
  shocks, two a corner; solid axles with tube link bars; a driveshaft. The viewer's own code is Apache-2.0, but the
  trucks it shows come from the game's files, which we must not copy.
- **The second reference** (Sketchfab's "monsterjam" tag): Monster Jam's own trucks (Grave Digger, Max-D, Monster
  Mutt, Dragon, a Spider-Man truck), several marked as taken from the game *Monster Jam: Maximum Destruction*. The
  look: a very high stance on giant tyres; a fibreglass **character body** (a dog with ears and a tongue, a dragon's
  head, a hearse) over an open tube chassis; tall shocks and link bars in plain view. These are trademarked
  characters and game art: we use none of them, no names, no models. **Ours is an original truck in that style,
  designed in code** (below).

---

## PR 4.0a · Courses: features, routes and R13 (no visuals) · ~4 h

**Features, recorded by the kit.** `Builder` (`projects/helpers.ts`) gets `features: Feature[]`; kit pieces push one
as they place their tiles:

```ts
type Surface = { kind: "flat"; y: number; poly: [number, number][] }          // x,z outline, at height y
             | { kind: "slope"; from: V3; to: V3; width: number };            // a ramp's centre line, bottom → top
interface Feature {
  name: string;            // "lane-1", "ramp-2", "kicker-1", "car-3", "wall-1", "dominoes-1", "tunnel-1", "deck-2"
  kind: "lane" | "ramp" | "kicker" | "deck" | "tunnel" | "car" | "wall" | "dominoes";
  surface?: Surface;       // what a truck drives on (cars: the roof, y = 1)
  dir: Dir;                // the way it faces (uphill for ramps)
  tiles: number[];         // the placed tiles it owns
}
```
- `lane` → flat surface; `ramp`/`kicker` → slope (centre line from the bottom edge's middle to the top edge's middle);
  `tower(… lid)` and `bigTower(… deck)` → a `deck` (flat, at the lid's height); `tunnel` → flat at y 0 with a roof;
  `crushCar` → `car` (roof as a flat surface at y 1, tiles to crush); `crashWall` → `wall`; `dominoes` → `dominoes`.
  `fence`, `arenaWall` and plain rings: scenery, no feature. Hand-placed decks: `b.deck("deck-1", tiles)` names them.
- `Project` gets `course?: { features: Feature[]; route: RouteItem[]; truck?: Colour }` (`engine/schema.ts`, Zod;
  written by `npm run projects`).

**Routes, one per build, in driving order** (in each build's own file, one line):
```ts
b.route(["lane-1", "kicker-1", { jump: "car-1" }, "lane-2"]);
type RouteItem = string | { jump: string } | { through: string } | { to: [number, number, number] };
```
- A name: drive onto it and along it (a ramp: up it; a ramp named with `{ down: … }`: down it).
- `{ jump: name }`: leave the last surface's lip and fly to land on `name` (its surface, or for a car, its roof).
- `{ through: name }`: drive through a crash target (wall, dominoes) at table height, knocking it down.
- `{ to: point }`: drive to a point on the table (to turn a corner, to line up).
- The route starts where the child would put the truck: the start of the first item, and the truck faces along it.

**`engine/run.ts` (new): compile a route to a run**, shared by the checker and the app:
```ts
interface RunLeg { kind: "drive" | "climb" | "fly" | "crush" | "smash"; path: V3[]; t0: number; t1: number; targets?: number[] }
function compileRun(project, leg): RunLeg[]
```
- drive/climb: straight lines along surfaces at 1.5 squares/s on the flat, 1.0 up a ramp, 1.8 down one;
- fly: a parabola from the lip at the ramp's 30° (or level off a deck edge) with the speed that lands it on the target
  surface's near third (solved; gravity scaled so a one-square kicker jump lasts about 0.6 s);
- crush: the truck lands on (or drives onto) the car's roof, which gives way: the truck ends at table height;
- smash: drives through, `targets` = the target's tiles, each with the time the truck reaches it.

**R13 (trucks only), in `engine/run.ts`, called from `check.ts`:**
- R13a: the route names only features of this build, and compiles;
- R13b: consecutive legs join (within 0.5 square, same height) unless the second is a fly;
- R13c: a fly's arc clears every tile except its landing target (the truck as a 1 × 0.67 × 0.6 box, sampled every
  0.05 s) and lands on a surface, not on an edge (at least 0.3 square in);
- R13d: no drive or climb passes through a tile that isn't its target (same box);
- R13e: every `crash` tile of the build is a target the run hits (no crash piece left standing for no reason).
- **R13f, the run works in the physics (4.0c adds it):** the build's run is simulated (the same physics module as the
  app, in Node) and must: follow the route (the truck within 0.5 square of each leg's line), land every jump on its
  target surface, knock down every crash tile (each ends lying, not standing), hit nothing else, and end on its four
  wheels. Deterministic (fixed step, seeded), so it fails or passes the same every time.
- `npm run check:projects` runs it under every brand's tall-triangle leg, as the other rules do.

**Writing the 50 routes.** By reading each build and its own line and steps (what it says the truck does); where a
course can't be driven as its line says, the build is fixed (a lane added or moved, a lid where the truck lands) under
R1–R12 as before, and `npm run projects` / `npm run pictures` are run (pictures of unchanged builds restored, as
always). Every changed build is named in the log.

**Tests:** unit tests for features (a lane, a ramp's slope, a car's roof) and for R13 on hand-made bad routes (a gap
with no jump, an arc through a tower, a crash wall nobody hits); `check:projects` for all 50.

## PR 4.0b · The Pip truck · ~6 h

**A monster truck that is Pip (Jordan), in tile colours only (Jordan), in the high-stance Monster Jam style of the
second reference, built in code from three.js geometry (no downloaded models).** `web/src/three/truck/`, each file
≤ 500 lines:
- `body.ts`: the body is Pip: his square face is the front of the truck (orange), his eyes are the headlights (white of
  the eye is not a tile colour: the eyes are yellow lenses with dark pupils, glowing at `high`), his smile is the
  grille, his two yellow triangle ears stand on the roof, his purple triangle tail is the rear spoiler, his green arm
  squares are the side mirrors. The cab behind his face has dark-tinted windows (a tile colour, blue, at low
  brightness). Built from bevelled extrusions, and **drawn in the tiles' own material** (`three/tile.ts`: a coloured
  frame with a glassy panel), so the truck reads as made of magnet tiles, as Pip does.
- `wheels.ts`: giant tyres (about 0.45 of the truck's length across, as a Monster Jam truck's), in a tile colour
  (purple, as Pip's feet, darkened), a lathe of a rounded tyre profile with deep chevron lugs in two offset rows (one
  lug, instanced 2 × 20 a tyre); dish rims in yellow with a hub.
- `chassis.ts`: the open tube frame in green (Pip's arms' colour); solid axles with diff housings in blue; four link
  bars a side; tall coil-over shocks, two a corner, springs in yellow round blue dampers; a driveshaft.
- `Truck.tsx`: the rig: a body group (pitches and rolls), four wheel groups (spin; front ones steer, rear a little:
  Monster Jam trucks steer all four), axles following the wheels, shocks stretched between body and axle mounts each
  frame, the driveshaft spinning, Pip's eyes blinking now and then (as his idle life). Props `pose` from the run.
- **Budget:** at most 14 draw calls and 30k triangles (merged by material, lugs instanced); a test counts them.
- **The design page** (`#/design`): a "Pip truck" row: the truck on a turntable, light and dark, beside a ramp tile for
  scale, with a "bounce" button that works the suspension.
- **The truck sheet for Jordan (Jordan: send it, keep going):** stills from the front three-quarter, side, rear and
  top, light and dark, and a 5 s turntable video, sent when the PR opens; his changes come as a follow-up.

## PR 4.0c · Runs: physics, crashes, camera, sound, the finish · ~7 h

**Physics engine: cannon-es** (pmndrs, MIT), not ammo.js. Both have a raycast vehicle (Jordan's two links). ammo.js is
Bullet compiled to WebAssembly: excellent, but about 1.5–2 MB that every iPad keeps offline, and its API needs manual
memory management. cannon-es is plain JavaScript, tens of KB compressed, made by the same group as the 3D libraries
the app already uses, and its `RaycastVehicle` takes wheel radius, suspension stiffness, damping, travel and friction
slip, which is what a 1:64 toy needs. It is loaded only on a truck build's finish screen (its own chunk), and precached
for offline. (If a frame budget or a fidelity test below fails with it, Rapier, WebAssembly, ~1.4 MB, is the fallback,
asked of Jordan first.)

**The world, at toy scale** (`web/src/run/world.ts`, plain TypeScript so Node can run it for R13f):
- Units: 1 = one square = 7.5 cm; gravity 9.81 m/s² = 130.8 squares/s². Played back at **0.6× speed** (a "toy
  camera": a real 1:64 jump is over in 0.2 s, too quick for a child to see), tunable.
- **Tiles:** every tile is a box (its shape's outline, 0.08 thick, as a tile is 6 mm), static unless it's a crash tile.
  Crash tiles are dynamic (a square about 10 g, a big square 40 g) with low friction (plastic on plastic) and joined
  to the tiles they touch by **magnet joints** (cannon-es lock constraints with a `maxForce` that breaks them), so a
  crash wall holds together until the truck hits it, then comes apart as magnets do; dominoes are free-standing.
- **The truck:** a `RaycastVehicle` on a 60 g chassis box (a 1:64 Monster Jam truck weighs about that), four wheels at
  the Pip truck's axle positions, radius = the tyre's; suspension stiffness, damping, rest length and travel chosen so
  it sags a little at rest and bottoms out only on a hard landing; friction slip for plastic tyres on plastic tiles
  (they slide a little, as Jordan said); roll influence low so it doesn't flip in a turn.
- **The driver** (`run/driver.ts`): the route (4.0a) compiled to legs; each frame it steers toward the next point
  on the current leg and sets the engine force for that leg's target speed. For a jump, the take-off speed is solved
  from the ballistic arc to the landing target (the ramp's angle, the height and distance) and the driver holds it up
  the ramp. Brakes at the end of the course.
- **Deterministic:** fixed 1/240 s steps, no randomness except a seeded one, the same inputs every time: the run the
  checker proves (R13f) is the run the child sees.

**Record, then play** (`run/record.ts` in a Web Worker): when the finish screen opens, the worker simulates the whole
run (about 10 s of toy time; well under a second of work) while the celebration plays, recording at 60 Hz the truck's
pose (body, wheel heights, spin, steer) and every tile that moves. `three/run/Play.tsx` plays the recording in the
viewer (the Model gets `override?: (i) => Matrix4 | null` for moving crash tiles; `Truck.tsx` takes the pose). So the
iPad draws, it doesn't simulate, while the child watches, and Run it again is instant.

**Camera, sound, the finish:**
- The view eases to frame the whole course from the child's side, then follows the truck gently (keeps the course in
  frame, turns at most 25° with it), and holds still for each crash; ends where it began.
- Sound (`sound/sound.ts`, every look's voicing): an engine (filtered sawtooth, pitch from wheel speed, rising up
  ramps), a whoosh in the air, a thud on landing (loudness from the suspension's hit), a crunch for each magnet that
  breaks and each tile that hits the table (capped at 6 a second). Muted with the mute.
- `screens/Done.tsx`, for a truck build: after the celebration (or a tap), the run plays once instead of the circling
  view; Pip watches from the panel (pose `look`, gaze following the truck) and cheers at the end; the words panel and
  **Run it again** show when it ends.
- **Motion reduced:** no run: the finish shows the end of the recording (tiles where they fell, the truck parked) and
  the build's line; Run it again is hidden.
- **Speed:** playback on the Mac's GPU, toy look at `high`, The ultimate arena (207 tiles) and the spiral ramp: no frame
  over 33 ms after the first second; the frame watch steps down if not.

**Tests:** unit (Node): the truck at rest sags and stays put; down a ramp it rolls; off a kicker it lands where the
solver said (± 0.3 square); a crash wall stands until hit, then every tile ends lying; dominoes fall in order; the
run of the same build twice is identical (determinism). R13f for all 50 builds in `check:projects` (budget: under 60 s
in all). e2e (`run.spec.ts`): the first jump's finish records and plays the run (`window.__run`: time, "done"), Run it
again replays, motion reduced shows the end at once, the physics chunk loads only on a truck finish. A contact sheet
of six moments of every build's run, all 50, looked at; any run that doesn't do what its line says gets its route or
its build fixed.

## PR 4.1 · Watch it build · ~3 h

- A **Watch** button (play icon) in build mode's top bar after All steps (`pressed` while on). It opens a bar in place
  of the step panel's content (`screens/build/Watch.tsx`, as the All steps tray does): Pause / Play; speed chips as a
  radio group, **Slow** (6 s a step), **Medium** (3.5 s), **Fast** (1.5 s), the choice remembered on this iPad (the
  settings store); "Step N of M"; **Build from here** (primary); close.
- Playing: a step at a time at that pace; Pip guides each as with Next (Guide gets `pace`, which shortens his hop and
  hold at Fast; the Model's `hold` matches). The step's line is said at Slow and Medium when the voice is on.
- **Saving, "both" (Jordan):** watching keeps its own place and never moves the child's saved step; **Build from
  here** stops and makes the watched step the child's own (saved, as Next does); closing Watch goes back to the
  child's step.
- A tap on the stage, Back, a dot, All steps, the tiles list or the rest screen pauses it. At the last step it goes on
  to the finish with `?watched=1`, where the saved step is **not** cleared (so watching to the end doesn't wipe the
  child's own place); a truck build then plays its run.
- **Every age (Jordan).** Motion reduced: it still plays, tiles appear, Pip stays home.
- Tests: plays the fish at Fast to the finish; a tap pauses; the saved step is unchanged by watching, and Build from
  here saves the watched one; the speed is remembered after a reload; axe on the bar in all four looks; plates after
  looking. Docs: PRODUCT.md, CHANGELOG 4.1.0.

## PR 4.2 · Real physics for the whole site (Jordan: "use real physics for the whole site") · ~10 h + fixes

One physics module for everything (`web/src/physics/`: the world at toy scale, tiles as boxes of their shape and 6 mm
thick, **magnet joints** along every shared edge as hinges with a breaking strength, as every magnet join is a hinge
(2.8)), cannon-es (4.0c), used by the checker in Node and by the app in a worker.
- **4.2a · Every build is proved to stand (R14):** every step of all 445 builds, as built so far, is simulated for 1 s
  under gravity and then given a small nudge (a hand brushing it, at the top, from the child's side): it passes if no
  tile moves more than 2 mm (crash tiles: until hit; truck builds' crash pieces are R13f's). Runs in `check:projects`
  across worker threads, cached by each build's hash so CI only simulates what changed (budget: a full run under 5
  min, a cached one under 30 s). R10–R12 stay as quick checks that explain *why* (a child-readable reason), R14 is the
  proof. **Builds that fail are listed first, then fixed** in batches, the way 2.8.2 fixed 22 (each fix logged; their
  pictures redrawn).
- **4.2b · Build mode snaps with magnets:** the new tiles still glide in along their guided path (it teaches where they
  go), but the last part is real: the tile is let go a few millimetres off and the magnets pull it home and it settles
  (a tiny wobble, a click), in a worker, played back. The "It fell down" sheet can show the step falling as it would
  (a short replay of the structure without its brace or hand), so the child sees why to hold it.
- **4.2c · The finish's little tiles are real:** the shower of little tiles falls under gravity, bounces off the table
  and the model, slides and settles (a few dozen light bodies, simulated in the worker, played back).
- **The truck runs (4.0c)** already use it.
- **4.2d · Everywhere (Jordan: "EVERYWHERE"):** every moving thing in the app, listed and given a physical treatment:
  - the 3D model turning (the turn buttons, the 9–10 turntable): it turns on a turntable with real inertia and
    friction, easing out as a heavy plate does, and the tiles stay put on it (they're joined);
  - All steps scrubbing: tiles that leave lift off and tiles that arrive drop in under gravity (fast, played back);
  - Pip: his hops are true ballistic arcs under the same (scaled) gravity, he squashes on landing, and the tiles he
    tosses fly on real arcs and tumble;
  - the finish's circling view stays a camera move (a camera isn't a body), but everything in it is physical;
  - the screens' own motion (buttons pressing, panels and sheets sliding, cards on the shelf): damped springs (mass,
    stiffness, damping) instead of easing curves, one small spring helper in `ui/spring.ts`, so a press has weight and
    a sheet settles as a physical thing would; reduced motion still makes them still or a short fade.
  An audit first lists every animation in the app (CSS keyframes, transitions, Web Animations, the 3D) with what it
  becomes; the list goes in this plan's log.
- Speed: the physics never runs on the main thread while the child is looking at something moving; everything is
  simulated ahead in the worker and played back, so frame times stay as they are.

---

## Running it (Jordan: "Both at once")
- **Three agents at once, each in its own worktree** (the Agent tool, never Workflow): **A** builds 4.1; **B** builds
  4.0a (features, routes, R13, any build fixes); **C** builds 4.0b (the truck). They touch different files (A:
  `Build.tsx`, `build/Watch.tsx`, `friend/Guide.tsx`, one line of `Done.tsx`; B: `projects/`, `engine/`; C:
  `three/truck/`, the design page). Each runs every check, looks at what it made, commits on its branch and reports;
  none pushes.
- I review each (the diff, its contact sheets, its checks), then ship them one at a time in the order they're ready:
  rebase on main, checks again, draft PR, subscribe, merge when CI is green, confirm `pages.yml`.
- Then **I build 4.0c** on top of 4.0a and 4.0b, and ship it the same way.
- If an agent's work doesn't meet this plan, I fix it or send it back with what's wrong; nothing ships unreviewed.
- The usual rules: plates only after looking; files ≤ 500 lines; strings in `strings.ts`; build-log row in the same
  commit; no model names in commits.

## Decisions (Jordan, 9 Oct 2026)
1. Watch it build: every age. 2. Saving: "both". 3. The truck: a Pip truck. 4. Its colours: only tile colours.
5. The truck sheet: send it and keep going. 6. Order: both at once. 7. Physics: a real engine (his two links);
cannon-es, for its size (above). 8. Go: not yet, he reads the plan first. 9. Physics: everywhere (all of 4.2, and every moving thing).

## Estimate
4.0a 4 h, 4.0b 6 h, 4.0c 7 h, 4.1 3 h, 4.2 about 14 h (4.2a 5, 4.2b 3, 4.2c 1, 4.2d 5) plus fixing the builds R14 finds: about 34 h of work; with agents at once, about 16 h end to end. 4.2a goes first among the physics work (with 4.0c's world), as it may change builds.

## Build log (append, never rewrite)
| When (UTC) | PR · keys | Commit | Hours (est · used) | Result / re-evaluation | Next |
|---|---|---|---|---|---|
| 2026-10-09 | spec | — | — · 0.5 | Written while 3.9's CI ran. | Jordan's answers |
| 2026-10-09 | plan | — | — · 1 | Jordan's answers and the reference (JSTruckViewer's screenshot) taken in; the kit read: call order isn't driving order, so each build gets a route and R13 proves it. Detailed plan written; nothing built. | Jordan's go and the three decisions above |
| 2026-10-09 | plan | — | — · 0.3 | Jordan's second reference (Sketchfab, "monsterjam") taken in: the truck becomes an original Monster Jam-style character truck (none of Monster Jam's trucks, names or game models). | Jordan's go and the three decisions |
| 2026-10-09 | plan | — | — · 0.4 | Jordan's answers (a Pip truck, tile colours only, send and keep going, not yet) and his physics links taken in: the runs use cannon-es (not ammo.js, for size), simulated in a worker and played back, and R13f proves every build's run in the same physics. | Jordan reads the plan; his go |
| 2026-10-09 | plan | — | — · 0.3 | Jordan: "use real physics for the whole site": 4.2 added (R14: every step of every build proved to stand in the physics; build mode's magnet snap; the finish's little tiles). | Jordan reads the plan; his go and which parts of 4.2 |
| 2026-10-09 | plan | — | — · 0.2 | Jordan: physics "EVERYWHERE", and all four parts: 4.2d added (the turntable, scrubbing, Pip's arcs and squash, springs for the screens' motion), after an audit of every animation. | Jordan reads the plan; his go |

