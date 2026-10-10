"""Pip's three concepts together, at a higher finish (5.3): plush fuzz grown over each body (geometry nodes curves),
eyes with an iris, pupil and limbal ring under a clear cornea, image-based light from Blender's bundled studio HDRI,
and the three posed round a little magnet-tile house on a wooden table. Built live through Blender MCP (to pose and
look), then rendered headless from the saved .blend."""
import importlib
import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build  # noqa: E402
import kit  # noqa: E402
import stage  # noqa: E402

for m in (kit, stage, build):
    importlib.reload(m)

HDRI = os.path.join(bpy.utils.system_resource("DATAFILES"), "studiolights", "world", "studio.exr")


# ---------- plush fuzz ----------
def fuzz(body, mat, length=0.011, density=14000, radius=0.0011, seed=0):
    """Short fibres all over the body: points on its faces, a tiny curve along each normal (a little tilted and
    varied), drawn as hair in Cycles with the body's own skin (its object-space gradient and masks still apply)."""
    ng = bpy.data.node_groups.new("fuzz", "GeometryNodeTree")
    ng.interface.new_socket("Geometry", in_out="INPUT", socket_type="NodeSocketGeometry")
    ng.interface.new_socket("Geometry", in_out="OUTPUT", socket_type="NodeSocketGeometry")
    N, L = ng.nodes, ng.links
    gi, go = N.new("NodeGroupInput"), N.new("NodeGroupOutput")
    dist = N.new("GeometryNodeDistributePointsOnFaces")
    dist.inputs["Density"].default_value = density
    dist.inputs["Seed"].default_value = seed
    L.new(gi.outputs[0], dist.inputs["Mesh"])
    line = N.new("GeometryNodeCurvePrimitiveLine")
    line.inputs["End"].default_value = (0, 0, 1)
    res = N.new("GeometryNodeResampleCurve"); res.inputs["Count"].default_value = 3
    L.new(line.outputs[0], res.inputs["Curve"])
    # orient each fibre along the surface normal, tilted a little at random
    rnd = N.new("FunctionNodeRandomValue"); rnd.data_type = "FLOAT_VECTOR"
    rnd.inputs["Min"].default_value = (-0.45, -0.45, -0.45); rnd.inputs["Max"].default_value = (0.45, 0.45, 0.45)
    add = N.new("ShaderNodeVectorMath"); add.operation = "ADD"
    L.new(dist.outputs["Normal"], add.inputs[0]); L.new(rnd.outputs["Value"], add.inputs[1])
    align = N.new("FunctionNodeAlignEulerToVector"); align.axis = "Z"
    L.new(add.outputs[0], align.inputs["Vector"])
    scl = N.new("FunctionNodeRandomValue"); scl.data_type = "FLOAT"
    scl.inputs["Min"].default_value = length * 0.6; scl.inputs["Max"].default_value = length * 1.25
    inst = N.new("GeometryNodeInstanceOnPoints")
    L.new(dist.outputs["Points"], inst.inputs["Points"]); L.new(res.outputs[0], inst.inputs["Instance"])
    L.new(align.outputs[0], inst.inputs["Rotation"]); L.new(scl.outputs[0], inst.inputs["Scale"])
    real = N.new("GeometryNodeRealizeInstances"); L.new(inst.outputs[0], real.inputs[0])
    rad = N.new("GeometryNodeSetCurveRadius"); rad.inputs["Radius"].default_value = radius
    L.new(real.outputs[0], rad.inputs["Curve"])
    sm = N.new("GeometryNodeSetMaterial"); sm.inputs["Material"].default_value = mat
    L.new(rad.outputs[0], sm.inputs["Geometry"])
    join = N.new("GeometryNodeJoinGeometry")
    L.new(gi.outputs[0], join.inputs[0]); L.new(sm.outputs[0], join.inputs[0])
    L.new(join.outputs[0], go.inputs[0])
    mod = body.modifiers.new("fuzz", "NODES")
    mod.node_group = ng
    return mod


