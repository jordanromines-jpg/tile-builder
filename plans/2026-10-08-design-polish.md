# Design polish: from 3/10 to 15/10, in three looks a family can choose

Status: approved 8 Oct 2026 (G0: "Approve, agents sooner"), in progress

What started it: Jordan, 8 Oct 2026: "I want you to think about how to take the design and polish on the UI and
graphics from a 3/10 to a 15/10." Then, asked about directions: "use 3 agents and build all three and add them as
options on the menu so users can pick themselves. Make sure it's a well thought out plan."

## Why

An audit of every screen (Playwright, iPad landscape 1180 × 820 at 2×, real GPU, light and dark, 8 Oct; screenshots
in the session scratchpad, not committed).

**Works:** the 3D tiles (glossy frames, rivets, glass); consistent colours; complete dark mode; type faces that suit a
children's app (Fredoka, Andika, Atkinson); accessibility basics (targets, contrast, labels).

**Holds it at 3/10, worst first:**
1. **Grown-ups screens are plain:** the gate is a sensible card (about 360 pixels wide, 28-pixel title) alone on an
   empty page. (The first audit called it broken, from a scaled-down contact sheet; at full size it is only plain.
   Corrected 8 Oct.)
2. **The Library looks like a prototype:** a flat page; twelve identical round icon buttons with no words, cut off;
   small cards with small floating pictures; a 2-pixel "shelf"; no first thing to look at, no "keep building".
3. **The 3D stage is cheap around good tiles:** the wood reads as stripes; flat light; no darkening where tiles meet,
   so models look pasted on; step 1 is often one tile in an ocean of floor.
4. **Nothing feels physical:** no sound; no snap or click when a tile lands.
5. **The celebration is thin:** a pill of text and a few flat specks.
6. **Chrome is generic:** plain circles and pills, black shadows, one size of everything; the panels don't belong to
   the world of the tiles.

## Decisions

| # | Question | Answer |
|---|---|---|
| D1 | One direction, or mockups first? | "use 3 agents and build all three and add them as options on the menu so users can pick themselves" (8 Oct) |
| D2 | Sound | "Yes, with a mute" (8 Oct): a magnet click, a snap, a finishing chime, button clicks; made on the device |
| D3 | Target iPad | "Not sure" (8 Oct): quality tiers that choose themselves from the device's frame rate |
| D4 | A character | "Yes, a tile friend" (8 Oct) |
| D5 | Which look is the default for a new family? | Proposed: Toy studio; Jordan picks at G2 after using all three |
| D6 | Where the look is chosen | "Also on the Library" (8 Oct): grown-ups Settings, the first-run card, and a paint-palette button on the Library's theme row |
| D7 | Phase order | "Approve, agents sooner" (8 Oct): the four agents start right after PR 3.0, while the lead does 3.1 in parallel |

## The architecture: structure once, skin three times

The three looks share everything a child does and differ only in how it looks and sounds. That keeps them from
drifting into three apps, keeps the agents out of each other's files, and keeps every check (e2e, a11y, perf) meaningful
for all three.

