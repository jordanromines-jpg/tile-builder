# Tile Steps: the build plan

(The repo and the research use the working name "Tile Builder".)

Status: approved 2 Oct 2026 (Jordan, in plan mode, after the cut to the simple app: D18 to D21); in progress (PR 0.1, #1).

What started it: Jordan, 2 Oct 2026: "now make react/typescript web app where I can add my tile inventory and then you can pick your own projects. This is for kids 3-10 boys and girls. we will need a robust library and gallery view for the kids." Then: "we need more design and user research before we make mocks. we dont even have a brief yet." Then: "design system too needs built." Then: "build a plan so detailed a sonnet agent could build this end to end. Build it using the plan bulding guidelines in the web agent repo." Then, on the first draft and its features map: "this is too complicated. no extra profile pics or project pages. Just select a project and do it. no camera." It replaces `PLAN.md` in the repo (written before the research), which becomes a pointer to this file. It carries over the research in `docs/research/`, the skills in `.claude/skills/`, `docs/design-tools.md`, and the 3D castle prototype.

Roadmap: `plans/roadmap/tile-builder.json`, drawn with the repo's Archify (key 0d). The features map (`docs/maps/features.json`, key 0e) shows the app in one picture.

## Why

Families with magnet tiles run out of ideas and out of tiles. The research says so in parents' words: "We have 100 and it's not enough"; triangles and large squares go first; a child cannot follow written instructions alone, so the parent is pulled back in; a 3-year-old lays tiles flat until building "kicks in" around 4; 8 to 12-year-olds still play and want bigger builds (`docs/research/parent-voice.md`, themes 2 to 7). Families already pay for ideas (a 300-build book, printable cards) that do not know what the family owns.

What exists: EverPieces has 100+ guided 3D builds, any brand, no ads or account, and charges for 3 of its 4 "Worlds". Magniko keeps an inventory and hides what you cannot build. Tilbo, unreleased, promises an age-matched daily build from "the tiles you have at home", with streaks (`docs/research/competitors.md`, sections 1, 2, 7). Not found in any of them: steps read aloud for a child who cannot read; missing tiles drawn as pictures instead of hidden; swaps that make a build possible; each brand's tall-triangle size; an app a child runs alone in two taps (section 9).

What the evidence says about children: copying a model from a picture starts at about 4; visual working memory holds about 1.5 items at 5, 3 at 7 and 4 at 10, which sets tiles per step; turning a 3D view is hard before 7; expected rewards undermine interest, so the finished build is the prize; children under 5 lift their finger mid-drag, so every kid action is a tap (`docs/research/child-development.md`, `docs/research/kids-and-ipad.md`, `docs/research/kids-app-design.md`).

What was not measured: no study compares a rotatable 3D guide with pictures for ages 3 to 10; pieces per step was never tested directly; app-store reviews of the competitors were not read (the session's search budget ran out); the Magna-Tiles and Connetix tall-triangle leg lengths were not found; most research pages were read as search summaries, not the page (each file's first section says how far to trust it). Family sessions were skipped (D13), so the per-age rules are inferences from the literature until Jordan's testing (T2 to T4).

The tile sizes the engine rests on: a standard square is 3 in (76.2 mm) for Magna-Tiles and PicassoTiles and about 75 mm for Connetix; the right triangle is half a square; the equilateral has 3 in sides; the tall isosceles triangle's legs are 1.87 units for PicassoTiles (7.5 cm base, 14 cm legs, listed) and 1.88 for Magna-Tiles (143 mm ± 5, measured by an independent project; found 2 Oct 2026 in PR 1.1); Connetix is unknown. Set presets with their counts are in `docs/research/tiles.md`.

## The app in one paragraph

A child opens the app and sees the **Library**: shelves of project pictures, each marked "You can build it!" or "Need 2 more ▲" against the family's tiles, with three age pictures at the top (3–5, 6–8, 9–10). They tap a project and are in **Build mode**: the 3D model, one step at a time, read aloud, a big Next. At the end, a short **celebration**, then back to the Library. A grown-up, behind the **grown-ups door**, enters the tiles (start from a set, then − and +), sets voice and sound, and saves a backup. There are no profiles, no project pages, no camera and no photos (D18).

## Decisions

| # | Question | Answer |
|---|---|---|
| D1 | Where the code lives | Its own repo, `jordanromines-jpg/tile-builder` (Jordan, 2 Oct 2026: "New repo") |
| D2 | Where data is stored | On the device only. "no need for a cloud sync, but I want this to be a live web page you can use like an app on ipads" (Jordan, 2 Oct 2026) |
| D3 | Generated projects | None: "they shouldn't" (Jordan, 2 Oct 2026). Every project is written by hand as data and passes the checker |
| D4 | Brands at launch | Magna-Tiles, PicassoTiles, Connetix, generic 3-inch (Jordan, 2 Oct 2026) |
| D5 | Hosting | GitHub Pages from this public repo, deployed by a GitHub Action on every merge to `main`. Nothing private is ever committed; a family's tiles and settings live only on their iPad |
| D6 | The order of the work | Research, then the brief, then the design system, then mockups, then code (Jordan, 2 Oct 2026: "we need more design and user research before we make mocks. we dont even have a brief yet"; "design system too needs built") |
| D7 | The design skills | Installed in `.claude/skills/` with a `SOURCE` file each: `ui-ux-pro-max`, `design-motion-principles`, `redesign-existing-projects`, `frontend-design`, `brandkit`, `algorithmic-art`, `canvas-design`, `webapp-testing` (Jordan, 2 Oct 2026: "yes install them"); Archify follows (D9). `logo-design` stays on Jordan's Mac |
| D8 | 21st.dev | Connected as a claude.ai connector (free tier, AI generation off). A reference, and at most an occasional single component copied in, restyled onto our tokens, checked by `design-motion-principles` and axe. Its AI generator is not used. The cloud network blocks 21st.dev, so components come through the connector, not the command line |
| D9 | Archify | Installed as a repo skill from its v3.0.1 release, pinned, update check disabled (Jordan, 2 Oct 2026: "can you install this too?"). Draws the roadmap, the features map and the engine map |
| D10 | The research's six suggested changes | "2, 4, 5, 6" (Jordan, 2 Oct 2026). Taken: no auto-turn of the model during a 3–5 step; the checker also requires that steps go up layer by layer and that every in-between state stands; a first-run card says "Stand the iPad up beside the tiles and build together". Change 4 (stickers as a keepsake) no longer applies: there are no stickers (D18). Not taken: the T2 test stays "a 3- or 4-year-old finishes a build with only the app's help"; projects have no Change, Invent or Challenge prompts |
| D11 | Who builds and who merges | "as if it were you will be building it end to end once I approve the plan" (Jordan, 2 Oct 2026). One builder session owns every pull request, merges each one when its checks are green and its build-log row is written, and stops only at the two gates |
| D12 | Gates | "Brief and mockups only" (Jordan, 2 Oct 2026): G1 the brief, G2 the four mockups. The app goes live when Verification is green |
| D13 | Family research | "Skip it; desk research is enough" (Jordan, 2 Oct 2026). `docs/research/primary-research-plan.md` stays as a reference, marked not run |
| D14 | Agents and workflows in the build | No Workflow tool (Jordan, 2 Oct 2026: "no workflows"; "you can use agents but no workflows"). Later: "no more agents after this." So the builder works alone, with no subagents |
| D15 | The stack | React 19, TypeScript, Vite 7, Tailwind 4 fed by our token file, Radix primitives under our own components, TanStack Router with hash history, three.js through `@react-three/fiber`, Dexie, `vite-plugin-pwa`, zod, Motion, Phosphor, `@fontsource`, Vitest, Playwright with axe-core. Copied from `web-agent/web` where it fits (the same stack Jordan approved there as RQ1) |
| D16 | Price | Free, nothing to unlock. The repo is public |
| D17 | The name | **Tile Steps** (Jordan, 2 Oct 2026, at G1: "Tile Steps, keep going."), from the three in `PRODUCT.md`. The repo, its folders and the research keep the working name "Tile Builder" |
| D18 | How much app | "this is too complicated. no extra profile pics or project pages. Just select a project and do it. no camera." (Jordan, 2 Oct 2026). Cut: profiles and avatars, Who's playing, the project page, the camera, My Builds, photos, stickers. The kid side is the Library, Build mode and the celebration |
| D19 | How the app knows a child's age | Three age pictures at the top of the Library (3–5, 6–8, 9–10), the last choice remembered on the iPad; each project's own age band sets its build mode (tiles per step, turn controls, read-aloud) (Jordan, 2 Oct 2026: "yes", to this proposal) |
| D20 | Picking up where you left off | One saved step per project, not per child: opening a half-done build carries on from that step (Jordan, 2 Oct 2026: "yes") |
| D21 | The grown-ups door | Kept; it guards the inventory, settings and backup from a curious 4-year-old (Jordan, 2 Oct 2026: "yes") |
| D22 | Gate G2 | Jordan, 2 Oct 2026, during PR 2.2: "can you build this end to end please". The builder does not stop at G2: the mockup board (3e) is still made and sent, and Jordan's changes, if any, come as PR 3.2 whenever he sends them; PR 6.2 and Phase 7 no longer wait |
| D23 | The Playwright version | 1.56.1, not 1.63.0 (key 2e): the cloud session has Chromium build 1194 preinstalled and may not download browsers; 1.56.1 uses that build, and CI installs the same one, so plates made in either place match |
| D24 | Project pictures | Drawn at run time as SVG from each project's own tiles (an isometric view, painter's order), not rendered to WebP by a Playwright script at build time (keys 6e, 3a): no build step, nothing to go stale, sharp at any size, light and dark for free, a few KB. The `#/thumb` route and `npm run thumbs` go |
| D25 | Phase 4 in one pull request | PRs 4.1 to 4.3 land together as #11; #12 and #13 close as folded into it: the checker's tests (4.2) need the helpers and the castle (4.3), and the catalog half of 4.1 already merged with 2.3. Phase 4 also comes before the mockup screens (3.1), so the screens are built once, on the real engine, not on a fixture |

## Phases, pull requests and keys

Keys are grouped under the pull request that carries them, and pull requests under phases. Every pull request is one branch from `main`; the builder opens all of them as drafts with one empty commit when this plan is approved (key 0g), then fills the GitHub # column. Opened 2 Oct 2026 as #2 to #24. Hours are the builder's estimates; the stop point is 1.5 times each.

