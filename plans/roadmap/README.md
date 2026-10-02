# Roadmap

`tile-builder.json` is an Archify workflow definition (schema 2) that draws `plans/2026-10-02-tile-builder.md` as
swimlanes: Jordan's gates in the top lane, then one lane each for the plan and design system, the engine and the
projects, and the app; one node a pull request, its hours in the sublabel. It holds pull-request names, hours and
folder names only.

To draw it, from the repo root:

```bash
cd plans/roadmap
ARCHIFY_UPDATE_CHECK_DISABLED=1 ARCHIFY_CHROME=/opt/pw-browsers/chromium ARCHIFY_CHROME_NO_SANDBOX=1 \
  node ../../.claude/skills/archify/bin/archify.mjs finalize workflow tile-builder.json tile-builder.html --quality standard
```

On a Mac, leave out the two `ARCHIFY_CHROME` variables; Archify finds Chrome itself. The built page and its receipts
are not in git (`.gitignore`). Update the definition in the same commit as any change to the plan's pull requests.
