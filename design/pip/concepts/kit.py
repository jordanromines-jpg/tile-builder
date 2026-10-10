"""Shared Blender kit for Pip's concepts (5.3): materials, eyes, mouths, real tile pieces, placing things on the
body's surface, a skeleton with automatic weights, face shape keys, the studio, cameras, renders, and the bake +
glTF export the app uses. Imported by build.py (live through Blender MCP, or headless with `blender -b`)."""
import math

import bmesh
import bpy
from mathutils import Vector


def hexc(h, a=1.0):
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return (*[c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb], a)


def link(obj, col=None):
    (col or bpy.context.scene.collection).objects.link(obj)
    return obj


def activate(obj):
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)


def smooth(obj):
    for p in obj.data.polygons:
        p.use_smooth = True


def clear_scene():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.armatures, bpy.data.curves, bpy.data.lights, bpy.data.cameras):
        for d in list(coll):
            if d.users == 0:
                coll.remove(d)


# ---------- materials ----------
def node_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, m.node_tree, m.node_tree.nodes["Principled BSDF"]


def ellipse_mask(nt, tc, centre, radii, soft):
    """1 inside an ellipsoid (object space), 0 outside, with a soft edge."""
    N, L = nt.nodes, nt.links
    sub = N.new("ShaderNodeVectorMath"); sub.operation = "SUBTRACT"; sub.inputs[1].default_value = centre
    L.new(tc.outputs["Object"], sub.inputs[0])
    div = N.new("ShaderNodeVectorMath"); div.operation = "DIVIDE"; div.inputs[1].default_value = radii
    L.new(sub.outputs[0], div.inputs[0])
    ln = N.new("ShaderNodeVectorMath"); ln.operation = "LENGTH"
    L.new(div.outputs[0], ln.inputs[0])
    mr = N.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = 1.0
    mr.inputs["From Max"].default_value = 1.0 - soft
    L.new(ln.outputs["Value"], mr.inputs["Value"])
    return mr.outputs["Result"]