| PR | GitHub # | What | Waits on | Hours |
|---|---|---|---|---|
| 0.1 | #1 | The plan, the last research file, Archify, the plans folder, the features map | nothing | 4 |
| 1.1 | #2 | The brief, `PRODUCT.md` | 0.1 | 5 |
| 2.1 | #3 | Tokens and the token pipeline | 0.1 | 6 |
| 2.2 | #4 | The app scaffold, PWA shell, CI and Pages deploy | 2.1 | 8 |
| 2.3 | #5 | Tile pictures: 2D chips, shape icons, the 3D tile material | 2.2 | 7 |
| 2.4 | #6 | Kid-side components | 2.3 | 6 |
| 2.5 | #7 | Grown-ups components | 2.2 | 5 |
| 2.6 | #8 | `DESIGN.md`, the design page, the published Design System | 2.3 to 2.5, G1 | 5 |
| 3.1 | #9 | The four mockup screens | 2.6 | 6 |
| 3.2 | #10 | Changes Jordan asks for at G2 | G2 | 4 (reserved) |
| 4.1 | #11 | The tile catalog, brands, set presets, schemas | 2.2 | 5 |
| 4.2 | #12 | Geometry and the checker | 4.1 | 12 |
| 4.3 | #13 | Authoring helpers, the castle ported, matching and swaps | 4.2 | 8 |
| 5.1 | #14 | Storage: Dexie, persist, Home Screen detection, first-run cards | 2.5 | 4 |
| 5.2 | #15 | The grown-ups door, inventory, settings | 5.1, 4.1 | 6 |
| 5.3 | #16 | Backup and restore | 5.2 | 3 |
| 6.1 | #17 | The 3D viewer with the per-age controls | 4.3, 2.3 | 10 |
| 6.2 | #18 | Thumbnails at build time; the Library | 6.1, 4.3, 5.2, G2 | 6 |
| 6.3 | #19 | Projects for 3–5 (10) | 4.3 | 8 |
| 6.4 | #20 | Projects for 6–8 (12) | 4.3 | 10 |
| 6.5 | #21 | Projects for 9–10 (8, the castle among them) | 4.3 | 8 |
| 7.1 | #22 | Build mode: steps, voice, turn controls, swaps, the "it fell down" help | 6.1, 6.2 | 10 |
| 7.2 | #23 | The end of a build: celebration, back to the Library | 7.1 | 3 |
| 8.1 | #24 | Go live: Verification, the parents' page, the Pages link | everything | 5 |

Total: 154 hours of builder time, of which 4 are reserved (the first draft was 173; D18 took out 19). Checkpoints C1 to C3 are in Time bounds.

### Phase 0 · the research is closed and the plan is in the repo

**PR 0.1 · the plan, the last research file, Archify, the plans folder, the features map · branch `plan/phase-0` · GitHub #1**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 0a | Write `docs/research/kids-app-design.md` from the draft the research agent left between its `BEGIN FILE` and `END FILE` markers at `~/.claude/plans/shimmering-soaring-book-agent-a6f5649178bf15e95.md`, word for word; then add one line to `docs/research/kids-and-ipad.md` noting that `kids-app-design.md` proposes 88 px targets for 3–5 and 104 px for the primary kid buttons, settled in 2.1 | `docs/research/kids-app-design.md`, `docs/research/kids-and-ipad.md` | document | the file is in the repo with its 81 sources; the note is in place | 20 min |
| 0b | Mark `docs/research/primary-research-plan.md` as not run: a status line under the title, "Not run (D13, 2 Oct 2026). Kept as the method if family sessions are ever wanted." | `docs/research/primary-research-plan.md` | document | the line is there; nothing else in the file changes | 5 min |
| 0c | Install Archify as a repo skill: `git clone --depth 1 --branch v3.0.1 https://github.com/tt-a1i/archify` into the scratchpad; copy `SKILL.md`, `bin`, `renderers`, `schemas`, `assets`, `migrations`, `scripts`, `brand-marks`, `delta`, `references`, `recipes` (if present), `package.json`, `skill-release.json`, `LICENSE`, `THIRD_PARTY_NOTICES.md` to `.claude/skills/archify/`; leave out `tests`, `examples` and any `node_modules`; write `SOURCE` (repo, tag v3.0.1, commit, MIT, date, "run with `ARCHIFY_UPDATE_CHECK_DISABLED=1`; its visual check finds Chromium with `ARCHIFY_CHROME=/opt/pw-browsers/chromium ARCHIFY_CHROME_NO_SANDBOX=1` in cloud sessions") | `.claude/skills/archify/` | setup | `ARCHIFY_UPDATE_CHECK_DISABLED=1 node .claude/skills/archify/bin/archify.mjs --help` prints its commands; the folder is under 15 MB | 30 min |
| 0d | The plans folder: `plans/README.md` (the format of `web-agent/plans/README.md`, adapted: one lane, one builder session; the "How a plan moves" table; the time bounds and rules below); `plans/CHANGELOG.md` with its first line; this plan at `plans/2026-10-02-tile-builder.md` with Status "approved 2 Oct 2026"; `plans/roadmap/README.md` and `plans/roadmap/tile-builder.json` (Archify workflow, schema 2: lane "Jordan's word" with G1 and G2 as `security` nodes, one lane for the builder with one `backend` node a pull request, phases 0 to 8 as `phases`, hours in each sublabel); draw it once and look at the page; the page is not committed | `plans/` | document | the roadmap passes Archify's `finalize` (validate, deliver, check, browser-check); every pull request above is a node | 1.5 h |
| 0e | The features map: `docs/maps/features.json`, an Archify architecture diagram of the app after D18 (the Library, Build mode with the 3D model, the voice and the "it fell down" help, the celebration; the engine: projects, checker, matching, swaps, catalog, age bands; on this iPad: tile counts, settings and age choice, saved step per project, backup file; grown-ups side: the door, inventory, settings, backup, first-run cards; on GitHub: checks, project pictures, Pages, offline app), drawn to `docs/maps/features.html` locally and not committed; `docs/maps/README.md` says how to draw it | `docs/maps/` | document | the map passes `finalize`; it has no profile, project page, camera or photo node | 30 min |
| 0f | `PLAN.md` becomes ten lines: the one-paragraph description above and "The plan is `plans/2026-10-02-tile-builder.md`"; `README.md` points at `plans/` and `docs/`; `docs/design-tools.md` gains an Archify row; the 3D prototype is copied from the scratchpad to `docs/prototype/magnet-tile-castle.html` so it survives this container | `PLAN.md`, `README.md`, `docs/design-tools.md`, `docs/prototype/` | document | no decision or key lives only in `PLAN.md` | 20 min |
| 0g | Open every pull request in the table above as a draft: branch from `main` with one empty commit (`git commit --allow-empty -m "PR 2.1 · tokens and the token pipeline: not started"`), title "PR n.n · what it is", description "Not started. Keys: ...", using the GitHub MCP tools; then write each GitHub # into this plan's table and headings in one commit on `plan/phase-0` | GitHub; `plans/2026-10-02-tile-builder.md` | setup | every row of the table has a number | 45 min |
| 0h | Mark #1 ready and merge it (D11); delete the draft at `~/.claude/plans/shimmering-soaring-book.md` | GitHub | live step | `main` holds the plan; the build log's first row is written | 10 min |

### Phase 1 · the brief

**PR 1.1 · the brief · branch `brief` · GitHub #2**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 1a | Write `PRODUCT.md` in the shape of `web-agent/design/PRODUCT.md` (read it first): **Who it is for** (a family with magnet tiles and an iPad; the child aged 3–10 picks and builds, a grown-up is beside the youngest and sets up the tiles); **The one job** ("Pick a project you can build with your tiles, and build it, step by step"); **What it is not** (not a toy on the screen, not a lesson, not a store, not a photo album, not a profile system); **How it differs** from EverPieces, Magniko and Tilbo, one line each, from `competitors.md` section 9, with the threats stated plainly; **What it should be**, six points: two taps from opening to building; usable by a child who cannot read; honest about what fits the family's tiles (near misses shown, never hidden, never "buy more"); nothing leaves the iPad; calm (no streaks, timers, scores, rewards to collect); the same for every child (no gender-coded themes or colours); **The age bands** table from `child-development.md` lines 331–342, trimmed to what applies after D18 (tiles per step 1 / 3 / 4, project size 3–12 / 12–40 / 30–100 tiles, view fixed with 90° jumps / buttons and drag / free orbit, grown-up's role co-builder / nearby / optional, read-aloud always / on by default / optional); **The screens**: the Library, Build mode, the celebration, the grown-ups side, and nothing else (D18); **Voice** (plain statements, sentence case, "you" and "builder", no exclamation marks except "You can build it!", with the "it fell down" lines and the swap lines as examples); **What never changes** (no account, profile, camera, upload, AI, ads, purchases or streaks; colour is a preference, never a requirement; the finished build is the prize); **How we know it works** (T1 to T5 below); **Three names** for Jordan to pick from at G1, each checked with a web search for an existing product of that name, the result stated | `PRODUCT.md` | document | every statement traces to a research file or a decision, cited inline; under 150 lines | 3 h |
| 1b | A one-page research summary: `docs/research/README.md`, one paragraph per file (what it covers, how far to trust it, the three findings that most shaped the brief), and the open questions carried into this plan (Q1 to Q3) | `docs/research/README.md` | document | a reader who opens only this page knows what the research found and where it is thin | 1 h |
| 1c | Send Jordan the brief: the pull request link and the three names, the builder's pick first | GitHub | document | the message is sent and logged | 15 min |
| **G1** | **Jordan reads `PRODUCT.md` and picks the name** | | gate | his words are in Decisions (D17 filled in) | |
| 1d | Apply his words: the name everywhere it appears, any change he asks for; merge | `PRODUCT.md`, `README.md`, `plans/` | document | merged with his words quoted in the build log | 45 min |

Phase 2 keys up to PR 2.5 do not wait for G1: they use the name from one strings file (`web/src/strings.ts`), so renaming is one commit.

### Phase 2 · the design system

