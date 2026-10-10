# Pip, made new: a cute, original 3D friend (5.3)

Status: approved 10 Oct 2026, in progress. Three gates inside it are Jordan's (G-P1 to G-P3): nothing reaches the app
before G-P3.

## Context
Jordan, 10 Oct 2026, on Pip as he is (the 2D tile friend of 3.1/3.9/4.2.1):
- "1/10. Find repos with animation that will help you do this right." Then: "way more than this. Do a full skeptic
  pass and categorize for planning what it actually needs."
- After the skeptic pass (drawing, rig, craft, acting, 3D integration, sound, contexts, tech, process): "you are the
  expert. show me mocks." Mocks: A (2D redrawn) and B (3D, made of tiles, in the scene).
- He picked the animated test ("this"): Pip hops over, carries a tile, sets it down, cheers. Rendered in the app's
  stage (`pip-test.mp4`, 6.6 s).
- Then: "pip needs to be cuter and doesn't need to be shaped like that. let's make something original and well
  designed." And: "draft a plan no agents you only".

So: a new character, designed for cuteness first, living in the 3D scene, animated with craft. Designed and approved
before it is built.

## Decisions
| # | Question | Answer |
|---|---|---|
| P1 | 2D overlay or in the 3D scene | **In the 3D scene** (Jordan picked the animated test of the 3D direction): lit and shadowed like the tiles, on the table beside the build |
| P2 | Pip's look | **New and original**, cute first (Jordan: "doesn't need to be shaped like that"). Chosen at G-P1 from rendered concepts, then refined to a model sheet (G-P2) |
| P3 | How he's made and moved | **Code**: a procedural three.js rig (as the Pip truck, `three/truck/rig.ts`), moved by a small motion library of timelines and springs (as the test's `want`/`follow`). No editor, no download |
| P4 | Where first | **Build mode** (where he is on screen most), then the finish screen, Make your own, the truck runs |
| P5 | Who | **Me only**, no agents (Jordan) |
| P6 | Name | Keeps "Pip" unless Jordan says otherwise at G-P1 |

## What the code is today (read 10 Oct)
- `src/friend/`: `Friend.tsx` (the SVG tile friend: parts, poses, faces, 183 lines), `Pip.tsx` (DOM wrapper, flip by
  `scaleX(-1)`), `Guide.tsx` (373 lines: owns Pip in Build mode as a DOM overlay at 88 px; `TargetBus` gets the step's
  tiles' *screen* point from the 3D view; hop, toss, clap, comfort, sleep, wave, tips), `hop.ts` (`hopAt`, squash and
  toss keyframes), `pace.ts`, `tips.ts`, `sheet.tsx` (the character sheet on `#/design`).
- `app.css` `friend-*`: blink, breathe, ear and tail loops, the pose spring.
- Used by `screens/Build.tsx` (Guide), `screens/Done.tsx` (Pip cheering at 180/150 px), `screens/Design.tsx` (sheet),
  `screens/build/speeds.ts`.
