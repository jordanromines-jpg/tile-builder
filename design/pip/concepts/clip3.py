"""A four-second proof clip of a rigged character (5.3.5h): it moves its own limbs. A crouch, a hop with a stretch in
the air and a squash on landing, a wave (or the snail's neck stretch), a look to the side, a blink, and back to rest.
EEVEE, 512 px, 24 fps; frames go to <out>/f####.png.
blender -b <face.blend> -P clip3.py -- <kind> <out_dir>"""
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
pb = rig.pose.bones
keys = mesh.data.shape_keys.key_blocks
for b in pb:
    b.rotation_mode = "XYZ"


def pose(f, rot=None, hop=0.0, squash=1.0, blink=0.0):
    for b in pb:
        b.rotation_euler = (0, 0, 0)
    for name, (x, y, z) in (rot or {}).items():
        if name in pb:
            pb[name].rotation_euler = Euler((math.radians(x), math.radians(y), math.radians(z)))
    for b in pb:
        b.keyframe_insert("rotation_euler", frame=f)
    rig.location.z = hop
    rig.scale = (1 / math.sqrt(squash), 1 / math.sqrt(squash), squash)
    rig.keyframe_insert("location", index=2, frame=f)
    rig.keyframe_insert("scale", frame=f)
    keys["blink"].value = blink
    keys["blink"].keyframe_insert("value", frame=f)


limb = {"arm.R": (-75, 0, -20)} if KIND != "snail" else {"neck": (-15, 0, 0), "head": (-10, 0, 0)}
pose(1)
pose(8, squash=0.86)
pose(14, hop=0.22, squash=1.1)
pose(18, hop=0.25, squash=1.04)
pose(24, squash=0.86)
pose(29)
pose(40, rot=limb)
pose(48, rot={**limb, **({"arm.R": (-60, 0, -35)} if KIND != "snail" else {})})
pose(56, rot=limb)
pose(66, rot={"head": (-8, 0, 25)})
pose(70, rot={"head": (-8, 0, 25)}, blink=1.0)
pose(74, rot={"head": (-8, 0, 25)})
pose(86)
pose(96)

w = bpy.data.worlds.new("w")
sc.world = w
w.use_nodes = True
w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.95, 0.9, 0.82, 1)
sun = bpy.data.lights.new("key", "SUN")
sun.energy = 3
so = bpy.data.objects.new("key", sun)
sc.collection.objects.link(so)
so.rotation_euler = (math.radians(50), 0, math.radians(-35))
cam = bpy.data.cameras.new("cam")
cam.lens = 50
co = bpy.data.objects.new("cam", cam)
sc.collection.objects.link(co)
sc.camera = co
co.location = (1.5, -2.8, 1.1)
co.rotation_euler = (Vector((0, 0, 0.55)) - co.location).to_track_quat("-Z", "Y").to_euler()
for e in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
    try:
        sc.render.engine = e
        break
    except TypeError:
        continue
sc.render.resolution_x = sc.render.resolution_y = 512
sc.render.fps = 24
sc.frame_start, sc.frame_end = 1, 96
sc.view_settings.view_transform = "Standard"
sc.render.image_settings.file_format = "PNG"
sc.render.filepath = f"{OUT}/f"
bpy.ops.render.render(animation=True)