def skin(name, low, high, belly=None, belly_mask=None, cheeks=(), blush="#FF8A96", z_range=(0.05, 1.1), sss=0.18):
    """Soft felt skin: a warm gradient from `low` (bottom) to `high` (top), an optional lighter belly, painted
    blush, a little light through it, a fine grain. belly_mask: (centre, radii, soft); cheeks: [(centre, radii)]."""
    m, nt, b = node_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new("ShaderNodeTexCoord")
    sep = N.new("ShaderNodeSeparateXYZ"); L.new(tc.outputs["Object"], sep.inputs[0])
    mr = N.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value, mr.inputs["From Max"].default_value = z_range
    L.new(sep.outputs["Z"], mr.inputs["Value"])
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = hexc(low)
    ramp.color_ramp.elements[1].color = hexc(high)
    L.new(mr.outputs["Result"], ramp.inputs["Fac"])
    colour = ramp.outputs["Color"]
    if belly and belly_mask:
        mx = N.new("ShaderNodeMix"); mx.data_type = "RGBA"
        L.new(ellipse_mask(nt, tc, *belly_mask), mx.inputs["Factor"])
        L.new(colour, mx.inputs["A"]); mx.inputs["B"].default_value = hexc(belly)
        colour = mx.outputs["Result"]
    if cheeks:
        masks = [ellipse_mask(nt, tc, c, r, 0.9) for c, r in cheeks]
        acc = masks[0]
        for k in masks[1:]:
            mm = N.new("ShaderNodeMath"); mm.operation = "MAXIMUM"
            L.new(acc, mm.inputs[0]); L.new(k, mm.inputs[1]); acc = mm.outputs[0]
        mul = N.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = 0.55
        L.new(acc, mul.inputs[0])
        mx = N.new("ShaderNodeMix"); mx.data_type = "RGBA"
        L.new(mul.outputs[0], mx.inputs["Factor"])
        L.new(colour, mx.inputs["A"]); mx.inputs["B"].default_value = hexc(blush)
        colour = mx.outputs["Result"]
    L.new(colour, b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.6
    b.inputs["Subsurface Weight"].default_value = sss
    b.inputs["Subsurface Radius"].default_value = (1.0, 0.75, 0.5)
    b.inputs["Subsurface Scale"].default_value = 0.06
    b.inputs["Sheen Weight"].default_value = 0.5
    b.inputs["Sheen Roughness"].default_value = 0.45
    noise = N.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 260; noise.inputs["Detail"].default_value = 4
    bump = N.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.05; bump.inputs["Distance"].default_value = 0.002
    L.new(noise.outputs["Fac"], bump.inputs["Height"]); L.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m


def plastic(name, colour, rough=0.28, sss=0.12, coat=0.4):
    m, nt, b = node_mat(name)
    b.inputs["Base Color"].default_value = hexc(colour)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = 0.15
    b.inputs["Subsurface Weight"].default_value = sss
    b.inputs["Subsurface Scale"].default_value = 0.03
    return m


def glass(name, colour):
    m, nt, b = node_mat(name)
    b.inputs["Base Color"].default_value = hexc(colour)
    b.inputs["Transmission Weight"].default_value = 1.0
    b.inputs["Roughness"].default_value = 0.12
    b.inputs["IOR"].default_value = 1.49
    return m


def eye_material():
    m, nt, b = node_mat("eye")
    N, L = nt.nodes, nt.links
    tc = N.new("ShaderNodeTexCoord")
    sep = N.new("ShaderNodeSeparateXYZ"); L.new(tc.outputs["Object"], sep.inputs[0])
    mr = N.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = -1.0; mr.inputs["From Max"].default_value = 0.6
    L.new(sep.outputs["Z"], mr.inputs["Value"])
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = hexc("#8A4A1E")
    ramp.color_ramp.elements[1].position = 0.75
    ramp.color_ramp.elements[1].color = hexc("#120B07")
    L.new(mr.outputs["Result"], ramp.inputs["Fac"]); L.new(ramp.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.08
    b.inputs["Coat Weight"].default_value = 1.0
    b.inputs["Coat Roughness"].default_value = 0.02
    return m


def emission(name, colour, strength):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = hexc(colour); em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs[0], nt.nodes["Material Output"].inputs[0])
    return m


# ---------- the body ----------
def import_body(path, name, faces=26000):
    """The sdf body, cut to about `faces` triangles (enough to stay smooth, light enough for an iPad), shaded smooth."""
    bpy.ops.wm.stl_import(filepath=path)
    o = bpy.context.selected_objects[0]
    o.name = name
    d = o.modifiers.new("decimate", "DECIMATE")
    d.ratio = min(1.0, faces / max(1, len(o.data.polygons)))
    activate(o)
    bpy.ops.object.modifier_apply(modifier="decimate")
    smooth(o)
    return o


def surface(obj, origin, direction):
    """Where a ray meets `obj` (world space): the point and its normal."""
    dg = bpy.context.evaluated_depsgraph_get()
    ev = obj.evaluated_get(dg)
    mw = obj.matrix_world
    inv = mw.inverted()
    ok, loc, nor, _ = ev.ray_cast(inv @ Vector(origin), (inv.to_3x3() @ Vector(direction)).normalized())
    if not ok:
        raise RuntimeError(f"no surface from {origin} along {direction}")
    return mw @ loc, (mw.to_3x3() @ nor).normalized()


def face_on(obj, x, z, thing, inset=0.0):
    """Put `thing` on the front of `obj` at (x, z), facing out along the surface."""
    p, n = surface(obj, (x, -5, z), (0, 1, 0))
    thing.location = p - n * inset
    thing.rotation_euler = (-n).to_track_quat("Y", "Z").to_euler()
    return p, n


# ---------- face ----------
def add_eyes(body, xz, r, mat=None):
    """Two big glossy eyes set into the face at (±x, z), radius r, with painted catch-lights; each with a
    `blink` shape key."""
    mat = mat or eye_material()
    eyes = []
    for sx in (-1, 1):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=r)
        e = bpy.context.view_layer.objects.active
        e.name = f"eye.{'L' if sx > 0 else 'R'}"
        e.scale = (0.92, 0.4, 1.12)
        p, n = face_on(body, xz[0] * sx, xz[1], e, inset=0.03)
        smooth(e)
        e.data.materials.append(mat)
        # the blink: the eye squashes to a line
        activate(e)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        e.shape_key_add(name="Basis")
        k = e.shape_key_add(name="blink")
        for v in k.data:
            v.co.z *= 0.08
        front = p + n * 0.01
        for dx, dz, rr, s in ((-0.3, 0.42, 0.3, 3.0), (0.32, -0.38, 0.13, 2.0)):
            bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=10, radius=r * rr)
            h = bpy.context.view_layer.objects.active
            h.name = f"glint.{len(eyes)}.{s}"
            h.scale = (1, 0.3, 1)
            h.location = front + Vector((dx * r, 0, dz * r))
            h.rotation_euler = e.rotation_euler
            h.data.materials.append(emission("glint", "#FFFFFF", s))
            h.parent = e
            h.matrix_parent_inverse = e.matrix_world.inverted()
        eyes.append(e)
    return eyes


