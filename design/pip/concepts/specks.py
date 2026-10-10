"""Clean-up of a baked colour atlas (5.3.5d): small flecks of a different colour on a plain body (the snail's orange
and pink specks on green) are filled from their surroundings. Only colour flecks are touched, never light or dark
ones: the eyes' catch-lights and the dino's nostrils are small light and dark features that belong. A fleck is a blob
of up to `area` pixels, inside an island, on the body colour, whose colour (Lab a*b*) is far from the median around it. Writes a
before/after mask for looking at.
With `dark=N` it also fills dark marks of up to N pixels on the body (the snail's blotch on its foot); only for a
character with no small dark features on its body (the dino's nostrils would go).
python specks.py <in.png> <out.png> [area=60] [chroma=18] [dark=0]   (needs pillow, scipy, scikit-image)"""
import sys

import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.color import rgb2lab

src, out = sys.argv[1], sys.argv[2]
area = int(sys.argv[3]) if len(sys.argv) > 3 else 60
limit = float(sys.argv[4]) if len(sys.argv) > 4 else 18.0
dark = int(sys.argv[5]) if len(sys.argv) > 5 else 0
rgb = np.asarray(Image.open(src).convert("RGB")).astype(np.float32) / 255
inside = ndimage.binary_erosion(rgb.max(-1) > 0.02, iterations=3)
med = np.stack([ndimage.median_filter(rgb[..., c], size=13) for c in range(3)], -1)
lab, mlab = rgb2lab(rgb), rgb2lab(med)
chroma = np.hypot(lab[..., 1] - mlab[..., 1], lab[..., 2] - mlab[..., 2])
# the surroundings must be the character's body colour (the atlas's most common colour): not an eye, a highlight,
# or the edge between two coloured pieces (the plates, the shell's tiles), which must stay
pts = mlab[inside]
q = np.round(pts / 6).astype(int)
keys, counts = np.unique(q, axis=0, return_counts=True)
skin = pts[(q == keys[counts.argmax()]).all(-1)].mean(0)
# body colour all round, a few pixels each way: the rim of a coloured piece next to the body is not a fleck
body = ndimage.binary_erosion(np.linalg.norm(mlab - skin, axis=-1) < 14, iterations=5)
cand = (chroma > limit) & inside & body
labels, n = ndimage.label(cand)
sizes = ndimage.sum(cand, labels, range(1, n + 1))
small = np.isin(labels, np.flatnonzero(sizes <= area) + 1)
if dark:
    # judged against a wide window: a mark the bake missed can be bigger than the fleck window
    wide = np.stack([ndimage.median_filter(rgb[..., c], size=41) for c in range(3)], -1)
    wlab = rgb2lab(wide)
    wbody = ndimage.binary_erosion(np.linalg.norm(wlab - skin, axis=-1) < 14, iterations=2)
    dcand = (wlab[..., 0] - lab[..., 0] > 12) & inside & wbody
    dl, dn = ndimage.label(dcand)
    dsizes = ndimage.sum(dcand, dl, range(1, dn + 1))
    dmask = np.isin(dl, np.flatnonzero(dsizes <= dark) + 1)
    small |= dmask
    med[dmask] = wide[dmask]
    print(f"SPECKS dark marks: {int((dsizes <= dark).sum())}")
small = ndimage.binary_dilation(small, iterations=1) & inside
res = rgb.copy()
res[small] = med[small]
Image.fromarray((res * 255).round().astype(np.uint8)).save(out)
mask = np.zeros_like(rgb)
mask[small] = (1, 0, 1)
Image.fromarray((np.clip(rgb * 0.4 + mask, 0, 1) * 255).astype(np.uint8)).save(out.replace(".png", "-mask.png"))
print(f"SPECKS {src.rsplit('/', 1)[-1]}: {int((sizes <= area).sum())} flecks, {int(small.sum())} px filled")
