# Tile Steps 2.6 and 2.7: more for 0–3, then Monster trucks

This file is written so any session can pick the work up. When the plan is approved, the first step copies it into the
repo as `plans/2026-10-07-tots-and-trucks.md` and pushes it with the work in progress.

## Context

Jordan's requests, in order (7 Oct 2026):
1. "add more 0-3 projects": the 0–3 band shipped in 2.5 (32 builds, live).
2. Monster trucks, "the monster jam scale", "for all ages and sizes", "its own section on the site":
   - "arenas, functional ramps and jumps and drops and anything else you can dream up";
   - "projects can span up to 1m2", then "you can go larger than 1m2";
   - "big air jumps, ramps and drops at least 7-8 tiles high";
   - "it should have crashable obstacles".
3. "consider how the 4x4s should be used in designs. you lack creativity with those and other shapes."
   - The 4x4s are the **big square tiles** (`square-large`: 2 × 2 small squares).
   - Use them, and the other shapes, much more and more inventively, in both the 0–3 batch and the trucks.

Decisions Jordan made (AskUserQuestion):
- Trucks are built for **1:64** trucks.
- **About 50** truck projects in the first batch.
- **Do both, one after another**: finish the extra 0–3 builds, then the trucks.
- The trucks section is **a shelf on the Library, plus a filter**.
- **The 4x4s are the big squares.**
- Agents may be used ("run agents if you need to").

Standing rules for this repo:
- No keys or secrets in git. The CI scan is `21st_sk_[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}`.
- No real child names or photos, and no analytics.
- Every source file is 500 lines or fewer (`npm run size`).
- PRs are opened as drafts and subscribed to. Merge when CI is green, then confirm the Pages run (`pages.yml`)
  succeeded. github.io is not reachable from the sandbox, so check the Actions run instead.
- Commit trailers come from the session's attribution reminder.
- Don't add new features beyond what's listed here without asking Jordan.

## Where things stand

- `main` is at `684acb4` (2.5, live).
  - There are 313 projects: 32 for 0–3, 16 for 3–5, 36 for 6–8, 64 for 9–10 and 165 for 11–16.
  - Age keys are `t` `a` `b` `c` `d`.
- Branch `tile-steps-2-6`, in `/home/user/tile-builder-more`, is not yet pushed.
  - `web/src/projects/tots.ts` now exports `g`, `flat` and `tris`.
  - `web/src/projects/tots2.ts` is new. It holds `AGE_T2`, 32 builds that all pass the checker:
    - animals: cat, bunny, owl, penguin, whale, snail, turtle, bee, chick, frog;
    - food: strawberry, ice cream, watermelon, cupcake, lollipop;
    - things: umbrella, balloons, kite, crown, present, car, train, rain cloud, traffic lights;
    - triangle pictures: sunflower, rainbow zigzag, waves, three stars;
    - shapes that stand up: cube on a cube, three pyramids, colour stairs, house and garden.
  - `index.ts` appends `...AGE_T2`, and `catalog.json` and `public/projects/` have been regenerated.
  - **`public/pictures/` is half deleted**, by an interrupted `npm run pictures`. Restore it with
    `git checkout -- web/public/pictures` before anything else, then re-run `npm run pictures`.
- Useful files:
  - kits: `web/src/projects/tots-kit.ts` (mosaics), `helpers.ts` (Builder: `on`, `stand`, `room`, `lid`, `roof`,
    `lowRoof`, `tower`, `chunk`), `studio.ts` (shape kit: `polygon`, `hexagon`, `star`, `triOn`);
  - checker: `engine/check.ts` (R1–R9), `engine/hold.ts` (R10) and `engine/ages.ts` (AGE_RULES);
  - matching and sets: `engine/match.ts`, `engine/sets.ts`;
  - camera: `three/camera.ts` (`lookOf`, `MOSAIC` view);
  - Library: `screens/Library.tsx`, with `SHELF_ORDER` in `ui/kid/AgeContext.tsx`;
  - themes: `engine/themes.ts`.
