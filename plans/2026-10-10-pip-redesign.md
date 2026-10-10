# Pip, made new: a cute, original 3D friend (5.3)

Status: approved 10 Oct 2026, in progress. Three gates inside it are Jordan's (G-P1 to G-P3): nothing reaches the app
before G-P3. Added and approved 10 Oct 2026: 5.3.5 (the characters made app-ready) and phase 5.4 (one new look for
the whole app, replacing the four looks; gate G-S1 is sent, not waited on). See the addendum below.

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

## Addendum (10 Oct, approved and keyed): one new look, and the characters made app-ready (5.3.5, 5.4)
Renamed: 5.3.1a is now PR 5.3.5. Drafts opened: #63–#67. G-S0 (downloads): Jordan, "you have my approval for downloads". Deadline set by Jordan at 19:03 UTC: "you have 2 hours. Do not cut corners … It's okay to have unfinished work".

### Context
- **What Jordan asked (10 Oct):**
  - "write the plan phase for tiles and background";
  - "add this to the plan" (the finished look's weak points: models too heavy, no skeletons, flecks and a mark);
  - "make it detailed and estimate the amount of effort each task will require. plan to run this end to end yourself";
  - "The looks all suck redo them and wow me. just 1 is needed if it's good";
  - "Send it, keep going";
  - and now: "can you key every item in this plan first actually I want to make sure we stay on track".
- **The outcome:**
  - Tile Steps has **one look**, carried into every screen, 3D and 2D: soft satin vinyl, tile glass that glows, a real
    wood table, a real room out of focus, warm light with coloured rims. The four looks and the picker go.
  - The characters become light, rigged models ready for the iPad.
- **How it runs:** I do it alone, end to end (no agents, no workflows), one key at a time in this order.
- **Renamed:** "5.3.1a" becomes **PR 5.3.5**, so that every pull request has its own number and branch from `main`.

### Decisions
| # | Question | Answer |
|---|---|---|
| L1 | Looks | **One look**, replacing all four (Jordan). The picker leaves Settings and the first-run card. A family's saved look is ignored, then cleared |
| L2 | In code | One folder, `looks/vinyl/`, keeping the folder contract (`look.css`, `stage.ts`, `sounds.ts`, `decor.tsx`). The registries become direct imports; `LookId` and the switching code go |
| L3 | The room | A real room, strongly out of focus, from a CC0 Poly Haven HDRI. I pick the best at G-S1, send the sheet, and keep going (Jordan: "Send it, keep going"). **Picked (5.4.0g): `empty_play_room`, turned 90°, on a pale maple table** (Poly Haven's wood lifted to maple: the boards' playroom; walnut was richer but darker). Sheets sent 10 Oct |
| L4 | Assets | CC0 only, bundled and precached; nothing is fetched at run time and nothing leaves the device. Downloads wait for Jordan's yes (G-S0) |
| G-P1 | Which characters | **All three** (Jordan, 10 Oct: "all of then"): the snail, the dino and the axolotl |
| P3′ | Characters | Image to 3D, then finished by hand (weld, retopology, bake, skeleton, face shapes → small GLB). Replaces P3 for the characters Jordan keeps |

### Phases, pull requests and keys
Every key's stop point is 1.5 × its estimate (`plans/README.md`). "GitHub #" is filled when the drafts are opened (key
P2).

#### Phase 0 · Plan

**PR 5.3 · the plan · branch `pip-5-3` · GitHub #62**

| # | What | Files | Kind | Done when | Time | Stop |
|---|------|-------|------|-----------|------|------|
| P1 | The unkeyed plan written and committed | `plans/2026-10-10-pip-redesign.md`, `CHANGELOG.md`, `README.md`, `2026-10-08-design-polish.md` | document | committed 5119404 | 0.6 h | done |
| P2 | This keyed version replaces the addendum. Draft PRs 5.3.5 and 5.4.0–5.4.3 opened (empty commit, "PR n.n · ", "Not started" with keys), and their numbers written here | same | document · setup | five drafts open; numbers in the headings below; CHANGELOG line | 0.4 h | 0.6 h |
| **G-S0** | **Jordan's yes on the downloads**: `empty_play_room` (1.59 MB), `lebombo` (1.48 MB), `photo_studio_loft_hall` (1.64 MB), all 1K `.hdr` from dl.polyhaven.org (CC0). The wood and the photo studio are already on this Mac | | gate | his words are in Decisions | | |

#### Phase 1 · The one look, designed (no app change)

**PR 5.4.0 · look development, 3D and 2D · branch `look-5-4-0` · GitHub #63**

