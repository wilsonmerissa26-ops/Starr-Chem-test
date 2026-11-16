"""Builds student-app/lessons/chem-t4/plan.html, the Test 4 plan page, from content_plan.py, and checks its chemistry.

Checks (the build stops on any failure):
  - every molecule on the page parses;
  - no molecule is from last year's Test 4 (her Wednesday practice test), except three listed starting-material overlaps;
  - no molecule is the answer to one of the app's independent problems, except where the problem itself states it;
  - the new reactions' answers pass a formula check (starting material + change = product);
  - every figure the page uses exists, and every arrow in the new mechanism drawings ends on a real atom, bond or lone pair.
"""
import os, re, html
from depict import Depiction, wrap, arrows_svg
import content_plan as P

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
OUT = os.path.join(ROOT, "student-app", "lessons", "chem-t4", "plan.html")
FIGDIR = os.path.join(ROOT, "student-app", "lessons", "chem-t4", "plan-figs")
E = html.escape

# Last year's Test 4 molecules that may appear, and why each is not an answer to that test
ALLOW_T4 = {
    "C1=CCCCC1": "cyclohexene: starting material for Br₂ practice in Problem 3; last year's test used it with OsO₄",
    "C=C1CCCC1": "methylenecyclopentane: minor E1 product in Problem 4's practice; last year's test used it as a starting material with Br₂ and H₂O",
    "C#C": "acetylene: building block in Part 4's practice; last year's test used it in a different synthesis",
    "CC(C)O": "2-propanol: an NMR practice molecule here; last year's test used it only as the alcohol reagent in question 5a, whose answer is not on this page",
}
# App independent-problem answers that may appear, and why
ALLOW_INDEPENDENT = {
    "CCC(Br)(CC)CC": "3-bromo-3-ethylpentane: the arrows problem states this product in its question; the task there is the arrows",
}

def strip(smi):
    return re.sub(r"\{[A-Za-z0-9_]+\}|<[wd]>|\^", "", smi)

def formula_counts(f):
    c = {}
    for el, n in re.findall(r"([A-Z][a-z]?)(\d*)", f):
        c[el] = c.get(el, 0) + (int(n) if n else 1)
    return c

def check_all(BI, fail):
    keys = {}
    for sec, smi in P.MOLS:
        try: keys[(sec, smi)] = BI.canon(smi)
        except Exception as e: fail.append("plan %s: %s does not parse (%s)" % (sec, smi, e))
    t4 = {BI.canon(s): s for s in BI.EXCLUDED["fall2025-test4"]}
    allow_t4 = {BI.canon(s) for s in ALLOW_T4}
    for (sec, smi), k in keys.items():
        if k in t4 and k not in allow_t4:
            fail.append("plan %s: %s is from last year's Test 4" % (sec, smi))
    # answers to the app's independent problems
    import content_alkenes as ALK, content_alkynes as AKY, content_mechanisms as MECH, content_structures as STR
    answers = {}
    for mod in (ALK, AKY):
        for it in mod.INDEPENDENT:
            for p in it.get("products", []):
                if p["tag"] == "correct":
                    for f in p["smi"].split("."): answers[BI.canon(strip(f))] = it["id"]
            if it.get("target"): answers[BI.canon(strip(it["target"]))] = it["id"]
    for it in MECH.INDEPENDENT: answers[BI.canon(strip(it["product"]))] = it["id"]
    for it in STR.INDEPENDENT:
        for s in [it.get("answerSmi")] + list((it.get("draw") or {}).get("solution") or []):
            if s and not s.startswith("<"): answers[BI.canon(strip(s))] = it["id"]
    allow_ind = {BI.canon(s) for s in ALLOW_INDEPENDENT}
    for (sec, smi), k in keys.items():
        if k in answers and k not in allow_ind:
            fail.append("plan %s: %s is the answer to the app's independent problem %s" % (sec, smi, answers[k]))
    for name, sm, prod, delta in P.REACTIONS:
        want = dict(BI.counts(sm))
        for sign, f in re.findall(r"([+-])([A-Z][A-Za-z0-9]*)", delta):
            for el, n in formula_counts(f).items():
                want[el] = want.get(el, 0) + (n if sign == "+" else -n)
        want = {k: v for k, v in want.items() if v}
        got = {k: v for k, v in BI.counts(prod).items() if v}
        if want != got: fail.append("plan reaction %s: formula %s, expected %s" % (name, got, want))
    for w in P.WALKS.values():
        if w["fig"] and w["fig"].startswith("k-") and not os.path.exists(os.path.join(FIGDIR, w["fig"] + ".svg")):
            fail.append("plan %s: figure %s.svg is missing" % (w["id"], w["fig"]))
    # each day's task minutes add up to the minutes the day (and her calendar) shows
    for d in P.DAYS:
        total = sum(t[2] for t in d["tasks"])
        if total != d["minutes"]: fail.append("plan %s: tasks add up to %d minutes but the day says %d" % (d["key"], total, d["minutes"]))
    # every drawn spectrum accounts for every H in its molecule, and each one names a molecule
    for key, panels in P.SPECTRA.items():
        for label, sig in panels:
            smi = P.SPECTRA_MOLS.get((key, label))
            if not smi: fail.append("plan spectrum %s %s: no molecule given" % (key, label)); continue
            h = BI.counts(smi).get("H", 0)
            if sum(n for _, n, _ in sig) != h: fail.append("plan spectrum %s %s: %d H drawn, %s has %d" % (key, label, sum(n for _, n, _ in sig), smi, h))
            if smi not in {s for _, s in P.MOLS}:
                fail.append("plan spectrum %s %s: %s is not in MOLS, so it was not checked" % (key, label, smi))

