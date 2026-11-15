"""Reading and drawing structures: bond-line reading, names and condensed formulas to drawings, wedges and dashes,
stereocenters, cis/trans, meso, Newman projections, chairs, and finding errors in a drawing.

Each problem has auto-checked parts (numbers, taps on atoms, choices) and, for most, a paper drawing task that she
compares with a checked drawing and its common mistakes. Problems that start from a name or condensed formula show no
structure until she has drawn it ("drawFirst"). No molecule here is from the Readiness Check or the Fall 2025 Test 4.
"""
from draw3d import newman, chair

CARDS = [
    {"key": "reading", "family": "reading", "name": "Reading a bond-line drawing",
     "rule": "Every corner and every line end is a carbon. A carbon has four bonds; the H atoms you don't see fill in the rest: H count = 4 minus the bonds drawn (a double bond counts as 2).",
     "check": "Count carbons by touching each corner and end once. Then, for any carbon, count its lines to get its H's."},
    {"key": "classify", "family": "reading", "name": "Primary, secondary, tertiary",
     "rule": "Count the carbons bonded to a carbon: 1 is primary (1°), 2 is secondary (2°), 3 is tertiary (3°), 4 is quaternary.",
     "check": "This is the same count you use for carbocations and for SN1 versus SN2."},
    {"key": "naming", "family": "naming", "name": "From a name to a drawing",
     "rule": "Draw the parent chain first (meth 1, eth 2, prop 3, but 4, pent 5, hex 6, hept 7, oct 8), number it, then put each group on its numbered carbon. -ol is OH, -one is C=O, -ene is C=C, -yne is C≡C.",
     "check": "Read the name back from your drawing. The longest chain must match the parent, and the numbers should be as low as possible."},
    {"key": "condensed", "family": "naming", "name": "From a condensed formula to a drawing",
     "rule": "Read left to right: each C with its H's is one carbon of the chain. A group in parentheses hangs off the carbon just before it; (CH₃)₂CH– is two CH₃ groups on one CH, a branch.",
     "check": "Count the carbons in the formula and in your drawing. They must match."},
    {"key": "stereo", "family": "stereo", "name": "Wedges, dashes and stereocenters",
     "rule": "A wedge points toward you, a dash away. A stereocenter is a carbon with four different groups. Swapping the wedge and the dash at one stereocenter changes that center.",
     "check": "Write the four groups. If any two are the same (two CH₃, or two identical ring paths), it is not a stereocenter."},
    {"key": "cistrans", "family": "stereo", "name": "cis, trans and meso",
     "rule": "On a ring, two groups on the same face (both wedges, or both dashes) are cis; a wedge and a dash are trans. A molecule with stereocenters and an internal mirror plane is meso: it is its own mirror image.",
     "check": "Look for a line you could fold the molecule along so each half lands on the other."},
    {"key": "newman", "family": "conformations", "name": "Newman projections",
     "rule": "Look straight down one C–C bond. The front carbon is the point where three bonds meet; the back carbon is the circle. Staggered: the back bonds sit between the front bonds. Eclipsed: they line up. Anti: the two big groups are 180° apart; gauche: 60° apart.",
     "check": "Anti staggered is lowest in energy; eclipsed big groups are highest.",
     "svg": newman(["CH₃", "", ""], ["", "CH₃", ""], 60, caption="butane, anti (staggered)")},
    {"key": "chair", "family": "conformations", "name": "Chair cyclohexane",
     "rule": "Each ring carbon has one axial bond (straight up or straight down, alternating around the ring) and one equatorial bond (out to the side). A ring flip turns every axial bond equatorial and every equatorial bond axial. Big groups are more stable equatorial.",
     "check": "Two groups on the same face are cis whether they are axial or equatorial; up versus down is what matters.",
     "svg": chair({1: {"ax": "CH₃"}}, caption="methylcyclohexane, CH₃ axial", numbers=True)},
    {"key": "errors", "family": "errors", "name": "Checking your own drawing",
     "rule": "Before you finish: every carbon has four bonds and no more; an O with three bonds has a + charge; each group sits on the carbon the name says; the carbon count matches.",
     "check": "Read your drawing back out loud as a name or formula. If it doesn't match the question, find where it changed."},
]

FAMILIES = {"reading": "Reading bond-line drawings", "naming": "Names and condensed formulas to drawings",
            "stereo": "Wedges, dashes, stereocenters, cis and trans", "conformations": "Newman projections and chairs",
            "errors": "Finding errors in a drawing"}

