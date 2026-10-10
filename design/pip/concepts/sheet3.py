"""The model sheet (5.3.1, gate G-P2): a turnaround (front, three-quarters, side, back), eight expressions, ten poses,
and the character's size beside a little tile house. EEVEE stills, 512 px, into <out>/<kind>-<part>-<name>.png.
blender -b <eyes.blend> -P sheet3.py -- <kind> <out_dir>"""
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cast3  # noqa: E402

KIND, OUT = sys.argv[sys.argv.index("--") + 1:][:2]
os.makedirs(OUT, exist_ok=True)
c = cast3.Cast()
cast3.studio()
sc = bpy.context.scene
sc.render.resolution_x = sc.render.resolution_y = 512
arms = c.has("arm.R")


def shot(part, name):
    sc.render.filepath = os.path.join(OUT, f"{KIND}-{part}-{name}.png")
    bpy.ops.render.render(write_still=True)


# the turnaround
for name, pos in (("front", (0, -3.2, 0.7)), ("three-quarter", (2.0, -2.5, 0.8)), ("side", (3.2, 0, 0.7)), ("back", (0, 3.2, 0.8))):
    c.rest()
    cast3.camera(pos, (0, 0, 0.5))
    shot("turn", name)

# eight expressions, close on the face
cast3.camera((0.9, -2.2, 0.85), (0, 0, 0.62), lens=70)
EXPR = [
    ("neutral", {}),
    ("happy", {"smile": 1.0}),
    ("delighted", {"smile": 1.0, "open": 0.6}),
    ("surprised", {"open": 1.0}),
    ("blink", {"blink": 1.0}),
    ("sleepy", {"blink": 0.6}),
    ("curious", {}),
    ("shy", {"smile": 0.5, "blink": 0.3}),
]
for name, keys in EXPR:
    c.rest()
    for k, v in keys.items():
        c.key(k, v)
    if name == "curious":
        c.turn("head", x=-6, y=12, z=14)
    if name == "shy":
        c.turn("head", x=8, z=-10)
    shot("face", name)

# ten poses, full figure
cast3.camera((1.6, -2.7, 0.9), (0, 0, 0.5))
POSES = [
    ("rest", lambda: None),
    ("wave", lambda: (c.turn("arm.R", x=-150, z=-30), c.turn("head", z=-8), c.key("smile", 1)) if arms else (c.turn("neck", x=-15), c.turn("head", x=-10), c.key("smile", 1))),
    ("cheer", lambda: (c.turn("arm.R", x=-150, z=-30), c.turn("arm.L", x=-150, z=30), c.key("smile", 1), c.key("open", 0.6)) if arms else (c.each("body", x=-6), c.turn("neck", x=-25), c.key("smile", 1), c.key("open", 0.6))),
    ("carry", lambda: (c.turn("arm.R", x=-70), c.turn("arm.L", x=-70), c.turn("chest", x=6)) if arms else (c.turn("neck", x=10), c.turn("head", x=8))),
    ("point", lambda: (c.turn("arm.R", x=-90, z=-20), c.turn("head", z=-20)) if arms else (c.turn("head", z=-25), c.each("feeler", x=20))),
    ("step", lambda: (c.turn("leg.L", x=-35), c.turn("leg.R", x=25)) if arms else (c.turn("body.0", x=8), c.turn("body.2", x=-8))),
    ("crouch", lambda: (setattr(c.rig, "scale", (1.08, 1.08, 0.86)),)),
    ("look", lambda: c.turn("head", x=-8, z=25)),
    ("comfort", lambda: (c.turn("chest", x=10, y=6), c.turn("head", x=12, z=-10), c.key("smile", 0.4))),
    ("sleep", lambda: (c.turn("head", x=16), c.key("blink", 1.0), setattr(c.rig, "scale", (1.03, 1.03, 0.95)))),
]
for name, fn in POSES:
    c.rest()
    fn()
    bpy.context.view_layer.update()
    shot("pose", name)

# its size beside a build: a little tile house, two tiles tall to the roof's foot
c.rest()
c.key("smile", 1.0)
c.rig.location = (-0.75, 0, 0)
cast3.house((0.1, -0.25, 0))
cast3.camera((0.6, -3.6, 1.2), (0, 0, 0.55), lens=40)
shot("size", "beside-a-house")
