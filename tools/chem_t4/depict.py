"""Small skeletal-structure renderer for the CHM 221 Test 4 lessons (no RDKit needed).

Input is a SMILES-like string. Supported: organic atoms (B C N O F Cl Br I), bracket atoms with H count and
charge ([OH2+], [C+], [Br-], [H]), bonds - = #, branches, ring closures (one main ring, plus a fused
three-membered ring such as an epoxide or bromonium ion), and three annotations written after an atom:
  <w> / <d>   the bond from the previous atom to this one is drawn as a wedge / dash (narrow end at the previous atom)
  {name}      tag the atom so drawings can place arrows, lone pairs and tap targets on it
  ^           the chain turns the same way twice here (draws a cis / Z arrangement)
Every structure also reports its molecular formula, which build_items.py uses to check each answer.
"""
import math, re

L = 40.0          # bond length in px
FONT = "-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif"
VAL = {"C": 4, "N": 3, "O": 2, "B": 3, "F": 1, "Cl": 1, "Br": 1, "I": 1, "H": 1, "S": 2}
INK = "#23172f"

TOKEN = re.compile(r"\[[^\]]+\]|Br|Cl|[BCNOFIS]|[=#\-]|\(|\)|\d|<w>|<d>|\{[A-Za-z0-9_]+\}|\^|\.")


class Atom:
    def __init__(self, el, hcount=None, charge=0):
        self.el, self.h_explicit, self.charge = el, hcount, charge
        self.name, self.z, self.x, self.y = None, False, None, None
        self.lp = 0          # lone pairs to draw
        self.show = None     # label override

def parse(smi):
    atoms, bonds = [], []   # bonds: [a, b, order, style]
    stack, prev, order, ring_open, frag = [], None, 1, {}, 0
    frags = []
    for tok in TOKEN.findall(smi):
        if tok == ".":
            prev, order = None, 1; continue
        if tok in "=#-":
            order = {"-": 1, "=": 2, "#": 3}[tok]; continue
        if tok == "(":
            stack.append(prev); continue
        if tok == ")":
            prev = stack.pop(); continue
        if tok in ("<w>", "<d>"):
            bonds[-1][3] = "wedge" if tok == "<w>" else "dash"; continue
        if tok.startswith("{"):
            atoms[prev].name = tok[1:-1]; continue
        if tok == "^":
            atoms[prev].z = True; continue
        if tok.isdigit():
            if tok in ring_open:
                a, o = ring_open.pop(tok)
                bonds.append([a, prev, max(o, order), "plain"])
            else:
                ring_open[tok] = (prev, order)
            order = 1; continue
        if tok.startswith("["):
            m = re.match(r"\[([A-Z][a-z]?)(H(\d?))?([+-]?)\]", tok)
            el = m.group(1)
            h = 0 if m.group(2) is None else (int(m.group(3)) if m.group(3) else 1)
            ch = {"+": 1, "-": -1, "": 0}[m.group(4)]
            a = Atom(el, h, ch)
        else:
            a = Atom(tok)
        atoms.append(a)
        i = len(atoms) - 1
        if prev is not None:
            bonds.append([prev, i, order, "plain"])
        prev, order = i, 1
    return atoms, bonds


def neighbors(n, bonds, i):
    return [b[1] if b[0] == i else b[0] for b in bonds if i in b[:2]]

def bond_order_sum(bonds, i):
    return sum(b[2] for b in bonds if i in b[:2])

def hcount(atoms, bonds, i):
    a = atoms[i]
    if a.h_explicit is not None:
        return a.h_explicit
    return max(0, VAL[a.el] - bond_order_sum(bonds, i))

def formula(atoms, bonds):
    c = {}
    for i, a in enumerate(atoms):
        c[a.el] = c.get(a.el, 0) + 1
        h = hcount(atoms, bonds, i) if a.el != "H" else 0
        if h:
            c["H"] = c.get("H", 0) + h
    out = ""
    for el in ["C", "H"] + sorted(k for k in c if k not in ("C", "H")):
        if c.get(el):
            out += el + (str(c[el]) if c[el] > 1 else "")
    charge = sum(a.charge for a in atoms)
    if charge:
        out += ("+" if charge > 0 else "-") * abs(charge)
    return out