- What a set holds (`engine/sets.ts`):

  | Set | Squares | Big squares | Triangles | Corner triangles | Tall triangles | Other |
  |---|---|---|---|---|---|---|
  | Magna-Tiles 100 | 50 | 4 | 20 | 11 | 15 | |
  | PicassoTiles 100 | 46 | **8** | 20 | 12 | 14 | |
  | Connetix 102 | 36 | 6 | 12 | 12 | 12 | windows, doors, rectangles and fences, 6 of each |

- How to check a design quickly:
  - `npx vite-node <scratch script>` that calls `checkProject` and `needsOf`. Delete the script afterwards.
  - Contact sheets of the pictures: `sharp`, loaded with `createRequire("/home/user/tile-builder-more/web/package.json")`,
    saved in the scratchpad. Look at every new picture.

## Part A — 2.6: 32 more 0–3 builds, with the big squares used well

A1. Start of session. Do these first so a new session can resume:
1. Restore the pictures with `git checkout -- web/public/pictures`.
2. Copy this plan to `plans/2026-10-07-tots-and-trucks.md`.
3. Add it to the Active plans table in `plans/README.md`.
4. Add a line to `plans/CHANGELOG.md`.
5. Commit with the work in progress and push `tile-steps-2-6`.
6. Open a draft PR.

A2. Additions to the mosaic kit (`tots-kit.ts`):
- **Edge points.** Triangles laid flat off a square's edge, as
  `points(b, [{ cell: [col, row], edge: "top"|"right"|"bottom"|"left", shape: "tri-equilateral"|"tri-isosceles-tall", colour }], say)`.
  - They make roofs, sun rays, crown points, fins, grass, petals, spikes and bunting.
  - The words name them: "a red triangle pointing up off the top of the third square".
  - R2 catches any overlap.
- **Big-square cells.** `R+` already exists. Add quilts and blocks drawn on a 2-grid, where each cell is a big square.
- **Standing big-square helpers.** Each states its shapes:
  - `bigCube(b, colour, x, z)`: 6 big squares;
  - `bigTunnel`: 2 big walls and a big roof;
  - `bigBox`: open top, with small squares inside as "toys".

  These need wall helpers 2 units wide. `Builder.room` steps by 1 unit, so add `wallX2`/`wallZ2`.

A3. Rework `tots2.ts` so batch 2 shows off the shapes. Keep it at 32 builds, for 64 in the band.
- Replace the weakest three: rainbow zigzag, waves and lollipop.
- Upgrade others with big squares and edge points. Targets:
  - **at least 12** builds use big squares, for example:
    - a big-square robot;
    - a big-block house with a triangle roof;
    - a big cube;
    - a tunnel for a toy car;
    - a big-square quilt in four colours;
    - the owl's eyes;
    - the present;
    - a big-square sun with triangle rays all round;
    - a big-square fish;
    - a big-block train;
  - **at least 10** mix triangles with squares through edge points, for example:
    - a rocket with tall-triangle fins and nose;
    - a tree of tall triangles;
    - a crown with triangle points;
    - a flower with triangle petals;
    - a hedgehog with spikes;
    - bunting over a row;
  - **at least 6** stand up.
- Budget for each build: two Magna 100 at most. At least 20 should build from one.

A4. Pictures:
1. Run `npm run projects`, then `npm run pictures`.
2. Make contact sheets and check every picture, fixing any whose shape reads badly.
3. Other pictures must not change. Only `manifest.json` and the `baby-*` files should differ.

A5. Tests in `projects.test.ts`:
- the counts become `[64, 16, 36, 64, 165]`;
- every 0–3 build comes from two Magna 100, and at least 40 from one;
- at least 48 lie flat;
- at least 20 use `square-large`;
- titles stay unique.

A6. Docs: CHANGELOG 2.6.0, and PRODUCT.md's 0–3 paragraph (64 builds).

A7. Ship:
1. Run `npm test`, `npm run check:projects`, `npm run size`, `npx tsc -b`, `npm run build`, then
   `npx playwright test --workers=2`.
2. Run `pytest -q tests/test_tokens.py` and the key scan.
3. Push, wait for CI, merge, and confirm the Pages run.

