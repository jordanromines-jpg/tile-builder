# The design tokens

Every colour and size the app uses comes from two files here. Change them, never `web/src/tokens.css`.

| File | What it holds |
|---|---|
| `tokens.json` | Every token in the W3C Design Tokens format (2025.10): `$type`, `$value` (light theme for colours), `$description` (what it is for). `$extensions["dev.tile-builder.design"]` holds the output file, the two grounds and the contrast pairs; on a tile colour it holds the tile's pattern and spoken name |
| `tokens.dark.json` | Each colour's dark value, and nothing else |
| `tokens.py` | Writes and checks `web/src/tokens.css`. Standard library only |
| `cvd.py` | How far apart the six tile colours stay under colour-vision deficiency. A report, not a gate |

## Running them

From the repo root:

    python3 -m design.tokens write       # write web/src/tokens.css from the two files
    python3 -m design.tokens check       # exit 1 if tokens.css is stale or any pair misses its contrast
    python3 -m design.tokens contrast    # every pair in both themes with its ratio

    pip install -r design/requirements.txt
    python3 design/cvd.py                # closest tile colours under normal, protan, deutan and tritan vision
    python3 -m pytest -q tests/test_tokens.py

## The groups

| Group | Tokens | Notes |
|---|---|---|
| Surfaces | `surface`, `surface-2`, `surface-3`, `line`, `stage`, `ground` | `stage` and `ground` are the 3D view's sky and floor |
| Ink | `ink-1`, `ink-2`, `ink-3` | `ink-1` is 7:1 on every surface; `ink-3` only on `surface` and `surface-2` |
| Accent | `accent`, `accent-ink`, `accent-soft`, `focus` | One hue, teal |
| Badges | `can-bg`/`can-ink`, `wait-bg`/`wait-ink` | "You can build it!" and "Need 2 more"; each always with an icon shape too |
| Tiles | `tile-{red,orange,yellow,green,blue,purple}` and `-rim` | The rim is 3:1 on the surfaces; each tile has a pattern and a spoken name, because colour alone never tells tiles apart |
| Type | `fs-kid-display-{a,b,c}`, `fs-kid-label-{a,b,c}`, `fs-kid-count-{a,b,c}`, `fs-parent-*`; fonts `display`, `kid`, `parent` | `a`, `b`, `c` are the age bands 3–5, 6–8, 9–10 |
| Touch | `target-kid-primary` 104, `target-kid-{a,b,c}` 88/80/64, `target-parent` 44, `gap-*`, `hit-slop-kid`, `edge-safe-kid` | In px |
| Space and shape | `s-1`..`s-9`, `r-tile`, `r-sm`, `r-md`, `r-lg`, `r-full`, `rim` | |
| Motion | `t-press`, `t-ui`, `t-celebrate`, `turn-period`, `ease` | |

In Tailwind, colours are `bg-surface`, `text-ink-1` and so on; type sizes are `text-kid-label-a`; radii `rounded-md`;
the easing `ease-tile`.

## What `cvd.py` found (2 Oct 2026)

    normal  closest blue/purple 0.147; under 0.1: none
    protan  closest orange/green 0.051; under 0.1: orange/green 0.051, blue/purple 0.089
    deutan  closest blue/purple 0.036; under 0.1: blue/purple 0.036, red/green 0.055, orange/green 0.097
    tritan  closest green/blue 0.111; under 0.1: none

The colours have to match the plastic, so they cannot move far enough apart. That is why each tile also has a pattern
(dots, diagonal stripes, plain, waves, horizontal stripes, stars), a rim and a spoken name.
