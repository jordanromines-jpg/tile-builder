# The product brief: Tile Steps

Read this before designing or building anything people see. It says who the app is for, its one job, and what it
must never become. The rules for how things look are in `DESIGN.md` (from PR 2.6); the plan is
`plans/2026-10-02-tile-builder.md`. The name is Tile Steps (Jordan, 2 Oct 2026, at G1); the repo and the research keep
the working name "Tile Builder".

## Who it is for

A family with magnet tiles and an iPad.

| | The child, aged 3 to 10 | The grown-up |
|---|---|---|
| What they do here | Pick a project and build it, step by step | Enter the family's tiles once; set the voice and sound; keep a backup |
| What they bring | A pile of tiles, often too few triangles and big squares (`parent-voice.md`, themes 2 and 3) | Five minutes, once |
| What they can't do | Read, if they are 3 to 5; follow written steps alone (`parent-voice.md`, theme 7) | Sit beside every build |
| Where the iPad is | Stood up beside the tiles, not in a lap (`child-development.md`, "How the app should hand off") | |

## The one job

**Pick a project you can build with your tiles, and build it, step by step.**

Two taps from opening the app to the first step (D18). Everything else serves that.

## What it is not

- Not a toy on the screen. The building happens on the table; the screen is the recipe card.
- Not a lesson. It never claims to teach maths; that is unproven (`child-development.md`, section 3).
- Not a store. "Need 2 more" never means "buy more" (`parent-voice.md`, theme 11).
- Not a photo album and not a profile system. No camera, no profiles, no project pages (D18).

## How it differs

| | What it does | Where we differ |
|---|---|---|
| EverPieces | 100+ guided 3D builds, any brand, no ads or account; 3 of its 4 "Worlds" cost money | It is led by a parent. Every step is a picture first and can be read aloud with a tap, so a 4-year-old can run it alone, and we check each project against the family's own tiles |
| Magniko | Keeps an inventory and shows only what you can build; community designs | It hides near misses. We show them as pictures of the missing tiles, and offer swaps (short triangles for tall ones) |
| Tilbo (not out) | A daily build matched to age and the tiles at home; photos, stickers, streaks | It uses streaks and a daily nudge. We have none: no streaks, timers or rewards to collect |

Sources: `competitors.md`, sections 1, 2 and 9. Said plainly, the threats are that EverPieces has more than three times our 30
projects and is in the App Store, where parents look, and that Magniko and Tilbo already claim "what can I build with
what I have". We win on a child running it alone, on near misses and swaps, and on calm.

## What it should be

1. **Two taps to building.** Open, tap a project, step 1. No sign-in, no setup for the child.
2. **Usable by a child who cannot read.** Pictures first; every step read aloud on a tap; every control speaks its name on
   tap (`kids-and-ipad.md`; `kids-app-design.md`, section 2).
3. **Honest about the family's tiles.** "You can build it!", "You can build it with a swap", or "Need 2 more" drawn
   as the missing tiles. Near misses are shown, never hidden. Colour is a preference, never a requirement.
4. **Nothing leaves the iPad.** No account, upload, analytics or ads. A backup file is the only way data moves.
5. **Calm.** No streaks, timers, scores, points or prizes to collect; no "one more?" after a build. The finished build
   on the table is the prize (`child-development.md`, section 4).
6. **The same for every child.** No boys' and girls' sections; no theme or colour drawn for one or the other
   (`child-development.md`, section 7).

## The age bands

A project belongs to one age band. The age picker on the Library chooses which shelf a child sees first (D19), and
the project's band sets how its build mode behaves. From `child-development.md`, the table "What this means for Tile
Builder"; the evidence behind each number is there.

