"""The Test 4 plan, day by day, written for AStarryia: the six-day plan doc's walkthroughs in her voice, plus three short
walkthroughs for Test 4 topics the doc covered only briefly. Every molecule is listed in MOLS so the build can check it.

Step format: (question, answer, hint). She writes each answer on paper, then opens the hint or the answer.
"""

INTRO = [
    "This is your plan to Test 4 on Thursday. Each day lists what to do, in order, and the walkthroughs for that day. "
    "The walkthroughs teach the Readiness Check problems one step at a time, and each one ends with practice for today and a problem for tomorrow.",
]

HOW = [
    ("Read the rule.", "Each walkthrough starts with the rule in one sentence."),
    ("Answer each step on paper first.", "Write your answer, then open the answer to check it. Open the hint only if you're stuck, then try again before you look at the answer."),
    ("Practice today, with your notes.", "Work the practice problem the same day, out loud if you can."),
    ("Tomorrow, on your own.", "Work the next-day problem cold: no notes, no hints, before you open its answer. Only this one shows what you can do on your own."),
    ("Redraw.", "Also tomorrow, redraw the original problem from blank paper."),
]
STOP_RULE = ("The steps always run in the same order: read the structure, name the reagent's job, choose the pathway, draw the arrows, draw the product, say why. "
             "Stop at the first step you can't do. That step is what to learn next; the rest can wait until you have it.")
MISS_RULES = [
    ("You can't say what the reagent does:", "go back to its reagent card, then try a new molecule with the same reagent."),
    ("You know the reagent's job but drew the wrong product:", "you don't need to relearn the reagent. Number the carbons, redraw, then try a new molecule with the same reagent."),
    ("Right product, wrong or missing arrows:", "redo only the arrows, then try the practice problem."),
    ("Right answer, but you can't say why:", "answer the why question again tomorrow, before anything else."),
]
HONEST = [
    "Work done with help, or in the same session as the teaching, is practice, not mastery.",
    "A skill counts as mastered only after you get it right on your own on two different days. The lessons in the app keep that record; this page records nothing.",
    "Every arrow starts at an electron pair (a lone pair or a bond) and ends where that pair goes. If an arrow starts at an atom, an H or a + charge, stop and fix it before you go on.",
]

# ---------------------------------------------------------------- the days (match her calendar entries)
DAYS = [
    {"key": "sun", "date": "2026-11-15", "cal": "chem-1115-session1", "title": "Sunday, Nov 15 · Session 1: mechanisms", "minutes": 75,
     "tasks": [("Readiness Check follow-up questions, cold, 15 min. Your tutor has these; they are not in the app.", None),
               ("Curved arrows lesson in the Chemistry classroom.", "arrows.html"),
               ("Walkthroughs below: Problems 1, 2 and 6. The epoxide walkthrough if time is left.", None)],
     "walks": ["p1", "p2", "p6", "epoxide"],
     "bio": "Biology: Exam 3 study block."},
    {"key": "mon", "date": "2026-11-16", "cal": "chem-1116-review", "title": "Monday, Nov 16 · Session 2: reagents and products", "minutes": 75,
     "tasks": [("Sunday's 'tomorrow, on your own' problems and redraws, cold, 15 min.", None),
               ("Alkene reagents and Alkyne reagents lessons in the Chemistry classroom.", "alkenes.html"),
               ("Walkthroughs below: the reagent cards, Problems 4, 5 and 7, then the two new short ones (ethers from alkenes; which carbocation is more stable).", None),
               ("Build a one-page reagent chart from Klein Chapters 8 and 9, using the Test 4 checklist at the end of today's section.", None)],
     "walks": ["cards", "p4", "p5", "p7", "ether", "stability", "topics"],
     "bio": "Biology: Exam 3 repair on your weakest topics, 40 min. Exam 3 is tomorrow: stop on time and sleep early."},
    {"key": "tue", "date": "2026-11-17", "cal": "chem-1117-session3", "title": "Tuesday, Nov 17 · Session 3 (evening, after Exam 3)", "minutes": 55,
     "tasks": [("Monday's 'tomorrow, on your own' problems and redraws first.", None),
               ("Walkthroughs below: Problem 3 with a model kit, the Part 4 synthesis, and ¹H-NMR basics (15 min).", None),
               ("If a review is due in a Chemistry lesson, do it.", None)],
     "walks": ["p3", "part4", "nmr"],
     "bio": "Biology: Exam 3 today. Chemistry class: Chapter 9 practice lecture."},
    {"key": "wed", "date": "2026-11-18", "cal": "chem-1118-mock", "title": "Wednesday, Nov 18 · Timed practice test", "minutes": 85,
     "tasks": [("Tuesday's 'tomorrow, on your own' problems and redraws, 15 min.", None),
               ("Last year's Test 4 on paper, timed at 53 minutes (your tutor has the copy). Grade it with its key.", None),
               ("Then 30 minutes redrawing every missed product and mechanism from blank paper. Reread the walkthrough each miss points to.", None)],
     "walks": [],
     "bio": "Biology: Lower Limb lab."},
    {"key": "thu", "date": "2026-11-19", "cal": "chem-1119-warmup", "title": "Thursday, Nov 19 · Test 4", "minutes": 15,
     "tasks": [("15 minute warm-up: redraw three mechanisms from blank paper. No new material today.", None)],
     "walks": [], "bio": ""},
]

# ---------------------------------------------------------------- walkthroughs
def W(id, title, rule, problem, steps, fig=None, notes=None, with_help=None, on_own=None, watch=None):
    return {"id": id, "title": title, "rule": rule, "problem": problem, "steps": steps, "fig": fig, "notes": notes or [],
            "with_help": with_help or [], "on_own": on_own or [], "watch": watch or []}

WALKS = {}