| # | What | Files | Kind | Done when | Time | Stop |
|---|------|-------|------|-----------|------|------|
| 5.4.0a | Downloads (after G-S0), each in its own folder. The 1K wood and the 1K photo studio made from the 2K files here | scratchpad `assets/` | setup | files present; sizes logged | 0.3 h | 0.45 h |
| 5.4.0b | Convert: maps to KTX2 or WebP at 1K; HDRIs as 1K `.hdr` plus 512 for mid tier | `design/set/convert.py` | code | the total for one room ≤ 3 MB, printed | 0.5 h | 0.75 h |
| 5.4.0c | Art direction for 2D: about 12 mflux boards (Library shelf, project card, kid button, age picker, Build tray, step dots, Done), the best picked, distilled into written rules (materials, radii, shadows, type, colour, motion) | `design/set/boards.md`, scratchpad images | design | a board sheet and the rules page, both looked at | 1.5 h | 2.25 h |
| 5.4.0d | 3D mock stage: real projects with the app's tile code.<br>• HDRI via PMREM;<br>• `backgroundBlurriness` ≈ 0.35;<br>• a finite wood table with a rounded edge;<br>• a warm key with a soft shadow (high tier only) and two coloured rims | `web/mock-set.html`, `src/mock-set.tsx` (untracked) | design | renders a house, a truck course and a flower in each room | 2 h | 3 h |
| 5.4.0e | Tile finish by tier, in the mock.<br>**Frame:** roughness 0.42, clearcoat 0.4 / 0.15, `BEVEL` about 0.022.<br>**Face:**<br>• high: transmission 1, thickness 0.1, attenuation = tile colour;<br>• mid: opacity with emissive and sheen;<br>• low: as today | same mock | design | a side-by-side of today and new at the three tiers, looked at | 1.5 h | 2.25 h |
| 5.4.0f | 2D mock: Library and Build in the new style over the room plate, using the real components' markup, light and dark | `web/mock-look.html` (untracked) | design | four screenshots (2 screens × light and dark), looked at | 2 h | 3 h |
| 5.4.0g | The G-S1 sheet and frame times. Today ↔ new: 3 builds × 3 rooms × light and dark × 3 tiers, plus the 2D mocks and one Blender render of the house as the bar. `FrameWatch` times per tier | `design/set/README.md` (how it was made), build log | check | the sheet sent to Jordan; the room picked and written in L3 | 1.2 h | 1.8 h |
| **G-S1** | **Jordan sees the set** (sent, not waited on) | | gate | sent; any redirect from him goes into Decisions | | |

PR 5.4.0 merges the scripts and docs only (the mocks stay untracked): 9 h.

#### Phase 2 · The one look, built

**PR 5.4.1 · the 3D set in the app · branch `look-5-4-1` · GitHub #64**

| # | What | Files | Kind | Done when | Time | Stop |
|---|------|-------|------|-----------|------|------|
| 5.4.1a | `StageLook` grows: `environment` (map and intensity), `floor.maps`, `backdrop` (blur, intensity), a table with an edge; string unions | `src/looks/stage.ts` | code | `tsc -b` green | 0.8 h | 1.2 h |
| 5.4.1b | Stage:<br>• the environment loaded once and cached, 512 on mid;<br>• the blurred backdrop;<br>• the edge table sized from `fogFor`'s reach, with no fog;<br>• shadows on high only;<br>• the software-GL path kept;<br>• `lightScene`'s signature kept | `src/three/Stage.tsx` | code | Build mode draws the set in the browser at all three tiers; no console errors | 1.5 h | 2.25 h |
| 5.4.1c | The tile finish of 5.4.0e, by `useTier`; `lite()` and the big-build tile unchanged; one material per colour and part | `src/three/TileMesh.tsx`, `tile.ts` | code | tile unit tests green; draw calls for a finished model ≤ today's + 2 | 1 h | 1.5 h |
| 5.4.1d | The vinyl stage: the picked room, the wood, the rims; dark is the same room in the evening | `src/looks/vinyl/stage.ts` | code | matches the G-S1 sheet, side by side | 0.7 h | 1.05 h |
| 5.4.1e | Assets offline: `public/set/` plus `CREDITS.md`; `hdr,ktx2` in the Workbox globs; a budget test ≤ 3 MB | `public/set/`, `vite.config.ts`, a test | code | the build precaches the set; the budget test green | 0.5 h | 0.75 h |
| 5.4.1f | Framing with an edge table: no edge seen from below, the room blurred at every zoom, `MOSAIC` still reads | `src/three/camera.ts` (if needed), `Viewer.tsx` | code | the camera unit tests green; 5 builds (small, tall, wide, mosaic, truck) checked at min and max zoom | 1 h | 1.5 h |
| 5.4.1g | Unit tests: no effects on low tier; every map named exists; maps disposed on unmount | `src/looks/looks.test.ts`, `three/*.test.ts` | check | `npm test` green | 0.7 h | 1.05 h |
| 5.4.1h | Pictures: `npm run pictures`; all 533 redrawn; a contact sheet looked at; chips read at 48 px | `public/pictures/` | check | the sheet looked at; the stale-picture test green | 1 h | 1.5 h |
| 5.4.1i | E2e (an offline reload check, axe); plates updated after looking; DESIGN.md, CHANGELOG `5.4.1`, build log; ship (draft → green CI → squash → `pages.yml` ok); a Build-mode video sent | `e2e/`, docs | check · live step | all CLAUDE.md checks green; `pages.yml` ok; video sent | 1.8 h | 2.7 h |

