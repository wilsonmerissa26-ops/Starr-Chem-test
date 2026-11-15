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
DAY_RULE = "Do the list in order. The minutes are estimates: if time runs out, stop, and what's left joins the \"if time\" list. The \"if time\" items are for review when a miss points to them, not requirements."
DAYS = [
    {"key": "sun", "date": "2026-11-15", "cal": "chem-1115-session1", "title": "Sunday, Nov 15 · Session 1: curved arrows, carbocations and shifts", "minutes": 75,
     "tasks": [("Readiness Check follow-up questions, cold. Your tutor has these; they are not in the app.", None, 15),
               ("Curved arrows lesson in the Chemistry classroom.", "arrows.html", 15),
               ("Walkthroughs below: Problems 1, 2 and 6 (carbocations, then the hydride and methyl shifts).", None, 45)],
     "extra": [("The epoxide walkthrough below.", None)],
     "walks": ["p1", "p2", "p6", "epoxide"],
     "bio": "Biology: Exam 3 study block."},
    {"key": "mon", "date": "2026-11-16", "cal": "chem-1116-review", "title": "Monday, Nov 16 · Session 2: reagents, substitution and elimination, keto-enol", "minutes": 75,
     "tasks": [("Cold, no notes: the first \"tomorrow, on your own\" problem under Problems 1, 2 and 6. Then redraw Problem 6 from blank paper.", None, 15),
               ("The reagent cards below: say each job out loud, then open the card. Study only the ones you miss.", None, 10),
               ("The Test 4 checklist below (Chapters 8 and 9): say what each row does, then open it. Mark the rows you miss.", None, 10),
               ("Problems 4 and 5: substitution and elimination.", None, 15),
               ("Problem 7: the keto-enol arrows, with acid and with base.", None, 15),
               ("Which carbocation is more stable: an O right next to the C⁺.", None, 10)],
     "extra": [("Alkene reagents and Alkyne reagents lessons in the Chemistry classroom, for the checklist rows you missed.", "alkenes.html"),
               ("The ether walkthrough below.", None),
               ("A one-page reagent chart from the checklist rows you missed.", None)],
     "walks": ["cards", "topics", "p4", "p5", "p7", "stability", "ether"],
     "bio": "Biology: Exam 3 repair on your weakest topics, 40 min. Exam 3 is tomorrow: stop on time and sleep early."},
    {"key": "tue", "date": "2026-11-17", "cal": "chem-1117-session3", "title": "Tuesday, Nov 17 · Session 3 (evening, after Biology Exam 3): stereochemistry, synthesis, NMR", "minutes": 55,
     "tasks": [("Cold, no notes: the first \"tomorrow, on your own\" problem under Problems 4, 5 and 7.", None, 10),
               ("Problem 3 with a model kit: Br₂ adds anti, racemic or meso.", None, 10),
               ("Part 4 synthesis: the walkthrough, the scoring checklist, and the exam-format practice.", None, 20),
               ("¹H-NMR: read a spectrum, then choose the one that matches.", None, 15)],
     "extra": [("If a review is due in a Chemistry lesson, do it.", None),
               ("Monday's other \"on your own\" problems, including the reagent card practice.", None)],
     "walks": ["p3", "part4", "nmr"],
     "bio": "Biology: Exam 3 today. Chemistry class: Chapter 9 practice lecture."},
    {"key": "wed", "date": "2026-11-18", "cal": "chem-1118-mock", "title": "Wednesday, Nov 18 · Timed practice test", "minutes": 98,
     "tasks": [("Cold, before the test: Tuesday's exam-format synthesis, timed at 12 minutes and scored with the checklist, then the spectrum choice (3 minutes). Take a short break after.", None, 15),
               ("Last year's Test 4 on paper, timed at 53 minutes without stopping (your tutor has the copy). Grade it with its key.", None, 53),
               ("Redraw every missed product and mechanism from blank paper. Reread the walkthrough each miss points to.", None, 30)],
     "extra": [("Problem 3's \"on your own\" problems.", None)],
     "walks": [],
     "bio": "Biology: Lower Limb lab."},
    {"key": "thu", "date": "2026-11-19", "cal": "chem-1119-warmup", "title": "Thursday, Nov 19 · Test 4", "minutes": 15,
     "tasks": [("Warm-up from blank paper: redraw the mechanisms you missed on Wednesday. If you missed none, redraw the base tautomerization, a hydride shift and Br₂ adding anti. No new material today.", None, 15)],
     "extra": [],
     "walks": [], "bio": ""},
]

