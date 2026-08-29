# UNIT 1 LESSON U1-11 — CONFORMATIONAL ENERGY DIAGRAMS + STABILITY RANKING
## Fully authored beginner lesson script

**Status:** content draft for instructional review before runtime implementation.

**Parent curriculum:** `UNIT1_BEGINNER_TEACHING_CURRICULUM.md`

**Teaching-engine contract:** `DR_MERISSA_TEACHING_ENGINE_SPEC.md`

**Template standards:**
- `UNIT1_LESSON_U1_01_BOND_LINE_SCRIPT.md`
- `UNIT1_LESSON_U1_10_NEWMAN_PROJECTIONS_SCRIPT.md`
- `UNIT1_LESSON_U1_10_NEWMAN_COLD_EVIDENCE_SCORING_CONTRACT.md`
- `UNIT1_LESSON_U1_13_CYCLOHEXANE_CHAIRS_SCRIPT.md`

**Purpose of this file:** teach a conformational-energy diagram as a record of a real C—C single bond rotating through Newman conformations. The learner must connect each graph position to an actual molecular arrangement and explain why some peaks/valleys are higher or lower.

Cold independent items in this file carry their own role-preserving scoring contracts from the start.

---

# 1. LESSON GOAL

A learner who enters with usable Newman-projection knowledge but little or no usable energy-diagram knowledge should leave able to:

1. understand that the horizontal axis tracks rotation/dihedral angle around one C—C bond,
2. understand that the vertical axis represents relative conformational potential energy,
3. connect staggered conformations to energy minima and eclipsed conformations to energy maxima,
4. distinguish the **highest eclipsed peak** from the smaller eclipsed peaks in butane,
5. distinguish the **anti minimum** from the two equivalent gauche minima in butane,
6. explain why eclipsing raises energy through torsional strain,
7. explain why gauche butane is above anti through greater methyl–methyl steric crowding,
8. reconstruct the 0°/60°/120°/180°/240°/300°/360° sequence from one known Newman orientation,
9. recognize that 0° and 360° represent the same conformation after one full rotation,
10. infer a Newman projection from a point on a conformational-energy diagram,
11. place a Newman conformation at the correct region of an energy diagram,
12. compare two peaks or two valleys by the interaction actually present rather than by visual height alone,
13. solve a fresh graph/Newman transfer problem without prompts.

This lesson is not complete because the learner can memorize `peak = eclipsed` and `valley = staggered`. It is complete when she can move back and forth between the **rotating molecule** and the **graph** and explain the cause of the energy pattern.

---

# 2. LEARNER-FACING ORIENTATION

## Screen title

**Conformational energy: turn the bond and watch the graph change**

## Dr. Merissa narration

> "A conformational-energy graph is not a random wave you memorize. It is a record of what happens as one carbon-carbon single bond rotates. Every point on the graph corresponds to a real molecular arrangement. If we know what the Newman projection looks like at that angle, we can explain why the graph is high or low there."

### Immediate learner check

Visual: show a Newman projection beside an empty graph. Put a curved rotation arrow around the Newman bond axis.

Prompt:

**If the Newman projection rotates around the C—C bond, should the energy graph stay completely unrelated, or should each rotational position have a matching point on the graph?**

Choices:
- The graph is unrelated
- Each rotational position has a matching energy point
- I am not sure yet

Correct: **Each rotational position has a matching energy point**

If correct:

> "Exactly. We are going to build the graph from the rotating molecule instead of memorizing the finished curve."

If incorrect or unsure:

> "We will connect them one step at a time. The molecule rotates first; the graph records the energy of each arrangement."

Orientation is not mastery evidence.

---

# 3. SMALLEST PREREQUISITE GATE

Do not reteach the entire Newman lesson unless the learner actually lacks a prerequisite.

## Gate P1 — staggered versus eclipsed

Show one supported Newman pair.

Prompt:

**Which one is eclipsed: the view with front/back bonds aligned, or the view with the back bonds sitting between the front bonds?**

Correct: **aligned = eclipsed**

If missed, route to the U1-10 staggered/eclipsed micro-repair, then return to a fresh gate item.

## Gate P2 — anti versus gauche

Show two staggered butane Newmans with the two CH3 groups highlighted.

Prompt:

**Which relationship has the CH3 groups 180° apart?**

Correct: **anti**

Then:

**Which has them 60° apart?**

Correct: **gauche**

If missed, route only to the U1-10 anti/gauche representation switch.

## Gate P3 — rotation step meaning

Prompt:

**If the back carbon rotates 60° while the front carbon stays fixed, did we rotate the whole page or change the conformation?**

Correct: **change the conformation**

If missed, replay the U1-10 page-rotation versus bond-rotation contrast.

Once all three prerequisite ideas are usable, continue. Do not repeat already-passed gate items.

---

# 4. TEACH THE AXES BEFORE THE CURVE

## AXIS STEP 1 — What the horizontal axis means

### Visual

Show butane viewed down C2—C3. Fix the front carbon. Put a visible rotational dial around the back carbon marked:
`0° → 60° → 120° → 180° → 240° → 300° → 360°`.

On the graph, reveal only the horizontal axis.

Label:

**Rotation around the C2—C3 bond / CH3—CH3 dihedral angle**

### Dr. Merissa

> "The horizontal axis is not time, speed, or reaction progress. It tells us how far one side has rotated around this carbon-carbon bond. For this butane reference, we will track the dihedral angle between the two methyl groups."

### Interaction

Prompt:

**If we move from 60° to 120° on this graph, what changed?**

Choices:
- The molecule reacted into a new compound
- The relative rotation around the same C—C bond changed
- The temperature doubled

Correct: **The relative rotation around the same C—C bond changed**

---

## AXIS STEP 2 — What the vertical axis means

### Visual

Reveal vertical axis labeled:

**Relative conformational potential energy**

Show a simple low shelf and high shelf without the real curve yet.

### Dr. Merissa

> "The vertical axis tells us how energetically favorable or unfavorable that conformation is relative to the others we are comparing. Lower on the graph means lower energy and generally greater stability. Higher means more strain or crowding is present."

### Prediction