- **Structure (shared, built first, by the lead):** layouts, flows, component APIs, the 3D model and its animation
  timing, the sound engine, the tile friend's behaviour, the quality tiers, every fix that isn't taste (the grown-ups
  layout, theme labels, the "keep building" card, first-step framing, the celebration's choreography).
- **Skin (per look, one folder each):**
  - `web/src/looks/<look>/tokens.css`: every colour, surface, shadow, radius, type weight, texture and motion value,
    under `[data-look="<look>"]` on `<html>` (light and dark each);
  - `web/src/looks/<look>/stage.ts`: the 3D stage: floor, backdrop, lights, fog colour, ambient occlusion and post
    effects per quality tier, the tile glass's tint and gloss;
  - `web/src/looks/<look>/sounds.ts`: the look's voicing of the shared sound events (pitch, timbre);
  - `web/src/looks/<look>/slots/*.tsx`: the few places a look needs different shapes, not just values (a paper edge,
    a shelf plank), through named slots the shared components render (`<Slot name="shelf" />`), each with a default.
- **Looks never fork a screen.** A look that needs a structural change asks the lead, who adds it to structure.
- **Pictures stay shared.** The 511 project pictures are drawn on a clear background (as now); each look sets what is
  behind them on a card. One set to precache, not three.

The three looks:
1. **Toy studio:** the app is made of the toy. Buttons, chips, the age picker and the step dots are glossy translucent
   magnet tiles with rims; Next is a big orange tile that sinks and clicks; cards sit on a real wooden toy-shop shelf in
   a softly lit playroom; the 3D table is a calm play-mat.
2. **Picture book:** a warm illustrated storybook. Paper grain, soft hand-drawn edges and shadows, a crayon underline
   on headings, watercolour washes behind the shelves; the 3D sits on a sheet of drawing paper with a pencil-grid.
3. **Clean studio:** a photographer's studio. A white (or deep grey) seamless sweep, minimal chrome in quiet greys,
   one accent; the tiles are the only colour; precise light and shadow; the most "Apple".

The tile friend: a small character made of tiles (a square body, triangle ears or hat, two dot eyes), shared by all
three looks and drawn in each look's style through its slot. It reads the step aloud (with the existing voice),
points at this step's tiles, thinks while the next step loads, and cheers at the end. Never in the way of the model;
hidden with "fewer moving things" (reduced motion keeps it still).

## Phases, pull requests and keys

### Phase 0 · Plan
| # | What | Done when |
|---|------|-----------|
| **G0** | **Jordan approves this plan** | "Approve, agents sooner" (8 Oct) |

### Phase 1 · Structure (the lead, alone, so the looks have something firm to build on)

**PR 3.0 · the look system, sound, quality tiers · branch `design-3-0`**

| # | What | Files | Done when | Time |
|---|------|-------|-----------|------|
| 0a | Look system: `data-look` on `<html>`, a `look` setting saved on the device, `LookProvider`, `useLook()`, the slot mechanism; today's design becomes the look `classic`, kept until G2 | `src/looks/`, `store/`, `main.tsx` | unit tests; switching a look re-paints the UI and the 3D stage without a reload | 3 h |
| 0b | Every visual value a token: sweep components for hard-coded colours, shadows, radii and durations; the 3D stage reads `stage.ts` from the look | `ui/`, `screens/`, `three/Stage.tsx` | a lint check that finds no hard-coded colour outside `looks/` and `tokens` | 3 h |
| 0c | Sound engine: Web Audio, events `tap`, `snap` (a tile lands), `step`, `finish`, `error`; synthesized on the device; quiet by default; mute in Settings; nothing before the first touch (iOS) | `src/sound/` | unit tests; no network; e2e that mute silences | 3 h |
| 0d | Quality tiers `low` / `mid` / `high`: start from the device (cores, GPU name), then step down when frames drop (the existing `PerformanceMonitor`), up when they recover; looks read the tier for AO and post effects | `three/quality.ts` | unit tests; tier shown on the design page | 2 h |
| 0e | The look picker in Settings (three big previews, light and dark) and once in the first-run card | `screens/grownups/Settings.tsx`, `FirstRunCard.tsx` | e2e: pick each look | 2 h |

**PR 3.1 · shared structure fixes (not taste, so every look gets them)**

| # | What | Done when | Time |
|---|------|-----------|------|
| 1a | Grown-ups screens: the gate given a friendly picture and a page around it (each look styles it); Tiles and Settings checked at full size | before/after screenshots | 1 h |
| 1b | Library: a "keep building" hero card (the project in progress, or a suggestion); theme chips with words; bigger cards whose pictures fill them; shelves with room to breathe; the composed empty state | e2e and plates | 4 h |
| 1c | Build mode: the step panel's layout (this step's tiles big, the words, Next), turn buttons grouped; first-step framing against the whole build's footprint, with a faint outline of where it all goes | screenshot of step 1 of five builds | 3 h |
| 1d | The landing: squash, settle, `snap` sound, a glint; the ghost as a breathing outline (reduced motion: none) | | 2 h |
| 1e | The finish choreography: camera sweep, tiles bursting from the model in 3D, the stars as tiles dropping in, `finish` sound | | 3 h |
| 1f | The tile friend's behaviour and its slot: where it stands, when it speaks, points, thinks and cheers; a placeholder drawing until 3.5 | | 3 h |

### Phase 2 · Skin (four agents in parallel, each in its own folder)

**PR 3.2 · Toy studio · PR 3.3 · Picture book · PR 3.4 · Clean studio** — one agent each, at the same time.