# ---------------------------------------------------------------- walkthroughs
def W(id, title, rule, problem, steps, fig=None, notes=None, with_help=None, on_own=None, watch=None, checklist=None):
    return {"id": id, "title": title, "rule": rule, "problem": problem, "steps": steps, "fig": fig, "notes": notes or [],
            "with_help": with_help or [], "on_own": on_own or [], "watch": watch or [], "checklist": checklist}

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
     ("Arrows, tautomerization step 1 (acid): a proton goes onto carbon", [("The enol's C=C bond takes a proton from H₃O⁺. Which carbon gets the H, and where is the + left?", "Two arrows: one from the C=C bond to the H of H₃O⁺, and one from that H–O bond onto water's O. The H goes on C1, so C2 is left with the +, right next to the O.", "Which + carbon has an O lone pair right next to it to help hold the charge?")]),
     ("Resonance: the O shares a lone pair", [("Draw the other resonance form of that cation. Which electrons move, and where does the + end up?", "One arrow, from a lone pair on the O into the C–O bond. That pair becomes the C=O π bond. The + moves to the O (C=O⁺–H), and now every atom has an octet. Nothing is added or removed: it is the same ion, drawn with its electrons in a different place.", "Arrows start at electrons. The O has two lone pairs and is bonded to the C⁺.")]),
     ("Arrows, tautomerization step 2 (acid): the proton comes off the O", [("Start from the C=O⁺–H form. What takes the H, and where do the O–H bond's electrons go?", "A lone pair on water takes the H. The O–H bond's pair goes back onto the O as a lone pair, so the + is gone. The C=O π bond was already made in the resonance step. H₃O⁺ is given back, so the acid is a catalyst.", "Count the O's lone pairs before and after: it ends with two lone pairs and a double bond to C.")]),
     ("Draw the product and say why", [("Ketone or aldehyde, and why?", "A ketone, because the O ended up on C2, an inside carbon. An aldehyde needs the O on C1.", None),
                                       ("How would you make the aldehyde instead?", "9-BBN (or disiamylborane), then H₂O₂ and NaOH: anti-Markovnikov, OH on C1.", None)])],
    fig="taut-acid",
    notes=[("The same tautomerization with base (last year's test asked for this one)",
            "After hydroboration-oxidation, NaOH does the tautomerization. It takes three moves, the same pattern as the acid version: a proton transfer, a resonance form, a proton transfer. "
            "Step 1: a lone pair on OH⁻ takes the H on the enol's O, and the O–H bond's pair stays on the O, which is now O⁻. "
            "Resonance: a lone pair on the O⁻ moves into the C–O bond (making C=O) while the C=C bond's pair moves onto the other C=C carbon (the one not bonded to the O), which now has a lone pair and the − charge. "
            "Step 2: that carbon's lone pair takes an H from water, and the H–O bond's pair goes onto water's O. OH⁻ is given back. Show every one of these pairs and both byproducts: Dr. Meadows grades each one.",
            "taut-base")],
    with_help=[("1-hexyne + H₂SO₄, H₂O, HgSO₄. The enol, the ketone, and the acid tautomerization arrows.", "The enol with OH on C2, then 2-hexanone.")],
    on_own=[("1-hexyne + 9-BBN, then H₂O₂ and NaOH: the enol, the product, and the base tautomerization arrows with every electron pair and byproduct.", "The enol with OH on C1, then hexanal. Base tautomerization: OH⁻ takes the O–H proton (water forms); the O⁻ lone pair makes C=O as the C=C pair moves onto C2; C2's lone pair takes an H from water (OH⁻ given back)."),
            ("3-hexyne + H₂SO₄, H₂O, HgSO₄, and why only one product forms.", "3-hexanone. Only one product: the alkyne is symmetric, so the OH on either carbon gives the same ketone.")],
    watch=["Stopping at the enol.", "An aldehyde from the HgSO₄ conditions.", "An alcohol (no C=C left) as the answer.", "The first acid arrow starting at the H₃O⁺ instead of the C=C bond.",
           "In the C=O⁺–H form, an arrow from the O–H bond into the C–O bond. The π bond is already there, so the O–H pair goes back onto the O.",
           "Leaving out a byproduct (H₃O⁺ with acid, OH⁻ with base)."])

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
    checklist=("Score your route the way the test does. Last year's synthesis was worth 35 of the test's 160 points: 2 for choosing a problem, 2 for two written observations, and 31 for the route. "
               "The test gave 53 minutes for 160 points, so a 35-point synthesis is worth about 12 minutes.",
               ["Carbons: count the product's carbons and circle which starting material each one came from. Every carbon must come from the starting materials you were given.",
                "The new C–C bond: point to it, and name the reaction that makes it. In Chapters 8 and 9 that is an acetylide plus an alkyl halide.",
                "Every intermediate is drawn, in order, not just named.",
                "Reagents over every arrow, in the right order. Number them when one arrow has two steps (1. 9-BBN  2. H₂O₂, NaOH).",
                "Stereochemistry: cis or trans, wedge or dash, and \"both enantiomers\" where it applies, from a reagent that really gives it.",
                "Two observations, written before the route. For example: how many carbons each starting material gives the product; which bond is new; what has to change in a starting material before the C–C bond step; what the product's C=C or C=O needs."]),
    notes=[("The three alkyne reductions, side by side", "H₂ with Lindlar's catalyst gives the cis alkene. Na in NH₃ gives the trans alkene. H₂ with Pd goes all the way to the alkane.", None),
           ("Make the pieces first (last year's synthesis needed this)",
            "Last year's test gave two starting materials, and every carbon in the product had to come from them. That usually means changing one of them before the C–C bond step. Two changes to know. "
            "An alkene becomes an alkyne: Br₂ in CCl₄, then excess NaNH₂. On a terminal alkyne, the extra NaNH₂ also takes the end H, so the acetylide is ready for the next step. "
            "A bromide on an inside carbon moves to the end carbon: KOtBu makes the alkene with the C=C at the end, then HBr with ROOR puts the Br on the end carbon.", None)],
    with_help=[("Exam format. Starting materials: 3-methyl-1-butene and bromoethane. Target: (Z)-2-methyl-3-hexene. Every carbon must come from the two starting materials. Write two observations, then the route forward with every reagent and every intermediate drawn.",
                "Observations: the product has 7 carbons, 5 from 3-methyl-1-butene and 2 from bromoethane, so one new C–C bond joins them; the product's C=C is cis, so the last step is H₂ with Lindlar's catalyst. "
                "Route: 3-methyl-1-butene → (Br₂, CCl₄) 1,2-dibromo-3-methylbutane → (excess NaNH₂) the acetylide of 3-methyl-1-butyne → (CH₃CH₂Br) 2-methyl-3-hexyne → (H₂, Lindlar's catalyst) (Z)-2-methyl-3-hexene.")],
    on_own=[("Wednesday, before the practice test: cold and timed at 12 minutes, then score it with the checklist. Starting materials: 2-bromopentane and 1-pentyne. Target: (E)-4-decene. Every carbon must come from the two starting materials. Write two observations, then the route forward with every reagent and intermediate drawn.",
             "Observations: the product is one straight chain of 10 carbons, 5 from 1-pentyne and 5 from 2-bromopentane, joined by one new C–C bond; the Br is on C2, but a straight chain needs the new bond at C1, so the Br has to move to the end carbon first; the C=C is trans, so the last step is Na in NH₃. "
             "Route: 2-bromopentane → (KOtBu) 1-pentene → (HBr, ROOR) 1-bromopentane. 1-pentyne → (NaNH₂) its acetylide → (1-bromopentane) 4-decyne → (Na, NH₃) (E)-4-decene. Joining the acetylide to 2-bromopentane itself would put a branch in the chain."),
            ("If time: make trans-4-octene. Every carbon must come from acetylene and alkyl halides with 3 carbons or fewer.", "Acetylene + NaNH₂; CH₃CH₂CH₂Br (1-pentyne); NaNH₂; CH₃CH₂CH₂Br (4-octyne); Na, NH₃. Hint, if you needed it: it takes two alkylations."),
            ("Challenge, if time: make 5-decanone from 1-hexyne and any alkyl halide.", "NaNH₂; then CH₃CH₂CH₂CH₂Br (gives 5-decyne); then H₂SO₄, H₂O, HgSO₄. The alkyne is symmetric, so only one ketone forms.")],
    watch=["A secondary halide.", "NaOH as the base (too weak to remove the alkyne H).", "The wrong reduction for cis or trans.", "Skipping the drawn intermediates (Dr. Meadows grades every molecule along the route)."])

