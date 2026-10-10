"""The animatic (5.3.1, gate G-P3): twelve seconds of the real beats, beside a little tile house. Idle and a blink;
two hops over carrying a tile (a crouch before each hop, a stretch in the air, a squash on landing); setting the tile
down at the build; a cheer; a tap and the reaction; "it fell" and comfort beside the fallen tile; sleep, and wake.
EEVEE, 640 x 360, 24 fps, frames into <out>/f####.png (encoded at real and half speed by the caller).
blender -b <eyes.blend> -P animatic3.py -- <kind> <out_dir>"""
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cast3  # noqa: E402

KIND, OUT = sys.argv[sys.argv.index("--") + 1:][:2]
c = cast3.Cast()
cast3.studio()
sc = bpy.context.scene
arms = c.has("arm.R")
cast3.house((0.55, -0.1, 0))

# the tile it carries (held in front of it, riding with it) and the same tile once set down at the build
held = cast3.square((0, -0.42, 0.28), "#2A78DD", "held")
held.scale = (0.7, 0.7, 0.7)
held.parent = c.rig
placed = cast3.square((0.45, -0.45, 0), "#2A78DD", "placed", up=False)
fallen = cast3.square((-0.1, -0.7, 0), "#F4C51B", "fallen", up=False)


def show(obj, f, on):
    for o in [obj] + list(obj.children_recursive):
        o.hide_render = not on
        o.hide_viewport = not on
        o.keyframe_insert("hide_render", frame=f)
        o.keyframe_insert("hide_viewport", frame=f)


show(held, 1, False)
show(placed, 1, False)
show(fallen, 1, False)


def at(f, x=0.0, z=0.0, squash=1.0, turn=0.0, rot=None, keys=None):
    c.rest()
    c.rig.location = (x, 0, z)
    c.rig.rotation_euler = (0, 0, turn)
    c.rig.scale = (1 / squash ** 0.5, 1 / squash ** 0.5, squash)
    for name, (rx, ry, rz) in (rot or {}).items():
        c.turn(name, rx, ry, rz)
    for k, v in (keys or {}).items():
        c.key(k, v)
    c.keyframe(f)


# where it starts, and where it stops beside the house (the long snail stops further back)
X0, X1 = -1.3, (-0.45 if KIND == "snail" else -0.12)
carry = {"arm.R": (-70, 0, 0), "arm.L": (-70, 0, 0)} if arms else {"neck": (10, 0, 0)}
cheer = ({"arm.R": (-150, 0, -30), "arm.L": (-150, 0, 30)} if arms else {"neck": (-25, 0, 0), "head": (-10, 0, 0)})
# idle, a blink
at(1, X0)
at(14, X0, squash=1.02)
at(20, X0, keys={"blink": 1})
at(23, X0)
show(held, 24, True)
at(28, X0, rot=carry)
# two hops over with the tile
for i, (xa, xb) in enumerate(((X0, (X0 + X1) / 2), ((X0 + X1) / 2, X1))):
    f0 = 30 + i * 18
    at(f0, xa, rot=carry)
    at(f0 + 4, xa, squash=0.86, rot=carry)
    at(f0 + 9, (xa + xb) / 2, z=0.22, squash=1.1, rot=carry)
    at(f0 + 14, xb, squash=0.88, rot=carry)
    at(f0 + 17, xb, rot=carry)
# sets it down at the build
at(70, X1, turn=0.5, rot={**carry, "chest": (14, 0, 0), "head": (10, 0, 0)})
show(held, 74, False)
show(placed, 74, True)
at(78, X1, turn=0.5, keys={"smile": 1})
# cheers
at(84, X1, squash=0.9, keys={"smile": 1})
at(90, X1, z=0.12, squash=1.08, rot=cheer, keys={"smile": 1, "open": 0.7})
at(98, X1, rot=cheer, keys={"smile": 1, "open": 0.7})
at(106, X1, keys={"smile": 1})
# idle; a tap and the reaction (a jump, wide eyes, a giggle)
at(126, X1, squash=1.02)
at(134, X1, squash=0.8, keys={"open": 1})
at(140, X1, z=0.15, squash=1.15, keys={"open": 1})
at(146, X1, squash=0.92, keys={"smile": 1})
at(154, X1, keys={"smile": 0.6})
# it fell: a tile lies flat; it turns to it and comforts
show(fallen, 160, True)
at(162, X1, keys={"open": 0.6})
at(172, X1, turn=-0.6, rot={"head": (12, 0, -10), "chest": (10, 6, 0)}, keys={"smile": 0.4})
at(194, X1, turn=-0.6, rot={"head": (14, 0, -14), "chest": (10, 6, 0)}, keys={"smile": 0.4, "blink": 0.0})
at(198, X1, turn=-0.6, rot={"head": (14, 0, -14), "chest": (10, 6, 0)}, keys={"smile": 0.4, "blink": 1})
at(202, X1, turn=-0.6, rot={"head": (14, 0, -14), "chest": (10, 6, 0)}, keys={"smile": 0.4})
# sleep (eyes closed, head down, slow breaths), and wake with a stretch
at(212, X1, rot={"head": (16, 0, 0)}, keys={"blink": 1})
for i, f in enumerate(range(222, 256, 11)):
    at(f, X1, squash=0.96 if i % 2 else 1.0, rot={"head": (16, 0, 0)}, keys={"blink": 1})
at(262, X1, rot={"head": (-8, 0, 0)}, keys={"blink": 0.3})
at(270, X1, z=0.04, squash=1.1, rot=cheer, keys={"open": 0.8})
at(280, X1, keys={"smile": 1})
at(288, X1, keys={"smile": 1})

cast3.camera((0.0, -4.4, 1.25), (-0.4, 0, 0.45), lens=38)
sc.render.resolution_x, sc.render.resolution_y = 640, 360
sc.eevee.taa_render_samples = 16
sc.render.fps = 24
sc.frame_start, sc.frame_end = 1, 288
sc.render.filepath = os.path.join(OUT, "f")
bpy.ops.render.render(animation=True)
