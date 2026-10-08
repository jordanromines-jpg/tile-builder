# Sound structures: builds that would really stand, and hold a truck

Status: approved 8 Oct 2026 (D1–D6), in progress

What started it: Jordan, 8 Oct 2026, looking at the Monster truck builds in the app:
- "this won't support any weight." (a ramp of two squares meeting in mid-air between two towers)
- "can you use more enginerring principals? overal?" Asked where (AskUserQuestion: trucks as checker rules, every
  project in the app, teach it in the steps, or my process), he answered "all of the above."
- "just one more example." (the 8-high drop tower: a 3 × 3 crash wall of squares stacked flat, with no corner)
- "the canvas is also struggling with bigger builds and loses viability": slow, doesn't fit, parts clip, and it goes
  blank (all four, AskUserQuestion).

It changes `2026-10-07-tots-and-trucks.md`: 2.8 (the remaining 35 truck builds) ships under these rules, and the
first 15 (2.7, live) are reworked with them. Part C (2.9, wildflowers) waits until this plan's PRs are merged.

## Why

The checker (R1–R11) proves that every tile touches something and that nothing overlaps. It does not prove that a
build would stand up to a hand, or to a 1:64 truck (about 50–70 g) rolling over it. Magnet tiles join at their
edges, and **every joint is a hinge**: it holds in tension and in line, but it folds. Three rules let hinges through:

1. **R11d, the "taut pair".** Two ramp tiles could meet in mid-air between two supports, on the argument that a
   straight chain between fixed ends can't sag without stretching. But a small sag needs almost no stretch, and the
   magnets give way first: a truck on the join folds it. 33 of the 50 truck builds had such a join.
