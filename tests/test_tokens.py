"""PR 2.1, key 2d: the token files and web/src/tokens.css stay in step, and every pair passes in both themes.
In the shape of web-agent's tests/test_design_tokens.py."""

from pathlib import Path

from design import tokens as T

ROOT = Path(__file__).resolve().parent.parent
TILES = ("red", "orange", "yellow", "green", "sky", "blue", "purple", "pink")


def test_tokens_css_is_written_from_the_token_files():
    doc = T.load()
    assert doc["file"] == "web/src/tokens.css"
    assert (ROOT / doc["file"]).read_text() == T.tailwind(doc), "run python3 -m design.tokens write"


def test_every_pair_passes_in_both_themes():
    pairs = T.contrast()
    assert len(pairs) == 2 * len(T.load()["pairs"])
    assert [f"{c['fg']} on {c['bg']} ({c['theme']}): {c['ratio']} under {c['need']}" for c in pairs if not c["ok"]] == []


def test_the_tiles_have_a_colour_a_rim_a_pattern_and_a_name_in_both_themes():
    colour = T.load()["color"]
    for t in TILES:
        tile, rim = colour[f"tile-{t}"], colour[f"tile-{t}-rim"]
        assert tile["light"] and tile["dark"] and rim["light"] and rim["dark"]
        assert tile["name"] == t and tile["pattern"]
    assert len({colour[f"tile-{t}"]["pattern"] for t in TILES}) == len(TILES)


def test_every_token_says_what_it_is_for():
    doc = T.load()
    assert [k for k, v in doc["color"].items() if not v["role"]] == []
    assert [k for k, v in doc["scale"].items() if not v["role"]] == []


def test_the_css_carries_the_theme_and_the_tailwind_names():
    css = T.tailwind(T.load())
    assert css.startswith(T.HEAD)
    assert ':root[data-theme="dark"]{color-scheme:dark;--surface:#2a221f' in css
    assert '@media (prefers-color-scheme:dark){:root:not([data-theme="light"])' in css
    for name in ("--color-surface:var(--surface)", "--text-kid-label-a:var(--fs-kid-label-a)",
                 "--radius-md:var(--r-md)", "--font-kid:var(--kid)", "--ease-tile:var(--ease)"):
        assert name in css


def test_kid_sizes_follow_the_brief():
    s = T.load()["scale"]
    assert [s[f"target-kid-{b}"]["value"] for b in "abc"] == ["88px", "80px", "64px"]
    assert s["target-kid-primary"]["value"] == "112px" and s["target-parent"]["value"] == "44px"
    assert s["fs-parent-small"]["value"] == "13px"


def test_ratio_is_wcag():
    assert T.ratio("#ffffff", "#000000") == 21
    assert round(T.ratio("#0b6e78", "#fbf8f3"), 2) == 5.64
    assert T.ratio("rgba(0,0,0,.5)", "#ffffff") is None
