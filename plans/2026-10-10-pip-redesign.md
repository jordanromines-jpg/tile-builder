# Pip, made new: a cute, original 3D friend (5.3)

Status: approved 10 Oct 2026, in progress. Three gates inside it are Jordan's (G-P1 to G-P3): nothing reaches the app
before G-P3. Added and approved 10 Oct 2026: 5.3.1a (the characters made app-ready) and phase 5.4 (one new look for
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

## Addendum (10 Oct, approved): one new look, and the characters made app-ready (5.3.1a, 5.4)

### Context
- **What Jordan asked (10 Oct):**
  - "write the plan phase for tiles and background";
  - "add this to the plan": the finished-look round's weak points (models too heavy, no skeletons, small flecks and
    marks);
  - "make it detailed and estimate the amount of effort each task will require. plan to run this end to end yourself";
  - and on the looks: **"The looks all suck redo them and wow me. just 1 is needed if it's good."**
- **Gates:** "Send it, keep going." I send each sheet and build straight on, and Jordan can redirect at any time.
  Nothing merges without green CI.
- **The outcome:**
  - Tile Steps has **one look**: the finish of the hero renders. Soft satin vinyl, tile glass that glows, a real wood
    table, a real room out of focus, warm light with coloured rims. It is carried into every screen, 3D and 2D.
  - The four looks (Toy studio, Picture book, Clean studio, Classic) and the look picker are removed.
  - The characters become light, rigged models ready for the iPad.
- **How it runs:** I do it alone, end to end: no agents, no workflows.

### Decisions (proposed)
| # | Question | Proposal |
|---|---|---|
| L1 | Looks | **One look**, replacing all four (Jordan). The picker leaves Settings and the first-run card. A family's saved look is ignored, then cleared |
| L2 | The look's name in code | `looks/` keeps its folder contract (`look.css`, `stage.ts`, `sounds.ts`, `decor.tsx`) with one folder, `looks/vinyl/`. The registries (`stages.ts`, `voices.ts`, `decorations.ts`) become direct imports. The `LookId` type and the switching code go (YAGNI) |
| L3 | The room | A real room, strongly out of focus, from a CC0 Poly Haven HDRI. I pick the best of three at G-S1 and send the sheet |
| L4 | Assets | CC0 only (Poly Haven, Kenney), bundled and precached; nothing is fetched at run time and nothing leaves the device. Each download is listed (name, source, size) for Jordan's yes |
| P3′ | Characters | Image to 3D, then finished by hand (concept → Pixal3D → weld, retopology, bake, skeleton, face shapes → small GLB). Replaces P3 for the characters Jordan keeps |

### Reused, not rewritten
- **AssetFurnace** (`~/image-to-3dlab/scripts/`), headless with Blender 5.2:
  - `mesh_health.py`;
  - `blender_retopo_bake.py`, `blender_bake_normals.py`;
  - `blender_bind_rig.py` and `blender_rebind_weights.py` (voxel-proxy heat weights);
  - `blender_build_rig.py` (its leg-reach check);
  - `compress_glb_textures.py`, `render_glb_comparison.py`.
- **This repo's Blender scripts** (`design/pip/concepts/`): `hero3.py` (set, lights, stills, fly-around), `cleantex.py`,
  `kit.py` (`tile_poly`, `armature`, `skin_to`, blink keys), `anim.py`, `stage.py` (`export_glb`).
- **App code** (`web/src/`):
  - `looks/stage.ts` (`StageLook`), `looks/toy/*` (the nearest starting point: tile-like buttons and a shelf);
  - `three/Stage.tsx` (`lightScene`, `fogFor`, the environment cache);
  - `three/TileMesh.tsx` (`makeTileMaterials`, `lite()`), `three/tile.ts`;
  - `three/quality.ts` and `FrameWatch.tsx` (tiers), `three/camera.ts` (`fitBox`, `MOSAIC`);
  - `scripts/pictures.mjs`, the Workbox `globPatterns` in `vite.config.ts`;
  - `design/tokens.py` with `tests/test_tokens.py`; `npm run shots` (every screen, light and dark);
  - mflux, for art-direction boards.