# ---------- eyes ----------
def iris_material(iris="#6B3518", deep="#24120A"):
    """An iris read in the eye's own space: a near-black pupil, a warm iris that is lighter low down (the light
    coming through), fine radial streaks, and a dark limbal ring at its edge."""
    m, nt, b = kit.node_mat("iris")
    N, L = nt.nodes, nt.links
    tc = N.new("ShaderNodeTexCoord")
    sep = N.new("ShaderNodeSeparateXYZ"); L.new(tc.outputs["Object"], sep.inputs[0])
    # distance from the eye's centre line (its front is local -y): x and z, scaled to the eye's size
    r2 = N.new("ShaderNodeVectorMath"); r2.operation = "MULTIPLY"; r2.inputs[1].default_value = (1, 0, 1)
    L.new(tc.outputs["Object"], r2.inputs[0])
    ln = N.new("ShaderNodeVectorMath"); ln.operation = "LENGTH"; L.new(r2.outputs[0], ln.inputs[0])
    norm = N.new("ShaderNodeMath"); norm.operation = "DIVIDE"; norm.inputs[1].default_value = 0.1
    L.new(ln.outputs["Value"], norm.inputs[0])
    ring = N.new("ShaderNodeValToRGB")
    els = ring.color_ramp.elements
    els[0].position = 0.0; els[0].color = kit.hexc("#08040A")
    els[1].position = 1.0; els[1].color = kit.hexc("#120A06")
    for pos, col in ((0.36, "#08040A"), (0.42, deep), (0.62, iris), (0.82, deep), (0.9, "#120A06")):
        e = els.new(pos); e.color = kit.hexc(col)
    L.new(norm.outputs[0], ring.inputs["Fac"])
    # lighter low in the iris
    low = N.new("ShaderNodeMapRange"); low.inputs["From Min"].default_value = 0.05; low.inputs["From Max"].default_value = -0.09
    L.new(sep.outputs["Z"], low.inputs["Value"])
    lift = N.new("ShaderNodeMix"); lift.data_type = "RGBA"; lift.blend_type = "SCREEN"
    L.new(low.outputs["Result"], lift.inputs["Factor"]); L.new(ring.outputs["Color"], lift.inputs["A"])
    lift.inputs["B"].default_value = kit.hexc("#C9792F")
    # only inside the iris band, not the pupil
    band = N.new("ShaderNodeMapRange"); band.inputs["From Min"].default_value = 0.36; band.inputs["From Max"].default_value = 0.46
    L.new(norm.outputs[0], band.inputs["Value"])
    mul = N.new("ShaderNodeMath"); mul.operation = "MULTIPLY"
    L.new(band.outputs["Result"], mul.inputs[0]); L.new(low.outputs["Result"], mul.inputs[1])
    L.new(mul.outputs[0], lift.inputs["Factor"])
    # radial streaks
    wave = N.new("ShaderNodeTexWave"); wave.wave_type = "RINGS"; wave.inputs["Scale"].default_value = 40
    wave.inputs["Distortion"].default_value = 6
    streak = N.new("ShaderNodeMix"); streak.data_type = "RGBA"; streak.blend_type = "MULTIPLY"
    streak.inputs["Factor"].default_value = 0.06
    L.new(lift.outputs["Result"], streak.inputs["A"]); L.new(wave.outputs["Color"], streak.inputs["B"])
    L.new(streak.outputs["Result"], b.inputs["Base Color"])
    # a wet, glassy eye: a clear coat over the iris instead of a refracting shell (which bent the iris out of shape)
    b.inputs["Roughness"].default_value = 0.3
    b.inputs["Coat Weight"].default_value = 1.0
    b.inputs["Coat Roughness"].default_value = 0.0
    b.inputs["Coat IOR"].default_value = 1.6
    return m


def cornea_material():
    m, nt, b = kit.node_mat("cornea")
    b.inputs["Base Color"].default_value = (1, 1, 1, 1)
    b.inputs["Transmission Weight"].default_value = 1.0
    b.inputs["Roughness"].default_value = 0.0
    b.inputs["IOR"].default_value = 1.34
    return m