Prompt:

**If one conformation has more unfavorable eclipsing interaction, should its point usually move higher or lower on the energy axis?**

Correct: **higher**

If missed, show the U1-10 staggered/eclipsed contact comparison and ask again on a fresh mini-item.

---

# 5. TEACHING SEQUENCE — I DO

## Core worked system

Use **butane viewed down C2—C3** with the front carbon fixed and the back carbon rotating clockwise in 60° steps for the teaching animation.

### Reference convention for this lesson

At `0°`, the two CH3 groups are **eclipsing each other**.

Therefore the sequence is:

- `0°` — CH3/CH3 eclipsed — highest peak
- `60°` — gauche staggered — local minimum
- `120°` — CH3/H eclipsed — intermediate peak
- `180°` — anti staggered — lowest minimum
- `240°` — CH3/H eclipsed — intermediate peak
- `300°` — gauche staggered — local minimum
- `360°` — CH3/CH3 eclipsed — same conformation as 0° after one full rotation

This starting-angle convention is an instructional coordinate choice. A different textbook may phase-shift where it calls 0°, but the molecular relationships and relative energy pattern must remain consistent.

No numerical kcal/mol values are required in this lesson unless verified course materials later require them.

---

## WATCH STEP 1 — Start at 0° before drawing the whole curve

### Visual

Show 0° butane Newman with CH3 eclipsing CH3. Highlight:
- front CH3,
- back CH3 directly aligned behind it,
- the other eclipsing H/H pairs.

On the graph place a single point at `0°`, high on the energy axis.

### Dr. Merissa

> "At zero degrees in our reference, the two methyl groups eclipse each other. Eclipsing creates torsional strain, and this particular eclipsed arrangement also puts the two large methyl groups directly into the strongest crowding alignment in this rotation. So this is the highest-energy point in the butane rotation."

### Interaction

Prompt:

**Why is this not just 'high because it is eclipsed'? What makes this eclipsed position especially unfavorable compared with the other eclipsed positions?**

Supported correct idea:
- it has eclipsing/torsional strain **and** CH3 eclipses CH3 rather than CH3 eclipsing H.

If learner gives only `because it is eclipsed`, acknowledge the true part, then ask:

> "All three peak types are eclipsed. What makes this peak taller than the other two?"

Do not count this as independent explanation evidence.

---

## WATCH STEP 2 — Rotate to 60° and create the first valley

### Visual

Rotate only the back carbon 60°.

The Newman becomes **staggered gauche** with CH3 groups 60° apart.

Place a graph point at 60° lower than the 0° point.

### Dr. Merissa

> "After a 60-degree rotation, the bonds are staggered. Removing the eclipsing lowers torsional strain, so the energy drops. But the methyl groups are still only 60 degrees apart, so they crowd each other more than they will in anti. This gives us a local minimum, not the lowest minimum."

Vocabulary in context:

> "A **local minimum** is a valley that is lower than the nearby points, even if another valley elsewhere is lower still."

### Prediction

Prompt:

**Should this 60° gauche point be lower than the 0° eclipsed point?**

Correct: **Yes**

Then:

**Should it necessarily be the lowest point of the whole rotation?**

Correct: **No**

---

## WATCH STEP 3 — Rotate to 120° and create an intermediate peak

### Visual

Rotate another 60°.

Now show an eclipsed conformation where each CH3 eclipses an H rather than the two CH3 groups eclipsing each other.

Place the 120° point above the gauche valley but below the 0° CH3/CH3 eclipsed peak.

### Dr. Merissa

> "We are eclipsed again, so torsional strain raises the energy. But now the large methyl groups are not eclipsing each other directly. The strongest eclipsing contacts are methyl-hydrogen rather than methyl-methyl, so this peak is lower than the 0-degree peak."

### Interaction

Prompt:

**Both 0° and 120° are eclipsed. Why are their peaks different heights?**

Supported correct idea:
- the identity of the groups eclipsing matters; CH3/CH3 is more crowded than CH3/H.

Wrong idea repair:
If learner says `because 120 is a bigger angle`, show two Newman projections without graph labels and ask which has the larger groups directly aligned.

---

## WATCH STEP 4 — Rotate to 180° and create the deepest valley

### Visual

Rotate another 60°.

Show anti staggered butane with CH3 groups 180° apart.

Place point at 180° as the lowest point.

### Dr. Merissa

> "At 180 degrees the bonds are staggered, so eclipsing is gone. The two methyl groups are also as far apart as they can be around this bond. That reduces methyl-methyl steric crowding compared with gauche. This is the lowest-energy butane conformation in the rotation: anti."

Vocabulary in context:

> "The **global minimum** is the lowest valley on the whole energy curve."

### Interaction

Prompt:

**Why is anti lower than gauche even though both are staggered?**

Supported correct idea:
- both reduce torsional strain by being staggered,
- anti keeps the CH3 groups farther apart than gauche,
- therefore anti has less CH3/CH3 steric crowding.

Do not accept `anti is staggered and gauche is eclipsed`; if selected, show both staggered badges and repair the distinction.

---

## WATCH STEP 5 — Complete 240°, 300°, and 360° one point at a time

### Visual sequence

Rotate in three more 60° steps and add one graph point after each rotation:

### 240°
- eclipsed CH3/H pattern
- intermediate peak equal in type to 120°

### 300°
- gauche staggered
- local minimum equal in type to 60°

### 360°
- CH3/CH3 eclipsed
- returns to same conformational arrangement as 0°
- highest peak equal to 0°

Do not reveal the connecting curve until all seven points have been placed.

### Dr. Merissa

> "The second half repeats the same kinds of relationships. Another methyl-hydrogen eclipsed peak, another gauche valley, then after a full 360-degree rotation we return to the same methyl-methyl eclipsed arrangement we started with."

### Interaction

Prompt at 360°:

**Did the molecule become a new constitutional compound after 360°, or did we return to the same conformation after one full rotation?**

Correct: **same conformation after one full rotation**

---

## WATCH STEP 6 — Connect the points only after the molecule built them

### Visual

Connect the seven points smoothly.

