# Looks: the contract

Tile Steps comes in looks a family chooses (plan: `plans/2026-10-08-design-polish.md`). A look changes **how things look
and sound, never what they do**: layouts, steps, words, the 3D model, its animation and every rule are shared
("structure"). A look is one folder, and a look's agent edits only that folder (and its own e2e plates). Anything a
look needs that isn't here goes to the lead, who adds it to structure for every look.

```
looks/<look>/look.css    tokens and ts-* hook styles, light and dark      (imported by app.css)
looks/<look>/stage.ts    the 3D stage: floor, light, shadow, effects by tier (type: looks/stage.ts)
looks/<look>/sounds.ts   the look's voice for the shared sound events       (type: sound/sound.ts)
looks/<look>/decor.tsx   shapes CSS can't make, at named places             (type: looks/decor.tsx)
```

Each part is gathered by its own registry (`stages.ts`, `voices.ts`, `decorations.ts`): the stage pulls in three.js,
so it must load only with the 3D, never with the first screen. Import nothing from three.js in sounds.ts or decor.tsx.

Looks: `toy` (Toy studio), `book` (Picture book), `studio` (Clean studio), and `classic` (the design before 3.0, the
reference; its files are the examples).

## 1. look.css

Write every selector under `[data-look="<look>"]`, **never `:root`**: the picker previews a look by putting
`data-look="<look>"` on a small element inside whatever page is showing, so a look's styles must work on any element.
Use this template for tokens (the dark selectors make previews follow light and dark too):

```css
[data-look="toy"] { --surface: #...; /* light values */ }
:root[data-theme="dark"] [data-look="toy"], :root[data-theme="dark"][data-look="toy"] { --surface: #...; /* dark */ }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) [data-look="toy"], :root:not([data-theme="light"])[data-look="toy"] { --surface: #...; }
}
[data-look="toy"] .ts-card { /* restyle a hook */ }
```

**Rules:** every token you override in light, override in dark too. Keep the tile colours (`--tile-*`) as they are:
the tiles are the toy and must match the real ones. Keep contrast: `python -m design.tokens contrast` checks the base
pairs; for yours, keep text on its surface at 4.5:1 or better (3:1 for text 24 px and up) in light and dark. Keep
every target at least its current size (`--target-*`). No webfonts beyond those already bundled (Fredoka, Andika,
Atkinson Hyperlegible Next) unless the lead adds one; no images from the network; textures are CSS or inline SVG
(data URIs), small.

**Tokens** (from `src/tokens.css`; override any): `--surface --surface-2 --surface-3 --ink-1 --ink-2 --ink-3 --line
--accent --accent-ink --accent-soft --focus --can-bg --can-ink --wait-bg --wait-ink --stage --ground --r-sm --r-md
--r-lg --r-tile --rim --t-press --t-ui --ease --display --kid --parent` (fonts by family name).

**Hooks** (classes on the shared components; style them freely, but don't hide them or change what they hold):

| Hook | What |
|---|---|
| `ts-library`, `ts-build`, `ts-done`, `ts-grownups` (`ts-gate` for the lock screen) | each screen's root |
| `ts-header`, `ts-wordmark` | the Library's top bar and the name |
| `ts-ages`, `ts-age` (`[aria-pressed=true]` when picked) | the age picker |
| `ts-chips`; `ts-chip-wrap` (the button, `[aria-pressed=true]` when picked) holding `ts-chip` (the round picture) and `ts-chip-word` (its word); select the picked one with `.ts-chip-wrap[aria-pressed="true"] .ts-chip` (3.1) | the theme filter |
| `ts-shelf`, `ts-shelf-title`, `ts-plank`, `ts-more` | a shelf, its heading, its plank, its ▶ button |
| `ts-card`, `ts-card-picture`, `ts-card-title`, `ts-resume` | a project card |
| `ts-hero`, `ts-hero-picture`, `ts-hero-eyebrow`, `ts-hero-title` (3.1) | the Library's first card: "Keep building" or "Try this one" (its button is a `ts-button ts-button-accent ts-button-primary`) |
| `ts-badge` + `ts-badge-can` / `ts-badge-need` / `ts-badge-soft` | "You can build it" and friends |
| `ts-button` + `ts-button-accent` / `-plain` / `-soft`, `ts-button-primary` | every kid button |
| `ts-next` | the big Next button |
| `ts-title` | the build's name at the top of build mode |
| `ts-panel`, `ts-step-tiles` | the step panel (build mode and the finish) and this step's tile chips |
| `ts-dots`, `ts-dot` + `ts-dot-done` / `ts-dot-now` / `ts-dot-todo` | the step dots |
| `ts-turns` | the turn buttons |
| `ts-finish-words` | the finish's headline |
| `ts-pip` (3.1) | Pip, the tile friend: on the step panel's edge in build mode (88 px) and big on the finish (180 px); style its ground shadow or a glow, don't hide it |
| `ts-door`, `ts-empty`, `ts-empty-banner`, `ts-rest` | the grown-ups door, empty states, the "keep building" rest screen |
| `ts-looks-button`, `ts-looks-panel`, `ts-looks`, `ts-look`, `ts-preview` | the look picker |
| `kid`, `soft`, `press`, `lift`, `plank` | older shared classes (shadow, press and lift motion, plank) |

## 2. stage.ts

Export `stage: StageLook` (see `looks/stage.ts`, and `classic/stage.ts` as the example): background (and fog)
colour, the floor (a texture made on the device with a canvas, **made once and cached**, like `woodTexture`), the
hemisphere, key and fill lights, environment strength, exposure, the contact shadow, and effects by tier.

**Effects by tier** (`three/quality.ts` picks the tier from the device and steps down when frames drop): `low` must
return `{}` and look good; `mid` may add ambient occlusion (`ao`, half resolution); `high` may add `bloom` and
`vignette`. Budget: on the lead's Mac (Metal, 1180 × 820 at 2×), the ultimate arena must keep its worst frame under
34 ms while stepping through it at `high`: measure the gaps between `requestAnimationFrame` calls in Playwright
(Chromium with `--use-angle=metal`), reduced motion, and report the worst.

## 3. sounds.ts

Export `sounds: Voicing`: tones for `tap`, `snap` (a tile lands: the magnets' click, the most important), `step`,
`turn`, `finish` (one to two seconds, never shrill), `nope`. Short, soft, never startling; everything is synthesized.

## 4. decor.tsx

Export `decor: Decorations`, components for any of these places: `page` (behind a page), `shelf` (on the plank),
`heading` (on a shelf heading), `card` (over a card's picture), `panel` (on the step panel), `finish` (behind the
finish's headline). Each is drawn absolutely over its place, aria-hidden, without taps: pictures only (inline SVG or
CSS). Keep them light: no animation loops that run forever (they keep the iPad awake); `prefers-reduced-motion`
stops any motion.

## 5. Checking a look

Pick it in Settings or with the palette on the Library, then: every screen (Library, a build at its first, middle and
last step, the finish, grown-ups gate, tiles and settings, the first-run card), light and dark, iPad landscape and
portrait. The lead's screenshot script renders them all; look at every one before reporting.
