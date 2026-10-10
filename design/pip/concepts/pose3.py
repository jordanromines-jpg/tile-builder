"""The pose sheet and the export (5.3.5g). Eight poses a character, rendered in EEVEE from three-quarters, to look for
tearing and bad bends: rest, blink, squint, a wave, a step, the tail (or body) swung, the head turned, and the gills
(or feelers) flexed. Then the character is exported as a glTF with its skin and face keys (the app compresses it).
blender -b <face.blend> -P pose3.py -- <kind> <out_prefix>"""
import math
import sys

import bpy
from mathutils import Euler, Vector

KIND, OUT = sys.argv[sys.argv.index("--") + 1:][:2]
sc = bpy.context.scene
rig = next(o for o in bpy.data.objects if o.type == "ARMATURE")
mesh = next(o for o in bpy.data.objects if o.type == "MESH" and not o.name.startswith("I2L_"))
for o in list(bpy.data.objects):
    if o.name.startswith("I2L_"):
        bpy.data.objects.remove(o, do_unlink=True)
keys = mesh.data.shape_keys.key_blocks
pb = rig.pose.bones


def rest():
    for b in pb:
        b.rotation_mode = "XYZ"
        b.rotation_euler = (0, 0, 0)
        b.location = (0, 0, 0)
    for k in keys[1:]:
        k.value = 0


def turn(name, x=0.0, y=0.0, z=0.0):
    if name in pb:
        pb[name].rotation_euler = Euler((math.radians(x), math.radians(y), math.radians(z)))


def each(prefix, **kw):
    for b in pb:
        if b.name.startswith(prefix):
            turn(b.name, **kw)


POSES = [
    ("rest", lambda: None),
    ("blink", lambda: setattr(keys["blink"], "value", 1.0)),
    ("squint", lambda: setattr(keys["squint"], "value", 1.0)),
    # an arm bone points down its arm: rotating about its length only twists it; about its x it swings up
    ("wave", lambda: (turn("arm.R", x=-75, z=-20), turn("arm.L", x=10)) if KIND != "snail" else (turn("neck", x=-15), turn("head", x=-10))),
    ("wave2", lambda: (turn("arm.R", z=-75), turn("arm.L", x=10)) if KIND != "snail" else (turn("neck", x=-15), turn("head", x=-10))),
    ("step", lambda: (turn("leg.L", x=-35), turn("leg.R", x=25)) if KIND != "snail" else (turn("body.0", x=10), turn("body.2", x=-10))),
    ("swing", lambda: each("tail", z=18) if KIND != "snail" else each("body", z=8)),
    ("look", lambda: turn("head", z=25, x=-8)),
    ("flex", lambda: (turn("gill.L", y=20), turn("gill.R", y=-20)) if KIND == "axolotl" else each("feeler", x=25) if KIND == "snail" else (turn("chest", x=10), turn("head", x=-10))),
]

w = bpy.data.worlds.new("w")
sc.world = w
w.use_nodes = True
w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.95, 0.9, 0.82, 1)
w.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0
key_l = bpy.data.lights.new("key", "SUN")
key_l.energy = 3
kl = bpy.data.objects.new("key", key_l)
sc.collection.objects.link(kl)
kl.rotation_euler = (math.radians(50), 0, math.radians(-35))
cam = bpy.data.cameras.new("cam")
cam.lens = 50
co = bpy.data.objects.new("cam", cam)
sc.collection.objects.link(co)
sc.camera = co
co.location = (1.5, -2.6, 1.0)
co.rotation_euler = (Vector((0, 0, 0.48)) - co.location).to_track_quat("-Z", "Y").to_euler()
for e in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
    try:
        sc.render.engine = e
        break
    except TypeError:
        continue
sc.render.resolution_x = sc.render.resolution_y = 512
sc.render.film_transparent = False
sc.view_settings.view_transform = "Standard"
for name, fn in POSES:
    rest()
    fn()
    bpy.context.view_layer.update()
    sc.render.filepath = f"{OUT}-{name}.png"
    bpy.ops.render.render(write_still=True)
rest()
bpy.ops.object.select_all(action="DESELECT")
rig.select_set(True)
mesh.select_set(True)
bpy.ops.export_scene.gltf(filepath=f"{OUT}.glb", export_format="GLB", use_selection=True, export_skins=True, export_morph=True, export_animations=False)
print("POSE exported", f"{OUT}.glb")