The learner sees:
- high at 0°,
- low at 60°,
- medium-high at 120°,
- lowest at 180°,
- medium-high at 240°,
- low at 300°,
- high at 360°.

Keep tiny synchronized Newman thumbnails above each key angle.

### Dr. Merissa

> "Now the curve has meaning. The graph rises and falls because the molecular arrangement changes as the bond rotates. Peaks correspond to eclipsed arrangements. Valleys correspond to staggered arrangements. But the peaks are not all equal, and the valleys are not all equal, because the groups interacting are different."

---

## WATCH STEP 7 — Separate the two causes explicitly

### Visual

Split the graph reasoning into two comparison panels.

Panel A: **peak versus valley**
- eclipsed → more torsional strain → higher
- staggered → less eclipsing → lower

Panel B: **valley versus valley / peak versus peak**
- anti vs gauche → difference mainly from methyl-methyl steric crowding
- CH3/CH3 eclipsed vs CH3/H eclipsed → group size/crowding changes peak height in addition to eclipsing

### Dr. Merissa

> "There are two questions we keep separate. First: are the bonds eclipsed or staggered? That tells us about torsional strain. Second: which groups are close or directly aligned? That tells us why one staggered valley can differ from another, or why one eclipsed peak can be taller than another."

### Interaction

Prompt:

**Which idea explains why eclipsed is above staggered?**
Correct: **torsional strain from eclipsing**

**Which idea explains why anti is below gauche?**
Correct: **less methyl-methyl steric crowding in anti**

If learner swaps them, route to the visual two-panel contrast rather than repeat the terms.

---

## WATCH STEP 8 — Read the graph backward into a Newman projection

### Visual

Hide the Newman thumbnails. Highlight `180°` on the graph.

Prompt before reveal:

**The 180° point is the deepest valley. What should we already know before drawing it?**

Supported answer:
- it should be staggered,
- for butane it should be anti with CH3 groups 180° apart.

Then reconstruct the Newman from a blank dot/circle using the known 0° reference and three 60° rotations.

Repeat with `120°`:
- peak → eclipsed,
- not highest peak → CH3/H eclipsing rather than CH3/CH3.

### Dr. Merissa

> "A graph point is enough to constrain the molecular picture, but we still preserve the rotation sequence. We do not draw any random eclipsed or staggered Newman just because the point is a peak or valley."

---

## WATCH STEP 9 — Read a Newman projection forward into the graph

### Visual

Show a fresh butane Newman from the same rotation sequence without its angle label.

Example: gauche staggered with the highlighted CH3 groups 60° apart.

Prompt:

**Should this live at the deepest valley, one of the higher staggered valleys, or a peak?**

Correct: **one of the higher staggered valleys**

Then highlight the matching 60°/300° valley class.

### Dr. Merissa

> "Now we are going the other direction: molecular arrangement first, graph position second. That two-way translation is the real skill."

---

# 6. QUICK CONCEPT CHECK BEFORE BUILD TOGETHER

Supported instruction only.

1. **The horizontal axis is reaction time.** False.
2. **The vertical axis represents relative conformational energy.** True.
3. **Eclipsed conformations are generally peaks.** True.
4. **Staggered conformations are generally valleys.** True.
5. **All eclipsed butane peaks must be exactly the same height.** False.
6. **Anti and gauche are both staggered.** True.
7. **Anti butane is lower than gauche because the CH3 groups are farther apart.** True.
8. **0° and 360° in this full rotation return to the same conformation.** True.
9. **A taller peak can be explained only by having a larger angle value on the x-axis.** False.

Any error returns only to the relevant comparison.

---

# 7. BUILD TOGETHER — WE DO

## Fresh supported system

Use **pentane viewed down C2—C3 from C2 toward C3**, with:
- front larger group = `CH3`,
- back larger group = `CH2CH3`,
- two H on each viewing carbon besides the axis partner as appropriate.

Define the supported starting convention:
- `0°` = the front CH3 and back CH2CH3 eclipse each other.

Start with:
- blank Newman workspace,
- empty axes,
- angle markers 0° through 360°.

## Build step 1 — identify the compared large groups

Prompt:

**Which non-hydrogen group is attached to the front carbon?**
Correct: `CH3`

**Which non-hydrogen group is attached to the back carbon?**
Correct: `CH2CH3`

## Build step 2 — place the 0° conformation

Learner builds the eclipsed state with CH3 eclipsing CH2CH3.

Prompt:

**Should this be a relatively high or low point?**
Correct: **high**

## Build step 3 — rotate 60°

Learner rotates back groups together and identifies the staggered state.

Prompt:

**Peak or valley?**
Correct: **valley**

## Build step 4 — rotate to the anti-like 180° relationship

Continue in 60° steps until the two larger groups are opposite.

Prompt:

**Among the staggered positions, which should be most favorable when these two larger groups are farthest apart?**
Correct: **the 180° anti-like arrangement**

## Build step 5 — complete the seven-point pattern

Learner places all seven graph points before the curve is connected.

System checks:
- eclipsed points at alternating 60° intervals,
- staggered points between them,
- highest eclipsed class where the two larger groups directly eclipse,
- lowest staggered class where those groups are opposite,
- 0° and 360° equivalent.

## Build Together completion

Dr. Merissa:

> "You built the energy pattern from the rotation instead of copying a wave. The exact group names changed from butane, but the decision process stayed the same: identify the arrangement, identify the interaction, then place the energy."

Log as supported `CONFORMATION_ENERGY_BUILD_TOGETHER_SUCCESS`, never independent evidence.

---

# 8. GUIDED PRACTICE — YOU DO WITH SUPPORT

## Fresh guided system

Use **hexane viewed down C3—C4**, with the two ethyl groups as the compared larger groups.

Provide one known Newman at `180°` showing the two ethyl groups anti.

Do **not** give the finished energy curve.

## Guided task A — classify the known 180° point

Prompt:

**Is this Newman staggered or eclipsed?**
Correct: **staggered**

**Should this anti ethyl/ethyl arrangement be a local valley, deepest valley, or peak?**
Correct: **deepest valley among this simple rotation's staggered choices**

