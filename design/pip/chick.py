# Pip concept C, the builder chick, modelled and rendered in Blender (Cycles) for Jordan's look.
# Run: blender -b -P chick.py -- <out_dir> [views]
import bpy, math, sys, os
from mathutils import Vector, Euler

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else "/tmp"
VIEWS = argv[1].split(",") if len(argv) > 1 else ["hero"]
SAMPLES = int(argv[2]) if len(argv) > 2 else 192

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
col = scene.collection

def hexc(h, a=1.0):
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, a)

def link(obj):
    col.objects.link(obj)
    return obj

def activate(obj):
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

def smooth(obj, subsurf=2):
    for p in obj.data.polygons:
        p.use_smooth = True
    if subsurf:
        m = obj.modifiers.new("sub", "SUBSURF")
        m.levels = subsurf
        m.render_levels = subsurf

# ---------- materials ----------
def node_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    return m, nt, bsdf

def body_material():
    m, nt, b = node_mat("chick_body")
    N = nt.nodes
    L = nt.links
    tc = N.new("ShaderNodeTexCoord")
    sep = N.new("ShaderNodeSeparateXYZ")
    L.new(tc.outputs["Object"], sep.inputs[0])
    # yellow, warmer and deeper toward the bottom and the back
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = hexc("#F5A00F")
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color = hexc("#FFD62E")
    e = ramp.color_ramp.elements.new(0.62)
    e.color = hexc("#FFCC2E")
    mr = N.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = 0.1
    mr.inputs["From Max"].default_value = 0.95
    L.new(sep.outputs["Z"], mr.inputs["Value"])
    L.new(mr.outputs["Result"], ramp.inputs["Fac"])
    # the cream tummy: an ellipse on the front, low, with a soft edge
    def ellipse_mask(cx, cy, cz, rx, ry, rz, soft):
        sub = N.new("ShaderNodeVectorMath"); sub.operation = "SUBTRACT"
        sub.inputs[1].default_value = (cx, cy, cz)
        L.new(tc.outputs["Object"], sub.inputs[0])
        div = N.new("ShaderNodeVectorMath"); div.operation = "DIVIDE"
        div.inputs[1].default_value = (rx, ry, rz)
        L.new(sub.outputs[0], div.inputs[0])
        ln = N.new("ShaderNodeVectorMath"); ln.operation = "LENGTH"
        L.new(div.outputs[0], ln.inputs[0])
        mr2 = N.new("ShaderNodeMapRange")
        mr2.inputs["From Min"].default_value = 1.0
        mr2.inputs["From Max"].default_value = 1.0 - soft
        L.new(ln.outputs["Value"], mr2.inputs["Value"])
        return mr2.outputs["Result"]
    tummy = ellipse_mask(0, -0.52, 0.22, 0.34, 0.3, 0.2, 0.35)
    mix1 = N.new("ShaderNodeMix"); mix1.data_type = "RGBA"
    L.new(tummy, mix1.inputs["Factor"])
    L.new(ramp.outputs["Color"], mix1.inputs["A"])
    mix1.inputs["B"].default_value = hexc("#FFF1C9")
    # blush on both cheeks
    cheekL = ellipse_mask(-0.34, -0.42, 0.5, 0.1, 0.22, 0.075, 0.9)
    cheekR = ellipse_mask(0.34, -0.42, 0.5, 0.1, 0.22, 0.075, 0.9)
    mx = N.new("ShaderNodeMath"); mx.operation = "MAXIMUM"
    L.new(cheekL, mx.inputs[0]); L.new(cheekR, mx.inputs[1])
    mx2 = N.new("ShaderNodeMath"); mx2.operation = "MULTIPLY"; mx2.inputs[1].default_value = 0.55
    L.new(mx.outputs[0], mx2.inputs[0])
    mix2 = N.new("ShaderNodeMix"); mix2.data_type = "RGBA"
    L.new(mx2.outputs[0], mix2.inputs["Factor"])
    L.new(mix1.outputs["Result"], mix2.inputs["A"])
    mix2.inputs["B"].default_value = hexc("#FF8A8A")
    L.new(mix2.outputs["Result"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.62
    b.inputs["Subsurface Weight"].default_value = 0.18
    b.inputs["Subsurface Radius"].default_value = (1.0, 0.85, 0.35)
    b.inputs["Subsurface Scale"].default_value = 0.06
    b.inputs["Sheen Weight"].default_value = 0.55
    b.inputs["Sheen Roughness"].default_value = 0.45
    b.inputs["Sheen Tint"].default_value = hexc("#FFF6D8")
    # a fine felt grain
    noise = N.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 260; noise.inputs["Detail"].default_value = 4
    bump = N.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.06; bump.inputs["Distance"].default_value = 0.002
    L.new(noise.outputs["Fac"], bump.inputs["Height"])
    L.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m

def plastic(name, hexcol, rough=0.28, sss=0.15):
    m, nt, b = node_mat(name)
    b.inputs["Base Color"].default_value = hexc(hexcol)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = 0.4
    b.inputs["Coat Roughness"].default_value = 0.15
    b.inputs["Subsurface Weight"].default_value = sss
    b.inputs["Subsurface Scale"].default_value = 0.03
    return m

def glass(name, hexcol):
    m, nt, b = node_mat(name)
    b.inputs["Base Color"].default_value = hexc(hexcol)
    b.inputs["Transmission Weight"].default_value = 1.0
    b.inputs["Roughness"].default_value = 0.12
    b.inputs["IOR"].default_value = 1.49
    return m

def eye_material():
    m, nt, b = node_mat("eye")
    N = nt.nodes; L = nt.links
    tc = N.new("ShaderNodeTexCoord")
    sep = N.new("ShaderNodeSeparateXYZ")
    L.new(tc.outputs["Object"], sep.inputs[0])
    # a deep brown iris, warmer and lighter low in the eye (the light coming through), near-black above
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = hexc("#8A4A1E")
    ramp.color_ramp.elements[1].position = 0.75
    ramp.color_ramp.elements[1].color = hexc("#120B07")
    mr = N.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = -1.0
    mr.inputs["From Max"].default_value = 0.6
    L.new(sep.outputs["Z"], mr.inputs["Value"])
    L.new(mr.outputs["Result"], ramp.inputs["Fac"])
    L.new(ramp.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.08
    b.inputs["Coat Weight"].default_value = 1.0
    b.inputs["Coat Roughness"].default_value = 0.02
    return m

def emission(name, hexcol, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = hexc(hexcol); em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs[0], nt.nodes["Material Output"].inputs[0])
    return m

# ---------- the body: soft forms that melt into each other ----------
def metaball_mesh(name, elems, res=0.018, threshold=0.6):
    mb = bpy.data.metaballs.new(name)
    mb.resolution = res; mb.render_resolution = res; mb.threshold = threshold
    obj = link(bpy.data.objects.new(name, mb))
    for typ, co, radius, size, stiff, neg in elems:
        e = mb.elements.new(type=typ)
        e.co = co; e.radius = radius; e.stiffness = stiff
        e.use_negative = neg
        if typ == "ELLIPSOID":
            e.size_x, e.size_y, e.size_z = size
    activate(obj)
    bpy.ops.object.convert(target="MESH")
    mesh = bpy.context.view_layer.objects.active
    mesh.name = name
    sm = mesh.modifiers.new("cs", "CORRECTIVE_SMOOTH"); sm.iterations = 8; sm.smooth_type = "SIMPLE"; sm.use_only_smooth = False
    for p in mesh.data.polygons:
        p.use_smooth = True
    return mesh

def fit(mesh, size, bottom_center):
    """Scale and place a converted mesh so its bounding box is `size` (x, y, z) with its bottom's middle at
    `bottom_center` (the metaballs' surface lies well inside their radii, so sizes are set, not guessed)."""
    vs = [v.co for v in mesh.data.vertices]
    lo = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs)))
    hi = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
    dim = hi - lo
    k = Vector((size[0] / dim.x, size[1] / dim.y, size[2] / dim.z))
    mid = (lo + hi) / 2
    for v in mesh.data.vertices:
        c = v.co - Vector((mid.x, mid.y, lo.z))
        v.co = Vector((c.x * k.x, c.y * k.y, c.z * k.z))
    mesh.location = bottom_center
    mesh.data.update()