# ---------------- layout ----------------
def cycles(atoms, bonds):
    """Return simple cycles found from ring-closure edges (shortest path + the edge)."""
    n = len(atoms)
    adj = {i: set() for i in range(n)}
    for b in bonds:
        adj[b[0]].add(b[1]); adj[b[1]].add(b[0])
    found = []
    seen_sets = []
    for b in bonds:
        a, c = b[0], b[1]
        # shortest path a->c without the direct edge
        prev = {a: None}; q = [a]
        while q:
            u = q.pop(0)
            for v in adj[u]:
                if (u == a and v == c) or v in prev:
                    continue
                prev[v] = u; q.append(v)
        if c in prev:
            path = [c]
            while path[-1] != a:
                path.append(prev[path[-1]])
            s = frozenset(path)
            if len(path) >= 3 and s not in seen_sets:
                seen_sets.append(s); found.append(path[::-1])
    # keep only cycles not decomposable (drop cycles that are the union of two smaller ones)
    found.sort(key=len)
    keep = []
    for cyc in found:
        if any(set(k) < set(cyc) for k in keep) and len(cyc) > 6 and False:
            continue
        keep.append(cyc)
    # remove large cycles that contain a 3-ring's apex (the envelope around a fused 3-ring)
    small = [c for c in keep if len(c) == 3]
    out = []
    for cyc in keep:
        if len(cyc) > 3 and any(len(set(cyc) & set(s)) == 3 for s in small):
            continue
        out.append(cyc)
    return out


def layout(atoms, bonds):
    n = len(atoms)
    pos = {}
    adj = {i: [] for i in range(n)}
    for b in bonds:
        adj[b[0]].append(b[1]); adj[b[1]].append(b[0])
    cyc = cycles(atoms, bonds)
    main = max(cyc, key=len) if cyc else None
    turn = {}
    indir = {}
    order_of = {}
    for b in bonds:
        order_of[(b[0], b[1])] = order_of[(b[1], b[0])] = b[2]

    def is_sp(i):
        os_ = [order_of[(i, j)] for j in adj[i]]
        return 3 in os_ or os_.count(2) >= 2

    queue = []
    if main is not None:
        k = len(main)
        R = 1 / (2 * math.sin(math.pi / k))
        start = 90 if k != 4 else 45
        if k == 3:
            start = 90
        for idx, ai in enumerate(main):
            ang = math.radians(start - idx * 360.0 / k)
            pos[ai] = (R * math.cos(ang), R * math.sin(ang))
        for c in cyc:
            if c is main or len(c) != 3:
                continue
            shared = [x for x in c if x in pos]
            apex = [x for x in c if x not in pos]
            if len(shared) == 2 and len(apex) == 1:
                (x1, y1), (x2, y2) = pos[shared[0]], pos[shared[1]]
                mx, my = (x1 + x2) / 2, (y1 + y2) / 2
                L0 = math.hypot(mx, my) or 1
                pos[apex[0]] = (mx + mx / L0 * 0.87, my + my / L0 * 0.87)
        ring_atoms = set(x for c in cyc for x in c)
        cx = sum(pos[i][0] for i in main) / len(main); cy = sum(pos[i][1] for i in main) / len(main)
        for i in list(pos):
            queue.append(i)
        def ring_dirs(i, kids):
            x, y = pos[i]
            base = math.degrees(math.atan2(y - cy, x - cx))
            if len(kids) == 1:
                return [base]
            if len(kids) == 2:
                spread = 60 if len(main) == 3 else 35
                return [base + spread, base - spread]
            return [base + 60, base, base - 60]
    else:
        pos[0] = (0.0, 0.0)
        queue.append(0)
        ring_atoms = set()

    placed = set(pos)
    while queue:
        i = queue.pop(0)
        kids = [j for j in adj[i] if j not in placed]
        if not kids:
            continue
        if i in ring_atoms:
            dirs = ring_dirs(i, kids)
            for j, d in zip(kids, dirs):
                indir[j] = d; turn[j] = 1
        elif i not in indir:  # acyclic root
            k = len(kids)
            dirs = {1: [30], 2: [30, 210], 3: [30, 150, 270], 4: [45, 135, 225, 315]}[k]
            for j, d in zip(kids, dirs):
                indir[j] = d; turn[j] = -1 if d == 30 else 1
        else:
            d = indir[i]; s = turn[i]
            k = len(kids)
            if is_sp(i):
                dirs = [d] * k
                ts = [s] * k
            elif k == 1:
                dirs = [d + 60 * s]; ts = [s if atoms[i].z else -s]
            elif k == 2:
                # the last child continues the chain (SMILES writes branches first)
                dirs = [d - 60 * s, d + 60 * s]; ts = [s, -s]
            elif k >= 4:
                # only used to draw an impossible five-bond carbon for a find-the-error problem
                dirs = [d + 108, d - 108, d - 36, d + 36][:k]; ts = [s] * k
            else:
                # two branches spread around the open side, the last child continues the zigzag
                cont = d + 60 * s
                bx = math.cos(math.radians(d + 180)) + math.cos(math.radians(cont))
                by = math.sin(math.radians(d + 180)) + math.sin(math.radians(cont))
                open_ = math.degrees(math.atan2(-by, -bx))
                dirs = [open_ + 35, open_ - 35, cont]; ts = [s, s, -s]
            for j, dd, tt in zip(kids, dirs, ts):
                indir[j] = dd; turn[j] = tt
                if atoms[i].z and k == 1:
                    turn[j] = s
        for j in kids:
            x, y = pos[i]
            a = math.radians(indir[j])
            pos[j] = (x + math.cos(a), y + math.sin(a))
            placed.add(j)
            queue.append(j)
    for i, a in enumerate(atoms):
        a.x, a.y = pos[i]
    return cyc


