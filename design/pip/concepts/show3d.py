"""Renders an image-to-3D model (Pixal3D's GLB) on a Poly Haven wood table under a Poly Haven studio HDRI, from four
sides, so its 3D can be judged. blender -b -P show3d.py -- <model.glb> <out_prefix> <polyhaven_dir> [samples]"""
import math
import os
import sys

import bpy
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:]
GLB, OUT, PH = args[0], args[1], args[2]
SAMPLES = int(args[3]) if len(args) > 3 else 96

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=GLB)
model = [o for o in sc.objects if o.type == "MESH"]
# stand it on the table, centred, about one unit tall
lo = Vector((min(min((o.matrix_world @ Vector(c)).x for c in o.bound_box) for o in model), min(min((o.matrix_world @ Vector(c)).y for c in o.bound_box) for o in model), min(min((o.matrix_world @ Vector(c)).z for c in o.bound_box) for o in model)))
hi = Vector((max(max((o.matrix_world @ Vector(c)).x for c in o.bound_box) for o in model), max(max((o.matrix_world @ Vector(c)).y for c in o.bound_box) for o in model), max(max((o.matrix_world @ Vector(c)).z for c in o.bound_box) for o in model)))
root = bpy.data.objects.new("model", None)
sc.collection.objects.link(root)
for o in model:
    if o.parent is None:
        o.parent = root
k = 1.0 / (hi.z - lo.z)
root.scale = (k, k, k)
root.location = (-(lo.x + hi.x) / 2 * k, -(lo.y + hi.y) / 2 * k, -lo.z * k)
for o in model:
    for p in o.data.polygons:
        p.use_smooth = True

# the table: Poly Haven's wood_table_001
m = bpy.data.materials.new("wood"); m.use_nodes = True
nt = m.node_tree; b = nt.nodes["Principled BSDF"]
tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (3, 3, 3)
nt.links.new(tc.outputs["UV"], mp.inputs["Vector"])
for name, inp, non_color in (("diff", "Base Color", False), ("rough", "Roughness", True), ("nor_gl", None, True)):
    im = nt.nodes.new("ShaderNodeTexImage")
    im.image = bpy.data.images.load(os.path.join(PH, f"wood_table_001_{name}_2k.jpg"))
    if non_color:
        im.image.colorspace_settings.name = "Non-Color"
    nt.links.new(mp.outputs["Vector"], im.inputs["Vector"])
    if inp:
        nt.links.new(im.outputs["Color"], b.inputs[inp])
    else:
        nm = nt.nodes.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = 0.6
        nt.links.new(im.outputs["Color"], nm.inputs["Color"]); nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
bpy.ops.mesh.primitive_plane_add(size=8)
bpy.context.object.data.materials.append(m)

# light: Poly Haven's brown_photostudio_02, plus a soft key
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
env = w.node_tree.nodes.new("ShaderNodeTexEnvironment")
env.image = bpy.data.images.load(os.path.join(PH, "brown_photostudio_02_2k.hdr"))
w.node_tree.links.new(env.outputs["Color"], w.node_tree.nodes["Background"].inputs["Color"])
w.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0
key = bpy.data.lights.new("key", "AREA"); key.size = 2.5; key.energy = 160; key.color = (1.0, 0.94, 0.86)
ko = bpy.data.objects.new("key", key); sc.collection.objects.link(ko); ko.location = (-2.2, -2.6, 2.6)
ko.rotation_euler = (Vector((0, 0, 0.5)) - ko.location).to_track_quat("-Z", "Y").to_euler()

sc.render.engine = "CYCLES"
prefs = bpy.context.preferences.addons["cycles"].preferences
prefs.compute_device_type = "METAL"; prefs.get_devices()
for d in prefs.devices:
    d.use = True
sc.cycles.device = "GPU"; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
sc.render.resolution_x = sc.render.resolution_y = 1000
sc.view_settings.view_transform = "AgX"
try:
    sc.view_settings.look = "AgX - Punchy"
except TypeError:
    pass
cam = bpy.data.cameras.new("cam"); cam.lens = 60
co = bpy.data.objects.new("cam", cam); sc.collection.objects.link(co); sc.camera = co
cam.dof.use_dof = True; cam.dof.aperture_fstop = 3.5
for name, ang in (("front", -25), ("side", -90), ("back", 155), ("hero", -45)):
    a = math.radians(ang)
    co.location = (3.0 * math.sin(a), -3.0 * math.cos(a), 1.0)
    target = Vector((0, 0, 0.48))
    co.rotation_euler = (target - co.location).to_track_quat("-Z", "Y").to_euler()
    cam.dof.focus_distance = (target - co.location).length
    sc.render.filepath = f"{OUT}-{name}.png"
    bpy.ops.render.render(write_still=True)