def surface(obj, origin, direction):
    """Where a ray from `origin` along `direction` meets `obj` (world space): the point and its normal."""
    dg = bpy.context.evaluated_depsgraph_get()
    ev = obj.evaluated_get(dg)
    mw = obj.matrix_world
    inv = mw.inverted()
    ok, loc, nor, _ = ev.ray_cast(inv @ Vector(origin), (inv.to_3x3() @ Vector(direction)).normalized())
    if not ok:
        raise RuntimeError(f"no surface from {origin}")
    return mw @ loc, (mw.to_3x3() @ nor).normalized()

def on_surface(obj, x, z, thing, inset=0.0, face=(0, 1, 0)):
    p, n = surface(obj, (x, -5, z), face)
    thing.location = p - n * inset
    thing.rotation_euler = (-n).to_track_quat("Y", "Z").to_euler()
    return p, n

def make_chick(root, mood="open"):
    bodymat = body_material()
    body = metaball_mesh("body", [
        # the main round body, a little wider low (a soft pear), and its dome
        ("ELLIPSOID", (0, 0, 0.5), 0.5, (1.08, 1.0, 0.98), 2.0, False),
        ("ELLIPSOID", (0, 0.02, 0.74), 0.36, (1.0, 0.95, 0.9), 2.0, False),
        # a little tuft of a tail at the back
        ("ELLIPSOID", (0, 0.36, 0.5), 0.14, (0.8, 0.9, 1.0), 2.0, False),
    ])
    fit(body, (1.16, 1.06, 1.02), (0, 0, 0.07))
    body.data.materials.append(bodymat)
    bpy.context.view_layer.update()
    # wings: soft paddles that sit on the body
    for sx in (-1, 1):
        w = metaball_mesh(f"wing{sx}", [("ELLIPSOID", (0, 0, 0), 0.2, (0.42, 0.75, 1.0), 2.0, False), ("ELLIPSOID", (0, 0.02, -0.08), 0.14, (0.45, 0.8, 0.9), 2.0, False)])
        fit(w, (0.19, 0.36, 0.44), (0, 0, 0))
        p, n = surface(body, (5 * sx, -0.1, 0.48), (-sx, 0, 0))
        w.location = p + Vector((0.02 * sx, 0.0, -0.25))
        w.rotation_euler = (0.15, -0.55 * sx, 0.25 * sx)
        w.data.materials.append(bodymat)
    # feet: orange, three soft toes each
    footmat = plastic("feet", "#F27A1A", 0.4, 0.3)
    for sx in (-1, 1):
        f = metaball_mesh(f"foot{sx}", [
            ("ELLIPSOID", (0, 0.02, 0), 0.12, (0.9, 0.8, 0.5), 2.0, False),
            ("ELLIPSOID", (-0.06, -0.08, -0.005), 0.08, (0.8, 1.2, 0.7), 1.0, False),
            ("ELLIPSOID", (0.0, -0.1, -0.005), 0.08, (0.8, 1.2, 0.7), 1.0, False),
            ("ELLIPSOID", (0.06, -0.08, -0.005), 0.08, (0.8, 1.2, 0.7), 1.0, False),
        ], res=0.01)
        fit(f, (0.24, 0.26, 0.075), (0.18 * sx, -0.16, 0.0))
        f.rotation_euler = (0, 0, -0.18 * sx)
        f.data.materials.append(footmat)
    # eyes: big, set low and wide, glossy
    eyemat = eye_material()
    for sx in (-1, 1):
        if mood == "happy":
            bpy.ops.curve.primitive_bezier_curve_add()
            c = bpy.context.view_layer.objects.active
            sp = c.data.splines[0]
            pts = sp.bezier_points
            pts[0].co = (-0.075, 0, -0.02); pts[0].handle_left = (-0.09, 0, -0.04); pts[0].handle_right = (-0.06, 0, 0.05)
            pts[1].co = (0.075, 0, -0.02); pts[1].handle_left = (0.06, 0, 0.05); pts[1].handle_right = (0.09, 0, -0.04)
            c.data.bevel_depth = 0.024; c.data.bevel_resolution = 6
            c.data.materials.append(plastic("lash", "#1A0F08", 0.3, 0))
            p, n = surface(body, (0.19 * sx, -5, 0.6), (0, 1, 0))
            c.location = p - n * 0.005
            c.rotation_euler = (math.radians(-8), 0, math.radians(-14 * sx))
            continue
        bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=0.115)
        e = bpy.context.view_layer.objects.active
        e.name = f"eye{sx}"
        e.scale = (0.92, 0.4, 1.12)
        p, n = surface(body, (0.19 * sx, -5, 0.6), (0, 1, 0))
        e.location = p - n * 0.03
        e.rotation_euler = (-n).to_track_quat("Y", "Z").to_euler()
        smooth(e, 1)
        e.data.materials.append(eyemat)
        front = p - n * 0.008
        # a painted catch-light, top-left in both eyes (as a light from one window)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.034)
        h = bpy.context.view_layer.objects.active
        h.scale = (1, 0.3, 1)
        h.location = front + Vector((-0.035, 0, 0.05))
        h.rotation_euler = e.rotation_euler
        h.data.materials.append(emission("glint", "#FFFFFF", 3.0))
        smooth(h, 0)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.014)
        h2 = bpy.context.view_layer.objects.active
        h2.scale = (1, 0.3, 1)
        h2.location = front + Vector((0.035, 0, -0.045))
        h2.rotation_euler = e.rotation_euler
        h2.data.materials.append(emission("glint2", "#FFFFFF", 2.0))
    # the beak: a small soft triangle, a tile's shape
    bpy.ops.mesh.primitive_cone_add(vertices=3, radius1=0.09, radius2=0.0, depth=0.12)
    bk = bpy.context.view_layer.objects.active
    p, n = surface(body, (0, -5, 0.49), (0, 1, 0))
    bk.location = p - n * 0.02
    bk.rotation_euler = (math.radians(90), 0, math.radians(180))
    bk.scale = (1.0, 0.75, 1.0)
    bv = bk.modifiers.new("bevel", "BEVEL"); bv.width = 0.02; bv.segments = 4
    smooth(bk, 2)
    bk.data.materials.append(plastic("beak", "#F27A1A", 0.35, 0.3))
    # the crest: three real tiles, a rim of solid plastic and a pane of coloured glass
    for x, c, tilt in ((-0.16, "#E5322E", 0.5), (0.0, "#2A78DD", 0.0), (0.16, "#39AD4A", -0.5)):
        p, n = surface(body, (x, 0.02, 5), (0, 0, -1))
        add_tile_triangle(root, p - Vector((0, 0, 0.03)), tilt, 0.24, c)
    return body

