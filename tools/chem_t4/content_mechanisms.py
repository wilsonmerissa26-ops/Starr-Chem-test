"""Electron movement lesson: curved arrows for the mechanisms Test 4 asks for.

Each step is drawn from a SMILES-like string with named atoms ({name}); the build turns every named atom,
each of its lone pairs and each bond between two named atoms into a tap target. An arrow is [from, to]:
"w.lp" means any lone pair on atom w; "c1-c2" is the bond between c1 and c2 (order does not matter).
"alts" lists other complete, correct arrow sets for a step (for example, attack on either of two identical carbons).
No molecule here is from the Readiness Check or the Fall 2025 Test 4 (build_items.py checks this).
"""
PT, LG, NA, RE = "Proton transfer", "Loss of a leaving group", "Nucleophilic attack", "Carbocation rearrangement (1,2-shift)"
PATTERNS = [PT, LG, NA, RE]
BROMONIUM = "The π bond attacks Br₂, forming a bridged bromonium ion"

CARDS = [
    {"key": "proton-transfer", "name": PT,
     "job": "An electron pair (a lone pair, or a π bond) takes an H⁺; the bond that held the H moves onto the atom it leaves.",
     "why": "Two arrows: one from the pair that grabs the H to the H, and one from the old bond onto the atom left behind."},
    {"key": "leaving-group", "name": LG,
     "job": "A bond breaks and both of its electrons leave with the leaving group (water, Br⁻, OTs⁻).",
     "why": "One arrow, from the C–LG bond onto the leaving group. The carbon is left with a + charge."},
    {"key": "nucleophilic-attack", "name": NA,
     "job": "A lone pair (or π bond) on a nucleophile forms a new bond to an electron-poor atom, usually a C⁺.",
     "why": "One arrow, from the nucleophile's lone pair to the carbon it bonds to."},
    {"key": "rearrangement", "name": RE,
     "job": "An H (with its two electrons) or a CH₃ moves from the neighboring carbon to the C⁺, making a more stable carbocation.",
     "why": "One arrow, from the C–H (or C–CH₃) bond to the + carbon. The + charge moves to the carbon the group left."},
]
CARD_OF = {PT: "proton-transfer", LG: "leaving-group", NA: "nucleophilic-attack", RE: "rearrangement", BROMONIUM: "nucleophilic-attack"}

ERRORS = {
    "arrow-starts-at-atom": "An arrow started at an atom with no electrons to give (such as an H or a C⁺). Arrows start at a lone pair or a bond.",
    "arrow-backwards": "An arrow points the wrong way. Its tail must sit on the electrons that move, and its head where they go.",
    "wrong-electron-source": "The arrow ends in the right place, but the electrons come from somewhere else. Which lone pair or bond actually moves?",
    "wrong-destination": "The arrow starts at the right electrons, but they go somewhere else. Where does the new bond form, or which atom keeps the pair?",
    "missing-arrow": "An arrow is missing. Every bond that forms or breaks in this step needs its own arrow.",
    "extra-arrow": "There's an extra arrow. Only the bonds that form or break in this step get arrows.",
    "wrong-arrow": "This arrow doesn't match a bond that forms or breaks in this step.",
}

def S(smi, lp, arrows, type_, caption, alts=None, options=None, labels=None):
    return {"smi": smi, "lp": lp, "arrows": arrows, "type": type_, "caption": caption, "alts": alts or [], "options": options or PATTERNS, "labels": labels or {}}

EXAMPLE = {
    "id": "chem-t4-arw-example", "title": "Acid turns an enol into a ketone (tautomerization)",
    "reaction": "propen-2-ol (an enol) with H₃O⁺ → acetone", "product": "CC(=O)C",
    "steps": [
        S("[CH2]{c1}=C{c2}(O{o})C.[H]{h}[OH2+]{w}", {"o": 2, "w": 1}, [["c1-c2", "h"], ["h-w", "w"]], PT,
          "The C=C π bond grabs the H of H₃O⁺ (arrow 1). The H–O bond's pair stays on the water's O (arrow 2). The H lands on C1, and the + charge sits on C2, right next to the O."),
        S("CC{c2}(=[O+]{o}[H]{h})C.[OH2]{w}", {"o": 1, "w": 2}, [["w.lp", "h"], ["h-o", "o"]], PT,
          "The O shares a lone pair with C2, so the + charge is really on the O. Water takes that O–H proton (arrow 1), and the O–H bond's pair stays on the O (arrow 2): acetone."),
    ],
}

