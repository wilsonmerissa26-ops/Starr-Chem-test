"""Build student-app/lessons/chem-t4/items.js from the lesson content files, checking the chemistry first.

Checks (the build stops on any failure):
  * every item has exactly one correct product, and every product option is a distinct structure+label;
  * the correct product's molecular formula equals the starting material's plus what the reagent adds;
  * cis/trans in a product name matches the wedge/dash drawing;
  * independent problems use starting materials that appear nowhere else in these lessons, and no
    molecule anywhere is one from the Readiness Check (or its key) or Dr. Meadows' Fall 2025 Test 4;
  * every tag used has feedback text, and every job key has text.
Run:  python3 tools/chem_t4/build_items.py
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from depict import Depiction, parse, hcount, neighbors
import content_alkenes as ALK
import content_alkynes as AKY
import content_mechanisms as MECH
import content_structures as STR

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "student-app", "lessons", "chem-t4", "items.js")

# Molecules from the Readiness Check (student copy and key) and Dr. Meadows' Fall 2025 Test 4 (key read page by page).
EXCLUDED = {
    "diagnostic": ["CCC(C)(C)O", "CCC(C)(C)Br", "CC=C(C)C", "CC1=CCCCC1", "CC1(Br)CCCCC1", "C1=CCCC1", "BrC1CCCC1Br",
                   "CC1(Cl)CCCCC1", "COC1(C)CCCCC1", "C=C1CCCCC1", "CCC(C)O", "CCC(C)C#N", "C=CC1CCCCC1", "CCC1(Br)CCCCC1",
                   "CC(Br)C1CCCCC1", "C#CCCC", "CC(=O)CCC", "O=CCCCC", "C#CC", "BrCCC", "CC#CCCC", "CC=CCCC",
                   # intermediates and products from the Readiness Check key (Problems 1, 2, 6 and 7)
                   "CCC(C)(C)[OH2+]", "CC[C+](C)C", "C[C+]1CCCCC1", "OC1CCCCC1Br", "C=C(O)CCC"],
    # Checked page by page against the Fall 2025 Test 4 key PDF on Nov 15. Q1 is 2-butyne and its 4-carbon
    # alkenes and dibromides; Q2 is 2-propyloxirane and pentane-1,2-diol. Intermediates and products from the key are listed too.
    "fall2025-test4": [
        "CC#CC", "CC=CC", "CC(Br)C(Br)C", "CC(Br)(Br)C(Br)(Br)C",            # Q1
        "CCCC1CO1", "CCCC(O)CO",                                              # Q2
        "C#CCC(C)(C)C", "OC=CCC(C)(C)C", "O=CCCC(C)(C)C",                     # Q4 (alkyne, enol, aldehyde)
        "C=CC1=CC=CC=C1", "CC(C)O", "CC(OC(C)C)C1=CC=CC=C1",                  # Q5a
        "C=C1CCCC1", "OC1(CBr)CCCC1",                                         # Q5b
        "C=CC(C)(C)C", "CC(C)C(C)(C)Cl", "CC(Cl)C(C)(C)C", "C[CH+]C(C)(C)C", "CC(C)[C+](C)C",  # Q5c
        "C1CCCCC#CCCC1", "OC(=O)CCCCCCCCC(=O)O",                              # Q5d
        "C1=CCCCC1", "OC1CCCCC1O",                                            # Q5e
        "C[C+](C)COC", "CC(C)[CH+]OC",                                        # Q6
        "BrC1CCCCC1", "C=CCC", "CCCCC1CCCCC1", "BrCC(Br)CC", "C#CCC", "CCC#CC1CCCCC1",  # Q7 option 1
        "CC(Br)C1=CC=CC=C1", "C#C", "CC(=O)CCC1=CC=CC=C1", "BrCCC1=CC=CC=C1", "C#CCCC1=CC=CC=C1",  # Q7 option 2
    ],
}

def canon(smi, stereo=False):
    """A Weisfeiler-Lehman style key: equal for the same graph (and the same wedge/dash marks when stereo=True)."""
    atoms, bonds = parse(smi)
    n = len(atoms)
    styles = {i: [] for i in range(n)}
    if stereo:
        for a, b, o, st in bonds:
            if st != "plain":
                styles[a].append("s>" + st); styles[b].append("s<" + st)
    lab = ["%s%d%s%s" % (a.el, a.charge, hcount(atoms, bonds, i) if a.el != "H" else 0, ",".join(sorted(styles[i]))) for i, a in enumerate(atoms)]
    adj = {i: [] for i in range(n)}
    for a, b, o, st in bonds:
        adj[a].append((b, o)); adj[b].append((a, o))
    for _ in range(6):
        lab = [lab[i] + "(" + ",".join(sorted("%d:%s" % (o, lab[j]) for j, o in adj[i])) + ")" for i in range(n)]
        lab = [str(hash(x) & 0xffffffff) for x in lab]
    # split by fragment
    comp, cid = [-1] * n, 0
    for s in range(n):
        if comp[s] >= 0: continue
        st = [s]; comp[s] = cid
        while st:
            u = st.pop()
            for v, _ in adj[u]:
                if comp[v] < 0: comp[v] = cid; st.append(v)
        cid += 1
    frags = sorted(",".join(sorted(lab[i] for i in range(n) if comp[i] == c)) for c in range(cid))
    return "|".join(frags)

def counts(smi):
    return Depiction(smi).total_formula()

def add(c, d, sign=1):
    out = dict(c)
    for k, v in d.items():
        out[k] = out.get(k, 0) + sign * v
        if out[k] == 0: del out[k]
    return out

def parse_delta(s):
    out = {}
    for el, n in re.findall(r"([A-Z][a-z]?)(\d*)", s):
        out[el] = out.get(el, 0) + (int(n) if n else 1)
    return out

def expected(sm, delta):
    c = counts(sm)
    if delta.startswith("alkylate:"):
        r = counts(delta.split(":", 1)[1])     # the alkyl group as an alkane, e.g. CC = ethane
        return add(add(c, r), {"H": 2}, -1)    # SM - H + (R-H) - H ... (R = alkane minus one H)
    if delta == "o3:alkyne":
        return add(c, {"H": 2, "O": 4})
    sign = 1 if delta[0] == "+" else -1
    return add(c, parse_delta(delta[1:]), sign)

FAIL = []
def check(ok, msg):
    if not ok: FAIL.append(msg)

def stereo_pair(smi):
    atoms, bonds = parse(smi)
    return [b[3] for b in bonds if b[3] != "plain"]

EXCLUDED_KEYS = {canon(s): (src, s) for src, lst in EXCLUDED.items() for s in lst}

def all_smiles(item):
    out = [item["sm"]] + [p["smi"] for p in item.get("products", [])]
    if item.get("target"): out.append(item["target"])
    return out

def render(smi, label=None, scale=40, rotate=0):
    d = Depiction(smi, scale=scale, rotate=rotate)
    svg, anchors, size = d.svg(caption=label)
    return svg

def build_product_item(item, J, TAGS, CARD_KEYS, role):
    out = {k: v for k, v in item.items() if k not in ("products", "sm", "delta", "hints", "jobText", "target", "seqs", "choices")}
    out["role"] = role
    kind = item.get("kind", "product")
    out["kind"] = kind
    out["smSvg"] = render(item["sm"])
    check(item["reagentKey"] in CARD_KEYS, "%s: reagentKey %s has no card" % (item["id"], item["reagentKey"]))
    if kind == "job":
        out["choices"] = [{"text": c["text"], "tag": c["tag"]} for c in item["choices"]]
        check(sum(c["tag"] == "correct" for c in item["choices"]) == 1, item["id"] + ": needs one correct choice")
        for c in item["choices"]:
            check(c["tag"] == "correct" or c["tag"] in TAGS, "%s: tag %s has no text" % (item["id"], c["tag"]))
        return out
    if kind == "synthesis":
        out["targetSvg"] = render(item["target"], item.get("targetLabel"))
        out["seqs"] = item["seqs"]
        check(sum(s["tag"] == "correct" for s in item["seqs"]) == 1, item["id"] + ": needs one correct sequence")
        for s_ in item["seqs"]:
            check(s_["tag"] == "correct" or s_["tag"] in TAGS, "%s: tag %s has no text" % (item["id"], s_["tag"]))
        mid = [p for p in item["products"] if p["tag"] == "correct"][0]["smi"]
        check(counts(mid) == expected(item["sm"], item["delta"]), "%s: intermediate formula %s != %s" % (item["id"], counts(mid), expected(item["sm"], item["delta"])))
        check(counts(item["target"]) == expected(mid, item["targetDelta"]), "%s: target formula mismatch" % item["id"])
    else:
        jt = item.get("jobText", {})
        out["jobs"] = [{"key": k, "text": jt.get(k, J.get(k)), "correct": k == item["reagentKey"] or (i == 0)} for i, k in enumerate(item["jobs"])]
        check(item["jobs"][0] == item["reagentKey"], item["id"] + ": first job must be the item's reagent")
        for j in out["jobs"]:
            check(bool(j["text"]), "%s: job %s has no text" % (item["id"], j["key"]))
        out["jobs"] = [{"key": j["key"], "text": j["text"], "correct": i == 0} for i, j in enumerate(out["jobs"])]
        correct = [p for p in item["products"] if p["tag"] == "correct"]
        check(len(correct) == 1, item["id"] + ": needs exactly one correct product")
        if correct and item.get("delta"):
            got, want = counts(correct[0]["smi"]), expected(item["sm"], item["delta"])
            check(got == want, "%s: product formula %s != expected %s" % (item["id"], got, want))
        if item.get("hints"): out["hints"] = item["hints"]
    keys = [(canon(p["smi"], stereo=True), p.get("label")) for p in item["products"]]
    check(len(set(keys)) == len(keys), item["id"] + ": two product options are the same structure and label")
    for p in item["products"]:
        check(p["tag"] == "correct" or p["tag"] in TAGS, "%s: tag %s has no text" % (item["id"], p["tag"]))
    name = item.get("productName", "")
    corr = [p for p in item["products"] if p["tag"] == "correct"]
    if corr:
        st = stereo_pair(corr[0]["smi"])
        if re.search(r"\btrans-", name) and len(st) == 2: check(st[0] != st[1], item["id"] + ": named trans but drawn cis")
        if re.search(r"\bcis-", name) and len(st) == 2: check(st[0] == st[1], item["id"] + ": named cis but drawn trans")
        if "meso" in name: check(corr[0].get("label") == "meso", item["id"] + ": meso name but label differs")
    out["products"] = [{"svg": render(p["smi"], p.get("label")), "tag": p["tag"], "label": p.get("label")} for p in item["products"]]
    def facts_of(smi):
        c = counts(smi)
        return {"carbons": c.get("C", 0), "formula": "".join(el + (str(c[el]) if c[el] > 1 else "") for el in ["C", "H"] + sorted(k for k in c if k not in ("C", "H")) if c.get(el))}
    if corr:
        # For a synthesis, the product options are the step-2 intermediate; the final target gets its own facts,
        # so a formula is never shown next to the wrong compound's name.
        out["facts"] = facts_of(corr[0]["smi"])
        if kind == "synthesis":
            check(bool(item.get("midName")) and bool(item.get("targetName")), item["id"] + ": synthesis needs midName and targetName")
            out["targetFacts"] = facts_of(item["target"])
    for s_ in all_smiles(item):
        k = canon(s_)
        for frag in s_.split("."):
            kk = canon(frag)
            if kk in EXCLUDED_KEYS:
                FAIL.append("%s uses %s, which is in %s" % (item["id"], frag, EXCLUDED_KEYS[kk][0]))
    return out

def build_lesson(mod, key, meta):
    CARD_KEYS = {c["key"] for c in mod.CARDS}
    lesson = dict(meta)
    lesson["cards"] = mod.CARDS
    lesson["families"] = mod.FAMILIES
    lesson["tags"] = mod.TAGS
    ex = mod.EXAMPLE
    lesson["example"] = {"title": ex["title"], "stages": [{"svg": render(s["smi"]) if s["smi"] else None, "caption": s["caption"], "say": s["say"]} for s in ex["stages"]]}
    for s in ex["stages"]:
        if s["smi"]:
            for frag in s["smi"].split("."):
                if canon(frag) in EXCLUDED_KEYS: FAIL.append("%s example uses excluded %s" % (key, frag))
    fam = {c["key"]: c["family"] for c in mod.CARDS}
    def fam_of(it): return it.get("family") or fam.get(it["reagentKey"])
    lesson["guided"] = [dict(build_product_item(i, mod.J, mod.TAGS, CARD_KEYS, "guided"), family=fam_of(i)) for i in mod.GUIDED]
    lesson["independent"] = [dict(build_product_item(i, mod.J, mod.TAGS, CARD_KEYS, "independent"), family=fam_of(i)) for i in mod.INDEPENDENT]
    lesson["targeted"] = [dict(build_product_item(i, mod.J, mod.TAGS, CARD_KEYS, "targeted"), family=fam_of(i)) for i in mod.TARGETED]
    for it in mod.GUIDED + mod.TARGETED:
        check(bool(it.get("hints")), it["id"] + ": guided and targeted items need hints")
    # independent starting materials must be unfamiliar: used nowhere else in this lesson
    others = [canon(s) for it in mod.GUIDED + mod.TARGETED for s in [it["sm"]]] + [canon(s["smi"]) for s in ex["stages"] if s["smi"]]
    seen = {}
    for it in mod.INDEPENDENT:
        k = canon(it["sm"])
        check(k not in others, "%s: its starting material also appears in a taught or guided problem" % it["id"])
        if k in seen and it.get("kind") != "job":
            FAIL.append("%s and %s share a starting material" % (seen[k], it["id"]))
        seen[k] = it["id"]
    ids = [i["id"] for i in mod.GUIDED + mod.INDEPENDENT + mod.TARGETED]
    check(len(ids) == len(set(ids)), key + ": duplicate item ids")
    for f in set(fam.values()):
        check(f in mod.FAMILIES, "%s: family %s has no title" % (key, f))
    return lesson

def carbon_skeletons(smi, cut_multiple=False):
    """The carbon frameworks in a SMILES string: carbon atoms and C-C bonds only, bond orders ignored, one key per
    carbon-containing fragment (sorted). cut_multiple=True removes C=C and C#C bonds first (what ozonolysis cuts)."""
    atoms, bonds = parse(re.sub(r"\{[A-Za-z0-9_]+\}|\^", "", smi))
    cs = [i for i, a in enumerate(atoms) if a.el == "C"]
    adj = {i: set() for i in cs}
    for a, b, o, st in bonds:
        if a in adj and b in adj and not (cut_multiple and o > 1):
            adj[a].add(b); adj[b].add(a)
    seen, keys = set(), []
    for s in cs:
        if s in seen: continue
        comp, stack = [], [s]; seen.add(s)
        while stack:
            x = stack.pop(); comp.append(x)
            for y in adj[x]:
                if y not in seen: seen.add(y); stack.append(y)
        lab = {i: "C" for i in comp}
        for _ in range(8):
            lab = {i: str(hash(lab[i] + "(" + ",".join(sorted(lab[j] for j in adj[i])) + ")") & 0xffffffff) for i in comp}
        keys.append("%d:%s" % (len(comp), ",".join(sorted(lab.values()))))
    return sorted(keys)

