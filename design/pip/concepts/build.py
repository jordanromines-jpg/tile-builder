"""Builds one of Pip's three concepts in Blender from its sdf body (bodies.py) and the kit (kit.py): skin, eyes,
mouth, tiles, skeleton with automatic weights, face shape keys. Live through Blender MCP:

    import sys, importlib; sys.path.insert(0, ".../design/pip/concepts"); import build; importlib.reload(build)
    build.make("dino", bodies_dir)

or headless renders and the app export: blender -b -P build.py -- <concept> <bodies_dir> <out_dir> [views] [samples]
"""
import importlib
import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kit  # noqa: E402
import stage  # noqa: E402

importlib.reload(kit)
importlib.reload(stage)


def plates(body, arm, spec):
    """Tile triangles standing along the back, each on the body's top line, on the given bone."""
    out = []
    for y, size, colour, bone in spec:
        p, n = kit.surface(body, (0, y, 5), (0, 0, -1))
        t = kit.tile("triangle", colour, size, f"plate.{colour}")
        # stand it in the yz plane, its base edge along y, centred on the hit point, sunk a little
        t.rotation_euler = (0, 0, math.pi / 2)
        t.location = p + Vector((0, -size / 2, -size * 0.32))
        out.append((t, bone))
    return out


def dino(D):
    body = kit.import_body(D + "dino.stl", "body")
    body.data.materials.append(kit.skin(
        "dino.skin", "#2E78D8", "#7CC3FF", belly="#FFF1D6",
        belly_mask=((0, -0.25, 0.42), (0.21, 0.16, 0.27), 0.12),
        cheeks=[((0.19, -0.36, 0.9), (0.08, 0.12, 0.06)), ((-0.19, -0.36, 0.9), (0.08, 0.12, 0.06))],
        z_range=(0.05, 1.3)))
    bpy.context.view_layer.update()
    eyes = kit.add_eyes(body, (0.15, 1.03), 0.105)
    eyes += kit.add_happy_eyes(body, (0.15, 1.03), 0.105)
    mouth = kit.add_mouth(body, 0.875, 0.15, out=0.02, tilt=-0.25)
    arm = kit.armature("rig", [
        ("root", (0, 0, 0), (0, 0, 0.12), None, False),
        ("hips", (0, 0.05, 0.22), (0, 0.04, 0.55), "root", True),
        ("chest", (0, 0.04, 0.55), (0, 0.0, 0.76), "hips", True),
        ("head", (0, 0.0, 0.76), (0, -0.05, 1.3), "chest", True),
        ("arm.L", (0.24, -0.06, 0.59), (0.32, -0.21, 0.45), "chest", True),
        ("arm.R", (-0.24, -0.06, 0.59), (-0.32, -0.21, 0.45), "chest", True),
        ("leg.L", (0.15, 0.02, 0.33), (0.15, -0.03, 0.04), "hips", True),
        ("leg.R", (-0.15, 0.02, 0.33), (-0.15, -0.03, 0.04), "hips", True),
        ("tail.1", (0, 0.22, 0.3), (0, 0.46, 0.21), "hips", True),
        ("tail.2", (0, 0.46, 0.21), (0, 0.66, 0.18), "tail.1", True),
        ("tail.3", (0, 0.66, 0.18), (0.04, 0.88, 0.26), "tail.2", True),
    ])
    kit.skin_to(body, arm)
    tiles = plates(body, arm, [
        (0.04, 0.19, "#E5322E", "head"), (0.21, 0.22, "#F5841F", "chest"), (0.38, 0.2, "#F4C51B", "hips"),
        (0.55, 0.17, "#39AD4A", "tail.1"), (0.71, 0.14, "#8A4CC8", "tail.2"),
    ])
    for e in eyes:
        kit.attach(e, arm, "head")
    kit.attach(mouth, arm, "head")
    for t, bone in tiles:
        kit.attach(t, arm, bone)
    return body, arm


def snail(D):
    body = kit.import_body(D + "snail.stl", "body")
    body.data.materials.append(kit.skin(
        "snail.skin", "#3FAE7A", "#A8EBC0",
        cheeks=[((0.2, -0.56, 0.58), (0.08, 0.12, 0.06)), ((-0.2, -0.56, 0.58), (0.08, 0.12, 0.06))],
        z_range=(0.0, 1.0)))
    bpy.context.view_layer.update()
    eyes = kit.add_eyes(body, (0.12, 0.71), 0.1)
    eyes += kit.add_happy_eyes(body, (0.12, 0.71), 0.1)
    mouth = kit.add_mouth(body, 0.55, 0.12, out=0.015)
    arm = kit.armature("rig", [
        ("root", (0, 0, 0), (0, 0, 0.12), None, False),
        ("foot", (0, 0.42, 0.12), (0, -0.1, 0.14), "root", True),
        ("tail", (0, 0.42, 0.1), (0, 0.68, 0.06), "foot", True),
        ("neck", (0, -0.12, 0.16), (0, -0.3, 0.45), "foot", True),
        ("head", (0, -0.3, 0.45), (0, -0.34, 0.92), "neck", True),
        ("feeler.L", (0.09, -0.3, 0.9), (0.17, -0.36, 1.15), "head", True),
        ("feeler.R", (-0.09, -0.3, 0.9), (-0.17, -0.36, 1.15), "head", True),
    ])
    kit.skin_to(body, arm)
    # the shell: a little pyramid of four tall tile triangles on its back, leaning in to a point
    cy, half, h = 0.16, 0.2, 0.46
    p, n = kit.surface(body, (0, cy, 5), (0, 0, -1))
    z0 = p.z - 0.02
    corners = [(-half, cy - half), (half, cy - half), (half, cy + half), (-half, cy + half)]
    apex = (0, cy, z0 + h)
    shell = []
    for i, colour in enumerate(("#E5322E", "#F4C51B", "#2A78DD", "#F5841F")):
        a, b = corners[i], corners[(i + 1) % 4]
        shell.append(kit.tile_poly([(a[0], a[1], z0), (b[0], b[1], z0), apex], colour, f"shell.{i}"))
    for e in eyes:
        kit.attach(e, arm, "head")
    kit.attach(mouth, arm, "head")
    for t in shell:
        kit.attach(t, arm, "foot")
    return body, arm