def add_tile_triangle(root, at, tilt, size, colhex):
    h = size * math.sqrt(3) / 2
    outer = [(-size / 2, 0, 0), (size / 2, 0, 0), (0, 0, h)]
    cx, cz = 0, h / 3
    inset = 0.24
    inner = [(cx + (p[0] - cx) * (1 - inset * 1.7), 0, cz + (p[2] - cz) * (1 - inset * 1.7)) for p in outer]
    # the rim: a ring between the outer and inner triangles
    mesh = bpy.data.meshes.new("rim")
    verts = outer + inner
    faces = [(0, 1, 4, 3), (1, 2, 5, 4), (2, 0, 3, 5)]
    mesh.from_pydata(verts, [], faces)
    rim = link(bpy.data.objects.new("rim", mesh))
    so = rim.modifiers.new("solid", "SOLIDIFY"); so.thickness = 0.035; so.offset = 0
    bv = rim.modifiers.new("bevel", "BEVEL"); bv.width = 0.01; bv.segments = 3
    for p in rim.data.polygons:
        p.use_smooth = True
    rim.data.materials.append(plastic("rim" + colhex, colhex, 0.25, 0.1))
    pane_mesh = bpy.data.meshes.new("pane")
    pane_mesh.from_pydata(inner, [], [(0, 1, 2)])
    pane = link(bpy.data.objects.new("pane", pane_mesh))
    so2 = pane.modifiers.new("solid", "SOLIDIFY"); so2.thickness = 0.01; so2.offset = 0
    pane.data.materials.append(glass("pane" + colhex, colhex))
    holder = link(bpy.data.objects.new("crest", None))
    holder.location = at
    holder.rotation_euler = (math.radians(-6), tilt, 0)
    rim.parent = holder; pane.parent = holder
    holder.parent = root

