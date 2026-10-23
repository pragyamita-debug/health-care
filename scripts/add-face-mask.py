"""
Draws a surgical face mask over the doctor's nose, mouth and chin in the hero photo.

    python3 scripts/add-face-mask.py <unmasked-photo.jpg> <output.jpg>

The mask is modelled as a height field (a soft dome lifted over the nose, with folded
pleats), lit from the window on the left, then given non-woven texture, stitched hems,
contact shadows and an elastic ear loop, and finally softened to match the photo.
Coordinates are for the 860x1838 doctor photo. Needs opencv-python and numpy.
"""
import cv2, numpy as np, sys

SRC, OUT = sys.argv[1], sys.argv[2]
img = cv2.imread(SRC).astype(np.float32)
H, W = img.shape[:2]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)


def bez(p0, c, p1, n=120):
    t = np.linspace(0, 1, n)[:, None]
    return (1 - t) ** 2 * np.array(p0, np.float32) + 2 * (1 - t) * t * np.array(c, np.float32) + t ** 2 * np.array(p1, np.float32)


def bez3(p0, c0, c1, p1, n=120):
    t = np.linspace(0, 1, n)[:, None]
    p0, c0, c1, p1 = (np.array(p, np.float32) for p in (p0, c0, c1, p1))
    return (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * c0 + 3 * (1 - t) * t ** 2 * c1 + t ** 3 * p1


# ---------------- outline ----------------
# three-quarter view, head tilted down-left. Top edge peaks over the nose bridge,
# sags slightly across the cheek; bottom wraps under the chin and along the jaw.
TL, TR = (482, 768), (646, 716)
BL, BR = (502, 880), (650, 844)
top = bez3(TL, (494, 752), (560, 728), TR)
bottom = bez3(BL, (548, 906), (618, 884), BR)
left = bez3(TL, (452, 790), (458, 850), BL)       # spans from the nose tip to the chin
right = bez3(TR, (662, 750), (664, 812), BR)
poly = np.vstack([top, right, bottom[::-1], left[::-1]]).astype(np.int32)

inside = np.zeros((H, W), np.uint8)
cv2.fillPoly(inside, [poly], 1, cv2.LINE_AA)
dist = cv2.distanceTransform(inside, cv2.DIST_L2, 5)

# ---------------- height field ----------------
# rounded dome: steep near the edges, flat in the middle
h = np.sqrt(np.clip(dist / 26.0, 0, 1)) * 10.0
# the nose pushes the fabric out on the profile side
h += 9.0 * np.exp(-(((xx - 500) / 26) ** 2 + ((yy - 790) / 34) ** 2))
# the cheek side turns away from the camera
h -= 4.0 * np.clip((xx - 560) / 90, 0, 1)

# pleats: three folds that bunch together towards the ear loop
pleat_lines = []
for f, depth in ((0.27, 1.9), (0.50, 2.2), (0.73, 1.8)):
    t = np.linspace(0.0, 1.0, 120)
    tp = bez3(TL, (494, 752), (560, 728), TR)
    bp = bez3(BL, (548, 906), (618, 884), BR)
    # folds sit closer together near the ear (fabric gathered by the loop)
    ff = f + (0.5 - f) * 0.28 * t[:, None]
    line = tp + (bp - tp) * ff
    line[:, 1] += 2.5 * np.sin(t * np.pi * 2.3 + f * 7)  # a little irregular, like real cloth
    pleat_lines.append(line)
    m = np.zeros((H, W), np.uint8)
    cv2.polylines(m, [line.astype(np.int32)], False, 1, 1, cv2.LINE_AA)
    d = cv2.distanceTransform(1 - m, cv2.DIST_L2, 5)
    # asymmetric fold: sharp drop just below the crease, gentle slope above
    below = (yy > np.interp(xx, line[:, 0], line[:, 1])).astype(np.float32)
    fold = np.where(below > 0, np.exp(-(d / 3.0) ** 2), np.exp(-(d / 9.0) ** 2))
    h += depth * fold * (inside > 0)

h = cv2.GaussianBlur(h, (0, 0), 1.2)

# ---------------- lighting ----------------
gx = cv2.Sobel(h, cv2.CV_32F, 1, 0, ksize=3) / 8.0
gy = cv2.Sobel(h, cv2.CV_32F, 0, 1, ksize=3) / 8.0
n = np.dstack([-gx, -gy, np.ones_like(h)])
n /= np.linalg.norm(n, axis=2, keepdims=True)
L = np.array([-0.55, -0.55, 0.63], np.float32)   # window light: from the left, slightly above
L /= np.linalg.norm(L)
lambert = np.clip((n * L).sum(axis=2), 0, 1)
V = np.array([0, 0, 1], np.float32)
Hh = (L + V) / np.linalg.norm(L + V)
spec = np.clip((n * Hh).sum(axis=2), 0, 1) ** 40   # soft sheen of non-woven fabric

ao = 1 - 0.12 * np.exp(-dist / 5.0)              # edges tuck in against the face
shade = (0.68 + 0.40 * lambert) * ao

# surgical blue, a touch cooler where it faces the window, warmer near the chin (skin bounce)
blue = np.array([240, 204, 146], np.float32)     # BGR
warm = np.array([228, 204, 160], np.float32)
mix = np.clip((yy - 800) / 90, 0, 1)[..., None] * 0.2
color = blue * (1 - mix) + warm * mix
fabric = color * shade[..., None] + 22 * spec[..., None]

# non-woven texture: fine speckle + faint fibrous streaks
rng = np.random.default_rng(7)
speck = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 0.6)
streak = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), sigmaX=4, sigmaY=0.8)
fabric += (2.6 * speck + 1.8 * streak)[..., None]