# ---------------- drawing ----------------
def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def label_for(atoms, bonds, i):
    a = atoms[i]
    if a.show is not None:
        return a.show
    if a.el == "C" and a.charge == 0 and not (a.h_explicit is not None and False):
        return ""
    if a.el == "C":
        return ""
    h = hcount(atoms, bonds, i) if a.el != "H" else 0
    base = a.el
    if h:
        hs = "H" + (str(h) if h > 1 else "")
        nb = neighbors(len(atoms), bonds, i)
        right_side = nb and all(atoms[j].x > a.x + 0.15 for j in nb)
        base = (hs + a.el) if right_side and len(nb) == 1 else (a.el + hs)
    return base

def text_el(x, y, s, size=17, color=INK, weight="600", anchor="middle"):
    out, prev = [], ""
    for ch in s:
        if ch.isdigit() and prev.isalpha():
            out.append('<tspan font-size="%d" dy="4">%s</tspan><tspan dy="-4"></tspan>' % (size - 5, ch))
        else:
            out.append(esc(ch))
        prev = ch
    return '<text x="%.1f" y="%.1f" font-family="%s" font-size="%d" font-weight="%s" fill="%s" text-anchor="%s" dominant-baseline="central">%s</text>' % (
        x, y, FONT, size, weight, color, anchor, "".join(out))

def vis_len(s):
    n, prev = 0, ""
    for ch in s:
        n += 0.6 if ch.isdigit() and prev.isalpha() else 1
        prev = ch
    return n