GUIDED = [
    {"id": "chem-t4-arw-guided-sn1", "title": "A tertiary alcohol with HBr (SN1)", "reaction": "2-methyl-2-propanol + HBr → 2-bromo-2-methylpropane",
     "product": "CC(C)(C)Br",
     "steps": [
         S("CC(C)(C)O{o}.[H]{h}Br{br}", {"o": 2, "br": 3}, [["o.lp", "h"], ["h-br", "br"]], PT,
           "A lone pair on O takes the H; the H–Br bond's pair goes onto Br."),
         S("CC(C)(C){c}[OH2+]{o}", {"o": 1}, [["c-o", "o"]], LG,
           "The C–O bond's pair leaves with the water, leaving a tertiary carbocation."),
         S("C[C+]{c}(C)C.[Br-]{br}", {"br": 4}, [["br.lp", "c"]], NA,
           "A lone pair on Br⁻ forms the new C–Br bond."),
     ],
     "hints": ["Which atom has a lone pair that can grab the H⁺?", "What leaves, and which bond's electrons go with it?", "Which atom is electron-poor now?"]},
    {"id": "chem-t4-arw-guided-br2", "title": "Br₂ adds to an alkene through a bromonium ion", "reaction": "2,3-dimethyl-2-butene + Br₂ → 2,3-dibromo-2,3-dimethylbutane",
     "product": "CC(C)(Br)C(C)(C)Br",
     "steps": [
         S("CC(C){c1}=C{c2}(C)C.Br{b1}Br{b2}", {"b1": 3, "b2": 3}, [["c1-c2", "b1"], ["b1.lp", "c2"], ["b1-b2", "b2"]], BROMONIUM,
           "The π bond attacks the near Br (arrow 1), that Br uses a lone pair to bond to the other carbon (arrow 2), and the Br–Br bond's pair leaves as Br⁻ (arrow 3).",
           alts=[[["c1-c2", "b1"], ["b1.lp", "c1"], ["b1-b2", "b2"]]],
           options=[BROMONIUM, PT, LG, RE]),
         S("CC{c1}1(C)[Br+]{b1}C{c2}1(C)C.[Br-]{b2}", {"b1": 2, "b2": 4}, [["b2.lp", "c2"], ["c2-b1", "b1"]], NA,
           "Br⁻ attacks one ring carbon from the back (arrow 1), and that carbon's bond to the bridging Br breaks (arrow 2).",
           alts=[[["b2.lp", "c1"], ["c1-b1", "b1"]]]),
     ],
     "hints": ["Three arrows here: one for the π bond, one for the Br that bridges, one for the Br–Br bond.", "Br⁻ attacks a ring carbon. Which bond in the ring breaks?"]},
]

