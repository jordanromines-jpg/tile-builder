# Live check, 10 Oct 2026 (after 5.4.4 and 5.3.6)

Status: recorded, not fixed (Jordan: "no fixes just record the issues rn"). Checked on
https://jordanromines-jpg.github.io/tile-builder/ in the app's browser at iPad size (1180 × 820), light and dark.
Seen:
- Library;
- a 3–5 build (the banana boat) to its finish;
- the castle: zoom, drag, steps;
- Make your own;
- the house in dark.

No console errors. Every request stays on the site (nothing leaves it). Each of the set's files loads once a page.

## Issues

| # | Where | What | How bad |
|---|---|---|---|
| L1 | Build, Make your own, finish (3D) | The table reads dark brown or olive, not the pale maple seen when developing (local Chromium). The same `wood_maple.ktx2` loads (200). Suspects: the KTX2 transcode target or its colour space on this GPU and browser, or the lighting. Needs a look on an iPad | High: the whole set's colour |
| L2 | Build (3D), zoom | The scroll wheel and trackpad scroll hardly zoom. iPad pinch is not tested here | Medium |
| L3 | Build (3D), pan | A drag turns and tilts the view; there is no pan. The tilt goes from straight down onto the table to table level | Medium |
| L4 | Build (3D), seam | At a low tilt, the 3D table's back edge meets the flat room picture in a visible line. The room picture doesn't move as the camera turns (no parallax), so the room reads as a flat backdrop | Medium |
| L5 | Build (3D), animation | A tile flying in casts a long shadow far from it (the key light is low at the side), a dark square detached on the table | Medium |
| L6 | Build, animation | The flat 2D Pip hops over the 3D build and stands inside it (in the castle's courtyard, on the tiles); it doesn't know where the build is in 3D | Medium (5.3.3 replaces it) |
| L7 | Build | The "Ready to use without Wi-Fi" notice covers the build's title while it shows | Low |
| L8 | Build, Get your tiles | Three kinds of tile and the card already scrolls: each row is tall, the card short | Low |
| L9 | Finish | The falling celebration tiles look dark and muddy next to the build's tiles (dull frames, dark glass) | Medium |
| L10 | Finish (3–5) | Only the celebration pile is on the table, not the boat that was built (check whether that is by design) | Check |
| L11 | Library, buttons | The picked age and the orange buttons (Start, Next, Back to the shelf) are a muddy brown-orange, not the boards' bright candy orange: the keycap's lower shading is too heavy on orange | Medium |
| L12 | Make your own | A big bright glint of the key light in the middle of the empty table | Low |
| L13 | Dark, Build | "It fell down" is a glaring bright yellow on the evening screen | Low |
| L14 | Build (3–5) | The step's sentence is screen-reader-only for 3–5, with the tile picture shown and the sentence spoken: by design, not a bug | None |

## Characters (from 5.3.6 and 5.3.1)
- The wave and cheer barely move the stub arms.
- The far eye's lid shows as a pale bump on blink, and lids are a little paler than the skin.
- The snail's head eyes don't blink (only its stalk eyes).