## Guided task B — reconstruct 120°

Prompt:

**Rotate the back carbon backward by 60° from 180° to 120°. What class of conformation appears?**
Correct: **eclipsed**

Learner draws the Newman.

## Guided task C — reconstruct 60°

Rotate another 60°.

Correct:
- staggered,
- gauche-like larger-group relationship,
- higher valley than 180°.

## Guided task D — predict peak heights

Ask learner to compare:
- a position with ethyl eclipsing ethyl,
- a position with ethyl eclipsing H.

Correct:
- ethyl/ethyl eclipsed is higher.

## Guided support fading

Two consecutive guided decisions without corrective reveal begin fading.

**What support fades means here:**
1. remove the staggered/eclipsed badge first,
2. remove automatic angle labels from the Newman next,
3. remove the `peak/valley` choice buttons and require the learner to tap the graph region,
4. keep one known anchor point visible until two neighboring positions are reconstructed correctly,
5. then remove the anchor and present the single goal `Complete the rotation/energy mapping`,
6. hints remain learner-requested only,
7. the whole Guided item remains supported after fading,
8. an error restores only the minimum scaffold for the failed relationship and resets the two-success streak.

Do not move to cold evidence with unresolved confusion about angle order, peak/valley class, or the cause of peak/valley height differences.

---

# 9. MISCONCEPTION CONTRASTS

## M1 — "The graph is a reaction progress diagram"

### Representation switch

Show two synchronized panels:
- left: one molecule rotating around the same C—C bond with connectivity unchanged,
- right: the x-axis moving through 0°→360°.

Dr. Merissa:

> "No bonds are being broken and no new product is being formed. The x-axis records conformation during bond rotation, not a chemical reaction pathway."

Repair: learner selects `same molecule, different conformation` versus `new compound` for two fresh frames.

---

## M2 — "Every peak is the same because all peaks are eclipsed"

### Representation switch

Show two eclipsed butane Newmans:
- CH3 eclipsing CH3,
- CH3 eclipsing H.

Overlay `both eclipsed` on both, then separately highlight the group identities in direct alignment.

Dr. Merissa

> "Eclipsing explains why both are peaks. The groups doing the eclipsing help explain why one peak is taller."

Repair: identify which pair of groups causes the larger crowding interaction.

---

## M3 — "Every valley is the same because all valleys are staggered"

### Representation switch

Show anti and gauche butane side by side with `STAGGERED` on both.

Dr. Merissa:

> "Staggering removes the eclipsing penalty in both. Anti is lower because the two methyl groups are farther apart than in gauche."

Repair: rank the two staggered views and identify the CH3—CH3 separation.

---

## M4 — "The tallest point must occur at the largest angle"

### Representation switch

Hide angle numbers and show only Newman interactions. Then restore 0° and 360° labels at equal highest peaks.

Dr. Merissa:

> "Graph height is caused by molecular interactions, not by the numerical size of the angle. A 360-degree point can return to the same conformation and same energy as zero degrees."

Repair: choose between 180° anti and 360° CH3/CH3 eclipsed based on structure, not angle magnitude.

---

## M5 — "60° means gauche no matter what groups I am comparing"

### Representation switch

Highlight the exact two groups whose dihedral angle is being tracked.

Dr. Merissa:

> "The angle belongs to a specified pair of bonds/groups around the viewing axis. We cannot call a relationship 60 degrees by looking at a random pair."

Repair: learner taps the two tracked groups before reading the angle.

---

## M6 — "0° and 360° are two different conformations because they are two graph points"

### Representation switch

Animate a full rotation and overlay the starting Newman on the 360° Newman.

Dr. Merissa:

> "The graph uses two x-axis locations to show the start and completion of one full turn, but the molecular arrangement at 360 degrees matches the arrangement at zero degrees."

Repair: label `same conformation after a full rotation` versus `different conformation`.

---

## M7 — "Torsional strain explains anti versus gauche"

### Representation switch

Place anti and gauche staggered Newmans side by side. Add a `no eclipsing in either` cue.

Dr. Merissa:

> "Both are staggered, so the anti/gauche difference is not explained by one being eclipsed. The main difference here is methyl-methyl steric crowding."

Repair: choose `torsional` versus `steric crowding` for the anti-gauche comparison.

---

## M8 — "Steric crowding is the only reason eclipsed is high"

### Representation switch

Use ethane as the simplest counterexample: eclipsed H/H arrangements still sit above staggered even without methyl-methyl crowding.

Dr. Merissa:

> "Eclipsing itself carries a torsional energy penalty. Larger groups can add more crowding, but torsional strain does not disappear just because the eclipsing groups are small."

Repair: compare eclipsed versus staggered ethane qualitatively.

---

# 10. SIX-WAY "I DON'T KNOW" CONTENT ROUTING

The shared router remains authoritative.

## IDK 1 — "I don't understand what the question means"

Response:

> "First identify whether the problem is asking you to read a Newman from the graph, place a Newman on the graph, or compare two energy points. We will do only that one job first."

Switch to a three-option task-type view and then return to a fresh item.

## IDK 2 — "I understand it, I don't know how to start"

Response:

> "Start by finding one anchor: what Newman conformation is known, and what angle or graph point belongs to it? Then move in 60-degree rotations from that anchor."

Model one first step only, then return to a fresh problem.

## IDK 3 — "I forgot something I need"

Offer only targeted dependencies:
- staggered versus eclipsed,
- anti versus gauche,
- front/back rotation,
- what a dihedral angle is,
- torsional strain,
- steric crowding.

Repair only the selected dependency.

## IDK 4 — "I started but got stuck"

Preserve work and ask where:
- identifying the known Newman,
- deciding the angle sequence,
- deciding peak versus valley,
- deciding peak height,
- deciding valley depth,
- drawing the Newman at a graph point,
- explaining the energy difference.

Repair only that step.

## IDK 5 — "I need to see an example"

Use a new supported molecule/rotation not in the cold bank. Build only three consecutive positions first, then complete if needed.

Return to a fresh item afterward.

## IDK 6 — "This explanation isn't making sense"