WALKS["p1"] = W("p1", "Problem 1: a tertiary alcohol with HBr",
    "With HBr, the acid turns the OH into water, water leaves on its own, and Br⁻ bonds to the carbocation. That's SN1.",
    "2-methyl-2-butanol + HBr → 2-bromo-2-methylbutane",
    [("Read the structure", [("Which carbon holds the OH, and how many carbons is it bonded to?", "Three carbons, so it is tertiary, with no H on it.", "Circle the carbon with the OH and touch each carbon bonded to it.")]),
     ("Name the reagent's job", [("HBr is two pieces. What does each piece do?", "H⁺ is an acid that protonates the OH. Br⁻ is the nucleophile.", "OH⁻ is a terrible leaving group. What could the OH become that leaves as a neutral molecule?")]),
     ("Choose the pathway", [("Can Br⁻ come in from the back of that carbon?", "No. It's too crowded for SN2, and a tertiary carbocation is stable, so SN1.", "Open Dr. Meadows' decision tree to the tertiary branch: no strong base and no heat gives SN1/E1. Substitution gives the alkyl bromide.")]),
     ("Arrows, step 1: proton transfer", [("Where does the first arrow start?", "At a lone pair on the O, pointing to the H of H–Br. A second arrow goes from the H–Br bond onto Br. The O now has three bonds and a + charge.", "Arrows start where electrons are. Which atom has lone pairs to share?")]),
     ("Arrows, step 2: the leaving group leaves", [("What leaves, and which electrons go with it?", "The C–O bond's pair goes onto the O. Water leaves, and the carbon is left with a + charge.", "After it leaves, how many bonds does that carbon have?")]),
     ("Arrows, step 3: the nucleophile attacks", [("What bonds to the carbocation?", "An arrow from a lone pair on Br⁻ to the C⁺.", None)]),
     ("Draw the product", [("Is there a stereocenter?", "No. That carbon holds two CH₃ groups, so no wedge or dash is needed.", None)]),
     ("Say why", [("Why couldn't 1-butanol react with HBr this way?", "A primary carbocation is too unstable to form, so a primary alcohol reacts by SN2 instead: Br⁻ attacks the back of the carbon as water leaves.", None)])],
    fig="k-p1",
    with_help=[("1-methylcyclohexanol + HBr. Draw the product and the full mechanism.", "1-bromo-1-methylcyclohexane, by SN1: protonation, water leaves, Br⁻ attacks.")],
    on_own=[("2-methyl-2-pentanol + HCl. Draw the product and the full mechanism.", "2-chloro-2-methylpentane, by SN1 in the same three steps."),
            ("1-butanol + HBr. Draw the product and the SN2 arrows, and write one sentence on why it can't go through a carbocation.", "1-bromobutane by SN2: the OH is protonated, then Br⁻ attacks the back of C1 as water leaves, in one step. A primary carbocation is too unstable to form.")],
    watch=["An arrow drawn from the H to the O (backwards).", "A missing + charge on the O.", "OH⁻ leaving instead of water.", "Br on a different carbon from where the OH was."])

WALKS["p2"] = W("p2", "Problem 2: HBr adds to an alkene (Markovnikov)",
    "The C=C bond grabs the H first. The H goes where it leaves the more stable carbocation, and Br⁻ bonds to the + carbon.",
    "1-methylcyclohexene + HBr → 1-bromo-1-methylcyclohexane",
    [("Read the structure", [("Number the two C=C carbons. What is attached to each?", "C1 holds the CH₃ and no H. C2 holds one H.", "Write every H on the two C=C carbons before you go on.")]),
     ("Name the reagent's job", [("What gets added to the double bond, and in what order?", "H and Br. H⁺ adds first, then Br⁻.", None)]),
     ("Arrows, step 1", [("There's no lone pair on the alkene. What electrons attack the H?", "The π bond itself. One arrow from the C=C bond to the H of H–Br, a second from the H–Br bond onto Br.", "A double bond is two pairs. One of them can move without breaking the ring.")]),
     ("Decide which carbon gets the H", [("Draw both choices. If H goes on C2, what kind of carbocation is left on C1? If H goes on C1?", "H on C2 leaves a tertiary carbocation on C1; H on C1 leaves a secondary one on C2. Tertiary is more stable, so H goes on C2.", "Count the carbons bonded to each + carbon in your two drawings.")]),
     ("Arrows, step 2", [("Where does the Br⁻ go?", "A lone pair on Br⁻ goes to the C⁺, which is C1.", None)]),
     ("Draw the product and say why", [("How would you get Br on C2 instead?", "Add peroxides (HBr with ROOR), which reverses the placement. Without ROOR, Br goes where the + charge was.", None)])],
    fig="k-p2",
    with_help=[("2-methyl-2-butene + HBr. Draw the product and both steps of the mechanism.", "2-bromo-2-methylbutane (H on C3, tertiary C⁺ on C2).")],
    on_own=[("1-methylcyclopentene + HCl. Draw the product and the mechanism.", "1-chloro-1-methylcyclopentane."),
            ("Product only: 2-methyl-2-butene + HBr with ROOR.", "2-bromo-3-methylbutane, both enantiomers.")],
    watch=["The first arrow starting at the H.", "Br on the carbon that got the H.", "Skipping the comparison in step 4 and guessing."])

WALKS["p6"] = W("p6", "Problem 6: check for a carbocation rearrangement",
    "Every time a carbocation forms, look at the carbons right next to it. If moving an H or a CH₃ from a neighbor makes a more stable carbocation, it moves first, and then the nucleophile bonds.",
    "vinylcyclohexane + HBr → 1-bromo-1-ethylcyclohexane (major), through a hydride shift",
    [("Read the structure", [("Where is the C=C, and what is the carbon right next to it?", "The C=C is on the end of the side chain. The next carbon is a ring carbon with one H.", None)]),
     ("Arrows, step 1: Markovnikov protonation", [("Which C=C carbon gets the H?", "The end CH₂. That leaves a secondary carbocation on the carbon next to the ring.", None)]),
     ("Check the neighbors", [("Look at the ring carbon next to the C⁺. If its H moved over, what would that ring carbon become?", "A tertiary carbocation, which is more stable, so the shift happens.", "Draw the carbocation after the shift and count the carbons bonded to the new + carbon.")]),
     ("Arrows, step 2: the hydride shift", [("Which electrons move?", "The C–H bond's pair, with the H on it, moves to the C⁺. The + charge ends up on the ring carbon.", "The H moves with its two electrons. That's why it's called a hydride (H⁻) shift.")]),
     ("Arrows, step 3, and the product", [("Where does Br⁻ bond now?", "To the ring carbon. The product has Br and an ethyl group on the same ring carbon.", None)]),
     ("Say why, and name the minor product", [("What would you get if Br⁻ attacked before the shift?", "(1-bromoethyl)cyclohexane, the minor product. The major product comes from the more stable carbocation.", None)])],
    fig="k-p6",
    notes=[("The other kind of shift: a methyl shift",
            "When the neighbor has no H but has a CH₃, the CH₃ moves instead. Example: 2,2-dimethyl-3-pentanol + HBr. Water leaves from C3, making a secondary C⁺. "
            "C2 has three CH₃ groups and no H, so one CH₃ moves over with its bonding pair, putting the + on C2 (tertiary). Br⁻ bonds there: 2-bromo-2,3-dimethylpentane, both enantiomers, because C3 is now a stereocenter.",
            "methylshift")],
    with_help=[("3-methyl-1-butene + HBr. Draw the major and minor products and the full mechanism.", "Major: 2-bromo-2-methylbutane (a hydride shift from C3 to the C2 carbocation). Minor: 2-bromo-3-methylbutane, both enantiomers.")],
    on_own=[("3-methyl-1-pentene + HBr. Draw the major and minor products and the full mechanism.", "Major: 3-bromo-3-methylpentane (a hydride shift from C3). Minor: 2-bromo-3-methylpentane; its stereochemistry isn't required."),
            ("2,2-dimethyl-3-hexanol + HBr. Draw the product and the full mechanism, including the shift.", "2-bromo-2,3-dimethylhexane, both enantiomers. Water leaves from C3 (secondary C⁺); C2 has no H, so a CH₃ shifts from C2 to C3 with its bonding pair; the + is now on C2 (tertiary), and Br⁻ bonds there. C3 is now a stereocenter.")],
    watch=["Stopping at the unrearranged product.", "Moving the H or CH₃ without its electrons (an arrow from the atom instead of from the bond).", "Br on the end carbon (that's the ROOR product)."])