| | 0–3 (2.5) | 3–5 | 6–8 | 9–10 | 11–16 (2.1) |
|---|---|---|---|---|---|
| New tiles a step | up to 12: a row of a mosaic, or one cube or pyramid | 1 | up to 3 | up to 4, or one ring of four | up to 6, or one pyramid |
| Tiles in a project | 9 to 200: most from one 100-piece set, the biggest pictures from two | 3 to 12 | 12 to 40 | 30 to 100 | 60 to 200: most need two 100-piece sets |
| The 3D model | Turn and zoom freely; a flat mosaic is seen from the front and well above, the right way up, like a picture | Still, from the child's side; ◀ ▶ turn it a quarter at a time; never turns by itself during a step (D10) | ◀ ▶ and drag to turn; back to the child's side on each new step | Turn and zoom freely; turns slowly on its own until touched | As 9–10 |
| Read aloud | As 3–5, with the words shown: they are for the grown-up | Off by default (2.0): a tap on Hear again reads the step; a grown-up can turn reading on in Settings | The same | The same, with the words shown | As 9–10 |
| The grown-up | Builds it, for the baby to look at; the first step says magnet tiles are made for 3 and up: stay close, and put away any cracked tile | Builds beside the child; some steps speak to them ("Grown-up, hold the wall") | Nearby; helps if it falls | Optional | Optional; a second pair of hands for tall towers |
| Smallest kid button | 64 px | 88 px | 80 px | 64 px | 64 px |

0–3 (2.5) is for grown-ups who build for babies and toddlers: mosaics in bright colours (a rainbow, a heart, a happy
face, a duck, a colour wheel) and simple shapes (a cube, a pyramid, a rainbow tower). Its shelf comes last unless it is
the band picked. 2.6 doubles it to 64 and leans on the big squares (a whole robot's head, a sun, a big cube, a tunnel
for a toy car) and on triangles laid against the squares' edges for roofs, rays, petals, fins and spikes.

## Monster trucks (2.7)

A section of its own, a Monster trucks shelf on the Library and a filter chip, for every age: arenas, ramps, jumps,
drops and crashes for 1:64 Monster Jam trucks (about 7–8 cm long). One small square is one lane, a big square two.

- **Ramps hold a truck (2.8).** Every ramp is 30°: a square rises half a square, a big square a whole one. Every
  magnet join is a hinge, so no ramp join hangs in mid-air: a tower stands under every whole height, and a square
  ramp's half-height joins each get a brace, a square leaning up from the next tower that locks the join in a
  triangle (checker rule R11). Towers over four squares high are two squares across, so they don't tip (R12).
- **Big air and drops.** Kickers launch a truck over a gap onto a landing ramp; mega ramps and drop towers start eight
  squares up.
- **Things to crash.** Crush cars, walls of doom, dominoes and skittles are built to be knocked down, so they may
  wobble, but they stand until they are hit: a wall to smash has corners or returns, never a flat stack (2.8).
- **Engineering you can see (2.8).** Builds follow real principles: triangles don't fold, wide bases don't tip, load
  goes down through walls, decks rest on two opposite walls. For 9–16, the step that uses one says why, in a line.
- **Big.** The biggest builds are wider than a metre and take up to four 100-piece sets.
- **Safety.** Crashing is the point, but trucks are driven, not thrown. 0–3 builds are for a grown-up to build and
  drive, as for the rest of that band.

Project names are meant to make children laugh (the Burping Volcano, the Castle of Infinite Snacks); the engineering
underneath is real, and every project passes the checker, including its rule that every build holds up like real
tiles (2.3): roofs rest on walls, nothing hangs by one edge, and no wall stands without something bracing it.

## Wildflowers (2.9)

A section of its own, a Wildflowers shelf on the Library and a tulip chip on the filter: 50 flowers native to Kansas,
Chicago (northern Illinois) and North Carolina, ten for each age, each region in the title (17 Kansas, 17 Chicago, 16
Carolina). Every flower was checked as native against a source (state wildflower sites, extension services, Illinois
Wildflowers), and every build ends with one true fact from those sources: the state flowers (sunflower, violet,
dogwood), the pollinators, the Venus flytrap growing wild only near Wilmington.