EXAMPLE = {
    "title": "Drawing 4-ethyl-2-methylhexane from its name",
    "stages": [
        {"smi": "CCCCCC", "caption": "The parent is hexane: a chain of 6 carbons. Draw a zigzag with 6 corners and ends.", "say": "Hex means 6."},
        {"smi": "CCCCCC", "caption": "Number the chain from one end, C1 to C6. Either end for now.", "say": "Number before adding anything."},
        {"smi": "CC(C)CCCC", "caption": "2-methyl: one CH₃ on C2.", "say": "Methyl is one carbon."},
        {"smi": "CC(C)CC(CC)CC", "caption": "4-ethyl: a two-carbon branch on C4.", "say": "Ethyl is two carbons."},
        {"smi": "CC(C)CC(CC)CC", "caption": "Check it: the longest chain is still 6 carbons, numbering from this end gives 2,4 (from the other end, 3,5), and there are 9 carbons in all.", "say": "Read the name back from the drawing."},
    ],
}

def tag_names(smi):
    return smi

# ---------- problems ----------
# part types: number (answer, wrong: {value: message}, low/high messages), tap (answer: atom names; any: accept one of them), choice (options, answer, wrong: {option: message})
GUIDED = [
    {"id": "chem-t4-str-guided-reading", "family": "reading", "title": "Read this bond-line drawing", "show": "CC{b}(O)C{c}C{d}(C)C",
     "parts": [
         {"type": "number", "skill": "count-carbons", "q": "How many carbons are in this molecule?", "answer": 6,
          "low": "You missed a carbon. Every line end is a CH₃: count both ends of the chain and the end of the branch.", "high": "Count each corner and end only once, and don't count the O."},
         {"type": "number", "skill": "implied-h", "q": "How many H atoms are on the carbon that holds the OH?", "answer": 1,
          "wrong": {"0": "That carbon has three lines (two C and the O), so it still needs one H to reach four bonds.", "2": "Count its lines: two carbons and the O make three bonds, so 4 − 3 = 1 H."}},
         {"type": "tap", "skill": "stereocenter", "q": "Tap every stereocenter, then press Done.", "answer": ["b"],
          "extra": {"d": "This carbon holds two CH₃ groups (the branch and the chain end), so it isn't a stereocenter.", "c": "A CH₂ has two identical H's, so it can't be a stereocenter."}},
     ],
     "draw": {"what": "On paper: draw this molecule with the OH on a wedge, then draw its enantiomer next to it.",
              "steps": ["Copy the carbon skeleton.", "Put the OH on a wedge at the stereocenter.", "For the enantiomer, change only that wedge to a dash."],
              "solution": ["CC(O<w>)CC(C)C", "CC(O<d>)CC(C)C"], "solutionCaption": "4-methylpentan-2-ol and its enantiomer",
              "mistakes": [{"smi": "CC(O<w>)CC(C<w>)C", "tag": "wedge-not-stereocenter", "title": "A wedge on a carbon that isn't a stereocenter",
                            "text": "C4 holds two CH₃ groups, so wedges there mean nothing. Only C2 is a stereocenter."}]},
     "hints": ["Touch each corner and each line end once.", "Count the lines on that carbon, then subtract from 4.", "Write the four groups on each candidate carbon."],
     "why": {"prompt": "Why is the carbon holding the OH a stereocenter, but the carbon holding the branch isn't?",
             "key": "The OH carbon has four different groups (H, OH, CH₃, and the rest of the chain); the branch carbon has two identical CH₃ groups."}},
    {"id": "chem-t4-str-guided-name", "family": "naming", "title": "Draw 3-ethyl-2-methylhexane", "drawFirst": True, "answerSmi": "CC(C)C(CC)CCC",
     "draw": {"what": "On paper: draw 3-ethyl-2-methylhexane.",
              "steps": ["Draw the parent chain: hex = 6 carbons. Number it.", "Put a methyl (1 carbon) on C2.", "Put an ethyl (2 carbons) on C3.", "Count all the carbons."],
              "solution": ["CC(C)C(CC)CCC"], "solutionCaption": "3-ethyl-2-methylhexane",
              "mistakes": [{"smi": "CC(CC)C(C)CCC", "tag": "swapped-groups", "title": "The two groups are swapped", "text": "The name puts methyl on C2 and ethyl on C3."},
                           {"smi": "CC(C)C(CC)CC", "tag": "short-chain", "title": "The chain has only 5 carbons", "text": "Hexane is 6 carbons. Recount your parent chain."},
                           {"smi": "CC(C)C(C)CCC", "tag": "ethyl-as-methyl", "title": "The ethyl group has only one carbon", "text": "Ethyl is two carbons, a CH₂ and a CH₃."}]},
     "parts": [
         {"type": "number", "skill": "parent-chain", "q": "How many carbons are in the longest chain of your drawing?", "answer": 6,
          "low": "Hexane is 6 carbons. Check your parent chain.", "high": "Count only the parent chain, not the branches. If a branch made a longer chain, the ethyl may be on the wrong carbon."},
         {"type": "number", "skill": "substituent-position", "q": "On which carbon of the chain is the ethyl group?", "answer": 3, "wrong": {"2": "That's where the methyl goes. The name says 3-ethyl."}},
         {"type": "number", "skill": "count-carbons", "q": "How many carbons are in your whole molecule?", "answer": 9, "low": "6 in the chain + 1 (methyl) + 2 (ethyl) = 9.", "high": "6 in the chain + 1 (methyl) + 2 (ethyl) = 9."},
     ],
     "hints": ["Parent chain first: hex = 6.", "Number from the end that gives the groups the lowest numbers.", "Add the branch carbons to the chain carbons."],
     "why": {"prompt": "How do you know the parent chain has 6 carbons, and why does it start numbering at the end near the methyl?",
             "key": "The parent name is hexane (6). Numbering from the methyl end gives the substituents the lowest numbers, 2 and 3."}},
    {"id": "chem-t4-str-guided-stereo", "family": "stereo", "title": "Wedges and dashes on a ring", "show": "C{r1}1(Br<w>)C{r2}(C<d>)C{r3}CCC1",
     "parts": [
         {"type": "choice", "skill": "cis-trans", "q": "Are the Br and the CH₃ cis or trans?", "options": ["cis", "trans"], "answer": "trans",
          "wrong": {"cis": "One group is on a wedge and the other on a dash: they're on opposite faces, so trans."}},
         {"type": "tap", "skill": "stereocenter", "q": "Tap every stereocenter, then press Done.", "answer": ["r1", "r2"],
          "missing": "Both ring carbons with a substituent hold four different groups: H, the substituent, and two different ring paths.", "extra": {"r3": "A CH₂ in the ring has two identical H's."}},
         {"type": "choice", "skill": "stereo-change", "q": "If you change only the Br's wedge to a dash, what do you get?", "options": ["the same molecule", "its enantiomer", "the cis isomer"], "answer": "the cis isomer",
          "wrong": {"the same molecule": "Changing one wedge changes that stereocenter, so it's a different stereoisomer.", "its enantiomer": "An enantiomer needs BOTH stereocenters inverted. Changing one gives the cis isomer, a diastereomer."}},
     ],
     "draw": {"what": "On paper: draw the cis isomer of this molecule.", "steps": ["Copy the ring and both groups.", "Put both groups on the same face: both wedges, or both dashes."],
              "solution": ["C1(Br<w>)C(C<w>)CCCC1"], "solutionCaption": "cis-1-bromo-2-methylcyclohexane",
              "mistakes": [{"smi": "C1(Br<d>)C(C<w>)CCCC1", "tag": "still-trans", "title": "One wedge and one dash", "text": "That is still trans, just drawn from the other side. Cis needs both on the same face."}]},
     "hints": ["Wedge = toward you, dash = away.", "Check each ring carbon: does it hold four different groups?", "How many stereocenters change when you change one wedge?"],
     "why": {"prompt": "Why is the molecule shown trans?", "key": "The Br is on a wedge and the CH₃ on a dash, so they point to opposite faces of the ring."}},
    {"id": "chem-t4-str-guided-newman", "family": "conformations", "title": "Butane, looking down the C2–C3 bond",
     "showSvg": newman(["CH₃", "", ""], ["", "CH₃", ""], 60),
     "parts": [
         {"type": "choice", "skill": "newman", "q": "Is this conformation staggered or eclipsed?", "options": ["staggered", "eclipsed"], "answer": "staggered",
          "wrong": {"eclipsed": "The back bonds (on the circle) sit between the front bonds, so it's staggered."}},
         {"type": "choice", "skill": "newman", "q": "Are the two CH₃ groups anti or gauche?", "options": ["anti", "gauche"], "answer": "anti",
          "wrong": {"gauche": "One CH₃ points straight up and the other straight down: 180° apart is anti."}},
         {"type": "choice", "skill": "newman", "q": "Which conformation of butane is lowest in energy?", "options": ["anti, staggered", "gauche, staggered", "CH₃ behind CH₃, eclipsed", "CH₃ behind H, eclipsed"], "answer": "anti, staggered",
          "wrong": {"gauche, staggered": "Gauche CH₃ groups are only 60° apart and crowd each other.", "CH₃ behind CH₃, eclipsed": "That's the highest-energy conformation.", "CH₃ behind H, eclipsed": "Eclipsed conformations are higher in energy than staggered ones."}},
     ],
     "draw": {"what": "On paper: draw the gauche conformation of butane as a Newman projection.", "steps": ["Draw the front carbon (three bonds meeting at a point) and the circle.", "Put a CH₃ on the front carbon's top bond.", "Turn the back carbon until its CH₃ is 60° from the front CH₃."],
              "solutionSvg": [newman(["CH₃", "", ""], ["CH₃", "", ""], 60, caption="gauche: the CH₃ groups are 60° apart")],
              "mistakes": [{"svg": newman(["CH₃", "", ""], ["CH₃", "", ""], 0), "tag": "eclipsed-not-gauche", "title": "The CH₃ groups line up", "text": "That's eclipsed (0°). Gauche is staggered with the CH₃ groups 60° apart."}]},
     "hints": ["Look at where the back bonds meet the circle.", "Find the angle between the two CH₃ groups.", "Bigger groups farther apart means lower energy."],
     "why": {"prompt": "Why is anti the lowest-energy conformation of butane?", "key": "The two CH₃ groups are 180° apart, as far apart as possible, so there is no crowding between them."}},
    {"id": "chem-t4-str-guided-chair", "family": "conformations", "title": "Methylcyclohexane in a chair",
     "showSvg": chair({1: {"ax": "CH₃"}}),
     "parts": [
         {"type": "choice", "skill": "chair", "q": "Is the CH₃ axial or equatorial?", "options": ["axial", "equatorial"], "answer": "axial",
          "wrong": {"equatorial": "It points straight up, parallel to the ring's axis: that's axial."}},
         {"type": "choice", "skill": "chair", "q": "After a ring flip, the CH₃ is:", "options": ["axial", "equatorial"], "answer": "equatorial",
          "wrong": {"axial": "A ring flip turns every axial bond into an equatorial one."}},
         {"type": "choice", "skill": "chair", "q": "Which chair is more stable?", "options": ["this one", "the ring-flipped one", "they are equal"], "answer": "the ring-flipped one",
          "wrong": {"this one": "An axial CH₃ bumps into the axial H atoms two carbons away on the same side.", "they are equal": "Equatorial is lower in energy for any group bigger than H."}},
     ],
     "draw": {"what": "On paper: draw the ring-flipped chair, with the CH₃ equatorial.", "steps": ["Draw the other chair (the flipped shape).", "On the same carbon, draw the equatorial bond out to the side.", "Put the CH₃ there."],
              "solutionSvg": [chair({1: {"eq": "CH₃"}}, flip=True, caption="ring flip: CH₃ equatorial")],
              "mistakes": [{"svg": chair({1: {"ax": "CH₃"}}, flip=True), "tag": "still-axial", "title": "The CH₃ is still axial", "text": "After a flip, the axial bond on that carbon points the other way and the CH₃ moves to the equatorial bond."}]},
     "hints": ["Axial bonds are vertical.", "A flip swaps axial and equatorial on every carbon.", "Where is the CH₃ less crowded?"],
     "why": {"prompt": "Why is the equatorial CH₃ more stable?", "key": "An axial CH₃ crowds the axial H atoms two carbons away on the same face (1,3-diaxial interactions); equatorial points away from them."}},
    {"id": "chem-t4-str-guided-error", "family": "errors", "title": "Find the error: this was drawn for 2-bromo-3-methylpentane", "show": "C{a}C{b}(C{m})C{c}(Br)C{d}C{e}",
     "parts": [
         {"type": "tap", "skill": "find-error", "any": True, "q": "Tap a carbon where the drawing doesn't match the name, then press Done.", "answer": ["b", "c"],
          "extra": {"a": "C1 is fine: the chain end.", "d": "C4 is fine.", "e": "C5 is fine.", "m": "The CH₃ itself is drawn correctly; check which chain carbon it's on."}},
         {"type": "choice", "skill": "find-error", "q": "What is wrong?", "options": ["The Br and the CH₃ are swapped", "The chain is too short", "A carbon has five bonds", "A charge is missing"], "answer": "The Br and the CH₃ are swapped",
          "wrong": {"The chain is too short": "Count it: the chain is 5 carbons, as pentane needs.", "A carbon has five bonds": "Every carbon here has four bonds or fewer.", "A charge is missing": "There are no charged atoms here."}},
     ],
     "draw": {"what": "On paper: draw 2-bromo-3-methylpentane correctly.", "steps": ["Draw and number the 5-carbon chain.", "Br on C2, CH₃ on C3.", "Read the name back from your drawing."],
              "solution": ["CC(Br)C(C)CC"], "solutionCaption": "2-bromo-3-methylpentane", "mistakes": []},
     "hints": ["Number the chain and read each group's carbon number.", "Compare with the name: 2-bromo, 3-methyl."],
     "why": {"prompt": "How can you catch this kind of mistake on a test?", "key": "After drawing, number the chain and read the name back from your drawing: each group and its carbon number."}},
]