def upgrade_eyes():
    iris = iris_material()
    cornea = cornea_material()
    for o in list(bpy.data.objects):
        if not o.name.startswith("eye.") or o.type != "MESH":
            continue
        o.data.materials.clear()
        o.data.materials.append(iris)
        continue
        shell = o.copy()
        shell.data = o.data.copy()
        shell.name = o.name.replace("eye.", "cornea.")
        shell.data.materials.clear()
        shell.data.materials.append(cornea)
        bpy.context.scene.collection.objects.link(shell)
        # a clear shell a little proud of the eye, bulging most at the front
        for v in shell.data.vertices:
            v.co.x *= 1.06; v.co.z *= 1.06; v.co.y *= 1.3
        mw = o.matrix_world.copy()
        shell.parent = o
        shell.parent_type = "OBJECT"
        shell.matrix_world = mw


def add_lids(cut=0.72):
    """Soft upper eyelids of the body's own skin over the top of each open eye: they set the eye into the face, and
    they blink (turn the lid about the eye's x axis, ~1.15 rad, and it closes over the front)."""
    lids = []
    for o in list(bpy.data.objects):
        if not o.name.startswith("eye.") or o.type != "MESH":
            continue
        top = o
        while top.parent:
            top = top.parent
        body = bpy.data.objects.get(top.name.replace(".rig", ".body"))
        lid = o.copy()
        lid.data = o.data.copy()
        lid.name = o.name.replace("eye.", "lid.")
        bpy.context.scene.collection.objects.link(lid)
        lid.shape_key_clear()
        import bmesh
        bm = bmesh.new()
        bm.from_mesh(lid.data)
        r = max(v.co.z for v in bm.verts)
        for v in bm.verts:
            v.co.x *= 1.1; v.co.z *= 1.1; v.co.y *= 1.45
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < cut * r * 1.1], context="VERTS")
        bm.to_mesh(lid.data)
        bm.free()
        lid.modifiers.new("solid", "SOLIDIFY").thickness = 0.006
        skin = body.data.materials[0].copy()
        for n in skin.node_tree.nodes:
            if n.type == "TEX_COORD":
                n.object = body
        lid.data.materials.clear()
        lid.data.materials.append(skin)
        lid.parent = o
        lid.parent_type = "OBJECT"
        lid.matrix_parent_inverse.identity()
        lid.location, lid.rotation_euler, lid.scale = (0, 0, 0), (0, 0, 0), (1, 1, 1)
        lids.append(lid)
    return lids


def hold_tile(rig, colour="#F4C51B", size=0.34):
    """A tile held up between the hands (the axolotl's 'look what I made!')."""
    mw = rig.matrix_world
    a = mw @ rig.pose.bones["arm.L"].tail
    b = mw @ rig.pose.bones["arm.R"].tail
    mid = (a + b) / 2
    # held out in front of the chest, between the hands: "look what I made!"
    mid.z -= size * 0.35
    t = kit.tile("triangle", colour, size, "held")
    t.rotation_euler = (math.radians(-12), 0, rig.rotation_euler.z)
    t.location = mid + (rig.matrix_world.to_3x3() @ Vector((-size / 2, -0.06, 0.0)))
    bpy.context.view_layer.update()
    mwt = t.matrix_world.copy()
    t.parent = rig
    t.matrix_world = mwt
    return t


