# Build helpers: Get your tiles, All steps, and Pip helps (3.7 · 3.8 · 3.9)

Status: approved 9 Oct 2026 ("make the plan detailed enough you can build it and deploy end to end without me"), in
progress

What started it: Jordan, 9 Oct 2026, on build mode: "I should be able to see all the steps for a project and scroll
through them to jump ahead or see and surf without having to go through next every time." Then, with a picture of
Pip: "also animate this guy and make him help with builds." Then: "There should also be a materials list when you
start a project." His answers: both a filmstrip and a slider, for everyone; all four kinds of help, Pip always a
little alive; the list at the start and on a button, by shape and colour with what's short.
## Context
Jordan, 2026-10-09, on build mode:
1. "There should also be a materials list when you start a project." → shown **at a fresh start and on a button**, by
   **shape and colour, with what's short**; it replaces today's short-of-tiles note (`NeedNote`).
2. "I should be able to see all the steps for a project and scroll through them to jump ahead or see and surf without
   having to go through next every time." → **a filmstrip and a scrub slider**, for **every age** (today only 9–10+ can
   jump, by tapping a dot: key 7e).
3. "Also animate this guy and make him help with builds." (Pip) → **all four**: shows where, hands over the tiles,
   reacts to the child, tips in a bubble; and **always a little alive**.
4. "Make the plan detailed enough you can build it and deploy end to end without me."

