# The research, on one page

Desk research done on 2 Oct 2026 for the brief (`PRODUCT.md`) and the plan (`plans/2026-10-02-tile-builder.md`).
No families were interviewed (D13). Most web pages could not be opened from the research session, so many facts come
from search-result summaries; each file's first section says how far to trust it, and quotes marked "search" should
be checked on the page before they are used outside this repo.

| File | What it covers | How far to trust it |
|---|---|---|
| `tiles.md` | Tile shapes and sizes by brand; five set presets | Sizes from listings, plus one independent measurement of Magna-Tiles' tall triangle; measure a real tile before calling a size confirmed |
| `parent-voice.md` | What parents and teachers say: 12 themes, jobs to be done, three family sketches | Forums, reviews and blogs read as search summaries; no Reddit, no app-store reviews |
| `competitors.md` | EverPieces, Magniko, Tilbo, the brands' idea books, LEGO Builder | Search extracts of product pages; prices and ratings mostly not confirmed |
| `child-development.md` | What children 3 to 10 can copy, tiles per step, turning a 3D view, rewards, screens, gender | Peer-reviewed abstracts and official guidance; sections 4 to 7 partly unverified (marked) |
| `kids-app-design.md` | Kids' app design: reference products, pre-reader navigation, type, colour, touch, motion, sound, gates, rewards | 81 sources, each marked read, search summary, or not opened; font renders and a colour-blindness simulation run locally |
| `kids-and-ipad.md` | Touch and gestures by age; how iPad Home Screen apps keep data | WebKit and NN/g pages via search; the storage rules are well sourced |
| `primary-research-plan.md` | A home-session method for talking to families | Not run (D13) |

## What most shaped the brief

**From parents.** Every family runs short of tiles, triangles and large squares first ("We have 100 and it's not
enough"). Families pay for build ideas that don't know what they own. Children can't follow written steps alone, so
the parent is pulled back in. A 3-year-old lays tiles flat until building "kicks in" around 4; older children want
bigger builds, not more of them. Screen-time worry and a dislike of ads and purchases are strong.

**From the competitors.** EverPieces already has 100+ guided 3D builds; Magniko already matches builds to an
inventory, and hides what you can't build; Tilbo will pitch builds matched to the tiles at home, with streaks. Not
found anywhere: steps read aloud for a child who can't read, near misses drawn as the missing tiles, swaps, and each
brand's tall triangle. Every competitor is led by a parent.

**From child development.** Copying a model starts at about 4 and is strong by 8. Visual working memory holds about
1.5 items at 5, 3 at 7 and 4 at 10: hence 1, 3 and 4 tiles a step. Turning a 3D view is hard before 7, so the
youngest get a still model and quarter-turn buttons. Rewards that are expected undermine interest, so the finished
build is the prize. Tablets pull children into solitary play, so the iPad stands beside the tiles and the voice
carries the step.

**From kids' app design.** Every kid action is a tap; nothing a 3-to-5-year-old needs is a drag, pinch or swipe.
Colour needs a second cue: in a colour-blindness simulation, red and green tiles nearly merge, so each tile colour
also has a pattern and a spoken name. Calm apps (Pok Pok) use few colours, soft real-object sounds and one sound per
meaning. Text for early readers is larger than adult text (about 40, 32 and 26 px by age band).

## Open questions carried into the plan

| # | Question | Where it stands |
|---|---|---|
| Q1 | The tall triangle's length for Connetix, and a second measure for Magna-Tiles | Magna-Tiles measured once at 143 mm ± 5 (`tiles.md` [15]); PicassoTiles listed at 14 cm; Connetix unknown. The grown-ups side lets a family pick the matching picture |
| Q2 | The app's name | Three proposals in `PRODUCT.md`; Jordan picks at gate G1 |
| Q3 | Sound effects beyond the voice | Off by default; a switch in settings |

Also not known, and only testing with children will tell (the plan's T2 to T4): whether a 3- or 4-year-old can follow
a still 3D model one tile at a time, whether drag-to-turn helps a 6-to-8-year-old, and whether the read-aloud voice is
welcome.