INDEPENDENT = [
    {"id": "chem-t4-str-ind-reading", "family": "reading", "title": "Read this bond-line drawing", "show": "C{a}C{b}(C{g})C{c}(O)C{d}(C{h})C{e}C{f}",
     "parts": [
         {"type": "number", "skill": "count-carbons", "q": "How many carbons are in this molecule?", "answer": 8,
          "low": "You missed a carbon. Count every line end (each is a CH₃) as well as every corner.", "high": "Count each corner and end once, and don't count the O."},
         {"type": "number", "skill": "implied-h", "q": "How many H atoms are on the carbon that holds the OH?", "answer": 1,
          "wrong": {"0": "It has three lines (two C and the O), so 4 − 3 = 1 H.", "2": "It has three lines (two C and the O), so 4 − 3 = 1 H."}},
         {"type": "tap", "skill": "stereocenter", "q": "Tap every stereocenter, then press Done.", "answer": ["c", "d"],
          "missing": "Write the four groups on each carbon in the middle of the chain. Two of them have four different groups.",
          "extra": {"b": "This carbon holds two CH₃ groups, so it isn't a stereocenter.", "e": "A CH₂ has two identical H's."}},
     ],
     "why": {"prompt": "How did you decide which carbons are stereocenters?", "key": "A stereocenter has four different groups. The OH carbon and the carbon next to it each do; the carbon with two CH₃ groups doesn't."}},
    {"id": "chem-t4-str-ind-condensed", "family": "naming", "title": "Draw (CH₃)₂CHCH₂CH(OH)CH₂CH₃ as a bond-line structure", "drawFirst": True, "answerSmi": "CC(C)CC(O)CC",
     "draw": {"what": "On paper: draw (CH₃)₂CHCH₂CH(OH)CH₂CH₃ as a bond-line structure.",
              "steps": ["Write each carbon of the formula as one corner or end.", "(CH₃)₂CH– is a branch: two CH₃ on one CH.", "Put the OH on the carbon written as CH(OH).", "Count the carbons in the formula and in your drawing."],
              "solution": ["CC(C)CC(O)CC"], "solutionCaption": "5-methylhexan-3-ol",
              "mistakes": [{"smi": "CCCCC(O)CC", "tag": "branch-as-chain", "title": "The (CH₃)₂CH end drawn as a straight chain", "text": "(CH₃)₂CH– means two CH₃ groups on the same CH: a branch."},
                           {"smi": "CC(C)C(O)CCC", "tag": "oh-wrong-carbon", "title": "The OH is on the wrong carbon", "text": "The OH belongs on the carbon written CH(OH), which comes after the CH₂."},
                           {"smi": "CC(C)C(O)CC", "tag": "dropped-ch2", "title": "A CH₂ is missing", "text": "Every C in the formula is one carbon in the drawing: there are 7."}]},
     "parts": [
         {"type": "number", "skill": "count-carbons", "q": "How many carbons are in your drawing?", "answer": 7, "low": "Count the C's in the formula: (CH₃)₂ is two, then CH, CH₂, CH, CH₂, CH₃: 7.", "high": "Count the C's in the formula: 7."},
         {"type": "number", "skill": "parent-chain", "q": "How many carbons are in its longest chain?", "answer": 6, "low": "Start at one CH₃ of the branch and go to the far CH₃: 6.", "high": "The two branch CH₃ groups can't both be in the chain: the longest is 6."},
         {"type": "number", "skill": "substituent-position", "q": "Numbering that chain so the OH gets the lowest number, which carbon holds the OH?", "answer": 3,
          "wrong": {"4": "Number from the other end: the OH gets 3 from the ethyl end."}},
     ],
     "why": {"prompt": "How do you read (CH₃)₂CH– when drawing?", "key": "As two CH₃ groups attached to the same CH: a branched end, not a straight chain."}},
    {"id": "chem-t4-str-ind-meso", "family": "stereo", "title": "Draw cis-1,3-dimethylcyclohexane", "drawFirst": True, "answerSmi": "C1(C<w>)CC(C<w>)CCC1",
     "draw": {"what": "On paper: draw cis-1,3-dimethylcyclohexane with wedges or dashes.",
              "steps": ["Draw a hexagon and number it.", "Put CH₃ groups on C1 and C3.", "cis: both on wedges (or both on dashes)."],
              "solution": ["C1(C<w>)CC(C<w>)CCC1"], "solutionCaption": "cis-1,3-dimethylcyclohexane (meso)",
              "mistakes": [{"smi": "C1(C<w>)CC(C<d>)CCC1", "tag": "trans-drawn", "title": "One wedge and one dash", "text": "That's trans. cis means the same face."},
                           {"smi": "C1(C<w>)C(C<w>)CCCC1", "tag": "wrong-positions", "title": "The groups are on neighboring carbons", "text": "1,3 means one carbon between them."}]},
     "parts": [
         {"type": "number", "skill": "stereocenter", "q": "How many stereocenters does it have?", "answer": 2, "low": "C1 and C3 each hold H, CH₃ and two different ring paths.", "high": "Only the two carbons holding CH₃ are stereocenters."},
         {"type": "choice", "skill": "meso", "q": "Is cis-1,3-dimethylcyclohexane chiral or meso?", "options": ["chiral", "meso"], "answer": "meso",
          "wrong": {"chiral": "A mirror plane passes through C2 and C5 and cuts the molecule into matching halves, so it's meso."}},
     ],
     "why": {"prompt": "Why is cis-1,3-dimethylcyclohexane meso?", "key": "It has two stereocenters, but a mirror plane through C2 and C5 makes it identical to its mirror image."}},
    {"id": "chem-t4-str-ind-newman", "family": "conformations", "title": "1,2-dibromoethane, looking down the C–C bond",
     "showSvg": newman(["Br", "", ""], ["Br", "", ""], 60),
     "parts": [
         {"type": "choice", "skill": "newman", "q": "Is this conformation staggered or eclipsed?", "options": ["staggered", "eclipsed"], "answer": "staggered",
          "wrong": {"eclipsed": "The back bonds sit between the front bonds: staggered."}},
         {"type": "choice", "skill": "newman", "q": "Are the two Br atoms anti or gauche?", "options": ["anti", "gauche"], "answer": "gauche",
          "wrong": {"anti": "Anti would put them 180° apart. Here they are 60° apart: gauche."}},
         {"type": "choice", "skill": "newman", "q": "In the lowest-energy conformation, how far apart are the two Br atoms?", "options": ["0°", "60°", "120°", "180°"], "answer": "180°",
          "wrong": {"60°": "That's gauche, the one shown: the Br atoms crowd each other.", "0°": "That's eclipsed, the highest in energy.", "120°": "120° apart is an eclipsed conformation."}},
     ],
     "draw": {"what": "On paper: draw the anti conformation as a Newman projection.", "steps": ["Front carbon: Br on the top bond.", "Back carbon: rotate until its Br points straight down."],
              "solutionSvg": [newman(["Br", "", ""], ["", "Br", ""], 60, caption="anti: the Br atoms are 180° apart")], "mistakes": []},
     "why": {"prompt": "Why is the anti conformation lower in energy than the one shown?", "key": "In anti the two Br atoms are 180° apart, as far apart as possible; gauche puts them 60° apart, where they crowd each other."}},
    {"id": "chem-t4-str-ind-chair", "family": "conformations", "title": "trans-1,4-dimethylcyclohexane in a chair",
     "showSvg": chair({1: {"ax": "CH₃"}, 4: {"ax": "CH₃"}}),
     "parts": [
         {"type": "choice", "skill": "chair", "q": "In this chair, the two CH₃ groups are:", "options": ["both axial", "both equatorial", "one axial, one equatorial"], "answer": "both axial",
          "wrong": {"both equatorial": "Both point straight up or down, parallel to the ring's axis: axial.", "one axial, one equatorial": "Both bonds are vertical: both axial."}},
         {"type": "choice", "skill": "chair", "q": "After a ring flip, they are:", "options": ["both axial", "both equatorial", "one axial, one equatorial"], "answer": "both equatorial",
          "wrong": {"both axial": "A ring flip turns every axial bond equatorial.", "one axial, one equatorial": "A flip changes both groups the same way."}},
         {"type": "choice", "skill": "chair", "q": "Which chair is more stable?", "options": ["this one", "the ring-flipped one", "they are equal"], "answer": "the ring-flipped one",
          "wrong": {"this one": "Two axial CH₃ groups each crowd the axial H atoms on their face.", "they are equal": "Diequatorial is lower in energy than diaxial."}},
     ],
     "draw": {"what": "On paper: draw the more stable chair.", "steps": ["Draw the flipped chair.", "Put both CH₃ groups on equatorial bonds of C1 and C4."],
              "solutionSvg": [chair({1: {"eq": "CH₃"}, 4: {"eq": "CH₃"}}, flip=True, caption="both CH₃ equatorial")], "mistakes": []},
     "why": {"prompt": "Why is the ring-flipped chair more stable?", "key": "Both CH₃ groups become equatorial, away from the axial H atoms they crowd when axial."}},
    {"id": "chem-t4-str-ind-error-charge", "family": "errors", "title": "Find the error in this intermediate", "show": "CC{c}(C)(C)[OH2]{o}",
     "parts": [
         {"type": "tap", "skill": "find-error", "any": True, "q": "Tap the atom with a mistake, then press Done.", "answer": ["o"],
          "extra": {"c": "That carbon has four bonds: fine."}},
         {"type": "choice", "skill": "find-error", "q": "What is wrong?", "options": ["A + charge is missing on the O", "The O needs another H", "A carbon has five bonds", "A Br is missing"], "answer": "A + charge is missing on the O",
          "wrong": {"The O needs another H": "The O already has three bonds (C and two H). It needs a + charge, not another H.", "A carbon has five bonds": "Count the carbon's lines: four.", "A Br is missing": "Nothing here calls for Br."}},
     ],
     "draw": {"what": "On paper: redraw it correctly, with its lone pair.", "steps": ["Keep the same bonds.", "Count bonds and lone pairs on the O.", "Write the charge."],
              "solution": ["CC(C)(C)[OH2+]"], "solutionCaption": "an oxonium ion: O with three bonds, one lone pair, + charge", "mistakes": []},
     "why": {"prompt": "How do you know an O with three bonds is positive?", "key": "Neutral O has two bonds and two lone pairs. With three bonds it keeps one lone pair and owns one fewer electron, so it carries +1."}},
    {"id": "chem-t4-str-ind-error-bonds", "family": "errors", "title": "Find the error in this drawing", "show": "CC{p}(C)(C)(C{q})CC",
     "parts": [
         {"type": "tap", "skill": "find-error", "any": True, "q": "Tap the atom with a mistake, then press Done.", "answer": ["p"],
          "extra": {"q": "That carbon has two bonds drawn and two hidden H's: fine."}},
         {"type": "choice", "skill": "find-error", "q": "What is wrong?", "options": ["A carbon has five bonds", "A + charge is missing", "The chain is too short", "An H is missing"], "answer": "A carbon has five bonds",
          "wrong": {"A + charge is missing": "There's no O or charged atom here; count the lines on each carbon.", "The chain is too short": "Count the lines on the central carbon.", "An H is missing": "Carbons in a bond-line drawing never show their H's; count lines instead."}},
     ],
     "draw": {"what": "On paper: redraw it as a real molecule by removing one of the extra branches.", "steps": ["A carbon can have at most four bonds.", "Remove one branch from the central carbon."],
              "solution": ["CC(C)(C)CC"], "solutionCaption": "2,2-dimethylbutane: every carbon has four bonds or fewer", "mistakes": []},
     "why": {"prompt": "How many bonds can a carbon make, and how do you check a drawing for it?", "key": "Four. Count the lines at every corner; more than four means an extra group or a mistake in the chain."}},
]

