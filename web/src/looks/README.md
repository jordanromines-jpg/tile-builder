# The look

Tile Steps has one look (5.4, Jordan: "The looks all suck redo them and wow me. just 1 is needed if it's good"). It
replaced the four of 3.0–3.6 (Toy studio, Picture book, Clean studio, Classic) and the picker.
- **What it is:** the finish of the set. Soft satin vinyl, tile glass that glows, a pale maple table, a real playroom
  out of focus, and warm light with coloured rims, in 3D and on every 2D screen.
- **How it was found:** `design/set/` (the boards and their rules in `boards.md`, the look development, the G-S1
  sheets). Plan: `plans/2026-10-10-pip-redesign.md`, phase 5.4.

A look changes **how things look and sound, never what they do**. Layouts, steps, words, the 3D model and its
animation are shared.

```
looks/vinyl/look.css    tokens and ts-* hook styles, light and dark      (imported by app.css)
looks/vinyl/stage.ts    the 3D stage: the set (room, table, rims), lights, shadow, effects by tier
looks/vinyl/sounds.ts   the voice for the shared sound events              (type: sound/sound.ts)
looks/vinyl/decor.tsx   shapes CSS can't make, at named places             (type: looks/decor.tsx)
```

`looks.ts` sets `data-look="vinyl"` on `<html>` before the first paint, and clears a choice saved by the old picker.
`apply.ts` starts the look's sounds. The stage is imported only by the 3D code (`three/Stage.tsx`), so three.js stays out
of the first screen. Import nothing from three.js in `sounds.ts` or `decor.tsx`.

## look.css
- **Selectors:** write every selector under `[data-look="vinyl"]`, never `:root` (a test checks).
- **Light and dark:** every token overridden in light is overridden in dark too, in both the `[data-theme="dark"]` and
  the `prefers-color-scheme` blocks.
- **The room plate is always behind** (`--v-plate`: `public/set/plate-light.webp` and `plate-dark.webp`). They are drawn
  by the app's own renderer from the set, so the 2D room is the 3D room. Reduced transparency gets a flat colour.
- **Tiles:** keep the tile colours (`--tile-*`) as they are: the tiles are the toy and must match the real ones.
- **Contrast:** text on its surface is 4.5:1 or better (3:1 at 24 px and up), light and dark (`tests/test_tokens.py`,
  and axe in `e2e/looks.spec.ts`).
- **Targets:** every target stays at least its size (`--target-*`).
- **Fonts and images:** no webfonts beyond the bundled ones; no images from the network.

**Hooks** (classes on the shared components; style them freely, but don't hide them or change what they hold):

| Hook | What |
|---|---|
| `ts-library`, `ts-build`, `ts-done`, `ts-grownups` (`ts-gate` for the lock screen) | each screen's root |
| `ts-header`, `ts-wordmark` | the Library's top bar and the name |
| `ts-ages`, `ts-age` (`[aria-pressed=true]` when picked) | the age picker |
| `ts-chips`; `ts-chip-wrap` holding `ts-chip` and `ts-chip-word` | the theme filter |
| `ts-shelf`, `ts-shelf-title`, `ts-plank`, `ts-more` | a shelf, its heading, its plank, its ▶ button |
| `ts-card`, `ts-card-picture`, `ts-card-title`, `ts-resume`; `ts-hero…` | project cards; the Library's first card |
| `ts-make-card` | the Make your own card |
| `ts-badge` + `ts-badge-can` / `ts-badge-need` / `ts-badge-soft` | "You can build it" and friends |
| `ts-button` + `ts-button-accent` / `-plain` / `-soft`, `ts-button-primary`; `ts-next` | every kid button; the big Next |
| `ts-title`, `ts-panel`, `ts-step-tiles`, `ts-dots`, `ts-dot…`, `ts-turns` | build mode |
| `ts-finish-words`, `ts-pip`, `ts-door`, `ts-empty`, `ts-empty-banner`, `ts-rest` | the finish, Pip, the door, empty states, rest |

## stage.ts, sounds.ts, decor.tsx
- **`stage.ts`:** a `StageLook` (`looks/stage.ts`) with its `set`. `low` tier returns no effects and must look good;
  `mid` may add ambient occlusion. Without a GPU, the Stage leaves the set out and uses the plain colours.
- **`sounds.ts`:** a `Voicing`, one list of tones per shared event (`tap`, `snap`, `step`, `turn`, `finish`, `nope`),
  synthesised on the device.
- **`decor.tsx`:** components for named places (`page`, `shelf`, `heading`, `card`, `panel`, `finish`). Pictures only:
  `aria-hidden`, no taps, no layout.

## Checking it
`npm run shots` draws every screen in light and dark; look at the contact sheet. Unit: `looks.test.ts`. E2e: axe in
`e2e/looks.spec.ts`; the screens' plates in `library.spec.ts` and `build.spec.ts`.