WALKS["nmr"] = W("nmr", "¹H-NMR: read a spectrum, then choose the one that matches",
    "Each set of matching H atoms gives one signal. The number printed over a signal (its integration) says how many H are in the set, its position says what is nearby, and its splitting says how many H sit on the neighboring carbons.",
    "Last year's Test 4 had one ¹H-NMR question, worth 6 of its 160 points: circle the predicted spectrum that belongs to a molecule. Expect one this year too. That isn't confirmed, so ask Dr. Meadows if you want to be sure.",
    [("Read the axis", [("Which way does the ppm scale run, and what is the number printed over each signal?", "Backward: bigger numbers on the left, 0 on the right. A signal farther left has something electron-pulling, like an O or a C=O, close by. The number over each signal is its integration: how many H it stands for.", "Find 0 on the axis first.")]),
     ("Count the signals", [("Which H atoms in this molecule match each other?", "H atoms on the same carbon, or on carbons that match by symmetry, give one signal.", "Circle each set of matching H atoms in a different color.")]),
     ("Read the integration", [("How many H are in each set?", "Each signal's integration number equals the H count of one set. A cluster of peaks close together is one signal, with one integration number.", None)]),
     ("Read the chemical shift", [("What is right next to each set of H atoms?", "H on plain alkyl carbons appear at about 0.7 to 1.8 ppm; next to a C=O, 2.0 to 2.7; on an alkyne carbon, 1.8 to 3.1; next to an O (alcohol or ether), 3.3 to 4.5; on a C=C, 4.5 to 6.5; an aldehyde H, 9.5 to 10.5. These ranges come from a standard reference table; real values can land a little outside them. "
                                  "The H on an alcohol's O is the exception: its position moves from sample to sample, and it usually shows as a singlet.", None)]),
     ("Read the splitting", [("How many H are on the carbons right next to this set?", "n neighboring H split the signal into n + 1 peaks: 1 neighbor, a doublet (2 peaks); 2, a triplet; 3, a quartet; 5, a sextet; 6, a septet (7 peaks). A CH₃ next to a CH₂ is a triplet; a CH₂ next to a CH₃ is a quartet; a set with no neighboring H is a singlet.", "Count the H on each neighboring carbon, add them, then add 1.")]),
     ("Choose the spectrum", [("Which spectrum, A, B or C, belongs to diethyl ether, CH₃CH₂–O–CH₂CH₃? Rule out each wrong one with the first clue it fails.",
                              "C. Diethyl ether has two signals: 6H, a triplet (each CH₃ has 2 H next door), and 4H, a quartet (each CH₂ has 3 H next door), with the quartet near 3.5 ppm because those CH₂ groups are bonded to the O. "
                              "A fails on integration and splitting: two singlets, 9H and 3H, is tert-butyl methyl ether. B fails only on shift: the same 6H triplet and 4H quartet, but the quartet is at 2.44 ppm, where a CH₂ next to a C=O appears. That is 3-pentanone.",
                              "Check in order: number of signals, integration, splitting, shift. Two of the three pass the first clues; only the shift separates them.", "nmr-choose")])],
    notes=[("How the test draws spectra",
            "Last year's spectra were predicted spectra: each signal split only by the H on the neighboring carbons (the n + 1 rule), with its integration printed over it. The spectra on this page are drawn the same way, at shifts measured for the real compounds. "
            "Sources: diethyl ether, 2-propanol and tert-butyl alcohol, Fulmer and others, Organometallics 2010; tert-butyl methyl ether, Gottlieb and others, Journal of Organic Chemistry 1997; 3-pentanone, ChemicalBook; 1-propanol and 1-pentyne, the SDBS database as quoted by Doc Brown's Chemistry. "
            "The alcohol O–H positions are from Doc Brown's Chemistry; they move from sample to sample.", None),
           ("Worked examples, from measured spectra",
            "3-pentanone: two signals. 1.06 ppm, 6H, triplet (the two CH₃ groups); 2.44 ppm, 4H, quartet (the two CH₂ groups next to the C=O). "
            "tert-butyl methyl ether: two singlets. 1.19 ppm, 9H (the tert-butyl group); 3.22 ppm, 3H (the OCH₃, just below the table's 3.3 to 4.5 range).", None)],
    with_help=[("Last year's NMR question was one part of a three-part problem on a single reaction. Try that format: ? + 9-BBN; then H₂O₂ and NaOH → pentanal. (a) Draw the starting material. (b) Predict its ¹H-NMR spectrum: how many signals, and each one's integration, splitting and shift range. (c) Draw the base tautomerization with every electron pair and byproduct.",
                "(a) 1-pentyne: 9-BBN puts the O on the end carbon, and the enol becomes the aldehyde. (b) Four signals. The CH₃: 3H, triplet, alkyl range. The middle CH₂: 2H, sextet (5 H next door), alkyl range. The CH₂ next to the triple bond: 2H, triplet, alkyne range. The ≡C–H: 1H, singlet, because the carbon next to it has no H. Measured shifts (SDBS): 1.00, 1.55, 2.15 and 1.94 ppm. (c) The three moves in Problem 7's base drawing, with water formed in the first and OH⁻ given back in the last.")],
    on_own=[("Wednesday, before the practice test, cold (3 minutes): which spectrum, A, B or C, belongs to 2-propanol, (CH₃)₂CH–OH? Say which clue rules out each wrong one.",
             "A. 2-propanol has three signals: 6H, a doublet (the two CH₃ groups have 1 H next door); 1H, a septet near 4.0 ppm (the CH has 6 H next door and is bonded to the O); and the 1H O–H singlet. "
             "B has four signals (3:2:2:1), with a 2H triplet near 3.6 ppm: that is 1-propanol, CH₃CH₂CH₂OH. C has two singlets, 9H and 1H: that is tert-butyl alcohol, whose CH₃ groups have no H next door.", "nmr-cold"),
            ("If time: for 2-butanone, predict how many signals, the integration and splitting of each, and which range of the table each falls in.",
             "Three signals. The CH₃ at the end of the ethyl group: 3H, triplet, alkyl range (about 0.7 to 1.3 ppm). The CH₃ on the C=O: 3H, singlet, next-to-C=O range (2.0 to 2.7). The CH₂: 2H, quartet, also next-to-C=O range. This applies the rules and the table; it was not read from a measured spectrum.")],
    watch=["Reading the axis as if it ran from 0 on the left.", "Counting each peak of a multiplet as its own signal.", "Taking the number of peaks as the number of H.", "Choosing on shift alone without checking integration and splitting."])