Switch to **Rotation-Movie Mode**:
1. enlarge the Newman projection,
2. show the back carbon rotating continuously while front stays fixed,
3. stop every 60°,
4. freeze the molecular interaction,
5. let the learner drag that frozen frame vertically onto a blank energy scale,
6. only after placement reveal the corresponding x-axis angle,
7. connect the points after all frames are sorted.

If still unclear, use a **hill-road analogy** only as a bridge:

> "Think of the rotation as traveling around one circular route. Some arrangements are uphill because the groups are forced into less comfortable positions; others are downhill because the arrangement is more comfortable. The graph records the height of each stop, but the molecule tells us why the stop is high or low."

Immediately map the analogy back to Newman structures and chemical causes.

---

# 11. INDEPENDENT PRACTICE — COLD EVIDENCE BANK

Cold evidence gets:
- no synchronized animation,
- no automatic peak/valley labels,
- no angle ruler unless the prompt explicitly provides an angle,
- no group-contact overlay,
- no prefilled Newman thumbnails,
- no hints,
- no torsional/steric cue card.

Every concrete cold molecule/drawing must be held out from Teach, Watch, Build Together, Guided, misconception repairs, and IDK worked examples. A cold item may test a previously taught relationship pattern, but it must not reuse the same molecule-plus-orientation-plus-completed visual.

If help is requested, the current item converts to supported practice and cannot count as clean independent evidence.

---

## CE-I1 — Identify what each axis means

Show an unlabeled conformational-energy curve with blank axis-label boxes.

Prompt:

**Label the horizontal and vertical axes and explain what moving right versus moving up means.**

### Scoring contract

Required propositions:
1. horizontal axis = rotation/dihedral angle around the specified C—C bond,
2. moving right = changing rotational position, not creating a new compound merely because x increases,
3. vertical axis = relative conformational potential energy,
4. moving up = higher energy / less favorable interaction for the compared conformations,
5. x-axis and y-axis roles may not be reversed.

Accept example:
> "Across the x-axis the bond rotates through different dihedral angles. Up the y-axis means higher conformational energy."

Wrong-but-keyword-complete example that must fail:
> "The x-axis is energy and the y-axis is the dihedral angle; moving up means the molecule has rotated farther."

Why it fails: both correct concepts are present but assigned to the wrong axes.

Contradiction rule:
> "The x-axis is rotation, but moving right means the energy increases because x is the energy axis" does not pass.

---

## CE-I2 — Classify fresh graph points as staggered/eclipsed

Use a held-out simple rotation, for example **1-butene's terminal C—C single bond is NOT appropriate here if pi-bond ambiguity is introduced**; instead use a held-out **propane/ethyl fragment single-bond model with labeled substituents** where the front/back relationships are explicit.

Provide three Newman thumbnails and three unlabeled graph points: one peak, one valley, one peak.

Prompt:

**Match each Newman to the correct peak or valley class and explain the relationship you used.**

### Scoring contract

Required propositions:
1. aligned front/back bonds = eclipsed = higher/peak class,
2. offset front/back bonds = staggered = lower/valley class,
3. classification must come from relative bond alignment, not graph shape alone,
4. a response that swaps aligned and offset roles fails even if it uses all required words.

Accept example:
> "The aligned Newman goes to a peak because it is eclipsed. The offset Newman goes to a valley because it is staggered."

Wrong-but-keyword-complete example that must fail:
> "The aligned Newman is staggered and belongs in the valley; the offset Newman is eclipsed and belongs at the peak."

Why it fails: the defining geometric roles are reversed.

---

## CE-I3 — Reconstruct neighboring Newmans from one known point

Use a held-out **3-methylhexane C3—C4** viewing bond with one provided Newman at `180°` and a stated direction of rotation.

Prompt:

**Draw the 120° and 240° Newman projections that are one 60° step on either side of the known 180° conformation. Then classify them as peak or valley positions.**

### Scoring contract

Required relationships:
1. front-carbon substituents remain on the front carbon,
2. back-carbon substituents rotate together by exactly 60° per step,
3. connectivity/group ownership does not change,
4. one 60° step away from a staggered anti-like 180° anchor produces eclipsed conformations,
5. graph classification follows the actual resulting alignment.

Accept example shape:
> "From 180°, I rotate only the back set 60° in the stated direction. Both neighboring positions are eclipsed, so both map to peaks."

Wrong-but-keyword-complete response that must fail:
> "I keep the back groups fixed and rotate the front and back labels onto the opposite carbons; 120° and 240° are staggered valleys because they are beside 180°."

Why it fails: it changes ownership/rotation mechanics and reverses the peak/valley consequence.

---

## CE-I4 — Compare anti and gauche valleys

Use a held-out substituted single-bond rotation with one clearly identified larger group on each carbon; for example **2-methylpentane viewed C2—C3** with a specified pair highlighted. Do not reuse the exact Newman drawings from U1-10 Guided.

Prompt:

**Two shown conformations are both staggered. One has the highlighted larger groups anti and one has them gauche. Which valley should be lower, and why?**

### Scoring contract

Required propositions:
1. both are staggered,
2. anti places the specified larger groups farther apart,
3. gauche brings those groups closer,
4. the lower anti valley is explained by less steric crowding for the specified pair,
5. do not claim gauche is eclipsed.

Accept example:
> "The anti valley is lower. Both are staggered, but the larger groups are farther apart in anti, so there is less steric crowding."

Wrong-but-keyword-complete example that must fail:
> "Gauche is lower because it is staggered while anti is eclipsed; the 60-degree groups are farther apart than the 180-degree groups."

Why it fails: it reverses staggered/eclipsed status and the spatial relationship.

---

## CE-I5 — Compare two eclipsed peak heights

Use held-out **3-methylpentane viewed down C2—C3**. On C2, the non-axis groups are `CH3`, `H`, `H`; on C3, the non-axis groups are `CH2CH3`, `CH3`, `H`. Compare one eclipsed conformation where the C3 `CH2CH3` group eclipses the C2 `CH3` group with another where that same `CH2CH3` group eclipses a C2 `H`. Do not reuse a molecule-plus-orientation from Watch, Build Together, Guided, misconception repairs, or IDK examples.