## Part B — 2.7: Monster trucks (about 50 builds, every age)

### B0. Scale and physics. These shape every design.
- **Sizes.** A small square is 7.5 cm, so 1 m is about 13.3 squares, and 1 m² is about 178 square units.
  - A 1:64 Monster Jam truck is about 7–8 cm long, 4.5–5 cm wide and 4.5 cm tall.
  - **One small square is one lane, and a big square is a 2-lane deck.**
  - A tunnel needs a clear height of 1 square (7.5 cm).
- **Ramps.** A ramp tile can only reach a support's top edge if it is longer than the rise.
  - The standard grade is **30°: rise 1 for every 2 tile-lengths**. Use one big square, which is 2 lanes wide,
    or two small squares end to end, for 1 lane.
  - A straight chain of tiles between two fixed edges cannot sag without stretching. This is the same argument as the
    locked hexagon fan in R10, so a taut chain counts as held.
  - Long ramps get a support tower under every joint at whole-number heights, every 2 tile-lengths. Each step of run
    is √3 ≈ 1.73 units, so supports sit off the square grid. That is fine: `Builder.add` takes any position.
- **Heights.** Towers are rings of 4 walls, each ring 1 high. A 1 × 1 tower 8 high takes 32 squares.
  - A ring of 4 big squares makes a 2 × 2 tower 2 high per ring. Four rings give **8 high from 16 big squares**,
    with a big-square deck on top: 2 PicassoTiles 100 sets, or 4 Magna.
  - Big drops and the mega ramp start from such decks, 7–8 high.
- **Big air.**
  - Kicker: two squares or one big square, from the table to a 1-high wall top, at 30°.
  - Gap: 2–4 squares.
  - Landing: a 30° ramp down. Width is 1 or 2 lanes.
  - Mega ramp: a deck 8 high, then a 30° run down with supports at heights 7 to 1, a kicker, a gap and a landing.
    It is about 30 units long.
- **Drops.** A deck with an open edge over a padded landing zone of flat squares. "Stair drops" step down 1 at a time.
- **Crashables.** These are meant to be knocked over by the truck:
  - crush cars: a cube of 6 squares, or a car of a big square and 2 squares;
  - domino rows of standing squares;
  - loose stacks of squares;
  - pyramids of tall triangles as cones;
  - a "wall of doom": stacked walls 7 high.
- **Arenas** can exceed 1 m². The big ones are about 16 × 20 units (1.2 × 1.5 m), with:
  - perimeter walls of big squares (2 high), which also make crowd barriers;
  - stands stepping up in decks;
  - tunnels, bridges and a start deck.

### B1. Engine (`engine/schema.ts`, `types.ts`, `check.ts`, `hold.ts`, `ages.ts`, `serialize.ts`, `match.ts`)
- `Project.section?: "trucks"`, plus a `kind` for the filter chips (`"arena" | "jump" | "drop" | "crash" | "track"`).
  - Carry both in `ProjectInfo` (catalogue).
  - Add a theme `trucks` to `THEMES` with a truck icon, so the existing theme filter becomes the truck filter.
- `Placed.role` gains `"ramp"` (a tilted square, big square or rectangle) and `"crash"`.
- `pyramids()` groups only tilted *triangles*, so ramps are not caught by R7.
- R6 for tilted tiles: allow a ramp's base edge to sit on the top edge of a coplanar ramp below (a chain joint).
- **New R11 "ramps":**
  - a ramp chain is coplanar from end to end;
  - its lowest edge is on the table or a top edge;
  - its highest edge meets a support's top edge or a deck edge;
  - every joint lies directly over a support top edge, except a taut 2-tile chain of rise 1.
- **R10 for `crash` tiles:**
  - they skip R10c, the bracing rule, and the 2-edge rule;
  - they still must stand while built (R6), connect to the table (R3) and not overlap (R2).

  Write this in `engine/README.md`, in the same language as R10.