# ---------- the set ----------
def wood_material():
    m, nt, b = kit.node_mat("wood")
    N, L = nt.nodes, nt.links
    tc = N.new("ShaderNodeTexCoord")
    mp = N.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (0.6, 6.0, 0.6)
    L.new(tc.outputs["Object"], mp.inputs["Vector"])
    noise = N.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 3.0; noise.inputs["Detail"].default_value = 8
    noise.inputs["Distortion"].default_value = 1.6
    L.new(mp.outputs[0], noise.inputs["Vector"])
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = kit.hexc("#B86B33")
    ramp.color_ramp.elements[1].color = kit.hexc("#E3A468")
    e = ramp.color_ramp.elements.new(0.55); e.color = kit.hexc("#CF8748")
    L.new(noise.outputs["Fac"], ramp.inputs["Fac"]); L.new(ramp.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.42
    b.inputs["Coat Weight"].default_value = 0.35
    b.inputs["Coat Roughness"].default_value = 0.2
    return m


def tile_house(at, s=0.42):
    """A little magnet-tile house: four squares round a cell and a pyramid roof of four triangles."""
    x0, y0, z0 = at
    walls = [((0, 0), (1, 0)), ((1, 0), (1, 1)), ((1, 1), (0, 1)), ((0, 1), (0, 0))]
    colours = ("#E5322E", "#2A78DD", "#F4C51B", "#39AD4A")
    for (a, b), c in zip(walls, colours):
        p = [(x0 + a[0] * s, y0 + a[1] * s, z0), (x0 + b[0] * s, y0 + b[1] * s, z0),
             (x0 + b[0] * s, y0 + b[1] * s, z0 + s), (x0 + a[0] * s, y0 + a[1] * s, z0 + s)]
        kit.tile_poly(p, c, "house.wall", size=s)
    apex = (x0 + s / 2, y0 + s / 2, z0 + s + s * 0.62)
    for (a, b), c in zip(walls, ("#F5841F", "#8A4CC8", "#F5841F", "#8A4CC8")):
        kit.tile_poly([(x0 + a[0] * s, y0 + a[1] * s, z0 + s), (x0 + b[0] * s, y0 + b[1] * s, z0 + s), apex], c, "house.roof", size=s)


def set_dressing():
    bpy.ops.mesh.primitive_plane_add(size=14)
    table = bpy.context.view_layer.objects.active
    table.name = "set.table"
    table.data.materials.append(wood_material())
    # the room behind: a warm, soft, out-of-focus wall
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 6, 0), rotation=(math.pi / 2, 0, 0))
    wall = bpy.context.view_layer.objects.active
    wall.name = "set.wall"
    wall.data.materials.append(kit.plastic("wall", "#F6E3C8", 0.9, 0, 0))
    w = bpy.data.worlds.new("hdri"); bpy.context.scene.world = w; w.use_nodes = True
    env = w.node_tree.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(HDRI)
    w.node_tree.links.new(env.outputs["Color"], w.node_tree.nodes["Background"].inputs["Color"])
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.55

    def area(name, loc, size, energy, colour="#FFFFFF", target=(0, 0, 0.55)):
        d = bpy.data.lights.new(name, "AREA"); d.size = size; d.energy = energy; d.color = kit.hexc(colour)[:3]
        o = kit.link(bpy.data.objects.new("set." + name, d)); o.location = loc
        o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    area("key", (-3.0, -3.6, 3.6), 3.2, 420, "#FFF1DE")
    area("fill", (3.6, -2.6, 1.6), 4.0, 110, "#DDE8FF")
    area("rim", (1.6, 3.2, 3.0), 2.0, 380, "#FFFFFF")
    area("kick", (-2.8, 2.8, 1.2), 2.0, 160, "#FFE2C4")


PLACES = {"snail": ((-1.25, 0.15, 0), 0.95), "dino": ((0.1, -0.3, 0), 0.12), "axolotl": ((1.35, 0.05, 0), -0.45)}


def build_all(D):
    kit.clear_scene()
    rigs = {}
    for name, fn in (("snail", build.snail), ("dino", build.dino), ("axolotl", build.axolotl)):
        body, rig = fn(D)
        body.name, rig.name = f"{name}.body", f"{name}.rig"
        (x, y, z), turn = PLACES[name]
        rig.location = (x, y, z)
        rig.rotation_euler = (0, 0, turn)
        fuzz(body, body.data.materials[0], seed=len(rigs))
        rigs[name] = rig
    upgrade_eyes()
    add_lids()
    tile_house((-0.95, 0.85, 0), 0.5)
    set_dressing()
    return rigs