Prompt:

**Both conformations are eclipsed. Which should produce the taller peak, and what interaction makes the difference?**

### Scoring contract

Required propositions:
1. both are peaks because both are eclipsed,
2. the conformation with the larger groups directly eclipsing has greater crowding / more unfavorable eclipsing interaction,
3. therefore that eclipsed arrangement is the taller peak,
4. angle magnitude alone is not the cause.

Accept example:
> "The ethyl-methyl eclipsed arrangement is the taller peak. Both are eclipsed, but directly aligning the two larger groups adds more crowding than ethyl eclipsing H."

Wrong-but-keyword-complete example that must fail:
> "The ethyl-H eclipsed arrangement is taller because smaller groups create more steric crowding, while ethyl-methyl eclipsing is more stable."

Why it fails: it reverses the size/crowding relationship and stability conclusion.

---

## CE-I6 — 0° versus 360° equivalence

Use a held-out Newman rotation with the starting conformation shown at 0° and a blank slot at 360°.

Prompt:

**Draw the 360° conformation and state whether it is the same or a different conformation from 0°. Explain.**

### Scoring contract

Required propositions:
1. 360° represents one complete rotation,
2. after a full 360° the relative arrangement returns to the starting arrangement,
3. carbon/group ownership remains unchanged,
4. 0° and 360° therefore have the same conformational energy for the same molecular arrangement,
5. separate graph x-coordinates do not make them chemically different conformations.

Accept example:
> "At 360° the Newman matches the 0° arrangement again. It is the same conformation after one full turn, so its energy is the same."

Wrong-but-keyword-complete example that must fail:
> "360° is a different conformation because it is farther to the right on the graph, so it must have more energy than 0°."

Why it fails: it confuses graph coordinate with molecular arrangement.

---

## CE-I7 — Full qualitative but non-butane energy profile

Use **held-out heptane viewed C3—C4**, with one larger carbon group on each viewing carbon chosen so the tracked pair has a clear anti/gauche/eclipsed sequence. Define the 0° starting arrangement explicitly but do not provide the graph.

Prompt:

**Rotate in 60° steps from 0° through 360°. Draw or select the Newman at each step, classify each as peak/valley, and sketch the qualitative energy curve.**

### Scoring contract

A clean success requires:
1. seven correctly ordered rotational states including both 0° and 360°,
2. 60° increments maintained,
3. front/back ownership preserved,
4. alternating eclipsed/staggered classes,
5. highest peak assigned to the stated larger-group/larger-group eclipse when applicable,
6. lowest valley assigned to the anti arrangement of the tracked larger groups,
7. 0° and 360° recognized as equivalent endpoints,
8. graph heights justified from interactions, not x-axis magnitude.

Accept explanation shape:
> "The curve alternates peak and valley because the rotation alternates eclipsed and staggered every 60°. The tallest peak is where the largest tracked groups eclipse, and the deepest valley is where those groups are anti. The 360° endpoint returns to the 0° conformation."

Wrong-but-keyword-complete response that must fail:
> "The curve rises continuously from 0° to 360° because the angle gets larger; anti is a peak at 180° and the largest-group eclipse is the lowest valley."

Why it fails: it reverses the peak/valley relationships and treats angle magnitude as energy.

---

## CE-I8 — Test-style graph-to-Newman reconstruction

Use a **held-out conformational-energy diagram** for a simple substituted single-bond rotation, with three lettered points such as A, D, and F. Provide one anchor Newman and the viewing direction.

Prompt:

**Draw the Newman projection at A, D, and F, then explain why F is higher or lower in energy than D.**

The item intentionally resembles the historical Test 1 skill without copying a historical answer or claiming 2026 will repeat it.

### Scoring contract

Required propositions:
1. each lettered graph point is mapped to the correct rotational angle/order relative to the anchor,
2. every 60° step rotates one carbon's three groups together,
3. front/back ownership remains correct,
4. peak/valley class agrees with the drawn Newman,
5. the F-versus-D explanation identifies the actual interaction difference shown by those two conformations,
6. if both are staggered, explanation must use the relevant steric relationship rather than claiming one is eclipsed,
7. if one is eclipsed and one staggered, torsional strain must be assigned to the eclipsed state,
8. a correct-looking graph label with a role-reversed explanation does not create explanation evidence.

Accept example shape:
> "D is the lower staggered arrangement because the larger groups are farther apart. F is higher because those groups are closer / or because F is eclipsed, depending on the actual provided pair."

The implementation must generate the accept contract from the actual held-out D/F states. It may not accept both causal possibilities indiscriminately.

Wrong-but-keyword-complete failure example for a case where D = anti staggered and F = gauche staggered:
> "F is higher because it is eclipsed and has torsional strain; D is gauche at 60° while F is anti at 180°."

Why it fails: it uses expected vocabulary but misidentifies both conformation classes and angle relationships.

Contradiction rule:
A response that first correctly states `both are staggered` and then says `F is higher because it is eclipsed` does not pass.

---

# 12. INDEPENDENT EVIDENCE RULE

Independent evidence requires a cold fresh item completed without support.

Do not display `Mastered` after one correct graph or one correct Newman reconstruction.

To satisfy shared mastery, the engine must eventually record:

1. at least one cold graph↔Newman translation or equivalent high-value item,
2. a role-preserving causal explanation of an energy difference,
3. a second different cold success after a meaningful interval.

Recommended evidence before mixed Test 1 practice:
- one angle/sequence reconstruction,
- one peak-height or valley-depth comparison,
- one graph-to-Newman construction,
- one explanation response,
- later fresh retrieval.

Objective correctness and explanation correctness are scored separately.

A lucky correct peak/valley choice with a reversed explanation does not create explanation evidence.

A correct explanation attached to the wrong Newman/graph mapping is not a clean independent success.

After repair, explanation evidence must be recollected on a fresh prompt rather than by asking the learner to repeat the corrected sentence.

---

# 13. EXPLAIN-WHY PROMPTS — ROLE-PRESERVING SCORING

## E-W1 — Why are eclipsed conformations peaks?