def axolotl(D):
    body = kit.import_body(D + "axolotl.stl", "body")
    body.data.materials.append(kit.skin(
        "axolotl.skin", "#E9679C", "#FFB5D2", belly="#FFE4EE",
        belly_mask=((0, -0.2, 0.32), (0.17, 0.14, 0.2), 0.12),
        cheeks=[((0.3, -0.3, 0.68), (0.09, 0.12, 0.06)), ((-0.3, -0.3, 0.68), (0.09, 0.12, 0.06))],
        blush="#FF5F7E", z_range=(0.0, 1.05),
        accents=[("#D8366F", (0.55, 0.08, 0.85), (0.2, 0.16, 0.3), 0.6), ("#D8366F", (-0.55, 0.08, 0.85), (0.2, 0.16, 0.3), 0.6)]))
    bpy.context.view_layer.update()
    eyes = kit.add_eyes(body, (0.2, 0.79), 0.085)
    eyes += kit.add_happy_eyes(body, (0.2, 0.79), 0.085)
    mouth = kit.add_mouth(body, 0.66, 0.2, out=0.015)
    bones = [
        ("root", (0, 0, 0), (0, 0, 0.12), None, False),
        ("body", (0, 0.03, 0.12), (0, 0.02, 0.5), "root", True),
        ("head", (0, 0.02, 0.5), (0, -0.06, 1.05), "body", True),
        ("arm.L", (0.22, -0.06, 0.42), (0.31, -0.17, 0.31), "body", True),
        ("arm.R", (-0.22, -0.06, 0.42), (-0.31, -0.17, 0.31), "body", True),
        ("leg.L", (0.13, 0.02, 0.24), (0.13, -0.05, 0.03), "body", True),
        ("leg.R", (-0.13, 0.02, 0.24), (-0.13, -0.05, 0.03), "body", True),
        ("tail.1", (0, 0.18, 0.3), (0, 0.42, 0.26), "body", True),
        ("tail.2", (0, 0.42, 0.26), (0, 0.66, 0.2), "tail.1", True),
    ]
    # the gills: soft fronds of the body itself, deeper pink, each on its own springy bone
    from shapes import GILLS
    for sx, side in ((1, "L"), (-1, "R")):
        for k, (a, b) in enumerate(GILLS):
            bones.append((f"gill.{side}.{k + 1}", (a[0] * sx, a[1], a[2]), (b[0] * sx, b[1], b[2]), "head", True))
    arm = kit.armature("rig", bones)
    kit.skin_to(body, arm)
    for e in eyes:
        kit.attach(e, arm, "head")
    kit.attach(mouth, arm, "head")
    return body, arm


def make(concept, D):
    kit.clear_scene()
    return {"dino": dino, "snail": snail, "axolotl": axolotl}[concept](D)


def for_app(body, path):
    """The app's copy: the skin's colour and soft shadowing baked into vertex colours, plain materials glTF can
    carry (the eye's gradient becomes its dark colour), then a GLB with the skeleton and the face shape keys."""
    app = stage.bake_vertex_colours(body)
    body.data.materials.clear()
    body.data.materials.append(app)
    eye = bpy.data.materials.get("eye")
    if eye:
        b = eye.node_tree.nodes["Principled BSDF"]
        for link in list(b.inputs["Base Color"].links):
            eye.node_tree.links.remove(link)
        b.inputs["Base Color"].default_value = kit.hexc("#2A160C")
    keep = [o for o in bpy.data.objects if not o.name.startswith(("studio.", "cam"))]
    stage.export_glb(path, keep)


if __name__ == "__main__" and "--" in sys.argv:
    args = sys.argv[sys.argv.index("--") + 1:]
    concept, D, OUT = args[0], args[1], args[2]
    views = args[3].split(",") if len(args) > 3 else ["hero"]
    samples = int(args[4]) if len(args) > 4 else 160
    bpy.ops.wm.read_factory_settings(use_empty=True)
    body, rig = make(concept, D)
    if views == ["glb"]:
        for_app(body, os.path.join(OUT, f"{concept}.glb"))
        sys.exit(0)
    stage.render_setup(samples)
    stage.studio()
    for v in views:
        glad = v.endswith("-happy")
        for o in bpy.data.objects:
            keys = o.data.shape_keys.key_blocks if o.type == "MESH" and o.data.shape_keys else {}
            if o.name.startswith(("glint", "eye.")):
                o.hide_render = glad
            if o.name.startswith("happy."):
                o.hide_render = not glad
        stage.camera(v.split("-")[0], target=(0, 0, 0.62), dist=1.05)
        stage.render(os.path.join(OUT, f"{concept}-{v}.png"))