def pose(rigs):
    """The scene's moment: the dino waves hello, the snail tips his head, the axolotl throws up both arms and
    grins (happy eyes)."""
    from mathutils import Matrix

    def aim(rig, bone, direction):
        """Turns a bone (in the rig's own space) so it points along `direction`, about its head."""
        pb = rig.pose.bones[bone]
        rest = pb.bone.matrix_local
        head = rest.translation
        cur = (pb.bone.tail_local - pb.bone.head_local).normalized()
        q = cur.rotation_difference(Vector(direction).normalized())
        pb.matrix = Matrix.Translation(head) @ q.to_matrix().to_4x4() @ Matrix.Translation(-head) @ rest
        bpy.context.view_layer.update()

    def tilt(rig, bone, angle, axis=(0, 1, 0)):
        pb = rig.pose.bones[bone]
        rest = pb.bone.matrix_local
        head = rest.translation
        from mathutils import Quaternion
        q = Quaternion(Vector(axis), angle)
        pb.matrix = Matrix.Translation(head) @ q.to_matrix().to_4x4() @ Matrix.Translation(-head) @ rest
        bpy.context.view_layer.update()
    aim(rigs["dino"], "arm.R", (-0.55, -0.25, 0.8))
    tilt(rigs["dino"], "head", 0.16)
    tilt(rigs["snail"], "head", -0.2)
    aim(rigs["axolotl"], "arm.L", (-0.35, -0.75, 0.55))
    aim(rigs["axolotl"], "arm.R", (0.35, -0.75, 0.55))
    hold_tile(rigs["axolotl"])
    for o in bpy.data.objects:
        top = o
        while top.parent:
            top = top.parent
        if not top.name.startswith("axolotl"):
            continue
        if o.name.startswith(("eye.", "glint", "cornea.", "lid.")):
            o.hide_render = True
        if o.name.startswith("happy."):
            o.hide_render = False
    for o in bpy.data.objects:
        if o.name.startswith("happy."):
            top = o
            while top.parent:
                top = top.parent
            o.hide_render = not top.name.startswith("axolotl")
            o.hide_viewport = o.hide_render


def camera(kind="group"):
    cam = bpy.data.cameras.get("cam") or bpy.data.cameras.new("cam")
    o = bpy.data.objects.get("cam") or kit.link(bpy.data.objects.new("cam", cam))
    bpy.context.scene.camera = o
    shots = {
        "group": ((0.35, -5.6, 1.35), (0.05, 0.1, 0.62), 55, 2.8),
        "snail": ((-2.1, -2.9, 0.95), (-1.25, 0.1, 0.7), 85, 2.0),
        "dino": ((0.55, -2.9, 1.15), (0.1, -0.3, 0.85), 85, 2.0),
        "axolotl": ((2.25, -2.75, 1.05), (1.35, 0.05, 0.72), 85, 2.0),
    }
    pos, target, lens, fstop = shots[kind]
    rig = bpy.data.objects.get(f"{kind}.rig")
    if rig:
        # a portrait: in front of the face, between where it looks and the room's front, a little above
        pb = rig.pose.bones["head"]
        head = rig.matrix_world @ ((pb.head + pb.tail) / 2)
        target = Vector((head.x, head.y, head.z * 0.82))
        face = rig.matrix_world.to_3x3() @ Vector((0, -1, 0))
        d = face * 0.6 + Vector((0, -1, 0)) * 0.4
        d.z = 0
        d.normalize()
        pos = target + d * 2.55 + Vector((0, 0, 0.32))
    cam.lens = lens
    o.location = pos
    o.rotation_euler = (Vector(target) - Vector(pos)).to_track_quat("-Z", "Y").to_euler()
    cam.dof.use_dof = True
    cam.dof.focus_distance = (Vector(target) - Vector(pos)).length - 0.25
    cam.dof.aperture_fstop = fstop
    return o


def render_setup(samples=256, w=1920, h=1080):
    stage.render_setup(samples, w)
    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.view_settings.view_transform = "AgX"
    for look in ("AgX - Punchy", "AgX - Medium High Contrast"):
        try:
            sc.view_settings.look = look
            break
        except TypeError:
            continue
    sc.view_settings.exposure = 0.0
    sc.cycles.use_denoising = True


if __name__ == "__main__" and "--" in sys.argv:
    args = sys.argv[sys.argv.index("--") + 1:]
    OUT, shots, samples = args[0], args[1].split(","), int(args[2]) if len(args) > 2 else 256
    render_setup(samples)
    cam = bpy.context.scene.camera
    if cam and cam.animation_data:
        # (the short animates the camera; a still sets its own)
        cam.animation_data_clear()
        cam.data.animation_data_clear()
    for s in shots:
        camera(s)
        if s == "group":
            bpy.context.scene.render.resolution_x, bpy.context.scene.render.resolution_y = 1920, 1080
        else:
            bpy.context.scene.render.resolution_x, bpy.context.scene.render.resolution_y = 1200, 1500
        stage.render(os.path.join(OUT, f"hero-{s}.png"))