### Part A · 5.3.1a The characters made app-ready (no app change) — 8 h
Estimates are for all three characters; Jordan's G-P1 pick may cut this. The scripts are `design/pip/concepts/ready.py`
(the driver) and `rig3.py`.

| # | Task | Detail | Effort |
|---|---|---|---|
| A1 | Health and weld | `mesh_health.py`. Weld by position, drop loose parts, fill holes. Numbers recorded | 0.3 h |
| A2 | Retopology | `blender_retopo_bake.py` to about 8k quads (16k triangles) each. Shrinkwrap to the high model; check the silhouette against the hero at 200 px | 1.5 h |
| A3 | Bake | Colour (from the `cleantex.py` texture) and a tangent normal map from the high model onto the new UVs, at 1K and 2K; AO folded into colour at 30% | 1 h |
| A4 | Clean-up | The snail's flecks and the dino's head mark: masked by colour distance, filled from the nearest clean texel, checked by eye | 0.5 h |
| A5 | Skeletons | Hand-placed bones:<br>• dino: root, hips, spine, chest, head, jaw, arms, legs, tail ×3, plates on springs;<br>• axolotl: the same, with gills ×3 a side;<br>• snail: body ×3, neck, head, feelers ×2, shell.<br>Bound by `blender_bind_rig.py`, with the leg-reach check (an arm must not move the head) | 2 h |
| A6 | Face shapes | Blink (a squash of the dark eye, no lids), a happy squint, a small open mouth; shape keys reset to value 0 | 1 h |
| A7 | Pose check and export | A pose sheet (8 poses each) checked for tearing. glTF with skin and shape keys, meshopt, KTX2 textures. ≤ 1.5 MB each, or the script fails | 1 h |
| A8 | Proof | A side-by-side (hero ↔ light model, same light); a 6 s clip each (wave, hop with crouch and stretch, blink); a contact sheet; `design/pip/README.md`; build-log row; commit | 0.7 h |

### Part B · 5.4.0 Look development: the one look, 3D and 2D (G-S1; no app change) — 9 h
| # | Task | Detail | Effort |
|---|---|---|---|
| B1 | Asset list and downloads | Ask Jordan's yes on:<br>• Poly Haven `wood_table_001` at 1K (colour, normal, roughness: about 1.5 MB);<br>• two interior HDRIs at 1K (about 1.5 MB each).<br>The photo studio is already here. Each goes in its own folder | 0.3 h |
| B2 | Convert | Maps to KTX2 or WebP at 1K. HDRI as a 1K `.hdr`, plus 512 for mid tier. Summed against a 3 MB budget | 0.5 h |
| B3 | Art direction for the 2D | mflux boards (about 12 images at ~30 s each, best picked). The iPad screens as if made of the same vinyl and tile glass:<br>• the Library shelf, a project card, a kid button, the age picker;<br>• the Build tray, step dots, the Done screen.<br>Distilled into rules: materials, radii, shadows, type, colour, motion | 1.5 h |
| B4 | 3D mock stage | `web/mock-set.html` + `src/mock-set.tsx` (untracked), drawing real projects with the app's tile code:<br>• the HDRI through PMREM as light and reflections;<br>• a blurred room behind (`backgroundBlurriness` ≈ 0.35);<br>• a finite wood table with a rounded edge;<br>• a warm key with a soft shadow on high tier only, and two coloured rims | 2 h |
| B5 | Tile finish by tier | **Frame:** roughness 0.42, clearcoat 0.4 / 0.15; `BEVEL` about 0.022, with more segments on high tier.<br>**Face (glass):**<br>• high: `transmission` 1, `thickness` 0.1, `attenuationColor` = tile colour;<br>• mid: today's opacity, a little emissive and sheen;<br>• low and software GL: unchanged | 1.5 h |
| B6 | 2D mock | `web/mock-look.html`: the Library and Build screens in the new style, in HTML/CSS over the room plate, using the real components' markup. Light and dark | 2 h |
| B7 | G-S1 sheet | Today ↔ new, in the app's renderer:<br>• three builds (house, truck course, flower) × three rooms × light and dark × three tiers;<br>• the two 2D mocks;<br>• one Blender render of the house as the bar.<br>Plus frame times per tier from `FrameWatch`. Sent; I pick the room and carry on | 1.2 h |