WALKS["epoxide"] = W("epoxide", "Opening an epoxide with acid",
    "Acid puts a + charge on the epoxide O, which makes the strained ring easy to open. The nucleophile attacks a ring carbon from the back, the ring opens, and a last proton transfer gives a neutral product.",
    "cyclopentene oxide + dilute H₂SO₄ (water is the nucleophile) → trans-1,2-cyclopentanediol, both enantiomers",
    [("Read the structure", [("Why does a three-membered ring with an O react so easily?", "Ring strain. Opening it releases energy.", None)]),
     ("Arrows, step 1: proton transfer", [("What does the acid do first?", "A lone pair on the epoxide O takes the H of H₃O⁺; the H–O bond's pair goes onto water's O. The epoxide O now has a + charge.", None)]),
     ("Arrows, step 2: the ring opens", [("Which face does water attack from?", "The back, opposite the O. A lone pair on water goes to a ring carbon, and that C–O bond's pair goes onto the O⁺.", None)]),
     ("Arrows, step 3: proton transfer", [("The new O has a + charge and two H. What happens?", "A second water takes one H; the O–H bond's pair stays on the O. H₃O⁺ is a byproduct, so the acid is given back.", None)]),
     ("Draw the product and say why", [("Are the two OH groups cis or trans?", "Trans, because water came in from the face opposite the epoxide O.", None)])],
    notes=[("When the two ring carbons differ",
            "With acid, the nucleophile attacks the more substituted carbon, which holds more of the + charge. With a strong nucleophile and no acid (such as NaOCH₃), it attacks the less crowded carbon by SN2.", None)],
    with_help=[("2,2-dimethyloxirane + CH₃OH with H₂SO₄: the product and all three mechanism steps. Then the product only for the same epoxide + NaOCH₃ in CH₃OH.", "With acid: 2-methoxy-2-methylpropan-1-ol (OCH₃ on the more substituted carbon). With NaOCH₃: 1-methoxy-2-methylpropan-2-ol (OCH₃ on the less crowded carbon).")],
    on_own=[("1-methylcyclopentene + mCPBA, then H₃O⁺. Draw the epoxide, the final product with stereochemistry, and the ring-opening mechanism with byproducts.", "The epoxide, then 1-methylcyclopentane-1,2-diol with the two OH trans, both enantiomers. Water attacks C1, the more substituted carbon.")],
    watch=["Water attacking before the O is protonated.", "Both OH on the same face.", "Leaving out H₃O⁺ as a byproduct."])

# Part 1 cards: shown as a table; the job is hidden until she has said it
CARDS = [
    ("CH₃OH alone", "Weak nucleophile and weak base. On a tertiary halide it waits for the carbocation, then its O bonds to it: the product gets OCH₃ (SN1). It can also take a neighboring H (E1).",
     "A neutral O is too weak to push a leaving group out (no SN2), but it can grab a carbocation. It keeps its CH₃ and loses only its H.",
     "3-bromo-3-ethylpentane in CH₃OH → 3-ethyl-3-methoxypentane (SN1) and 3-ethyl-2-pentene (E1)", "OH instead of OCH₃"),
    ("TsCl, pyridine", "Turns OH into OTs, a good leaving group. The carbon keeps its stereochemistry.",
     "The O attacks the S of TsCl. The C–O bond never breaks, so nothing happens at the carbon. Pyridine soaks up the HCl.",
     "trans-2-methylcyclopentanol → trans-2-methylcyclopentyl tosylate (OTs still trans to the CH₃)", "Cl in the product; flipping the carbon at this step"),
    ("KOtBu", "Strong, bulky base: E2. When there is a choice, it makes the less substituted alkene.",
     "It is too big to reach a crowded H, so it takes the most exposed one.",
     "2-bromo-2-methylbutane → 2-methyl-1-butene (major) and 2-methyl-2-butene (minor)", "An SN2 product with OtBu attached"),
    ("H₂SO₄, heat", "Protonates the OH so water leaves, then a neighboring H is lost: dehydration (E1) to the more substituted alkene. The carbocation can rearrange first.",
     "Heat favors elimination, and HSO₄⁻ is too weak a nucleophile to stay on the carbon.",
     "2-methylcyclohexanol → 1-methylcyclohexene (major)", "Adding SO₄ or OH; a substitution product"),
    ("NaNH₂", "Very strong base: removes the H on the end of a terminal alkyne, making an acetylide. The acetylide then does SN2 on a methyl or primary halide, making a new C–C bond.",
     "The alkyne H has a pKa of about 25; NH₃ has a pKa of 38, so NH₂⁻ is strong enough to take it.",
     "1-hexyne + NaNH₂, then CH₃I → 2-heptyne", "Adding NH₂; using a secondary halide (E2 wins)"),
    ("H₂, Lindlar's catalyst", "Adds one H₂ to the same face (syn) and stops at the alkene: an internal alkyne gives the cis alkene.",
     "The catalyst is \"poisoned\" so it can't reduce the alkene that forms.",
     "2-heptyne → cis-2-heptene", "Trans alkene (that's Na, NH₃); alkane (that's H₂, Pd)"),
    ("Br₂ in CCl₄", "Adds one Br to each C=C carbon from opposite faces (anti), through a bromonium ion.",
     "The bridging Br blocks one face, so Br⁻ must come in from the other.",
     "Propene → 1,2-dibromopropane, both enantiomers (C2 becomes a stereocenter)", "Syn addition; only one Br"),
    ("BH₃·THF, then H₂O₂ and NaOH", "Adds H and OH to the same face (syn). The OH goes on the less substituted carbon (anti-Markovnikov). No rearrangement.",
     "B goes to the less crowded carbon, and the oxidation swaps B for OH without moving it.",
     "1-methylcyclohexene (the alkene from Problem 2) → trans-2-methylcyclohexan-1-ol, both enantiomers. Compare: HBr put Br on C1; this puts OH on C2.", "OH on the more substituted carbon"),
]
CARD_PRACTICE = [
    ("2-chloro-2-methylbutane in CH₃OH", "2-methoxy-2-methylbutane (SN1); 2-methyl-2-butene (E1, major alkene) and 2-methyl-1-butene (minor)."),
    ("cis-3-methylcyclohexanol + TsCl, pyridine", "cis-3-methylcyclohexyl tosylate (still cis)."),
    ("1-bromo-1-methylcyclohexane + KOtBu", "Methylenecyclohexane (major); 1-methylcyclohexene (minor)."),
    ("1-methylcyclopentanol + H₂SO₄, heat", "1-methylcyclopentene."),
    ("1-hexyne + NaNH₂, then CH₃CH₂Br", "3-octyne (CH₃CH₂C≡CCH₂CH₂CH₂CH₃): the acetylide's end carbon bonds to the CH₂ of bromoethane."),
    ("5-decyne + H₂, Lindlar's catalyst", "cis-5-decene."),
    ("1-methylcyclohexene + Br₂ in CCl₄", "trans-1,2-dibromo-1-methylcyclohexane, both enantiomers."),
    ("1-ethylcyclohexene + BH₃·THF, then H₂O₂ and NaOH", "trans-2-ethylcyclohexan-1-ol, both enantiomers."),
]

