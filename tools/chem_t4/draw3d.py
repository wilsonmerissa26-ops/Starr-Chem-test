"""Newman projections and chair cyclohexanes as SVG, for the structures lesson.

Chairs are drawn from real 3D chair coordinates (alternating up/down ring carbons) projected with a small tilt,
so axial bonds come out exactly vertical and equatorial bonds roughly parallel to ring bonds, as in Klein.
"""
import math
from depict import text_el, wrap, INK

def _line(a, b, w=2.2, color=INK):
    return '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="%.1f" stroke-linecap="round"/>' % (a[0], a[1], b[0], b[1], color, w)

def newman(front, back, back_offset=60, caption=None, rotate=0, highlight=None):
    """front/back: three labels each ('' = H drawn as H). back_offset 60 = staggered, 0 = eclipsed (drawn 8 degrees apart)."""
    cx, cy, R, L = 110, 100, 34, 64
    parts = ['<circle cx="%d" cy="%d" r="%d" fill="#fff" stroke="%s" stroke-width="2.2"/>' % (cx, cy, R, INK)]
    def pos(ang, r):
        a = math.radians(ang)
        return (cx + r * math.cos(a), cy - r * math.sin(a))
    off = back_offset if back_offset else 20
    for i, lab in enumerate(back):
        ang = 90 + rotate + off + 120 * i
        parts.append(_line(pos(ang, R), pos(ang, L)))
        parts.append(text_el(*pos(ang, L + 15), s=lab or "H", size=16, color="#b23a7a" if highlight and lab in highlight else INK))
    for i, lab in enumerate(front):
        ang = 90 + rotate + 120 * i
        parts.append(_line((cx, cy), pos(ang, L)))
        parts.append(text_el(*pos(ang, L + 15), s=lab or "H", size=16, color="#b23a7a" if highlight and lab in highlight else INK))
    W, H = 220, 200
    if caption:
        H += 22; parts.append(text_el(W / 2, H - 13, caption, size=14, weight="500", color="#6c6179"))
    return wrap(parts, W, H)

def chair(subs, caption=None, flip=False, numbers=False):
    """subs: {carbon 1..6: {"ax": label, "eq": label}}; unlisted positions are H and not drawn.
    flip=True draws the other chair (the ring-flipped conformer): the same carbon numbering, mirror shape."""
    R, h = 1.0, 0.30
    pts3, ax3, eq3 = [], [], []
    for k in range(6):
        th = math.radians(60 * k)
        z = h if k % 2 == 0 else -h
        if flip: z = -z
        pts3.append((R * math.cos(th), R * math.sin(th), z))
        s = 1 if z > 0 else -1
        ax3.append((0, 0, s * 1.0))
        eq3.append((math.cos(th) * 0.95, math.sin(th) * 0.95, -s * 0.32))
    beta = math.radians(22)
    def proj(p):
        x, y, z = p
        return (x, -(z * math.cos(beta) + y * math.sin(beta)))
    S, ox, oy = 62, 150, 105
    def P(p): q = proj(p); return (ox + q[0] * S, oy + q[1] * S)
    parts = []
    ring = [P(p) for p in pts3]
    order = [0, 1, 2, 3, 4, 5]
    for k in range(6):
        parts.append(_line(ring[k], ring[(k + 1) % 6], 2.4))
    for c, d in subs.items():
        k = (c - 1) % 6
        p = pts3[k]
        for kind, vec in (("ax", ax3[k]), ("eq", eq3[k])):
            lab = d.get(kind)
            if not lab: continue
            end3 = (p[0] + vec[0], p[1] + vec[1], p[2] + vec[2])
            a, b = P(p), P(end3)
            parts.append(_line(a, b, 2.0))
            dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1
            parts.append(text_el(b[0] + dx / L * 14, b[1] + dy / L * 12, s=lab, size=15))
    if numbers:
        for k in range(6):
            x, y = ring[k]
            parts.append(text_el(x + (12 if k in (0, 5) else -12 if k in (2, 3) else 0), y + (14 if pts3[k][2] < 0 else -12), s="C%d" % (k + 1), size=11, color="#8a7d99"))
    W, H = 300, 210
    if caption:
        H += 22; parts.append(text_el(W / 2, H - 13, caption, size=14, weight="500", color="#6c6179"))
    return wrap(parts, W, H)