- Truck size rules: `TRUCK_RULES` by age in `ages.ts`. `checkAge` uses them when `section === "trucks"`.

  | | 0–3 | 3–5 | 6–8 | 9–10 | 11–16 |
  |---|---|---|---|---|---|
  | Tiles | 9–80 | 6–30 | 20–100 | 40–220 | 100–420 |
  | Most tiles a step | 12 | 1 | 4 | 6 | 8 (a whole ring counts as one group) |
  | Stars | by size within these rules | | | | |

- Unit tests (`check.test.ts`, `hold.test.ts`):
  - should pass: a straight ramp, a ramp chain over supports, a crash stack;
  - should fail: a bent chain, a ramp with an unsupported top, a ramp joint with no support.

### B2. Track kit (`web/src/projects/track-kit.ts`, plus a `track-kit.test.ts`). The shapes each piece uses are listed.
- `lane(b, colour, from, to, width: 1|2)`: flat squares, or big squares when `width` is 2.
- `tower(b, colours, x, z, h, footprint: "1x1"|"2x2")`:
  - 1x1 uses square rings;
  - 2x2 uses big-square rings, 2 high each;
  - a lid deck goes on top.
- `deck(b, colour, x, z, y, w, d)`: big squares first, then squares. Each deck tile rests on two walls (R10a).
- `ramp(b, colour, start {x, z, y}, dir, rise, width)`: a 30° chain of big squares (2 lanes) or squares (1 lane).
  - It adds support towers under the joints and returns the far end.
- `kicker(b, colour, at, dir, width)`.
- `landing(...)`: a ramp down.
- `gap(...)`: an empty run, said in the step words.
- `drop(b, deck, side)`: an open edge over a landing pad.
- `crushCar(b, colour, at)`: a cube of 6 squares, or a big-square car body on squares. Role `crash`.
- `dominoes(b, colours, from, n)`, role `crash`.
- `wallOfDoom(b, colour, at, len, h)`, role `crash`.
- `cones(b, at[])`: pyramids of tall triangles, role `crash`.
- `arenaWall(b, colour, x0, z0, w, d, gaps)`: big squares 2 high, braced at the corners. Gaps are the entrances.
- `stands(b, colour, along, tiers)`: decks stepping up, with tall-triangle pennants.
- `tunnel(b, colour, at, dir, len, lanes)`: big-square walls and roof.
- `bridge(b, colour, from, to)`: big-square deck on two towers.
- Words for the grown-up and child, with `chunk` sizes per age.
- Optional, if time allows: a simple low-poly 1:64 truck model in `three/` drawn on the start deck, for scale in build
  mode and pictures. It is not counted as a tile.

### B3. Library: a shelf, plus a filter (Jordan's choice)
- The main age shelves leave out `section: "trucks"`. A **"Monster trucks"** shelf follows the chosen age's shelves.
  - Within it, the chosen age's trucks come first, then the rest by age.
  - It draws 12 cards at a time, as now.
- The theme filter gains a **Monster trucks** chip (truck icon). With it on, the Library shows only truck builds, in
  shelves by age, with the usual "You can build these" split.
- Keep the plates' top area the same where possible, and update the Library plates once.

### B4. Rendering
- Check that `fitDistance` and the `far` plane (200) frame a footprint of about 20 × 25 units and 8 units tall.
- Check that the table in `three/Stage.tsx` is big enough. Enlarge it if an arena runs off it.
- Pictures use the three-quarter view, and tall towers must not be clipped.

### B5. The ~50 projects (`projects/trucks-*.ts`, at most 500 lines each)
Every one uses big squares or other shapes beyond plain squares, where they make sense. Rough tile counts are given;
"sets" means Magna 100 sets unless it says Picasso.
- **0–3 (6), built by a grown-up:**
  - Truck road loop (40);
  - Little ramp (big square and a wall, 12);
  - Knock-down tower, crash (20);
  - Big-square garage (14);
  - Bumpy road with two kickers (30);
  - Crush-the-cubes, crash (24).
- **3–5 (7), one tile a step:**
  - First jump (8);
  - Knock-down wall (10);
  - Truck tunnel (big squares, 9);
  - Ramp and drop (14);
  - Crush car (6);
  - Little arena (24);
  - Two-lane ramp (12).