INDEPENDENT = [
    {"id": "chem-t4-arw-ind-sn1", "title": "A tertiary alcohol with HBr", "reaction": "2-methyl-2-hexanol + HBr → 2-bromo-2-methylhexane",
     "product": "CCCCC(C)(C)Br", "practice": {PT: "chem-t4-arw-tgt-alcohol", LG: "chem-t4-arw-tgt-alcohol", NA: "chem-t4-arw-tgt-alcohol"},
     "steps": [
         S("CCCCC(C)(C)O{o}.[H]{h}Br{br}", {"o": 2, "br": 3}, [["o.lp", "h"], ["h-br", "br"]], PT, "Protonation: O takes the H; H–Br's pair goes to Br."),
         S("CCCCC{c}(C)(C)[OH2+]{o}", {"o": 1}, [["c-o", "o"]], LG, "Water leaves with the C–O bond's pair."),
         S("CCCC[C+]{c}(C)C.[Br-]{br}", {"br": 4}, [["br.lp", "c"]], NA, "Br⁻'s lone pair bonds to the C⁺."),
     ]},
    {"id": "chem-t4-arw-ind-base-taut", "title": "Base turns an enol into an aldehyde", "reaction": "2-methylprop-1-en-1-ol with OH⁻ → 2-methylpropanal",
     "product": "CC(C)C(=O)[H]", "practice": {PT: "chem-t4-arw-tgt-taut"},
     "steps": [
         S("CC(C){cb}=C{ca}O{o}[H]{h}.[OH-]{w}", {"o": 2, "w": 3}, [["w.lp", "h"], ["h-o", "o"]], PT,
           "Hydroxide takes the O–H proton; the O–H bond's pair stays on O, making an enolate."),
         S("CC(C){cb}=C{ca}[O-]{o}.[H]{h}O{w}[H]", {"o": 3, "w": 2}, [["o.lp", "ca-o"], ["cb-ca", "h"], ["h-w", "w"]], PT,
           "A lone pair on O⁻ forms the C=O (arrow 1), the C=C π bond takes an H from water (arrow 2), and the H–O bond's pair stays on that O (arrow 3)."),
     ]},
    {"id": "chem-t4-arw-ind-epoxide", "title": "Acid opens an epoxide with water", "reaction": "tetramethyloxirane + H₃O⁺ → 2,3-dimethylbutane-2,3-diol",
     "product": "CC(C)(O)C(C)(C)O", "practice": {PT: "chem-t4-arw-tgt-alcohol", NA: "chem-t4-arw-tgt-alcohol"},
     "steps": [
         S("CC{c1}1(C)O{o}C{c2}1(C)C.[H]{h}[OH2+]{w}", {"o": 2, "w": 1}, [["o.lp", "h"], ["h-w", "w"]], PT,
           "The epoxide O takes the H of H₃O⁺; the H–O bond's pair stays on the water."),
         S("CC{c1}1(C)[OH+]{o}C{c2}1(C)C.[OH2]{w}", {"o": 1, "w": 2}, [["w.lp", "c1"], ["c1-o", "o"]], NA,
           "Water attacks a ring carbon from the back (arrow 1), and that carbon's bond to the O⁺ breaks (arrow 2), opening the ring.",
           alts=[[["w.lp", "c2"], ["c2-o", "o"]]]),
         S("CC(C)(O)C(C)(C)[O+]{o2}([H]{h})[H].[OH2]{w}", {"o2": 1, "w": 2}, [["w.lp", "h"], ["h-o2", "o2"]], PT,
           "A second water takes an H from the new O⁺; the O–H bond's pair stays on that O."),
     ]},
    {"id": "chem-t4-arw-ind-shift", "title": "HBr adds with a hydride shift", "reaction": "3-ethyl-1-pentene + HBr → 3-bromo-3-ethylpentane",
     "product": "CCC(Br)(CC)CC", "practice": {PT: "chem-t4-arw-tgt-alcohol", RE: "chem-t4-arw-tgt-shift", NA: "chem-t4-arw-tgt-shift"},
     "steps": [
         S("[CH2]{c1}=C{c2}C(CC)CC.[H]{h}Br{br}", {"br": 3}, [["c1-c2", "h"], ["h-br", "br"]], PT,
           "The π bond takes the H (it goes on C1); the H–Br bond's pair goes to Br. The + charge is left on C2."),
         S("C[C+]{c2}C{c3}([H]{h})(CC)CC.[Br-]{br}", {"br": 4}, [["c3-h", "c2"]], RE,
           "The H on C3 moves to C2 with its bonding pair, so the + charge moves to C3, a tertiary carbon."),
         S("CC[C+]{c3}(CC)CC.[Br-]{br}", {"br": 4}, [["br.lp", "c3"]], NA, "Br⁻ bonds to the tertiary C⁺."),
     ]},
    {"id": "chem-t4-arw-ind-acid-taut", "title": "Acid turns an enol into a ketone", "reaction": "3-methylbut-1-en-2-ol with H₃O⁺ → 3-methyl-2-butanone",
     "product": "CC(=O)C(C)C", "practice": {PT: "chem-t4-arw-tgt-taut"},
     "steps": [
         S("[CH2]{c1}=C{c2}(O{o})C(C)C.[H]{h}[OH2+]{w}", {"o": 2, "w": 1}, [["c1-c2", "h"], ["h-w", "w"]], PT,
           "The C=C π bond takes the H (it lands on C1); the H–O bond's pair stays on the water."),
         S("CC(=[O+]{o}[H]{h})C(C)C.[OH2]{w}", {"o": 1, "w": 2}, [["w.lp", "h"], ["h-o", "o"]], PT,
           "Water takes the H off the O⁺; the O–H pair stays on O, giving the C=O."),
     ]},
]