WALKS["p4"] = W("p4", "Problem 4: the solvent is the nucleophile (SN1 and E1)",
    "A tertiary halide in methanol, with no strong base: the halide leaves on its own. Then methanol either bonds to the carbocation (SN1, OCH₃) or takes a neighboring H (E1, an alkene).",
    "1-chloro-1-methylcyclohexane in CH₃OH → 1-methoxy-1-methylcyclohexane and 1-methylcyclohexene",
    [("Read the structure", [("What kind of carbon holds the Cl?", "Tertiary.", None)]),
     ("Name the reagent's job", [("Is CH₃OH a strong or weak nucleophile? A strong or weak base?", "Weak and weak. It's also the solvent.", None)]),
     ("Choose the pathway", [("What does Dr. Meadows' tree say for tertiary, no strong base, no heat?", "SN1/E1, so both products form.", None)]),
     ("Arrows: the SN1 path", [("What happens first, before methanol does anything?", "The C–Cl bond's pair goes onto Cl, leaving a tertiary C⁺. Then a lone pair on methanol's O attacks the C⁺, making an O with a + charge. Then a second methanol takes the H off that O.", "After the O bonds to the carbon, how many bonds does the O have?")]),
     ("Arrows: the E1 path", [("Instead of bonding, methanol can act as a base. Which H does it take?", "An H on a carbon next to the C⁺. One arrow from a methanol lone pair to that H; one from the C–H bond to make the new C=C.", None)]),
     ("Draw the products and say why", [("Why does the product have OCH₃ and not OH?", "The nucleophile was methanol. It keeps its CH₃ and loses only the H on its O.", None),
                                        ("Which alkene is the major one?", "1-methylcyclohexene, with the C=C in the ring, because it's more substituted. Methylenecyclohexane (C=CH₂ outside the ring) is minor.", None)])],
    fig="k-p4",
    with_help=[("2-bromo-2-methylpropane in ethanol (CH₃CH₂OH). Both products and both mechanisms.", "2-ethoxy-2-methylpropane (SN1); 2-methylpropene (E1).")],
    on_own=[("1-bromo-1-methylcyclopentane in CH₃OH. The SN1 product, the major and minor E1 products, and the SN1 mechanism.", "1-methoxy-1-methylcyclopentane (SN1); 1-methylcyclopentene (E1, major); methylenecyclopentane (E1, minor).")],
    watch=["OH instead of OCH₃ (the Test 3 slip).", "Methanol attacking before the Cl leaves (that's SN2, which can't happen at a tertiary carbon).", "Leaving the + charge on the O."])

WALKS["p5"] = W("p5", "Problem 5: make a leaving group, then SN2 flips the carbon",
    "TsCl turns the OH into a good leaving group without touching the carbon. Then a strong nucleophile comes in from the back (SN2), and the carbon flips.",
    "2-butanol (OH on a wedge) → TsCl, pyridine → NaCN in DMSO → 2-methylbutanenitrile, CN on a dash",
    [("Read the structure", [("What kind of carbon holds the OH, and is it a stereocenter?", "Secondary, and yes: the OH is on a wedge.", None)]),
     ("Step 1: TsCl", [("What does TsCl change, and what doesn't it change?", "OH becomes OTs. The carbon isn't touched, so OTs stays on the wedge. No Cl ends up on the molecule.", "The O attacks the S of TsCl. Does the C–O bond break?")]),
     ("Step 2: choose the pathway", [("CN⁻, DMSO, secondary carbon. What does the tree say?", "CN⁻ is a strong nucleophile and a weak base; DMSO is polar aprotic; secondary with an aprotic solvent gives SN2.", None)]),
     ("Arrows", [("Where does the CN⁻'s arrow start, and which side does it come from?", "The lone pair on the carbon of CN⁻, aimed at the back of the C–OTs carbon, opposite the OTs. A second arrow goes from the C–OTs bond onto the O.", None)]),
     ("Draw the product", [("OTs was on a wedge. Where is the CN?", "On a dash. Backside attack flips the carbon.", "In a model kit, push the CN in from behind and watch the other three groups fold over like an umbrella.")]),
     ("Check the carbons and say why", [("How many carbons did you start with, and how many are in the product?", "4, then 5. The CN adds one carbon.", None),
                                        ("Why not just add NaCN to the alcohol?", "OH⁻ is a bad leaving group, so the SN2 can't happen until the OH is converted.", None)])],
    fig="k-p5",
    with_help=[("2-pentanol with the OH on a dash → TsCl, pyridine → NaSCH₃ in DMSO. Draw both products with stereochemistry.", "The tosylate with OTs on the dash; then 2-(methylthio)pentane with SCH₃ on a wedge.")],
    on_own=[("cis-4-methylcyclohexanol → TsCl, pyridine → NaCN in DMSO. Draw both products and say whether the final product is cis or trans.", "cis-4-methylcyclohexyl tosylate; then trans-4-methylcyclohexane-1-carbonitrile (the flip turns cis into trans).")],
    watch=["Cl in a product (the Test 3 slip).", "The carbon flipping at the TsCl step.", "CN on the same wedge as the OTs.", "A 4-carbon product."])