def add_happy_eyes(body, xz, r):
    """The happy eyes: two thick upturned arcs ("^ ^") where the eyes are, shown instead of them in a smile."""
    out = []
    for sx in (-1, 1):
        bpy.ops.curve.primitive_bezier_curve_add()
        c = bpy.context.view_layer.objects.active
        pts = c.data.splines[0].bezier_points
        w = r * 0.85
        pts[0].co = (-w, 0, -r * 0.15); pts[0].handle_left = (-w * 1.2, 0, -r * 0.4); pts[0].handle_right = (-w * 0.75, 0, r * 0.65)
        pts[1].co = (w, 0, -r * 0.15); pts[1].handle_left = (w * 0.75, 0, r * 0.65); pts[1].handle_right = (w * 1.2, 0, -r * 0.4)
        c.data.bevel_depth = r * 0.2
        c.data.bevel_resolution = 6
        c.data.use_fill_caps = True
        activate(c)
        bpy.ops.object.convert(target="MESH")
        h = bpy.context.view_layer.objects.active
        h.name = f"happy.{'L' if sx > 0 else 'R'}"
        face_on(body, xz[0] * sx, xz[1], h, inset=-r * 0.05)
        smooth(h)
        h.data.materials.append(plastic("lash", "#1A0F08", 0.3, 0, 0.3))
        out.append(h)
    return out


def add_mouth(body, z, w, out=0.012, tilt=0.0):
    """A soft D-shaped mouth (dark) wrapped onto the face at height z, so it hugs the curve; shape key `closed`
    folds it to a smiling line."""
    me = bpy.data.meshes.new("mouth")
    bm = bmesh.new()
    seg, rows = 24, 6
    grid = []
    for j in range(rows + 1):
        t = j / rows
        grid.append([bm.verts.new((-w / 2 + w * i / seg, 0, -t * w * 0.55 * math.sin(math.pi * i / seg) - w * 0.06 * math.sin(math.pi * i / seg))) for i in range(seg + 1)])
    for j in range(rows):
        for i in range(seg):
            bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
    bm.to_mesh(me); bm.free()
    m = link(bpy.data.objects.new("mouth", me))
    face_on(body, 0, z, m, inset=-out)
    m.rotation_euler.x += tilt
    sw = m.modifiers.new("wrap", "SHRINKWRAP")
    sw.target = body; sw.wrap_method = "NEAREST_SURFACEPOINT"; sw.offset = 0.004
    activate(m)
    bpy.ops.object.modifier_apply(modifier="wrap")
    smooth(m)
    m.data.materials.append(emission("mouth", "#4A1A16", 1.0))
    m.shape_key_add(name="Basis")
    c = m.shape_key_add(name="closed")
    n = seg + 1
    for j in range(1, rows + 1):
        for i in range(n):
            top = c.data[i].co
            v = c.data[j * n + i]
            v.co = top.lerp(v.co, 0.12 * j / rows)
    return m


# ---------- tiles ----------
def tile(shape, colour, size, name="tile"):
    """A real magnet tile: a rounded rim of solid plastic and a pane of coloured glass. Its base edge runs
    along x from (0, 0, 0), standing in the xz plane. shape: 'square' or 'triangle' (equilateral) or 'tall'."""
    if shape == "square":
        outer = [(0, 0, 0), (size, 0, 0), (size, 0, size), (0, 0, size)]
    elif shape == "tall":
        h = size * 1.75
        outer = [(0, 0, 0), (size, 0, 0), (size / 2, 0, h)]
    else:
        h = size * math.sqrt(3) / 2
        outer = [(0, 0, 0), (size, 0, 0), (size / 2, 0, h)]
    c = Vector((sum(p[0] for p in outer) / len(outer), 0, sum(p[2] for p in outer) / len(outer)))
    rim_w = size * 0.13
    inner = []
    for p in outer:
        v = Vector(p) - c
        inner.append(tuple(c + v * (1 - rim_w * (2.0 if len(outer) == 3 else 1.6) / v.length)))
    n = len(outer)
    me = bpy.data.meshes.new(name + ".rim")
    me.from_pydata(list(outer) + inner, [], [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)])
    rim = link(bpy.data.objects.new(name + ".rim", me))
    so = rim.modifiers.new("solid", "SOLIDIFY"); so.thickness = size * 0.12; so.offset = 0
    bv = rim.modifiers.new("bevel", "BEVEL"); bv.width = size * 0.035; bv.segments = 3
    smooth(rim)
    rim.data.materials.append(plastic("rim" + colour, colour, 0.25, 0.1))
    pm = bpy.data.meshes.new(name + ".pane")
    pm.from_pydata(inner, [], [tuple(range(n))])
    pane = link(bpy.data.objects.new(name + ".pane", pm))
    so2 = pane.modifiers.new("solid", "SOLIDIFY"); so2.thickness = size * 0.03; so2.offset = 0
    pane.data.materials.append(glass("pane" + colour, colour))
    holder = link(bpy.data.objects.new(name, None))
    rim.parent = holder; pane.parent = holder
    return holder