**PR 2.1 · tokens and the token pipeline · branch `tokens` · GitHub #3**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 2a | `design/tokens.json` in the W3C Design Tokens format (`$type`, `$value`, `$description`, `$extensions["dev.tile-builder.design"]` with `file`, `grounds` and `pairs`), light values; `design/tokens.dark.json` with dark overrides only. Groups: `surface` (table `#FBF8F3` and two tints to start), `ink` (`#1F2430` and two lighter), `line`, `accent` (one hue, chosen from `ui-ux-pro-max` "children education" palettes, 3:1 on the surface, 4.5:1 for its label), `tile-{red,orange,yellow,green,blue,purple}` starting from the prototype's hexes (`#e5322e #f5841f #f4c51b #39ad4a #2a78dd #8a4cc8`), each with a `-rim`, a `-pattern` name (dots, diagonal stripes, plain, waves, horizontal stripes, stars) and a `-name` string (the spoken name), `status-ok` and `status-wait` (always paired with an icon shape), `can`; type sizes `fs-kid-display-{a,b,c}` 56/48/40, `fs-kid-label-{a,b,c}` 40/32/26, `fs-kid-count` 40/36/32, `fs-parent-title` 28, `fs-parent-heading` 22, `fs-parent-body` 17, `fs-parent-small` 13; targets `target-kid-primary` 104, `target-kid-{a,b,c}` 88/80/64, `target-parent` 44, `gap-kid` 24, `gap-parent` 12, `hit-slop-kid` 12, `edge-safe-kid` 32; spacing `s-1`..`s-9` = 4 8 12 16 24 32 48 64 96; radii `r-tile` 6, `r-sm` 12, `r-md` 20, `r-lg` 32, `r-full` 9999; `rim` 3; durations `t-press` 100 ms, `t-ui` 240 ms, `t-celebrate` 1400 ms; `ease` `[0.2,0.7,0.2,1]`; `turn-period` 25 s; fonts `display` `["Fredoka Variable","system-ui","sans-serif"]`, `kid` `["Andika","Verdana","sans-serif"]`, `parent` `["Atkinson Hyperlegible Next","system-ui","sans-serif"]` (`a`/`b`/`c` are the age bands 3–5, 6–8, 9–10) | `design/tokens.json`, `design/tokens.dark.json` | design | the files parse; every colour has light and dark values; the pairs list names every text-on-surface pair at 4.5 (kid labels at 7) and every control-on-surface pair at 3 | 2.5 h |
| 2b | `design/tokens.py`, adapted from `web-agent/design/tokens.py` lines 39–74 (`css()`, `_n()`), 90–115 (`load_smithy()` and `tailwind()`, renamed `load()` and `tailwind()`), 191–194 (`stale`) and 215–247 (contrast): commands `write` (writes `web/src/tokens.css`: `:root{color-scheme:light;...}`, `:root[data-theme="dark"]`, the `prefers-color-scheme` block guarded by `:not([data-theme="light"])`, then `@theme inline{...}`), `check` (exit 1 if stale or any pair fails), `contrast` (the table). Stdlib only. Drop the legacy half (`load`, `block`, `js`, `TOK`, `THEMES`, `START`/`END`) | `design/tokens.py`, `web/src/tokens.css` | code | `python3 -m design.tokens check` exits 0; `contrast` shows every pair ok in both grounds | 1.5 h |
| 2c | `design/cvd.py`: with `coloraide` (pinned in `design/requirements.txt`), simulate protan, deutan and tritan vision for the six tile colours and print the smallest OKLCH distance between any two under each; a report, not a gate, because the second cue (pattern, rim, spoken name) is the rule; `design/README.md` says how to run both scripts | `design/cvd.py`, `design/requirements.txt`, `design/README.md` | check | the script prints the three tables | 1 h |
| 2d | `tests/test_tokens.py` (pytest) in the shape of `web-agent/tests/test_design_tokens.py` lines 27–38: `tokens.css` equals `tailwind(load())`, every pair passes, the six tile tokens exist in both grounds | `tests/test_tokens.py` | check | `python3 -m pytest -q tests/test_tokens.py` passes | 45 min |

**PR 2.2 · the app scaffold, PWA shell, CI and Pages deploy · branch `scaffold` · GitHub #4**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 2e | `web/` from `web-agent/web`: `package.json` (scripts `dev`, `build` = `tsc --noEmit && vite build`, `preview`, `check`, `test`, `test:e2e`, `check:projects`, `thumbs`, `size`), the dependencies in D15 at the versions in `web-agent/web/package-lock.json` where shared (react 19.3.0, the Radix packages listed there, phosphor 2.1.10, vite 7.3.6, vitest 3.2.7, playwright 1.63.0, typescript 5.9.3, tailwind 4.3.3) and current versions of the rest (`@tanstack/react-router`, `@react-three/fiber`, `@react-three/drei`, `three`, `dexie`, `dexie-react-hooks`, `zod`, `motion`, `vite-plugin-pwa`, `@fontsource-variable/fredoka`, `@fontsource/andika`, `@fontsource/atkinson-hyperlegible-next` or `@fontsource/atkinson-hyperlegible` if Next is not on npm); `@axe-core/playwright` under devDependencies; `vite.config.ts` from `web-agent/web/vite.config.ts` with `base: "/tile-builder/"`, one entry `index.html`, `VitePWA({registerType:"autoUpdate", manifest:{name, short_name, display:"standalone", orientation:"any", background_color, theme_color, icons 192, 512 and maskable 512}, workbox:{globPatterns:["**/*.{js,css,html,woff2,webp,png,svg,json}"], maximumFileSizeToCacheInBytes: 6e6}})`, the vitest block (`environment:"jsdom"`, `include:["src/**/*.test.{ts,tsx}"]`); `tsconfig.json` as `web-agent/web/tsconfig.json`; `index.html` with `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, `apple-mobile-web-app-capable`, `apple-touch-icon`, `lang="en"`; `src/main.tsx`; `src/app.css` (`@import "tailwindcss"; @import "./tokens.css";` the `@fontsource` imports, `body{background:var(--surface);color:var(--ink);font:400 17px/1.5 var(--parent)}`, no `min-width`); `src/ground.ts` from `web-agent/web/src/app/ground.ts` (key `tile-builder.theme`); the hash routes `#/` (Library), `#/build/:pid`, `#/done/:pid`, `#/grownups`, `#/grownups/tiles`, `#/grownups/settings`, `#/design`, `#/thumb/:pid`, each a placeholder that says its name; `src/strings.ts` holding every word the app shows or says | `web/` | code | `npm ci && npm run check && npm test && npm run build` pass; `npm run preview` serves the shell at `/tile-builder/#/` | 3 h |
| 2f | PWA assets: `public/icons/` (192, 512, maskable 512, apple-touch-icon 180) drawn as SVG from the tile shapes in the accent colour and rasterised by `scripts/icons.mjs` (sharp, dev only); `public/robots.txt`; a one-time toast "Ready to use without Wi-Fi" when the service worker is ready | `web/public/`, `web/scripts/icons.mjs`, `web/src/pwa.ts` | code | the app opens with the network off in `e2e/offline.spec.ts` (`context.setOffline(true)` after the first load) | 1.5 h |
| 2g | CI: `.github/workflows/ci.yml` on pull requests and pushes: Node 22, `npm ci`, `python3 -m design.tokens check`, `pip install -r design/requirements.txt && python3 -m pytest -q tests`, `npm run check`, `npm test`, `npm run check:projects` (a no-op until 4.2), `npm run size` (`scripts/size.mjs`: no file under `web/src`, `design` or `scripts` over 500 lines, generated `tokens.css` aside), a grep that fails on `21st_sk_` or `AKIA`, `npx playwright install --with-deps chromium`, `npm run build`, `npm run test:e2e`; `.github/workflows/pages.yml` on push to `main`: the same steps, then `actions/upload-pages-artifact` of `web/dist` and `actions/deploy-pages`. Enable Pages (source: GitHub Actions) with the GitHub MCP tools, or ask Jordan once if the API refuses | `.github/workflows/`, `web/scripts/size.mjs` | check | CI is green on the pull request; after merge the app is live at `https://jordanromines-jpg.github.io/tile-builder/` | 2 h |
| 2h | `web/README.md`: the commands, the folder map, the rules (500 lines; text never under 13 px on the grown-ups side or 26 px on the kid side; no photos or real names of children anywhere in the repo) | `web/README.md` | document | a new session can run the app from the README alone | 30 min |
| 2i | Playwright: `playwright.config.ts` from `web-agent/web/playwright.config.ts` with `snapshotPathTemplate: "{testDir}/plates/{arg}{ext}"`, `maxDiffPixelRatio: 0.01`, `reducedMotion: "reduce"`, two projects: `ipad-landscape` (1180×820, `isMobile`, `hasTouch`, `deviceScaleFactor:2`) and `ipad-portrait` (820×1180); plates are made on Linux (this container or CI) and committed; `e2e/shell.spec.ts` with the axe check from `web-agent/web/e2e/design.spec.ts` lines 18–19 and a tab-walk | `web/playwright.config.ts`, `web/e2e/` | check | `npm run test:e2e` passes locally and in CI with the same plates | 1 h |

**PR 2.3 · tile pictures: 2D chips, shape icons, the 3D tile material · branch `tile-pictures` · GitHub #5**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 2j | `src/ui/TileChip.tsx`: an SVG of a tile shape (from the catalog's points: `square`, `square-large`, `tri-equilateral`, `tri-right`, `tri-isosceles-tall` with a leg prop, `rect-2x1`, `window`, `door`, `fence`) filled with the tile colour at 45% over the surface, its pattern from `src/ui/patterns.tsx`, a 3 px rim, an optional count badge (`fs-kid-count`); sizes `sm` 48, `md` 72, `lg` 104 px; `aria-label` "red square" or "4 red squares"; a `speak` prop that says the label on tap through `src/speech/say.ts` | `web/src/ui/TileChip.tsx`, `web/src/ui/patterns.tsx` | code | a Vitest renders every shape and colour; the design page shows the full grid; axe passes | 2.5 h |
| 2k | `src/ui/ShapeIcon.tsx`: outline icons of each shape in Phosphor's stroke style on a 256 grid; `src/ui/icons.ts` re-exports the Phosphor icons used (`Castle`, `House`, `Car`, `Rocket`, `Flower`, `PawPrint`, `Sparkle`, `GridFour`, `SpeakerHigh`, `ArrowLeft`, `ArrowRight`, `ArrowCounterClockwise`, `Check`, `Lock`, `Plus`, `Minus`) | `web/src/ui/ShapeIcon.tsx`, `web/src/ui/icons.ts` | code | every icon renders on the design page at 24 and 64 px | 1 h |
| 2l | `src/three/tile.ts`: the tile geometry and material from the prototype, typed: `inset(pts, w)`, `buildGeometry(shape, leg)` returning `{frame, glass, ridge}` with `TH = 0.075`, `RIM = 0.085` (prototype lines 221–251); materials from lines 317–325 (frame roughness 0.35; glass opacity 0.42, `DoubleSide`, `depthWrite:false`; ridge colour × 0.75 at opacity 0.8, at z ±0.012); colours read from the tokens with `getComputedStyle` and a fallback map; a `TileMesh` fiber component | `web/src/three/tile.ts`, `web/src/three/TileMesh.tsx` | code | the design page shows one tile of each shape and colour turning slowly in light and dark | 2.5 h |
| 2m | The Tile pictures chapter for `DESIGN.md` (merged with 2.6): colour never alone; the rim is the tile's frame; the pattern is the second cue; the voice says the colour name | `DESIGN.md` (draft section) | document | the chapter exists | 30 min |