WALKS["p7"] = W("p7", "Problem 7: alkyne hydration and tautomerization",
    "Water adds to the triple bond Markovnikov, giving an enol (an OH on a C=C). An enol never stays: it rearranges to the C=O form, a ketone.",
    "1-pentyne + H₂SO₄, H₂O, HgSO₄ → 2-pentanone",
    [("Read the structure", [("Which triple-bond carbon has the H, and which is on the inside?", "C1, the end carbon, has the H. C2 is the inside carbon.", None)]),
     ("Name the reagent's job", [("Where does the OH go?", "On C2, the more substituted carbon (Markovnikov). That gives the enol: OH on C2, a C=C between C1 and C2.", None)]),
     ("Arrows, tautomerization step 1 (acid)", [("The enol's C=C grabs a proton. Which carbon gets the H?", "An arrow from the C=C bond to the H of H₃O⁺, and from that H–O bond onto the O. The H goes on C1, leaving the + on C2, next to the O.", "Which + carbon has an O lone pair right next to it to help hold the charge?")]),
     ("Arrows, tautomerization step 2", [("The O now holds a + charge and an H. What takes the H?", "A lone pair on water takes the O–H proton, and the O–H bond's pair becomes the C=O π bond. H₃O⁺ is given back.", None)]),
     ("Draw the product and say why", [("Ketone or aldehyde, and why?", "A ketone, because the O ended up on C2, an inside carbon. An aldehyde needs the O on C1.", None),
                                       ("How would you make the aldehyde instead?", "9-BBN (or disiamylborane), then H₂O₂ and NaOH: anti-Markovnikov, OH on C1.", None)])],
    fig="k-p7",
    notes=[("The same tautomerization with base",
            "After hydroboration-oxidation, NaOH does the tautomerization, and you need these arrows too. Step 1: a lone pair on OH⁻ takes the H off the enol's O, and the O–H bond's pair stays on the O (now O⁻). "
            "Step 2: a lone pair on O⁻ swings down to make the C=O π bond, while the C=C bond's pair takes an H from water (an arrow from the H–O bond onto that O). OH⁻ is given back.", None)],
    with_help=[("1-hexyne + H₂SO₄, H₂O, HgSO₄. The enol, the ketone, and the acid tautomerization arrows.", "The enol with OH on C2, then 2-hexanone.")],
    on_own=[("3-hexyne + H₂SO₄, H₂O, HgSO₄, and why only one product forms.", "3-hexanone. Only one product: the alkyne is symmetric, so the OH on either carbon gives the same ketone."),
            ("1-hexyne + 9-BBN, then H₂O₂ and NaOH, with the base tautomerization arrows.", "The enol with OH on C1, then hexanal (base tautomerization).")],
    watch=["Stopping at the enol.", "An aldehyde from the HgSO₄ conditions.", "An alcohol (no C=C left) as the answer.", "The first acid arrow starting at the H₃O⁺ instead of the C=C bond."])

# New: a carbocation next to an O (last year's Test 4 asked this kind of comparison; these are different cations)
WALKS["stability"] = W("stability", "New: which carbocation is more stable? Look for an O right next to the C⁺",
    "A C⁺ with an O bonded directly to it is extra stable, because the O shares a lone pair and makes a C=O⁺ form in which every atom has an octet. The O has to be bonded to the C⁺ itself; one carbon farther away, it can't share.",
    "Rank these three cations from most to least stable: A, the C⁺ on C1 of 1-methoxybutane; B, the tertiary C⁺ of 2-methylbutane; C, a CH₂⁺ with the O on the next carbon over (CH₃O–CH₂–CH₂⁺)",
    [("Read each structure", [("For each cation, how many carbons are bonded to the C⁺, and is an O bonded to it?", "A: one carbon and the O are bonded to the C⁺. B: three carbons (tertiary), no O. C: one carbon (primary); the O is on the next carbon, not on the C⁺.", "Circle the + carbon in each drawing, then touch every atom bonded to it.")]),
     ("Can an O share a lone pair?", [("In which cation can an O lone pair form a double bond to the C⁺? Draw that form.", "Only A. The arrow goes from an O lone pair to the C–O bond, giving C=O⁺ with the + on the O. In that form the carbon has a full octet.", "The lone pair can only move into a bond the O already makes. Is the O bonded to the C⁺?")]),
     ("Rank them", [("Most stable to least stable?", "A > B > C. A has the O sharing its pair (resonance). B is tertiary. C is primary, and its O is too far away to share (it even pulls electrons away a little).", None)]),
     ("Say why", [("Why does an octet on every atom matter so much?", "A carbocation's problem is a carbon with only six electrons. In A's C=O⁺ form, no atom is short of an octet. That is why a C⁺ with an O bonded to it beats a plain tertiary carbocation like B.", None)])],
    fig="stability",
    notes=[("Where you've seen this", "This is why the enol in Problem 7 takes its H on C1: the + charge lands on C2, right next to the O, which shares a lone pair.", None)],
    with_help=[("Which is more stable, and why: the C⁺ on C1 of 1-methoxycyclohexane (the OCH₃ is on the + carbon), or the C⁺ on C2 of methoxycyclohexane (the OCH₃ is on the next carbon)?", "The first one. Its O is bonded to the C⁺ and shares a lone pair (C=O⁺ form). In the second, the O is one carbon away and can't share; that cation is just secondary.")],
    on_own=[("Rank from most to least stable, and draw the resonance form for the winner: (CH₃)₂CH⁺ (isopropyl), (CH₃)₃C⁺ (tert-butyl), and CH₃–CH⁺–O–CH₂CH₃.", "CH₃–CH⁺–O–CH₂CH₃ > (CH₃)₃C⁺ > (CH₃)₂CH⁺. The first has an O bonded to the C⁺ that shares a lone pair (CH₃–CH=O⁺–CH₂CH₃); tert-butyl is tertiary; isopropyl is secondary.")],
    watch=["Ranking only by counting carbons and ignoring the O.", "Giving credit to an O on a neighboring carbon instead of on the C⁺ itself.", "Drawing the resonance arrow from the C⁺ toward the O (arrows start at the lone pair)."])

# New: an alcohol adds across a C=C with acid (the carbocation version; alkoxymercuration is the no-shift version)
WALKS["ether"] = W("ether", "New: an alcohol adds across a C=C with acid (makes an ether)",
    "With a strong acid in an alcohol, the C=C takes an H⁺ (Markovnikov), the alcohol's O bonds to the carbocation, and a proton transfer gives an ether. It's the same as acid-catalyzed hydration, with ROH in place of water, and the carbocation can rearrange.",
    "2-methylpropene + CH₃OH, H₂SO₄ → tert-butyl methyl ether (2-methoxy-2-methylpropane)",
    [("Read the structure", [("Which C=C carbon holds more carbons?", "C2 holds two CH₃ groups; C1 (the CH₂) holds none.", None)]),
     ("Name the reagent's job", [("What does the H₂SO₄ do, and what does the CH₃OH do?", "H₂SO₄ supplies H⁺ (in methanol it is CH₃OH₂⁺). CH₃OH is the nucleophile and the solvent.", None)]),
     ("Arrows, step 1: the alkene takes the H⁺", [("Where do the first two arrows go, and where does the + end up?", "From the C=C bond to the H on CH₃OH₂⁺, and from that H–O bond onto the O. The H goes on C1, so the + is on C2: a tertiary carbocation.", "Draw both choices and compare the carbocations, as in Problem 2.")]),
     ("Check for a shift", [("Could an H or CH₃ shift make this carbocation more stable?", "No. It's already tertiary.", None)]),
     ("Arrows, step 2: the alcohol attacks", [("What bonds to the C⁺?", "A lone pair on methanol's O. The O now has three bonds and a + charge.", None)]),
     ("Arrows, step 3: proton transfer", [("How does the O lose its +?", "A second methanol takes the H on that O; the O–H bond's pair stays on the O. The product is the ether, and CH₃OH₂⁺ is given back.", None)])],
    fig="ether-mech",
    notes=[("Compare alkoxymercuration", "Hg(OAc)₂ with an alcohol, then NaBH₄, gives the same Markovnikov ether, but no free carbocation forms, so nothing shifts. With acid, check for a shift first.", None)],
    with_help=[("1-methylcyclopentene + CH₃CH₂OH, H₂SO₄. The product and all three mechanism steps.", "1-ethoxy-1-methylcyclopentane. The H goes on C2, the tertiary C⁺ is on C1, ethanol's O bonds there, and a second ethanol takes the H off the O.")],
    on_own=[("3-methyl-1-butene + CH₃CH₂OH, H₂SO₄. The major product and the full mechanism. Then, product only: the same alkene with Hg(OAc)₂ in CH₃CH₂OH, then NaBH₄.",
             "With acid: 2-ethoxy-2-methylbutane. The H goes on C1, giving a secondary C⁺ on C2; a hydride shifts from C3, putting the + on C3 (tertiary), and ethanol bonds there. Numbered for the product's name, that carbon is C2. "
             "With alkoxymercuration: 2-ethoxy-3-methylbutane, both enantiomers, with no shift.")],
    watch=["OH instead of OR (water isn't the nucleophile here).", "Forgetting the last proton transfer, leaving O⁺ in the product.", "Missing the hydride shift when the first carbocation is secondary."])