# ---------------- hems: stitched binding along the sides and top ----------------
hem = np.zeros((H, W), np.float32)
cv2.polylines(hem, [right.astype(np.int32)], False, 1.0, 14, cv2.LINE_AA)
cv2.polylines(hem, [left.astype(np.int32)], False, 1.0, 6, cv2.LINE_AA)
hem = cv2.GaussianBlur(hem, (0, 0), 1.0) * (inside > 0)
fabric *= (1 - 0.07 * hem)[..., None]
stitch = np.zeros((H, W), np.float32)
for edge, off in ((right, -7), (left, 3)):
    pts = edge.copy()
    pts[:, 0] += off
    for i in range(4, len(pts) - 4, 5):
        cv2.line(stitch, tuple(pts[i].astype(int)), tuple(pts[i + 2].astype(int)), 1.0, 1, cv2.LINE_AA)
stitch = cv2.GaussianBlur(stitch, (0, 0), 0.6) * (inside > 0)
fabric *= (1 - 0.12 * stitch)[..., None]

# nose wire: a slight crease and highlight just under the top edge
wire = np.zeros((H, W), np.float32)
cv2.polylines(wire, [(top[8:70] + np.array([1, 8])).astype(np.int32)], False, 1.0, 2, cv2.LINE_AA)
wire = cv2.GaussianBlur(wire, (0, 0), 1.0)
fabric = fabric * (1 - 0.10 * wire)[..., None]
rim = np.exp(-dist / 1.6) * (inside > 0) * np.clip((560 - xx) / 80, 0, 1)
fabric += (16 * rim)[..., None]                   # window light catching the near edge

# ---------------- shadows the mask casts on the face ----------------
shadow = np.zeros((H, W), np.float32)
cv2.fillPoly(shadow, [poly + np.array([7, 9])], 1.0, cv2.LINE_AA)
shadow = cv2.GaussianBlur(shadow, (0, 0), 7) * (1 - inside)
contact = np.zeros((H, W), np.float32)
cv2.polylines(contact, [top.astype(np.int32) + np.array([0, -2])], False, 1.0, 3, cv2.LINE_AA)
contact = cv2.GaussianBlur(contact, (0, 0), 2.5) * (1 - inside)
img *= (1 - 0.38 * shadow - 0.25 * contact)[..., None]

# ---------------- composite ----------------
alpha = cv2.GaussianBlur(inside.astype(np.float32), (0, 0), 0.9)[..., None]
out = img * (1 - alpha) + fabric * alpha

# ---------------- elastic ear loop ----------------
loop = np.zeros((H, W), np.float32)
upper = bez((646, 724), (660, 700), (674, 693), 60)
lower = bez((652, 834), (694, 786), (681, 706), 80)
cv2.polylines(loop, [upper.astype(np.int32)], False, 1.0, 2, cv2.LINE_AA)
cv2.polylines(loop, [lower.astype(np.int32)], False, 1.0, 2, cv2.LINE_AA)
loop = cv2.GaussianBlur(loop, (0, 0), 0.7)
# hair falls over part of the loop near the ear
hair = (cv2.cvtColor(np.clip(img, 0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY) < 70).astype(np.float32)
loop *= 1 - 0.8 * cv2.GaussianBlur(hair, (0, 0), 1) * (yy < 760)
loop_shadow = cv2.GaussianBlur(np.roll(loop, (3, 2), axis=(0, 1)), (0, 0), 1.6)
out *= (1 - 0.25 * loop_shadow)[..., None]
loop_col = np.array([226, 222, 218], np.float32) * (0.78 + 0.22 * np.clip((700 - xx) / 60 + 1, 0, 1))[..., None]
out = out * (1 - 0.9 * loop[..., None]) + loop_col * 0.9 * loop[..., None]

# ---------------- match the photo: softness and grain ----------------
region = cv2.dilate(inside, np.ones((25, 25), np.uint8)).astype(np.float32)
region = cv2.GaussianBlur(region, (0, 0), 6)[..., None]
soft = cv2.GaussianBlur(out, (0, 0), 0.75)
grain = rng.normal(0, 2.2, (H, W, 1)).astype(np.float32)
out = out * (1 - region) + (soft + grain) * region

cv2.imwrite(OUT, np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])
print('ok')