# Practice with help after a miss, chosen by the step that broke (see "practice" on each independent item).
TARGETED = [
    {"id": "chem-t4-arw-tgt-alcohol", "title": "A tertiary alcohol with HCl", "reaction": "1-ethylcyclohexanol + HCl → 1-chloro-1-ethylcyclohexane",
     "product": "CCC1(Cl)CCCCC1",
     "steps": [
         S("CCC1(O{o})CCCCC1.[H]{h}Cl{cl}", {"o": 2, "cl": 3}, [["o.lp", "h"], ["h-cl", "cl"]], PT, "O takes the H; the H–Cl pair goes to Cl."),
         S("CCC{c}1([OH2+]{o})CCCCC1", {"o": 1}, [["c-o", "o"]], LG, "Water leaves with the C–O pair."),
         S("CC[C+]{c}1CCCCC1.[Cl-]{cl}", {"cl": 4}, [["cl.lp", "c"]], NA, "Cl⁻ bonds to the C⁺."),
     ],
     "hints": ["Find the lone pair that reaches for the H.", "Which bond breaks so water can leave?", "Which atom is missing electrons?"]},
    {"id": "chem-t4-arw-tgt-shift", "title": "A hydride shift, then the halide adds", "reaction": "the 2-methylpentan-3-yl cation with Br⁻ → 2-bromo-2-methylpentane",
     "product": "CCCC(C)(C)Br",
     "steps": [
         S("CC[C+]{c3}C{c2}([H]{h})(C)C.[Br-]{br}", {"br": 4}, [["c2-h", "c3"]], RE,
           "The H on C2 moves to C3 with its pair; the + charge moves to C2, which is tertiary."),
         S("CCC[C+]{c2}(C)C.[Br-]{br}", {"br": 4}, [["br.lp", "c2"]], NA, "Br⁻ bonds to the new tertiary C⁺."),
     ],
     "hints": ["Which neighbor of the C⁺ holds an H and would become tertiary?", "Where is the + charge now?"]},
    {"id": "chem-t4-arw-tgt-taut", "title": "Acid turns an enol into a ketone", "reaction": "cyclohex-1-en-1-ol with H₃O⁺ → cyclohexanone",
     "product": "O=C1CCCCC1",
     "steps": [
         S("O{o}C{c1}1=C{c2}CCCC1.[H]{h}[OH2+]{w}", {"o": 2, "w": 1}, [["c1-c2", "h"], ["h-w", "w"]], PT,
           "The C=C π bond takes the H (it lands on C2, the carbon without the O)."),
         S("[H]{h}[O+]{o}=C1CCCCC1.[OH2]{w}", {"o": 1, "w": 2}, [["w.lp", "h"], ["h-o", "o"]], PT,
           "Water takes the H off the O⁺; the O–H pair stays on O."),
     ],
     "hints": ["There's no lone pair on carbon. What electron pair can reach the H⁺?", "Which H leaves, and where does its bonding pair go?"]},
]


# Which atoms end up with a NEW formal charge after each step (any one listed set is accepted; [] = no new charge).
# Atom names refer to that step's own drawing.
CHARGES = {
    "chem-t4-arw-example": [[["c2"], ["o"]], [["w"]]],
    "chem-t4-arw-guided-sn1": [[["o", "br"]], [["c"]], [[]]],
    "chem-t4-arw-guided-br2": [[["b1", "b2"]], [[]]],
    "chem-t4-arw-ind-sn1": [[["o", "br"]], [["c"]], [[]]],
    "chem-t4-arw-ind-base-taut": [[["o"]], [["w"]]],
    "chem-t4-arw-ind-epoxide": [[["o"]], [["w"]], [["w"]]],
    "chem-t4-arw-ind-shift": [[["c2", "br"]], [["c3"]], [[]]],
    "chem-t4-arw-ind-acid-taut": [[["c2"], ["o"]], [["w"]]],
    "chem-t4-arw-tgt-alcohol": [[["o", "cl"]], [["c"]], [[]]],
    "chem-t4-arw-tgt-shift": [[["c2"]], [[]]],
    "chem-t4-arw-tgt-taut": [[["c1"], ["o"]], [["w"]]],
}
CHARGE_NOTE = {
    "chem-t4-arw-example": ["The + lands on C2. Because the O next to it shares a lone pair, the + is really on the O (that's how step 2 is drawn). Either answer is right.", "The water that took the H becomes H\u2083O\u207a."],
    "chem-t4-arw-ind-acid-taut": ["The + lands on C2, shared with the O next to it (resonance), so either is right.", "The water that took the H becomes H\u2083O\u207a."],
    "chem-t4-arw-tgt-taut": ["The + lands on C1, the carbon holding the O, and the O shares it (resonance), so either is right.", "The water that took the H becomes H\u2083O\u207a."],
}