class Depiction:
    """A laid-out structure (or several fragments) with helpers for arrows and tap targets."""
    def __init__(self, smi, lone_pairs=None, scale=L, show=None, rotate=0):
        self.smi = smi
        self.atoms, self.bonds = parse(smi)
        # split fragments by connectivity
        n = len(self.atoms)
        comp, cid = [-1] * n, 0
        for s in range(n):
            if comp[s] >= 0:
                continue
            st = [s]; comp[s] = cid
            while st:
                u = st.pop()
                for v in neighbors(n, self.bonds, u):
                    if comp[v] < 0:
                        comp[v] = cid; st.append(v)
            cid += 1
        self.frags = []
        for c in range(cid):
            idx = [i for i in range(n) if comp[i] == c]
            remap = {old: k for k, old in enumerate(idx)}
            atoms = [self.atoms[i] for i in idx]
            bonds = [[remap[b[0]], remap[b[1]], b[2], b[3]] for b in self.bonds if comp[b[0]] == c]
            layout(atoms, bonds)
            if rotate:
                r = math.radians(rotate)
                for a in atoms:
                    a.x, a.y = a.x * math.cos(r) - a.y * math.sin(r), a.x * math.sin(r) + a.y * math.cos(r)
            self.frags.append((idx, atoms, bonds))
        for name, k in (lone_pairs or {}).items():
            self.atom(name).lp = k
        for name, s in (show or {}).items():
            self.atom(name).show = s
        self.scale = scale

    def atom(self, name):
        for a in self.atoms:
            if a.name == name:
                return a
        raise KeyError(name)

    def formula(self):
        return ".".join(formula(a, b) for _, a, b in self.frags)

    def total_formula(self):
        c = {}
        for _, atoms, bonds in self.frags:
            for i, a in enumerate(atoms):
                c[a.el] = c.get(a.el, 0) + 1
                h = hcount(atoms, bonds, i) if a.el != "H" else 0
                c["H"] = c.get("H", 0) + h
        return c

    def render(self, ox=0, oy=0, gap=1.6, plus=True):
        """Return (svg_parts, width, height, anchors). anchors maps names to px points."""
        parts, anchors = [], {}
        allpts = []
        x_cursor = 0.0
        s = self.scale
        placed = []
        for fi, (idx, atoms, bonds) in enumerate(self.frags):
            xs = [a.x for a in atoms]; ys = [a.y for a in atoms]
            minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
            dx = x_cursor - minx
            placed.append((atoms, bonds, dx, minx, maxx, miny, maxy))
            x_cursor += (maxx - minx) + gap
            if plus and fi < len(self.frags) - 1:
                x_cursor += 0.6
        all_miny = min(p[5] for p in placed); all_maxy = max(p[6] for p in placed)
        pad = 0.75
        W = (x_cursor - gap + 2 * pad) * s
        H = (all_maxy - all_miny + 2 * pad) * s
        def P(atoms_dx, x, y):
            return (ox + (x + atoms_dx + pad) * s, oy + (all_maxy - y + pad) * s)
        for fi, (atoms, bonds, dx, minx, maxx, miny, maxy) in enumerate(placed):
            pts = [P(dx, a.x, a.y) for a in atoms]
            allpts.extend(pts)
            labels = [label_for(atoms, bonds, i) for i in range(len(atoms))]
            cxm = sum(p[0] for p in pts) / len(pts); cym = sum(p[1] for p in pts) / len(pts)
            for a_i, b_i, order, style in bonds:
                A, B = pts[a_i], pts[b_i]
                A2, B2 = clip(A, B, labels[a_i]), clip(B, A, labels[b_i])
                parts += bond_svg(A2, B2, order, style, atoms, bonds, pts, a_i, b_i, (cxm, cym))
            for i, a in enumerate(atoms):
                X, Y = pts[i]
                lab = labels[i]
                if lab:
                    w = 5.2 * vis_len(lab) + 6
                    parts.append('<rect x="%.1f" y="%.1f" width="%.1f" height="22" rx="6" fill="#fff"/>' % (X - w - 0.5 if False else X - w / 2 - 1, Y - 11, w + 2))
                    parts.append(text_el(X, Y, lab))
                if a.charge:
                    sym = "+" if a.charge > 0 else "−"
                    d = free_angle(atoms, bonds, i, prefer=45)
                    r = 14 if lab else 12
                    if lab:
                        cx_, cy_ = X + 5.2 * vis_len(lab) / 2 + 10, Y - 13
                    else:
                        cx_, cy_ = X + r * math.cos(math.radians(d)), Y - r * math.sin(math.radians(d))
                    parts.append('<circle cx="%.1f" cy="%.1f" r="8" fill="#fff" stroke="%s" stroke-width="1.3"/>' % (cx_, cy_, INK))
                    parts.append(text_el(cx_, cy_ - 0.5, sym, size=14, weight="700"))
                if a.lp:
                    angs = lp_angles(atoms, bonds, i, a.lp, has_charge=bool(a.charge))
                    for k, ang in enumerate(angs):
                        rr = 15 if lab else 12
                        cx_, cy_ = X + rr * math.cos(math.radians(ang)), Y - rr * math.sin(math.radians(ang))
                        px, py = -math.sin(math.radians(ang)) * 3.6, -math.cos(math.radians(ang)) * 3.6
                        parts.append('<circle cx="%.1f" cy="%.1f" r="2" fill="%s"/>' % (cx_ + px, cy_ + py, INK))
                        parts.append('<circle cx="%.1f" cy="%.1f" r="2" fill="%s"/>' % (cx_ - px, cy_ - py, INK))
                        if a.name:
                            anchors[a.name + ".lp" + str(k + 1)] = (cx_, cy_)
                if a.name:
                    anchors[a.name] = (X, Y)
            # bond midpoints for tagged pairs
            for a_i, b_i, order, style in bonds:
                na, nb_ = atoms[a_i].name, atoms[b_i].name
                if na and nb_:
                    A, B = pts[a_i], pts[b_i]
                    anchors[na + "-" + nb_] = anchors[nb_ + "-" + na] = ((A[0] + B[0]) / 2, (A[1] + B[1]) / 2)
            if plus and fi < len(placed) - 1:
                xr = P(dx, maxx, 0)[0] + (gap + 0.6) * s / 2
                parts.append(text_el(xr, oy + (all_maxy - (all_maxy + all_miny) / 2 + pad) * s, "+", size=22))
        allp = allpts or [(W / 2, H / 2)]
        anchors['__center'] = (sum(p[0] for p in allp) / len(allp), sum(p[1] for p in allp) / len(allp))
        return parts, W, H, anchors

    def svg(self, arrows=None, caption=None, extra=None):
        parts, W, H, anchors = self.render()
        top = 0
        if arrows:
            parts += arrows_svg(arrows, anchors)
        if caption:
            need = 7.4 * len(caption) + 16
            if need > W:
                shift = (need - W) / 2
                parts = ['<g transform="translate(%.1f,0)">' % shift] + parts + ['</g>']
                W = need
            H += 22
            parts.append(text_el(W / 2, H - 13, caption, size=14, weight="500", color="#6c6179"))
        return wrap(parts, W, H), anchors, (W, H)


