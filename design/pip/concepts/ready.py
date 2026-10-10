"""The characters made app-ready (5.3.5a): the clean source for retopology. Each image-to-3D model is welded (Pixal3D
splits the mesh along every UV seam), its loose bits dropped (anything under 1% of the faces), and its colour swapped
for the cleaned texture (cleantex.py: the atlas gutters' noise filled from the nearest island texel). Numbers are
printed for the build log. Then AssetFurnace's blender_retopo_bake.py rebuilds it light and bakes the colour across.
blender -b -P ready.py -- <in.glb> <clean.png> <out.glb>
blender -b -P ready.py -- <light.glb> <specks-cleaned.png> <out.glb> swap   (5.3.5d: only the colour map replaced)"""
import sys

import bmesh
import bpy

ARGS = sys.argv[sys.argv.index("--") + 1:]
IN, CLEAN, OUT = ARGS[:3]
SWAP = len(ARGS) > 3 and ARGS[3] == "swap"
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=IN)
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
if len(meshes) != 1:
    raise SystemExit(f"expected one mesh in {IN}, found {len(meshes)}")
o = meshes[0]


def swap_colour(o, png):
    m = o.active_material
    tex = next(n for n in m.node_tree.nodes if n.type == "TEX_IMAGE" and any(l.to_socket.name == "Base Color" for l in n.outputs["Color"].links))
    tex.image = bpy.data.images.load(png)
    tex.image.pack()


if SWAP:
    swap_colour(o, CLEAN)
    bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", use_selection=False)
    raise SystemExit(0)
me = o.data
bm = bmesh.new()
bm.from_mesh(me)
verts0, faces0 = len(bm.verts), len(bm.faces)
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
welded = len(bm.verts)
# the connected parts by faces; keep those with at least 1% of the faces
bm.faces.ensure_lookup_table()
seen, parts = set(), []
for f in bm.faces:
    if f.index in seen:
        continue
    stack, part = [f], []
    seen.add(f.index)
    while stack:
        g = stack.pop()
        part.append(g)
        for e in g.edges:
            for h in e.link_faces:
                if h.index not in seen:
                    seen.add(h.index)
                    stack.append(h)
    parts.append(part)
parts.sort(key=len, reverse=True)
small = [f for p in parts if len(p) < 0.01 * faces0 for f in p]
bmesh.ops.delete(bm, geom=small, context="FACES")
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
bm.to_mesh(me)
bm.free()
print(f"READY {IN.rsplit('/', 1)[-1]}: {verts0} verts -> {welded} welded; {faces0} faces in {len(parts)} parts; "
      f"largest {len(parts[0]) / faces0:.1%}; dropped {len(small)} faces in {sum(1 for p in parts if len(p) < 0.01 * faces0)} small parts")
if len(parts[0]) / faces0 < 0.9:
    print("READY warning: the largest part holds under 90% of the faces")
swap_colour(o, CLEAN)
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", use_selection=False)
