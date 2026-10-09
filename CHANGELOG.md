# Changelog

## 3.8.0 · 9 Oct 2026

All steps. Jordan: "I should be able to see all the steps for a project and scroll through them to jump ahead or see
and surf without having to go through next every time."

- **All steps** in the top bar opens every step at once: a slider that builds and unbuilds the model in 3D as it moves
  (letting go keeps that step), and a strip of little pictures, one a step, to swipe through and tap.
- **Every age can tap a step dot** to go straight there (it was 9–10 and up).

## 3.7.0 · 9 Oct 2026

Get your tiles. Jordan: "There should also be a materials list when you start a project."

- **A fresh build opens on its tiles:** every tile it takes, one row a shape and a chip a colour with its count, the
  finished build beside them and the total ("78 tiles in all."). Swapped tiles show as what stands in for them.
- **What's short is on the same card,** with Start anyway and Pick another; the separate short-of-tiles note is gone.
- **"Tiles you need"** in the top bar opens the list again at any step. A build picked up half-way skips it.

## 3.0–3.6 · 8–9 Oct 2026

Design polish (plan `2026-10-08-design-polish.md`). Three looks a family can choose on the shelf and in Settings: Toy
studio, Picture book and Clean studio, beside the classic one. Sound, with a mute. Quality that steps down on slower
iPads. Pip, the tile friend, on the step panel and at the finish. Split View layouts, a screen for a build that isn't
on the iPad yet, and screenshot tests for every look.

## 2.9.0 · 8 Oct 2026

Wildflowers: 50 flowers native to Kansas, Chicago and North Carolina (445 builds in all). Jordan: "flowers native to
Kansas, chicago, and North carolina. single flowers and bouquets and etc."

- **A Wildflowers shelf and chip.** The Library has a Wildflowers shelf after the Monster trucks one, and a tulip chip
  on the theme filter that shows only wildflowers, by age.