3.6 is merged (#42, `e8999e3`). Three PRs, in this order, each built, checked, shipped and confirmed without stopping.

## Running without Jordan (rules for this run)
- Approval of this plan is Jordan's go for all three PRs, for merging each when CI is green, and for turning on the
  app's auto-merge (squash) on each PR (`mcp__ccd_pr__set_auto_merge`) so it merges itself when CI passes.
- Any choice not settled here: take the simplest option that fits the plan, write it in the build-log row, keep going.
- Stop and report only if: a check still fails after three honest fix attempts; a fix would need a secret, a force
  push, or rewriting `main`; or CI fails in a way that local checks can't reproduce, twice.
- Never weaken a test or a checker rule to get green. Plates are updated only after looking at a contact sheet.
- The first PR writes the repo plan `plans/2026-10-09-build-helpers.md` (this content, in the repo's plan format,
  with a build log), adds it to `plans/README.md` ("Active plans", "Start here") and a line to `plans/CHANGELOG.md`.
  Every PR appends its build-log row in the same commit as the work.

## Shipping each PR (same for all three)
1. `git switch main && git pull`, then `git switch -c <branch>` (`helpers-3-7-tiles`, `helpers-3-8-steps`,
   `helpers-3-9-pip`). 3.8 may start on top of 3.7's branch while 3.7's CI runs; after 3.7 merges, `git rebase main`
   (no force-push to `main`; force-with-lease on the feature branch only if a rebase was needed).
2. All checks locally (from `web/`): `NODE_OPTIONS=--no-experimental-webstorage npm test`, `npm run check:projects`,
   `npm run size`, `npx tsc -b`, `npm run build`, `NODE_OPTIONS=--dns-result-order=ipv4first npx playwright test
   --workers=2`; from the root `uv run --no-project --with-requirements design/requirements.txt python -m pytest -q
   tests`; the key-scan grep. No project data changes, so no `npm run projects` / `pictures`.
3. Look: `NODE_OPTIONS=--dns-result-order=ipv4first npm run shots -- <look> 4180 <scratch> build-first,build-middle
   landscape,portrait,half` for classic, toy, book and studio (extend `SCREENS` in `scripts/shots.mjs` with the new
   states: `build-tiles` (the list), `build-steps` (the tray open)); make a contact sheet with sharp and read it; fix what
   reads badly. Run changed plates with `--update-snapshots` only for the tests whose screen changed, sheet them, look.
4. Commit (trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; no model names in the message), push,
   `gh pr create --draft` (body ends with the Claude Code line), `mcp__ccd_pr__get_status` (bind if needed),
   `set_monitor auto_fix`, `gh pr ready`, `set_auto_merge` (squash).
5. A `<ci-monitor-event>` failure → fix, verify locally, push. After merge: `gh run list --workflow pages.yml --branch
   main --limit 1` at the next natural pause; for the last PR, `gh run watch <id> --exit-status`. Append a "merged"
   row to the build log in the next PR (the last one gets a small docs PR, shipped the same way).
6. Tell Jordan in plain words what changed, and send him the contact sheets with SendUserFile (3.9: also a short
   video).

---

## PR 3.7 · Get your tiles (the materials list) · ~2.5 h

**Data** — `web/src/screens/build/stepTiles.ts`
- New `tilesOf(project, indices: number[], instead)`: the grouping loop now in `stepTiles` (shape, colour, instead,
  `SWAP_RATIO` counts). `stepTiles(project, step, instead)` = `tilesOf(project, project.steps[step].tiles, instead)`.
- New `allTiles(project, instead): { shape: ShapeId; tiles: StepTile[]; count: number }[]`: every placed tile via
  `tilesOf`, then grouped into rows by shape in the catalogue's order (`SHAPE_IDS` in `engine/catalog.ts`), colours in the order red, orange, yellow, green, blue, purple, then no colour.
- Unit test `stepTiles.test.ts`: for every project in `public/projects/*.json` (read with fs) the counts of
  `allTiles(p, {})` sum to `p.placed.length`; with the castle's Magna 100 swaps the spires show as 4 `tri-equilateral`
  marked instead; `stepTiles` results unchanged for the castle (snapshot of 3 steps).

**Screen** — new `web/src/screens/build/TileList.tsx` (NeedNote's place; `NeedNote.tsx` deleted, its strings kept)
- Props: `{ project, instead, leg, missing: Missing[], mode: "start" | "look", onStart, onPick, onClose }`.
- A dialog in the stage layer exactly where NeedNote sits today (`absolute inset-0 grid place-items-center
  bg-surface/70 p-4`, `role="dialog" aria-modal="false" aria-labelledby`), so the step panel stays above it and usable:
  any step move (Next, Back, a dot, the tray) also closes it (`go()` clears the gate).
- Card `ts-tile-list soft max-h-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg bg-surface-2 p-6`:
  1. Heading `h2` "Get your tiles" (`S.build.getTiles`), said on open with the usual `say()` (silent if voice off).
  2. The finished build's picture, 200×150 (`ProjectPicture id={project.id}`), left of the rows on landscape, above on
     narrow (`max-[760px]:flex-col`).
  3. One `<ul>` row per shape (`aria-label` = the shape's plural, e.g. "squares"); a `TileChip` per colour with its
     count, `speak`, `instead`; size `md`, or `sm` when the list has more than 12 chips.
  4. `S.build.total(n)` "24 tiles in all." (`tabular-nums`).
  5. When `missing.length`: the existing `S.build.needTitle(n)` line and missing chips (as NeedNote drew them).
  6. Buttons: mode `start` + missing → Pick another / Start anyway (existing strings; `ArrowLeft` / `Play`);
     mode `start`, nothing missing → one primary **Start** (`S.build.start`, `Play`, `tone="accent" primary`);
     mode `look` → **Back to building** (`S.build.backToBuilding`, `Check` icon, accent).
- `Build.tsx`: `gate` becomes `"tiles" | null`, and `listMode` `"start" | "look"`. On first open (the existing effect)
  set `gate = "tiles"` when the saved step is 0 (fresh or never moved); a resumed build skips it. `speak(step)` waits
  for Start, as now. `shown={gate === "tiles" && listMode === "start" ? 0 : shownAfter(...)}`. `go()` sets `gate=null`.
- **Tiles button** in the top bar: `KidBar` gets an optional `extra?: ReactNode` rendered after `hear`. Build passes a
  `KidButton label={S.build.tilesButton}` ("Tiles you need"), `showLabel={false}`, icon = a small blue square and
  yellow triangle (`TilePicture` px 22 each, as `EmptyState` draws them), `tone="plain"`, `speak`, class
  `ts-tiles-button`; it opens the list in `look` mode.
- `strings.ts` (`S.build`): `getTiles: "Get your tiles"`, `start: "Start"`, `backToBuilding: "Back to building"`,
  `tilesButton: "Tiles you need"`, `total: (n) => \`${n} ${n === 1 ? "tile" : "tiles"} in all.\``.
- Looks: no new look CSS needed (card uses `soft`, `bg-surface-2`, `ts-tile-list` hook); add one line per look only if
  the sheet shows it out of place.

**e2e**
- `e2e/helpers.ts`: `startBuild(page)`: waits for Next, then clicks "Start" or "Start anyway" if visible.
- `build.spec.ts`: rename "short of tiles…" to check the list: heading "Get your tiles", a "squares" row, the need
  line, Pick another, then Start anyway closes it. New test "a fresh build opens on its tiles": Picasso set, fish:
  heading visible, chips' counts add up to the fish's tile count (read the `TileChip` aria-labels), Start → "Step 1 of
  4", Next ×1, reload → no list; Tiles you need → list in look mode → Back to building closes it.
  Replace the `Start anyway` clicks with `startBuild`. Axe test unchanged (the list is up at fresh open: it must pass
  axe too).
- `looks.spec.ts`: build plate uses `startBuild`; new per-look test: the list passes axe (light), no plate.
- Plates that change: `build-*` (the new top-bar button), `look-*-build`; look, then update.
- `golive.spec.ts`, `shell.spec.ts`: unchanged (Next still works with the list up; titles unchanged). Run to confirm.

**Docs**: the repo plan + README + plans CHANGELOG; `PRODUCT.md` (build mode: the tiles list at the start and on a
button); `CHANGELOG.md`: add `## 3.7.0` (and one short catch-up entry `## 3.0–3.6` summarising looks, sound, Pip,
polish, since those were never logged there).

## PR 3.8 · All steps (the step browser) · ~3.5 h

**Jumping for every age** — `Build.tsx`: `<StepDots … onJump={go} />` for all ages; update its header comment and
`StepDots.tsx`'s ("a tap on a dot jumps there, every age since 3.8").

**The tray** — new `web/src/screens/build/StepTray.tsx`
- Opened by an **All steps** button in the top bar after the Tiles button (`KidButton label={S.build.allSteps}`
  "All steps", `showLabel={false}`, `GridFour` icon, `tone="plain"`, class `ts-steps-button`); `aria-expanded`.
- When open it replaces the dots and the step row inside the panel `aside` (Decor and Pip stay), so every look's
  `ts-panel` styles it. Props `{ project, leg, instead, step, preview, onPreview(i), onCommit(i), onClose }`.
- Layout (`ts-tray flex flex-col gap-3`):
  1. Header row: `h2` "All steps" (sr-visible), then `S.kid.step(preview+1, last+1)` big (`--fs-kid-label-b`,
     `tabular-nums`), right: **Build this step** (primary, `Play`, `S.build.buildThis`) and ✕ (`S.build.closeSteps`,
     "Close all steps", `X`/`ArrowLeft` icon from `ui/icons`; add `X` to the icon list if missing).
  2. Slider: `<input type="range" min=0 max=last step=1 value=preview class="ts-slider w-full">`,
     `aria-label="Choose a step"`, `aria-valuetext={S.kid.step(...)}`. Styled in `app.css`: `appearance:none`, track
     14 px `var(--line)` with the done part `var(--accent)` (a `--fill` custom property set inline as a %), thumb 56 px
     circle `var(--accent)` with a 4 px `var(--surface-2)` ring and the soft shadow; `::-webkit-` and `::-moz-` rules;
     `touch-action: none` so a drag never scrolls. Focus ring as other controls.
     Events: `onChange` (fires on every input) → `onPreview(v)`; `onPointerUp`, `onKeyUp`, `onBlur` →
     `onCommit(preview)`. `play("tap")` per step change, at most every 60 ms.
  3. Filmstrip: `<ol class="ts-filmstrip flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">`, one
     `<li class="snap-center">` per step with a `<button class="ts-step-card">` 140×105 picture + "Step 3" under it,
     `aria-label={S.kid.step(i+1,last+1)}`, `aria-current="step"` on the committed step; ring `ring-4 ring-accent` on
     the preview, `ring-2 ring-line` otherwise. Tap → `onPreview(i)` + `onCommit(i)`. When `preview` changes, the
     card scrolls to centre (`scrollIntoView({ inline: "center", block: "nearest", behavior: still ? "auto" :
     "smooth" })`). Cards `content-visibility: auto; contain-intrinsic-size: 140px 130px`.
- Pictures: `web/src/ui/ProjectPicture.tsx`: `drawProject` keeps each polygon's tile `index` in `Drawn`. New
  `StepDrawing({ drawn, box, upto, strong: Set<number> })`: polygons with `index < upto`; `strong` ones at fill 0.85
  and stroke 3 in their own rim colour, the rest fill 0.3 / stroke 1.5; the same 4:3 frame code as `ProjectDrawing`
  around the **finished** box (shared helper `frameOf4x3(box)`), so cards don't jump. StepTray computes
  `drawProject(project, placed.length, leg, instead)` once (`useMemo`) and passes slices. (Largest: truck-spiral-ramp,
  50 steps; truck-bridge-to-bridge, 207 tiles: ≤ 10k polygons over all cards, drawn lazily.)
- `Build.tsx` state: `tray: boolean`, `preview: number | null`. The viewer shows `view = tray ? (preview ?? step) :
  step`: `shown={shownAfter(project, view)}`, `current={project.steps[view].tiles}`, `stepKey={view}`. Commit =
  `go(i)` when `i !== step` (saves, speaks, Pip). Build this step / ✕ → `tray=false`, `preview=null`. Opening the tray
  closes the tiles list. The rest timer still runs (a pointerdown wakes).
- `web/src/three/Viewer.tsx`: new prop `browse?: boolean`. When set: the Model gets `still={still || browse}` (tiles
  appear at once, no ghost wait; the step's tiles keep their steady glow); `built` and `focus` use the whole model
  (`whole`), so `aim` and `distance` don't change while scrubbing; `CameraRig focusKey` stays at the value it had when
  browsing began (keep it in a ref). On close the camera eases to the step as usual.
- `strings.ts`: `allSteps: "All steps"`, `buildThis: "Build this step"`, `closeSteps: "Close all steps"`,
  `chooseStep: "Choose a step"`.
- Looks: the tray inherits `ts-panel`; add per look one small rule set for `.ts-slider` thumb/track and
  `.ts-step-card` (toy: glossy bevel like `.ts-button`; book: deckled paper card + pencil ring; studio: frosted card,
  blue ring; classic: the defaults). Keep each under ~10 lines.

**e2e** (`build.spec.ts`, `looks.spec.ts`)
- "every age can jump by a dot": fish (age a): click "Step 3 of 4" → list "Step 3 of 4" (replaces the 9–10 test).
- "All steps: the slider previews in 3D and letting go keeps the step": castle, `startBuild`, open All steps, focus
  the slider, press ArrowRight ×6 → the header shows "Step 7 of 21" and `window.__viewer` shows the preview (add
  `shown: () => n` to the `__viewer` debug object), keyup commits → `savedStep(page,"castle",6)`; drag with the mouse
  from the thumb to 90% → "Step 19 of 21"-ish (assert > 15); Build this step → dots list "Step N of 21".
- "All steps: tapping a card jumps": tap "Step 12 of 21" card → saved 11; tray stays open; ✕ closes.
- Axe with the tray open, in every look (looks.spec). Plates: one new `build-castle-steps-light.png` (tray open,
  classic) after looking; `look-*-build` plates change only via the top bar.

**Docs**: build-log row; `PRODUCT.md` (jumping for every age, All steps); `CHANGELOG.md` `## 3.8.0`.

## PR 3.9 · Pip helps · ~6 h

**New poses** — `web/src/friend/Friend.tsx` (move pose parts to `friend/poses.tsx` if the file passes ~350 lines)
- `FriendPose` adds `"hold" | "clap" | "wave" | "comfort" | "look" | "sleep"`; `FRIEND_POSES` lists all 11.
  - `hold`: both arms rotated up (−70°/70° about the shoulders), eyes up (dy −3), open smile; the held tiles are drawn
    by `Pip` above his head, not in the SVG.
  - `clap`: arms meeting in front of the body (two green tiles touching at x≈100, y≈126), happy eyes, two short orange
    burst lines.
  - `wave`: right arm up (−120°), left at rest, a small motion arc beside the hand.
  - `comfort`: head tilted 6°, soft eyes (dy 2), small smile, right arm forward low (a pat).
  - `look`: like idle, plus `gaze?: -1 | 0 | 1` on `Friend` shifting the pupils dx ±4.
  - `sleep`: eyes as closed arcs (HappyEye flipped), mouth a small "o", a blue "z" square pair rising top-right.
- Named groups for life: wrap eyes in `<g className="friend-eyes">`, each ear in `friend-ear`, body+face in
  `friend-body`; `friend-tail` exists.
- `friend/sheet.tsx`: shows all 11 poses (the `#/design` row note becomes "eleven poses"); the `design-*` plate
  changes: look, then update.

**Always a little alive** — `Pip.tsx` + `app.css`
- `Pip` gets `alive?: boolean` (default true) and passes `className="friend-alive"` to `Friend` when `alive && !still`.
- `app.css` (all `transform-box: fill-box`, transforms only):
  - blink `.friend-alive .friend-eyes { transform-origin: center; animation: friend-blink 4.6s infinite; }`
    keyframes 0–95% `scaleY(1)`, 97% `scaleY(.08)`, 99% `scaleY(1)`; second eye group none (one group blinks both).
  - breathe `.friend-alive .friend-body { transform-origin: 50% 100%; animation: friend-breathe 3.2s ease-in-out
    infinite; }` `scale(1, 1.018)` at 50%.
  - ears `.friend-alive .friend-ear { transform-origin: 50% 100%; animation: friend-ear 7.3s infinite; }` a ±6° twitch
    in the last 4% of the cycle; the right ear `animation-delay: -2.1s`.
  - tail `.friend-alive .friend-tail { transform-origin: 0% 100%; animation: friend-tail 5.5s ease-in-out infinite; }`
    rotate 0 → 9° → 0 over 92–100%.
  - `@media (prefers-reduced-motion: reduce) { .friend-alive * { animation: none !important; } }`.
- Off on the rest screen (`resting` → Pip `alive={false}`, pose `sleep`), and on the `#/design` sheet (`Friend`
  alone, never alive), so plates stay stable (Playwright already runs with reduced motion).
- Update `Pip.tsx`'s header comment and `DESIGN.md`'s motion rule: Pip's idle life is DOM-only and allowed; the 3D view
  still never draws for it.

**Pip moves in build mode** — new `web/src/friend/Guide.tsx` (owns Pip in `Build.tsx`; `useStepPose` is removed)
- Rendered once in `Build`'s `main` as `<div class="ts-guide pointer-events-none absolute inset-0 z-[5]">`, with Pip
  (88 px) absolutely positioned by `translate` (WAAPI), not inside the panel any more. **Home** = the spot used today
  (panel top − 76 px, panel right − 40 − 88 px), read from the panel's rect (`stripRef`) on mount, resize and step.
- Props: `{ step, arrival: "next" | "jump" | "open", tiles: StepTile[], leg, tip: TipKind | null, tray, gaze, falling,
  resting, landed: number, finishesLayer: boolean, targetRef }`.
- **Target**: `Viewer` gets `onTarget?: (x: number, y: number, seen: boolean) => void`. Inside `Model`'s group (which
  sits in the turntable) a `<StepTarget point={frameOf(project, leg, current).middle} onTarget>` object projects its
  world position each drawn frame (`getWorldPosition`, `.project(camera)`, to canvas px from `size`), and calls back
  only when it moved > 0.5 px. `seen` = inside the clear area (below the top bar, above the panel). Guide stores it in
  a ref and, while Pip is at the spot, writes `el.style.translate` directly (follows turns and camera eases; no React
  render). Not seen → Pip stays home and points toward it.
- **Sequence for `arrival: "next"`** (motion on), timings in `friend/timing.ts`:
  | t (ms) | Pip | 3D |
  |---|---|---|
  | 0 | pose `hold`, the step's tiles above his head (`TilePicture` 28 px, up to 3, then "+N"), hops from where he is to beside the target (x − 70 px, or + 70 px when the target is left of 30% of the width, flipped to face it): 600 ms arc (outer `translate`, inner `translateY` 0 → −36 px → 0) | ghost outline shows at once |
  | 900 | toss: held tiles fly to the target (`translate` + `scale .4`, opacity → 0, 300 ms); pose `point` | the tiles start dropping (Model `hold` = 0.9 s) |
  | land (`landed` bumps) | pose `clap`, or `cheer` (small, `pip-hop` once) when `finishesLayer` | — |
  | land + 900 | hops home (500 ms); a tip bubble opens if there is one | — |
  | home | `idle` (alive) | — |
  `arrival: "jump"` (Back, a dot, the tray, Build this step): hop to the spot, `point` 1.6 s, hop home; no toss,
  no clap. `arrival: "open"` (first open / after Start): point from home for 2 s. A new step mid-sequence:
  `animation.commitStyles(); animation.cancel()` for every running animation, start the new one from where he is.
- **Model hold** — `three/Model.tsx`: new prop `hold?: number` (seconds) replacing the `GHOST_S` constant in
  `waiting` (default `GHOST_S`, 0.45). `Viewer` passes it through. `Build` passes `hold={guided ? 0.9 : undefined}`
  where `guided = !still && arrival === "next"`.
- **Landing**: `Viewer` gets `onRest?: () => void`, called from its existing `rest` callback; `Build` bumps
  `landed` on the first rest after each step change (a ref flag), which Guide reads.
- **Reacts**: tray open → pose `look` at home with `gaze` = sign of the last preview change (reset to 0 after 600 ms);
  "It fell down" open → hop home, pose `comfort`; resting → pose `sleep`, not alive; waking → `wave` 1.2 s then
  `idle`; `finishesLayer` = `stepLayers[step + 1] > stepLayers[step]` or the last step (`stepLayers` exists in Build).
- **Reduced motion** (`useStill`): no hops, no toss, no life; Pip stays home: `point` for 2 s each step, then `idle`;
  tips still show; Model `hold` default.

**Tips** — new `web/src/friend/tips.ts` (+ `tips.test.ts`)
- `type TipKind = "crash" | "brace" | "ramp" | "roof" | "bigStand" | "layer3"`.
- `tipsByStep(project, leg): Map<number, TipKind>`: walk the steps in order; for each step, its candidate kinds from
  its tiles: `role === "crash"`, `"brace"`, `"ramp"`, `"roof"`; `shape === "square-large"` with tilt
  `Math.abs(rot[0]) < 1e-3` (standing); `layer3` = the step's lowest layer (`layerOf(worldPolygon(...))`, as
  `stepLayers`) is ≥ 2 for the first time. Priority crash > brace > ramp > roof > bigStand > layer3; each kind is given
  only to the first step that has it, at most one tip a step. Age `t` → empty map.
- Words in `strings.ts` `S.friend.tips`: crash "This wall is built to fall. Crash into it!"; brace "This square locks
  the ramp, so it can't fold."; ramp "A ramp leans on its tower. Push it in until it clicks."; roof "Hold the walls
  steady while the roof goes on."; bigStand "Big squares are heavy. Hold it until the next tile clicks on."; layer3
  "Going up! Finish each layer all the way round first."
- Shown: a bubble (`ts-bubble`, `role="note"`, `aria-live="polite"`) anchored above Pip at home, max-w 280 px,
  `font-kid` `--fs-kid-label-c`, a small tail toward Pip; open 5 s after he gets home, or until the next step / a tap
  on it. Spoken: `speak(s)` says `lineOf(s)` + " " + the tip when the step has one (one utterance, so `say()`'s
  `cancel()` doesn't cut the line). "Hear again" says the same. Looks: one rule per look for `.ts-bubble` (toy
  bevel, book paper + pencil outline, studio frosted).
- Unit tests: castle → `roof` on the first roof step only; a truck with a ramp (`truck-first-jump` or the first
  project whose placed has role ramp) → `ramp` and `brace`; a crash wall build → `crash` first; a 0–3 build → none;
  never two tips on one step; every kind at most once.

**e2e** (new `e2e/pip.spec.ts`, motion on via `test.use({ contextOptions: { reducedMotion: "no-preference" } })`)
- "Pip goes to the new tiles and comes back": castle, startBuild, record Pip's box (`.ts-guide .ts-pip`), Next, poll
  until his box centre moves > 80 px, then until it is back within 4 px of home.
- "the roof step shows its tip": jump by dot to the first roof step → the note with "Hold the walls steady…" visible.
- "with motion reduced Pip stays home" (default config): Next → his box never moves (sample 1.5 s).
- "Pip's idle life never makes the 3D view draw": motion on, castle at rest (`settled` helper from viewer.spec moved
  to helpers.ts), `__viewer.frames()` unchanged over 3 s while `.friend-alive` is present.
- Perf (manual, scratch script from 3.6 with Metal): stepping the castle 10× with Pip guiding: no frame > 50 ms
  after start-up; recorded in the build log.
- Video for Jordan: Playwright `recordVideo` of the castle's first 6 steps (toy look, landscape), sent with
  SendUserFile, plus the new pose sheet.

**Docs**: build-log rows (3.9, and "3.9 merged" in a final docs-only PR); `PRODUCT.md` (Pip helps: where, the tiles,
reactions, tips); `DESIGN.md` (Pip's life, the motion rule); `CHANGELOG.md` `## 3.9.0`; plan status "done" in
`plans/README.md`.

---

## Files (main)
- `web/src/screens/Build.tsx` (wiring; must stay ≤ 500 lines: the list, tray and guide live in their own files)
- `web/src/screens/build/{TileList,StepTray}.tsx` (new), `stepTiles.ts`, `NeedNote.tsx` (removed)
- `web/src/ui/ProjectPicture.tsx`, `ui/kid/{KidBar,StepDots}.tsx`, `ui/icons.ts`
- `web/src/three/{Viewer,Model}.tsx`
- `web/src/friend/{Friend,poses,Pip,Guide,tips,timing}.ts(x)`, `friend/sheet.tsx`
- `web/src/app.css`, `web/src/strings.ts`, `web/src/looks/*/look.css` (a few lines each)
- `web/e2e/{build,looks,pip}.spec.ts`, `e2e/helpers.ts`, `scripts/shots.mjs`, plates
- `plans/2026-10-09-build-helpers.md` (new), `plans/README.md`, `plans/CHANGELOG.md`, `CHANGELOG.md`, `PRODUCT.md`,
  `DESIGN.md`

## Reused, not rewritten
`stepTiles`/`shownAfter`/`swapsByStep` (`screens/build/stepTiles.ts`), `matchProject`/`SWAP_RATIO`
(`engine/match.ts`), `TileChip`/`TilePicture` (`ui/TileChip.tsx`), `drawProject` (`ui/ProjectPicture.tsx`),
`frameOf` (`three/Model.tsx`), the `window.__viewer` debug object (`three/Viewer.tsx`), `layerOf`/`worldPolygon` (`engine/geometry.ts`), `KidButton`, `useStill`
(`ui/motion.ts`), `say`/`play`, `Decor`, the `ts-*` hook-class system for looks, `savedStep`/`useSet`/`swipeTo` e2e
helpers, `npm run shots` and the sharp contact-sheet step.

## Verification (end to end)
- Each PR: every repo check green locally and in CI; shots of the new states in all four looks × light/dark ×
  landscape/portrait/half looked at; changed plates looked at before updating; axe passes on the list, the tray and
  the tip bubble in every look.
- Behaviour, by e2e: a fresh build opens on its tiles and a resumed one doesn't; counts add up; the slider previews
  and commits, cards jump, every age can tap a dot; Pip travels and returns, tips show once, reduced motion keeps him
  home, his idle life never redraws the 3D view.
- After each merge: the `pages.yml` run on main succeeded.
- Final message to Jordan: what changed in plain words, the contact sheets, the pose sheet and the video.

## Build log (append, never rewrite)
| When (UTC) | PR · keys | Commit | Hours (est · used) | Result / re-evaluation | Next |
|---|---|---|---|---|---|
| 2026-10-09 | plan | — | — · 1 | Questions asked and answered (above); plan approved, to run end to end. 3.6 merged (`e8999e3`, #42), `pages.yml` green. | 3.7 |
| 2026-10-09 | 3.7 · Get your tiles | (this commit) | 2.5 · about 1.5 | `allTiles` (rows by shape, chips by colour, swaps as what stands in; a test over all 445 builds: the counts add up). `TileList` replaces NeedNote: the finished build's picture, the rows, the total, what's short with Start anyway / Pick another, else Start; reopened from a new "Tiles you need" button in the top bar, with Back to building. A fresh build (saved step 0) opens on it; any step move closes it. Looked at in all four looks, light and dark, landscape, portrait and Split View: the Start button was cut off when the list was long (the buttons now stay in view and only the tiles scroll); in Split View there was no room for the tiles (the picture is dropped there); in portrait the card ran under the turn buttons (side margins). Axe: the scrolling tiles became a focusable region. Plates: the build plates gain the top-bar button (looked at). All checks green. | 3.8 |
| 2026-10-09 | 3.7 merged | `f07cccd` (#43) | — | CI green, merged by hand (the repo doesn't allow auto-merge; turning it on is a repo setting, left to Jordan). | 3.8 |
| 2026-10-09 | 3.8 · All steps | (this commit) | 3.5 · about 2 | Every age can tap a dot to jump. An All steps button in the top bar opens a tray in the step panel's place: "Step N of M", a slider (the 3D model builds and unbuilds as it moves; letting go keeps the step and says it), a filmstrip of little drawings, one a step (this step's tiles strong, the rest faint, all framed round the finished build), and Build this step. While it is open the view holds on the whole build (`browse`), so scrubbing doesn't swing the camera. Looked at in all four looks, light and dark, landscape, portrait and Split View: the filmstrip opened on step 1, not the step shown (its items shrank before they were drawn, so there was nothing to scroll yet; fixed with `shrink-0` and a scroll a frame later). The looks' own tokens style the tray well, so no per-look CSS was needed. Plates: the top bar's new button, and one of the tray (classic). All checks green. | 3.9 |
| 2026-10-09 | 3.9 · Pip helps | (this commit) | 6 · about 2.5 | Six new poses (hold, clap, wave, comfort, look, sleep), looked at on the sheet; idle life in CSS (blink, breathe, ears, tail). `Guide.tsx` moves him: with Next he carries the step's tiles over (the Model's `hold`, 0.9 s), tosses them in, claps or cheers when they land (`onRest`), hops home; a jump sends him to point; All steps, a fall and the rest screen bring him home to look, comfort or sleep. The Viewer reports where the step's tiles are on screen (`onTarget`, a marker in the turntable, read after the camera rig each drawn frame). Tips from the tiles' own roles (`tips.ts`, tested over all 445 builds), in a bubble and said with the step. Fixes found by looking: his first hop aimed at the last step's tiles (the view hadn't drawn the new step: he now waits up to 0.5 s for them to come into sight, then re-aims on landing); in portrait he came home to an old place (home read from a ref); he stood in front of the new tiles and behind the turn buttons (further aside, clear of the right column). Measured on the Mac's GPU (Metal), toy look, 12 steps with Pip guiding: no frame over 50 ms; and his idle life never makes the 3D view draw (a test). `timing.ts` from the plan is the constants at the top of `Guide.tsx`. All checks green. | Merge; then Jordan tries it (and G2: the three looks) |