| # | What (each look) | Done when | Time |
|---|------|-----------|------|
| 2a | Tokens, light and dark | every screen re-painted | 3 h |
| 2b | The 3D stage: floor, backdrop, light, AO by tier, glass tint | a finished model looks like a photograph in that style; frame time and render passes within 2.8.1's budgets at each tier | 4 h |
| 2c | Slots: shelf, card backing, panel edge, button face, headings | | 4 h |
| 2d | The sound voicing | | 1 h |
| 2e | Before/after sheets of every screen, light and dark, portrait and landscape, looked at and fixed | the sheet published for Jordan | 2 h |

**PR 3.5 · the tile friend** — a fifth agent: the character sheet first (shape, face, colours, poses: idle, read,
point, think, cheer), drawn as SVG from tile shapes, animated with CSS/Web Animations; each look's slot dresses it.
**G1: Jordan approves the character sheet before it is animated.** 6 h.

### Phase 3 · Choose and finish

**PR 3.6 · polish pass** — every state (loading, empty, error, offline), every size (portrait, landscape, Split View),
light and dark, all three looks; e2e plates per look for the Library and build mode. 5 h.

| Gate | When | What Jordan does |
|---|---|---|
| **G2** | after 3.6 | Uses all three on his iPad with a child; picks the default (D5); says what is still below 15; `classic` is removed |

## Measures of 15/10 (checked, not felt)
- A stranger shown three screenshots of a look can name the brand without the logo.
- Every screen has one first thing to look at and nothing unfinished, at every iPad size, light and dark, in all
  three looks.
- Every touch answers within one frame with motion and (unless muted) sound.
- A finished model looks like a photograph of real tiles in that look's world.
- 60 frames on the device's tier; the 2.8.1 budgets (render passes, step hitch) hold in every look.

## How the agents are run (Phase 2)
- One brief each: the plan, the structure's APIs (tokens list, slot names, stage config type, sound events), the
  look's description above, the measures, and their folder. They edit only `web/src/looks/<look>/` (and their e2e
  plates); a need outside it goes to the lead.
- Each looks at its own screenshots (a script renders every screen in its look) before reporting, and reports the
  before/after sheets, the frame times by tier, and anything it wanted from structure but didn't get.
- The lead integrates one PR at a time, runs every check, and looks at every sheet before merging.

## Risks and answers
- **Three looks triple the work of every later change.** Answer: structure is shared; a look is tokens, a stage
  config, a voicing and a few slots, so a new screen needs no per-look work unless a slot is new.
- **Precache size and load time.** Answer: pictures shared; textures generated on the device (as the wood is now);
  each look's code split and loaded when chosen; budget: no more than +150 KB gzipped per look.
- **iPad GPU.** Answer: AO and post effects only at `mid`/`high`; tiers step down on dropped frames.
- **A child flipping looks mid-build.** Answer: the picker is for grown-ups (D6).
- **The character crowding the model.** Answer: it lives in the panel's corner, never over the 3D; reduced motion
  keeps it still; Jordan approves its sheet first (G1).

## Time bounds and self-checks
As in plans/README.md. Totals: Phase 1 about 34 h (lead); Phase 2 about 14 h a look and 6 h for the friend, in
parallel; Phase 3 about 5 h. Checkpoint after Phase 1: re-estimate Phase 2 from what the structure turned out to need.

## The rules of the build
As in plans/README.md, plus: no runtime downloads (everything precached, offline); no analytics; reduced motion and
mute always respected; 500-line files; every PR's screenshots looked at before merging.

## Critical files
`web/src/tokens.css`, `design/` tokens, `DESIGN.md`, `web/src/ui/kid/*`, `web/src/screens/*`, `web/src/three/*`,
`web/src/pictures.ts`, new `web/src/looks/`, `web/src/sound/`.

## Verification
| V | Check | Passes when |
|---|---|---|
| V1 | All checks in CLAUDE.md, in each look | green |
| V2 | Before/after sheets, every screen, every look, light and dark | looked at, nothing unfinished |
| V3 | Frame time and render passes per tier, per look | within 2.8.1's budgets |
| V4 | The "name the brand" test, per look | recognisable without the logo |

## Jordan's testing after
G1 (the character sheet), G2 (all three looks on his iPad with a child).