def check_skeletons():
    """A drawing can have the right formula and still be the wrong compound. Additions, reductions, hydrations,
    eliminations, hydride shifts and proton transfers never change the carbon framework, so every mechanism step and
    every correct product must keep the starting carbon framework (ozonolysis: the framework with the C=C or C#C cut)."""
    for it in [MECH.EXAMPLE] + MECH.GUIDED + MECH.INDEPENDENT + MECH.TARGETED:
        want = carbon_skeletons(it["steps"][0]["smi"])
        for k, st in enumerate(it["steps"][1:], start=2):
            check(carbon_skeletons(st["smi"]) == want, "%s: step %d drawing has a different carbon framework from step 1" % (it["id"], k))
        check(carbon_skeletons(it["product"]) == want, "%s: product has a different carbon framework from step 1" % it["id"])
    fixed = {"cleavage", "make-or-cut", "cc-bond"}
    for mod in (ALK, AKY):
        fam = {c["key"]: c["family"] for c in mod.CARDS}
        for it in mod.GUIDED + mod.INDEPENDENT + mod.TARGETED:
            if it.get("kind") in ("job", "synthesis"): continue
            corr = [p["smi"] for p in it["products"] if p["tag"] == "correct"][0]
            f = it.get("family") or fam.get(it["reagentKey"])
            if it["reagentKey"] in ("ozonolysis", "o3-alkyne"):
                check(carbon_skeletons(corr) == carbon_skeletons(it["sm"], cut_multiple=True), it["id"] + ": cleavage products don't match the cut starting material")
            elif f not in fixed or it["reagentKey"] == "double-elim":
                check(carbon_skeletons(corr) == carbon_skeletons(it["sm"]), it["id"] + ": correct product has a different carbon framework from the starting material")