# Spectra drawn on the page: (label, [(ppm, number of H, number of peaks)]), at measured shifts (sources in the NMR notes)
SPECTRA = {
    "nmr-choose": [("A", [(1.19, 9, 1), (3.22, 3, 1)]),                    # tert-butyl methyl ether (Gottlieb 1997)
                   ("B", [(1.06, 6, 3), (2.44, 4, 4)]),                    # 3-pentanone (ChemicalBook)
                   ("C", [(1.21, 6, 3), (3.48, 4, 4)])],                   # diethyl ether (Fulmer 2010)
    "nmr-cold":   [("A", [(1.22, 6, 2), (4.04, 1, 7), (2.16, 1, 1)]),      # 2-propanol (Fulmer 2010; OH Doc Brown)
                   ("B", [(0.94, 3, 3), (1.57, 2, 6), (3.58, 2, 3), (2.26, 1, 1)]),  # 1-propanol (SDBS via Doc Brown)
                   ("C", [(1.28, 9, 1), (2.01, 1, 1)])],                   # tert-butyl alcohol (Fulmer 2010; OH Doc Brown)
}
# What each spectrum is, for the build's own consistency check (H count and the n + 1 rule)
SPECTRA_MOLS = {("nmr-choose", "A"): "COC(C)(C)C", ("nmr-choose", "B"): "CCC(=O)CC", ("nmr-choose", "C"): "CCOCC",
                ("nmr-cold", "A"): "CC(C)O", ("nmr-cold", "B"): "CCCO", ("nmr-cold", "C"): "CC(C)(C)O"}

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
    # Problem 7 drawings (acid and base tautomerization)
    ("p7", "C=C(O)CCC"), ("p7", "C[C+](O)CCC"), ("p7", "CCCC(C)=[OH+]"), ("p7", "OC=CCCC"), ("p7", "[O-]C=CCCC"), ("p7", "O=C[CH-]CCC"), ("p7", "CCCCC=O"), ("p7", "O=CCCCCC"),
    # Part 4 exam-format practice
    ("part4", "C=CC(C)C"), ("part4", "BrCC(Br)C(C)C"), ("part4", "C#CC(C)C"), ("part4", "CCBr"), ("part4", "CCC#CC(C)C"), ("part4", "CC/C=C\\C(C)C"),
    ("part4", "CCCC(C)Br"), ("part4", "C=CCCC"), ("part4", "BrCCCCC"), ("part4", "C#CCCC"), ("part4", "CCCC#CCCCCC"), ("part4", "CCC/C=C/CCCCC"),
    # NMR practice
    ("nmr", "CCOCC"), ("nmr", "CC(C)O"), ("nmr", "CCCO"), ("nmr", "CC(C)(C)O"), ("nmr", "C#CCCC"), ("nmr", "CCCCC=O"),
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
    ("part4 exam format: Br2", "C=CC(C)C", "BrCC(Br)C(C)C", "+Br2"),
    ("part4 exam format: two eliminations", "BrCC(Br)C(C)C", "C#CC(C)C", "-H2Br2"),
    ("part4 exam format: whole route", "C=CC(C)C", "CC/C=C\\C(C)C", "+C2H4"),
    ("part4 cold: KOtBu", "CCCC(C)Br", "C=CCCC", "-HBr"),
    ("part4 cold: HBr, ROOR", "C=CCCC", "BrCCCCC", "+HBr"),
    ("part4 cold: whole route", "C#CCCC", "CCC/C=C/CCCCC", "+C5H12"),
    ("p7 base drawing", "C#CCCC", "CCCCC=O", "+H2O"),
    ("p7 acid drawing", "C#CCCC", "CCCC(C)=O", "+H2O"),
    ("part4 challenge", "CCCCC#C", "CCCCC(=O)CCCCC", "+C4H10O"),
    ("cyclooctyne ozonolysis", "C1CCCC#CCC1", "OC(=O)CCCCCCC(=O)O", "+H2O4"),
]