TARGETED = []


def build(render_fn, canon, excluded, fail):
    from depict import Depiction, wrap
    def show_svg(smi):
        d = Depiction(smi, scale=50)
        parts, W, H, anchors = d.render()
        anchors.pop("__center", None)
        targets = []
        for a in d.atoms:
            if a.name:
                x, y = anchors[a.name]
                targets.append({"id": a.name, "x": round(x, 1), "y": round(y, 1), "kind": "atom", "label": "the atom " + a.name})
        return wrap(parts, W, H), targets, round(W)
    def item_out(it, role):
        out = {"id": it["id"], "role": role, "kind": "parts", "family": it["family"], "title": it["title"], "drawFirst": bool(it.get("drawFirst")),
               "parts": it["parts"], "hints": it.get("hints"), "why": it.get("why")}
        if it.get("show"):
            out["svg"], out["targets"], out["w"] = show_svg(it["show"])
            names = [t["id"] for t in out["targets"]]
            for p in it["parts"]:
                if p["type"] == "tap":
                    for a in p["answer"] + list(p.get("extra", {}).keys()):
                        if a not in names: fail.append("%s: tap answer %s is not a target" % (it["id"], a))
            for frag in it["show"].split("."):
                import re
                plain = re.sub(r"\{[A-Za-z0-9_]+\}", "", frag)
                if canon(plain) in excluded: fail.append("%s uses %s, which is in %s" % (it["id"], plain, excluded[canon(plain)][0]))
        elif it.get("showSvg"):
            out["svg"], out["targets"] = it["showSvg"], []
        for p in it["parts"]:
            if p["type"] == "tap" and not out.get("targets"):
                fail.append(it["id"] + ": tap part needs a drawn structure")
            if p["type"] == "choice" and p["answer"] not in p["options"]:
                fail.append(it["id"] + ": choice answer is not an option")
        if it.get("drawFirst") and (it.get("show") or it.get("showSvg")):
            fail.append(it["id"] + ": a draw-first problem must not show the structure first")
        dr = it.get("draw")
        if dr:
            sol = [render_fn(s, None) for s in dr.get("solution", [])] + dr.get("solutionSvg", [])
            out["draw"] = {"what": dr["what"], "steps": dr["steps"], "solution": sol, "solutionCaption": dr.get("solutionCaption", ""),
                           "mistakes": [{"svg": m.get("svg") or render_fn(m["smi"], None), "tag": m["tag"], "title": m["title"], "text": m["text"]} for m in dr.get("mistakes", [])]}
            for s in dr.get("solution", []) + [m["smi"] for m in dr.get("mistakes", []) if m.get("smi")]:
                if canon(s) in excluded: fail.append("%s uses %s, which is in %s" % (it["id"], s, excluded[canon(s)][0]))
            if it.get("answerSmi") and dr.get("solution"):
                if canon(it["answerSmi"], True) != canon(dr["solution"][0], True): fail.append(it["id"] + ": solution drawing differs from answerSmi")
        if role != "independent" and not it.get("hints"): fail.append(it["id"] + ": guided problems need hints")
        if not it.get("why"): fail.append(it["id"] + ": needs an explain prompt")
        return out
    ex = {"title": EXAMPLE["title"], "stages": [{"svg": render_fn(s["smi"], None), "caption": s["caption"], "say": s["say"]} for s in EXAMPLE["stages"]]}
    ids = [i["id"] for i in GUIDED + INDEPENDENT]
    if len(ids) != len(set(ids)): fail.append("structures: duplicate ids")
    return {"key": "structures", "objectiveId": "chm221.t4.structures", "prefix": "chem-t4-str", "source": "lesson-chem-t4-structures",
            "title": "Reading and drawing structures", "chapter": "Chapters 1 to 5", "cards": CARDS, "families": FAMILIES, "tags": {},
            "example": ex, "guided": [item_out(i, "guided") for i in GUIDED], "independent": [item_out(i, "independent") for i in INDEPENDENT], "targeted": []}