# ---------- the studio ----------
DOME = 1.05

def studio(bg="#FBEFDD"):
    # a seamless backdrop: a floor that curves up into a wall
    bpy.ops.mesh.primitive_plane_add(size=1)
    p = bpy.context.view_layer.objects.active
    me = p.data
    import bmesh
    bm = bmesh.new()
    rows = []
    for i in range(40):
        t = i / 39
        # floor from y=-6 to y=2, then a quarter circle up, then a wall
        y, z = -40 + t * 80, 0
        rows.append((bm.verts.new((-40, y, z)), bm.verts.new((40, y, z))))
    for a, b in zip(rows, rows[1:]):
        bm.faces.new((a[0], a[1], b[1], b[0]))
    bm.to_mesh(me); bm.free()
    for f in me.polygons:
        f.use_smooth = True
    m, nt, bs = node_mat("backdrop")
    bs.inputs["Base Color"].default_value = hexc(bg)
    bs.inputs["Roughness"].default_value = 0.9
    bs.inputs["Emission Color"].default_value = hexc(bg)
    bs.inputs["Emission Strength"].default_value = 0.3
    # past a few squares the floor fades into the dome's own colour: no horizon
    N = nt.nodes; Lk = nt.links
    tc = N.new("ShaderNodeTexCoord")
    ln = N.new("ShaderNodeVectorMath"); ln.operation = "LENGTH"
    Lk.new(tc.outputs["Object"], ln.inputs[0])
    mr = N.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 2.2; mr.inputs["From Max"].default_value = 7.0
    Lk.new(ln.outputs["Value"], mr.inputs["Value"])
    far = N.new("ShaderNodeEmission"); far.inputs["Color"].default_value = hexc(bg); far.inputs["Strength"].default_value = DOME
    mixs = N.new("ShaderNodeMixShader")
    Lk.new(mr.outputs["Result"], mixs.inputs[0])
    Lk.new(bs.outputs[0], mixs.inputs[1])
    Lk.new(far.outputs[0], mixs.inputs[2])
    Lk.new(mixs.outputs[0], N["Material Output"].inputs[0])
    me.materials.append(m)
    # a dome of the same stuff all round, so every view's background is seamless with the floor
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=36)
    dome = bpy.context.view_layer.objects.active
    dome.name = "Plane_dome"
    dm = emission("dome", bg, DOME)
    dome.data.materials.append(dm)
    for f in dome.data.polygons:
        f.use_smooth = True
    # seen by the camera only: it lights nothing and blocks nothing
    dome.visible_diffuse = False
    dome.visible_glossy = False
    dome.visible_shadow = False
    dome.visible_transmission = False
    dome.visible_volume_scatter = False

    # light: a big soft key from the front left and above, a fill, a rim from behind
    def area(name, loc, size, energy, colour="#FFFFFF", target=(0, 0, 0.55)):
        d = bpy.data.lights.new(name, "AREA"); d.size = size; d.energy = energy; d.color = hexc(colour)[:3]
        o = link(bpy.data.objects.new(name, d)); o.location = loc
        direction = Vector(target) - Vector(loc)
        o.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        return o
    area("key", (-2.2, -3.0, 3.2), 3.0, 115, "#FFF4E6")
    area("fill", (3.0, -2.2, 1.4), 3.5, 45, "#E8F0FF")
    area("rim", (1.2, 2.6, 2.6), 1.6, 150, "#FFFFFF")
    area("glint", (-0.6, -3.5, 1.6), 0.6, 30, "#FFFFFF")

    w = bpy.data.worlds.new("w"); scene.world = w; w.use_nodes = True
    # the light the world gives is soft and low; what the camera sees of it is the floor's own colour, so the floor
    # runs seamlessly into the background
    wn = w.node_tree.nodes; wl = w.node_tree.links
    light = wn["Background"]
    light.inputs[0].default_value = hexc("#F3E3CF"); light.inputs[1].default_value = 0.22
    seen = wn.new("ShaderNodeBackground")
    seen.inputs[0].default_value = hexc(bg); seen.inputs[1].default_value = 1.0
    lp = wn.new("ShaderNodeLightPath")
    mix = wn.new("ShaderNodeMixShader")
    wl.new(lp.outputs["Is Camera Ray"], mix.inputs[0])
    wl.new(light.outputs[0], mix.inputs[1])
    wl.new(seen.outputs[0], mix.inputs[2])
    wl.new(mix.outputs[0], wn["World Output"].inputs[0])