**PR 2.4 · kid-side components · branch `kid-components` · GitHub #6**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 2n | `src/speech/say.ts`: `say(text, {lang, rate=0.9})` with `speechSynthesis`, cancels any current speech, picks the first voice matching the language setting, only ever called from a tap handler, `stop()` on route change; `useSpeech()`; a `SpeakButton` that repeats the last line | `web/src/speech/say.ts`, `web/src/ui/SpeakButton.tsx` | code | a Vitest with a stubbed `speechSynthesis` checks cancel-then-speak and the voice choice | 1.5 h |
| 2o | `KidButton` (sizes `primary` 104 px and `a/b/c` 88/80/64 from an `AgeContext`; picture first, label under it in `fs-kid-label`; speaks its label on tap when `speak` is set; pressed state within one frame; 12 px hit slop), `KidBar` (Back to the Library, Hear again, the grown-ups door at top right; fixed places, never along the bottom edge), `GrownUpsDoor` (a small lock; tapping it says "This door is for grown-ups" and opens the gate), `AgePicker` (three big picture chips for 3–5, 6–8, 9–10 with `aria-pressed`, speaks the age on tap), `ThemeFilter` (picture chips for the eight themes), `ProjectCard` (the project picture, its title, 1–3 stars drawn as tiles, a `BuildBadge`; the whole card is one tap target), `BuildBadge` (`can`: a check shape and "You can build it!"; `swap`: "You can build it with a swap"; `need`: the missing tiles as `TileChip`s with counts and "Need 2 more"), `Shelf` (a horizontal row of cards, scroll by swipe or a ▶ button), `StepDots` (one dot a step, countable, no progress bar), `TurnControls` (◀ ▶ and "back to my side"), `SwapNote`, `EmptyState` (a picture and a spoken line), `Celebration` (one moving element, under 1.4 s, tap to skip, a still picture under reduced motion) | `web/src/ui/kid/*.tsx`, `web/src/ui/AgeContext.tsx` | code | each component has a Vitest for roles and labels; the design page shows every state in both themes; axe passes; a Playwright check measures every target at its token size | 3.5 h |
| 2p | Motion: `src/ui/motion.ts` with the springs and durations from the tokens; `prefers-reduced-motion` turns springs to fades; run the `design-motion-principles` audit on the design page and fix what it flags | `web/src/ui/motion.ts` | code | the audit has no open finding | 1 h |

**PR 2.5 · grown-ups components · branch `grownups-components` · GitHub #7**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 2q | Radix wrappers in the shape of `web-agent/web/src/ui/Floats.tsx` and `Field.tsx`: `Dialog`, `ConfirmDialog`, `Toast` with `useToast()`, `Switch`, `Field` with `useId` labels and `role="alert"` errors; `Button` (`kind: lit | line | quiet | danger`, 44 px) from `web-agent/web/src/ui/Button.tsx`; `Stepper` (− count +, long-press repeats, `aria-valuenow`); `SettingsList`; `BackupCard`; `StorageStatus` | `web/src/ui/grownups/*.tsx` | code | Vitests for roles, labels and the stepper's long-press; the design page shows every state; axe passes | 3.5 h |
| 2r | `GateDialog`: "Hold to open" (a 3 s press with a filling ring; letting go early resets), then a sum in words with two-digit numbers ("forty-two plus seven?") and a number pad; three wrong answers close it; the voice says "This is for grown-ups" when opened from the kid side; no birth-year question | `web/src/ui/grownups/GateDialog.tsx` | code | a Vitest with fake timers passes hold, early release, right and wrong sums | 1.5 h |

**PR 2.6 · `DESIGN.md`, the design page, the published Design System · branch `design-system` · GitHub #8**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 2s | `DESIGN.md` in the shape of `web-agent/DESIGN.md` (read its headings): How to use it; Principles (two taps to building; one glance per step; tap only for the youngest; colour never alone; calm; the same for every child); Foundations (light and dark, colour with the pair rules, type with the three families and the age sizes, space and shape, motion, sound, icons); Tile pictures (from 2m); Components (one short section each, kid side then grown-ups side: what it is for, its states, its sizes by age); Patterns (the kid bar, the grown-ups door, the age picker, the "it fell down" help, the swap note, the celebration, the first-run cards); Copy (the voice from `PRODUCT.md`; the words by age from `child-development.md` lines 184–188); Accessibility (axe on every screen, targets, reduced motion, works on mute, screen-reader labels); What is never allowed (streaks, timers, scores, rewards to collect, pleading characters, colour-only signals, gestures beyond tap on a 3–5 path, bottom-edge targets, flashing, pink-for-girls; profiles, a camera, a project page: D18) | `DESIGN.md` | document | every component in 2.3 to 2.5 has a section; every rule names its source | 2.5 h |
| 2t | `#/design`: the design page in the shape of `web-agent/web/src/ui/Design.tsx` (a `Row` per family, every state, both themes by the theme toggle, an age switch for kid sizes); its Playwright plates in both themes and both orientations | `web/src/screens/Design.tsx`, `web/e2e/design.spec.ts`, plates | code | the plates are committed; axe passes | 1.5 h |
| 2u | Publish the Design System artifact with `/design-sync` from the tokens and the design page (made-up content only); its URL goes into `DESIGN.md`'s first lines and `docs/design-tools.md` | artifact; `DESIGN.md`, `docs/design-tools.md` | design | the artifact opens and shows the tokens and components | 1 h |

### Phase 3 · the mockups

**PR 3.1 · the four mockup screens · branch `mockups` · GitHub #9**

The screens are built as real routes on fixture data, so the mockups become the app. The fixture (`src/fixture.ts`) is a Magna-Tiles Clear Colors 100 inventory plus 12 Connetix equilaterals, and eight placeholder projects, one a theme, until Phase 6 replaces them.

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 3a | **Library** (`#/`): the `AgePicker` across the top (the last choice from settings), the `ThemeFilter` under it, `Shelf` rows of `ProjectCard`s for the chosen age with their `BuildBadge`s (buildable first), the `KidBar` with only the grown-ups door; the first-run card for grown-ups ("Stand the iPad up beside the tiles and build together.") shown once over it, dismissed with a hold | `web/src/screens/Library.tsx` | design | plates in both orientations and themes; axe passes | 2 h |
| 3b | **Build mode** (`#/build/:pid`): landscape: the 3D stage left (a still placeholder until 6.1), the step panel right with this step's `TileChip`s, the step's sentence as text (hidden for 3–5, shown for 9–10), `StepDots`, Hear again, Back, a `KidButton primary` Next; `TurnControls` under the stage; portrait: stage above, panel below; the age of the project sets sizes and which controls show; when tiles are missing, the first screen is a note over the stage ("You need 2 more ▲ for this one" with the tiles drawn, "Start anyway" and "Pick another") | `web/src/screens/Build.tsx` | design | the same | 2 h |
| 3c | **Celebration** (`#/done/:pid`): the finished model, the `Celebration`, the spoken line, one button "Back to the shelf" | `web/src/screens/Done.tsx` | design | the same | 45 min |
| 3d | **Tiles** (`#/grownups/tiles`, behind the door): "Start from a set" (the five presets from `docs/research/tiles.md`), a grid of `TileChip` + `Stepper` per shape (colour counts in a fold), the brand row with the tall-triangle picker ("Lay a tall triangle next to two squares. Which picture matches?", three pictures with legs of 1.5, 1.87 and 2.2 units), the summary "You can build 14 of 30 projects" | `web/src/screens/grownups/Tiles.tsx` | design | the same | 1 h |
| 3e | The board for Jordan: a Design artifact, or, if the Design type cannot take the plates, an HTML page in `docs/mockups/`, with the sixteen plates (four screens × two orientations × two themes), one line a screen on what it tests, and the Pages link to the live routes; sent to him | artifact or `docs/mockups/` | design | the message is sent and logged | 15 min |
| **G2** | **Jordan approves the look of the four screens** | | gate | his words are in Decisions | |

**PR 3.2 · changes from G2 (reserved) · branch `mockups-2` · GitHub #10**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 3f | What Jordan asks for at G2, written here as keys before the work starts | as asked | design | his words are quoted in the build log and the plates are made again | 4 h reserved |

### Phase 4 · the engine

**PR 4.1 · the tile catalog, brands, set presets, schemas · branch `catalog` · GitHub #11**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 4a | `src/engine/catalog.ts`: `ShapeId = "square" | "square-large" | "tri-equilateral" | "tri-right" | "tri-isosceles-tall" | "rect-2x1" | "window" | "door" | "fence"`; `SHAPES: Record<ShapeId, {label, points(leg?): [number,number][]}>` in units of one square edge, counter-clockwise, base from (0,0) to (1,0) as in the prototype (square `[[0,0],[1,0],[1,1],[0,1]]`, equilateral `[[0,0],[1,0],[0.5,√3/2]]`, right `[[0,0],[1,0],[0,1]]`, tall isosceles `[[0,0],[1,0],[0.5,h]]` with `h = √(leg² − 0.25)`, large square 2×2, rectangle 2×1, window and door as a square with `hole: true`, fence as 1×0.5 with `noFace: true`); `Colour = "red" | "orange" | "yellow" | "green" | "blue" | "purple"`; `BRANDS: Record<BrandId, {label, unitMm, tallLeg: number | null, extras: ShapeId[]}>`: `magna` 76.2 / 1.877 (143 mm measured, ±5 mm: `tiles.md` [15]) / none, `picasso` 76.2 / 1.867 / none, `connetix` 75 / null / `rect-2x1, window, door, fence`, `generic` 76.2 / null / none; `TALL_LEG_CHOICES = [1.5, 1.867, 2.2]` (Q1) | `web/src/engine/catalog.ts` | code | Vitest: every shape's points are counter-clockwise and convex (holes and fence aside); the height for leg 1.867 is 1.80 to two places | 1.5 h |
| 4b | `src/engine/sets.ts`: the five presets from `docs/research/tiles.md` (Magna-Tiles Clear Colors 32 and 100, PicassoTiles PT100, Connetix Rainbow Starter 60 and Creative 102) as `{brand, name, pieces}`; a Vitest that each sums to its total | `web/src/engine/sets.ts` | code | the sums test passes | 45 min |
| 4c | `src/engine/schema.ts` with zod: `Placed = {shape, colour?, pos: [x,y,z], rot: [rx, ry], role?: "roof"}`; `Step = {say: string, tiles: number[]}`; `Project = {id, title, theme: Theme, age: "a"|"b"|"c", stars: 1|2|3, flat?: boolean, done: string, needs: {brandExtras?: ShapeId[]}, placed: Placed[], steps: Step[], swaps?: SwapRule[]}`; `Inventory = {brands: BrandId[], tallLeg: number | null, counts: Record<ShapeId, {any: number, byColour?: Partial<Record<Colour, number>>}>}`; `Backup v1`; `src/engine/types.ts` exports the inferred types | `web/src/engine/schema.ts`, `web/src/engine/types.ts` | code | Vitest: a valid castle parses; a step pointing past `placed` fails | 1.5 h |
| 4d | `scripts/check-projects.ts` (run with `tsx`): loads every project from `src/projects/index.ts`, validates the schema, runs the checker (a stub until 4.2) under every tall-leg choice, prints one line a project, exits 1 on any failure; wired to `npm run check:projects` and already in CI | `web/scripts/check-projects.ts` | check | it runs in CI with zero projects | 45 min |

