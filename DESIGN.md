# The design system: Tile Steps

How Tile Steps looks, moves and speaks. Read `PRODUCT.md` first (who it is for and what it must never become); this
file says how. The tokens live in `design/tokens.json` (see `design/README.md`); the live catalogue of every component
in every state is the design page, `#/design` in the app. Shaped after `web-agent/DESIGN.md`.

## How to use it

- Before you build a screen, find its components below and on `#/design`. Use them; don't restyle them in place.
- Every colour and size comes from a token. If you need a new one, add it to `design/tokens.json`, run
  `python3 -m design.tokens write`, and give it a `$description` that says what it is for.
- Every word a child sees or hears lives in `web/src/strings.ts`, in the voice under Copy.
- A rule here that names a source is research-backed. Changing it is a decision with Jordan's word (the plan's rule 16).

## Principles

1. **Two taps to building.** Open, tap a project, step 1. No sign-in, no setup for the child, no project page (D18).
2. **One glance per step.** Build mode shows one step: the model, this step's tiles as pictures, one big Next.
   Visual working memory holds about 1.5 items at 5, 3 at 7 and 4 at 10 (`child-development.md`, section 1).
3. **Tap only, for the youngest.** Every kid action is a tap. Nothing a 3-to-5-year-old needs is a drag, pinch or swipe;
   children under 5 lift their finger mid-drag (`kids-and-ipad.md`).
4. **Colour never alone.** Each tile colour also has a pattern, a rim and a spoken name; each badge has a shape and
   words (`kids-app-design.md`, section 4; WCAG 1.4.1).
5. **Calm.** Few colours, one moving thing at a time, no sounds by default, no streaks, timers, scores or prizes. The
   finished build on the table is the prize (`child-development.md`, section 4).
6. **The same for every child.** No boys' and girls' anything; every theme in every age band (`child-development.md`,
   section 7).

## Foundations

### Light and dark

Light is a toy box (sprint 2): warm paper (`surface #FFF7EC`) over a wooden table; dark is an evening playroom
(`surface #1C1A24`) over walnut. The app follows the iPad's
setting until a grown-up picks one in Settings; the choice is stored per device and set before the first paint
(`web/src/ground.ts`). Both themes pass every contrast pair.

### Colour

| Role | Tokens | Rule |
|---|---|---|
| Surfaces | `surface`, `surface-2` (cards), `surface-3` (wells), `line` | Three steps, no more |
| Ink | `ink-1`, `ink-2`, `ink-3` | `ink-1` 7:1 on every surface; `ink-2` 4.5:1; `ink-3` only on `surface` and `surface-2` |
| Accent | `accent`, `accent-ink`, `accent-soft`, `focus` | One sunny burnt orange (`#BF5409` light, `#FF9B45` dark). The main action, the chosen chip, the focus ring. Never a tile colour |
| Badges | `can-bg`/`can-ink`, `wait-bg`/`wait-ink` | "You can build it!" and "Need 2 more"; always with a shape (✓, the missing tiles) |
| 3D | `stage`, `ground` | The warm light behind the model and the wood of the table (shelf planks too) |
| Tiles | `tile-{red,orange,yellow,green,blue,purple}`, each with `-rim` | Match the plastic. The rim is 3:1 on the surfaces |

`python3 -m design.tokens check` fails the build when a pair misses its ratio. No red for errors on the kid side:
nothing a child does is an error.

### Type

| Use | Family | Sizes |
|---|---|---|
| Titles, numbers | Fredoka (variable) | kid display 56 / 48 / 40 px by age; parent title 28, heading 22 |
| Kid words | Andika (single-storey *a* and *g*, as children write them) | 40 / 32 / 26 px by age; counts 40 / 36 / 32 |
| Grown-ups' words | Atkinson Hyperlegible Next | body 17 px, small 13 px; never under 13 |