- **6–8 (10):**
  - Double kicker;
  - Crush-car row;
  - Two-lane drag strip;
  - The big tunnel;
  - Ramp to the roof (3 high);
  - Stair-step drops;
  - Monster garage;
  - Bounce bridge;
  - Crash castle;
  - Domino run.

  These are 30–90 tiles, from 1–2 sets.
- **9–10 (12):**
  - Mega ramp 4 high;
  - Big-air gap;
  - Freestyle bowl, with ramps on four sides;
  - Bus jump (crush buses);
  - Tower drop 5 high;
  - Figure-eight with a crossover bridge;
  - Skills course (cones);
  - Donut circle;
  - Ramp-to-ramp;
  - Cliff jump;
  - Crash-test city;
  - Two-lane race with tunnel.

  These are 60–200 tiles, from 2–3 sets.
- **11–16 (15):**
  - Monster stadium (16 × 20, stands, tunnels, 400);
  - The 8-high drop tower;
  - Mega ramp from 8 high with a 3-gap jump;
  - World finals freestyle;
  - Backflip ramp (2-high kicker);
  - Crash-zone city;
  - Double-decker race;
  - Triple big air;
  - Wall of doom (7 high, crash);
  - Spiral ramp round an 8-high tower;
  - Canyon jump;
  - Rollover pit;
  - Train-yard crash;
  - Bridge-to-bridge;
  - The ultimate arena.

  These are 120–420 tiles, from 3–4 sets (or 2 PicassoTiles where big squares dominate).
- At least 8 builds reach 7–8 high. At least 8 have a footprint over 178 square units (more than 1 m²). Every build
  has a ramp, jump, drop or crash feature.

### B6. Tests
- `projects.test.ts`:
  - truck counts by age are `[6, 7, 10, 12, 15]`;
  - every build comes from at most 4 Magna 100 sets;
  - at least 8 reach height 7 or more;
  - at least 8 have a footprint over 178 square units;
  - each has a ramp or a crash tile;
  - at least 30 use big squares;
  - titles are unique.
- `track-kit.test.ts`: a ramp's end height and supports, an arena's corners braced, and a tunnel's clearance of 1 or
  more.
- e2e: the Monster trucks shelf shows; the filter shows only trucks; a card opens build mode. Update the Library
  plates.
- `npm run check:projects` passes for everything.

### B7. Docs
- PRODUCT.md: a "Monster trucks" section covering scale, ramps, crashables and safety. Crashing is the point, but
  trucks are toys: no throwing.
- DESIGN.md: the trucks shelf and filter chip.
- `engine/README.md`: R11 and the crash role.
- CHANGELOG 2.7.0.

### B8. Shipping, in two PRs, so each stays reviewable
- **2.7**: engine (R11 and crash), track kit, the Library shelf and filter, and the first 15 builds (3 for each age).
- **2.8**: the remaining ~35 builds.
- Each follows the A7 checks, then draft PR, CI, merge and the Pages run.
- Agents may be used to write project files in parallel. Give each one a file and an age band, the kit API, the
  shape targets and the checker command, and have them return only after `check:projects` passes.

## Part C — 2.9: native wildflowers of Kansas, Chicago and North Carolina (50 builds)

Jordan, 8 Oct 2026: "the next set of 50 will be for flowers native to Kansas, chicago, and North carolina. single
flowers and bouquets and etc." This comes after Part B (2.8 finishes the ~35 remaining truck builds first), unless
Jordan says otherwise.

### C0. Decisions to confirm with Jordan at the start (AskUserQuestion), with these defaults
- **Where they show:** a **Wildflowers** shelf on the Library plus a filter chip, the way trucks work. That means a new
  theme `flowers` (with the Phosphor `Flower` or `FlowerTulip` icon), and the existing `gardens` theme stays for the
  older garden builds. The default is to mirror trucks: `Library.tsx` gets `trucksShelf`-style code for `flowers`.
- **Ages:** all five bands, 10 each.
- **Region in the title**, for example "Kansas sunflower", "Chicago prairie bouquet" or "Carolina dogwood branch".
  The done line names the region and a true fact ("The sunflower is the state flower of Kansas.").
