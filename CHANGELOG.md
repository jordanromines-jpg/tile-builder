# Changelog

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