### Part C · 5.4.1 The 3D set in the app — 9 h
| # | Task | Detail | Effort |
|---|---|---|---|
| C1 | `StageLook` grows | In `looks/stage.ts`:<br>• `environment: { map: string; intensity: number }`;<br>• `floor.maps` (colour, normal, roughness);<br>• `backdrop: { blur; intensity }`;<br>• a table with an edge.<br>String unions, no enums | 0.8 h |
| C2 | Stage | In `three/Stage.tsx`:<br>• the environment is loaded once, cached like `envCache`, at 512 on mid;<br>• the blurred backdrop; the edge table sized from `fogFor`'s reach, with no fog;<br>• shadows on high tier only;<br>• the software-GL path kept.<br>`lightScene` keeps its signature for `pictures.ts` | 1.5 h |
| C3 | Tile finish | B5 in `TileMesh.tsx` and `tile.ts` by `useTier`. The big-build tile and `lite()` keep their paths; one material per colour and part, for merging | 1 h |
| C4 | The vinyl stage | `looks/vinyl/stage.ts`: the room, the wood, the rims. Dark is the same room in the evening (HDRI down, a warm lamp key) | 0.7 h |
| C5 | Assets offline | `web/public/set/` plus `CREDITS.md` (CC0). `hdr,ktx2` added to the Workbox `globPatterns`. A budget test (≤ 3 MB) | 0.5 h |
| C6 | Framing | `fitBox` with an edge table: the edge never shows from below, the room stays blurred at every zoom, `MOSAIC` still reads from above | 1 h |
| C7 | Unit tests | No effects on low tier; every map named exists in `public/set/`; maps are disposed on unmount | 0.7 h |
| C8 | Pictures | `npm run pictures` (ipv4first). All 533 change on purpose. A contact sheet with `sharp`, looked at; chips still read at 48 px | 1 h |
| C9 | E2e, docs, ship | Playwright with an offline reload check and axe; plates updated after looking. DESIGN.md (Tile pictures, Performance), CHANGELOG `5.4.1`, build log. Draft PR → green CI → squash → `pages.yml` confirmed. A Build-mode video sent | 1.8 h |

