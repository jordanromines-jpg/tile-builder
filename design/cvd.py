"""How far apart the six tile colours stay for children with colour-vision deficiency.

    pip install -r design/requirements.txt
    python3 design/cvd.py

For normal vision and for protan, deutan and tritan vision (full strength, ColorAide's filters), it prints the two
tile colours that end up closest, and every pair under the warning line, as an OK-space distance (ColorAide's
"ok" delta E: about 0.02 is just noticeable; under 0.1 is easy to confuse at a glance).

This is a report, not a gate. Tiles never rely on colour alone: each has a pattern, a rim and a spoken name
(PRODUCT.md, "What never changes"; DESIGN.md from PR 2.6), because the screen has to match the plastic and the hues cannot move far enough apart.
"""

from __future__ import annotations

import itertools
import json
from pathlib import Path

from coloraide import Color

FILE = Path(__file__).resolve().parent / "tokens.json"
VISIONS = ("normal", "protan", "deutan", "tritan")
WARN = 0.1


def tiles() -> dict[str, str]:
    colour = json.loads(FILE.read_text())["color"]
    return {k[len("tile-"):]: t["$value"]["hex"] for k, t in colour.items() if k.startswith("tile-") and not k.endswith("-rim")}


def distances(vision: str) -> list[tuple[float, str, str]]:
    seen = {k: Color(h) if vision == "normal" else Color(h).filter(vision) for k, h in tiles().items()}
    return sorted((round(seen[a].delta_e(seen[b], method="ok"), 3), a, b) for a, b in itertools.combinations(seen, 2))


def main() -> None:
    for vision in VISIONS:
        d = distances(vision)
        close = [f"{a}/{b} {x}" for x, a, b in d if x < WARN]
        print(f"{vision:7} closest {d[0][1]}/{d[0][2]} {d[0][0]}; under {WARN}: {', '.join(close) or 'none'}")


if __name__ == "__main__":
    main()
