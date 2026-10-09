# Builds in the colours a family has (proposed)

**Status:** approved 9 Oct 2026 ("go"), built as 4.3. Jordan: "The colors don't match what's available in the
sets." Asked how (9 Oct): **both**: each set's preset brings its real colours, a grown-up can change the counts by
colour, and every build recolours to what the family has. His sets: **Magna-Tiles Clear Colors 100** and
**PicassoTiles PT100**.

## What the code is today (read 9 Oct)
- Every placed tile of all 445 builds has a designed colour (26 719 tiles), drawn in the 3D, named in the steps ("4 blue
  squares") and in the tiles list, and baked into the library pictures.
- Matching (`engine/match.ts`) ignores colour by design ("a preference, never a requirement"); it swaps shapes when
  short (`instead`, applied when the step is shown: `screens/build/stepTiles.ts`, `three/Model.tsx`).
- The inventory can already hold counts by colour (`Count.byColour`, `store/inventory.ts`), and the grown-ups' Tiles
  screen already has a colour stepper per shape (`screens/grownups/Tiles.tsx`). Nothing reads them.
- Set presets (`engine/sets.ts`) have shape counts only. **No maker publishes a set's colours by shape**: searched
  Magna-Tiles' and PicassoTiles' own pages and retailers; they list shapes only.

## What
### C1 · Real colours in the presets (needs Jordan, ~20 min with the boxes)
1. Jordan counts his two sets by shape and colour (or sends a photo of each shape sorted into colour rows; I count from
   the photo). A table to fill in goes with this plan's PR as `docs/research/set-colours.md`.
2. `SetPreset.colours?: Partial<Record<ShapeId, Partial<Record<Colour, number>>>>`, each shape's colours summing to its
   count (a test). Magna-Tiles 100 and PicassoTiles 100 from Jordan's counts. The other three presets (Magna-Tiles 32,
   the two Connetix packs) stay colourless until someone counts one: their builds keep their designed colours.
3. Choosing a preset fills `byColour` too; adding a second set adds its colours.
4. Colours a set has that the app doesn't draw (white, pink, clear, a second blue…) are counted as the nearest of the six,
   and the table says which (CLAUDE.md: say so when a real colour isn't available).

### C2 · Recolouring (`engine/recolour.ts`, pure, ~3 h)
`recolour(project, inventory, instead): Record<number, Colour>`, which tiles change colour and to what. Rules, in order:
1. A shape with no colour counts (or counts that don't cover what the build uses) keeps its designed colours for the
   uncounted part: colour never makes a build "need" more tiles. The card's can/swap/need is unchanged.
2. Every tile that can keep its designed colour does.
3. The rest move **as groups**: tiles of one shape and one designed colour within a step (a red roof, a blue wall)
   change together to one colour where they fit, so a roof doesn't come out striped.
4. A group goes to the colour **nearest in hue** that has room (red → orange → purple, blue → purple → green…), then to
   the colour with the most left. Deterministic (same build, same tiles → same colours).
5. Swapped tiles (`instead`) are coloured as what they're built with: two corner triangles standing in for a red square
   are red if the family has red corner triangles.
Tests: keeps everything with enough of each colour; a red roof with 2 red triangles left becomes one other colour, not
mixed; nearest hue; no colour counts → no change; swaps; never more of a colour than the family has; deterministic.

### C3 · Showing it (~2 h)
1. Build mode, Watch it build, All steps, Get your tiles and the finish draw and name the family's colours: the 3D
   (`Model.tsx`), the step's tiles (`stepTiles.ts`), the tiles list (`TileList.tsx`), the falling finish tiles.
2. **Library pictures stay as designed** (they are drawn ahead of time, 445 of them). The tiles list says, when anything
   changed: "Built in your colours: the picture shows the colours it was designed in."
3. The grown-ups' Tiles screen: the colour steppers open with the preset's counts; a line under each shape when its
   colours don't add up to its count ("6 squares have no colour yet: they keep the build's colours").
4. Motion reduced, every look, light and dark: unchanged apart from the colours.

### C4 · Tests, checks and docs (~1 h)
Unit (C2's list; presets sum; choosing a preset fills colours). e2e: with PicassoTiles 100's colours, a build whose
designed colours it lacks shows the family's colours in the step and the list, and says so; with no colours entered,
nothing changes. Plates only after looking. PRODUCT.md (colours), DESIGN.md, CHANGELOG `4.3.0`, build-log row.

## Not in this plan
- Redrawing the library pictures per family (they'd have to be drawn on the iPad).
- Matching by colour ("needs 2 more red"): colour stays a preference, as now.
- Shades (light blue, dark blue): the app keeps its six colours.

## Decisions for Jordan
| # | Question | Proposed |
|---|---|---|
| E1 | Count the sets yourself, or send photos? | Either; photos sorted into rows by colour are quickest for you |
| E2 | The library picture shows the designed colours, the build shows yours | Yes, with the line in the tiles list |
| E3 | Sets nobody has counted (Magna-Tiles 32, Connetix) | Keep designed colours until counted |

## Estimate
About 6–7 hours after the counts, one PR (4.3).

## Changes after the go (Jordan, 9 Oct: "nothing depends on my counts you just have to get the colors and # of color options right")
- C1 needs no counts from Jordan: each brand's colours come from the makers' own photos (no maker lists them):
  Magna-Tiles 6, PicassoTiles 8 (light blue and pink too), Connetix 6. Each shape is spread evenly over its brand's
  colours (`spread`); a family that chose its set before 4.3 gets the same, read at build time.
- So the app gains **light blue** (`sky`) and **pink**: tokens in both themes (rims pass 3:1), patterns (vertical
  stripes, rings), tile pictures. Builds are still designed in the six.
- C2 rules, as built: a colour that fits keeps all its tiles; one that doesn't moves whole to one colour if one has
  room; then step groups; a shape the family is short of keeps its designed colours (spreading too few would only
  stripe it).
- C3 adds: each step's line is rewritten to its tiles' new colours (a colour word read with the shape after it; one
  split over colours loses its word; "a"/"an" follows).

## Build log
| Date | Key | Branch | Est · actual h | What happened | Next |
|---|---|---|---|---|---|
| 2026-10-09 | 4.3 | `colours-4-3` | 6.5 · 4 | Built as above. Across the builds each set can make, about 40% of tiles change colour (Magna-Tiles 100: 2 944 of 7 771; PicassoTiles 100: 3 799 of 7 473). 385 step lines rewritten; checked by a script for broken articles, empty words and doubled spaces (none). Looked at: every shape in all eight colours; the duck and the hedge zoo with both sets (list and finish). Plates unchanged (the plated builds are short of squares with their sets, so keep their colours). | — |
