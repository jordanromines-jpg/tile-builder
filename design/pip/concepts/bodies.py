"""Pip, three fresh concepts (5.3): each body is one soft form, made with signed distance functions
(fogleman/sdf) whose parts melt into each other through smooth unions, then meshed by marching cubes.
Blender adds the eyes, the tiles, the skin, the skeleton and the faces (build.py).

Run: design/pip/.venv/bin/python design/pip/concepts/bodies.py <out_dir>
Units: about a metre tall in Blender's space; z is up; the character faces -y (Blender's front).
"""
import sys
from pathlib import Path

from sdf import capsule, ellipsoid, sphere

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
STEP = 0.006


def at(shape, x, y, z):
    return shape.translate((x, y, z))


def snail():
    """A: a snail with a tile pyramid for a shell. A long soft foot, a neck rising into a big round head,
    two little feelers with round tips."""
    foot = at(ellipsoid((0.2, 0.5, 0.12)), 0, 0.06, 0.12)
    tail = capsule((0, 0.4, 0.1), (0, 0.66, 0.06), 0.06)
    neck = capsule((0, -0.16, 0.16), (0, -0.3, 0.46), 0.15)
    head = at(ellipsoid((0.31, 0.29, 0.29)), 0, -0.33, 0.66)
    body = foot.union(tail, neck, k=0.09).union(head, k=0.12)
    for sx in (-1, 1):
        stalk = capsule((0.09 * sx, -0.3, 0.9), (0.17 * sx, -0.36, 1.1), 0.024)
        tip = sphere(0.055, (0.17 * sx, -0.36, 1.12))
        body = body.union(stalk.union(tip, k=0.03), k=0.04)
    return body


def dino():
    """B: a baby dinosaur: a big round head with a soft snout, a pear body, stubby legs and arms, and a tail
    that curls round behind. Tile triangles run down its back."""
    head = at(ellipsoid((0.37, 0.35, 0.33)), 0, -0.02, 0.98)
    snout = at(ellipsoid((0.23, 0.17, 0.15)), 0, -0.27, 0.9)
    body = at(ellipsoid((0.3, 0.28, 0.34)), 0, 0.05, 0.44)
    form = head.union(snout, k=0.12).union(body, k=0.16)
    for sx in (-1, 1):
        leg = capsule((0.15 * sx, 0.0, 0.1), (0.15 * sx, 0.03, 0.3), 0.105)
        foot = at(ellipsoid((0.11, 0.15, 0.07)), 0.15 * sx, -0.05, 0.065)
        arm = capsule((0.25 * sx, -0.06, 0.58), (0.31 * sx, -0.2, 0.46), 0.062)
        form = form.union(leg.union(foot, k=0.06), k=0.08).union(arm, k=0.06)
    pts = [(0, 0.24, 0.3), (0, 0.48, 0.2), (0, 0.68, 0.18), (0.04, 0.84, 0.25)]
    radii = [0.15, 0.11, 0.075, 0.05]
    for (a, b), r in zip(zip(pts, pts[1:]), radii):
        form = form.union(capsule(a, b, r), k=0.08)
    return form


def axolotl():
    """C: an axolotl, standing up as a little helper: a wide, flat, smiling head on a small soft body, stubby
    arms and feet, and a fin of a tail behind. Its frilly gills are tile triangles."""
    head = at(ellipsoid((0.43, 0.33, 0.29)), 0, -0.06, 0.74)
    body = at(ellipsoid((0.25, 0.23, 0.27)), 0, 0.03, 0.33)
    form = head.union(body, k=0.15)
    for sx in (-1, 1):
        arm = capsule((0.22 * sx, -0.06, 0.42), (0.3 * sx, -0.16, 0.32), 0.055)
        hand = sphere(0.06, (0.3 * sx, -0.17, 0.31))
        foot = at(ellipsoid((0.09, 0.12, 0.06)), 0.13 * sx, -0.06, 0.06)
        leg = capsule((0.13 * sx, 0.0, 0.08), (0.13 * sx, 0.02, 0.22), 0.07)
        form = form.union(arm.union(hand, k=0.04), k=0.06).union(leg.union(foot, k=0.05), k=0.06)
    # a short, flat fin of a tail, curving up a little at its tip
    tail = capsule((0, 0.16, 0.2), (0, 0.4, 0.25), 0.11).scale((0.45, 1, 1.0))
    return form.union(tail, k=0.12)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, make in (("snail", snail), ("dino", dino), ("axolotl", axolotl)):
        make().save(str(OUT / f"{name}.stl"), step=STEP, verbose=False)
        print("saved", OUT / f"{name}.stl")