TOPICS = [
    ("8", "Acid-catalyzed hydration", "Dilute H₂SO₄ (H₃O⁺)", "Markovnikov OH; the carbocation can rearrange", "1-methylcyclohexene → 1-methylcyclohexanol"),
    ("8", "Oxymercuration", "Hg(OAc)₂, H₂O; then NaBH₄", "Markovnikov OH, no rearrangement", "3-methyl-1-butene → 3-methyl-2-butanol, both enantiomers. Compare Problem 6's practice, where HBr does shift."),
    ("8", "Alkoxymercuration", "Hg(OAc)₂, an alcohol; then NaBH₄", "Markovnikov OR, no rearrangement", "1-hexene with CH₃OH → 2-methoxyhexane, both enantiomers"),
    ("8", "Alcohol with acid", "ROH, H₂SO₄", "Markovnikov OR; the carbocation can rearrange", "2-methylpropene with CH₃OH → tert-butyl methyl ether (walkthrough above)"),
    ("8", "Halohydrin", "Br₂, H₂O", "OH on the more substituted carbon, Br on the other, anti", "1-methylcyclohexene → trans-2-bromo-1-methylcyclohexan-1-ol, both enantiomers"),
    ("8", "HBr with peroxides", "HBr, ROOR", "Anti-Markovnikov Br", "1-hexene → 1-bromohexane"),
    ("8", "Hydrogenation", "H₂ with Pd, Pt or Ni", "Adds H₂ to the same face; alkene to alkane", "1,2-dimethylcyclohexene → cis-1,2-dimethylcyclohexane (meso)"),
    ("8", "Syn dihydroxylation", "OsO₄; then NaHSO₃, H₂O", "Two OH on the same face", "(Z)-4-octene → meso-octane-4,5-diol"),
    ("8", "Anti dihydroxylation", "RCO₃H (such as mCPBA); then H₃O⁺", "Epoxide, then two OH on opposite faces", "Cyclopentene → trans-1,2-cyclopentanediol, both enantiomers (epoxide walkthrough, Sunday)"),
    ("8", "Ozonolysis", "O₃; then DMS", "Cuts the C=C; each carbon gets a C=O. A ring C=C gives one molecule with two C=O groups.", "1-methylcyclohexene → 6-oxoheptanal"),
    ("9", "Choosing a base for an alkyne", "Compare pKa values", "A base works only if its conjugate acid's pKa is above 25 (the alkyne H)", "NaNH₂ works (NH₃, 38); NaOH doesn't (H₂O, 15.7)"),
    ("9", "Making an alkyne", "Br₂; then excess NaNH₂; then H₂O", "Two E2 eliminations remove two HBr", "1-hexene → 1,2-dibromohexane → 1-hexyne"),
    ("9", "HBr, two equivalents", "2 HBr", "Markovnikov twice: both Br on the same carbon", "1-hexyne → 2,2-dibromohexane"),
    ("9", "Br₂, excess", "2 Br₂", "Two Br on each former alkyne carbon", "1-hexyne → 1,1,2,2-tetrabromohexane"),
    ("9", "Alkyne ozonolysis", "O₃; then H₂O", "Each alkyne carbon becomes COOH; a terminal CH becomes CO₂. A ring alkyne opens into one molecule with a COOH at each end.", "3-hexyne → two propanoic acids; cyclooctyne → octanedioic acid (one molecule)"),
]

WALKS["p3"] = W("p3", "Problem 3: Br₂ adds anti, racemic or meso",
    "Br₂ puts one Br on each C=C carbon. The first Br bridges both carbons and blocks that face, so the second Br comes in from the opposite face.",
    "cyclopentene + Br₂ in CCl₄ → trans-1,2-dibromocyclopentane, both enantiomers. Use a model kit for this one.",
    [("Read the structure", [("How many carbons, and what is on each C=C carbon?", "5 carbons, one H on each C=C carbon.", None)]),
     ("Name the reagent's job", [("What does Br₂ add, and from which faces?", "Two Br, one on each carbon, from opposite faces (anti).", None)]),
     ("Arrows, step 1: the bromonium ion", [("The π bond attacks one Br. What else has to move?", "Three arrows. The π bond to the near Br; a lone pair on that Br to the other C=C carbon; the Br–Br bond onto the far Br, which leaves as Br⁻. The result is a three-membered ring with Br⁺.", "Build it in the model kit. Put the Br on top, touching both carbons.")]),
     ("Arrows, step 2: opening the ring", [("The top face is blocked. Where does Br⁻ come in?", "A lone pair on Br⁻ goes to one ring carbon from the bottom face; the C–Br bond to that carbon goes onto the bridging Br.", None)]),
     ("Draw the product", [("Which Br is on a wedge and which on a dash?", "One of each. That's trans.", "In the kit, the first Br stayed on top and the second came from the bottom.")]),
     ("Say why it's racemic", [("Is your product the same as its mirror image?", "No. The trans product has no internal mirror plane, so it's chiral. The bridge forms equally on the top and bottom faces, so both enantiomers form in equal amounts.", "Build both enantiomers in the kit and try to stack them.")])],
    fig="k-p3",
    notes=[("The rule for open chains", "Anti addition to a cis alkene gives a racemic pair; anti addition to a trans alkene gives a meso compound, when both ends carry the same group.", None)],
    with_help=[("cyclohexene + Br₂. The product with wedge and dash, and say racemic or meso.", "trans-1,2-dibromocyclohexane, (1R,2R) and (1S,2S): racemic.")],
    on_own=[("(Z)-3-hexene + Br₂. Draw the product with wedges and dashes and say racemic or meso.", "(3R,4R)- and (3S,4S)-3,4-dibromohexane: racemic."),
            ("(E)-3-hexene + Br₂. Draw the product with wedges and dashes and say racemic or meso.", "(3R,4S)-3,4-dibromohexane: meso.")],
    watch=["Both Br on wedges. If you said \"anti\" in step 2, that's a drawing slip; if you said \"syn\", relearn the bromonium ion.", "Calling a trans ring product meso.", "Drawing only one enantiomer without writing \"racemic\"."])

