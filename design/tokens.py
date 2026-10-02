"""Tile Steps' design tokens: the source of every colour and size the app uses, in the W3C Design Tokens format
(2025.10). Standard library only. Adapted from web-agent's design/tokens.py (its new-app half).

    design/tokens.json        every token with its $type, $value and $description; the colours are the light theme's;
                              $extensions["dev.tile-builder.design"] holds the output file and the contrast pairs
    design/tokens.dark.json   every colour's dark value

    python -m design.tokens write       write web/src/tokens.css from the two files
    python -m design.tokens check       fail when web/src/tokens.css is stale or a pair misses its contrast
    python -m design.tokens contrast    every pair in both themes, with its ratio

web/src/tokens.css is generated: every token is a CSS variable on :root (light), the dark values apply under
data-theme="dark" and under the system's dark setting unless data-theme="light", and a Tailwind theme points at the
variables so classes like bg-surface, text-ink-1 and rounded-md read the live value.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILE = ROOT / "design" / "tokens.json"
DARK = ROOT / "design" / "tokens.dark.json"
EXT = "dev.tile-builder.design"
GROUNDS = ("light", "dark")
HEAD = "/* design tokens: written by python -m design.tokens from design/tokens.json. Change that file, never this one */\n"
TW_NS = {"fs-": "text-", "r-": "radius-"}   # a size token's prefix and its Tailwind theme namespace
FONTS = ("display", "kid", "parent")


def _n(x) -> str:
    """A number as the stylesheet writes it: no trailing zeros, no zero before the point."""
    t = ("%.4f" % x).rstrip("0").rstrip(".") if isinstance(x, float) else str(x)
    return t[1:] if t.startswith("0.") else "-" + t[2:] if t.startswith("-0.") else t


def css(token: dict) -> str:
    """A token's value as CSS, from its $type and $value."""
    kind, v = token["$type"], token["$value"]
    if kind == "color":
        if v.get("alpha", 1) != 1:
            r, g, b = (int(v["hex"][i:i + 2], 16) for i in (1, 3, 5))
            return f"rgba({r}, {g}, {b}, {_n(v['alpha'])})"
        return v["hex"]
    if kind in ("dimension", "duration"):
        return _n(v["value"]) + v["unit"]
    if kind == "number":
        return _n(v)
    if kind == "fontFamily":
        return ", ".join(f'"{f}"' if " " in f else f for f in v)
    if kind == "cubicBezier":
        return "cubic-bezier(" + ", ".join(_n(x) for x in v) + ")"
    raise ValueError(f"a token of type {kind} has no CSS form here")


def load() -> dict:
    """The tokens as the rest of this file reads them: each colour with its role, its light and dark CSS value and
    anything we keep under $extensions (a tile's pattern and spoken name); each size with its role and type; the
    output file and the contrast pairs."""
    base, dark = json.loads(FILE.read_text()), json.loads(DARK.read_text())["color"]
    ours = base["$extensions"][EXT]
    colour = {}
    for k, t in base["color"].items():
        if k not in dark:
            raise ValueError(f"{k} has no dark value in {DARK.name}")
        colour[k] = {"role": t["$description"], "light": css(t), "dark": css({**t, **dark[k]}),
                     **t.get("$extensions", {}).get(EXT, {})}
    scale = {k: {"value": css(t), "role": t["$description"], "type": t["$type"]} for k, t in base["scale"].items()}
    return {"file": ours["file"], "color": colour, "scale": scale, "pairs": ours["pairs"]}


def tailwind(doc: dict) -> str:
    """web/src/tokens.css: every token as a variable, the dark theme two ways, and a Tailwind theme over them."""
    light = ";".join(f"--{k}:{v['light']}" for k, v in doc["color"].items())
    dark = ";".join(f"--{k}:{v['dark']}" for k, v in doc["color"].items())
    scale = ";".join(f"--{k}:{v['value']}" for k, v in doc["scale"].items())
    theme = [f"--color-{k}:var(--{k})" for k in doc["color"]]
    theme += [f"--font-{k}:var(--{k})" for k in FONTS if k in doc["scale"]]
    theme += [f"--{ns}{k[len(pre):]}:var(--{k})" for k in doc["scale"] for pre, ns in TW_NS.items() if k.startswith(pre)]
    theme += ["--ease-tile:var(--ease)"]
    return (HEAD + f":root{{color-scheme:light;{light};{scale}}}\n"
            f':root[data-theme="dark"]{{color-scheme:dark;{dark}}}\n'
            f'@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{color-scheme:dark;{dark}}}}}\n'
            "@theme inline{" + ";".join(theme) + "}\n")


def write() -> str:
    doc = load()
    out = ROOT / doc["file"]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(tailwind(doc))
    return doc["file"]


def stale() -> list[str]:
    doc = load()
    f = ROOT / doc["file"]
    return [] if f.exists() and f.read_text() == tailwind(doc) else [doc["file"]]


def _rgb(value: str) -> tuple[float, float, float] | None:
    m = re.fullmatch(r"#([0-9a-fA-F]{6})", value.strip())
    if not m:
        return None
    h = m.group(1)
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def _lum(rgb) -> float:
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def ratio(a: str, b: str) -> float | None:
    """The WCAG 2 contrast ratio of two hex colours; None when either is not a plain hex."""
    x, y = _rgb(a), _rgb(b)
    if x is None or y is None:
        return None
    hi, lo = sorted((_lum(x), _lum(y)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def contrast(doc: dict | None = None) -> list[dict]:
    """Every pair in both themes: {fg, bg, theme, ratio, need, ok}."""
    doc = doc or load()
    out = []
    for fg, bg, need in doc["pairs"]:
        for theme in GROUNDS:
            r = ratio(doc["color"][fg][theme], doc["color"][bg][theme])
            if r is None:
                raise ValueError(f"{fg} on {bg} ({theme}): a pair needs two plain hex colours")
            out.append({"fg": fg, "bg": bg, "theme": theme, "ratio": round(r, 2), "need": need, "ok": r >= need})
    return out


def main(argv: list[str]) -> int:
    cmd = argv[0] if argv else ""
    if cmd == "write":
        print("written:", write())
        return 0
    if cmd == "contrast":
        for c in contrast():
            print(f"{'ok  ' if c['ok'] else 'FAIL'} {c['ratio']:>5} (needs {c['need']}) {c['fg']} on {c['bg']}, {c['theme']}")
        return 0
    if cmd == "check":
        old, bad = stale(), [c for c in contrast() if not c["ok"]]
        for f in old:
            print(f"{f} differs from the token files; run python -m design.tokens write")
        for c in bad:
            print(f"contrast {c['ratio']} under {c['need']}: {c['fg']} on {c['bg']}, {c['theme']}")
        if not old and not bad:
            print("tokens in step, every pair passes")
        return 1 if old or bad else 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