- **Colour honesty:** tiles come only in red, orange, yellow, green, blue and purple, with no white, pink or brown.
  - Pick flowers whose real colours are in that set.
  - When a flower's real colour isn't available (white dogwood, pink phlox, brown centres), say so in the step words:
    "Dogwood petals are white; we use yellow".
  - Or use the nearest colour (pink becomes purple or red) and say so once.

### C1. Flower list, native and checked against sources before building
Use web research (or agents) to confirm that each one is native to that region. Candidates:
- **Kansas (prairie):**
  - sunflower (*Helianthus annuus*, the state flower, yellow);
  - purple coneflower (*Echinacea angustifolia*);
  - black-eyed Susan (yellow with a dark centre: use orange or purple for the centre);
  - butterfly milkweed (orange);
  - blazing star / liatris (purple spikes);
  - prairie wild indigo (*Baptisia*, blue);
  - goldenrod (yellow);
  - Indian blanket / gaillardia (red and yellow);
  - Maximilian sunflower;
  - compass plant (yellow).
- **Chicago / northern Illinois (prairie and woodland):**
  - violet (the Illinois state flower, purple);
  - wild columbine (red and yellow);
  - Virginia bluebells (blue);
  - prairie smoke (purple-red);
  - wild bergamot (purple);
  - shooting star (purple);
  - purple prairie clover;
  - rattlesnake master (green and white, so green);
  - spiderwort (blue);
  - cardinal flower (red).
- **North Carolina (mountains to coast):**
  - flowering dogwood (the state flower; white bracts, so they need the colour note);
  - Carolina lily (orange);
  - Turk's cap lily (orange);
  - flame azalea (orange and red);
  - Catawba rhododendron (purple);
  - mountain laurel;
  - trumpet creeper (orange-red);
  - Joe-Pye weed (purple);
  - cardinal flower (red);
  - Venus flytrap (native only to the Carolinas; green and red, a fun one).

### C2. Build kinds, and which kit each uses
- **Single flowers, flat mosaics** (0–3, 3–5): `tots-kit.ts` `squareMosaic`, plus `points` for petals and rays,
  `triangleRows` for round heads, and big squares for centres (a sunflower is a big-square centre with 12–16 triangle
  rays).
- **Standing single flowers** (6–16): a square stem tower (a 1×1 ring stack, green), leaves as tall triangles, and a
  head as a ring of tall triangles leaning out or a pyramid. Check the leaning-out petal geometry against R7 and R10. If
  leaning petals need a new role (like `ramp`), add `petal` with a rule in the R11 style, plus tests.
- **Bouquets:**
  - a vase (a ring of squares or big squares, 2–3 high) with several stems of different heights rising out of it;
  - a wrapped bouquet (a cone of tall triangles) with flower heads on top;
  - a region bouquet that mixes that region's flowers.
- **Other ideas:**
  - a prairie strip: a flat row of mixed wildflowers on a green lane;
  - a wreath: a ring of flower heads round a big-square middle;
  - a window box: a long trough of squares with flowers;
  - a garden bed for each region;
  - a state-flower trio (sunflower, violet, dogwood);
  - a pollinator garden with a butterfly on the milkweed;
  - a Venus flytrap with jaws of triangles.
- **Shapes:** use big squares and triangles inventively, as in Part A, rather than plain square grids.

### C3. Distribution: 50 builds, 10 for each age, mixed across the three regions
- **0–3:** 10 flat mosaics. A grown-up builds them, with words for the grown-up.
- **3–5:** 10 small flat or two-layer builds, one tile a step. Use the 3–5 word list (no geometry words).
- **6–8:** 10 builds: standing single flowers and small vases.
- **9–10:** 10 builds: bouquets and window boxes.
- **11–16:** 10 big builds: a bouquet of each region, a state-flower trio, a big wreath, a pollinator garden, and a
  prairie with a dozen flowers. Up to two sets, as for other builds of that age.