def tile_poly(points, colour, name="tile", size=None):
    """A real magnet tile of any outline, given its corners in place (a pyramid face, a gill)."""
    pts = [Vector(p) for p in points]
    c = sum(pts, Vector()) / len(pts)
    size = size or max((a - b).length for a in pts for b in pts)
    rim_w = size * 0.11
    inner = [c + (p - c) * (1 - rim_w * 2.0 / (p - c).length) for p in pts]
    n = len(pts)
    me = bpy.data.meshes.new(name + ".rim")
    me.from_pydata([tuple(p) for p in pts + inner], [], [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)])
    rim = link(bpy.data.objects.new(name + ".rim", me))
    so = rim.modifiers.new("solid", "SOLIDIFY"); so.thickness = size * 0.1; so.offset = 0
    bv = rim.modifiers.new("bevel", "BEVEL"); bv.width = size * 0.03; bv.segments = 3
    smooth(rim)
    rim.data.materials.append(plastic("rim" + colour, colour, 0.25, 0.1))
    pm = bpy.data.meshes.new(name + ".pane")
    pm.from_pydata([tuple(p) for p in inner], [], [tuple(range(n))])
    pane = link(bpy.data.objects.new(name + ".pane", pm))
    so2 = pane.modifiers.new("solid", "SOLIDIFY"); so2.thickness = size * 0.025; so2.offset = 0
    pane.data.materials.append(glass("pane" + colour, colour))
    holder = link(bpy.data.objects.new(name, None))
    rim.parent = holder; pane.parent = holder
    return holder


# ---------- skeleton ----------
def armature(name, bones):
    """bones: [(name, head, tail, parent or None, deform)]. Returns the armature object (in object mode)."""
    arm = bpy.data.armatures.new(name)
    obj = link(bpy.data.objects.new(name, arm))
    activate(obj)
    bpy.ops.object.mode_set(mode="EDIT")
    made = {}
    for bn, head, tail, parent, deform in bones:
        eb = arm.edit_bones.new(bn)
        eb.head = head; eb.tail = tail
        eb.use_deform = deform
        if parent:
            eb.parent = made[parent]
        made[bn] = eb
    bpy.ops.object.mode_set(mode="OBJECT")
    return obj


def skin_to(body, arm):
    """Binds the body to the skeleton with automatic (heat) weights."""
    activate(body)
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")


def attach(obj, arm, bone):
    """Rigidly attaches an object (an eye, a tile) to one bone, keeping where it is."""
    mw = obj.matrix_world.copy()
    obj.parent = arm
    obj.parent_type = "BONE"
    obj.parent_bone = bone
    bpy.context.view_layer.update()
    obj.matrix_world = mw


# ---------- studio ----------
DOME = 1.05


def studio(bg="#FBEFDD"):
    m, nt, bs = node_mat("backdrop")
    bs.inputs["Base Color"].default_value = hexc(bg)
    bs.inputs["Roughness"].default_value = 0.9
    bs.inputs["Emission Color"].default_value = hexc(bg)
    bs.inputs["Emission Strength"].default_value = 0.3
    N, Lk = nt.nodes, nt.links
    tc = N.new("ShaderNodeTexCoord")
    ln = N.new("ShaderNodeVectorMath"); ln.operation = "LENGTH"; Lk.new(tc.outputs["Object"], ln.inputs[0])
    mr = N.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 2.2; mr.inputs["From Max"].default_value = 7.0
    Lk.new(ln.outputs["Value"], mr.inputs["Value"])
    far = N.new("ShaderNodeEmission"); far.inputs["Color"].default_value = hexc(bg); far.inputs["Strength"].default_value = DOME
    mx = N.new("ShaderNodeMixShader")
    Lk.new(mr.outputs["Result"], mx.inputs[0]); Lk.new(bs.outputs[0], mx.inputs[1]); Lk.new(far.outputs[0], mx.inputs[2])
    Lk.new(mx.outputs[0], N["Material Output"].inputs[0])
    bpy.ops.mesh.primitive_plane_add(size=80)
    floor = bpy.context.view_layer.objects.active
    floor.name = "studio.floor"
    floor.data.materials.append(m)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=36)
    dome = bpy.context.view_layer.objects.active
    dome.name = "studio.dome"
    dome.data.materials.append(emission("dome", bg, DOME))
    smooth(dome)
    for attr in ("visible_diffuse", "visible_glossy", "visible_shadow", "visible_transmission", "visible_volume_scatter"):
        setattr(dome, attr, False)

    def area(name, loc, size, energy, colour="#FFFFFF", target=(0, 0, 0.55)):
        d = bpy.data.lights.new(name, "AREA"); d.size = size; d.energy = energy; d.color = hexc(colour)[:3]
        o = link(bpy.data.objects.new("studio." + name, d)); o.location = loc
        o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    area("key", (-2.2, -3.0, 3.2), 3.0, 115, "#FFF4E6")
    area("fill", (3.0, -2.2, 1.4), 3.5, 45, "#E8F0FF")
    area("rim", (1.2, 2.6, 2.6), 1.6, 150, "#FFFFFF")
    area("glint", (-0.6, -3.5, 1.6), 0.6, 30, "#FFFFFF")
    w = bpy.data.worlds.new("w"); bpy.context.scene.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = hexc("#F3E3CF")
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.22