9 h.

**PR 5.4.2 · every screen in the new look · branch `look-5-4-2` · GitHub #65**

| # | What | Files | Kind | Done when | Time | Stop |
|---|------|-------|------|-----------|------|------|
| 5.4.2a | Room plates: 2732×2048, blurred and lightened, light and evening; WebP ≤ 250 KB each (budget test) | `design/set/plates.py`, `public/set/` | code | both plates looked at; budget test green | 1 h | 1.5 h |
| 5.4.2b | Tokens from 5.4.0c's rules: surfaces, ink, accent, radii, a tinted shadow from the 3D key, type scale; the same in `design/tokens*.json` | `src/looks/vinyl/look.css`, `design/tokens.json`, `tokens.dark.json` | code | `test_tokens.py` green, with text checked on the plate's lightest and darkest parts | 1.5 h | 2.25 h |
| 5.4.2c | Kid parts in vinyl and glass, with press (squash, soft click) and focus states: `KidButton`, `AgePicker`, `ThemeFilter`, `StepDots`, `TurnControls`, `KidBar`, `GrownUpsDoor`, `SpeakButton` | `src/ui/kid/*`, `look.css` | code | `#/design` rows looked at, light and dark; `kid.test.tsx` green | 2.5 h | 3.75 h |
| 5.4.2d | Cards and shelves: `ProjectCard`, `HeroCard`, `Shelf`, `BuildBadge`, `EmptyState` | `src/ui/kid/*` | code | Library screenshots looked at (portrait and landscape) | 1.5 h | 2.25 h |
| 5.4.2e | Build and Done: `StepTray`, `TileList`, `TileChip`, `SwapNote`, `FellDown`, Done, `Celebration`, Make your own's panels | `src/screens/build/*`, `Done.tsx`, `screens/make/*`, `ui/*` | code | screenshots of a build, a fall, the finish and Make, looked at | 2 h | 3 h |
| 5.4.2f | Grown-ups and `#/design`: Settings, dialogs, fields, toast, backup card | `src/ui/grownups/*`, `screens/grownups/*`, `screens/design/*` | code | screenshots looked at | 1.5 h | 2.25 h |
| 5.4.2g | Fallbacks: reduced transparency, low tier and software GL get a flat surface; reduced motion has no squash | `look.css` | code | e2e with emulated reduced motion and transparency green | 0.5 h | 0.75 h |
| 5.4.2h | `npm run shots` contact sheet (every screen, light and dark, both orientations) looked at and fixed; plates; axe; DESIGN.md; CHANGELOG `5.4.2`; ship; the sheet sent | `e2e/plates`, docs | check · live step | all checks green; `pages.yml` ok; sheet sent | 1.5 h | 2.25 h |

12 h.

**PR 5.4.3 · one look: the other four removed · branch `look-5-4-3` · GitHub #66** (may be shipped together with 5.4.2,
which saves one CI round; the keys stay separate)

| # | What | Files | Kind | Done when | Time | Stop |
|---|------|-------|------|-----------|------|------|
| 5.4.3a | Delete `looks/{toy,book,studio,classic}/` and `ui/LookPicker.tsx`; the picker out of Settings and the first-run card (and its strings); a saved `look` removed on start | `src/looks/`, `screens/grownups/Settings.tsx`, `FirstRunCard.tsx`, `looks/apply.ts`, `main.tsx`, strings | code | `tsc -b` green; no `LookPicker` left (grep) | 1.2 h | 1.8 h |
| 5.4.3b | Registries become direct imports of `looks/vinyl/`; `LookId` goes; their users updated | `stages.ts`, `voices.ts`, `decorations.ts`, `useLook.ts`, `Stage.tsx`, `Effects.tsx`, `Viewer.tsx`, `quality.ts`, `sound/sound.ts`, screens, cards | code | `tsc -b` and `npm test` green; no `LookId` left (grep) | 1 h | 1.5 h |
| 5.4.3c | One sound voice: soft vinyl taps and a magnet click, from Toy studio's voice retuned softer | `src/looks/vinyl/sounds.ts` | code | heard in the browser; sound unit tests green | 0.5 h | 0.75 h |
| 5.4.3d | Tests and docs: `looks.test.ts`, `e2e/looks.spec.ts` cut to one look; the 18 `look-*` plates removed; `looks/README.md`, DESIGN.md, PRODUCT.md; CHANGELOG `5.4.3`; ship | tests, docs | check · live step | all checks green; `pages.yml` ok | 0.8 h | 1.2 h |