def wrap(parts, W, H):
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d" role="img">%s</svg>' % (
        math.ceil(W), math.ceil(H), math.ceil(W), math.ceil(H), "".join(parts))

def clip(p, q, label):
    if not label:
        return p
    hw, hh = 5.2 * vis_len(label) / 2 + 3, 11
    dx, dy = q[0] - p[0], q[1] - p[1]
    t = min(hw / abs(dx) if dx else 1e9, hh / abs(dy) if dy else 1e9)
    t = min(t, 0.45)
    return (p[0] + dx * t, p[1] + dy * t)

def line(a, b, w=2.2):
    return '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="%.1f" stroke-linecap="round"/>' % (a[0], a[1], b[0], b[1], INK, w)

def bond_svg(A, B, order, style, atoms, bonds, pts, ai, bi, centroid):
    dx, dy = B[0] - A[0], B[1] - A[1]
    d = math.hypot(dx, dy) or 1
    nx, ny = -dy / d, dx / d
    out = []
    if style == "wedge":
        w = 5.5
        out.append('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="%s"/>' % (A[0], A[1], B[0] + nx * w, B[1] + ny * w, B[0] - nx * w, B[1] - ny * w, INK))
        return out
    if style == "dash":
        k = 7
        for i in range(1, k + 1):
            t = i / (k + 0.3); w = 1 + 4.5 * t
            cx, cy = A[0] + dx * t, A[1] + dy * t
            out.append(line((cx + nx * w, cy + ny * w), (cx - nx * w, cy - ny * w), 1.6))
        return out
    if order == 1:
        out.append(line(A, B))
    elif order == 3:
        for o in (-5, 0, 5):
            out.append(line((A[0] + nx * o, A[1] + ny * o), (B[0] + nx * o, B[1] + ny * o)))
    else:
        # inner line toward the side holding the other neighbours (or symmetric if none)
        others = [j for j in neighbors(len(atoms), bonds, ai) if j != bi] + [j for j in neighbors(len(atoms), bonds, bi) if j != ai]
        both_have = [j for j in neighbors(len(atoms), bonds, ai) if j != bi] and [j for j in neighbors(len(atoms), bonds, bi) if j != ai]
        terminal_hetero = atoms[ai].el != "C" or atoms[bi].el != "C"
        in_ring = False
        mx, my = (A[0] + B[0]) / 2, (A[1] + B[1]) / 2
        sides = [(pts[j][0] - mx) * nx + (pts[j][1] - my) * ny for j in others]
        two_sided = any(v > 2 for v in sides) and any(v < -2 for v in sides) and not in_ring_bond(atoms, bonds, ai, bi)
        if others and not (terminal_hetero and not both_have) and not two_sided:
            sx = sum(pts[j][0] for j in others) / len(others); sy = sum(pts[j][1] for j in others) / len(others)
            sgn = 1 if (sx - mx) * nx + (sy - my) * ny > 0 else -1
            if in_ring_bond(atoms, bonds, ai, bi):
                sgn = 1 if (centroid[0] - mx) * nx + (centroid[1] - my) * ny > 0 else -1
            o = 6 * sgn; sh = 0.15
            out.append(line(A, B))
            out.append(line((A[0] + dx * sh + nx * o, A[1] + dy * sh + ny * o), (B[0] - dx * sh + nx * o, B[1] - dy * sh + ny * o)))
        else:
            for o in (-3.2, 3.2):
                out.append(line((A[0] + nx * o, A[1] + ny * o), (B[0] + nx * o, B[1] + ny * o)))
    return out