# The EXPLAIN stage: one sentence in her own words, then the key idea to compare with.
WHY = {
    "chem-t4-arw-example": {"prompt": "Why does the H go on C1 and not on C2?", "key": "H on C1 leaves the + charge on C2, right next to the O, which shares a lone pair and stabilizes it."},
    "chem-t4-arw-guided-sn1": {"prompt": "Why does the OH have to be protonated before anything leaves?", "key": "OH\u207b is a poor leaving group. Protonation turns it into water, a stable neutral molecule that leaves easily."},
    "chem-t4-arw-guided-br2": {"prompt": "Why do the two Br atoms end up on opposite faces?", "key": "The bridging Br blocks one face, so Br\u207b can only attack from the other face (anti). Here each of those carbons holds two CH\u2083 groups, so the product has no stereocenters and the anti addition can't be seen in it; with a ring alkene, it makes the two Br trans."},
    "chem-t4-arw-ind-sn1": {"prompt": "Why does this go through a carbocation instead of a backside attack?", "key": "The carbon is tertiary: too crowded for backside attack, and its carbocation is stable."},
    "chem-t4-arw-ind-base-taut": {"prompt": "Why doesn't the enol stay an enol?", "key": "The C=O form is more stable. Base removes the O\u2013H proton, and the enolate takes an H on carbon as the C=O forms."},
    "chem-t4-arw-ind-epoxide": {"prompt": "Why does the ring open once the O has an H on it?", "key": "The three-membered ring is strained, and the O\u207a is now a good leaving group. Water attacks a ring carbon from the back, and that carbon's bond to the O breaks. Here each of those carbons holds two CH\u2083 groups, so the product has no stereocenters and the back-side attack can't be seen in it; in a ring epoxide, the same attack makes the two OH groups trans."},
    "chem-t4-arw-ind-shift": {"prompt": "Why does the H move from C3 to C2?", "key": "It turns a secondary carbocation into a more stable tertiary carbocation."},
    "chem-t4-arw-ind-acid-taut": {"prompt": "Why does the H go on the end carbon?", "key": "That leaves the + charge on the carbon next to the O, which shares a lone pair (resonance) and stabilizes it."},
    "chem-t4-arw-tgt-alcohol": {"prompt": "Why can Cl\u207b only attack after water leaves?", "key": "Until water leaves, the carbon has a full octet; the carbocation's empty orbital is what Cl\u207b's lone pair bonds to."},
    "chem-t4-arw-tgt-shift": {"prompt": "Where does the + charge end up, and why?", "key": "On C2: the hydride shift moves it from a secondary to a more stable tertiary carbon."},
    "chem-t4-arw-tgt-taut": {"prompt": "Which carbon gets the H, and why?", "key": "C2, the carbon without the O, so the + charge lands next to the O, which stabilizes it."},
}


def strip_names(smi):
    import re
    return re.sub(r"\{[A-Za-z0-9_]+\}", "", smi)