### C4. Files, tests and docs
- `web/src/projects/flowers-1.ts` … `flowers-3.ts`, each 500 lines or fewer, plus a `flower-kit.ts` if the
  standing-flower and vase helpers grow.
- `projects.test.ts`:
  - flower counts by age are `[10, 10, 10, 10, 10]`;
  - every flower build names its region in the title;
  - each region has at least 15;
  - each flower build fits its age's set budget;
  - titles are unique.
- If the theme is new: `ThemeFilter` test (ten themes), a Library e2e for the shelf and chip, and the plates.
- Docs: a PRODUCT.md section on wildflowers (regions, colour honesty), DESIGN.md, and CHANGELOG 2.9.0.
- Ship as A7: all checks, then draft PR, CI, merge and the Pages run. Use two PRs if it grows: the kit and 25 builds,
  then 25 more.

## Verification (each PR)
1. `npm test`, `npm run check:projects`, `npm run size`, `npx tsc -b`, `npm run build`, `npx playwright test --workers=2`.
2. `pytest -q tests/test_tokens.py`. Then the key scan,
   `grep -rEl '21st_sk_[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}' --exclude-dir=node_modules --exclude-dir=.git .`,
   which should find nothing.
3. Check contact sheets of every new picture, and screenshot a build screen for one big arena.
4. After merging: the CI run on main is green, and the `pages.yml` run succeeded.

## Build log

The last row says what is next. Update it in the same commit as the work.

| Date | Step | Branch / commit | Next |
|---|---|---|---|
| 2026-10-07 | Plan approved. 2.5 (0–3, 32 builds) is live at `684acb4`. Part A started: `tots2.ts` has 32 builds that all pass the checker, but have no pictures yet. | `tile-steps-2-6` | A2: edge points and big-square helpers in `tots-kit.ts`, then A3 |
| 2026-10-07 | Part A done: 32 more 0–3 builds (`tots2.ts` 20, `tots-big.ts` 12) using big squares (14) and edge triangles (10), with 6 that stand up. The kit gained `points`, `bigCells`, `bigFlat`, `bigRing`, `bigCube` and `bigTunnel`. R5 counts how high a tile reaches. All checks green; 106 e2e. | `tile-steps-2-6` (PR #31) | Merge #31, then Part B: start B1 (engine: ramps, R11, crash role, section) on `tile-steps-2-7` |
| 2026-10-07 | 2.6 merged (#31) and live. Part B started. Engine: theme `trucks` (the section marker; there is no separate `section` field), tile roles `ramp` and `crash`, R11 in `engine/ramps.ts`, crash exemptions in R10, `TRUCK_RULES` and `rulesFor` in `ages.ts`, R9 groups (ring, ramp run, big-square step). `track-kit.ts`: `tower`, `bigTower`, `ramp` (30°, supports), `kicker`, `lane`, `crushCar`, `fence`, `dominoes`, `crashWall`, `arenaWall`, `tunnel`, with `track-kit.test.ts`. The Library has a Monster trucks shelf and the trucks chip in the theme filter. | `tile-steps-2-7` | B5: the first 15 truck builds (`projects/trucks-1.ts`, 3 for each age), then pictures, tests, docs, PR 2.7 |
| 2026-10-07 | 2.7 ready: the first 15 truck builds (`projects/trucks-1.ts`, 3 for each age) all pass, pictures checked, docs (PRODUCT.md "Monster trucks", DESIGN.md, engine README R11, CHANGELOG 2.7.0), tests (truck checks, ThemeFilter nine themes, e2e for the shelf and chip), 108 e2e green. | `tile-steps-2-7` | Merge 2.7, then 2.8: the other ~35 builds (`trucks-2.ts` …), following B5's list and avoiding the 15 already done |
| 2026-10-08 | 2.7 merged (#32, `ff4f147`). Jordan asked for the next 50 builds to be native wildflowers of Kansas, Chicago and North Carolina (single flowers, bouquets and more), so Part C (2.9) was added to this plan. | `tile-steps-2-8` | 2.8: write the ~35 remaining truck builds (B5 list minus `trucks-1.ts`), then Part C. Confirm C0 with Jordan first |