def in_ring_bond(atoms, bonds, a, b):
    """True when a and b are joined by another path too (the bond is in a ring)."""
    n = len(atoms)
    seen, st = {a}, [a]
    while st:
        u = st.pop()
        for v in neighbors(n, bonds, u):
            if (u == a and v == b) or v in seen:
                continue
            if v == b:
                return True
            seen.add(v); st.append(v)
    return False

def bond_angles(atoms, bonds, i):
    a = atoms[i]
    return [math.degrees(math.atan2(atoms[j].y - a.y, atoms[j].x - a.x)) for j in neighbors(len(atoms), bonds, i)]

def angdist(a, b):
    x = abs(a - b) % 360
    return min(x, 360 - x)

def free_angle(atoms, bonds, i, prefer=45):
    used = bond_angles(atoms, bonds, i)
    best, bestgap = prefer, -1
    for deg in range(0, 360, 15):
        gap = min([angdist(deg, u) for u in used] or [180])
        gap -= angdist(deg, prefer) * 0.05
        if gap > bestgap + 1e-9:
            best, bestgap = deg, gap
    return best

def lp_angles(atoms, bonds, i, k, has_charge=False):
    used = bond_angles(atoms, bonds, i)
    if has_charge:
        used = used + [45]
    out = []
    for _ in range(k):
        best, bestgap = 90, -1
        for deg in range(0, 360, 15):
            gap = min([angdist(deg, u) for u in used + out] or [180])
            gap -= angdist(deg, 90) * 0.01
            if gap > bestgap + 1e-9:
                best, bestgap = deg, gap
        out.append(best)
    return out

ARROW = "#b23a7a"

def bend_for(p0, p1, center, mag=None):
    d = math.hypot(p1[0] - p0[0], p1[1] - p0[1]) or 1
    mag = mag if mag is not None else (0.55 if d < 45 else 0.32)
    mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    # control point for +mag is (mx - dy*mag, my + dx*mag); bow away from the drawing's center
    c1 = (mx - dy * mag, my + dx * mag); c2 = (mx + dy * mag, my - dx * mag)
    far = math.hypot(c1[0] - center[0], c1[1] - center[1]) >= math.hypot(c2[0] - center[0], c2[1] - center[1])
    return mag if far else -mag

def arrows_svg(arrows, anchors, center=None):
    out, drawn = [], []
    for ar in arrows:
        frm, to = ar[0], ar[1]
        p0, p1 = anchors[frm], anchors[to]
        bend = bend_for(p0, p1, center) if center is not None else (ar[2] if len(ar) > 2 else 0.4)
        near = lambda a, b: math.hypot(a[0] - b[0], a[1] - b[1]) < 45
        for q0, q1, qb in drawn:
            if (near(p0, q1) and near(p1, q0)) or (near(p0, q0) and near(p1, q1)):
                bend = -qb if (near(p0, q0) and near(p1, q1)) else qb
        drawn.append((p0, p1, bend))
        out += curved(p0, p1, bend)
    return out

def curved(p0, p1, bend=0.4, color=ARROW):
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    cx, cy = (p0[0] + p1[0]) / 2 - dy * bend, (p0[1] + p1[1]) / 2 + dx * bend
    tx, ty = p1[0] - cx, p1[1] - cy; tl = math.hypot(tx, ty) or 1; tx, ty = tx / tl, ty / tl
    # stop short of the target point
    end = (p1[0] - tx * 6, p1[1] - ty * 6)
    base = (end[0] - tx * 10, end[1] - ty * 10)
    nx, ny = -ty, tx
    return ['<path d="M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f" fill="none" stroke="%s" stroke-width="2.4"/>' % (p0[0], p0[1], cx, cy, base[0], base[1], color),
            '<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="%s"/>' % (end[0], end[1], base[0] + nx * 5, base[1] + ny * 5, base[0] - nx * 5, base[1] - ny * 5, color)]


def mol_svg(smi, **kw):
    d = Depiction(smi, lone_pairs=kw.get("lp"), show=kw.get("show"), rotate=kw.get("rotate", 0))
    s, anchors, size = d.svg(arrows=kw.get("arrows"), caption=kw.get("caption"))
    return s, d, anchors, size