WALKS["part4"] = W("part4", "Part 4: working a synthesis backward",
    "Start from the product. Count its carbons, find the bond you have to make, make that bond with an acetylide and a primary halide, then pick the reduction that gives the right alkene.",
    "propyne → cis-2-hexene",
    [("Count the carbons", [("How many carbons in the product? In the starting material? How many do you need to add?", "6 and 3, so add 3.", "Number the product's carbons and circle the three that came from propyne.")]),
     ("Find the new bond", [("Which bond in the product didn't exist in propyne?", "The C3–C4 bond, between the old alkyne carbon and the propyl group.", None)]),
     ("Work back one step", [("What reagent makes a cis alkene, and what does it start from?", "H₂ with Lindlar's catalyst, from an alkyne. So the step before the product is 2-hexyne.", None)]),
     ("Work back to the starting material", [("How do you make a new C–C bond on the end of propyne?", "NaNH₂ removes the alkyne H, making an acetylide; the acetylide does SN2 on a primary halide, 1-bromopropane.", "Why not 2-bromopropane?")]),
     ("Write it forward", [("Write each reagent over an arrow and draw each molecule you make.", "propyne → (NaNH₂) acetylide → (CH₃CH₂CH₂Br) 2-hexyne → (H₂, Lindlar) cis-2-hexene.", None)])],
    fig="k-syn",
    notes=[("The three alkyne reductions, side by side", "H₂ with Lindlar's catalyst gives the cis alkene. Na in NH₃ gives the trans alkene. H₂ with Pd goes all the way to the alkane.", None)],
    with_help=[("Make cis-3-heptene from 1-pentyne and any alkyl halide.", "NaNH₂; then CH₃CH₂Br (gives 3-heptyne); then H₂, Lindlar's catalyst.")],
    on_own=[("Make trans-4-octene. Every carbon must come from acetylene and alkyl halides with 3 carbons or fewer.", "Acetylene + NaNH₂; CH₃CH₂CH₂Br (1-pentyne); NaNH₂; CH₃CH₂CH₂Br (4-octyne); Na, NH₃. Hint, if you needed it: it takes two alkylations."),
            ("Challenge, if time: make 5-decanone from 1-hexyne and any alkyl halide.", "NaNH₂; then CH₃CH₂CH₂CH₂Br (gives 5-decyne); then H₂SO₄, H₂O, HgSO₄. The alkyne is symmetric, so only one ketone forms.")],
    watch=["A secondary halide.", "NaOH as the base (too weak to remove the alkyne H).", "The wrong reduction for cis or trans.", "Skipping the drawn intermediates (Dr. Meadows grades every molecule along the route)."])

WALKS["nmr"] = W("nmr", "¹H-NMR basics (added for safety)",
    "Each set of matching H atoms gives one signal. The signal's area says how many H are in the set, its position says what is nearby, and its splitting says how many H sit on the neighboring carbons.",
    "Whether ¹H-NMR is on Test 4 isn't confirmed (it isn't in Chapters 8 and 9). Check Canvas or ask Dr. Meadows. Until then, spend 15 minutes here.",
    [("Count the signals", [("Which H atoms in this molecule match each other?", "H atoms on the same carbon, or on carbons that match by symmetry, give one signal.", "Circle each set of matching H atoms in a different color.")]),
     ("Read the integration", [("How many H are in each set?", "Each signal's integration number equals the H count of one set.", None)]),
     ("Read the chemical shift", [("What is right next to each set of H atoms?", "H on plain alkyl carbons appear at about 0.7 to 1.8 ppm; next to a C=O, 2.0 to 2.7; on an alkyne carbon, 1.8 to 3.1; next to an O (alcohol or ether), 3.3 to 4.5; on a C=C, 4.5 to 6.5; an aldehyde H, 9.5 to 10.5. These ranges come from a standard reference table; real values can land a little outside them.", None)]),
     ("Read the splitting", [("How many H are on the carbons right next to this set?", "n neighboring H split the signal into n + 1 peaks. A CH₃ next to a CH₂ is a triplet; a CH₂ next to a CH₃ is a quartet; a set with no neighboring H is a singlet.", None)])],
    notes=[("Worked examples, from measured spectra",
            "3-pentanone: two signals. 1.06 ppm, 6H, triplet (the two CH₃ groups); 2.44 ppm, 4H, quartet (the two CH₂ groups next to the C=O). "
            "tert-butyl methyl ether: two singlets. 1.19 ppm, 9H (the tert-butyl group); 3.21 ppm, 3H (the OCH₃, just below the table's 3.3 to 4.5 range). Source: ChemicalBook spectra.", None)],
    on_own=[("For 2-butanone, predict how many signals, the integration and splitting of each, and which range of the table each falls in.",
             "Three signals. The CH₃ at the end of the ethyl group: 3H, triplet, alkyl range (about 0.7 to 1.3 ppm). The CH₃ on the C=O: 3H, singlet, next-to-C=O range (2.0 to 2.7). The CH₂: 2H, quartet, also next-to-C=O range. This applies the rules and the table; it was not read from a measured spectrum.")])