Kid text is weight 700, never thin. Sizes from `kids-app-design.md`, section 3. Most kid words are also spoken, so
reading is never required. Fonts are subset to Latin and cached for offline use.

### Space, size and shape

- Spacing `s-1`..`s-9`: 4, 8, 12, 16, 24, 32, 48, 64, 96 px.
- Kid targets: 88 px (3–5), 80 (6–8), 64 (9–10); the one main action is 112; 24 px between kid targets; a 12 px
  invisible hit slop; nothing a child needs within 32 px of the bottom edge or the safe-area insets. Grown-up targets
  44 px (`kids-and-ipad.md`; Apple HIG).
- Radii: `r-tile` 6 (tile pictures), `r-sm` 12, `r-md` 20, `r-lg` 32 (cards, buttons), `r-full`.
- The tile rim is 3 px at every size.

### Motion

- Durations: `t-press` 100 ms (a press shows within a frame), `t-ui` 240 ms, `t-celebrate` 3600 ms (the end of a
  build, the longest anything takes; skippable with a tap). Easing `ease` = cubic-bezier(0.2, 0.7, 0.2, 1).
- One moving thing at a time during a step: the new tiles glide in one after another, glow for 2.5 s, then everything
  holds still (and the stage stops drawing). The one exception is the end: the view circles the model (3.4 s) while
  little tiles shower down, then the photo card slides in.
- With reduced motion, movement becomes a still or a short fade: the model appears, turns are instant, nothing falls or
  circles at the end, the 9–10 model doesn't turn by itself (`web/src/ui/motion.ts`).
- The 3–5 model never turns by itself during a step (D10).

### Sound

The voice (Web Speech, on the device, rate 0.9) is off by default since 2.0: **Hear again** (on the build screen and at
the end) reads a line whenever a child taps it. A grown-up can turn reading on in Settings; then each step's line and
the end's line are read as they appear, and tile chips and the empty state's picture say their names on a tap. With
the voice off those are pictures, not buttons, so nothing invites a tap that does nothing. An iPad that had 1.0 is
switched to off once. A muted iPad stays quiet. Sound effects are off by default (Q3).

### Icons

Phosphor, duotone for themes and bold for actions, from one list (`web/src/ui/icons.ts`). Tile shapes have their own
outline icons in Phosphor's style (`ShapeIcon`). One idea per icon; concrete objects (`kids-app-design.md`, section 2).

## Tile pictures

The tiles are what a child matches on the table, so their pictures are the most important thing on the screen.

- **The face** is the tile colour at 45% over the surface, as light comes through real tiles.
- **The rim** is the tile's frame: 3 px, solid, in the tile's rim token (darker than the face where the face alone
  would be under 3:1).
- **The pattern** is the second cue: red dots, orange diagonal stripes, yellow plain, green waves, blue horizontal
  stripes, purple stars. `design/cvd.py` shows why: under deutan vision blue and purple, and red and green, nearly
  merge; under protan vision orange and green do.
- **The name** is the third: every chip that a child can tap says "4 red squares".
- A project asks for shapes, not colours. Colour is a preference, never a requirement: "any colour" chips are drawn in
  `surface-3` with an `ink-3` rim.
- In 3D (`web/src/three/tile.ts`, sprint 2): a thick glossy frame with rounded, bevelled corners (clear-coated
  plastic), a clear tinted face at 0.62 with the moulded diamond texture as a bump map, and chrome rivets at the
  corners. Lit by a room environment made on the device, on a wooden table with soft contact shadows.
- **3D pictures** (`web/src/pictures.ts`): tile chips and project cards show the same 3D tiles as the stage. They are
  drawn ahead of time by the stage's own code (`npm run pictures`, `web/scripts/pictures.mjs`), saved as WebP in
  `web/public/pictures/` on a clear background (one picture for both themes) and cached offline with the app; the iPad
  never draws them. A unit test fails when a project changes and its picture was not drawn again. "Any colour" tiles,
  part-built projects and a missing picture use the flat drawing above.
