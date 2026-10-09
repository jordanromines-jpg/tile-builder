# Truck runs and Watch it build (4.0 · 4.1)

Status: approved 9 Oct 2026 (Jordan's answers below: every age; saving "both"; the truck "fully designed, I will get you a reference"; "Both at once"), in progress. The truck's look waits for Jordan's reference.

What started it: Jordan, 9 Oct 2026, with a picture of a finished truck build ("Crunch! The truck landed right on the
car."): "next I want to see the monster truck run the track and crash the courses as intended when it's complete. and
an auto build mode that has a speed selector that goes through it one step at a time." Then: "spec that out in the
meantime."

## What it is

1. **Truck runs (4.0).** When a Monster trucks build is finished, a toy monster truck drives the course the child
   just built, in 3D, the way the build meant: down the road, up the ramp, through the air, onto the crush car, through
   the crash wall, over the dominoes, through the tunnel. The crash pieces fall the way real tiles would: a wall
   topples away from the truck, dominoes knock each other down in turn, a crush car folds flat. Then the stage settles
   and a **Run it again** button replays it. All 50 truck builds get one.
2. **Watch it build (4.1).** In build mode, a **Watch** button plays the build by itself, one step at a time, at a
   speed the child picks (three speeds). Pip carries each step's tiles as he does now. A tap anywhere, or the button
   again, pauses. At the last step it goes on to the finish, so a truck build ends with its run.

## Truck runs (4.0)

### The course comes from the kit, not from hand-written paths
Every truck build is made with the track kit (`web/src/projects/track-kit.ts`): `lane`, `ramp`, `kicker`,
`crushCar`, `dominoes`, `crashWall`, `tunnel`, `tower`, `bigTower`, `arenaWall`, `fence`. Each piece already knows
where it is and which way it faces (`at`, `dir`). So:
- Each driving or crashing piece records a **feature** on the `Builder` as it is placed: its kind, where the truck
  comes in and goes out (points in build units), its direction, and the tiles it owns. Lane: a straight. Ramp: up (or
  down, its `dir` reversed). Kicker: up, then a jump. Crush car, crash wall, dominoes: a **target** with its tiles.
  Tunnel: a straight under a roof. Towers, arena walls and fences: scenery (no feature).
- The **run** is the features in the order the kit was called, which is the driving order in the builds read so far
  (road first, then ramp, then target). A build that is laid out differently says so with one line,
  `b.run(["lane-1", "kicker-1", "car-1"])`, by feature names.
- Between features the truck drives in a straight line on the table. Off a kicker or the top of a ramp with nothing
  ahead, it **jumps**: a parabola from the lip at the ramp's 30° and a speed that lands it on the next feature (the
  landing lane, the crush car's roof, the down-ramp).
- `npm run projects` writes the run into each `public/projects/<id>.json` as `run: RunStep[]` (schema change; non-truck
  projects have none).

### A new checker rule: R13, the run is drivable (trucks only)
- Every step joins the last: where one ends is within half a square of where the next begins, at the same height
  (or it is a jump).
- A jump's arc clears every tile in between and lands on a feature's surface (a lane, a deck, a down-ramp, a crush
  car's roof), not on an edge.
- Every `crash` tile belongs to exactly one target the run hits; nothing else is in the truck's path (a 5 cm wide
  corridor, the 1:64 truck of 2.7).
- Tested over all 50 truck builds in `check:projects`. A build that fails is fixed in the build (or given an explicit
  `b.run`), never by loosening the rule.

### The truck and the crashes in 3D
- **The truck (Jordan: "fully designed, I will get you a reference"):** designed from Jordan's reference. Until it
  comes, the run is built and tested with a plain stand-in (a box on four wheels, about 1 square long, as a 1:64 truck
  on the table); the designed truck replaces it in its own PR. Colours from the six tile colours unless the reference
  says otherwise (say so if it does).
- **Driving:** scripted, not a physics engine (keeps the app small and the same every time). The truck follows the run
  at about 1.5 squares a second on the flat, slows up a ramp, leans with the slope, its wheels turn, it bounces a
  little when it lands. A run lasts 4–12 s depending on the course.
- **Crashing, as real tiles would:**
  - crash wall: each tile topples away from the truck, hinging on its bottom edge, the top row first, a little
    scattered; tiles that touch stay roughly together (they are magnets);
  - dominoes: each falls into the next in turn;
  - crush car: the roof folds down and the sides fold out flat under the truck, which sits on top, bounces once and
    drives off;
  - tiles end lying on the table, inside the stage, never through it. The fall is precomputed (a hinge rotation with
    a small spread), not simulated.
- **Camera:** the view eases to frame the whole course, then follows the truck gently from the side and above,
  keeping the child's usual view direction; it holds still for the crash.
- **Sound** (the existing synth, `sound/sound.ts`): an engine hum that rises up ramps, a whoosh in the air, a thud on
  landing, a crunch for each crash. Muted with the mute.
- **Motion reduced:** no run. The finish shows the build already crashed (the end state of the run) with the build's
  line, and Run it again is hidden.
- **Speed:** the run must stay under 33 ms a frame on the Mac's GPU for The ultimate arena (207 tiles), with the effects
  of the look at its tier; the existing frame watch steps quality down if it can't.

### Where it shows
- The finish screen (`screens/Done.tsx`): for a truck build, after the celebration (or when it is skipped), the stage
  plays the run once. The words panel says the build's own line as now. A **Run it again** button (play icon) sits
  beside Back to the shelf.
- All steps and the design page get nothing new.

### Files
`web/src/projects/track-kit.ts` (features), `helpers.ts` (`Builder.features`, `Builder.run`), `engine/schema.ts`
(`RunStep`), `engine/run.ts` (new: R13), `engine/check.ts` (calls it), `projects/serialize.ts`,
`three/Truck.tsx` (new: the truck), `three/Run.tsx` (new: drives it, times the crashes), `three/crash.ts` (new: how each
target falls), `three/Model.tsx` (lets crash tiles be moved by the run), `screens/Done.tsx`, `sound/sound.ts`,
`strings.ts`, `e2e/run.spec.ts`, unit tests for features, R13 and the crash timings.

## Watch it build (4.1)

- A **Watch** button (play icon) in build mode's top bar, after All steps. It opens a small bar over the step panel:
  **Pause / Play** and three speed chips: **Slow** (6 s a step), **Medium** (3.5 s), **Fast** (1.5 s), the last
  choice remembered on this iPad.
- Playing: Next by itself at that pace. Pip guides each step as with Next (at Fast he hops a shorter, quicker trip).
  The step's line is said at Slow and Medium when the voice is on; at Fast only the step number is shown.
- A tap on the stage, Back, a dot, All steps or the tiles list pauses it. At the last step it goes on to the finish
  (and, for a truck build, its run).
- **Saving (Jordan: "both"):** watching keeps its own place and never moves the child's saved step. The bar has
  **Build from here**: it stops watching and makes the step being watched the child's own (saved, as with Next).
  Closing Watch without it goes back to the child's step.
- **Motion reduced:** it still plays, one step at a time; the tiles appear rather than fall, Pip stays in his place.
- Files: `screens/build/Watch.tsx` (new), `screens/Build.tsx`, `strings.ts`, `store/db.ts` (the remembered speed, in
  settings), `e2e/build.spec.ts` (plays at Fast to the end of the fish; pauses on a tap; the speed chip is
  remembered), axe on the bar in every look, plates after looking.

## Decisions (Jordan, 9 Oct 2026)
1. Watch it build: **every age**.
2. Saving: **"both"**: watching keeps its own place; Build from here makes it the child's.
3. The truck: **"fully designed, I will get you a reference"**: a stand-in until then.
4. Truck runs in reduced motion: the crashed end state (not asked; the rule for every motion: a still instead).
5. Order: **"Both at once"**: two agents in worktrees, one for 4.0, one for 4.1, merged one after the other (4.1
   first, as the smaller).

## Estimate
- 4.0: about 12 h. Features in the kit and R13 are 3 h; the truck, driving and camera 4 h; crashes 3 h; the finish
  screen, sound, tests and looking at all 50 runs 2 h. Some builds will need a fix or an explicit `b.run` once R13
  checks them.
- 4.1: about 3 h.

## Build log (append, never rewrite)
| When (UTC) | PR · keys | Commit | Hours (est · used) | Result / re-evaluation | Next |
|---|---|---|---|---|---|
| 2026-10-09 | spec | — | — · 0.5 | Written while 3.9's CI ran, from the track kit as it is. | Jordan's go and the decisions above |
| 2026-10-09 | decisions | — | — · 0.2 | Jordan answered (above). Both start once 3.9 is merged, as two agents in worktrees. | 4.0 and 4.1 |