# ---------------------------------------------------------------- drawings for the new walkthroughs
def step_svg(smi, lp, arrows, fail, label, scale=46):
    d = Depiction(smi, lone_pairs=lp, scale=scale)
    parts, W, H, anchors = d.render()
    def resolve(a):
        return sorted(x for x in anchors if x.startswith(a))[0] if a.endswith(".lp") else a
    for ar in arrows:
        for end in ar:
            if resolve(end) not in anchors: fail.append("plan figure %s: arrow end %s is not a target" % (label, end))
    center = anchors.pop("__center", None)
    arr = arrows_svg([[resolve(a), resolve(b)] for a, b in arrows], anchors, center)
    # grow the box so every curved arrow stays inside it
    xs, ys = [0, W], [0, H]
    for p in arr:
        m = re.search(r'd="M([-\d.]+),([-\d.]+) Q([-\d.]+),([-\d.]+) ([-\d.]+),([-\d.]+)"', p)
        if m:
            x0, y0, cx, cy, x1, y1 = map(float, m.groups())
            for i in range(11):
                t = i / 10.0
                xs.append((1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1); ys.append((1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1)
        for x, y in re.findall(r"([-\d.]+),([-\d.]+)", p.split("points=")[1] if "points=" in p else ""):
            xs.append(float(x)); ys.append(float(y))
    bx0, by0, bx1, by1 = min(xs) - 6, min(ys) - 6, max(xs) + 6, max(ys) + 6
    bx0, by0, bx1, by1 = min(bx0, 0), min(by0, 0), max(bx1, W), max(by1, H)
    w, h = bx1 - bx0, by1 - by0
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%.0f %.0f %.0f %.0f" width="%.0f" height="%.0f" role="img">%s</svg>' % (bx0, by0, w, h, w, h, "".join(parts + arr))

TAUT_PANELS = {
    "taut-acid": ["[CH2]{c1}=C{c2}([OH]{o})CCC", "C[C+]{c}([OH]{o})CCC", "CCCC(C)=[O+]{o}[H]{h}", "CCCC(C)=O"],
    "taut-base": ["[H]{h}O{o}[CH]{c1}=[CH]{c2}CCC", "[O-]{o}[CH]{c1}=[CH]{c2}CCC", "O=[CH]{c1}[CH-]{c2}CCC", "CCCCC=O"],
}

def mol_svg(BI, smi, caption=None):
    return BI.render(smi, caption, scale=36)

def figures(BI, fail):
    F = {}
    F["ether-mech"] = [
        (step_svg("[CH2]{c1}=C{c2}(C)C.[H]{h}[OH+]{o}C", {"o": 1}, [["c1-c2", "h"], ["h-o", "o"]], fail, "ether 1"),
         "1. The C=C bond takes the H of CH₃OH₂⁺; the H–O bond's pair stays on the O. The H lands on C1; the + is on C2 (tertiary)."),
        (step_svg("C[C+]{c}(C)C.C[OH]{o}", {"o": 2}, [["o.lp", "c"]], fail, "ether 2"),
         "2. A lone pair on methanol's O bonds to the C⁺."),
        (step_svg("CC(C)(C)[O+]{o}([H]{h})C.C[OH]{w}", {"o": 1, "w": 2}, [["w.lp", "h"], ["h-o", "o"]], fail, "ether 3"),
         "3. A second methanol takes the H on the O⁺; the O–H bond's pair stays on the O."),
        (mol_svg(BI, "COC(C)(C)C"), "tert-butyl methyl ether"),
    ]
    F["methylshift"] = [
        (mol_svg(BI, "CCC(O)C(C)(C)C"), "2,2-dimethyl-3-pentanol"),
        (step_svg("CC[CH+]{c3}C{c2}(C{m})(C)C", {}, [["c2-m", "c3"]], fail, "methyl shift"),
         "After water leaves: secondary C⁺ on C3. The C2–CH₃ bond's pair moves to C3, taking the CH₃ with it."),
        (step_svg("CCC(C)[C+]{c}(C)C.[Br-]{br}", {"br": 4}, [["br.lp", "c"]], fail, "methyl shift 2"),
         "Now the + is on C2 (tertiary), and Br⁻ bonds there."),
        (mol_svg(BI, "CCC(C)C(C)(C)Br"), "2-bromo-2,3-dimethylpentane (C3 is a stereocenter: both enantiomers)"),
    ]
    F["stability"] = [
        (mol_svg(BI, "CCC[CH+]OC"), "A: C⁺ with the O bonded to it"),
        (step_svg("CCC[CH+]{c}O{o}C", {"o": 2}, [["o.lp2", "c-o"]], fail, "stability resonance", scale=62), "A's O shares a lone pair: the arrow goes from the lone pair into the C–O bond..."),
        (mol_svg(BI, "CCCC=[O+]C"), "...giving C=O⁺: every atom has an octet"),
        (mol_svg(BI, "CC[C+](C)C"), "B: tertiary C⁺"),
        (mol_svg(BI, "COCC[CH2+]"), "C: primary C⁺; the O is on the next carbon over"),
    ]
    A, B = TAUT_PANELS["taut-acid"], TAUT_PANELS["taut-base"]
    F["taut-acid"] = [
        (step_svg(A[0] + ".[H]{h}[OH2+]{w}", {"o": 2, "w": 1}, [["c1-c2", "h"], ["h-w", "w"]], fail, "taut acid 1"),
         "1. The C=C bond takes the H of H₃O⁺; the H–O bond's pair goes onto water's O. The H lands on C1, and C2 is left with the +, next to the O."),
        (step_svg(A[1], {"o": 2}, [["o.lp2", "c-o"]], fail, "taut acid resonance", scale=62),
         "Resonance: a lone pair on the O moves into the C–O bond and becomes the C=O π bond..."),
        (step_svg(A[2] + ".[OH2]{w}", {"o": 1, "w": 2}, [["w.lp", "h"], ["h-o", "o"]], fail, "taut acid 2"),
         "...so the + is on the O. 2. A lone pair on water takes the H; the O–H bond's pair goes back onto the O."),
        (mol_svg(BI, A[3]), "2-pentanone, and H₃O⁺ given back (the acid is a catalyst)"),
    ]
    F["taut-base"] = [
        (step_svg("[OH-]{b}." + B[0], {"o": 2, "b": 3}, [["b.lp", "h"], ["h-o", "o"]], fail, "taut base 1"),
         "1. The enol from 1-pentyne and 9-BBN. A lone pair on OH⁻ takes the H on the O; the O–H bond's pair stays on the O (now O⁻). Water forms."),
        (step_svg(B[1], {"o": 3}, [["o.lp", "c1-o"], ["c1-c2", "c2"]], fail, "taut base resonance", scale=62),
         "Resonance: an O⁻ lone pair moves into the C–O bond (C=O), and the C=C bond's pair moves onto C2..."),
        (step_svg(B[2] + ".[H]{h}[OH]{w}", {"c2": 1, "w": 2}, [["c2.lp", "h"], ["h-w", "w"]], fail, "taut base 2"),
         "...which now has a lone pair and the − charge. 2. That lone pair takes an H from water; the H–O bond's pair goes onto water's O."),
        (mol_svg(BI, B[3]), "pentanal, and OH⁻ given back"),
    ]
    # every panel of a tautomerization keeps the same carbon framework (the biggest fragment in each panel)
    for key, smis in TAUT_PANELS.items():
        cs = {s: max(BI.counts(strip(fr)).get("C", 0) for fr in strip(s).split(".")) for s in smis}
        if len(set(cs.values())) != 1: fail.append("plan figure %s: carbon counts differ across panels %s" % (key, cs))
    F["cyclooctyne"] = [(mol_svg(BI, "C1CCCC#CCC1"), "cyclooctyne"), (mol_svg(BI, "OC(=O)CCCCCCC(=O)O"), "octanedioic acid: one molecule, a COOH at each end")]
    for key, panels in P.SPECTRA.items():
        F[key] = '<div class="spectra">' + "".join(spectrum_svg(label, sig) for label, sig in panels) + "</div>"
    return F

def spectrum_svg(label, signals, xmax=4.5):
    """A predicted-style 1H spectrum: n + 1 lines per signal (binomial heights), the integration printed over it, ppm running right to left."""
    from math import comb
    W, L, R, T, B = 600, 22, 18, 40, 40
    pw, ph = W - L - R, 100
    base = T + ph
    X = lambda ppm: L + (xmax - ppm) / xmax * pw
    o = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" role="img" aria-label="Spectrum %s">' % (W, base + B, label),
         '<rect width="%d" height="%d" fill="#fff"/>' % (W, base + B),
         '<text x="6" y="20" font-size="18" font-weight="700" fill="#3b2466" font-family="sans-serif">%s</text>' % label,
         '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#222" stroke-width="1.4"/>' % (L, base, L + pw, base)]
    t = 0.0
    while t <= xmax + 1e-9:
        x = X(t)
        o.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="#222" stroke-width="1"/>' % (x, base, x, base + 5))
        o.append('<text x="%.1f" y="%d" font-size="12" text-anchor="middle" fill="#333" font-family="sans-serif">%.1f</text>' % (x, base + 19, t))
        t += 0.5
    o.append('<text x="%.1f" y="%d" font-size="12" text-anchor="middle" fill="#333" font-family="sans-serif">δ (ppm)</text>' % (L + pw / 2, base + 35))
    hmax = max(n * comb(k - 1, (k - 1) // 2) / 2 ** (k - 1) for _, n, k in signals)
    for ppm, n, k in signals:
        x0 = X(ppm); gap = 3.2
        for i in range(k):
            hgt = max(6, ph * (n * comb(k - 1, i) / 2 ** (k - 1)) / hmax)
            x = x0 + (i - (k - 1) / 2) * gap
            o.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%.1f" stroke="#111" stroke-width="1.3"/>' % (x, base, x, base - hgt))
        o.append('<rect x="%.1f" y="%d" width="22" height="4" fill="#2f7a3e"/>' % (x0 - 11, T - 22))
        o.append('<text x="%.1f" y="%d" font-size="13" font-weight="700" text-anchor="middle" fill="#c0392b" font-family="sans-serif">%d</text>' % (x0, T - 6, n))
    o.append("</svg>")
    return "".join(o)

# ---------------------------------------------------------------- page
CSS = """
.plan h2{margin-top:6px}.daynav{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 4px}.daynav a{border:1px solid #d9cce8;border-radius:999px;padding:6px 11px;text-decoration:none;color:#4d2d78;font-weight:700;font-size:.86rem;background:#fff}
.daynav a.today{background:#6c3fa0;color:#fff;border-color:#6c3fa0}
.day{border:1px solid #e3d8ef;border-radius:14px;padding:12px 14px;margin:16px 0;background:#fff}.day.today{border:2px solid #6c3fa0}
.day h2{font-size:1.15rem}.tasks li{margin:5px 0}.bio{color:#5f5670;font-size:.9rem}
.walk{border-top:1px solid #eadff3;margin-top:14px;padding-top:10px}.walk h3{margin:4px 0 6px;font-size:1.06rem;color:#3b2466}
.rule{background:#f6f1fc;border-left:4px solid #6c3fa0;padding:8px 10px;border-radius:8px;margin:6px 0}
.problem{font-weight:700;margin:6px 0}
.step{margin:10px 0 0}.step .q{margin:4px 0}.step b.t{color:#3b2466}
details{margin:4px 0 4px 2px}details>summary{cursor:pointer;color:#5a2f8f;font-weight:700;font-size:.92rem}details[open]>summary{margin-bottom:4px}
details.ans>div{background:#f1faf3;border-left:3px solid #2f7a3e;padding:6px 9px;border-radius:6px}
details.hint>div{background:#fff8ec;border-left:3px solid #c48a20;padding:6px 9px;border-radius:6px}
.figscroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:6px 0}.figscroll img{min-width:640px;width:100%;height:auto;background:#fff}
.figrow{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start}.figrow figure{margin:0;max-width:300px}.figrow figcaption{font-size:.82rem;color:#5f5670}.figrow svg{max-width:100%;height:auto}
.practice{margin-top:10px}.practice h4{margin:8px 0 2px;font-size:.95rem}.practice li{margin:6px 0}
.watch{font-size:.9rem;color:#5f5670}.note{margin:8px 0}
table.cards{border-collapse:collapse;width:100%;font-size:.92rem}table.cards td,table.cards th{border-top:1px solid #eadff3;padding:6px 4px;text-align:left;vertical-align:top}
.small{font-size:.86rem}.mins{color:#5f5670;font-size:.86rem;white-space:nowrap}.extra li{margin:3px 0;font-size:.92rem}
.checklist{background:#f6f1fc;border-radius:8px;padding:8px 10px;margin:10px 0}.checklist li{margin:4px 0}
.spectra{max-width:640px;margin:6px 0}.spectra svg{display:block;width:100%;height:auto;margin:4px 0;border:1px solid #eadff3;border-radius:6px}
"""

def fig_html(F, key):
    return F[key] if isinstance(F[key], str) else figrow(F[key])

def steps_html(w, F):
    o = []
    for n, (title, qas) in enumerate(w["steps"], 1):
        o.append('<div class="step"><b class="t">%d. %s%s</b>' % (n, E(title), "" if title.endswith(("?", ".")) else "."))
        for qa in qas:
            q, a, hint = qa[:3]
            o.append('<p class="q">%s</p>' % E(q))
            if len(qa) > 3 and qa[3]: o.append(fig_html(F, qa[3]))
            if hint: o.append('<details class="hint"><summary>Hint</summary><div>%s</div></details>' % E(hint))
            o.append('<details class="ans"><summary>Answer (after you\'ve written yours)</summary><div>%s</div></details>' % E(a))
        o.append("</div>")
    return "".join(o)

def figrow(items):
    return '<div class="figrow">' + "".join('<figure>%s<figcaption>%s</figcaption></figure>' % (svg, E(cap)) for svg, cap in items) + "</div>"

def practice_html(w, F):
    o = ['<div class="practice">']
    if w["with_help"]:
        o.append("<h4>Practice today, with your notes</h4><ol>")
        for it in w["with_help"]:
            q, a = it[:2]
            o.append('<li>%s%s<details class="ans"><summary>Answer</summary><div>%s</div></details></li>' % (E(q), fig_html(F, it[2]) if len(it) > 2 and it[2] else "", E(a)))
        o.append("</ol>")
    if w["on_own"]:
        o.append("<h4>Tomorrow, on your own (no notes, no hints)</h4>")
        if len(w["on_own"]) > 1: o.append('<p class="small">The first one is the one to do. The rest are for if you have time.</p>')
        o.append("<ol>")
        for it in w["on_own"]:
            q, a = it[:2]
            o.append('<li>%s%s<details class="ans"><summary>Answer (open only after you\'ve worked it cold)</summary><div>%s</div></details></li>' % (E(q), fig_html(F, it[2]) if len(it) > 2 and it[2] else "", E(a)))
        o.append("</ol>")
    if w["watch"]:
        o.append('<p class="watch"><b>Common mistakes:</b> %s</p>' % E(" ".join(w["watch"])))
    o.append("</div>")
    return "".join(o)

def walk_html(w, F):
    o = ['<section class="walk" id="w-%s"><h3>%s</h3>' % (w["id"], E(w["title"]))]
    o.append('<p class="rule"><b>The rule:</b> %s</p>' % E(w["rule"]))
    o.append('<p class="problem">%s</p>' % E(w["problem"]))
    o.append('<p class="small">On paper: work each step below before you open its answer.</p>')
    o.append(steps_html(w, F))
    if w["fig"]:
        if w["fig"].startswith("k-"):
            o.append('<details><summary>Show the whole mechanism, drawn (after your own drawing)</summary><div class="figscroll"><img src="plan-figs/%s.svg" alt="%s"></div></details>' % (w["fig"], E(w["title"] + ": the full drawing")))
        else:
            label = {"stability": "Show the cations and A's resonance form, drawn (after your own drawing)",
                     "taut-acid": "Show the acid tautomerization, drawn (after your own drawing)"}.get(w["fig"], "Show the whole mechanism, drawn (after your own drawing)")
            o.append('<details><summary>%s</summary>%s</details>' % (E(label), figrow(F[w["fig"]])))
    if w.get("checklist"):
        intro, items = w["checklist"]
        o.append('<div class="checklist"><b>Scoring checklist.</b> %s<ol>%s</ol></div>' % (E(intro), "".join("<li>%s</li>" % E(i) for i in items)))
    for title, text, fig in w["notes"]:
        o.append('<div class="note"><b>%s.</b> %s</div>' % (E(title), E(text)))
        if fig: o.append('<details><summary>Show it drawn (after your own drawing)</summary>%s</details>' % figrow(F[fig]))
    o.append(practice_html(w, F))
    o.append("</section>")
    return "".join(o)

def cards_html():
    o = ['<section class="walk" id="w-cards"><h3>The eight reagent cards</h3>',
         '<p>For each reagent, say its job out loud first, then open the card. Learn only the ones you miss: read the why, work the example, and try that reagent\'s practice problem tomorrow.</p>',
         '<table class="cards"><tr><th>Reagent</th><th>Card</th></tr>']
    for i, (reag, job, why, ex, wrong) in enumerate(P.CARDS, 1):
        o.append('<tr><td><b>%d. %s</b></td><td><details class="ans"><summary>Its job</summary><div><p><b>Job:</b> %s</p><p><b>Why:</b> %s</p><p><b>Example:</b> %s</p><p><b>Wrong answer to catch:</b> %s</p></div></details></td></tr>' % (i, E(reag), E(job), E(why), E(ex), E(wrong)))
    o.append('</table><div class="practice"><h4>Practice today, with your notes</h4><ol>')
    for q, a in P.CARD_TODAY:
        o.append('<li>%s<details class="ans"><summary>Answer</summary><div>%s</div></details></li>' % (E(q), E(a)))
    o.append('</ol><h4>Tomorrow, on your own: write each reagent\'s job from memory, then the product</h4><ol>')
    for q, a in P.CARD_PRACTICE:
        o.append('<li>%s<details class="ans"><summary>Answer (open only after you\'ve worked it cold)</summary><div>%s</div></details></li>' % (E(q), E(a)))
    o.append("</ol></div></section>")
    return "".join(o)

def topics_html(F):
    o = ['<section class="walk" id="w-topics"><h3>Test 4 checklist: Chapters 8 and 9</h3>',
         '<p>Say what each reagent does from memory, then open the row. Put every row on your one-page reagent chart. Each example is a new molecule.</p>',
         '<table class="cards"><tr><th>Ch.</th><th>Reaction and reagents</th><th></th></tr>']
    for ch, name, reag, does, ex in P.TOPICS:
        o.append('<tr><td>%s</td><td><b>%s</b><br><span class="small">%s</span></td><td><details class="ans"><summary>What it does</summary><div><p>%s</p><p><b>Example:</b> %s</p></div></details></td></tr>' % (E(ch), E(name), E(reag), E(does), E(ex)))
    o.append('</table><details><summary>Show the ring alkyne example, drawn</summary>%s</details></section>' % figrow(F["cyclooctyne"]))
    return "".join(o)

def page(F):
    o = ['<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n',
         '<title>Your Test 4 plan</title>\n<link rel="stylesheet" href="../lessons.css">\n<link rel="stylesheet" href="./t4.css">\n<style>%s</style>\n</head>\n' % CSS,
         '<body data-lesson="plan">\n<main class="wrap plan" id="app">\n<div class="eyebrow">CHM 221 · Test 4 is Thursday, Nov 19</div>\n<h1>Your Test 4 plan, day by day</h1>\n']
    for p in P.INTRO: o.append('<p>%s</p>' % E(p))
    o.append('<nav class="daynav" aria-label="Days">' + "".join('<a href="#d-%s" data-date="%s">%s</a>' % (d["key"], d["date"], E(d["title"].split(" · ")[0])) for d in P.DAYS) + "</nav>")
    o.append('<details><summary>How to use the walkthroughs</summary><ol>' + "".join('<li><b>%s</b> %s</li>' % (E(a), E(b)) for a, b in P.HOW) + '</ol><p>%s</p><p><b>Match what you do next to the kind of miss:</b></p><ul>' % E(P.STOP_RULE)
             + "".join('<li><b>%s</b> %s</li>' % (E(a), E(b)) for a, b in P.MISS_RULES) + '</ul><p><b>Keeping your record honest:</b></p><ul>' + "".join('<li>%s</li>' % E(h) for h in P.HONEST) + "</ul></details>")
    for d in P.DAYS:
        o.append('<section class="day" id="d-%s" data-date="%s"><h2>%s</h2><p class="small">Chemistry: %d minutes, also on your calendar. %s</p><ol class="tasks">' % (d["key"], d["date"], E(d["title"]), d["minutes"], E(P.DAY_RULE)))
        for text, link, mins in d["tasks"]:
            links = [(link, "Open the lesson")] if isinstance(link, str) else (link or [])
            o.append('<li>%s <span class="mins">(%d min)</span>%s</li>' % (E(text), mins, (" " + " · ".join('<a href="%s">%s</a>' % (h, E(lbl)) for h, lbl in links)) if links else ""))
        o.append("</ol>")
        if d["extra"]:
            o.append('<p class="small"><b>If time:</b></p><ul class="extra">' + "".join('<li>%s%s</li>' % (E(t), (' <a href="%s">Open the lesson</a>' % l) if l else "") for t, l in d["extra"]) + "</ul>")
        if d["bio"]: o.append('<p class="bio">%s</p>' % E(d["bio"]))
        for wid in d["walks"]:
            if wid == "cards": o.append(cards_html())
            elif wid == "topics": o.append(topics_html(F))
            else: o.append(walk_html(P.WALKS[wid], F))
        o.append("</section>")
    o.append('<p class="source">The walkthroughs teach the Readiness Check problems. Last year\'s Test 4 is your Wednesday practice test, so none of its answers appears on this page. '
             'Every molecule here was checked by the build against last year\'s test and against the answers to the app\'s Draw alone problems. This page records nothing. Practice support only: follow your instructor\'s rules for graded work.</p>')
    o.append('</main>\n<script>(function(){function pad(n){return(n<10?"0":"")+n}var d=new Date(),t=d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());'
             'var s=document.querySelector(\'.day[data-date="\'+t+\'"]\'),a=document.querySelector(\'.daynav a[data-date="\'+t+\'"]\');'
             'if(s){s.classList.add("today");var h=s.querySelector("h2");if(h)h.insertAdjacentHTML("afterbegin","<span class=\\"chip\\">Today</span> ")}if(a)a.classList.add("today");})();</script>\n</body>\n</html>\n')
    return "".join(o)

def build(BI, fail):
    check_all(BI, fail)
    F = figures(BI, fail)
    if fail: return None
    s = page(F)
    open(OUT, "w", encoding="utf-8").write(s)
    return OUT