- **Without a GPU** (a software renderer: old devices, virtual machines, CI; `web/src/gpu.ts`) the stage is drawn
  lighter: no clear coat, moulded texture, room reflections or contact shadows, at 0.75x.

## Components

Kid side first, then the grown-ups'. Every one is on `#/design` in every state, both themes, at each age.

### Kid button (`KidButton`)
A picture first, the label under it in Andika. Sizes by age (88/80/64) or 112 for the main action. An icon-only button
is round; a labelled one has radius 24 (32 for the main action); all have a soft shadow. Tones: accent (the one main
action), plain, soft. States: pressed (down 2 px and scale 0.97 within a frame), selected (a focus-coloured ring), off
(40%).
With `speak`, a tap says its label.

### Kid bar (`KidBar`)
Along the top, never the bottom: Back to the shelf at the left, Hear again beside it, the grown-ups door at the right.

### Grown-ups door (`GrownUpsDoor`)
A small lock, 44 px: a grown-up's size on purpose. A tap says "This door is for grown-ups." and opens the gate.

### Age picker (`AgePicker`)
Three picture buttons: stacks of one, two and three tiles with 3–5, 6–8, 9–10. Chosen: accent edge and ring. Speaks the
age on tap.

### Theme filter (`ThemeFilter`)
Round picture chips, All and the eight themes, at the age's target size. Speaks the theme on tap.

### Project card (`ProjectCard`)
The finished project in 3D on the table (its SVG drawing until that is ready, D24), its title, 1–3 stars drawn as
yellow triangle tiles, its build badge, and "Step 4" when half built. 300 px wide, radius 28, a soft shadow; it lifts
and tilts a little when pressed. One tap target; it goes straight into build mode.

### Build badge (`BuildBadge`)
`can`: ✓ and "You can build it!" on `can-bg`. `swap`: ⇄ and "You can build it with a swap" on `accent-soft`. `need`:
"Need 3 more" and the missing tiles drawn with counts, on `wait-bg`. Never a padlock (`kids-app-design.md`, section 2).

### Shelf (`Shelf`)
A row of cards standing on a wooden plank, scrolling by swipe with snap, and a round ▶ button at the age's target size
for a child who taps.

### Step dots (`StepDots`)
One dot a step: done ones filled, this one large and ringed, the rest hollow. Countable; never a progress bar. For 9–10
a dot is a button that jumps to its step. These are a shortcut for older children, smaller than the kid target (32 px,
a 25-step build would not fit at 64): Back and Next stay the full-size way through a build.

### Turn controls (`TurnControls`)
◀, "back to my side", ▶. A quarter turn each.

### Swap note (`SwapNote`)
The tile you're short of → the one that stands in for it (marked ⇄), and the sentence.

### Empty state (`EmptyState`)
Two "any colour" tiles and a line, which a tap on the picture says aloud.

### Celebration (`TileConfetti`; `Celebration` stays on the design page)
At the end of a build the view circles the finished model once while little tiles shower down, 3.6 s, the same every
time; then a photo card of the model with "Put the iPad down…" and Back to the shelf. A tap skips it; with reduced
motion nothing falls or turns. No sound, no points.

### Tile chip (`TileChip`)
See Tile pictures. Sizes 48, 72, 104 px; a count beside it in Fredoka; ⇄ when it stands in for another.

### Grown-ups button (`Button`)
44 px. `lit` (one a screen), `line`, `quiet`, `danger` (an edge in `wait-ink`, never red fill).

### Dialogs (`Dialog`, `ConfirmDialog`)
Radix: focus moves in and returns. A confirm says what will happen in words; "Erase everything" also asks to type ERASE.

### Fields (`Field`, `Switch`, `Radios`)
Labels tied to inputs. An error is a sentence under the field, read out (`role="alert"`). A switch says On or Off.