- The pattern to follow for a 3D character: `three/truck/` (`buildTruck(palette())` builds geometry on the device,
  colours from the look's tokens, `setPose`, `setBlink`, `dispose`; `Truck.tsx` puts it in any canvas).
- Mocks so far (untracked, never committed): `web/mock-pip.html` + `src/mock-pip.tsx` (stills),
  `mock-pip-anim.html` + `src/mock-pip-anim.tsx` (the animated test, rendered with `window.__seek` frame by frame),
  `src/mock-pip-concepts.tsx` (the start of the concept round below).

## The shape of it
- **Design before code.** Concepts → model sheet → animatic, each looked at by Jordan.
- **Pip is a 3D actor in the build's scene**, not an overlay. He stands on the table beside the build, in world
  coordinates. He's lit, casts a shadow, and the build can hide him. He carries the step's real tiles and sets them
  where they go.
- **Motion is authored, not looped.**
  - Each beat is a clip: a timeline of targets, with springs for overlap and follow-through.
  - Every clip has anticipation, arcs, squash and stretch, and a settle.
  - Clips blend and can be interrupted. Each beat has two or three variants, so step 5 isn't step 1 again.
  - He reacts to taps, and his eyes follow the child's view.
- **Sound** for his moves, made on the device as the truck's are.

## Gates (Jordan's)
- **G-P1 · Concepts:** three or four original characters, rendered in the stage, each in five views (¾, front, side,
  happy, wow). Plus a line-up with a tile for scale. Jordan picks one, or mixes.
- **G-P2 · Model sheet:** the chosen one refined, shown as:
  - a turnaround, an expression sheet (eight faces) and a pose sheet (ten poses);
  - colours in all four looks, light and dark;
  - his size beside a build.
- **G-P3 · Animatic:** short rendered clips of the real beats:
  - hop over, carry, set the tile down, cheer (the test, redone with the new Pip);
  - idle, a tap reaction, "it fell" comfort, sleep and wake.

  Sent as videos at real and half speed.

## PR 5.3.0 · Concepts (~2 h, no app change)
**Goal:** G-P1.
1. Finish `mock-pip-concepts.tsx`. The cute rules apply to every concept: a big head (about 60% of his height), large
   eyes set low and wide, small features close together, short soft limbs, a soft pear silhouette, and one signature
   tie to the tiles. The concepts:
   - **A, a fox kit:** his ears' insides are tile glass.
   - **B, a glow sprite:** made of orange tile plastic with a light inside, with two tile-triangle ears.
   - **C, a round chick:** a crest of three tile triangles and a triangle beak.
   - **D, a fourth:** I'll pick whichever is stronger after looking at A–C.
2. Render a contact sheet of the views and the line-up, look at it, fix what reads badly, and send the board.

**Accept:** Jordan picks.
**Docs:** none in the repo (a mock); the build-log row.

## PR 5.3.1 · Model sheet and animatic (~4 h, no app change)
**Goal:** G-P2, then G-P3.
1. **The model:** the chosen concept as a clean rig module: named joints (root, hips, body, head, ears, arms, feet,
   tail), and faces as shapes (eyes, brows, mouth, cheeks). Colours come from the tokens, so all four looks work.
2. **The motion library (mock first):**
   - Clips from the test's `want`/`follow` pattern, made general: `idle`, `hopTo`, `carry`, `setDown`, `cheer`,
     `oops`/`comfort`, `wave`, `sleep`/`wake`, `look`, `tapped`.
   - Each clip has two or three variants.
   - Blending between clips; secondary motion (ears, tail, cheeks) on springs.
3. **Renders:** the sheets, then the animatic clips, sent as videos at real and half speed.

**Accept:** Jordan signs off G-P2, then G-P3. Changes asked for are made before 5.3.2.

## PR 5.3.2 · Pip in the app's 3D, and on #/design (~5 h)
**Goal:** the new Pip is a real part of the app, and the design page shows him.
1. `src/three/pip/`, built like `three/truck/`:
   - `rig.ts`: `buildPip(palette)`, `setPose`, `dispose`;
   - `geo.ts` and `face.ts`;
   - `Pip3D.tsx`: an R3F component.

   Geometry is made on the device; low tier gets fewer segments.
2. `src/friend/motion.ts`, the clip library:
   - pure and deterministic: a clip at time t gives a pose;
   - `play(clip, opts)` queues, blends and can be interrupted;
   - reduced motion: pose changes with no travel.
3. `#/design`: the new sheet replaces `sheet.tsx`'s SVG strip (a canvas of poses).

**Tests:**
- unit `motion.test.ts`:
  - every clip starts and ends at rest;
  - nothing goes NaN;
  - an interruption is continuous (no jump over 2 cm in a frame);
  - variants differ;
  - the same seed gives the same choice.
- unit: the rig builds and disposes every geometry and material.

**Accept:** a contact sheet from `#/design`, in four looks × light/dark.
**Docs:** DESIGN.md (Pip 5.3: the rig, the clips, the cute rules), build-log row.

## PR 5.3.3 · Build mode (~6 h)
**Goal:** Pip lives beside the build and helps, in the scene.
1. In Build mode's 3D view (`three/Viewer.tsx`), Pip stands on the table beside the model, on the side nearest the
   camera, clear of the build's footprint.
2. **Each Next:**
   - he picks up the step's real tiles from his spot and hops to where they go (world points from the step's tiles,
     not `TargetBus` screen points);
   - he sets them (the existing tile drop takes over as he lets go);
   - then he claps, or cheers when a layer is done, and goes back.
3. **Other beats:**
   - Back, a dot or All steps: he looks and points.
   - "It fell down": he comforts.
   - The rest screen: he sleeps, and wakes when the child comes back.
   - A tap on him: a reaction.
4. **Variety:** a seeded choice of variant per beat. **Eyes:** toward the camera at rest, toward the tiles while
   working.
5. Tips: the bubble follows his head's screen point.
6. Reduced motion: he stays put and points; tiles appear as now.
7. The DOM `Guide`/`Pip`/`Friend` and the `friend-*` CSS are removed once nothing uses them.
8. A tier budget: Pip costs under 2 ms a frame at the iPad tier.