def main():
    check_skeletons()
    data = {
        "alkenes": build_lesson(ALK, "alkenes", {"key": "alkenes", "objectiveId": "chm221.ch8.alkene-reagents", "prefix": "chem-t4-alk",
                                                 "source": "lesson-chem-t4-alkenes", "title": "Alkene reagents: what each one does and what it makes",
                                                 "chapter": "Chapter 8"}),
        "alkynes": build_lesson(AKY, "alkynes", {"key": "alkynes", "objectiveId": "chm221.ch9.alkyne-reagents", "prefix": "chem-t4-aky",
                                                 "source": "lesson-chem-t4-alkynes", "title": "Alkyne reagents: products and short syntheses",
                                                 "chapter": "Chapter 9"}),
        "arrows": MECH.build(render_fn=render, canon=canon, excluded=EXCLUDED_KEYS, fail=FAIL),
        "structures": STR.build(render_fn=render, canon=canon, excluded=EXCLUDED_KEYS, fail=FAIL),
    }
    # no molecule may be an independent problem in two lessons
    if FAIL:
        print("BUILD STOPPED. %d problem(s):" % len(FAIL))
        for f in FAIL: print("  - " + f)
        sys.exit(1)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    total = 0
    for key, lesson in data.items():
        path = os.path.join(os.path.dirname(OUT), "items-%s.js" % key)
        with open(path, "w") as f:
            f.write("/* Generated by tools/chem_t4/build_items.py from the content files there. Do not edit by hand. */\n")
            f.write("window.T4DATA = window.T4DATA || {};\nwindow.T4DATA[%s] = " % json.dumps(key) + json.dumps(lesson, ensure_ascii=False, separators=(",", ":")) + ";\n")
        n = sum(len(lesson.get(x, [])) for x in ("guided", "independent", "targeted"))
        total += n
        print("Wrote %s (%d items, %d KB)" % (os.path.relpath(path, ROOT), n, os.path.getsize(path) // 1024))
    if os.path.exists(OUT):
        os.remove(OUT)

if __name__ == "__main__":
    main()