- **Colour honesty.** Tiles come in six colours. When a flower's real colour isn't one of them (white dogwood, pink
  coneflower, a brown sunflower middle), the build uses the nearest and says so once: "Dogwood flowers are white; we
  use yellow."
- **They stand like real tiles.** A magnet joint is a hinge, so an open flower can't stick out sideways off a thin
  stem: flower heads are closed shapes of leaning triangles (buds, cones, spikes), standing flowers grow from a pot,
  and a bouquet's stems share walls so they stand as one plant. The flat pictures for the youngest lie on the table.
- **By age:** flat pictures for 0–3 and 3–5, potted flowers for 6–8, bouquets and window boxes for 9–10, and gardens,
  a wreath, a bog and the three state flowers for 11–16.

## The screens

1. **Library.** The age picker, the theme filter, shelves of project cards with their badges, the grown-ups door.
2. **Build mode.** The 3D model, this step's tiles as pictures with counts, the spoken line, Next, Back, Hear again,
   the turn buttons, "It fell down".
3. **Well done.** A short celebration, the build's own line ("You built the castle!"), then "Put the iPad down and
   play with what you made", and one button back to the shelf.
4. **Grown-ups side**, behind the door: Tiles (start from a set, then − and +), Settings, Backup.

Nothing else. A new screen is a decision with Jordan's word (D18).

## Voice

Plain statements in sentence case, said to the child as "you" or "builder". Short sentences a 4-year-old can follow.
No exclamation marks, except the two moments that earn one: "You can build it!" and the end of a build. No failure
sounds, red crosses or scores. Shape words are used naturally, never drilled.

| Moment | The words |
|---|---|
| A step, 3–5 | "Put a red square next to the blue one." |
| A swap | "Short on tall triangles? Four short triangles make a lower roof." |
| A tower falls | "Towers fall sometimes. Builders fix them." Then "Go back one step" or "Start this layer again". After two falls: "Ask a grown-up to hold it while you add the next tile." |
| Missing tiles | "You need 2 more ▲ for this one." Then "Start anyway" or "Pick another" |
| The end | "You built the castle! Look how tall the keep is." Then "Put the iPad down and play with what you made." |
| The grown-ups door | "This door is for grown-ups." |

## What never changes

- No account, profile, camera, upload, AI-made project, ad, purchase, streak, timer or score.
- Every project is written by hand and passes the checker for every brand before it ships (D3).
- Colour is a preference; nothing is told apart by colour alone (the six tile colours also have a pattern and a
  spoken name).
- Every kid action is a tap; nothing a 3-to-5-year-old needs is behind a drag (`kids-and-ipad.md`).
- The finished build is the prize.

## How we know it works

Jordan's testing after the build (the plan's T1 to T5):

- A grown-up enters a family's tiles from a set in under five minutes.
- A 3- or 4-year-old picks a project and finishes it with only the app's help.
- A 6-to-8-year-old finishes one alone.
- A 9- or 10-year-old builds the castle, and can't open the grown-ups door.
- It works with Wi-Fi off, and a backup restores everything.

## The name

Jordan picked **Tile Steps** at G1 (2 Oct 2026: "Tile Steps, keep going."). The three proposals, each searched on the web on 2 Oct 2026 for an existing product of the same name.

| Name | Why | What the search found |
|---|---|---|
| **Tile Steps** (chosen) | Says what it does: your tiles, one step at a time. Easy for a 4-year-old to say | No app or product of that name |
| Bright Builds | The light through coloured tiles; a happy word | No exact match; close to "Bright Kids" (a preschool app) and "Bright Bricks" (a brick-art company) |
| Pane Builder | Tiles as panes of coloured glass | No app of that name; harder for a young child to say |

Ruled out by the search: "SnapStep" (an app on Google Play), "Tile Time" (a mahjong app and a puzzle game), "Click
Clack" (a brick toy and its build apps), "Tilewise" (two apps).