### Stepper (`Stepper`)
− count +, 44 px buttons; a long press repeats every 80 ms after 400 ms; the arrow keys step; read as a spin button.

### Toast (`Toast`)
One line at the bottom of the grown-ups side, five seconds, polite.

### Storage status and backup card (`StorageStatus`, `BackupCard`)
Plain words: "Kept on this iPad: yes." or "The iPad may clear this if space runs low. A backup is safer." and the last
backup date; two buttons, Save a backup and Restore from a backup.

### Gate (`GateDialog`)
"Hold to open" for three seconds with a filling ring; letting go early starts again. Then a sum in words with a number
pad ("forty-two plus seven?"); three wrong answers close it. No birth-year question.

## Patterns

- **The kid bar** is in the same place on every kid screen.
- **The grown-ups door** is the only way to the grown-ups side; the gate stays open for ten minutes without a tap.
- **The age picker** sets which shelf comes first; a project's own band sets how its build mode behaves.
- **Missing tiles**: the card still opens; the first screen of build mode says "You need 2 more ▲ for this one." with the
  tiles drawn, then "Start anyway" and "Pick another". Nothing says buy.
- **Swaps**: the swapped tile is drawn with ⇄, and the line is said once, at the first step that uses it.
- **It fell down** (3–8): "Towers fall sometimes. Builders fix them." with "Go back one step" and "Start this layer
  again"; after two on one step, "Ask a grown-up to hold it while you add the next tile." No red, no sound
  (`child-development.md`, "When a build falls down").
- **Rest**: after 90 s with no tap, the step panel dims and the step's tiles grow; any tap brings it back. No nag.
- **First-run cards**: in Safari, "Add this to your Home Screen first, so it keeps your tiles"; in the Home Screen app,
  once, "Stand the iPad up beside the tiles and build together." (D10).
- **The end**: the finished model, the celebration, the project's own line, then "Put the iPad down and play with what
  you made." and one button back to the shelf. No next project.

## Copy

The voice is in `PRODUCT.md`: plain statements in sentence case, said to "you" or "builder"; short sentences a
4-year-old can follow; an exclamation mark only for "You can build it!" and the end of a build.

Words by age, used naturally inside steps, never drilled (`child-development.md`, "Words the read-aloud can model"):

| Age | Shape words | Place words | Number words |
|---|---|---|---|
| 3–5 | square, triangle, tall triangle, side, corner, flat, big, small | on top, under, next to, inside, in front, behind, up, down | count to 10, same, different, one more |
| 6–8 | edge, face, cube, pyramid, half, whole, right angle | left, right, opposite, between, turn, row, layer, symmetrical | count by 2s and 4s, pattern, repeat |
| 9–10 | net, vertex, equilateral, isosceles, parallel | quarter turn, mirror image, top view, side view | faces, edges and vertices; halves and quarters |

Grown-up lines in a 3–5 step speak to the grown-up by name: "Grown-up, hold the wall while your builder adds the roof."

## Accessibility

- axe runs on every screen in both themes in CI (Playwright); a violation fails the build.
- Targets are measured in CI per age (`e2e/design.spec.ts`).
- Reduced motion is honoured everywhere (see Motion).
- The app works on mute: every spoken line is also on screen for 6–10, and pictures carry 3–5.
- Every picture a child can tap has a spoken name and a screen-reader label; tile pictures are labelled "4 red squares".
- Grown-ups' text scales with browser zoom; nothing is fixed below 13 px.

## What is never allowed

Streaks, timers, scores, points, rewards to collect, characters who plead, "one more?" after a build, colour-only
signals, gestures beyond a tap on a 3–5 path, targets along the bottom edge, flashing, pink-for-girls or
blue-for-boys, a padlock on a project, ads, purchases, accounts, profiles, a camera, a project page (D18), anything
that leaves the iPad except a backup the grown-up saves.
