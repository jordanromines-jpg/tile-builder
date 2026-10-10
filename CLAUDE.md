# Tile Steps: notes for every session

Tile Steps (repo `jordanromines-jpg/tile-builder`, live at https://jordanromines-jpg.github.io/tile-builder/) is an
iPad web app. A family enters its magnet tiles (Magna-Tiles, PicassoTiles, Connetix). The app shows which projects they
can build, and walks a child through each build in 3D, step by step. It works offline, and nothing leaves the device.
Jordan owns it and decides scope.

## Start here
1. Read `plans/README.md` (it says which plan is in progress or waiting; the latest done are
   `2026-10-10-make-your-own.md`, 5.0–5.2, `2026-10-09-truck-runs-autobuild.md`, 4.0–4.2, and `2026-10-09-set-colours.md`, 4.3), and
   `plans/2026-10-08-sound-structures.md` (the rules every build follows). **The last row of a plan's build log says
   what is next.**
2. Read `PRODUCT.md` (age bands, Monster trucks), `DESIGN.md`, `web/src/engine/README.md` (checker rules R1–R14) and
   `CHANGELOG.md`.
3. Check out the branch the build log names, or start a new one from `main`. Run the checks below before changing
   anything.

## Rules Jordan has set (always)
- **Never commit keys or secrets.** CI scans for `21st_sk_[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}`. A 21st API key was once
  pasted in chat: never write it anywhere.
- **No real children's names or photos, and no analytics.** Nothing leaves the device.
- **Plans first.** Work beyond what Jordan approved goes into a plan in `plans/` and waits for his go. Ask (with a
  question tool) when a choice is his. Keep the plan's build log current in the same commit as the work, and add a line
  to `plans/CHANGELOG.md` when a plan changes.
- **Every source file is 500 lines or fewer** (`npm run size`). Split project files (`trucks-1.ts`, `trucks-2.ts`, …).
- **Agents and workflows:** Jordan allowed agents for the big batches ("run agents if you need to"). Earlier he said
  "no workflows". Use the Agent tool only, not the Workflow tool, unless he asks.
- **Shipping:** open a draft PR, subscribe to its activity, merge (squash) once CI is green, then confirm the
  `pages.yml` run on main succeeded. github.io can't be reached from the cloud sandbox; check the Actions run instead.
  Then tell Jordan in plain words what changed.
- **Shapes:** use the big squares (Jordan calls them "the 4x4s") and the triangles inventively, not just grids of small
  squares.
- **Look at what you make:** render `npm run pictures`, make a contact sheet of every new picture (with `sharp`, loaded
  via `createRequire` from `web/package.json`, saved in the scratchpad) and look at it. Fix shapes that read badly.

## Checks (all must pass before a push; CI runs the same)
```
cd web
npm test                      # unit tests (vitest)
npm run check:projects        # every project passes the checker (R1–R11), under every brand's tall-triangle leg
npm run check:physics         # R14: every build stands in the physics (simulates only changed builds; --cold for all)
npm run size                  # 500-line limit
npx tsc -b                    # types
npm run build                 # build and precache
npx playwright test --workers=2   # e2e, with screenshot plates in e2e/plates (update only after looking at them)
cd .. && python -m pytest -q tests/test_tokens.py
grep -rEl '21st_sk_[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}' --exclude-dir=node_modules --exclude-dir=.git .   # must find nothing
```
After changing any project, run `npm run projects` to regenerate `public/projects/*.json` and
`src/projects/catalog.json` (a test fails if they are stale). Then run `npm run pictures`, which regenerates
`public/pictures/` and its manifest. The pictures run takes minutes and deletes the folder first. If it is interrupted,
restore with `git checkout -- web/public/pictures` and run it again. Only the changed projects' pictures and
`manifest.json` should differ.

## How projects work
- A project is data: tiles placed in 3D (`pos`, `rot` = [tilt about the base edge, turn about vertical]) and steps.
  It is written with `Builder` (`web/src/projects/helpers.ts`) and proved by the checker (`web/src/engine/check.ts`,
  `hold.ts` R10, `ramps.ts` R11).
- Units are square edges (a small square is about 7.5 cm). y is up, and the child looks from +z.
- **Age bands:**
  - `t` 0–3 (built by a grown-up; flat mosaics are shown from above);
  - `a` 3–5 (one tile a step; simple words);
  - `b` 6–8;
  - `c` 9–10;
  - `d` 11–16.

  Rules are in `engine/ages.ts`: `AGE_RULES`, and `TRUCK_RULES` for theme `trucks`, chosen by `rulesFor`. Stars go by
  size within the band.
- **Kits:**
  - `kit.ts` / `studio.ts`: buildings and shapes for the older ages;
  - `tots-kit.ts`: mosaics: `squareMosaic`, with tokens `R`, `R+` (big square), `RY/` and `RY\` (corner halves);
    `triangleMosaic` and `triangleRows`; `points` (triangles off edges); `bigCells`; `bigCube` and `bigTunnel`;
  - flower builds (`flowers-1.ts` … `flowers-5.ts`, theme `flowers`): flat pictures with tots-kit, potted flowers with
    closed heads (pyramids), bouquets whose stems share walls;
  - `track-kit.ts`: Monster trucks: 30° `ramp` with support towers, `kicker`, `tower`, `bigTower` (8 high),
    `lane`, `crushCar`, `fence`, `dominoes`, `crashWall`, `arenaWall`, `tunnel`.
- **Roles:** `roof` (pyramid triangles), `ramp` (R11), `brace` (locks a ramp join in a triangle; `ramp()` adds them),
  `crash` (built to fall: skips R10a–b, but keeps R10c, so it stands until hit).
- **Sets** (`engine/sets.ts`):
  - Magna 100: 50 squares, 4 big, 20 triangles, 11 corner, 15 tall;
  - Picasso 100: 8 big;
  - Connetix: adds windows, doors, rectangles and fences.

  Matching ignores colour. Builds must fit the budget their tests set.
- **Library** (`web/src/screens/Library.tsx`):
  - an age picker;
  - a theme filter (`engine/themes.ts`, with icons in `ui/ThemeIcon.tsx`);
  - shelves by age, then a Monster trucks shelf and a Wildflowers shelf (`SECTIONS` in `engine/themes.ts`).

  Cards draw 12 at a time.
- **Colours:** design builds in red, orange, yellow, green, blue and purple only (no white, pink or brown). Say so when
  a real thing's colour isn't available. The app also knows light blue (`sky`) and pink, because PicassoTiles makes
  them: a family's builds are recoloured to its tiles' colours (`engine/recolour.ts`, 4.3), never designed in them.

## Gotchas learned
- **Builds must stand like real tiles (2.8).** Every magnet join is a hinge. No ramp join in mid-air (R11); crash walls
  have corners; R12: at every height a structure is at most 4× (trucks) or 6× (others) as tall as it is
  wide (every project since 2.8.2); truck decks rest on two opposite edges. Use the kit (`ramp`, `tower`, `crashWall`), which does this for you.
- **On this Mac (Node 26):** run unit tests with `NODE_OPTIONS=--no-experimental-webstorage` (Node's own
  `localStorage` hides jsdom's), and `npm run pictures` / Playwright with `NODE_OPTIONS=--dns-result-order=ipv4first`
  (Vite binds IPv6 localhost). CI uses Node 22 and needs neither. Pictures drawn here differ slightly from CI's, so
  restore every picture whose project didn't change. Python tests: `uv run --no-project --with-requirements
  design/requirements.txt python -m pytest -q tests`.
- Floating-point: round sizes before passing them to `Builder.room` (the √3 offsets of ramps produce 0.9999… and
  1.0000…2).
- R5 counts how high a tile reaches, tile by tile within a step: a big square standing up is two layers.
- A wall alone on the table fails R6 unless it's `crash`. A step whose walls only stand together (a tunnel: walls and
  roof) must be one step.
- E2e locators: shelves render lazily (12 cards), so use `swipeTo` from `e2e/helpers.ts` to reach later cards. Titles
  must be unique (a test checks).
- Commit trailers come from the session's attribution reminder. Don't put model names in commits or PRs.