### Part D · 5.4.2 Every screen in the new look (2D) — 12 h
| # | Task | Detail | Effort |
|---|---|---|---|
| D1 | Room plates | From the chosen HDRI in Blender (`hero3.py`'s set without the cast): 2732×2048 plates, blurred and lightened, plus an evening one for dark. WebP ≤ 250 KB each (budget test) | 1 h |
| D2 | Tokens | `looks/vinyl/look.css` (from B3's rules): surfaces, ink, accent, radii, the tinted shadow from the 3D key's direction, type scale. The same values in `design/tokens.json` and `tokens.dark.json`; `test_tokens.py` contrast, including text on the plate's lightest and darkest parts | 1.5 h |
| D3 | Kid parts | Vinyl-and-glass versions, with press and focus states, of:<br>• `KidButton`, `AgePicker`, `ThemeFilter`, `StepDots`;<br>• `TurnControls`, `KidBar`, `GrownUpsDoor`, `SpeakButton`.<br>Pressed: a squash and a soft click | 2.5 h |
| D4 | Cards and shelves | `ProjectCard`, `HeroCard`, `Shelf`, `BuildBadge`, `EmptyState`: cards as soft vinyl trays on the plate, pictures on top | 1.5 h |
| D5 | Build and Done | The step tray (`StepTray`, `TileList`, `TileChip` sizes), `SwapNote`, `FellDown`, the Done screen and `Celebration`. Make your own's panels | 2 h |
| D6 | Grown-ups and design page | Settings, dialogs, fields, toast, backup card: calm and in the same materials, smaller. `#/design` shows the new parts | 1.5 h |
| D7 | Fallbacks | `prefers-reduced-transparency`, low tier and software GL: flat surfaces (the plate's average). Reduced motion: no squash | 0.5 h |
| D8 | Look, test, ship | `npm run shots` (every screen, light and dark, portrait and landscape) as a contact sheet, looked at and fixed; e2e plates; axe; DESIGN.md (Foundations, Components); CHANGELOG `5.4.2`; ship as C9; the sheet sent | 1.5 h |

### Part E · 5.4.3 One look: the other four removed — 3.5 h
| # | Task | Detail | Effort |
|---|---|---|---|
| E1 | Remove looks | Delete `looks/{toy,book,studio,classic}/` and `ui/LookPicker.tsx`. Remove the picker from `screens/grownups/Settings.tsx` and `screens/FirstRunCard.tsx` (with its strings). `looks/apply.ts` and `main.tsx` set the one look; a saved `look` setting is removed on start | 1.2 h |
| E2 | Registries | `stages.ts`, `voices.ts`, `decorations.ts` and `useLook` become direct imports of `looks/vinyl/`; `LookId` goes. Update their users (`Stage.tsx`, `Effects.tsx`, `Viewer.tsx`, `quality.ts`, `sound/sound.ts`, Library, Build, Done, cards, Shelf) | 1 h |
| E3 | Sound | One voice in `looks/vinyl/sounds.ts`: soft vinyl taps and a magnet click, starting from Toy studio's clacky voice, retuned softer | 0.5 h |
| E4 | Tests and docs | `looks.test.ts` and `e2e/looks.spec.ts` cut to the one look; the 18 `look-*` plates removed. `looks/README.md`, DESIGN.md and PRODUCT.md say there is one look. The design-polish plan notes G2/D5 superseded. CHANGELOG `5.4.3`; ship | 0.8 h |

Part E can ship in the same PR as D, if both are ready together. That saves one CI round.

### Order (end to end, me only)
1. Commit this plan to #62 (0.2 h).
2. B1 (Jordan's yes on downloads), then B2–B7 → send G-S1, pick the room, carry on.
3. Part A, interleaved with B and C: its bakes and renders run in the background while I work on the app → send its proof.
4. Part C (PR from `main`), then D and E (one PR, or two). Pip in Build mode (5.3.3) then lands into the finished
   look.

### Verification
- **Every app PR:** all of CLAUDE.md's checks, with this Mac's `NODE_OPTIONS`:
  - `npm test`, `check:projects`, `check:physics`, `size`;
  - `tsc -b`, `build`, Playwright;
  - the token pytest and the secrets grep.
- **Look at everything:**
  - contact sheets at every step;
  - the app beside the Blender hero for the set;
  - 200 px thumbnails for the characters and 48 px for chips;
  - `npm run shots` for every screen.
- **Live:** after each merge, the `pages.yml` run on main. On the site:
  - Library → a build (turn it, step, finish), Make your own, grown-ups, in light and dark;
  - then offline and reload.

### Risks
- **The light models lose the look.** The normal map carries the soft detail; a side-by-side runs before export.
- **Heat weights fail on generated meshes.** The voxel-proxy bind and the leg-reach check.
- **Glass transmission is slow on older iPads.** High tier only; FrameWatch steps down to mid's fake glass.
- **A real room is busy behind a child's build.** Strong blur, a little faded; checked on real builds at G-S1.
- **Taste.** "Wow me": the 2D is art-directed from boards first, compared side by side with today's, and anything not
  clearly better is reverted.
- **Removing looks touches many files.** The registries keep their call sites until E2. Tests and plates catch what is
  missed.
- **All pictures and plates change at once.** Intended, and looked at in full.
- **Size.** About 3.5 MB more in the precache; budget tests hold it.

### Estimate
| Part | Hours |
|---|---|
| A · 5.3.1a characters app-ready | 8 |
| B · 5.4.0 look development, 3D and 2D (G-S1) | 9 |
| C · 5.4.1 the 3D set in the app | 9 |
| D · 5.4.2 every screen in the new look | 12 |
| E · 5.4.3 one look, the others removed | 3.5 |
| Plan commit and bookkeeping | 0.2 |
| **Total** | **≈ 42 h** of my work, plus Jordan's yes on the downloads |

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