# ---------------------------------------------------------------- molecules on the page, for the build's checks
# role: "taught" = in a walkthrough, card or table; "practice" = a practice problem or its answer.
MOLS = [
    # Problem 1
    ("p1", "CCC(C)(C)O"), ("p1", "CCC(C)(C)Br"), ("p1", "CC1(O)CCCCC1"), ("p1", "CC1(Br)CCCCC1"), ("p1", "CCCC(C)(C)O"), ("p1", "CCCC(C)(C)Cl"), ("p1", "CCCCO"), ("p1", "CCCCBr"),
    # Problem 2
    ("p2", "CC1=CCCCC1"), ("p2", "CC=C(C)C"), ("p2", "CCC(C)(C)Br"), ("p2", "CC1=CCCC1"), ("p2", "CC1(Cl)CCCC1"), ("p2", "CC(Br)C(C)C"),
    # Problem 6 and the methyl shift
    ("p6", "C=CC1CCCCC1"), ("p6", "CCC1(Br)CCCCC1"), ("p6", "CC(Br)C1CCCCC1"), ("p6", "CCC(O)C(C)(C)C"), ("p6", "CCC(C)C(C)(C)Br"),
    ("p6", "C=CC(C)C"), ("p6", "CC(C)C(C)Br"), ("p6", "C=CC(C)CC"), ("p6", "CCC(C)(Br)CC"), ("p6", "CC(Br)C(C)CC"), ("p6", "CCCC(O)C(C)(C)C"), ("p6", "CCCC(C)C(C)(C)Br"),
    # epoxide
    ("epoxide", "C1CC2OC2C1"), ("epoxide", "OC1CCCC1O"), ("epoxide", "CC1(C)CO1"), ("epoxide", "COC(C)(C)CO"), ("epoxide", "COCC(C)(C)O"), ("epoxide", "CC12CCCC1O2"), ("epoxide", "CC1(O)CCCC1O"),
    # cards and card practice
    ("cards", "CCC(Br)(CC)CC"), ("cards", "CCC(CC)(CC)OC"), ("cards", "CC=C(CC)CC"), ("cards", "CC1CCCC1O"), ("cards", "C=C(C)CC"), ("cards", "CC1CCCCC1O"),
    ("cards", "CCCCC#C"), ("cards", "CCCCC#CC"), ("cards", "CCCCC=CC"), ("cards", "C=CC"), ("cards", "CC(Br)CBr"), ("cards", "CC1CCCCC1O"),
    ("cards", "CCC(C)(C)Cl"), ("cards", "CCC(C)(C)OC"), ("cards", "CC1CCCC(O)C1"), ("cards", "C=C1CCCCC1"), ("cards", "CC1(O)CCCC1"),
    ("cards", "CCCCC#CCC"), ("cards", "CCCCC#CCCCC"), ("cards", "CCCCC=CCCCC"), ("cards", "CC1(Br)CCCCC1Br"), ("cards", "CCC1=CCCCC1"), ("cards", "CCC1CCCCC1O"),
    # Problems 4, 5, 7
    ("p4", "CC1(Cl)CCCCC1"), ("p4", "COC1(C)CCCCC1"), ("p4", "CC(C)(C)Br"), ("p4", "CCOC(C)(C)C"), ("p4", "C=C(C)C"), ("p4", "CC1(Br)CCCC1"), ("p4", "COC1(C)CCCC1"), ("p4", "C=C1CCCC1"),
    ("p5", "CCC(C)O"), ("p5", "CCC(C)C#N"), ("p5", "CCCC(C)O"), ("p5", "CCCC(C)SC"), ("p5", "CC1CCC(O)CC1"), ("p5", "CC1CCC(C#N)CC1"),
    ("p7", "C#CCCC"), ("p7", "CC(=O)CCC"), ("p7", "C#CCCCC"), ("p7", "CC(=O)CCCC"), ("p7", "CCC#CCC"), ("p7", "CCC(=O)CCC"), ("p7", "O=CCCCCC"),
    # new: stability
    ("stability", "CCC[CH+]OC"), ("stability", "CC[C+](C)C"), ("stability", "COCC[CH2+]"), ("stability", "CCCC=[O+]C"),
    ("stability", "CO[C+]1CCCCC1"), ("stability", "COC1CCCC[CH+]1"), ("stability", "C[CH+]C"), ("stability", "C[C+](C)C"), ("stability", "CCO[CH+]C"),
    # new: ether
    ("ether", "C=C(C)C"), ("ether", "COC(C)(C)C"), ("ether", "CC1=CCCC1"), ("ether", "CCOC1(C)CCCC1"), ("ether", "C=CC(C)C"), ("ether", "CCOC(C)(C)CC"), ("ether", "CCOC(C)C(C)C"),
    # topics table
    ("topics", "CC1(O)CCCCC1"), ("topics", "CC(O)C(C)C"), ("topics", "C=CCCCC"), ("topics", "COC(C)CCCC"), ("topics", "CC1(O)CCCCC1Br"), ("topics", "BrCCCCCC"),
    ("topics", "CC1=C(C)CCCC1"), ("topics", "CC1CCCCC1C"), ("topics", "CCCC=CCCC"), ("topics", "CCCC(O)C(O)CCC"), ("topics", "CC(=O)CCCCC=O"),
    ("topics", "BrCC(Br)CCCC"), ("topics", "CCCCC(C)(Br)Br"), ("topics", "CCCCC(Br)(Br)C(Br)Br"), ("topics", "CCC(=O)O"), ("topics", "C1CCCC#CCC1"), ("topics", "OC(=O)CCCCCCC(=O)O"),
    # Problem 3, Part 4, NMR
    ("p3", "C1=CCCC1"), ("p3", "BrC1CCCC1Br"), ("p3", "C1=CCCCC1"), ("p3", "BrC1CCCCC1Br"), ("p3", "CCC=CCC"), ("p3", "CCC(Br)C(Br)CC"),
    ("part4", "C#CC"), ("part4", "CC#CCCC"), ("part4", "CC=CCCC"), ("part4", "C#CCCC"), ("part4", "CCC#CCCC"), ("part4", "CCC=CCCC"),
    ("part4", "C#C"), ("part4", "CCCC#CCCC"), ("part4", "CCCC=CCCC"), ("part4", "CCCCC#CCCCC"), ("part4", "CCCCC(=O)CCCCC"),
    ("nmr", "CCC(=O)CC"), ("nmr", "COC(C)(C)C"), ("nmr", "CCC(C)=O"),
]

# Reactions on the page whose answers the build checks by formula (starting material + what is added = product)
REACTIONS = [
    ("p6 methyl shift", "CCC(O)C(C)(C)C", "CCC(C)C(C)(C)Br", "+HBr-H2O"),
    ("p6 on your own", "CCCC(O)C(C)(C)C", "CCCC(C)C(C)(C)Br", "+HBr-H2O"),
    ("ether worked", "C=C(C)C", "COC(C)(C)C", "+CH4O"),
    ("ether with help", "CC1=CCCC1", "CCOC1(C)CCCC1", "+C2H6O"),
    ("ether on your own (acid)", "C=CC(C)C", "CCOC(C)(C)CC", "+C2H6O"),
    ("ether on your own (Hg)", "C=CC(C)C", "CCOC(C)C(C)C", "+C2H6O"),
    ("card 5 practice", "CCCCC#C", "CCCCC#CCC", "+C2H4"),
    ("OsO4 row", "CCCC=CCCC", "CCCC(O)C(O)CCC", "+H2O2"),
    ("part4 with help", "C#CCCC", "CCC=CCCC", "+C2H6"),
    ("part4 challenge", "CCCCC#C", "CCCCC(=O)CCCCC", "+C4H10O"),
    ("cyclooctyne ozonolysis", "C1CCCC#CCC1", "OC(=O)CCCCCCC(=O)O", "+H2O4"),
]
