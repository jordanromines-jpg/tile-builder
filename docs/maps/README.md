# Maps

Archify definitions that draw the app in one picture. The drawn pages and their receipts are not in git.

| File | Draws |
|---|---|
| `features.json` | Every feature of the app after D18 (the simple app), grouped by who uses it |
| `engine.json` | The tile engine: catalog, geometry, the checker's rules, matching and swaps (added in PR 4.2) |

To draw one, from this folder:

```bash
ARCHIFY_UPDATE_CHECK_DISABLED=1 ARCHIFY_CHROME=/opt/pw-browsers/chromium ARCHIFY_CHROME_NO_SANDBOX=1 \
  node ../../.claude/skills/archify/bin/archify.mjs finalize architecture features.json features.html --quality standard
```

On a Mac, leave out the two `ARCHIFY_CHROME` variables. Keep `features.json` in step with the app: PR 8.1 redraws it
from the built routes.
