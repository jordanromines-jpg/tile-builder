# Tile shapes, sizes and set contents

Research for the tile catalog and the inventory presets, 2 Oct 2026. Values were found by web search. This session's
network blocks the manufacturers' sites, so no product page was read directly. Each row says how sure we are.
Before a value goes into the catalog as "confirmed", someone measures a real tile with a ruler.

## Shapes and sizes

One unit is the edge of the standard square. The geometry checker works in these units.

| Shape id | Magna-Tiles | PicassoTiles | Connetix | Generic 3-inch | Confidence |
|---|---|---|---|---|---|
| `square` | 3 in (76.2 mm) edge [1][2] | 3 in [7] | about 75 mm, sold as compatible with Magna-Tiles [3][4] | 3 in | Magna and Picasso confirmed; Connetix likely |
| `square-large` | 6 in [1] | 6 in [7] | 6 in [5] | 6 in | likely |
| `tri-equilateral` | 3 in sides [1] | "small triangle, 3 × 3 in" [7] | yes [5][6] | 3 in | likely |
| `tri-right` | 45-45-90 with 3 in legs; two make a square [8] | "medium triangle, 3 × 4 in" (3 in legs, 4.24 in long side) [7] | "right angle triangle" [5][6] | 3 in legs | likely |
| `tri-isosceles-tall` | 3 in base; legs **143 mm ± 5** (1.88 units), measured from photos against a printed scale [15] | "tall triangle, 3 × 5.5 in"; 7.5 cm base, 14 cm legs (1.87 units) [7][9] | 3 in base; leg length **not found** | varies | Magna measured (one project, ±5 mm); Picasso listed; Connetix unknown |
| `rect-2x1` | none in the classic sets | none in the classic sets | short rectangle, 2 squares long; also 3 and 4 squares long [10] | rare | likely |
| `window`, `door`, `fence` | none in the classic sets | none in the classic sets | in the Starter and Creative packs [5][6] | rare | sizes not found |

### What this means for the engine

1. **Squares are close but not identical.** 75 mm against 76.2 mm is a 1.6% difference. Magnets close a gap that small,
   so mixed-brand walls stand. A closed ring of more than about six mixed tiles may not meet exactly, so the checker
   treats one unit as the same for every brand and the app says "best with one brand" on large closed loops.
2. **The tall triangle may differ by brand.** Magna-Tiles (143 mm, measured by an independent project [15]) and
   PicassoTiles (14 cm, listed) are within about 3 mm of each other, so they are close to interchangeable; Connetix is
   unknown. The checker takes the leg length as a setting for each brand. Four
   tall triangles leaning in over a square close into a pyramid whatever their length, **as long as all four are the
   same kind**. So a project step that uses tall triangles says "4 of the same kind", and the checker validates the
   project with each brand's leg length.
3. **Unknown sizes are measured, not guessed.** If a family's tall triangle is unknown, the parent screen asks them to
   lay it next to two squares and tap the picture that matches.
4. **Connetix extras** (rectangles, windows, doors, fences) are in the catalog. Projects that need them say so, and
   families without them never see those projects marked "you can build this".

## Set contents (inventory presets)

| Brand | Set | Squares | Large squares | Equilateral | Right | Tall isosceles | Other | Total | Sums? | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Magna-Tiles | Clear Colors 32 | 14 | 2 | 8 | 4 | 4 | | 32 | yes | [11] |
| Magna-Tiles | Clear Colors 100 | 50 | 4 | 20 | 11 | 15 | | 100 | yes | [12][13] |
| PicassoTiles | PT100 Classic Starter | 46 | 8 | 20 | 12 | 14 | | 100 | yes | [7] |
| Connetix | Rainbow Starter Pack 60 | 24 | 6 | 6 | 6 | 6 | 6 windows, 6 doors | 60 | yes | [14] |
| Connetix | Rainbow Creative Pack 102 | 36 | 6 | 12 | 12 | 12 | 6 windows, 6 doors, 6 rectangles, 6 fences | 102 | yes | [6] |

Still to find: a Magna-Tiles 48 or 74 set, PicassoTiles 60, and one best-selling generic set. Presets are a starting
point; the parent always adjusts the counts.

## Sources

1. [Magna-Tiles Classic 100-Piece Set](https://magnatiles.com/products/magna-tiles-classic-100-piece-set)
2. [Magna-Tiles from Kaplan](https://www.kaplanco.com/magna-tile)
3. [Are all magnet tiles compatible? (Babycoo)](https://babycoo.com.au/blogs/magnetic-tiles/are-all-magnet-tiles-compatible)
4. [Magna-Tiles vs Connetix (Panda Mommy Teacher)](https://pandamommyteacher.com/detailed-review-on-magna-tiles-vs-connetix-which-one-to-choose/)
5. [Which Connetix sets are best (The Fairy Glitch Mother)](https://thefairyglitchmother.com/which-connetix-magnetic-tiles-and-sets-are-the-best/)
6. [Connetix Rainbow Creative Pack 102 (Brightbean)](https://brightbean.com/en-us/products/connetix-rainbow-creative-pack-102-pieces)
7. [PicassoTiles PT100 Classic Starter Set](https://www.picassotiles.com/products/picassotiles-100-piece-set-magnet-building-blocks-pt100)
8. [Hands-on geometry with Magna-Tiles (Go Science Kids)](https://gosciencekids.com/magnatiles-geometry/)
9. [PicassoTiles 12-piece Tall Triangle Expansion Pack PTE03](https://www.picassotiles.com/products/picassotiles-12-piece-tall-triangle-expansion-pack-pte03)
10. [Connetix vs Magna-Tiles (Crafty Kids Play)](https://craftykidsplay.com/connetix-vs-magna-tiles/)
11. [Magna-Tiles Clear Colors 32 (Kaplan)](https://www.kaplanco.com/product/147487/magna-tiles-32-piece-clear-colors-and-car-expansion-set?c=52%7CFM1005)
12. [Magna-Tiles Clear Colors 100 (Kaplan)](https://www.kaplanco.com/product/48099/magna-tiles-100-piece-clear-colors-set?c=52%7CFM1005)
13. [Magna-Tiles Clear Colors 100 (Fat Brain Toys)](https://www.fatbraintoys.com/toy_companies/magna_tiles/magna_tiles_clear_colors_100_pc_set.cfm)
14. [Connetix Rainbow Starter Pack 60](https://connetixtiles.com/product/rainbow-starter-pack-60-pc)
15. [Sunrise Labs, magna-tiles-build-kit](https://github.com/Sunrise-Labs-Dot-AI/magna-tiles-build-kit), `lib/magnetic-tiles/catalog.ts` (MIT; read 2 Oct 2026): `ISOSCELES_EQUAL_SIDE = 143 / MM_PER_INCH`, noted "measured-but-noisy (±~5mm); isosceles re-shoot recommended"; tile thickness 0.18 in. The project checks builds with a physics engine and says itself that "a passing simulation is not proof that a real build works"
