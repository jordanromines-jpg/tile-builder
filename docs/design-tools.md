# Design tools

The skills, repos and libraries Tile Builder is designed with, and what each one is for. Agreed with Jordan on
2 Oct 2026: research first, then the brief, then the design system, and only then mockups.

## Skills in this repo (`.claude/skills/`)

Each folder has a `SOURCE` file with where it came from, the commit it was copied from, and its licence.

| Skill | Use it for | From | Licence |
|---|---|---|---|
| `ui-ux-pro-max` | Looking up a rule before inventing one: palettes, font pairings, UX rules, kids product profiles. Run `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>` | nextlevelbuilder/ui-ux-pro-max-skill, via `web-agent` | MIT |
| `design-motion-principles` | Whether something should move, and how: tile snaps, step changes, the "I built it!" moment, reduced motion | kylezantos/design-motion-principles, via `web-agent` | MIT |
| `redesign-existing-projects` | Auditing a design pass for generic, templated patterns | Leonxlnx/taste-skill, via `web-agent` | MIT |
| `frontend-design` | Writing a design plan (palette, type, layout, principles) and checking it against the brief before building | anthropics/skills | Apache 2.0 |
| `brandkit` | The structure of a brand board: which panels it needs and in what order. It writes prompts for an image model, which we don't have here, and its default look is dark developer-tool branding, so we take the structure only and build the board as HTML from our tokens | Leonxlnx/taste-skill | MIT |
| `algorithmic-art` | Seeded, repeatable generated graphics: tile patterns for backgrounds, empty states, the loading screen | anthropics/skills | Apache 2.0 |
| `canvas-design` | Static posters and images, e.g. a printable "idea card" or the social image | anthropics/skills | Apache 2.0; fonts OFL |
| `webapp-testing` | Scripted Playwright checks and screenshots of the running app | anthropics/skills | Apache 2.0 |
| `archify` | Diagrams from typed JSON: the plan's roadmap (`plans/roadmap/`), the features map and the engine map (`docs/maps/`). Run with `ARCHIFY_UPDATE_CHECK_DISABLED=1` | tt-a1i/archify v3.0.1 | MIT |

`logo-design` stays on Jordan's Mac: its library of about 1,400 other companies' logos is kept out of git. The name
mark and app icon are drawn there.

## Built into Claude sessions

| Tool | Use it for |
|---|---|
| Artifact types: **Design System**, **Design**, **Docs**, **Slides** | Design System publishes our tokens and components so later designs and decks follow them. Design is the mockup canvas, once we get there. Docs is for the brief if it's shared for comments |
| `artifact-design`, `artifact-diagramming` | Research boards and user-flow diagrams published as pages |
| Lucid connector | User flows and the site map, if wanted in Lucid |

## Repos

| Repo | What we take |
|---|---|
| `jordanromines-jpg/web-agent` | The token pipeline (`design/tokens.json` in the W3C Design Tokens format, built and contrast-checked by `design/tokens.py`); the React scaffold in `web/` (Vite, Tailwind 4 from tokens, Radix, Phosphor, Vitest, Playwright with axe, screenshot "plates"); the shape of `DESIGN.md`, `PRODUCT.md` and the `sales-design` entry-point skill, not their content |
| `anthropics/skills` | The four skills above |
| `Leonxlnx/taste-skill` | `brandkit` |

## Libraries the design system is built on

| Library | Why | Licence |
|---|---|---|
| Tailwind 4, fed by our token file | One source for colour, type, spacing and corners | MIT |
| Radix primitives | Accessible behaviour (dialogs, tabs, toasts) under our own look | MIT |
| Phosphor icons | Six weights; our custom tile-shape icons are drawn on its grid | MIT |
| Fonts through `@fontsource` | Self-hosted, so the app works offline | OFL |
| ColorAide (Python) | Colour ramps and colour-blindness simulation, so every kid can tell the tile colours apart | MIT |
| axe-core with Playwright | Accessibility checks on every screen | MPL 2.0 |

## 21st.dev

Jordan asked about it on 2 Oct 2026 (an Instagram ad: "15k+ components. Designed by humans.").

**What it is.** A community marketplace of React and Tailwind components, templates, shadcn themes, shaders and
gradients, from 700+ independent design engineers [1][2]. A component is copied into your own code with the shadcn
command line, `npx shadcn@latest add https://21st.dev/r/<author>/<component>` [3], so it becomes our source code and
runs offline like everything else. It also has an MCP server (Magic, now "21st MCP") that searches the catalogue and
generates new components from a prompt inside Claude Code; it calls 21st.dev's servers with an API key [4][5].

**Cost and licence.** Browsing is free, with 2 free component copies a day; paid plans start at $6 a month (yearly),
$15 a month with AI generation [2][6]. The registry and the MCP server are MIT, but each component carries whatever
licence its author set [2], so every component has to be checked one by one.

**Fit for Tile Builder.**
- Most of the catalogue is built for SaaS and landing pages: heroes, pricing tables, dark "tech" effects such as the
  "grid pulse" in the ad. Little of it is made for children aged 3–10, so it won't supply our look.
- It assumes the shadcn setup (Radix and Tailwind with tokens as CSS variables). That is the same base as our stack,
  so a single component can drop in cleanly if we follow shadcn's conventions.
- Effects built on shaders and heavy animation need testing on older iPads, and many fail our motion rules for young
  children.

**How we reach it.** Jordan connected 21st as a claude.ai connector on 2 Oct 2026, so its tools (search, get
component, themes, bookmarks) are in every session without a key in the repo. The account is on the free tier: 2
component retrievals a day, AI generation off. The Anthropic Directory also has a "21st" plugin with a `21st-ui` skill
and the same MCP server; enabling it would add the skill. The cloud environment's network blocks 21st.dev, so the
`21st` command line and `npx shadcn add https://21st.dev/r/...` don't work from cloud sessions. To install a component
there, fetch its code through the connector and add it by hand.

**Recommendation.**
1. Use it as a reference library, and as an occasional source of one specific interaction we'd otherwise build by
   hand (a confetti burst, a sticker peel, a card carousel). Copy it in with the shadcn command, check its licence,
   restyle it onto our tokens, and run it past `design-motion-principles` and axe before it ships.
2. Don't install the 21st MCP. It generates components from a cloud service with a paid key, it overlaps
   `frontend-design`, and generated components would bypass the design system we're about to write.
3. Decide in the design-system step whether to adopt shadcn/ui's conventions (`components.json`, tokens as CSS
   variables). Doing so makes shadcn and 21st.dev components easy to bring in later.

Sources:
1. [21st.dev](https://21st.dev/)
2. [21st.dev Magic MCP: complete guide (MCP.Directory)](https://mcp.directory/blog/21st-dev-magic-mcp-complete-guide-2026)
3. [21st.dev grid component page](https://21st.dev/@thegridcn/components/grid)
4. [21st-dev/magic-mcp on GitHub](https://github.com/21st-dev/magic-mcp)
5. [21st MCP install and migration guide](https://agentskillshub.dev/skills/21st-dev-magic/)
6. [Introducing 21st membership](https://21st.dev/blog/introducing-21st-membership)