Required propositions:
1. front/back bond directions align in an eclipsed conformation,
2. that alignment creates torsional strain / less favorable bonding-electron interactions,
3. therefore eclipsed conformations are higher in energy than nearby staggered arrangements.

Accept:
> "Eclipsed bonds line up, which increases torsional strain, so those conformations sit at higher-energy peaks."

Wrong-but-keyword-complete failure:
> "Staggered bonds line up and create torsional strain, so staggered conformations are the peaks."

Why it fails: geometric and energy roles are reversed.

---

## E-W2 — Why is anti butane below gauche?

Required propositions:
1. both anti and gauche are staggered,
2. anti places the two methyl groups 180° apart,
3. gauche places them 60° apart,
4. anti therefore has less methyl-methyl steric crowding,
5. anti is lower in energy.

Accept:
> "Both are staggered, but anti keeps the methyl groups farther apart, so it has less steric crowding and sits lower."

Wrong-but-keyword-complete failure:
> "Gauche is lower because 60° keeps the methyl groups farther apart than the 180° anti arrangement."

Why it fails: spatial and energy relationships are reversed.

---

## E-W3 — Why is the CH3/CH3 eclipsed peak higher than a CH3/H eclipsed peak?

Required propositions:
1. both conformations are eclipsed and therefore both have torsional strain,
2. CH3/CH3 direct alignment places larger groups into a more unfavorable eclipsing/crowding interaction than CH3/H,
3. therefore the CH3/CH3 eclipsed conformation is the taller peak.

Wrong-but-keyword-complete failure:
> "CH3/H eclipsing is higher because hydrogen is larger than methyl, so CH3/CH3 eclipsing is less crowded."

Why it fails: it reverses group-size/crowding roles and the peak ranking.

---

## E-W4 — Why can 0° and 360° have the same energy?

Required propositions:
1. 360° is one full rotation,
2. relative group arrangement returns to the starting conformation,
3. same molecular arrangement has the same conformational energy under the same conditions,
4. different x-axis labels do not create different chemistry.

Wrong-but-keyword-complete failure:
> "360° has more energy because it is numerically larger than 0° even though the molecular arrangement is the same."

Why it fails: it assigns energy to angle magnitude rather than molecular interactions.

---

## E-W5 — Why does a conformational-energy curve alternate peaks and valleys every 60° in this tetrahedral single-bond sequence?

Required propositions:
1. each carbon has three substituent bond directions spaced roughly 120° around the axis,
2. rotating one side by 60° alternates between alignment and offset of front/back bond sets,
3. aligned = eclipsed = peak class,
4. offset = staggered = valley class,
5. the exact heights/depths can differ because group identities differ.

Wrong-but-keyword-complete failure:
> "Every 60° rotation keeps the bonds in the same eclipsed arrangement, so all graph points should have equal energy."

Why it fails: it erases the alternating geometry and energy pattern.

---

# 14. TRANSFER TASKS

## Transfer CE-T1 — graph point to molecular cause

Show a curve with one unusually tall peak and two smaller peaks.

Prompt:

**Without naming the angle first, what kind of molecular interaction would you look for to explain the tallest peak?**

Required:
- eclipsed state,
- larger groups directly aligned relative to the smaller eclipsed cases.

---

## Transfer CE-T2 — Newman to graph region

Show a fresh staggered Newman with specified larger groups gauche.

Prompt:

**Place this on the appropriate type of graph region and explain why it is not the deepest staggered valley.**

Required:
- valley because staggered,
- higher than anti valley because specified larger groups are closer.

---

## Transfer CE-T3 — diagnose a classmate's graph

Show a student graph that places anti at a high peak and CH3/CH3 eclipsed at the deepest valley.

Prompt:

**Identify the two role reversals and repair them.**

Required:
- anti belongs at lowest staggered minimum,
- CH3/CH3 eclipsed belongs at highest peak for the butane reference.

---

## Transfer CE-T4 — phase-shifted graph convention

Show a correctly shaped butane curve that starts at anti = 0° rather than CH3/CH3 eclipsed = 0°.

Prompt:

**Is this automatically wrong because our teaching graph started at a different conformation at 0°? Explain.**

Required:
- zero-angle reference can be chosen differently,
- internal sequence/relative molecular relationships must remain consistent,
- do not reject a correct graph only because the phase origin differs.

This transfer prevents memorization of one absolute x-axis drawing as the only valid convention.

---

# 15. LATER RETRIEVAL

After at least one different lesson or meaningful activity, present a fresh conformational-energy graph with one known Newman anchor.

Ask only:
1. reconstruct one neighboring peak Newman,
2. reconstruct one neighboring valley Newman,
3. compare their energy qualitatively,
4. give one short causal explanation.

Do not reopen the full beginner lesson if retrieval is clean.

A later clean graph↔Newman reconstruction can satisfy the second-cold-item mastery component if explanation evidence already exists.

---

# 16. ADAPTIVE TEST-OUT PATH

Before full teaching, use a 3-item cold probe:

1. label the axes and identify peak vs valley from one Newman pair,
2. reconstruct one 60° neighboring Newman from a known anchor,
3. explain anti-vs-gauche or eclipsed-vs-staggered energy difference.

### 3/3 clean

Skip full Teach/Watch. Give later confirmation plus any missing explanation evidence.

### 2/3

Teach only the failed subskill and verify with a fresh item.

### 0–1/3

Run the full lesson.

Any synchronized animation, angle reveal, interaction overlay, or causal cue contaminates the probe item.

---

# 17. ACCESSIBILITY + PHONE/IPAD REQUIREMENTS

1. Peaks/valleys may not be distinguished by color alone; use geometry, labels, and text equivalents.
2. Every Newman rotation animation needs a reduced-motion version with discrete 60° states.
3. The selected graph point and corresponding Newman must be linked with text as well as any visual line/color cue.
4. The learner must be able to replay one 60° rotation without replaying the entire sequence.
5. Graph tap targets must be large enough to select a point on phone/iPad.
6. Portrait layout may stack Newman above graph, but both must remain visible during direct mapping tasks without horizontal scrolling.
7. Landscape may place Newman and graph side by side.
8. Screen-reader text for a graph point must state angle/relative category only when that information is legitimately exposed in the current phase.
9. Voice narration is optional; all reasoning is available in text.
10. Reduced-motion mode must preserve the order 0°→60°→120°→180°→240°→300°→360° without smooth animation.
11. A graph cannot rely on exact pixel height alone for assessment; semantic point roles must be encoded.
12. Return destination to Test 1 support must be preserved.