2. **Crash tiles skip R10c.** A wall of squares stacked in one plane with no corner is a stack of hinges; it falls
   before a truck reaches it. 13 truck builds (2.7's included) have one.
3. **Nothing limits slenderness.** A tower 8 rings high and 1 square wide stands on a 7.5 cm base; a truck landing
   next to it, or a child's hand, tips it.

Measured on the 395 projects in the tree (8 Oct, a report-only script, not yet a rule):

| Candidate rule | Builds it would catch |
|---|---|
| A structure taller than 3 × its narrowest base | 87 (trucks: 12) |
| … taller than 4 × | 51 (trucks: 6) |
| … taller than 6 × | 10 (trucks: 2) |
| Crash tiles stacked in one plane with no tile at an angle | 13, all trucks |

Not measured: the strength of a magnet joint in tension or shear. Every rule below is geometric; the assumption under
the brace (A1) needs a real build and a real truck (T1).

## Principles, and the rule each becomes

| # | Principle | Rule | Applies to |
|---|---|---|---|
| P1 | **Triangles don't fold.** A hinge is locked only by a triangle or by a support under it. | R11 (changed, done in the tree): no ramp join in mid-air. Small-square ramps get a **brace** under each join: one square leaning from the next tower's face to the join, which makes a triangle of three squares with the upper ramp tile and the tower wall. Big-square ramps get a tower under every join (each big square rises a whole square). New role `brace`. | trucks |
| P2 | **Load goes down through walls.** A surface a truck drives on rests on top edges of walls that stand on walls, down to the table. Nothing is hung off a face by magnets alone. | R10a already makes flat tiles above the table rest on two top edges. R11 makes ramps rest on top edges. The one exception is the brace foot, which bears on a tower's face at a ring seam (A1). | all |
| P3 | **Wide bases don't tip.** | New **R12 "stands firm"**: every structure (tiles joined together, leaving out crash tiles and tiles flat on the table) is no taller than **k ×** its narrowest base. Tied structures count as one, so a tower joined to a neighbour by a deck, or sharing a wall, is as wide as both. | all, with k by kind (D3) |
| P4 | **Things built to fall must stand until hit.** | Crash tiles keep R10c: each row of standing crash tiles above the table touches a tile at an angle (an L, a U, a zig-zag or a box). A single domino, one square standing alone on the table, stays allowed. | trucks |
| P5 | **Spans rest at both ends.** | Already R10a (flat tiles on two top edges) and R11 (ramps at both ends). For trucks, a flat tile a truck drives on above the table rests on **two opposite** top edges, not two at a corner. | trucks |

## Decisions

| # | Question | Answer |
|---|---|---|
| D1 | Ramps: how do they hold a truck? | "Prototype a braced ramp first" (8 Oct), then, shown it: "Yes, braces + towers" for all trucks, the live 2.7 builds included. |
| D2 | Where do engineering principles apply? | "all of the above" (8 Oct): truck rules, every project, the why in the steps, and the process. |
| D3 | R12's limit k (height ÷ narrowest base) | "4× trucks, 6× others" (8 Oct). Today 6 trucks fail at 4 and 10 builds fail at 6. |
| D4 | The trucks plan wanted "at least 8 builds at 7–8 high". At k = 4, 7 high needs a base 2 wide, and a 2-wide ramp's towers cost about 6 squares a ring (a 7-high ramp: about 170 squares of towers out of 200). | "Keep 8 builds at 7–8 high" (8 Oct), within 4 Magna sets. Those builds spend most of their tiles on supports: wide towers, stepped decks (ziggurats), drops and short ramps rather than long ones. |
| D5 | The why in the steps: how much? | "Only for 9+" (8 Oct): ages 9–10 and 11–16 get one short line on the step where a principle is used ("Triangles don't fold: this brace locks the join."). Younger steps stay as they are. No new UI. |
| D6 | Order | "Trucks, canvas, all, flowers" (8 Oct): 2.8 (trucks, under P1–P5), 2.8.1 (the canvas), 2.8.2 (R12 for every project), then 2.9 (wildflowers). |

## Phases, pull requests and keys

### Phase 1 · Trucks that hold a truck

**PR 2.8 · the 35 remaining truck builds, and all 50 under P1–P5 · branch `tile-steps-2-8-trucks` (`tile-steps-2-8` was used by #33) · GitHub #**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 1a | R11 strict, role `brace`, braces and towers in `ramp()` | engine/ramps.ts, schema.ts, check.ts, track-kit.ts | code | done; all 395 pass | done |
| 1b | R12 stands firm (k from D3), P4 crash bracing, P5 opposite edges | engine/stability.ts (new), hold.ts, check.ts | code | unit tests: an 8-high 1 × 1 tower fails, a 2 × 2 passes, two towers tied by a deck pass; a flat crash wall fails, an L passes | 2 h |
| 1c | Kit pieces for the new rules: `stepDeck` (ziggurat), `wideTower`, `crashWall` with returns, `bridge`, `cones`, `landing` (moved from the agents' files) | track-kit.ts (split if over 500 lines) | code | `track-kit.test.ts` covers each | 1.5 h |
| 1d | Rework all 50 truck builds to pass, with the why lines for 9+ (D5) | trucks-1 … trucks-6.ts | code | `check:projects` green; counts [6, 7, 10, 12, 15]; 4 Magna sets; 8 builds whose true top is 7 or more (D4); 8 over 1 m²; 30 with big squares | 4 h (agents) |
| 1e | Pictures, contact sheets looked at, tests, docs (engine README R11–R12, PRODUCT.md "Monster trucks", CHANGELOG 2.8.0) | public/, docs | check | every check in CLAUDE.md green | 1 h |

### Phase 2 · The canvas copes with big builds

**PR 2.8.1 · the canvas copes with big builds · branch `tile-steps-2-8-1`**

Found (8 Oct, an agent measuring the app in Playwright on a real GPU, 1180 × 820 at 2×; no iPad yet):
- **Blank and washed out:** `Stage.tsx:33` fogs from 22 to 60 units, but `fitDistance` puts the camera 45–145 away
  from the big builds. At the last step Triple big air and The ultimate arena are an empty screen; mid-build, tiles are
  45–95 % fogged. Small builds (castle: 18–26 away) are unaffected.
- **The table ends:** the table is a fixed 80 × 80 (`Stage.tsx:56`); the fog was hiding its edge. Zoomed out (1.8×,
  `Viewer.tsx:282`), the far plane (200) would clip the longest builds (calculated, not seen).
- **Too small:** the fit uses the longer footprint side as a cube and the vertical field of view only, padded 10 %
  (`camera.ts:11-19`, `Viewer.tsx:234-235`), above a bottom strip that wraps to two rows of dots: big builds fill
  21–44 % of the width.
- **Hitch on every step:** `Settled.rebuild` (`Model.tsx:90-130`) re-merges every landed tile each step: a 56–74 ms
  long task and 5–16 MB uploaded per step at 200 tiles (about 400 MB over a build); expect 3–5 × worse on an iPad.
- **Heavy frames:** `ContactShadows` re-renders the scene every frame (about 6 render calls a frame); each square is
  about 1,150 triangles (`tile.ts:60,130`); glass is transparent `MeshPhysicalMaterial` with clearcoat; ages 9+
  auto-rotate until touched (`Viewer.tsx:244`), so the GPU never rests. The perf test counts only the last pass.
- **Not reproduced:** WebGL context loss (no events, heap flat at 52–69 MB). Memory pressure on the iPad (a
  2360 × 1640 buffer with 4× antialiasing is about 140 MB) is the likely cause there; unmeasured.

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 2a | Fog scaled to the camera distance (or none), the table sized to the build, the far plane from the distance | three/Stage.tsx, Viewer.tsx | code | the last step of every truck build is visible; no table edge in view; e2e plate of a big build | 1 h |
| 2b | Frame by width and depth with the real aspect and both fields of view, no extra padding; one row of step dots ("12 of 45") for long builds. The pictures use the same fit: the 8-high drop tower's picture has its top cut off (live since 2.7) | three/camera.ts, Viewer.tsx, screens/Build.tsx, pictures.ts | code | big builds fill 60 %+ of the width; no picture clips a tall build; camera tests | 2.5 h |
| 2c | Add each step's tiles to the merged model instead of rebuilding it | three/Model.tsx | code | no long task over 20 ms on a step of a 200-tile build | 3 h |
| 2d | Contact shadow drawn once a step, not every frame; lighter tile geometry (fewer bevel and rivet segments, indexed), checked by eye | three/Stage.tsx, tile.ts | code | render calls a frame back to 1–2; pictures look the same | 2 h |
| 2e | For big builds: pixel ratio at most 1.5, auto-rotate stops after one turn | three/Viewer.tsx | code | — | 0.5 h |
| 2f | The perf test counts every pass and times a big build's steps | e2e/perf.spec.ts | check | fails before 2c, passes after | 1 h |
| T2 | Jordan steps through The ultimate arena on the iPad | | gate | no blank, no stutter he notices | |

### Phase 3 · Every project stands firm

**PR 2.8.2 · R12 for every project · branch `tile-steps-2-8-2`**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 3a | R12 on for every project at k = 6 (D3) | engine | code | the report lists the builds that fail | 0.5 h |
| 3b | Rework those builds: widen, tie towers together, or buttress, keeping each one's look | projects/*.ts | code | `check:projects` green; pictures looked at | 2–3 h |
| 3c | The why lines for 6+ where a principle shows (a buttress, a brace, a wide base) | projects/*.ts | code | — | 1 h |

## Gates that need Jordan

| Gate | When | What he does |
|---|---|---|
| G1 | now | Answers D3–D6 |
| T1 | before 2.8 merges, if he can | Builds one braced ramp (A1) and rolls a truck down it |

## Assumptions

- **A1:** a brace's foot pressing on a tower's face at the seam between two rings holds a 1:64 truck's weight. The
  triangle locks the join geometrically; the foot is the one place where the load passes through a magnet on a face
  instead of a top edge. If T1 shows it slipping, the fallback is a tower under every join, which means big-square
  ramps only (fewer, shorter ramps).

## Time bounds and self-checks

As in plans/README.md. Run bounds: `npm run pictures` about 6 minutes on Jordan's Mac; e2e about 5 minutes.

## The rules of the build

As in plans/README.md, plus:
- **Measure before deciding.** A new rule is first a report over every project; its threshold is chosen from the
  numbers, with Jordan.
- **Rules before rework.** No builds are reworked until the rules they must pass are in the checker.
- **Say what is real.** Heights are the true top of a tile, not a formula; a claim about strength names what was and
  wasn't tested.
- **Pictures are drawn on one machine.** Only changed projects' pictures are committed; the rest are restored (this
  Mac renders slightly differently from the one that drew the set).

## Critical files

`web/src/engine/check.ts`, `hold.ts`, `ramps.ts`, `README.md`; `web/src/projects/track-kit.ts`, `trucks-*.ts`;
`web/src/projects/projects.test.ts`.

## Verification

| V | Check | Passes when |
|---|---|---|
| V1 | Every check in CLAUDE.md | green |
| V2 | R12 report after each PR | no build over its k |
| V3 | Contact sheets of every changed picture, looked at | nothing floats or reads badly |
| V4 | One braced ramp, built for real (T1) | a truck rolls down it and nothing folds |

## Jordan's testing after

- T1: build a braced ramp (2 squares, 1 brace, a 1-high ring) and roll a truck down it.
- T2: on the iPad, open the biggest arena and step through it (after 2.8.1).

## Build log (append, never rewrite)

| When (UTC) | PR · keys | Commit | Hours (est · used) | Result / re-evaluation | Next |
|---|---|---|---|---|---|
| 2026-10-08 | 2.8 · 1a | (uncommitted) | — · 1 | The 35 builds were written by five agents and all passed. Jordan found the mid-air ramp join and the flat crash wall. R11 made strict; braces prototyped and approved (D1); all 395 pass with braces and towers. Five 11–16 builds went over 4 sets and were trimmed, but toward 1-wide towers that R12 would fail: the rework waits for R12. | G1: Jordan answers D3–D6, then 1b |

## Results

None yet.
| 2026-10-08 | 2.8 · 1b, 1c, 1d, 1e | (this commit) | 9 · about 6 | R12 (every height, so a ring at a tower's foot can't fake width; tests for it), crash rows keep R10c, R12b decks on opposite edges; kit: `crashWall` returns, `tower()` lid dividers, `ramp()` towers 2 across over 4 high. Five agents reworked their files under the rules: 395 pass, all 50 trucks within 4 Magna sets, 9 with a true top of 7–8 (D4), 16 over 1 m², 39 with big squares, why lines on the 9–16 builds. Mega ramp from eight high became "Mega ramp and the eight-high tower"; Triple big air and the ultimate arena start from 2 × 2 drop towers instead of long ramps. All checks green; Library plates updated after looking. Found: the 8-high drop tower's picture has its top cut off (live since 2.7), moved to 2b. | Draft PR 2.8, CI, merge, Pages; then T1 (Jordan builds a braced ramp) and 2.8.1 |