VIEWS = {"hero": (-1.55, -3.3, 1.35), "front": (0, -3.6, 1.05), "side": (-3.6, 0, 1.05), "back": (1.4, 3.3, 1.2)}


def camera(view, target=(0, 0, 0.55), lens=70, dist=1.0):
    cam = bpy.data.cameras.get("cam") or bpy.data.cameras.new("cam")
    cam.lens = lens
    o = bpy.data.objects.get("cam") or link(bpy.data.objects.new("cam", cam))
    bpy.context.scene.camera = o
    pos = Vector(target) + (Vector(VIEWS[view]) - Vector(target)) * dist
    o.location = pos
    o.rotation_euler = (Vector(target) - pos).to_track_quat("-Z", "Y").to_euler()
    cam.dof.use_dof = True
    cam.dof.focus_distance = (Vector(target) - pos).length - 0.4
    cam.dof.aperture_fstop = 4.0
    return o


def render_setup(samples=160, res=1200):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    sc.cycles.device = "GPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.render.resolution_x = res
    sc.render.resolution_y = res
    sc.render.film_transparent = False
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.view_settings.exposure = -0.45


def render(path):
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


# ---------- for the app ----------
def bake_vertex_colours(body, ao_strength=0.55):
    """Bakes the skin's colour and its soft shadowing (AO) into the body's vertex colours, so the iPad gets the
    painted gradient, belly and blush and the contact shading without the node tree."""
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 64
    me = body.data
    for nm in ("albedo", "ao"):
        if nm not in me.color_attributes:
            me.color_attributes.new(nm, "FLOAT_COLOR", "POINT")
    activate(body)
    me.color_attributes.active_color = me.color_attributes["albedo"]
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"COLOR"}, target="VERTEX_COLORS")
    me.color_attributes.active_color = me.color_attributes["ao"]
    bpy.ops.object.bake(type="AO", target="VERTEX_COLORS")
    if "Col" not in me.color_attributes:
        me.color_attributes.new("Col", "BYTE_COLOR", "POINT")
    alb, ao, out = me.color_attributes["albedo"].data, me.color_attributes["ao"].data, me.color_attributes["Col"].data
    for i in range(len(out)):
        a = ao[i].color[0]
        k = 1 - ao_strength + ao_strength * a
        c = alb[i].color
        out[i].color = (c[0] * k, c[1] * k, c[2] * k, 1.0)
    for nm in ("albedo", "ao"):
        me.color_attributes.remove(me.color_attributes[nm])
    me.color_attributes.active_color = me.color_attributes["Col"]
    # (the glTF exporter writes the *render* colour attribute: without this it writes plain white)
    me.color_attributes.render_color_index = me.color_attributes.active_color_index
    # the app's material: the baked colour, the same softness
    m, nt, b = node_mat(body.name + ".app")
    ca = nt.nodes.new("ShaderNodeVertexColor"); ca.layer_name = "Col"
    nt.links.new(ca.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.6
    b.inputs["Sheen Weight"].default_value = 0.5
    b.inputs["Sheen Roughness"].default_value = 0.45
    return m


def export_glb(path, objects):
    for o in bpy.context.view_layer.objects:
        o.select_set(o in objects)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True, export_apply=False,
        export_morph=True, export_skins=True, export_animations=True, export_vertex_color="ACTIVE",
        export_yup=True,
    )