**Tests:**
- e2e `build.spec`: steps still advance;
- `window.__pip` reports his clip and where he is;
- he never stands inside the build's footprint;
- reduced motion: he doesn't travel;
- axe passes.

Plates are updated after looking, from CI.

**Accept:** a recorded Build-mode session (three steps, a fall, a tap), sent to Jordan.
**Docs:** PRODUCT.md, DESIGN.md, CHANGELOG `5.3.0`, build-log row.

## PR 5.3.4 · Everywhere else, and his sounds (~4 h)
**Goal:** the same Pip wherever he appears.
1. **Finish screen:** a cheer sequence beside the finished build.
2. **Make your own:**
   - he reacts to "It fell!";
   - he cheers at four high;
   - he hops clear of the truck in a drive.
3. **Truck runs:** he watches from the side and cheers the crash.
4. **Sounds**, made on the device like `sound/truck.ts`: a hop "hup", a soft landing, a magnet click when a tile
   snaps, a cheer. All are silent when Sound effects is off.
5. **Looks:** each look tunes his materials (gloss, sheen).

**Tests:** e2e on each screen (he's there, axe passes, reduced motion); plates updated after looking.
**Accept:** a short video of each screen, sent to Jordan.
**Docs:** PRODUCT.md, DESIGN.md, CHANGELOG `5.3.x`, build-log row; the plan is done.

## Verification (each PR, then end to end)
- All repo checks (CLAUDE.md), with the usual `NODE_OPTIONS` on this Mac. 5.3.0 and 5.3.1 change no app code.
- Look at what I make: a contact sheet or a video at every step, looked at before it's sent.
- End to end on the live site (via the Actions run): build a project and watch Pip carry each step's tiles, knock a
  step down, tap him, let it rest. Then finish and see the cheer. Make your own: a fall, four high, a drive. A truck
  run. Reduced motion throughout.

## Risks and what we do
- **Cute is taste.** Three gates with renders and videos before the app changes; changes cost minutes in a mock.
- **A 3D Pip hides the build, or the build hides him.** Placement rules: beside the build, nearest the camera, clear
  of its footprint. He leans into view when the build would hide him.
- **Slower frames on an older iPad.** Tier-based segments, one draw call per material where it can be. The 2 ms
  budget is measured.
- **Too much motion for a small child.** Every clip settles. Idle stays small. Reduced motion is honoured. Tips stay
  in words.
- **Scope.** Build mode ships first (5.3.3); the rest waits for it.

## Estimate
| Work | Who | Hours |
|---|---|---|
| 5.3.0 Concepts (G-P1) | me | 2 |
| 5.3.1 Model sheet and animatic (G-P2, G-P3) | me | 4 |
| 5.3.2 Pip in the app's 3D, #/design | me | 5 |
| 5.3.3 Build mode | me | 6 |
| 5.3.4 Everywhere else, sounds | me | 4 |

About 21 hours of my work, plus Jordan's three looks.

## Build log (append, never rewrite)
| When (UTC) | PR · keys | Commit | Hours (est · used) | Result / re-evaluation | Next |
|---|---|---|---|---|---|
| 2026-10-10 | spec | — | — · 1.5 | Approved. Written after the skeptic pass, mocks A/B, the animated test (Jordan picked it), and "cuter … original and well designed". Concept file started. | 5.3.0 concepts |
| 2026-10-10 | 5.3.0 | — (mocks, not committed) | 2 · 1 | Four concepts rendered in the stage (`src/mock-pip-concepts.tsx`): A fox kit (tile-glass ears), B glow sprite (tile plastic, tile-triangle ears), C builder chick (tile-triangle crest), D magnet bun (horseshoe-magnet antenna). Looked at twice: the first round's eyes were far too small, the fox's muzzle hid its face, the sprite read as an egg in a hoop; fixed. Board sent. | G-P1: Jordan picks |
| 2026-10-10 | 5.3.0 | `design/pip/chick.py` | — · 1.5 | Jordan: the concepts "still feel like 1990s 3-D … looking for something that looks professionally finished". With his yes, Blender 5.2 installed (Homebrew). Concept C sculpted in Blender by script (`design/pip/chick.py`: one soft body of blended forms, sized exactly and every feature placed on the real surface; felt-like skin with a warm gradient, a cream tummy and painted blush; deep glossy eyes; tile-glass crest) and rendered in Cycles in a seamless studio. Looked at seven times (floating parts, washed-out colour, a blown backdrop, a dirty shadow, a horizon, bulging eyes); fixed. Sheet sent (hero, front, side, back, happy). | Jordan: is this the finish? Then the others to it, or C on to G-P2 |