**PR 4.2 · geometry and the checker · branch `checker` · GitHub #12**

Definitions used below. A tile is a convex polygon (its shape's points) placed by `pos` and `rot`: world point = `pos + R(rot) · (px, py, 0)`, with `R` the rotation of Euler `(rx, ry, 0)` in order `YXZ` (tilt about the tile's own base edge first, then turn), exactly as the prototype's `new THREE.Euler(rx, t.ry, 0, 'YXZ')`. Tolerance `EPS = 1e-3` units. The table is the plane `y = 0`. An edge is a world segment between two consecutive points. Two edges **meet** when they are collinear within `EPS` and overlap by at least `0.98 × min(len)`. A tile is **on the table** when one of its edges, or its whole face, lies in `y = 0`. A tile's **layer** is `floor(min y + EPS)`. A tile is **standing** when its face normal has `|ny| < EPS`, **flat** when `|ny| > 1 − EPS`, else **tilted**.

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 4e | `src/engine/geometry.ts`: `worldPolygon`, `edgesOf`, `edgesMeet`, `isOnTable`, `layerOf`, `orientationOf`, `coplanarOverlapArea(a, b)` (Sutherland–Hodgman clipping in the shared plane), `crosses(a, b)` (an edge of one passes through the inside of the other by more than `EPS`), `apexOf(tilted)` | `web/src/engine/geometry.ts` | code | Vitests on hand-built cases: two squares in a line meet; a square and a right triangle share an edge; a square across a gap meets its neighbours' side edges; two overlapping coplanar squares give area 1; a crossing tile is caught; a square turned 90° has the expected corners | 4 h |
| 4f | `src/engine/check.ts`: `checkProject(project, {tallLeg}) → {ok, problems}` with the rules, each returning problems with tile and step indexes: **R1 meets**: every tile has a met edge or is on the table; **R2 no overlap**: no coplanar overlap over `EPS`, no crossing pair; **R3 grounded**: in the graph of met edges every tile reaches a tile on the table; **R4 steps**: the steps cover every tile exactly once, in order; each tile of a step meets something placed before it; after every step R3 holds; **R5 layers** (D10): no step places a tile above the current top layer plus 1; **R6 stands** (D10): after every step, every standing tile at layer 0 has a met side edge unless the project is `flat`; every standing tile above layer 0 sits on the top edge of a tile below; every tilted tile's base edge sits on a top edge below; **R7 pyramids**: tilted tiles whose apexes meet number 4 (or 3 over a triangle), share one shape, and sit on one ring; **R8 brands**: the project passes R1 to R7 for every leg in `TALL_LEG_CHOICES` and every brand's known leg, the roof tilt recomputed as `−asin(0.5 / h)`; a project that uses `window`, `door`, `fence` or `rect-2x1` lists them in `needs.brandExtras` | `web/src/engine/check.ts`, `web/src/engine/problems.ts` | code | Vitests: each rule has a passing and a failing case; a lone standing square fails R6; a floating square fails R1 and R3; a roof of three tall and one short triangle fails R7 | 6 h |
| 4g | `check-projects.ts` calls the real checker and prints each problem as `castle · step 3 · tile 29 · R6: a standing square with no neighbour`; CI fails on any | `web/scripts/check-projects.ts` | check | CI runs it green | 1 h |
| 4h | The engine map: `docs/maps/engine.json` (Archify architecture: catalog, schema, geometry, the rules R1 to R9, matching, swaps, the projects, the checker script in CI), drawn locally, not committed as a page; `web/src/engine/README.md` with the rules in words | `docs/maps/engine.json`, `web/src/engine/README.md` | document | the map passes `finalize`; the README lists the rules | 1 h |

**PR 4.3 · authoring helpers, the castle ported, matching and swaps · branch `authoring` · GitHub #13**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 4i | `src/projects/helpers.ts`: a `Builder` that collects `placed` and `steps`: `wallX(shape, colour, x, y, z)` (turn 0), `wallZ(...)` (turn −π/2), `ring(colour, cx, cz, y)` (four squares as prototype lines 177–182), `flat(shape, colour, x, z, turn)` (`rx = −π/2`), `roof(colour, cx, cz, y)` (four `tri-isosceles-tall`, `role: "roof"`, turns 0, π/2, π, −π/2 as lines 183–189, tilt from the leg length), `lowRoof()` (four equilaterals), `bridge(colour, x, y, z, along)`, `step(say)` closing the tiles added since the last step | `web/src/projects/helpers.ts` | code | Vitest: `ring` gives four met edges in a cycle; `roof` apexes meet for leg 1.867 | 2.5 h |
| 4j | `src/projects/castle.ts`: the prototype's castle (lines 190–211) through the helpers, re-chunked for age `c` (at most 4 tiles a step or one ring): one ring a step, two or three wall tiles a step, the gatehouse as one step of three, the keep one ring a step, battlements four a step, each spire one step of four; 20 to 28 steps; each `say` in the 9–10 words (`child-development.md` lines 184–188); `done: "You built the castle! Look how tall the keep is."`; `swaps: [{from: "tri-isosceles-tall", to: "tri-equilateral", perPyramid: true, say: "Short on tall triangles? Four short triangles make a lower roof."}]`; `src/projects/index.ts` exporting the list | `web/src/projects/castle.ts`, `web/src/projects/index.ts` | code | `npm run check:projects` passes the castle under every leg; no step over 4 tiles except whole rings | 2 h |
| 4k | `src/engine/match.ts`: `needsOf(project)`; `matchProject(project, inventory) → {state: "can" | "swap" | "need", missing, swaps, note?}`: count by shape, colour ignored; if short, apply swaps in this fixed order until it fits or none are left: the project's own swaps, then `tri-isosceles-tall ×4 → tri-equilateral ×4` per pyramid, `square → tri-right ×2`, `rect-2x1 → square ×2`, `square-large → square ×4`; `missing` is what remains; `note: "best-with-one-brand"` when the inventory has two or more brands and the project has a closed ring of more than six tiles; a project whose `needs.brandExtras` none of the inventory's brands have is `need` with the extras in `missing`; `canBuildCount(projects, inventory)` for the grown-ups summary | `web/src/engine/match.ts` | code | Vitests: the castle against the Magna 100 preset is `swap` (low roofs) and then needs 8 more squares, so `need`; against PicassoTiles PT100 it is `can` or `swap` as computed; a Connetix-extras project against a Magna inventory is `need` | 2.5 h |
| 4l | Age rules as data: `src/engine/ages.ts` with `AGES = {a: {label:"3–5", maxTilesPerStep:1, maxTiles:12, view:"fixed", readAloud:"always", target:88}, b: {label:"6–8", maxTilesPerStep:3, maxTiles:40, view:"buttons", readAloud:"on", target:80}, c: {label:"9–10", maxTilesPerStep:4, maxTiles:100, view:"free", readAloud:"optional", target:64}}` and **R9 age**: steps respect `maxTilesPerStep` (a ring counts as one group for `c` only), the tile count respects `maxTiles`; age `a` projects are `flat` or at most two layers | `web/src/engine/ages.ts`, `web/src/engine/check.ts` | code | the castle passes R9 as `c`; an age `a` project with a 3-tile step fails | 1 h |

### Phase 5 · the grown-ups side

**PR 5.1 · storage · branch `storage` · GitHub #14**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 5a | `src/store/db.ts` with Dexie: `settings` (one row: `{id:1, age: "a"|"b"|"c"|null, voice:true, soundEffects:false, lang:"en-US", theme:"system", firstRunSeen:false, homeScreenCardSeen:false, persisted:boolean|null, lastBackup:Date|null}`), `inventory` (one row `{id:1, ...Inventory}`), `progress` (`{projectId, step, updatedAt}`, one row a project: D20); `useLiveQuery` hooks in `src/store/hooks.ts`; `seedFixture()` for dev and e2e only, behind `import.meta.env.VITE_FIXTURE` | `web/src/store/db.ts`, `web/src/store/hooks.ts` | code | Vitests with `fake-indexeddb` cover each table | 1.5 h |
| 5b | `src/store/storage.ts`: on first run call `navigator.storage.persist()` and keep the result; `isStandalone()` (`matchMedia("(display-mode: standalone)")` or `navigator.standalone`); `AddToHomeScreenCard` shown once in a Safari tab on iPadOS ("Add this to your Home Screen first, so it keeps your tiles", with pictures of Share then Add to Home Screen); the first-run card (D10) shown once in the Home Screen app | `web/src/store/storage.ts`, `web/src/ui/AddToHomeScreenCard.tsx` | code | Vitests with stubbed `matchMedia` and `navigator.storage`; Playwright shows each card in the right mode | 2 h |
| 5c | `StorageStatus` wired: "Kept on this iPad: yes", or "The iPad may clear this if space runs low; a backup is safer", with the `persist()` result and the last backup date | `web/src/screens/grownups/Settings.tsx` | code | the text matches the stored state in a Vitest | 30 min |

**PR 5.2 · the grown-ups door, inventory, settings · branch `grownups` · GitHub #15**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 5d | `#/grownups` opens `GateDialog`; once open, it stays open for 10 minutes without a tap, then closes; the grown-ups home: the tiles summary ("You have 112 tiles. You can build 14 of 30 projects"), Tiles, Settings, Backup, and a tip on Guided Access as plain text | `web/src/screens/grownups/Home.tsx`, `web/src/screens/grownups/gate.ts` | code | Playwright: the door blocks, opens with the right sum, and closes after the timeout (clock stubbed) | 1.5 h |
| 5e | The Tiles screen wired to `inventory`: a preset fills the counts (replacing, after a confirm), steppers save on change, the colour fold saves `byColour` (a colour count never exceeds `any`), the brand row saves `brands` and `tallLeg`, the summary recomputes with `canBuildCount` | `web/src/screens/grownups/Tiles.tsx` | code | Vitests on the reducer; Playwright: pick a preset, change two counts, reload, the counts hold | 2.5 h |
| 5f | Settings wired: voice, sound effects, language (the voices on the device, listed), theme, storage status, "Erase everything on this iPad" behind a `ConfirmDialog` that asks to type ERASE | `web/src/screens/grownups/Settings.tsx` | code | each switch round-trips through Dexie in a Vitest | 1 h |
| 5g | Plates for the grown-ups screens in both orientations and themes; axe | `web/e2e/grownups.spec.ts`, plates | check | green in CI | 1 h |