- **Ten for each age:** flat flower pictures for 0–3 and 3–5 (a Kansas sunflower with triangle rays, a dogwood of four
  big squares, a six-pointed Carolina lily, a Venus flytrap with triangle teeth); potted flowers for 6–8 (a coneflower,
  a blazing star spike, a Turk's cap lily); bouquets, window boxes and a trellis for 9–10; and for 11–16 the region
  bouquets, a prairie with twelve flowers, a sunflower field, a pollinator garden, a woodland, a big wreath, a bog with
  flytraps and pitcher plants, and North Carolina's dogwood with the two other state flowers.
- **True to life.** Every flower was checked as native to its region; every build ends with a true fact from those
  sources; a colour that tiles don't come in is said once ("Dogwood flowers are white; we use yellow").
- **They stand.** Flower heads are closed shapes, tall flowers grow from a pot, and a bouquet's stems lean on each
  other, so every build passes the 2.8 rules. For 9–16, a step says why.
## 2.8.2 · 8 Oct 2026

Every build stands firm, not just the trucks. The rule from 2.8 (R12) now covers every project: at every height, a
build is at most six times as tall as it is wide there, so a tall thin tower doesn't tip when a hand brushes it.

- **22 builds made steadier, each still itself.** Lighthouses, rockets, the space elevator, the wifi tower and the
  balloon launch tower now rise from a wider stepped base; toast towers and the hamster rope bridge stand on a toaster
  and a hamster den; a dragon's tower and a burger stand's sign are tied to the building beside them; the sock rocket's
  fins point four ways. A few are a little shorter: the baby rainbow tower lost its top (purple) ring, the cable car
  station and the pointy-opinions tower a ring each, the silly spiral its tallest cap.
- **The why, for 9–16:** the step that widens a base says so ("A wide base doesn't tip: two squares across holds it
  steady.").
- **A flat wall no longer slips through.** A wall one tile thick counts as no width at all; a foot added at the bottom
  doesn't make it stand.
- A test of the 3D view no longer fails at random: it waits until the shadow is drawn before taking its picture.
## 2.8.1 · 8 Oct 2026

The 3D view copes with the big builds. Jordan: "the canvas is also struggling with bigger builds": slow, too small,
parts vanishing, and blank.

- **No more blank screen.** The fog was fixed at 22 to 60 squares from the camera, and the camera stands 45 to 145
  away from the big truck builds, so they were drawn as plain background. The fog now starts past the model, at any
  zoom, and the table grows with the build, so its edge never shows.
- **Bigger on screen.** The view fits what is built by its width and its height apart, instead of a ball round it.
- **No hitch on Next.** Landed tiles merge in chunks; a 200-tile build's worst frame while stepping went from 67 ms to
  17 ms (on a Mac with its GPU).
- **Lighter frames.** The soft shadow is drawn when the model comes to rest, not on every frame (six passes a frame
  became one). Builds over 120 tiles use a lighter tile (a third of the triangles, the same look up close), draw at
  most 1.5 pixels a point, and turn by themselves once, then rest.
- **Pictures of tall builds** (the 8-high drop tower, the tallest tower, the space elevator and 14 more) are no longer
  cut off at the top; every other picture is unchanged.
## 2.8.0 · 8 Oct 2026

Fifty Monster trucks builds (395 builds in all), and every one of them now stands up like real magnet tiles and holds
a truck. Jordan, looking at the 2.7 builds: "this won't support any weight."

- **35 new truck builds**, for every age: a road loop, a bumpy road with two kickers and crush-the-cubes for 0–3; a
  knock-down wall, a ramp and drop, a little arena and a two-lane ramp for 3–5; a drag strip, the big tunnel, stair-step
  drops, a monster garage, a bounce bridge, a crash castle and a domino run for 6–8; big-air gap, a freestyle bowl, a bus
  jump, a figure-eight with a crossover bridge, a skills course, a donut circle, ramp-to-ramp, a cliff jump and a
  two-lane race with a tunnel for 9–10; and for 11–16 world finals freestyle, a backflip ramp, crash-zone city, a
  double-decker race, triple big air, the wall of doom, a spiral ramp round an 8-high tower, a canyon jump, a rollover
  pit, a train-yard crash, bridge-to-bridge and the ultimate arena. Nine reach 7–8 squares high, sixteen are wider than
  a square metre, and 39 use the big squares.
- **No ramp join hangs in mid-air (R11).** A magnet join is a hinge, and a truck folds it. Every whole height of a ramp
  now sits on a tower, and each half-height join of a square ramp gets a **brace**: a square leaning up from the next
  tower, which locks the join in a triangle. This replaces 2.7's "taut pair" of ramp tiles between supports.
- **Things to crash stand until they're hit.** A wall to smash has a corner or a return at each end of every row; a
  flat stack of squares would fold before a truck reached it. Only dominoes may stand alone.
- **It stands firm (new rule R12).** At every height, a truck build is at most four times as tall as it is wide there,
  so towers over four high are two squares across; and a deck a truck drives on rests on two opposite walls, never on a
  corner. The rule comes to every other project (at six times) in 2.8.2.
- **The why, for 9–16.** The step that uses a principle says it in a line: "Triangles don't fold: the brace locks the
  join."
- **The first fifteen, reworked.** All 2.7 builds pass the new rules. "Mega ramp from eight high" is now "Mega ramp and
  the eight-high tower": an 8-high ramp that stands firm would take more than four sets.
## 2.7.0 · 7 Oct 2026

Monster trucks: a section of the site for 1:64 Monster Jam trucks, for every age (360 builds in all).

- **A Monster trucks shelf and filter.** The Library has a Monster trucks shelf after the chosen age's shelves, and a
  truck chip on the theme filter that shows only truck builds, by age.
- **15 builds to start**, three for each age: a little ramp and road, a knock-down tower and a big-square garage for
  0–3; a first jump, a crush-car jump and a tunnel for 3–5; big air on two lanes, the crush-car row and a ramp to the
  roof for 6–8; a mega ramp four high, a five-high tower drop and crash-test city for 9–10; and for 11–16 the 8-high
  drop tower, a mega ramp from eight high with a kicker and a gap, and the Monster stadium (16 × 12 squares, more than
  a square metre, with a tunnel gate, a big-square jump, crush cars, a wall to smash and dominoes).
- **Ramps that hold a truck.** A new checker rule, R11: ramps are 30°, rest on the table, a support or the next ramp
  at both ends, and never run more than two tiles without a support underneath. Crash obstacles (crush cars, walls,
  dominoes) may wobble: they skip R10, but must stand while they are built.
- **A track kit** (`web/src/projects/track-kit.ts`): ramps with their support towers, kickers, towers and the 8-high
  big-square tower, lanes, crush cars, fences, dominoes, walls to smash, arena walls and tunnels.
- Truck builds are bigger than the other builds of their age (11–16: 100 to 420 tiles, up to four 100-piece sets);
  a whole ring of walls, a whole ramp or a step of big squares counts as one group.

## 2.6.0 · 7 Oct 2026

32 more builds for 0–3 (64 in the band, 345 in all), and much more use of the big squares and the triangles.

- **Big squares as big shapes.** A big-block robot, a house with a zigzag roof, a big cube beside a little one, a tunnel
  for a toy car over a two-lane road, a quilt of four big squares with bunting, a big sun with sixteen rays, a fish, a
  train, a rocket, a hedgehog and a crown. 14 of the 32 use big squares.
- **Triangles off the edges.** A new step lays triangles flat against the outside of a picture's squares, pointing out:
  roofs, rays, petals, fins, spikes, crown points and bunting, in equilateral and tall triangles.
- **More animals and treats.** A cat, a bunny, an owl, a penguin, a whale, a snail, a turtle, a bee, a frog, a
  strawberry, an ice cream, balloons, a kite, a present, a little car and a sunflower; and shapes that stand up: a cube
  on a cube, three pyramids, colour stairs, a house with a garden.
- **Checker.** R5 counts how high a tile reaches, so a big square standing up is two layers tall, and a roof can go on
  in the same step as the walls it rests on.
- The plan for what comes next, Monster trucks, is in `plans/2026-10-07-tots-and-trucks.md`.

## 2.5.0 · 7 Oct 2026

A new age band, 0–3, for grown-ups who build for babies and toddlers (313 projects in all).

- **32 builds for 0–3.** Mosaics that lie flat on the table, in bright colours: rainbow stripes, a big heart, a happy
  face, sunshine, a duck, a fish, a ladybird, a butterfly, a colour wheel, a twinkly star, a rainbow triangle, and the
  Picnic Blanket (140 tiles, with triangle bunting all round). And simple shapes that stand up: a cube and a pyramid,
  three colour cubes, a rainbow tower, a little house. 9 to 140 tiles; 24 build from one Magna-Tiles 100, and all
  from two.
- **A row a step.** A mosaic goes down a row at a time, with the colours read left to right for the grown-up ("10
  squares, red then yellow, and round again"); triangle rows say which way the first one points.
- **Seen like a picture.** Flat 0–3 mosaics are shown from the front and well above, in build mode and on their cards,
  so they read the right way up.
- **For the grown-up.** Step words always show, the model turns and zooms freely, and the first step says: "For a
  grown-up to build, for a baby to look at. Magnet tiles are made for ages 3 and up: stay close, and put away any
  cracked tile."
- The age picker has five pictures (0–3 is one small triangle); the 0–3 shelf comes last unless it is the band picked.

## 2.4.0 · 7 Oct 2026

The same app, quicker: it opens faster, the big builds turn smoothly, and the first install downloads far less.

- **Projects are built ahead.** The plans that lay out all 281 builds now run once, when the app is built
  (`npm run projects`), not on the iPad each time it opens. The app carries a small catalogue (names, ages, stars and
  tiles by shape) and fetches a project's tiles and steps when it is opened. The main bundle dropped from 888 KB to
  717 KB; the rest is React, the router, zod and Dexie.
- **A lighter Library.** Cards are matched against the family's tiles from the catalogue's counts, and each shelf draws
  12 cards at a time, adding more as it is swiped. The first card shows in 0.77 s instead of 1.16 s (CI, software GL).
  The portrait iPad no longer opens the 6–8 shelf scrolled to its end.
- **Smoother 3D.** Tiles that have landed join one mesh per colour, so a finished model takes 13 draw calls instead of
  261 (the Grand Hexagon Palace) or 157 (the castle). Only the step being built stays as separate tiles, for the
  drop-in and the glow. The picture sharpness eases down on an iPad that drops frames and comes back when it recovers.
- **A faster first install.** The offline copy no longer waits for all 281 project pictures (3.99 MB instead of
  10.4 MB). Pictures are kept as they are seen, and the rest are fetched quietly in the background when the iPad is
  idle, so everything still works offline.

## 2.3.0 · 2 Oct 2026

Every build now holds up like real tiles, and there are 100 more to build (281 in all: 16 for 3–5, 36 for 6–8, 64
for 9–10, 165 for 11–16).

- **Real-tile physics (checker rule R10).** Magnet joints are hinges, so the checker now asks three more things of
  every build: a flat tile above the table rests on two walls below it, not just on other flat tiles (a hexagon of six
  triangles counts, because it locks); every tile is held along two of its edges, so nothing hangs from one edge; and
  every wall is braced by a tile at an angle, so no straight wall folds over.
- **Builds that changed.** Wide roofs and floors now have walls inside to rest on (a step says so), and doors get a
  short wall beside them. Bridges span one square, pier to pier. Flags, battlements, railings and other loose pieces
  on top edges became pyramids or came off. Picture walls have a square going back at each end. A few builds grew a
  storey to keep their size, and a few lost one to stay within two 100-piece sets.
- **100 new projects**, built with a new shape kit (`web/src/projects/studio.ts`): hexagons and honeycombs, octagons,
  six-point stars, three-triangle pyramids, triangle truss bridges, zigzags and picture walls. 15 for 6–8 (Sssssid the
  Zigzag Snake, the Traffic Cone Factory), 30 for 9–10 (the Bee Block of Flats, Saturn's Spare Ring, the Bridge Made
  Entirely of Triangles) and 55 for 11–16 (the Grand Hexagon Palace of Queen Hexabella, the Space Station of Absolutely
  Everything, the Chess Set Where the Pawns Won, the Wall That Says HI). Builds for 6–10 need only one 100-piece set.

## 2.2.0 · 2 Oct 2026

101 more projects, 52 to 159 tiles (181 in all).

- **Castles**: Fort Knock-Knock, Baron Von Burp's Fortress, the Castle That Ate Itself, the Tower of Terrible Jokes,
  the Doughnut Fortress and more.
- **Homes**: Grandma's Secret Disco Bungalow, the Hotel for Hiccupping Hippos, the Sock Drawer Skyscraper, the School
  of No Homework and more.
- **Things that go and space**: the Bus Station of Endless Waiting, the Rocket Ship Fuelled by Beans, the Lunar
  Laundromat, the UFO Car Park and more.
- **Animals and gardens**: the Giraffe Elevator (143 tiles), the Crocodile Dentist, the Sloth Speed Racing Club, the
  Gnome Parliament and more.
- **Towers, bridges and patterns**: the Tower of Absolutely Everything (159 tiles), the Rainbow Ziggurat of Zebras, the
  Maze of Mild Confusion, Domino City and more.
- Each is written as a plan of parts (blocks of storeys, towers, walls, bridge decks, platforms, roofs, battlements,
  flags) for a layout kit (`web/src/projects/kit.ts`) that places the tiles and writes the steps layer by layer. Every
  one passes the checker and builds from two 100-piece sets.

## 2.1.0 · 2 Oct 2026

More to build.

- **50 new projects** with silly names: 6 for 3–5 (a silly snail in a hat, a burping frog), 9 for 6–8 (the burping
  volcano, Captain Pickle's pirate ship), 12 for 9–10 (Sir Sneezealot's castle, the stinky cheese lighthouse) and 23
  for the new 11–16 band.
- **11–16**: big builds of 60 to 200 tiles, up to six tiles a step: the Grand Hotel for Retired Pirates (154 tiles),
  the Ultimate Sock Monster Skyscraper, the Castle of Infinite Snacks, the Very Important Bridge to Nowhere and more.
- **Two sets at once**: on the grown-ups' Tiles page, "Add this set too" adds a second set to the first, so two
  100-piece sets count as 200. Every 11–16 project builds from two Magna-Tiles 100 or two PicassoTiles 100.

## 2.0.0 · 2 Oct 2026

A new look and feel (plans/2026-10-02-sprint-2.md).

- **Tiles that look real**: glossy bevelled frames, clear textured faces, chrome rivets, studio light on a wooden table.
- **A better camera**: a three-quarter view that frames what is built so far and follows each step.
- **Magnetic building**: a glowing ghost shows where the tiles go, then they glide in and snap into place.
- **Toy box design**: warm paper, wood shelves, a sunny orange Next, a new icon.
- **3D pictures** on the shelf and on every tile chip.
- **Full-screen build mode** with a step strip and a big Next.
- **A new ending**: the view circles the model under a shower of tiles, then a photo card.
- **The voice is off** by default (and switched off once on iPads that had 1.0); tap the speaker to hear a step or
  the end. A grown-up can turn reading on in Settings.

## 1.0.0 · 2 Oct 2026

The first release of Tile Steps.

- **Library**: an age picker (3–5, 6–8, 9–10), eight themes, shelves of 30 projects with pictures drawn from their own
  tiles, and a badge on each: "You can build it!", "You can build it with a swap", or the missing tiles drawn.
- **Build mode**: a 3D model, one step at a time, read aloud; Next, Back, Hear again; quarter turns for 3–5, drag for
  6–8, free orbit for 9–10; swaps shown where they happen; "It fell down" help; the step is saved and picked up again.
- **The end of a build**: the finished model, a short celebration, then back to the shelf.
- **Grown-ups side** behind a hold-and-sum gate: tiles from five set presets, counts, colours, brands and the tall
  triangle; read aloud, sound effects, the voice's language, theme; where things are kept; erase; backup and restore.
- **Offline**: a Home Screen web app that opens with Wi-Fi off. Nothing leaves the iPad.
- **The engine**: a checker (rules R1 to R9) that every project passes under every brand's tall triangle, and matching
  with swaps.