## Build log (append, never rewrite)
| When (UTC) | PR · keys | Commit | Hours (est · used) | Result / re-evaluation | Next |
|---|---|---|---|---|---|
| 2026-10-08 | audit | — | — · 0.5 | Every screen screenshotted (light, dark, iPad landscape); findings in "Why". D1–D4 answered. | G0: Jordan approves this plan |

## Results
None yet.
| 2026-10-08 | 3.0 · 0a–0e | (this commit) | 13 · about 4 | Look system (`looks/`: `data-look` set before first paint; `stages.ts`, `voices.ts`, `decorations.ts` kept apart so three.js stays in the 3D chunk: the first chunk is 224 KB gzipped against 221 on main; the effects library, 102 KB, loads only when a look turns an effect on); `looks/README.md`, the contract the agents build to; `ts-*` hooks and `<Decor>` places on every shared component; the stage from the look, effects by tier (`three/quality.ts`, stepping with the frame monitor: effects first, then sharpness); the sound engine (`sound/`), on the existing "Sound effects" switch, now on by default (one store migration), voiced per look, snap on landing, step, turn, finish; the picker with live previews in Settings, the first-run card and on the Library; `npm run shots` (every screen of a look, light and dark, landscape and portrait). `classic` is today's design. All checks green. | Start the four agents (worktrees); 3.1 |
| 2026-10-08 | 3.0 merged | `acdd00e` (#39) | — | CI green, merged, `pages.yml` succeeded. Four agents started in worktrees (three looks, the tile friend). | 3.1 |
| 2026-10-08 | 3.1 · 1a–1f | (this commit) | 15 · about 3 | 1a: the gate is a sensible card, only plain (the audit's "broken" came from a scaled-down sheet; corrected above); the looks style it. 1b: a "Keep building" / "Try this one" card first on the Library; a word under every theme chip (`ts-chip-wrap` holds `ts-chip` and `ts-chip-word`); with no age yet, the age shelves now come before the trucks and wildflowers (a new family saw trucks first). 1c: kept the framing (zooming out to the whole footprint made a big build's first tile tiny); instead a dashed outline on the table of where the whole build will stand, in the ink colour, until it's done. 1d and 1e: the landing already eases and snaps, and now clicks (3.0); the finish has its sound and Pip; no more this PR. 1f: Pip (G1: \"Approve as is\", name \"Pip\") on the step panel's edge, pointing for a moment each step, and cheering big on the finish; a few movements, never a loop; still with reduced motion. Fixes the look agents found: `<Decor at=\"finish\">` rendered; `FrameWatch` replaces drei's monitor (it read a still, demand-drawn screen as slow, so effects were nearly always off); with effects on, tone mapping happens once, last (a dark floor drew twice as bright); `npm run shots` serves fonts through a linked node_modules, takes a screen list and shoots the Library with an age; the shelf row has room for card shadows. Plates: Library and design page updated after looking. All checks green. | Merge 3.1; then the three looks (3.2–3.4) on top of it, each checked with `npm run shots` |
| 2026-10-08 | 3.1 merged | `0161d59` (#40) | — | CI green, merged, `pages.yml` succeeded. | the looks |
| 2026-10-08 | 3.2–3.4 · 2a–2e | (this commit) | 42 (three agents) · about 0.5 (lead) | Three agents, one worktree and one folder each (checked: no file outside its folder). Toy studio: glossy tile buttons, chips, ages and dots; a wooden shelf with brackets; a birch floor; AO at mid, bloom and vignette at high; clacky sounds. Picture book: paper grain, crayon underlines, washi tape, a deckled panel, drawn stars on the finish; a drawing-paper floor with a pencil grid; music-box sounds. Clean studio: porcelain and graphite, one blue accent, frosted panels, a seamless sweep; glassy sounds. Shipped together in one PR to save three CI rounds. The lead's review, every screen of each look light and dark (`npm run shots`): the toy look's picked age read as disabled (its per-age tints out-ranked the picked rule) and its header wrapped the lock onto a line of its own; both fixed. Sizes: CSS 15 KB gz in all, JS +2 KB. Stepping frames (agents' measures): studio 17 ms at every tier; book 33 ms worst; toy 33 ms stepping, one 180 ms frame at start-up at high, not yet explained (the effects chunk loading, probably). All checks green. | Merge; then Jordan tries the three (G2); 3.6 polish |