**PR 5.3 · backup and restore · branch `backup` · GitHub #16**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 5h | `src/store/backup.ts`: `exportBackup()` makes `tile-builder-backup-YYYY-MM-DD.json` `{version:1, exportedAt, settings, inventory, progress}` checked by the zod `Backup` schema, handed over with `navigator.share({files})` when available, else an `<a download>`; `importBackup(file)` checks it, shows "112 tiles, 4 builds in progress. Replace what is on this iPad?" and replaces on confirm | `web/src/store/backup.ts`, `BackupCard` wired | code | Vitests: export then import round-trips every table; a `version: 2` file is refused with a plain message | 2 h |
| 5i | The grown-ups' page `docs/parents.md`: install on the iPad, why the Home Screen matters, backups, what the app never does | `docs/parents.md` | document | under 50 lines; no step needs the code | 30 min |
| 5j | Playwright `e2e/backup.spec.ts`: inventory and progress survive a reload; export, erase, import restores them | `web/e2e/backup.spec.ts` | check | green | 30 min |

### Phase 6 · the library

**PR 6.1 · the 3D viewer with the per-age controls · branch `viewer` · GitHub #17**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 6a | `src/three/Model.tsx`: renders a project's `placed` up to a `shown` count with `TileMesh`, each tile's target transform from `pos` and `rot` (roof tilt from the inventory's `tallLeg`, default 1.867); the drop-in animation from prototype lines 303–348 (a seeded start pose with `mulberry(7)`, `easeOutBack`, per-tile progress over 0.55 s, 0.15 s under reduced motion, fully opaque by a third of the way); lights, shadows, ground disc and camera from lines 262–300 (`PerspectiveCamera(36)`, `HemisphereLight(0xffffff, 0x8899aa, 0.75)`, `DirectionalLight` at (6, 12, 7) with a 2048 shadow map, `CircleGeometry(8, 64)` ground, the model centred on its footprint); the current step's tiles get a pulsing outline where they go | `web/src/three/Model.tsx`, `web/src/three/anim.ts` | code | the castle plays from 0 to its last tile in Playwright with no console error; a Vitest covers `anim.ts` | 4 h |
| 6b | `src/three/Viewer.tsx`: props `project, shown, inventory`; the project's age sets the view: `a`: a fixed view from the child's side (camera at (0, 5.5, 9.5) looking at the footprint centre), one slow quarter turn when a step first appears then still, ◀ ▶ turn by 90° in 600 ms, "back to my side" resets, no pointer turning (`touch-action: pan-y`), never an auto-turn during a step (D10); `b`: ◀ ▶ plus one-finger drag to turn (`OrbitControls` with `enableZoom:false, enablePan:false, maxPolarAngle: 0.49π`), the view returns to the child's side on each new step; `c`: free orbit and pinch zoom (`minDistance 6, maxDistance 26`), a slow turn (one turn in 25 s) that stops on touch, when a step is spoken, and under reduced motion | `web/src/three/Viewer.tsx` | code | Playwright per age: the camera turn after ▶ is 90° (read from a test hook `window.__viewer`), drag does nothing for `a`, no auto-turn for `a` | 3 h |
| 6c | Performance: pixel ratio capped at 2, `frameloop="demand"` when nothing moves, geometry shared per shape, materials per colour; `perf.spec.ts` asserts a median frame under 120 ms on the castle in headless Chromium | `web/src/three/*`, `web/e2e/perf.spec.ts` | check | the spec passes in CI | 2 h |
| 6d | The design page shows the viewer with an age switch | `web/src/screens/Design.tsx` | code | plate updated | 1 h |

**PR 6.2 · thumbnails at build time; the Library · branch `library` · GitHub #18**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 6e | `scripts/thumbs.ts`: starts `vite preview`, opens `#/thumb/:pid` (the finished model on the surface colour, a fixed camera, no UI) with Playwright at 1024×1024, writes `public/thumbs/<pid>.webp` (quality 80) and a 256 px version, skips a project whose content hash matches `public/thumbs/manifest.json`; `npm run thumbs` runs before `vite build` in `npm run build`; `public/thumbs/` is ignored by git except the manifest | `web/scripts/thumbs.ts`, `web/src/screens/Thumb.tsx` | code | after `npm run build`, `dist/thumbs/` has one webp per project, each under 80 KB | 2.5 h |
| 6f | The Library wired: the `AgePicker` saves `settings.age` (a first visit with no age shows all three shelves, smallest first); `ProjectCard`s from `src/projects/index.ts` with `matchProject` against the live inventory, sorted `can`, then `swap`, then `need`, then stars; the theme filter; a tap on any card goes straight to `#/build/:pid` (D18); an empty inventory shows an `EmptyState` sending a grown-up to the door | `web/src/screens/Library.tsx` | code | Playwright: with the Magna 32 preset and age `a`, at least 8 cards are `can`; the castle shows `need` with the right counts; one tap opens build mode | 2.5 h |
| 6g | Plates for the Library in both orientations, both themes and each age; axe | `web/e2e/library.spec.ts`, plates | check | green in CI | 1 h |

**PR 6.3 · projects for 3–5 · branch `projects-a` · GitHub #19**

Each project in 6.3 to 6.5 is written with the helpers, has a `say` line per step in its age's words, a `done` line, passes `check:projects` under every leg, and gets a thumbnail. Titles are the builder's own. Flat pictures use `flat()` and set `flat: true`. `stars` follow the tile count within the age (lower third 1, middle 2, upper 3).

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 6h | Ten age `a` projects, 3 to 12 tiles, one tile a step, all buildable from the Magna 32 preset: flat pictures (a fish, a house, a flower, a rocket, a cat face) and small 3D builds that stand (a box, a box with a lid, a tunnel for a car, a tower of two rings, a kennel with a low roof of four equilaterals), across the eight themes | `web/src/projects/a/*.ts` | code | all ten pass; a 32-piece set builds every one | 6 h |
| 6i | Their `say` lines checked against the 3–5 word list, with grown-up lines where a step needs holding ("Grown-up, hold the wall while your builder adds the roof") | the same | document | every line uses only the age's words plus the project's nouns | 2 h |

**PR 6.4 · projects for 6–8 · branch `projects-b` · GitHub #20**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 6j | Twelve age `b` projects, 12 to 40 tiles, up to 3 tiles a step: a house with a pitched roof, a garage, a bridge with two towers, a rocket with fins, a robot, a boat, a pyramid garden, a windmill, a small keep, a bus, a dinosaur (flat), a star pattern (flat) | `web/src/projects/b/*.ts` | code | all twelve pass; at least eight build from the Magna 100 preset; at least two from the Connetix 60 preset | 8 h |
| 6k | `say` lines in the 6–8 words (edges, faces, layers, symmetry) | the same | document | checked as 6i | 2 h |

**PR 6.5 · projects for 9–10 · branch `projects-c` · GitHub #21**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 6l | Eight age `c` projects, 30 to 100 tiles, up to 4 tiles a step or one ring: the castle (from 4.3), a cube house with a room on top, a lighthouse (rings with a pyramid), a long bridge, a space station (two cubes and a connector), a stadium ring, a Connetix town hall (windows and doors, `needs.brandExtras`), a sculpture of pyramids | `web/src/projects/c/*.ts` | code | all eight pass; at least five build from the Magna 100 preset with swaps | 6 h |
| 6m | `say` lines in the 9–10 words (nets, vertices, quarter turns) and the "best with one brand" note on the two biggest rings | the same | document | checked as 6i | 2 h |

### Phase 7 · build mode

**PR 7.1 · steps, voice, turn controls, swaps, the "it fell down" help · branch `build-mode` · GitHub #22**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 7a | `#/build/:pid` wired: `shown` follows the step; Next moves one step and says its line (age `a` always, `b` when voice is on, `c` on Hear again or when voice is on); Back goes one step; Hear again repeats; `StepDots`; the step's tiles as `TileChip`s with counts; the viewer for the project's age; the step saved to `progress` on every move (D20); opening a project with a saved step goes straight to it, with Back still able to go to the start | `web/src/screens/Build.tsx` | code | Playwright: the castle steps to the end with Next; a reload mid-way returns to the same step | 3 h |
| 7b | Missing tiles: when `matchProject` says `need`, the first screen is the note from 3b ("You need 2 more ▲ for this one", the tiles drawn, "Start anyway", "Pick another"); "Pick another" returns to the Library; nothing says buy | `web/src/screens/Build.tsx` | code | Playwright: the castle with a Magna 32 inventory shows the note | 1 h |
| 7c | Swaps in play: when a swap applies, the step's `TileChip`s show the swapped shape with a small "instead" mark, the `SwapNote` line is said once at the first swapped step, and the model shows the swapped shape (the low roof) | `web/src/screens/Build.tsx`, `web/src/three/Model.tsx` | code | Playwright: the castle with a Magna 100 inventory shows equilateral roofs | 2 h |
| 7d | "It fell down" (ages `a` and `b`): a button opens a calm sheet: "Towers fall sometimes. Builders fix them." with "Go back one step" and "Start this layer again" (back to the first tile of the current layer); after two uses on the same step: "Ask a grown-up to hold it while you add the next tile."; no sound, no red, no score | `web/src/screens/Build.tsx`, `web/src/ui/kid/FellDown.tsx` | code | a Vitest on the state machine; a plate | 1.5 h |
| 7e | Jump to any step for age `c`: tapping a dot jumps | `web/src/screens/Build.tsx` | code | Playwright | 30 min |
| 7f | Rest state: after 90 s with no tap during a step, the panel dims to "keep building" with the step picture large; any tap brings it back; no sound, no nag | `web/src/screens/Build.tsx` | code | Playwright with a stubbed clock | 1 h |
| 7g | Plates for build mode per age, both orientations, both themes; axe; the motion audit on the step change | `web/e2e/build.spec.ts`, plates | check | green in CI | 1 h |