def camera(view):
    cam = bpy.data.cameras.new("cam"); cam.lens = 70
    o = link(bpy.data.objects.new("cam", cam)); scene.camera = o
    target = Vector((0, 0, 0.55))
    pos = {
        "hero": (-1.55, -3.3, 1.35),
        "front": (0, -3.6, 1.05),
        "side": (-3.6, 0, 1.05),
        "back": (1.4, 3.3, 1.2),
        "low": (-1.0, -3.0, 0.45),
    }[view]
    o.location = pos
    o.rotation_euler = (target - Vector(pos)).to_track_quat("-Z", "Y").to_euler()
    cam.dof.use_dof = True
    cam.dof.focus_distance = (target - Vector(pos)).length - 0.4
    cam.dof.aperture_fstop = 4.0
    return o

def render_setup(samples):
    scene.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    scene.cycles.device = "GPU"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 1200
    scene.render.film_transparent = False
    vs = scene.view_settings
    # toy plastic and felt want their colour whole: a plain sRGB view, exposure set by the lights
    vs.view_transform = "Standard"
    vs.look = "None"
    vs.exposure = -0.45

render_setup(SAMPLES)
studio()
for view in VIEWS:
    mood = "happy" if view.endswith("-happy") else "open"
    name = view.replace("-happy", "")
    root = link(bpy.data.objects.new("pip", None))
    make_chick(root, mood)
    cam = camera(name)
    scene.render.filepath = os.path.join(OUT, f"chick-{view}.png")
    bpy.ops.render.render(write_still=True)
    # clear this one's character and camera for the next view
    for o in list(bpy.data.objects):
        if o.type in ("MESH", "CURVE", "EMPTY", "CAMERA") and o.name not in ("Plane",) and not o.name.startswith("Plane"):
            bpy.data.objects.remove(o, do_unlink=True)