3.5 h.

#### Phase 3 · The characters made app-ready (no app change; interleaved with phases 1–2)

**PR 5.3.5 · light, rigged characters · branch `pip-5-3-5` · GitHub #67**

| # | What | Files | Kind | Done when | Time | Stop |
|---|------|-------|------|-----------|------|------|
| 5.3.5a | Health and weld: `mesh_health.py`; weld by position, drop loose parts, fill holes | `design/pip/concepts/ready.py` | code | numbers logged; one component holding ≥ 99% of faces | 0.3 h | 0.45 h |
| 5.3.5b | Retopology to about 8k quads (16k triangles), shrinkwrapped to the high model | `ready.py` (via `blender_retopo_bake.py`) | code | silhouette checked against the hero at 200 px | 1.5 h | 2.25 h |
| 5.3.5c | Bake colour (from `cleantex.py`) and a tangent normal map at 1K and 2K; AO into colour at 30% | `ready.py` | code | a hero ↔ light-model side-by-side looked at | 1 h | 1.5 h |
| 5.3.5d | Clean-up: the snail's flecks and the dino's head mark (masked by colour distance, filled from clean texels) | `ready.py` | code | none visible at full size | 0.5 h | 0.75 h |
| 5.3.5e | Skeletons:<br>• dino: root, hips, spine, chest, head, jaw, arms, legs, tail ×3, plates;<br>• axolotl: the same, with gills ×3 a side;<br>• snail: body ×3, neck, head, feelers ×2, shell.<br>Voxel-proxy bind (`blender_bind_rig.py`) and the leg-reach check | `design/pip/concepts/rig3.py` | code | the check passes (an arm doesn't move the head) | 2 h | 3 h |
| 5.3.5f | Face shapes: blink (a squash of the dark eye), a happy squint, a small open mouth; keys at value 0 | `rig3.py` | code | an expression strip looked at | 1 h | 1.5 h |
| 5.3.5g | Pose sheet (8 poses each); glTF with skin and keys, meshopt, KTX2; ≤ 1.5 MB each | `rig3.py`, `ready.py` | code · check | no tearing seen; the size check passes | 1 h | 1.5 h |
| 5.3.5h | Proof: a side-by-side, a 6 s clip each (wave, hop, blink), a contact sheet; `design/pip/README.md`; build log; ship | docs | check | sent to Jordan; CI green; merged | 0.7 h | 1.05 h |

8 h.

#### Phase 4 · The leftovers, keyed (Jordan, 10 Oct: "go on all these you have 1 more hour")

**PR 5.4.4 · polish · branch `look-5-4-4`**

| # | What | Files | Kind | Done when | Time | Stop |
|---|------|-------|------|-----------|------|------|
| 5.4.4a | The shots script's build-tip screen (the "Get your tiles" card held the page) | `web/scripts/shots.mjs` | code | build-tip renders light and dark | 0.1 h | 0.15 h |
| 5.4.4b | Truck runs in the set (checked: runs play inside the Build viewer, which mounts the Stage, so they already stand in the room; nothing to change) | — | check | seen | 0.1 h | 0.15 h |
| 5.4.4c | A calmer evening table (a cooler grey tint, a softer lamp) | `looks/vinyl/stage.ts` | code | Build in dark looked at | 0.1 h | 0.15 h |
| 5.4.4d | The one look's colours in `design/tokens*.json` (base tokens now match the look) | `design/`, `web/src/tokens.css`, `tests/test_tokens.py` | code | the token tests pass in both themes | 0.3 h | 0.45 h |
| 5.4.4e | Polish: the picked age and theme key glows from inside; cards lift under a pointer | `looks/vinyl/look.css` | code | Library looked at, light and dark | 0.2 h | 0.3 h |

**PR 5.3.6 · the characters' faces and wave · branch `pip-5-3-6`**

| # | What | Files | Kind | Done when | Time | Stop |
|---|------|-------|------|-----------|------|------|
| 5.3.6a | Eyes as their own small meshes on the face (dark glossy ellipses with a catch-light), so a blink can close them | `design/pip/concepts/eyes3.py` | code | a blink reads in a clip | 0.4 h | 0.6 h |
| 5.3.6b | A wave that reads: the arm bone longer and the swing bigger | `rig3.py`, `pose3.py` | code | the wave reads in the pose sheet | 0.2 h | 0.3 h |
| 5.3.6c | Mouth shapes: a small smile and a small open "o" as a mouth mesh with shape keys | `eyes3.py` | code | seen in a sheet | 0.3 h | 0.45 h |

## Gates that need Jordan
| Gate | When | What he does |
|---|---|---|
| G-S0 | now, before 5.4.0a | says yes or no to the three downloads |
| G-S1 | after 5.4.0g | looks at the set sheet (I keep going); redirects if he wants |
| G-P1 | (existing) | picks the characters; 5.3.5 covers only those he keeps |

### Time bounds and self-checks
As in `plans/README.md`: one key at a time; stop and log at 1.5×; ask at 2×; a build-log row per PR.
- **Checkpoints:**
  - **CP1** after PR 5.4.0;
  - **CP2** after PR 5.4.1;
  - **CP3** after PRs 5.4.2 and 5.4.3, with 5.3.5.

  At each: the whole plan against the clock, the keys left, a new finish estimate, sent to Jordan as a table of PRs
  with their keys.
- **Run bounds:**
  - `npm run pictures`: about 10 min;
  - Playwright: about 8 min;
  - a Pixal3D or bake run: about 5 min;
  - a Cycles sheet: about 3 min.

  At 2× the bound, look.

### The rules of the build
As in `plans/README.md`. Commits name their keys and the checks run. The trailer:
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

### Critical files
- **AssetFurnace** (`~/image-to-3dlab/scripts/`):
  - `mesh_health.py`, `blender_retopo_bake.py`, `blender_bake_normals.py`;
  - `blender_bind_rig.py`, `blender_rebind_weights.py`, `blender_build_rig.py`;
  - `compress_glb_textures.py`, `render_glb_comparison.py`.
- **`design/pip/concepts/`:** `hero3.py`, `cleantex.py`, `kit.py`, `anim.py`, `stage.py`.
- **`web/src/`:**
  - `looks/stage.ts`, `looks/toy/*` (the nearest starting point);
  - `three/Stage.tsx` (`lightScene`, `fogFor`), `three/TileMesh.tsx` (`makeTileMaterials`, `lite()`), `three/tile.ts`;
  - `three/quality.ts`, `FrameWatch.tsx`, `three/camera.ts`;
  - `scripts/pictures.mjs`, `vite.config.ts`.
- **Tokens:** `design/tokens.py` with `tests/test_tokens.py`; `npm run shots`.

### Verification
| V | Check | Passes when |
|---|---|---|
| V1 | All CLAUDE.md checks on every app PR (this Mac's `NODE_OPTIONS`) | green here and in CI |
| V2 | The set against the Blender hero | side by side, the app reads as the same world |
| V3 | Every screen (`npm run shots`), light and dark, both orientations | looked at, nothing below the boards |
| V4 | Live, after each merge (`pages.yml`): Library → build (turn, step, finish), Make your own, grown-ups, light and dark | works; no console errors |
| V5 | Offline: load, go offline, reload | the set and pictures still draw |
| V6 | Characters: 200 px thumbnails, clips | read at a glance; move cleanly |

### Jordan's testing after
- **T1:** the live site on his iPad: a build in light and dark, Make your own, the grown-ups' screens.
- **T2:** the character clips.

### Estimate
| PR | Keys | Hours |
|---|---|---|
| 5.3 (#62) | P1 (done), P2 | 0.4 |
| 5.4.0 | 5.4.0a–g | 9 |
| 5.4.1 | 5.4.1a–i | 9 |
| 5.4.2 | 5.4.2a–h | 12 |
| 5.4.3 | 5.4.3a–d | 3.5 |
| 5.3.5 | 5.3.5a–h | 8 |
| **Total** | 37 keys, 2 gates | **≈ 42 h** |

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

About 21 hours of my work, plus Jordan's three looks; the addendum adds about 42 (its own estimate table).

## Build log (append, never rewrite)
| When (UTC) | PR · keys | Commit | Hours (est · used) | Result / re-evaluation | Next |
|---|---|---|---|---|---|
| 2026-10-10 | spec | — | — · 1.5 | Approved. Written after the skeptic pass, mocks A/B, the animated test (Jordan picked it), and "cuter … original and well designed". Concept file started. | 5.3.0 concepts |
| 2026-10-10 | 5.3.0 | — (mocks, not committed) | 2 · 1 | Four concepts rendered in the stage (`src/mock-pip-concepts.tsx`): A fox kit (tile-glass ears), B glow sprite (tile plastic, tile-triangle ears), C builder chick (tile-triangle crest), D magnet bun (horseshoe-magnet antenna). Looked at twice: the first round's eyes were far too small, the fox's muzzle hid its face, the sprite read as an egg in a hoop; fixed. Board sent. | G-P1: Jordan picks |
| 2026-10-10 | 5.3.0 | `design/pip/chick.py` | — · 1.5 | Jordan: the concepts "still feel like 1990s 3-D … looking for something that looks professionally finished". With his yes, Blender 5.2 installed (Homebrew). Concept C sculpted in Blender by script (`design/pip/chick.py`: one soft body of blended forms, sized exactly and every feature placed on the real surface; felt-like skin with a warm gradient, a cream tummy and painted blush; deep glossy eyes; tile-glass crest) and rendered in Cycles in a seamless studio. Looked at seven times (floating parts, washed-out colour, a blown backdrop, a dirty shadow, a horizon, bulging eyes); fixed. Sheet sent (hero, front, side, back, happy). | Jordan: is this the finish? Then the others to it, or C on to G-P2 |
| 2026-10-10 | 5.3 tools | branch `pip-5-3` | — · 1 | Jordan: "set up all of these". Installed and checked: BlenderMCP (add-on and server read before use: localhost only, telemetry opt-in and switched off by env), Rigify and the glTF exporter enabled, fogleman/sdf (smooth union tested), glTF-Transform, gltfjsx 6.5.3 (the `@react-three/gltfjsx` package is a 2022 build that crashes on Node 26), three-vrm springbone, wiggle, Theatre.js core + studio (studio dev-only, AGPL; its r3f extension needs r3f 8, so not used). `design/pip/README.md`. tsc, unit tests, build, audit clean. | Jordan: the finish level; BlenderMCP's tools load in a new session |

| 2026-10-10 | 5.3 tools | branch `pip-5-3` | — · 0.5 | The live link: the server Jordan connected in /mcp is Blender Lab's official Blender MCP (a Claude app extension), not ahujasid's; both use port 9876 with different protocols, so calls hung. Installed Blender Lab's `mcp` add-on (its extensions repository), turned on Blender's online access (it won't start without it; the link stays on localhost), disabled ahujasid's add-on and removed its server entry. `get_objects_summary` answers. | Pip, live in Blender |
| 2026-10-10 | 5.3.0 (round 2) | `design/pip/concepts/` | — · 3 | Jordan: "rethink the whole character … 3 fresh concepts … fully leverage all the repos and tools". A snail with a tile-pyramid shell, a baby dino with tile back plates, an axolotl with tile gills. The whole pipeline used: bodies as smooth-unioned SDFs (fogleman/sdf, `bodies.py`), built live in Blender through Blender Lab's MCP (`kit.py`, `build.py`: skin, eyes, happy-arc eyes, wrapped mouth with a `closed` shape key, eye `blink` keys, real tile pieces, a skeleton with heat weights), Cycles studio renders, colour and AO baked to vertex colours, glTF with skin and shape keys, glTF-Transform meshopt (1.2 MB → ~240 KB each), gltfjsx components, Wiggle springs (tails, feelers) and three-vrm spring bones (gills), a Theatre.js timeline for a 'hello'. Found and fixed on the way: Blender's glTF exporter writes the *render* colour attribute (white without it); gltfjsx's components use the shared material, which loses the vertex colours (use the mesh's own); Theatre.js's types change Object.entries/keys globally (it must sit behind a JS wrapper in the app). Rigify is not used: these are not humanoids, a hand-placed skeleton with heat weights fits; Rigify comes back for the chosen one's full control rig. | G-P1: Jordan picks |
| 2026-10-10 | 5.3.0 (finished look) | `design/pip/concepts/hero3.py`, `cleantex.py` | — · 0.5 | Jordan: "go with what looks best … truly wow me". The image route: mflux Z-Image concepts (dino 11, axolotl 11, a new snail 77 with a spiral tile shell), Pixal3D image-to-3D, then finished in Blender: seams welded (the generated mesh is split along every UV seam, and smoothing opened them into cracks), the atlas gutters' noise replaced from the nearest island texel (`cleantex.py`), satin vinyl (clear coat, a little subsurface), Poly Haven's wood table and photo-studio light, warm key and coloured rims, a tile house, depth of field. Cycles stills (group and three portraits) and an 8 s EEVEE fly-around with a hop, a sway and a glide. Weak still: the models are 470k vertices with 4K atlases (app use needs a retopo and bake), and they aren't rigged yet. | Jordan's verdict; then a plan phase for tiles and background in this style |
| 2026-10-10 | plan | — | — · 0.6 | Jordan: "write the plan phase for tiles and background", "add this to the plan" (the finished look's weak points), "make it detailed … run this end to end yourself", and "The looks all suck redo them and wow me. just 1 is needed". Addendum approved: 5.3.1a (light rigged characters) and 5.4.0–5.4.3 (one vinyl look: look development with G-S1 sent not waited on, the 3D set, every screen, the four looks removed); about 42 h. | B1: Jordan's yes on the asset downloads |
| 2026-10-10 19:10 | P2 | (this commit) | 0.4 · 0.2 | Every item keyed in `plans/README.md`'s format (37 keys, gates G-S0 and G-S1, checkpoints CP1–CP3); 5.3.1a renamed PR 5.3.5; drafts #63–#67 opened. G-S0 given. Jordan's 2-hour window starts 19:03 UTC. | 5.4.0a |
| 2026-10-10 19:21 | 5.4.0a–g (#63) | (this commit) | 9 · 0.3 | **Under half the estimate: the Done-whens re-read, all true.**<br>• a: three rooms downloaded (G-S0 given), the 1K wood and studio made here.<br>• b: `design/set/convert.py`, rooms at 1K and 512, wood as KTX2 (basisu 2.50 installed with Jordan's leave), each room 2.5–2.7 MB, within 3 MB. Two Blender traps found and fixed: a colour-space change reloads the image, and `save_render` applies the view transform.<br>• c: 10 mflux boards, rules in `design/set/boards.md`.<br>• d–e: the mock set, with today, three rooms and three tiers on three builds (transmission glass at high).<br>• f: the draft vinyl stylesheet over the real app (untracked), Library and Build, light and dark.<br>• g: G-S1 sheets sent; L3 picked; frame times (high 1.6 ms mean, 2.5 worst; mid and low 0.4 on this Mac).<br>Weak: the 2D mock is still close to Toy studio (its step is 5.4.2); the evening table was too orange (calmed in 5.4.1). | CP1, then 5.4.1 |
| 2026-10-10 19:44 | 5.4.1a–i (#64) | (this commit) | 9 · 0.6 | **Under half the estimate: the Done-whens re-read.**<br>• a: `StageLook.set` (room, turn, light, backdrop, blur, wood, rims).<br>• b: `three/Set.tsx` (`useRoom`, `SetTable`, `SetRims`) wired into `Stage.tsx`. The room is loaded once per tier; until it loads, the room made on the device stands in; a failed load is logged, never silent. The key's soft shadow is at high only, with every shader refreshed when shadows switch.<br>• c: the finish by tier in `TileMesh.tsx`, retuned live (`onTier`). Model fades from each finish's own `baseOpacity`. Pictures use the mid finish (`pinFinish`).<br>• d: `looks/vinyl/stage.ts`. **Change from the plan: every look's stage points at it now** (they all go in 5.4.3).<br>• e: `public/set/` (2.5 MB) with CREDITS, precached (hdr, ktx2, wasm).<br>• f: five builds (small, tall, wide, mosaic, truck) seen light and dark in Build mode; the table made bigger (`max(14, 6r)`) so only its far edge shows; the evening table calmed.<br>• g: `three/set.test.ts` (files and credits, the 3 MB budget, room by tier, the finish retuned live and let go on dispose). The table maps' disposal is not unit-tested (no WebGL in jsdom); it is checked in code only.<br>• h: 533 pictures redrawn; chips and cards compared before and after (a little softer, the glass a little richer; chips read at 48 px).<br>• i: e2e offline (the set's files load with the network off). Here 10 plates differ, because this Mac draws the set with its GPU and CI's plates have none: CI decides, and any change is looked at before updating.<br>Left: truck runs (`RunStage`) still use the plain stage. | 5.4.2 |
| 2026-10-10 20:10 | 5.4.2a–b, 5.4.3a–d (#65; #66 shipped inside it) | (this commit) | 15.5 · 0.4 | **Under half the estimate: the Done-whens re-read; 5.4.2c–h are not done.**<br>• 5.4.2a: the room plates. **Change from the plan:** they are drawn by the app's own renderer, because a Blender plate turned the room differently from three.js. They now also stand behind the 3D (the HDRI only lights), which fixed a dark band and black above tall or turning builds.<br>• 5.4.2b: `looks/vinyl/look.css` from the 5.4.0 draft (cream trays, glossy keycaps that squash, maple plank, glowing dots), light and dark.<br>• 5.4.3a–d: the four looks, their registries, `useLook` and the picker removed (shelf, first-run, Settings); a saved old look is cleared; one voice (the toy's, softer); `looks.test.ts`, `e2e/looks.spec.ts` (axe passes on every screen, light and dark); README, DESIGN, CHANGELOG 5.4.2.<br>• Seen: `npm run shots` of every screen, light and dark (the `build-tip` screen of the shots script asks for a step the castle no longer has: a script fault from before, left).<br>**Not done (5.4.2c–h):**<br>• per-part polish beyond the draft stylesheet: kid parts, cards, Build and Done, grown-ups;<br>• the new colours in `design/tokens*.json`;<br>• the evening maple is still brownish.<br>Plates come from CI after looking. | CP2 and CP3: report to Jordan |
| 2026-10-10 20:10 | 5.3.5a–h (#67) | (this commit) | 8 · 0.6 | **Under half the estimate: the Done-whens re-read.**<br>• a: welded and cleaned sources. **Done-when changed:** the largest part holds 96% (dino, snail) and 90% (axolotl), not 99%, because the other big parts are real pieces (the held tile, the plates, the gills).<br>• b–c: about 8k faces with the colour baked across. QuadriFlow declined on all three (not manifold), so AssetFurnace decimated; side by side with the heroes the look holds.<br>• d: colour flecks filled on all three, and the snail's dark blotch (a bake miss); eyes and nostrils kept.<br>• e: skeletons placed from the mesh, voxel-proxy weights; the reach checks pass, after moving the snail's feelers onto their stalks.<br>• f: blink and squint keys. **Weak:** at 8k faces an eye is a few vertices, so the blink barely shows; real blinks want eye meshes (5.3.2).<br>• g: pose sheet; the dino's wave is small (stub arms); GLBs 190–300 KB with meshopt and WebP (KTX2 inside glTF needs `toktx`, not installed).<br>• h: a 4 s proof clip of each, sent to Jordan; the pipeline in `design/pip/README.md`. | G-P1: which characters Jordan keeps |
| 2026-10-10 20:58 | 5.4.4a–e | (this commit) | 0.8 · 0.4 | a: the shots' build-tip fixed (Start first). b: no change needed: truck runs play in the Build viewer's Stage, so they already have the room (my earlier note was wrong). c: the evening table calmed. d: the base tokens are the one look's (`#352b28` for the evening raised surface: the red tile's rim was 2.97:1 on `#3a2f2c`); token tests pass. e: the picked key glows, cards lift under a pointer. | 5.3.6 |
| 2026-10-10 20:59 | 5.3.6a–c (#69) | (#69) | 0.9 · 0.1 | a: eyes as glossy domes with a catch-light on the painted eyes, and lids folded away at rest that close over the whole painted eye on `blink` (now it reads); the lids are a little paler than the skin; the snail's head eyes are not covered, only its stalk eyes. b: the wave swung further (arm.R x −150°), but it still barely shows: the arms are stubs; that needs longer arm geometry, not rotation. c: a small mouth arc cast onto the face, with `smile` and `open` keys (it reads on the axolotl; on the dino it sits at the snout's side). Models 230–340 KB. (Row kept here so #68 and #69 don't conflict on the plan.) | Jordan's look at the faces |
| 2026-10-10 21:50 | 5.3.1 (G-P2, G-P3; all three characters, G-P1) | (this commit) | 4 · 0.2 | **Under half the estimate: the Done-whens re-read.**<br>• `cast3.py`: shared posing, studio and tiles; a small square is 0.5, so a character is about two tiles tall.<br>• `sheet3.py`, the model sheet per character: a turnaround (front, three-quarter, side, back), 8 faces (neutral, happy, delighted, surprised, blink, sleepy, curious, shy), 10 poses (rest, wave, cheer, carry, point, step, crouch, look, comfort, sleep), size beside a tile house.<br>• `animatic3.py`, 12 s each: idle and blink, two hops carrying a tile (crouch, stretch, squash), set it down at the house, cheer, a tap and the reaction, comfort beside a fallen tile, sleep, wake. Encoded at real and half speed (all three stacked); sent to Jordan.<br>• Fixed on the way: the dino's mouth now sits on its snout's front point, the catch-light inside the eye, and every character stops beside the house, not in it.<br>**Not in the plan's 5.3.1:** colours in four looks (there is one look now).<br>**Weak:** the wave and cheer barely move the stub arms; the far eye's lid shows as a pale bump on blink; the snail's head eyes don't blink. | Jordan's G-P2 and G-P3 |