**PR 7.2 · the end of a build · branch `build-end` · GitHub #23**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 7h | After the last step: `#/done/:pid` with the finished model, the `Celebration` (one moving element, under 1.4 s, skippable, the same every time), the project's `done` line said aloud, then "Put the iPad down and play with what you made." and one button, "Back to the shelf"; no next project, no "one more?"; the project's saved step is cleared | `web/src/screens/Done.tsx` | code | Playwright: the sequence runs, skip works, reduced motion shows the still version, the step is cleared | 2 h |
| 7i | Copy pass: every word the app shows or says is in `web/src/strings.ts` and reads in the voice of `PRODUCT.md` | `web/src/strings.ts` | document | a Vitest finds no kid-facing string outside the file | 1 h |

### Phase 8 · go live

**PR 8.1 · Verification, the grown-ups' page, the Pages link · branch `go-live` · GitHub #24**

| # | What | Files | Kind | Done when | Time |
|---|------|-------|------|-----------|------|
| 8a | Run the Verification table and fix what fails | as needed | check | V1 to V11 green, recorded in Results | 2 h |
| 8b | `README.md` for the public repo: what it is, the live link, what it keeps and where, how to run it, the research; `docs/parents.md` linked from the grown-ups home | `README.md`, `docs/parents.md` | document | Jordan can send the link to a family | 1 h |
| 8c | A root `CHANGELOG.md` with the first release; the plan's Status says done with the pull requests; the Design System artifact republished from the final tokens; the features map redrawn from the built app and checked against it | `CHANGELOG.md`, `plans/`, `docs/maps/features.json`, artifact | document | the status line is right; the map matches the routes | 1.5 h |
| 8d | Tell Jordan: the link, what to test (T1 to T5), what is still thin (Q1, the unverified research rows) | GitHub | document | sent and logged | 30 min |

## Gates that need Jordan

| Gate | When | What he does |
|---|---|---|
| G1 | end of PR 1.1 | Reads `PRODUCT.md` (under 150 lines), picks the name from three, says what to change |
| G2 | end of PR 3.1 | Opens the board of sixteen plates and the live routes on an iPad, approves the look or asks for changes (PR 3.2) |

Everything else runs on the builder's own checks (D11, D12). Phases 4 and 5 do not wait for G2; PR 6.2 and Phase 7 do, because they fix the screens.

## Time bounds and self-checks

As in `plans/README.md` (copied into this repo by 0d): every key has an estimate and a stop point at 1.5 times it; over the stop point, write why in the log and re-estimate; at 2 times, stop and ask Jordan; under half, say so and re-read "Done when".

Checkpoints: **C1** after PR 2.6 (the design system), **C2** after PR 4.3 (the engine), **C3** after PR 6.5 (the projects): the whole plan against the clock, the keys left, the new finish estimate, in a build-log row.

Run bounds: `npm run test:e2e` under 6 minutes in CI; `npm run thumbs` under 2 minutes for 30 projects; `check:projects` under 30 seconds. At 2 times any of these, look.

## The rules of the build

As in `plans/README.md`, and:

9. **The builder's start.** A session picking this up reads, in order: this plan's last build-log row, `PRODUCT.md`, `DESIGN.md`, `docs/research/README.md`, `web/README.md`. It checks out the commit the log names, runs `npm ci && npm run check && npm test`, and starts the next key.
10. **One builder, alone** (D14). No Workflow tool and no subagents.
11. **Merging** (D11). A pull request merges when CI is green, its plates are committed, its build-log row is written, and its description lists each key's "Done when" with the checks run. Squash merge; delete the branch. The next pull request's branch takes `main` before its first real commit.
12. **The cloud network.** 21st.dev and most product sites are blocked; GitHub, npm and PyPI are open. A page that will not load is noted, not retried in a loop.
13. **No data.** No photos or real names of children in fixtures, plates or anywhere in the repo; no keys or tokens; no analytics.
14. **Plates are made on Linux** (this container or CI), never on a Mac, so they match.
15. **Kid words are content.** From 7i, every word the app shows or says lives in `web/src/strings.ts`; earlier keys may write strings in place, and 7i moves them.
16. **Changing a research-backed rule** (a target size, a tiles-per-step limit, the auto-turn rule) or adding a screen (D18) is a Decisions row with Jordan's word, not an edit.

## Critical files

Read or reused, not rebuilt:

| What | Path | Used by |
|---|---|---|
| The plan format | `web-agent/plans/README.md` | 0d |
| The brief's shape | `web-agent/design/PRODUCT.md` | 1a |
| The design system's shape | `web-agent/DESIGN.md` (headings) | 2s |
| The token pipeline | `web-agent/design/tokens.py` lines 39–74, 90–115, 191–194, 215–247; `web-agent/design/tokens.smithy.json` (shape only) | 2a, 2b |
| The token test | `web-agent/tests/test_design_tokens.py` lines 27–38 | 2d |
| The scaffold | `web-agent/web/package.json`, `vite.config.ts`, `tsconfig.json`, `playwright.config.ts`, `src/app/ground.ts`, `src/app.css`, `README.md` | 2e, 2i |
| Component patterns | `web-agent/web/src/ui/Button.tsx`, `Tabs.tsx`, `Floats.tsx`, `Field.tsx`, `States.tsx`, `Design.tsx` (the `Row` pattern), `ui.test.tsx` | 2n to 2r, 2t |
| The e2e patterns | `web-agent/web/e2e/design.spec.ts` (axe at lines 18–19, `open()` at 6–12), `shell.spec.ts` | 2i and every plate key |
| The 3D prototype | `docs/prototype/magnet-tile-castle.html` (copied in by 0f): geometry lines 143–159 and 221–251, helpers 172–189, the castle 190–211, animation 303–348, materials 317–325, scene 262–300, controls 458–466 | 2l, 4a, 4i, 4j, 6a, 6b |
| The features map | `docs/maps/features.json` (0e), first drawn in this session in the scratchpad's `map/features.json`; that draft has profiles, a project page and a camera, which 0e removes | 0e, 8c |
| The research | `docs/research/tiles.md`; `child-development.md` (lines 101–105 tiles per step, 184–188 words, 252–266 screen to hands, 289–295 the fall-down script, 331–342 the age table); `kids-and-ipad.md`; `kids-app-design.md` (its Recommendations: tokens, components, icons, motion and sound, five things to avoid); `parent-voice.md` (themes 2 to 7); `competitors.md` (sections 7 and 9) | 1a, 2a, 2s, 4l, 6h to 6m, 7d |
| The skills | `.claude/skills/ui-ux-pro-max` (`scripts/search.py`), `design-motion-principles`, `redesign-existing-projects`, `frontend-design` (the design plan before 2.1 and 3.1), `webapp-testing`, `archify` | 2a, 2p, 3a to 3d, 0d, 0e, 4h |
| The tools list | `docs/design-tools.md` | before any design key |

No source file over 500 lines; `check.ts` splits into a `check/` folder if it grows.

## Verification

Once, at the end (8a).

| V | Check | Passes when |
|---|---|---|
| V1 | `python3 -m design.tokens check` and `pytest -q tests` | exit 0 |
| V2 | `npm run check && npm test` | exit 0, no skipped test |
| V3 | `npm run check:projects` | 30 projects pass R1 to R9 under every leg in `TALL_LEG_CHOICES` and every brand's known leg |
| V4 | `npm run size` | no source file over 500 lines |
| V5 | `npm run build && npm run test:e2e` in CI | green; every screen has plates in both orientations and themes; axe finds nothing on any route |
| V6 | Offline | after one load with the network off, every route opens and the castle builds |
| V7 | Storage | inventory, settings and saved steps survive a reload; export, erase, import restores them |
| V8 | Targets | every kid control measures at least 88/80/64 px by age, the primary buttons 104, grown-ups controls 44, kid gaps 24 |
| V9 | Two taps | from a cold start with an inventory and an age chosen, one tap on a card shows step 1 of that project |
| V10 | Voice | every step of every project has a `say` line; age `a` lines use only the 3–5 words plus the project's nouns |
| V11 | Nothing leaves | with a request log, after the first load, no request leaves the site on any route |

Live: `https://jordanromines-jpg.github.io/tile-builder/` opens and installs to the Home Screen (part of T1).

## Jordan's testing after

| T | What he looks at or runs | When |
|---|---|---|
| T1 | Opens the live link on an iPad, adds it to the Home Screen, enters his tiles from a preset and adjusts the counts; it takes under five minutes | after 8.1 |
| T2 | A 3- or 4-year-old picks an age-`a` project and finishes it with only the app's help (D10: the test kept as written); he notes where the child looked and where they stalled | after 8.1 |
| T3 | A 6- to 8-year-old finishes an age-`b` build alone and tries the turn buttons and drag | after 8.1 |
| T4 | A 9- or 10-year-old builds the castle and tries to open the grown-ups door | after 8.1 |
| T5 | Turns Wi-Fi off and uses the app for ten minutes; saves a backup, erases, restores; measures a real tall triangle's long side and picks the matching picture (Q1) | after 8.1 |

## Build log (append, never rewrite)