---

# 18. CHEMISTRY TOOLBOX RULES

During Teach, Watch, Build Together, and Guided, toolbox may include after the relevant concept is taught:
- compact staggered/eclipsed reminder,
- compact anti/gauche reminder,
- 60° rotational-step wheel,
- `x = rotation/dihedral angle`,
- `y = relative conformational energy`,
- torsional versus steric-crowding comparison card.

The toolbox must not show the completed target curve or target Newman.

During cold evidence these supports are hidden unless the assessment configuration explicitly allows them.

Opening a disallowed support during a cold item converts it to supported practice.

---

# 19. IMPLEMENTATION EVENT CONTRACT

Suggested events:
- `CONFORMATION_ENERGY_PREREQ_PASS`
- `CONFORMATION_ENERGY_PREREQ_REPAIR`
- `CONFORMATION_ENERGY_AXIS_RESULT`
- `CONFORMATION_ENERGY_ROTATION_STEP`
- `CONFORMATION_ENERGY_POINT_PLACED`
- `CONFORMATION_ENERGY_NEWMAN_MATCH_RESULT`
- `CONFORMATION_ENERGY_PEAK_VALLEY_RESULT`
- `CONFORMATION_ENERGY_RANK_RESULT`
- `CONFORMATION_ENERGY_BUILD_TOGETHER_SUCCESS`
- `CONFORMATION_ENERGY_GUIDED_SUCCESS`
- `CONFORMATION_ENERGY_MISCONCEPTION` with code
- `CONFORMATION_ENERGY_REPRESENTATION_SWITCH`
- `CONFORMATION_ENERGY_INDEPENDENT_ATTEMPT`
- `CONFORMATION_ENERGY_INDEPENDENT_SUCCESS`
- `CONFORMATION_ENERGY_EXPLAIN_WHY_RESULT`
- `CONFORMATION_ENERGY_TRANSFER_RESULT`
- `CONFORMATION_ENERGY_RETRIEVAL_RESULT`

Suggested misconception codes:
- `GRAPH_AS_REACTION_PROGRESS`
- `AXES_REVERSED`
- `ANGLE_MAGNITUDE_AS_ENERGY`
- `ALL_ECLIPSED_PEAKS_EQUAL`
- `ALL_STAGGERED_VALLEYS_EQUAL`
- `ANTI_GAUCHE_ROLE_REVERSAL`
- `TORSIONAL_STERIC_CONFUSION`
- `FULL_ROTATION_TREATED_AS_NEW_CONFORMATION`
- `WRONG_GROUP_PAIR_FOR_DIHEDRAL`
- `FRONT_BACK_OWNERSHIP_LOST_DURING_ROTATION`
- `PEAK_VALLEY_ROLE_REVERSAL`

The content layer reports outcomes. It does not declare mastery.

---

# 20. BEGINNER-CLARITY RELEASE GATE

Before implementation, an auditor must answer YES to all:

1. Does the lesson explain the graph as a record of real bond rotation rather than a wave to memorize?
2. Are x- and y-axis meanings established before the full curve appears?
3. Is x explicitly distinguished from time/reaction progress?
4. Is y explicitly tied to relative conformational energy?
5. Are 0°, 60°, 120°, 180°, 240°, 300°, and 360° built one molecular state at a time?
6. Is the 0° reference convention stated explicitly rather than treated as universal?
7. Is 0°/360° equivalence taught explicitly?
8. Are eclipsed peaks linked to torsional strain?
9. Are staggered valleys linked to reduced eclipsing?
10. Is anti-vs-gauche separated from eclipsed-vs-staggered reasoning?
11. Is anti lower than gauche for the correct steric reason?
12. Is the CH3/CH3 eclipsed peak higher than CH3/H eclipsed peaks for the correct interaction reason?
13. Does the learner translate graph→Newman and Newman→graph?
14. Does Build Together use a different system from the I DO example?
15. Does Guided use a different system from both Watch and Build Together?
16. Does scaffold fading specify exactly what disappears?
17. Are misconceptions repaired visually/relationally rather than by repeating labels?
18. Does every IDK route return to a fresh item afterward?
19. Are cold items uncontaminated by synchronized animations/answer overlays?
20. Does every cold reasoning item define its own role-preserving scoring contract?
21. Can keyword-complete reversals of axis roles, peak/valley roles, anti/gauche, torsional/steric cause, or 0°/360° equivalence be rejected explicitly?
22. Are objective correctness and explanation correctness scored separately?
23. Does the cold bank avoid exact molecule-plus-orientation reuse from teaching/support phases?
24. Does reduced-motion preserve the full 60° sequence?
25. Can the lesson operate comfortably on phone/iPad?
26. Does the lesson prepare for historical Test 1-style graph↔Newman reconstruction without claiming the 2026 test will repeat it?
27. Does the lesson avoid unnecessary numerical energy memorization unless verified course materials require it?

Any NO blocks production.

---

# 21. DEFINITION OF DONE FOR U1-11

The lesson is successful when a beginner who already understands basic Newman projections can take a fresh rotational-energy problem and say, in her own reasoning:

- what the axes mean,
- which bond is rotating,
- what conformation belongs to a given angle or graph point,
- why an eclipsed state is a peak,
- why a staggered state is a valley,
- why one eclipsed peak can be taller than another,
- why anti can be lower than gauche even though both are staggered,
- why 0° and 360° can represent the same arrangement,
- and how to reconstruct a Newman from a graph or place a Newman on the graph,

then complete a fresh cold graph↔Newman task without the teaching screen.

The standard is not:

> "She memorized a six-hump-looking curve."

The standard is:

> **"She can rebuild the energy curve from the rotating molecule and rebuild the molecule from the energy curve."**
