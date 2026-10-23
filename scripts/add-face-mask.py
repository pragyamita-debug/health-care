"""
Draws a surgical face mask over the doctor's nose, mouth and chin in the hero photo.

    python3 scripts/add-face-mask.py <unmasked-photo.jpg> src/assets/photos/doctor.jpg

Coordinates are for the 860x1838 doctor photo. Needs opencv-python and numpy.
"""
import cv2, numpy as np, sys
SRC, OUT = sys.argv[1], sys.argv[2]
img = cv2.imread(SRC).astype(np.float32)
H, W = img.shape[:2]

def bez(p0, c, p1, n=60):
    t = np.linspace(0, 1, n)[:, None]
    return (1 - t) ** 2 * np.array(p0) + 2 * (1 - t) * t * np.array(c) + t ** 2 * np.array(p1)

# mask outline (image coords) — face is in three-quarter view, tilted down-left
L0, R0 = (484, 756), (648, 712)      # top: over the nose bridge -> towards the ear
L1, R1 = (500, 878), (650, 842)      # bottom: under the chin -> jaw
top    = bez(L0, (556, 712), R0)
bottom = bez(L1, (585, 910), R1)
left   = bez(L0, (452, 808), L1)     # bulges out over the nose
right  = bez(R0, (666, 774), R1)
poly = np.vstack([top, right, bottom[::-1], left[::-1]]).astype(np.int32)

alpha = np.zeros((H, W), np.float32)
cv2.fillPoly(alpha, [poly], 1.0)

# ---- fabric colour with soft shading ----
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
u = np.clip((xx - 450) / 230, 0, 1)            # 0 at the nose side, 1 at the ear side
v = np.clip((yy - 700) / 200, 0, 1)
base = np.array([238, 206, 164], np.float32)   # BGR light surgical blue
light = 1.06 - 0.16 * u - 0.10 * v             # window light from the left/top
# the fabric curves away under the chin and at the cheek
dist = cv2.distanceTransform((alpha > 0).astype(np.uint8), cv2.DIST_L2, 5)
edge_shade = 1 - 0.10 * np.exp(-dist / 10)
# the nose pushes the fabric out: a soft highlight ridge near the profile side
ridge = np.exp(-((xx - 512) ** 2) / (2 * 22 ** 2)) * np.exp(-((yy - 790) ** 2) / (2 * 45 ** 2))
light = light + 0.10 * ridge
fabric = base[None, None, :] * (light * edge_shade)[..., None]

# subtle weave noise so it doesn't look flat
rng = np.random.default_rng(3)
noise = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 0.7) * 3.0
fabric += noise[..., None]

# ---- pleats: three soft folds running across ----
pleat_dark = np.zeros((H, W), np.float32)
pleat_light = np.zeros((H, W), np.float32)
for f in (0.30, 0.54, 0.76):
    t = np.linspace(0.04, 0.97, 80)
    tp = bez(L0, (556, 712), R0, 80)[(t * 79).astype(int)]
    bp = bez(L1, (585, 910), R1, 80)[(t * 79).astype(int)]
    line = (tp + (bp - tp) * f).astype(np.int32)
    cv2.polylines(pleat_dark, [line], False, 1.0, 3, cv2.LINE_AA)
    cv2.polylines(pleat_light, [line + np.array([0, 4])], False, 1.0, 2, cv2.LINE_AA)
pleat_dark = cv2.GaussianBlur(pleat_dark, (0, 0), 1.6)
pleat_light = cv2.GaussianBlur(pleat_light, (0, 0), 1.4)
fabric *= (1 - 0.16 * pleat_dark)[..., None]
fabric += (22 * pleat_light)[..., None]

# ---- nose wire along the top edge ----
wire = np.zeros((H, W), np.float32)
cv2.polylines(wire, [(top[3:40] + np.array([0, 7])).astype(np.int32)], False, 1.0, 2, cv2.LINE_AA)
wire = cv2.GaussianBlur(wire, (0, 0), 1.0)
fabric *= (1 - 0.10 * wire)[..., None]

# ---- soft shadow cast on the neck/jaw under the mask ----
sh = np.zeros((H, W), np.float32)
cv2.fillPoly(sh, [poly + np.array([6, 12])], 1.0)
sh = cv2.GaussianBlur(sh, (0, 0), 9) * (1 - alpha)
img *= (1 - 0.35 * sh)[..., None]

# ---- composite with a feathered edge ----
a = cv2.GaussianBlur(alpha, (0, 0), 1.1)[..., None]
img = img * (1 - a) + fabric * a

# ---- ear loops ----
loops = np.zeros((H, W), np.float32)
cv2.polylines(loops, [bez(R0, (664, 694), (676, 690)).astype(np.int32)], False, 1.0, 3, cv2.LINE_AA)
cv2.polylines(loops, [bez(R1, (696, 800), (680, 704)).astype(np.int32)], False, 1.0, 3, cv2.LINE_AA)
loops = cv2.GaussianBlur(loops, (0, 0), 0.8)[..., None]
img = img * (1 - 0.85 * loops) + np.array([240, 236, 232], np.float32) * 0.85 * loops

cv2.imwrite(OUT, np.clip(img, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 88])
print('ok')
