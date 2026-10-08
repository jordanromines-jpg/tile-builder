# The tile engine

Pure TypeScript, no React. It knows the tiles, proves a project can be built, and matches a project to a family's
tiles. The map is `docs/maps/engine.json` (draw it with Archify; see `docs/maps/README.md`).

| File | What |
|---|---|
| `catalog.ts` | The nine shapes (points in units of one square edge), six colours, four brands, the tall triangle's legs |
| `sets.ts` | Five set presets from `docs/research/tiles.md` |
| `themes.ts` | The eight themes |
| `ages.ts` | The age bands as data: tiles a step, tiles a project, the view, read-aloud |
| `schema.ts`, `types.ts` | zod schemas for a project, an inventory, settings, progress and a backup; their types |
| `geometry.ts` | World polygons, edges that meet, the table, layers, overlap, tiles that pass through each other |
| `check.ts`, `problems.ts` | The checker and its rules |
| `match.ts` | Matching and swaps |

## How a tile is placed

`pos` is where the tile's base corner (its point `(0, 0)`) goes. `rot` is `[tilt, turn]`: the tile tilts about its own
base edge, then turns about the vertical (Euler order YXZ, as three.js and the prototype). A wall has tilt 0; a tile
lying flat has tilt −π/2; a roof triangle's tilt is worked out from its legs (`−asin(0.5 / h)`), so the four apexes meet
over the middle of a square whatever the brand. Use the helpers in `src/projects/helpers.ts` rather than writing
numbers by hand.

## The rules

A project ships only when `npm run check:projects` passes it under every tall-triangle leg (1.5, 1.867, 1.877, 2.2).

| Rule | In words |
|---|---|
| R1 meets | Every tile meets another tile along an edge (within 0.001, overlapping 98% of the shorter edge), or is on the table |
| R2 no overlap | No two tiles in one plane overlap; no tile passes through another. Tiles that touch along an edge, or rest an edge on a face, are fine |
| R3 grounded | Through edges that meet, every tile is joined to a tile on the table |
| R4 steps | The steps place tiles 0 to n−1 once each, in order; each tile meets something built so far (or this step), or is on the table; after each step R3 holds |
| R5 layers | No step places a tile more than one layer above the top so far (a layer is the whole number under a tile's lowest point; a tile reaches every layer up to its highest point, so a big square standing up reaches two) |
| R6 stands | After every step: a standing tile on the table has a neighbour at a side edge (not in flat projects); a standing tile above the table sits its bottom edge on an edge, or spans a gap with two edges met; a flat tile above the table rests on two edges; a leaning tile's base edge sits on a top edge of an upright tile |
| R7 pyramids | Leaning tiles are triangles in whole pyramids: four of one kind (three over a triangle) whose apexes meet, all placed in one step |
| R8 brands | R1 to R7 hold for every leg; a project using rectangles, windows, doors or fences lists them in `needs.brandExtras` |
| R9 age | Steps hold at most 1, 3 or 4 tiles for 3–5, 6–8, 9–10 (a whole pyramid counts as one group); a project has 3–12, 12–40 or 30–100 tiles; a 3–5 project is flat or two layers at most |
| R10 holds up | On the finished build: a flat tile above the table rests on at least two top edges of standing or leaning tiles below it (not on other flat tiles; a fan of six triangles round a point whose outer edges are held is locked and counts); every tile except one flat on the table is held along at least two of its edges (the table counts for a tile standing on it); every row of standing tiles in one plane and layer touches a tile at an angle along a side or top edge (code: `hold.ts`). A crash obstacle (role `crash`, 2.7) skips the first two: it is built to be knocked down. It keeps the third (2.8): built to fall is not built to fold, so a crash wall has corners or returns and stands until it is hit; only a single row standing on the table with nothing on it (dominoes) may stand alone |
| R11 ramps (2.7) | A ramp (role `ramp`: a square, big square or rectangle leaning from its bottom edge to its top edge) leans; its bottom edge rests on the table, a support or the ramp below, and its top edge on a support or the ramp above; two ramps meeting at an angle have a support under the join; and (2.8) no join hangs in mid-air, because a magnet join is a hinge and a truck folds it: every join has a support or a brace under it. A brace (role `brace`) is a square leaning from the face of the next tower up to the join, so it, the ramp tile above and the tower wall make a triangle that can't fold (code: `ramps.ts`) |
| R12 stands firm (2.8) | At every whole height, each structure (tiles joined together, not counting crash tiles or tiles flat on the table) is at most k times as tall above that height as it is wide there, across its narrowest way: k = 4 for Monster trucks (a moving load), 6 for the rest (from 2.8.2; until then trucks only). Checking every height means a low ring stuck to a tall thin tower's foot doesn't widen it. In a Monster trucks build, a flat tile above the table rests on two opposite edges, not on a corner (code: `stability.ts`) |

## Matching

Count by shape; colour is ignored. When the family is short, swaps are tried in this order: the project's own; four
tall triangles → four equilateral triangles, a whole pyramid at a time (a lower roof); a square → two corner triangles;
a rectangle → two squares; a big square → four squares. What is still short is `missing`. `state` is `can`, `swap`
or `need`. A family with two or more brands sees "best with one brand" on projects with a closed ring of more than six
tiles (`bigRing`), because a 75 mm and a 76.2 mm square differ by 1.6%.