| When (UTC) | PR · keys | Commit | Hours (est · used) | Result / re-evaluation | Next |
|---|---|---|---|---|---|
| 2 Oct 2026, 04:45 to 05:25 | PR 0.1 · the plan (no key yet) | `e026bc9`, `dead16d`, `7a7d541`, `10a748f`, `5d03a00`, `ff98461` on `plan/phase-0` (#1) | not estimated · 0.7 | The first `PLAN.md`, five research files, eight skills, `docs/design-tools.md` pushed; the four research agents' reports read; this plan drafted in plan mode | Jordan's approval |
| 2 Oct 2026, 05:25 to 05:35 | PR 0.1 · the plan (no key yet) | none (scratchpad) | not estimated · 0.2 | A features map drawn with Archify from `web-agent`'s copy; Jordan: "this is too complicated. no extra profile pics or project pages. Just select a project and do it. no camera." The plan cut to the Library, Build mode and the celebration (D18 to D21): 173 h became 154 h | Jordan's approval; then 0a to 0h |
| 2 Oct 2026, 05:35 to 05:45 | PR 0.1 · 0a to 0g | `5f63354`, then the commit that adds this row | 4.0 · 0.2. **Under half the estimate**: "Done when" re-read for each key and met; the keys were copying and writing, and neither the research file nor Archify needed changes. The times in the two rows above were first written as a guessed local clock and corrected here to UTC from the commit times | **0a** `kids-app-design.md` in, 81 sources. **0b** marked not run. **0c** Archify v3.0.1, 7.3 MB without its tests; its `examples/` kept because its skill reads them. **0d** the plans folder; the roadmap passes `finalize`; the plan's total corrected from 155 h to 154 h (the hours in its table add to 154). **0e** the features map for the simple app passes `finalize`, sent to Jordan. **0f** `PLAN.md` a pointer, README, tools row, prototype in `docs/prototype/`. **0g** 23 draft pull requests opened from `main` with one empty commit each: #2 to #24, numbers in the tables and headings | 0h: mark #1 ready and merge; then PR 1.1 (#2), 1a |
| 2 Oct 2026, 05:50 | PR 1.1 · start | the branch `brief` rebased on `main` (84cde73) | 5.0 · started | The merged branch `plan/phase-0` could not be deleted: the session's git proxy refuses branch deletes; it stays | 1a |
| 2 Oct 2026, 05:50 to 06:05 | PR 1.1 · 1a 1b 1c, G1, 1d | `039ad6b`, then the commit that adds this row | 5.0 · 0.3. **Under half the estimate**: "Done when" re-read; the brief drew on finished research, and the name search took six searches | **1a** `PRODUCT.md`, 127 lines, every claim cited. **1b** `docs/research/README.md`. **1c** the brief and three names sent. **G1** Jordan: "Tile Steps, keep going." (D17). **1d** the name in `PRODUCT.md`, `README.md`, `PLAN.md`, the plan, the maps' titles; the repo and research keep "Tile Builder". Found on the way: an MIT project that measured a Magna-Tiles tall triangle (143 mm ± 5), now in `tiles.md`, Q1 and key 4a | Merge #2; then PR 2.1 (#3), 2a |
| 2 Oct 2026, 05:51 to 06:00 | PR 2.1 · 2a 2b 2c 2d | the commit that adds this row | 6.0 · 0.2. **Under half the estimate**: "Done when" re-read for each key and met; `tokens.py` was mostly web-agent's, and the colour work was one script | **2a** `design/tokens.json` and `tokens.dark.json`, one token a line (118 and 34 lines, so the 500-line check in 2g holds); 58 contrast checks pass in both grounds. Changed from the key: `ink-3` darkened to `#5F6474` and kept off `surface-3`; the orange, yellow and green rims are darker than their fills in light (3:1 on the surfaces); the status tokens are `can-bg`/`can-ink` and `wait-bg`/`wait-ink`; each tile's pattern and spoken name sit under its `$extensions`, not as tokens of their own. **2b** `design/tokens.py`; `check` exits 0. **2c** `design/cvd.py` and `design/README.md`: under deutan vision blue/purple (0.036) and red/green (0.055) nearly merge, under protan orange/green (0.051), so the pattern and name are the rule. **2d** 7 tests pass. The PR 1.1 row above ends at 06:05; #2 in fact merged at 05:51 | Merge #3; then PR 2.2 (#4), 2e |
| 2 Oct 2026, 06:00 to 06:15 | PR 2.2 · 2e 2f 2g 2h 2i | the commit that adds this row | 8.0 · 0.3. **Under half the estimate**: "Done when" re-read; web-agent's configs carried over nearly as they were | **2e** `web/` scaffold, the D15 dependencies pinned, eight hash routes as placeholders, `strings.ts`; `npm run check`, `npm test` (2) and `npm run build` pass. **2f** icons drawn by `scripts/icons.mjs` (a house of three tiles), `robots.txt`, the one-time "Ready to use without Wi-Fi" note; `e2e/offline.spec.ts` passes. **2g** `ci.yml` and `pages.yml`; `scripts/size.mjs`. **2h** `web/README.md`. **2i** Playwright as an iPad in both orientations, axe on the Library, manifest and icons checked: 20 pass locally. Changed: Playwright 1.56.1 (D23). Jordan asked to build end to end (D22) | Merge #4 when CI is green; enable Pages; then PR 2.3 (#5) |
| 2 Oct 2026, 06:15 to 06:25 | PR 2.3 · 2j 2k 2l | the commit that adds this row | 7.0 · 0.2. **Under half the estimate**: "Done when" re-read; the prototype's geometry carried over | **2j** `TileChip` and `patterns.tsx`: all nine shapes in six colours and "any colour"; counts; speaks on tap; Vitest. To draw shapes, 4a's catalog (`engine/catalog.ts`: shapes, colours, brands, legs) came forward from PR 4.1, with its tests. `speech/say.ts` (2n) came forward too, for the chip's `speak`. **2k** `ShapeIcon`, `icons.ts`, `ThemeIcon` and the eight themes (`engine/themes.ts`). **2l** `three/tile.ts` (frame, glass, ridge; window and door openings; fence bars) and `TileMesh`; geometry shared a shape. The design page (`#/design`) shows them in light and dark; `e2e/tiles.spec.ts` passes axe in both. **2m** moves into `DESIGN.md` in PR 2.6. Found: base CSS outside a layer beat Tailwind's utilities; moved into `@layer base` | Merge #5; PR 2.4 (#6) |
| 2 Oct 2026, 06:25 to 06:40 | PR 2.4 · 2n 2o 2p | the commit that adds this row | 6.0 · 0.25. **Under half the estimate**: "Done when" re-read | **2n** `say.ts` (from 2.3) with `useLastLine`, `SpeakButton`. **2o** `AgeContext`, `KidButton`, `KidBar`, `GrownUpsDoor`, `AgePicker` (stacks of one, two and three tiles), `ThemeFilter`, `BuildBadge`, `ProjectCard`, `Shelf`, `StepDots`, `TurnControls`, `SwapNote`, `EmptyState`, `Celebration` (a hexagon of six triangle tiles turning into place); 7 Vitests; the design page shows each at the chosen age; `e2e/design.spec.ts` measures every kid target per age (it found the shelf's ▶ and the empty state's picture too small; fixed) and runs axe in both themes. **2p** `ui/motion.ts`; the `design-motion-principles` audit was read against the celebration and the press states: one moving element, under 1.4 s, still under reduced motion; no open finding. Kid words moved into `strings.ts` now rather than at 7i. The `#/thumb` route is gone: see D24 | Merge #6; PR 2.5 (#7) |
| 2 Oct 2026, 06:40 to 06:50 | PR 2.5 · 2q 2r | the commit that adds this row | 5.0 · 0.2. **Under half the estimate**: "Done when" re-read | **2q** `Button` (lit, line, quiet, danger; 44 px), `Dialog` and `ConfirmDialog` (with a typed word), `Toast` and `useToast`, `Field`, `Switch` (its state in words), `Radios`, `Stepper` (long press repeats; a spin button for screen readers), `SettingsList`, `StorageStatus`, `BackupCard`. **2r** `GateDialog`: hold three seconds with a filling ring, then a sum in words on a number pad, three tries. Vitests with fake timers: hold, early release, right and wrong sums, the stepper's repeat, the typed word (10). The design page shows them; axe passes | Merge #7; PR 2.6 (#8) |
| 2 Oct 2026, 06:50 to 07:00 | PR 2.6 · 2m 2s 2t | the commit that adds this row | 5.0 · 0.2. **Under half the estimate**: "Done when" re-read | **2s** `DESIGN.md`: how to use it, principles, foundations (themes, colour, type, space, motion, sound, icons), Tile pictures (**2m**), a section for every component in 2.3 to 2.5, patterns, copy with the words by age, accessibility, what is never allowed; each rule names its source. **2t** `#/design` was built up through 2.3 to 2.5; its plates in both themes and both orientations are committed (`e2e/plates/design-*.png`, the 3D canvas masked); axe passes. **2u** moves to 8c: the Design System artifact is published once, from the final tokens, at go-live. Jordan enabled Pages ("done"); the failed deploy of #5 was re-run | Merge #6, #7, #8; then C1 and PR 3.1 (#9) |
| 2 Oct 2026, 07:00 | **C1** (after the design system) | | Phase 2 estimated 37 h, used 1.3 h | Every key so far finished well under its estimate: the builder works from web-agent's patterns and the prototype, and runs each check as it writes. Left: phases 3 to 8 (113 h estimated). The long poles are the checker (4.2) and the thirty projects (6.3 to 6.5), which must each pass it. No re-planning needed; the order stands | PR 3.1 (#9) |
| 2 Oct 2026, 07:00 to 07:25 | PR 4.1 to 4.3 · 4b to 4l (D25) | the commit that adds this row | 25.0 · 0.4. **Under half the estimate**: "Done when" re-read for each key | **4b** `sets.ts`, sums tested. **4c** `schema.ts` (zod) and `types.ts`; a step past the last tile fails. **4d, 4g** `scripts/check-projects.ts` (run by `vite-node`, now a pinned dev dependency): one line a project, each problem as `castle · step 3 · tile 29 · R6: …`; 0.1 s. **4e** `geometry.ts`: 8 tests (a line, a shared edge, a gap spanned, a corner, overlap 1 and 0.5, a tile through another, the table and layers, roof apexes). The first crossing test missed two squares cutting each other in a cross; crossing is now found from where the two planes meet. **4f** `check.ts`, R1 to R9, each with a failing case. One rule added in writing it: a whole pyramid in one step counts as one group at every age, because leaning triangles can't be placed one at a time. **4h** `engine/README.md`; `docs/maps/engine.json` passes Archify `finalize` (all four gates). **4i** `projects/helpers.ts`. **4j** the castle: 90 tiles, 25 steps, at most 4 a step; passes under legs 1.5, 1.867, 1.877, 2.2. **4k** `match.ts`: with a Magna-Tiles 100 the castle takes low roofs on two towers and five pairs of corner triangles, and is still 3 squares short, so `need` (the plan guessed 8 short; the corner-triangle swap closes five of them). **4l** `ages.ts` and R9. 52 unit tests | Merge #11; close #12, #13; then C2 |
| 2 Oct 2026, 07:25 | **C2** (after the engine) | | Phases 2 and 4 estimated 62 h, used 1.7 h | The engine holds: the castle passes every rule under every leg. Left: the screens (3.1), storage and the grown-ups side (5.1 to 5.3), the viewer, Library and thirty projects (6.1 to 6.5), build mode (7.1, 7.2), go-live. The projects stay the long pole: each must pass the checker | PR 5.1 (#14) |

## Results

None yet.

## Open questions carried

| # | Question | Default if nobody answers |
|---|---|---|
| Q1 | The tall triangle's leg length for Connetix, and a second measure of Magna-Tiles' (found 2 Oct 2026: 143 mm ± 5, one project's photo measurement) | The grown-up picks from three pictures (1.5, 1.867, 2.2 units); the checker passes every project under all three and under each brand's known leg; T5 settles it |
| Q2 | The app's name | Settled at G1: Tile Steps (D17) |
| Q3 | Sound effects beyond the voice | Off by default, a switch in settings; when on, through Web Audio in "ambient" mode so silent mode holds |