def build(render_fn, canon, excluded, fail):
    from depict import Depiction
    def step_out(st, item_id, k):
        d = Depiction(st["smi"], lone_pairs=st["lp"], scale=54)
        parts, W, H, anchors = d.render()
        from depict import wrap, arrows_svg
        plain = wrap(parts, W, H)
        def resolve(a):
            if a.endswith(".lp"):
                return sorted(x for x in anchors if x.startswith(a))[0]
            return a
        for ar in st["arrows"] + [x for alt in st["alts"] for x in alt]:
            for end in ar:
                name = resolve(end)
                if name not in anchors:
                    fail.append("%s step %d: arrow end %s is not a target" % (item_id, k + 1, end))
        try:
            center = anchors.pop('__center')
            with_arrows = wrap(parts + arrows_svg([[resolve(a), resolve(b)] for a, b in st["arrows"]], anchors, center), W, H)
        except KeyError as e:
            with_arrows = plain; fail.append("%s step %d: %s" % (item_id, k + 1, e))
        el = {}
        for a in d.atoms:
            if a.name:
                el[a.name] = a.el + ("\u207a" if a.charge > 0 else "\u207b" if a.charge < 0 else "")
        def label(name):
            if "-" in name:
                a, b = name.split("-")
                return "the bond between " + el[a] + " and " + el[b]
            if ".lp" in name:
                return "a lone pair on " + el[name.split(".")[0]]
            return "the " + el[name] + " atom"
        targets = []
        for name, (x, y) in anchors.items():
            if "-" in name:
                a, b = name.split("-")
                if a > b: continue  # each bond once
                kind = "bond"
            elif ".lp" in name:
                kind = "lp"
            else:
                kind = "atom"
            targets.append({"id": name, "x": round(x, 1), "y": round(y, 1), "kind": kind, "label": label(name)})
        if st["type"] not in st["options"]:
            fail.append("%s step %d: its type is not one of its options" % (item_id, k + 1))
        for frag in st["smi"].split("."):
            if canon(frag) in excluded:
                fail.append("%s uses %s, which is in %s" % (item_id, frag, excluded[canon(frag)][0]))
        return {"svg": plain, "svgArrows": with_arrows, "w": round(W), "h": round(H), "cx": round(center[0], 1), "cy": round(center[1], 1), "targets": targets,
                "arrows": st["arrows"], "alts": st["alts"], "type": st["type"], "options": st["options"], "caption": st["caption"]}
    def item_out(it, role):
        steps = [step_out(s, it["id"], k) for k, s in enumerate(it["steps"])]
        ch = CHARGES.get(it["id"])
        if not ch or len(ch) != len(steps):
            fail.append(it["id"] + ": needs a charge answer for every step")
        else:
            for k, (st, sets) in enumerate(zip(steps, ch)):
                atoms = [t["id"] for t in st["targets"] if t["kind"] == "atom"]
                for cs in sets:
                    for a in cs:
                        if a not in atoms:
                            fail.append("%s step %d: charge atom %s is not a target" % (it["id"], k + 1, a))
                st["charges"] = sets
                st["chargeNote"] = (CHARGE_NOTE.get(it["id"]) or [None] * len(steps))[k]
        if it["id"] not in WHY:
            fail.append(it["id"] + ": needs an explain prompt")
        out = {"id": it["id"], "role": role, "kind": "mechanism", "title": it["title"], "reaction": it["reaction"],
               "productSvg": render_fn(it["product"]), "steps": steps, "why": WHY.get(it["id"]),
               "startSvg": render_fn(it["steps"][0]["smi"].replace("{", "<").replace("}", ">") if False else strip_names(it["steps"][0]["smi"])),
               "hints": it.get("hints"), "practice": it.get("practice", {})}
        if canon(it["product"]) in excluded:
            fail.append("%s product is excluded" % it["id"])
        if role in ("guided", "targeted") and not it.get("hints"):
            fail.append(it["id"] + ": needs hints")
        if role in ("guided", "targeted") and it.get("hints") and len(it["hints"]) != len(it["steps"]):
            fail.append(it["id"] + ": one hint per step")
        for pat, tid in it.get("practice", {}).items():
            if tid not in [t["id"] for t in TARGETED]:
                fail.append("%s: practice item %s missing" % (it["id"], tid))
        return out
    ids = [x["id"] for x in GUIDED + INDEPENDENT + TARGETED] + [EXAMPLE["id"]]
    if len(ids) != len(set(ids)):
        fail.append("arrows: duplicate ids")
    return {"key": "arrows", "objectiveId": "chm221.t4.electron-movement", "prefix": "chem-t4-arw", "source": "lesson-chem-t4-arrows",
            "title": "Electron movement: drawing the curved arrows", "chapter": "Chapters 7 to 9",
            "cards": CARDS, "cardOf": CARD_OF, "errors": ERRORS,
            "example": item_out(EXAMPLE, "example"),
            "guided": [item_out(i, "guided") for i in GUIDED],
            "independent": [item_out(i, "independent") for i in INDEPENDENT],
            "targeted": [item_out(i, "targeted") for i in TARGETED]}
