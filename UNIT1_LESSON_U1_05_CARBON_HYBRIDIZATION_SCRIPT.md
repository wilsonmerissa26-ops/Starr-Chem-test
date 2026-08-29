# UNIT 1 LESSON U1-05 - CARBON HYBRIDIZATION FROM BONDING GEOMETRY
## Fully authored beginner lesson script

**Status:** content draft for instructional review before runtime implementation.

**Parent curriculum:** `UNIT1_BEGINNER_TEACHING_CURRICULUM.md`

**Teaching-engine contract:** `DR_MERISSA_TEACHING_ENGINE_SPEC.md`

**Frozen template standards:**
- `UNIT1_LESSON_U1_01_BOND_LINE_SCRIPT.md`
- `UNIT1_LESSON_U1_03_FUNCTIONAL_GROUPS_SCRIPT.md`
- `UNIT1_LESSON_U1_04_INTERMOLECULAR_FORCES_BOILING_POINT_SCRIPT.md`
- `UNIT1_LESSON_U1_10_NEWMAN_PROJECTIONS_SCRIPT.md`
- `UNIT1_LESSON_U1_11_CONFORMATIONAL_ENERGY_DIAGRAMS_SCRIPT.md`
- `UNIT1_LESSON_U1_12_RING_STRAIN_SCRIPT.md`
- `UNIT1_LESSON_U1_13_CYCLOHEXANE_CHAIRS_SCRIPT.md`

**Purpose of this file:** teach carbon hybridization as a local geometry label derived from the number of electron-group directions around a selected carbon, not as a guess from how many line marks appear on the page. The learner must understand why a single, double, or triple bond to one neighboring atom still occupies one direction for electron-group counting, connect 4/3/2 directions to tetrahedral/trigonal-planar/linear geometry and then to `sp3`/`sp2`/`sp`, and label different carbons inside the same molecule independently.

Cold independent items in this file are named explicitly and carry their own role-preserving scoring contracts from the start.

---

# 1. LESSON GOAL

A learner who enters with little or no usable hybridization knowledge should leave able to:

1. select one carbon at a time and analyze only that carbon's local environment,
2. define an **electron-group direction** for this lesson as one direction from the selected carbon toward one bonded neighboring atom,
3. understand that a single, double, or triple bond to the same neighboring atom counts as **one electron-group direction**, not one group per drawn bond line,
4. count four electron-group directions around a typical neutral carbon and connect them to tetrahedral geometry,
5. connect four groups -> tetrahedral -> `sp3`,
6. count three electron-group directions and connect them to trigonal-planar geometry,
7. connect three groups -> trigonal planar -> `sp2`,
8. count two electron-group directions and connect them to linear geometry,
9. connect two groups -> linear -> `sp`,
10. use implied carbon hydrogens correctly when a bond-line drawing does not show every H,
11. recognize that different carbons in the same molecule can have different hybridizations,
12. identify carbonyl carbon as `sp2` from three electron-group directions rather than from a memorized carbonyl slogan,
13. identify ordinary alkene carbon as `sp2` and ordinary alkyne carbon as `sp` by the same local counting method,
14. reject shortcuts such as `double bond means two groups`, `sp3 means three bonds`, or `all carbons in a molecule have the same label`,
15. explain the group count and geometry that justify a hybridization label,
16. solve a fresh mixed-structure hybridization task without prompts.

This lesson is not complete because the learner can memorize:

> `single = sp3, double = sp2, triple = sp`.

That shortcut is too weak because it does not explain branch carbons, carbonyl carbons, mixed structures, or why a multiple bond counts as one direction.

The lesson is complete when the learner can point to one carbon, count its local directions correctly, name the geometry, and then assign the hybridization label.

---

# 2. SCOPE BOUNDARY

This lesson teaches **carbon hybridization only** in the neutral, early-organic structures needed for Unit 1.

Do not expand this lesson into:
- a full atomic-orbital derivation,
- heteroatom hybridization tables,
- charged-carbon edge cases,
- aromaticity,
- resonance-driven exceptions,
- detailed sigma/pi orbital mathematics.

Those topics may be taught later if verified course materials require them.

For the present lesson, the operational rule is:

> **Pick one carbon. Count the directions from that carbon to bonded neighboring atoms. A multiple bond still points toward one neighbor, so it counts as one direction. Then map the number of directions to geometry and hybridization.**

---

# 3. LEARNER-FACING ORIENTATION

## Screen title

**Hybridization: count the directions around one carbon**

## Dr. Merissa narration

> "Hybridization is a label chemists use to describe the local arrangement around a carbon. We are not going to guess the label from the way the structure is drawn. We are going to choose one carbon, count how many directions its bonded neighbors occupy, connect that count to a shape, and then assign the label."

### Immediate learner check

Visual: show one carbon in the middle with four bonded atoms arranged in a 3D tetrahedral model.

Prompt:

**Should we decide this carbon's hybridization by looking at the entire molecule, or by inspecting the bonding directions around this carbon?**

Correct: **inspect this carbon's local bonding directions**

If missed:

> "Hybridization is local. Two carbons in the same molecule can have different arrangements, so we analyze one carbon at a time."

Orientation is instructional only, not mastery evidence.

---

# 4. SMALLEST PREREQUISITE GATE

Do not reteach all of bond-line notation or all of Lewis structures.

## Gate P1 - recognize bond order

Show:
- `C-C`
- `C=C`
- `C≡C`

Prompt:

**Which one is the double bond?**

Correct: `C=C`

**Which one is the triple bond?**

Correct: `C≡C`

If missed, repair only single/double/triple notation.

---

## Gate P2 - implied carbon hydrogen

Show a bond-line carbon attached by three single bonds to three other carbons.

Prompt:

**If this neutral carbon normally has four total bond-order units in this structure, is one hydrogen still implied even if H is not drawn?**

Correct: **Yes**

If missed, route to the smallest U1-01 implied-hydrogen repair and return with a fresh branch carbon.

---

## Gate P3 - multiple bond still points to one neighbor

Show a selected carbon in `CH2=CH2`.

Highlight the other carbon as one neighboring atom.

Prompt:

**Does the double bond connect the selected carbon to one neighboring carbon or two neighboring carbons?**

Correct: **one neighboring carbon**

Do not name `sp2` yet.

If missed:
- collapse the two drawn bond strokes into one arrow labeled `toward the same neighbor`,
- then show a fresh `C=O` example and ask whether the oxygen is one neighboring atom or two.

This prerequisite is essential. Do not continue while the learner still counts line strokes instead of directions.

---

# 5. BUILD THE CORE IDEA BEFORE THE LABELS

## STEP 1 - What counts as one electron-group direction here?

### Visual

Place one selected carbon at the center of a compass-like workspace.

Show three separate cases one at a time:

A. `C-C`
B. `C=C`
C. `C≡C`

For each case, draw one broad arrow from the selected carbon toward the neighboring carbon.

### Dr. Merissa

> "For this carbon-hybridization lesson, an electron-group direction is one direction from the selected carbon toward one bonded neighboring atom. A single bond, double bond, and triple bond contain different bond orders, but if they connect to the same neighbor, they still occupy one direction around the selected carbon."

### Interaction

Prompt:

**A selected carbon is double-bonded to oxygen. For direction counting, how many directions does that oxygen occupy around the carbon?**

Correct: **one**

Then:

**A selected carbon is triple-bonded to another carbon. How many directions does that neighboring carbon occupy?**

Correct: **one**

---

## STEP 2 - Why direction count predicts shape

### Visual

Use the same central carbon token and allow bonded-neighbor markers to spread apart.

State A:
- four neighbor directions spread in 3D,
- label `4 directions` only.

State B:
- three neighbor directions spread in one plane,
- label `3 directions` only.

State C:
- two neighbor directions point opposite one another,
- label `2 directions` only.

### Dr. Merissa

> "Bonding directions around a carbon spread out from one another. Four directions form a tetrahedral arrangement. Three directions form a trigonal-planar arrangement. Two directions form a linear arrangement."

Introduce approximate angles only after the visual:
- tetrahedral: about `109.5°`,
- trigonal planar: about `120°`,
- linear: `180°`.

### Prediction

Prompt:

**If a selected carbon has only two bonding directions, should those directions form a bent 60-degree corner or spread opposite one another?**

Correct: **spread opposite one another**

---

## STEP 3 - Add the hybridization labels after the geometry has meaning

Reveal one row at a time:

| Electron-group directions | Geometry | Carbon hybridization |
| --- | --- | --- |
| 4 | tetrahedral | `sp3` |
| 3 | trigonal planar | `sp2` |
| 2 | linear | `sp` |

### Dr. Merissa

> "Now the labels have something to attach to. Four directions around carbon correspond to `sp3`. Three correspond to `sp2`. Two correspond to `sp`. The number in the hybridization name is not telling you how many total bonds you see on the page. It is a label tied to the local arrangement."

### Interaction

Prompt:

**Which chain of reasoning is valid?**

A. `three drawn bond lines -> sp3`

B. `three electron-group directions -> trigonal planar -> sp2`

Correct: **B**

---

# 6. TEACHING SEQUENCE - I DO

## WATCH STEP 1 - Four directions: methane carbon -> sp3

### Visual

Show methane with the carbon selected.

Reveal its four C-H directions one at a time.

Counter:
- H1 -> group 1
- H2 -> group 2
- H3 -> group 3
- H4 -> group 4

Morph the flat drawing into a tetrahedral 3D model.

### Dr. Merissa

> "This carbon has four neighboring atoms, each in its own direction. Four directions give tetrahedral geometry. A tetrahedral carbon in this lesson is `sp3`."

On-screen chain:

`4 directions -> tetrahedral -> sp3`

### Low-risk prediction

Prompt:

**If I rotate the methane model on the screen, did the carbon's hybridization change?**

Correct: **No**

Dr. Merissa:

> "Screen orientation can change. The local bonding geometry did not."

---

## WATCH STEP 2 - Three directions: ethene carbon -> sp2

### Visual

Show ethene `CH2=CH2`.

Select the left carbon only.

Identify its bonded neighbors:
- H
- H
- the other carbon

Do not count the two strokes of `C=C` separately.

### Dr. Merissa

> "The selected carbon is double-bonded to one carbon and single-bonded to two hydrogens. That is three neighboring atoms in three directions. The double bond has two bond lines, but both point toward the same neighboring carbon."

Counter:
`H = 1`, `H = 2`, `C through C=C = 3`

Morph to a trigonal-planar display.

Dr. Merissa:

> "Three directions give trigonal-planar geometry, so this carbon is `sp2`."

On-screen chain:

`3 directions -> trigonal planar -> sp2`

### Prediction

Prompt:

**If you counted the double bond as two separate directions, would you overcount this carbon?**

Correct: **Yes**

---

## WATCH STEP 3 - Two directions: ethyne carbon -> sp

### Visual

Show ethyne `HC≡CH`.

Select the left carbon.

Highlight:
- H as one neighboring atom,
- the other carbon as one neighboring atom through the triple bond.

Counter:
`H = 1`, `C through C≡C = 2`

Then stretch the two direction arrows into a straight line.

### Dr. Merissa

> "The triple bond has three bond lines, but it still connects this carbon to one neighboring carbon. Together with the hydrogen, the selected carbon has two directions. Two directions give linear geometry, so the carbon is `sp`."

On-screen chain:

`2 directions -> linear -> sp`

### Interaction

Prompt:

**Why is this carbon not `sp3` even though a triple bond is drawn with three lines?**

Supported target:
- because hybridization uses electron-group directions / neighboring atoms, not raw line count,
- the triple bond points toward one neighboring carbon.

---

## WATCH STEP 4 - Carbonyl carbon: same counting method, different-looking bond

### Worked molecule

Use **acetone (propanone)**: `CH3-C(=O)-CH3`.

Select only the carbonyl carbon.

### Visual

Highlight its three neighbors:
- left carbon,
- oxygen through `C=O`,
- right carbon.

Collapse the two C=O strokes into one directional wedge toward O.

### Dr. Merissa

> "A carbonyl carbon can look different from an alkene carbon, but the local counting rule is the same. This carbon points toward three neighboring atoms: carbon, oxygen, carbon. The double bond to oxygen still occupies one direction."

Prompt:

**How many electron-group directions surround the carbonyl carbon?**

Correct: **3**

Then reveal:

`3 directions -> trigonal planar -> sp2`

### Guardrail

Dr. Merissa:

> "You may eventually recognize carbonyl carbon as a common `sp2` pattern. But the reason is still three local directions, not 'because carbonyl means sp2' as an unexplained fact."

---

## WATCH STEP 5 - Different carbons in the same molecule can differ

### Worked molecule

Use **propene**: `CH3-CH=CH2`.

Label the carbons C1-C2-C3 from left to right.

### Visual

Analyze one at a time.

#### C1
Neighbors/directions:
- C2
- H
- H
- H

Result:
`4 -> tetrahedral -> sp3`

#### C2
Neighbors/directions:
- C1
- C3 through double bond
- H

Result:
`3 -> trigonal planar -> sp2`

#### C3
Neighbors/directions:
- C2 through double bond
- H
- H

Result:
`3 -> trigonal planar -> sp2`

### Dr. Merissa

> "The molecule does not get one hybridization label. Each carbon gets its own label from its own local geometry. In propene, one carbon is `sp3` while the two alkene carbons are `sp2`."

### Interaction

Prompt:

**If C2 is `sp2`, does that force C1 to be `sp2` too?**

Correct: **No**

---

## WATCH STEP 6 - Bond-line drawings can hide a group without removing it

### Visual

Show a branch carbon in a generic bond-line skeleton with three explicit C-C single bonds and no written H.

Highlight the three carbon neighbors.

Then infer the remaining H from carbon's ordinary valence in the shown neutral structure.

### Dr. Merissa

> "Bond-line drawings often hide carbon hydrogens. If this neutral carbon has three single bonds to carbon, one hydrogen is implied. That hydrogen still occupies a fourth direction even though the letter H is not written."

Prompt:

**How many local directions does this branch carbon have?**

Correct: **4**

Then:
`4 -> tetrahedral -> sp3`

---

# 7. QUICK CONCEPT CHECK BEFORE BUILD TOGETHER

Supported instruction only.

1. **A double bond to one atom counts as two electron-group directions.** False.
2. **Four directions around carbon correspond to tetrahedral geometry.** True.
3. **Three directions correspond to trigonal-planar geometry.** True.
4. **Two directions correspond to linear geometry.** True.
5. **A carbonyl carbon in the ordinary structures shown has three local directions.** True.
6. **Every carbon in one molecule must have the same hybridization.** False.
7. **An implied H on carbon still counts as a bonded-neighbor direction.** True.
8. **Rotating the drawing on the page changes hybridization.** False.

Any error returns only to the relationship that failed.

---

# 8. BUILD TOGETHER - WE DO

## Fresh supported molecule

Use **2-butanone**: `CH3-C(=O)-CH2-CH3`.

Number carbons C1-C4 from left to right.

The learner will classify C2 and C3 from blank rather than receive completed labels.

### Build step 1 - choose C2 only

Prompt:

**Ignore the rest of the molecule for a moment. Which atoms are directly bonded to C2?**

Correct:
- C1,
- O,
- C3.

Do not count oxygen twice because of the double bond.

### Build step 2 - count directions at C2

Learner places one direction marker toward each neighboring atom.

Correct count: **3**

### Build step 3 - geometry then label

Prompt:

**Three directions give which geometry?**

Correct: **trigonal planar**

Prompt:

**Therefore C2 is...?**

Correct: **sp2**

### Build step 4 - clear the workspace and choose C3

Do not carry C2's label automatically.

C3 is `CH2` between C2 and C4.

Learner identifies:
- C2,
- C4,
- H,
- H.

Correct count: **4**

Result:
`4 -> tetrahedral -> sp3`

### Build Together explanation

Learner completes:

> "C2 is ___ because it has ___ electron-group directions and therefore ___ geometry. C3 is ___ because it has ___ directions and therefore ___ geometry."

Supported target:
- C2: `sp2`, 3, trigonal planar,
- C3: `sp3`, 4, tetrahedral.

Build Together never counts as independent evidence.

---

# 9. GUIDED PRACTICE - YOU DO WITH SUPPORT

Use four different guided systems. Hints are available but not forced.

## Guided A - branch carbon without visible H

Molecule: **2-methylbutane**.

Select C2, the branch carbon.

Prompt:

**Count C2's local directions, including any implied H, then assign geometry and hybridization.**

Correct:
- four directions,
- tetrahedral,
- `sp3`.

If learner counts only three:
- reveal an `implied H?` check,
- do not reveal the hybridization label.

---

## Guided B - alkene carbon

Molecule: **2-pentene**.

Select C2, one alkene carbon.

Prompt:

**How many directions surround C2? Remember that the C=C points toward one neighboring carbon.**

Correct:
- three directions,
- trigonal planar,
- `sp2`.

Hint if requested:
`Count neighboring atoms, not line strokes.`

---

## Guided C - terminal alkyne carbon

Molecule: **1-pentyne**.

Select C1, the terminal alkyne carbon.

Prompt:

**How many local directions surround C1, and what does that make its geometry and hybridization?**

Correct:
- H direction + C2 direction = 2,
- linear,
- `sp`.

---

## Guided D - same molecule, two carbon types in a ring

Molecule: **cyclopentene**.

Select:
- one carbon that participates in the C=C,
- one saturated ring carbon away from the C=C.

Prompt:

**Do these two carbons have to share a hybridization because they are in the same ring? Analyze each locally.**

Correct:
- alkene carbon: 3 directions -> trigonal planar -> `sp2`,
- saturated ring carbon: 4 directions -> tetrahedral local carbon geometry -> `sp3`.

Do not turn this into a ring-strain lesson.

---

## Guided support fading

After two consecutive correct local analyses without corrective reveal:

1. remove the numbered direction markers,
2. keep only the selected-carbon highlight,
3. remove the `count neighboring atoms` reminder,
4. remove the geometry dropdown labels and require learner entry/selection from memory,
5. reduce the prompt to: `Analyze the selected carbon: count -> geometry -> hybridization`,
6. hints become learner-requested only,
7. the current Guided task remains supported even after fading,
8. any error restores only the minimum scaffold needed for the failed step and resets the two-success streak.

Do not jump from Guided success directly to mastery.

---

# 10. MISCONCEPTION CONTRASTS

## M1 - "A double bond counts as two electron groups"

### Representation switch

Show selected carbon double-bonded to one carbon.

Layer 1: two thin bond strokes.
Layer 2: one broad direction arrow pointing to the same neighboring atom.

Dr. Merissa:

> "Bond order and direction count are different questions. The double bond contains more bonding than a single bond, but both bond components point toward the same neighboring atom. For this geometry count, that is one direction."

Repair: fresh carbonyl carbon with learner counting O as one direction.

---

## M2 - "Count every line coming out of carbon"

### Representation switch

Use three mini-panels with the same selected-carbon-to-neighbor direction drawn as single, double, and triple bond.

Under each, show:
`1 neighbor -> 1 direction`.

Then contrast with three separate single bonds to three different neighboring atoms:
`3 neighbors -> 3 directions`.

Repair: learner sorts `bond-order marks` versus `neighbor directions`.

---

## M3 - "sp3 means three bonds"

### Representation switch

Show methane's four directions beside the label `sp3`.

Cross out:
`the 3 means three bonds`.

Dr. Merissa:

> "The superscript in the name is not a bond counter. In this lesson, earn the label from the geometry: four directions -> tetrahedral -> sp3."

Repair: fresh tetrahedral branch carbon.

---

## M4 - "Every carbon in the molecule has the same hybridization"

### Representation switch

Use a generic chain containing one C=C.

Gray out all carbons except one at a time.

For each selected carbon, restart the count at zero.

Dr. Merissa:

> "Hybridization belongs to a specific atom, not to the whole molecule. Restart the analysis when the selected carbon changes."

Repair: classify one saturated carbon and one alkene carbon in the same fresh structure.

---

## M5 - "A flat drawing means sp2"

### Representation switch

Show a saturated carbon drawn on flat paper, then rotate a 3D tetrahedral model out of the page.

Dr. Merissa:

> "Paper is flat. Molecules are not required to be. A 2D zigzag drawing can represent an `sp3` tetrahedral carbon. Decide from local bonding directions, not from whether the ink looks flat."

Repair: selected carbon in a straight-looking bond-line chain with four local groups.

---

## M6 - "Carbonyl carbon is sp3 because it has four bond-order units"

### Representation switch

For a carbonyl carbon, show two counters side by side:

- bond-order units: double O + two singles = 4,
- electron-group directions: O + C + C = 3.

Dr. Merissa:

> "Carbon valence and geometry count are not the same counter. The carbonyl carbon can satisfy its bonding while still having only three neighbor directions. Three directions make it `sp2`."

Repair: fresh ketone carbonyl carbon with direction count only.

---

## M7 - "Triple bond means three directions, so sp3"

### Representation switch

Look straight along the axis from one alkyne carbon to the other.

Bundle all three bond components into one axis toward the same neighboring carbon.

Show the second axis toward the other neighbor.

Dr. Merissa:

> "The triple bond is concentrated along the connection to one neighboring carbon. Together with the other neighbor, the selected alkyne carbon has two directions, so it is linear and `sp`."

Repair: a different alkyne carbon.

---

## M8 - "If H is not drawn, it does not count"

### Representation switch

Toggle a branch carbon between:
- bond-line form with H hidden,
- expanded form with the H visible.

Keep the selected carbon fixed.

Dr. Merissa:

> "The representation changed; the molecule did not. An implied hydrogen still occupies a bonding direction."

Repair: fresh branch carbon where one H must be inferred.

---

## M9 - "Rotating/redrawing the molecule changes hybridization"

### Representation switch

Show the same alkene redrawn horizontally, diagonally, then mirrored on the page without changing connectivity.

Dr. Merissa:

> "Page rotation and redraw style do not change which atoms are bonded to the selected carbon. If the local directions and bonding pattern are unchanged, the hybridization is unchanged."

Repair: identify the same selected carbon across two redraws.

---

## M10 - "Memorize double = sp2 and stop thinking"

### Representation switch

Place side by side:
- alkene carbon,
- carbonyl carbon.

Both are `sp2`, but the neighboring atoms differ.

Then show a saturated carbon with no double bond and ask why it is `sp3`.

Dr. Merissa:

> "Pattern recognition can become a speed tool after you understand it. The foundation is still local direction count. That method works across different-looking structures."

Repair: explain both alkene and carbonyl examples from group count.

---

# 11. SIX-WAY "I DON'T KNOW" CONTENT ROUTING

The shared router remains authoritative.

## IDK 1 - "I don't understand what the question means"

Response:

> "The question is asking about one selected carbon. First ignore the label choices. We only need to find which atoms are directly bonded to that carbon."

Switch to a neighbor-highlighting task, then return to a fresh item.

---

## IDK 2 - "I understand it, I don't know how to start"

Response:

> "Start by circling the selected carbon. Then point once toward each bonded neighboring atom. Do not count bond lines yet."

Model only that start step on a different structure, then return to a fresh item.

---

## IDK 3 - "I forgot something I need"

Offer only targeted micro-reviews:
- single/double/triple notation,
- implied carbon hydrogen,
- one neighbor versus one bond stroke,
- tetrahedral/trigonal-planar/linear geometry,
- 4/3/2 -> `sp3`/`sp2`/`sp` mapping.

Repair only the selected dependency.

---

## IDK 4 - "I started but got stuck"

Preserve work and ask where:
- finding direct neighbors,
- deciding whether a hidden H exists,
- counting a multiple bond,
- mapping count to geometry,
- mapping geometry to hybridization,
- switching to a second carbon in the same molecule.

Repair only that step.

---

## IDK 5 - "I need to see an example"

Use a support-only molecule not reserved for cold evidence.

Show one selected carbon from start to finish:
`neighbors -> directions -> geometry -> hybridization`.

Then remove that example and return to a different fresh item.

---

## IDK 6 - "This explanation isn't making sense"

Switch to **Direction-Compass Mode**:

1. place the selected carbon as a dot in the center,
2. temporarily replace each bonded neighboring atom with one large arrow from the center,
3. if a double/triple bond exists, visibly merge its multiple strokes into one arrow toward the same neighbor,
4. hide the molecular formula and show only the resulting 4, 3, or 2 arrows,
5. let the arrows spread into tetrahedral, trigonal-planar, or linear geometry,
6. only then reattach the original atoms and bond orders,
7. reveal the hybridization label after the geometry is identified.

If still unclear, use a room-doorway analogy only as a bridge:

> "Imagine standing in the center of a room. We care how many different directions lead to different neighbors, not how many stripes are painted along one hallway. A double or triple bond may have more bonding, but it still goes to one neighbor in one direction."

Immediately map back to the selected carbon.

Any IDK support contaminates the current item. Independent evidence must be recollected on a fresh item.

---

# 12. INDEPENDENT PRACTICE - COLD EVIDENCE BANK

Cold evidence gets:
- no numbered direction markers,
- no automatic neighbor highlighting,
- no tetrahedral/trigonal/linear ghost geometry,
- no 4/3/2 mapping card,
- no implied-H reveal,
- no hint that a multiple bond counts once,
- no completed hybridization labels,
- no hints.

If help is requested, the current item converts to supported practice and cannot count as clean independent evidence.

## Cold reservation list

The exact molecules/structures below are cold-reserved for U1-05 and must not be inserted into Teach, Watch, Build Together, Guided, misconception worked examples, or IDK worked examples before the learner encounters them cold:

- 3-methylpentane,
- 1-hexene,
- 2-hexyne,
- 2-methyl-3-pentanone,
- 3-methyl-1-butyne,
- 2-methylpropene,
- cyclohexane/cyclohexene comparison used in HYB-I7,
- `CH2=CH-C≡C-CH2-CH3` used in HYB-I8.

A generic structure may share a category, but not the exact molecule-plus-selected-carbon task.

---

## HYB-I1 - Branch carbon with an implied H

Use **3-methylpentane**.

Select C3, the branch carbon.

Prompt:

**What is the hybridization of C3? Explain your electron-group count and geometry.**

### Scoring contract

Required propositions:
1. C3 is directly bonded to C2, C4, the methyl substituent carbon, and one implied H,
2. those are four electron-group directions,
3. four directions correspond to tetrahedral geometry,
4. C3 is `sp3`,
5. the hidden H must not be omitted simply because bond-line notation does not write it.

Accept example:
> "C3 is sp3. It has four directions: three C-C bonds and one implied C-H bond, so its geometry is tetrahedral."

Wrong-but-keyword-complete example that must fail:
> "C3 is sp2 because only three carbon bonds are drawn, so it has three directions and trigonal-planar geometry."

Why it fails: it treats an omitted carbon hydrogen as absent and undercounts the local groups.

---

## HYB-I2 - Alkene carbon without counting the double bond twice

Use **1-hexene**.

Select C1, the terminal alkene carbon.

Prompt:

**What is C1's hybridization, and why does the C=C not count as two electron-group directions?**

### Scoring contract

Required propositions:
1. C1 is bonded to C2 through a double bond and to two H atoms,
2. C2 is one neighboring atom and therefore one direction despite the double bond,
3. total direction count is three,
4. three directions -> trigonal planar -> `sp2`.

Accept example:
> "C1 is sp2. The double bond goes to one carbon, so that is one direction, and the two C-H directions make three total. Three directions are trigonal planar."

Wrong-but-keyword-complete example that must fail:
> "C1 is sp3 because the double bond gives two directions plus two C-H directions, making four tetrahedral groups."

Why it fails: it converts bond order into extra neighbor directions.

Contradiction rule:
A response that says `the double bond counts once` and later totals four directions does not pass until the contradiction is resolved on a fresh prompt.

---

## HYB-I3 - Alkyne carbon

Use **2-hexyne**.

Select C2.

Prompt:

**Determine C2's hybridization from its local directions.**

### Scoring contract

Required propositions:
1. C2 is bonded to C1 in one direction and C3 through the triple bond in one direction,
2. the triple bond to C3 still occupies one electron-group direction,
3. total count is two,
4. two directions -> linear -> `sp`.

Accept example:
> "C2 has two directions, one toward C1 and one toward C3 through the triple bond. Two directions are linear, so C2 is sp."

Wrong-but-keyword-complete example that must fail:
> "C2 is sp3 because the triple bond counts as three directions and the single bond adds a fourth, giving tetrahedral geometry."

Why it fails: it counts three bond strokes as three neighboring directions.

---

## HYB-I4 - Carbonyl carbon

Use **2-methyl-3-pentanone**: `CH3-CH(CH3)-C(=O)-CH2-CH3`.

Select the carbonyl carbon C3.

Prompt:

**What is the hybridization of the carbonyl carbon? Give the local group count and geometry.**

### Scoring contract

Required propositions:
1. C3 is directly bonded toward O, C2, and C4,
2. the C=O counts as one direction toward oxygen,
3. total count is three,
4. geometry is trigonal planar,
5. hybridization is `sp2`.

Accept example:
> "The carbonyl carbon is sp2 because it has three directions: O, C2, and C4. The double bond to O is still one direction, so the carbon is trigonal planar."

Wrong-but-keyword-complete example that must fail:
> "The carbonyl carbon is sp3 because C=O contributes two groups and the two C-C bonds add two more, making four tetrahedral groups."

Why it fails: it confuses bond-order count with electron-group direction count.

---

## HYB-I5 - Two different hybridizations in one molecule

Use **3-methyl-1-butyne**: `HC≡C-CH(CH3)-CH3`.

Select C2 and C3.

Prompt:

**Assign C2 and C3 separately. Explain why they do not share the same hybridization even though they are bonded to each other.**

### Scoring contract

Required propositions:
1. C2 has two local directions: toward C1 through the triple bond and toward C3,
2. C2 is linear and `sp`,
3. C3 is bonded toward C2, C4, the methyl substituent carbon, and one H,
4. C3 has four directions, tetrahedral, `sp3`,
5. hybridization is local to each selected carbon.

Accept example:
> "C2 is sp because it has two directions and is linear. C3 is sp3 because it has four directions, including its H, so it is tetrahedral. Each carbon is counted separately."

Wrong-but-keyword-complete example that must fail:
> "C2 and C3 are both sp because the triple bond makes the whole molecule linear around both carbons."

Why it fails: it spreads one carbon's local geometry onto a neighboring carbon with a different local environment.

Second failure mode:
> "C2 is sp3 because the triple bond has three lines, while C3 is sp because it is next to the alkyne."

Why it fails: it reverses both local assignments and uses adjacency instead of local group count.

---

## HYB-I6 - Same carbon, redrawn molecule

Use **2-methylpropene**: `CH2=C(CH3)2`.

Show two chemically identical redraws with the same central alkene carbon selected.

One redraw is horizontal; the second is rotated and branches are placed on different sides of the page without changing connectivity.

Prompt:

**Did the selected carbon's hybridization change between drawings? State the hybridization and the reason.**

### Scoring contract

Required propositions:
1. both drawings preserve the selected carbon's same three neighboring atoms/directions,
2. the C=C still points to one neighboring carbon,
3. three directions -> trigonal planar -> `sp2`,
4. rotating/redrawing the page does not change hybridization.

Accept example:
> "No. The selected carbon is sp2 in both drawings because it still has three bonding directions. The page layout changed, not the local connectivity or geometry."

Wrong-but-keyword-complete example that must fail:
> "The first is sp2 but the rotated drawing is sp3 because the branches point in four visible directions on the page."

Why it fails: it treats drawing orientation as molecular electron-group geometry.

---

## HYB-I7 - Ring context: saturated versus alkene carbon

Show two held-out structures side by side:
- **cyclohexane** with one ring carbon selected,
- **cyclohexene** with one alkene carbon selected.

Prompt:

**Assign the selected carbon in each ring and explain the difference from local bonding, not from ring size.**

### Scoring contract

Required propositions:
1. selected cyclohexane carbon has two C-C single-bond directions plus two C-H directions = four groups,
2. cyclohexane selected carbon is tetrahedral locally and `sp3`,
3. selected cyclohexene alkene carbon has three directions: one toward its alkene partner, one toward the adjacent saturated ring carbon, and one H,
4. cyclohexene selected alkene carbon is trigonal planar locally and `sp2`,
5. ring size is not the deciding cause.

Accept example:
> "The cyclohexane carbon is sp3 because it has four local directions. The alkene carbon in cyclohexene has three directions because the double bond still points to one neighbor, so it is sp2."

Wrong-but-keyword-complete example that must fail:
> "Both are sp3 because both are in six-membered rings, and ring carbons must all be tetrahedral."

Why it fails: it uses ring membership as a global shortcut and ignores the alkene carbon's three-direction local geometry.

---

## HYB-I8 - Test-style mixed structure

Use the exact held-out structure:

`CH2=CH-C≡C-CH2-CH3`

Number from left to right C1-C6.

Select C1, C3, and C5.

No naming of the molecule is required.

Prompt:

**Assign the hybridization of C1, C3, and C5. For each carbon, give the electron-group count and geometry that justify the label.**

### Scoring contract

A clean success requires:
1. C1 has three directions -> trigonal planar -> `sp2`,
2. C3 has two directions -> linear -> `sp`,
3. C5 has four directions -> tetrahedral -> `sp3`,
4. double/triple bonds may not be counted as multiple directions to the same neighboring atom,
5. each selected carbon must be analyzed locally,
6. all three objective labels and their explanations must agree.

Accept example:
> "C1 is sp2 because it has three directions and is trigonal planar. C3 is sp because it has two directions and is linear. C5 is sp3 because it has four directions and is tetrahedral."

Wrong-but-keyword-complete example that must fail:
> "C1 is sp3 because the double bond counts twice, C3 is sp3 because the triple bond counts three times, and C5 is sp2 because only two C-C lines are visible."

Why it fails: it systematically counts bond strokes instead of local neighboring directions and also ignores implied hydrogens on C5.

Second failure mode:
> "The molecule contains a double and triple bond, so every carbon is sp2 or sp; C5 becomes sp because it is connected to an sp carbon."

Why it fails: it assigns hybridization globally/by adjacency instead of from each carbon's local geometry.

Contradiction rule:
A response with correct labels but explanations that reverse the group counts does not create clean explanation evidence.

---

# 13. INDEPENDENT EVIDENCE RULE

Independent evidence requires a cold fresh item completed without support.

Do not display `Mastered` after one correct hybridization label.

Shared mastery eventually requires:

1. one cold local classification at scaffold 0,
2. one role-preserving explanation that includes group count and geometry,
3. a second different cold item after a meaningful interval.

Recommended breadth before mixed Test 1 practice:
- one `sp3` carbon with an implied H,
- one multiple-bond case proving the bond counts as one direction,
- one mixed molecule with different hybridizations,
- later retrieval.

Objective correctness and explanation correctness are separate.

Examples:
- correct `sp2` label + explanation `four groups, tetrahedral` does **not** earn explanation evidence,
- correct group count + wrong hybridization label is not a clean independent success,
- support contaminates the current item,
- after repair, recollect evidence on a fresh prompt.

---

# 14. EXPLAIN-WHY PROMPTS - ROLE-PRESERVING SCORING

## E-W1 - Why does a double bond count as one direction?

Required propositions:
1. the double bond connects the selected carbon to one neighboring atom,
2. both bond components point along the connection to that same neighbor,
3. electron-group geometry counts the neighbor direction once.

Accept:
> "A double bond has more than one bond component, but both connect to the same neighboring atom, so it occupies one direction for the geometry count."

Wrong-but-keyword-complete failure:
> "A double bond counts as two electron-group directions because there are two lines to the same neighbor."

Why it fails: it substitutes drawn bond strokes for neighbor directions.

---

## E-W2 - Why is an ordinary carbonyl carbon sp2?

Required propositions:
1. carbonyl carbon points toward oxygen and two other bonded neighbors in the ketone-style examples used here,
2. C=O counts as one direction toward O,
3. total is three directions,
4. three -> trigonal planar -> `sp2`.

Accept:
> "The carbonyl carbon has three local directions. The double bond to oxygen is one of those directions, so the geometry is trigonal planar and the carbon is sp2."

Wrong-but-keyword-complete failure:
> "The carbonyl carbon is sp2 because it has four electron groups and tetrahedral geometry."

Why it fails: the label happens to be correct while the causal geometry is reversed.

---

## E-W3 - Why is an alkyne carbon sp rather than sp3?

Required propositions:
1. triple bond to one neighboring carbon occupies one direction,
2. the other bonded neighbor occupies the second direction,
3. two directions are linear,
4. linear carbon is `sp` in this lesson.

Accept:
> "The triple bond still goes to one neighboring carbon. With the second neighbor there are only two directions, which are linear, so the carbon is sp."

Wrong-but-keyword-complete failure:
> "The alkyne carbon is sp because a triple bond creates four tetrahedral directions."

Why it fails: it gives the correct label with a chemically incompatible group count and geometry.

---

## E-W4 - Why can two carbons in one molecule have different labels?

Required propositions:
1. hybridization is assigned atom by atom,
2. each selected carbon can have a different number of local directions,
3. the labels follow each carbon's own geometry.

Accept:
> "Hybridization is local. One carbon can have four directions and be sp3 while a neighboring alkene carbon has three directions and is sp2."

Wrong-but-keyword-complete failure:
> "A molecule gets one hybridization, so once one carbon is sp2 every connected carbon becomes sp2."

Why it fails: it treats an atom-level property as a whole-molecule label.

---

## E-W5 - Why does a hidden H matter?

Required propositions:
1. bond-line notation may omit hydrogens attached to carbon,
2. omitted from drawing does not mean absent from molecule,
3. an implied bonded H still contributes a local direction.

Accept:
> "The H may be hidden by bond-line notation, but it is still bonded to carbon and still counts as one direction."

Wrong-but-keyword-complete failure:
> "Hidden hydrogens never affect hybridization because only visible bonds count."

Why it fails: it confuses representation with molecular structure.

---

# 15. TRANSFER TASKS

## Transfer HYB-T1 - Diagnose a student's line-count error

Show a student answer for an alkene carbon:

`The carbon is sp3 because the C=C gives two groups and two C-H bonds give two more.`

Prompt:

**What exactly was counted incorrectly? Repair only that step.**

Required:
- C=C points to one neighboring carbon and counts as one electron-group direction,
- total becomes 3, not 4,
- therefore trigonal planar/sp2.

---

## Transfer HYB-T2 - Convert between representation styles

Show the same saturated branch carbon first in bond-line form and then in expanded formula form.

Prompt:

**Why should both drawings give the same hybridization?**

Required:
- same connectivity/local neighbors,
- hidden H in bond-line becomes visible in expanded form,
- same four directions -> sp3.

---

## Transfer HYB-T3 - Geometry-first reverse question

Show a carbon model with three directions at about 120° but hide all bond orders.

Prompt:

**What hybridization label fits this local geometry, and what direction count tells you?**

Required:
- three directions,
- trigonal planar,
- sp2.

This prevents dependence on seeing a double-bond symbol first.

---

## Transfer HYB-T4 - Mixed local labels without molecule naming

Show an unfamiliar structure with one C=C region and one saturated branch carbon.

Ask learner to label only the highlighted carbons.

Required:
- analyze each locally,
- no naming requirement,
- no whole-molecule shortcut.

---

# 16. LATER RETRIEVAL

After at least one different lesson or meaningful activity, present a fresh selected-carbon set.

Ask:
1. how many local electron-group directions,
2. what geometry,
3. what hybridization,
4. one short reason a multiple bond was or was not counted once.

Do not reopen the full lesson after clean retrieval.

A later clean item plus explanation can satisfy the second-cold-item mastery component.

---

# 17. ADAPTIVE TEST-OUT PATH

Before full teaching, use three cold probes:

1. a saturated branch carbon with one implied H,
2. an ordinary alkene or carbonyl carbon where the double bond must count as one direction,
3. an alkyne carbon or mixed structure requiring a different label on neighboring carbons.

### 3/3 clean

Skip full teaching. Give later confirmation plus any missing explanation evidence.

### 2/3

Teach only the first failed dependency:
- implied H,
- multiple bond direction count,
- geometry mapping,
- local-vs-global atom analysis.

Then verify on a fresh item.

### 0-1/3

Run the full beginner lesson.

Any direction arrows, geometry ghosts, 4/3/2 mapping cards, implied-H reveals, or label hints contaminate the test-out item.

---

# 18. ACCESSIBILITY + PHONE/IPAD REQUIREMENTS

1. Selected carbon must be identified by more than color: use a ring outline, atom number, and accessible text label.
2. Multiple-bond compression into one direction must have a text equivalent: `double bond to one neighboring atom = one electron-group direction`.
3. Tetrahedral/trigonal-planar/linear geometry cannot depend on animation alone; provide discrete static states.
4. Reduced-motion users must be able to move through `flat drawing -> direction arrows -> geometry` one step at a time.
5. Implied hydrogens must be available as an accessible text description when the visual toggles them.
6. Screen readers must announce selected carbon, bonded neighbors, direction count only after the learner requests/reveals support; cold items may not auto-announce answer-bearing counts.
7. Portrait mode stacks molecule above analysis workspace.
8. Landscape may show molecule and direction-compass side by side.
9. No ordinary task may require horizontal scrolling.
10. Tap targets around carbon vertices must be larger than the visible atom/bond marks.
11. Learner can replay only the multiple-bond compression or geometry morph step.
12. Voice narration is optional; all chemistry reasoning remains visible in text.
13. Return destination to Test 1 support must be preserved.

---

# 19. CHEMISTRY TOOLBOX RULES

During Teach/Watch/Build Together/Guided, after the concept is established, the toolbox may show:

- `4 directions -> tetrahedral -> sp3`,
- `3 directions -> trigonal planar -> sp2`,
- `2 directions -> linear -> sp`,
- `single/double/triple bond to the same neighbor = one direction`,
- bond-line implied-H reminder.

Do not expose a completed analysis for the current target carbon.

During cold evidence these supports are hidden unless the assessment explicitly allows them.

Opening a disallowed support during cold evidence converts the item to supported practice.

---

# 20. IMPLEMENTATION EVENT CONTRACT

Suggested events:
- `HYBRIDIZATION_PREREQ_PASS`
- `HYBRIDIZATION_PREREQ_REPAIR`
- `HYBRIDIZATION_CARBON_SELECTED`
- `HYBRIDIZATION_NEIGHBOR_COUNT_RESULT`
- `HYBRIDIZATION_IMPLIED_H_RESULT`
- `HYBRIDIZATION_GEOMETRY_RESULT`
- `HYBRIDIZATION_LABEL_RESULT`
- `HYBRIDIZATION_BUILD_TOGETHER_SUCCESS`
- `HYBRIDIZATION_GUIDED_SUCCESS`
- `HYBRIDIZATION_MISCONCEPTION` with code
- `HYBRIDIZATION_REPRESENTATION_SWITCH`
- `HYBRIDIZATION_INDEPENDENT_ATTEMPT`
- `HYBRIDIZATION_INDEPENDENT_SUCCESS`
- `HYBRIDIZATION_EXPLAIN_WHY_RESULT`
- `HYBRIDIZATION_TRANSFER_RESULT`
- `HYBRIDIZATION_RETRIEVAL_RESULT`

Suggested misconception codes:
- `MULTIPLE_BOND_COUNTED_MULTIPLE_DIRECTIONS`
- `LINE_COUNT_AS_GROUP_COUNT`
- `SP3_MEANS_THREE_BONDS`
- `WHOLE_MOLECULE_ONE_HYBRIDIZATION`
- `PAGE_FLATNESS_AS_SP2`
- `CARBONYL_BOND_ORDER_AS_FOUR_GROUPS`
- `TRIPLE_BOND_AS_THREE_DIRECTIONS`
- `IMPLIED_H_IGNORED`
- `REDRAW_CHANGES_HYBRIDIZATION`
- `PATTERN_MEMORIZATION_WITHOUT_GEOMETRY`

The content layer reports outcomes. It does not declare mastery.

---

# 21. BEGINNER-CLARITY RELEASE GATE

Before implementation, an auditor must answer YES to all:

1. Does the lesson begin from local carbon geometry rather than a memorized `single/double/triple` table?
2. Is the learner required to select one carbon at a time?
3. Is an electron-group direction defined in beginner language?
4. Is a multiple bond to one neighboring atom explicitly counted as one direction?
5. Are 4 directions connected to tetrahedral geometry before `sp3` is treated as a shortcut?
6. Are 3 directions connected to trigonal-planar geometry before `sp2`?
7. Are 2 directions connected to linear geometry before `sp`?
8. Is methane used to establish the four-direction case without assuming the label?
9. Is ethene used to show why a double bond does not count twice?
10. Is ethyne used to show why a triple bond does not count three times?
11. Is a carbonyl carbon derived from the same direction-count method?
12. Does the lesson show different hybridizations inside one molecule?
13. Does bond-line implied-H reasoning remain intact?
14. Does the lesson reject page flatness as a geometry test?
15. Does it reject `sp3 means three bonds`?
16. Does Build Together start from unassigned carbons rather than completed labels?
17. Does Guided use different molecules from Watch and Build Together?
18. Is scaffold fading operationally specified?
19. Does every misconception repair change representation rather than merely reword a definition?
20. Does every IDK support path return to a fresh item?
21. Are exact cold molecules held out from supported phases?
22. Does every cold item have its own role-preserving scoring contract?
23. Can keyword-complete line-count reversals fail explicitly?
24. Can a correct hybridization label paired with wrong geometry fail explanation evidence?
25. Are objective and explanation correctness separate?
26. Does HYB-I5 test two different hybridizations in one molecule?
27. Does HYB-I6 protect against redraw/page-orientation errors?
28. Does HYB-I7 transfer into ring context without turning into a ring-strain lesson?
29. Does HYB-I8 require a mixed `sp2`/`sp`/`sp3` map from one held-out structure?
30. Does the lesson avoid unverified charged-carbon/heteroatom edge cases?
31. Does reduced-motion preserve the direction-to-geometry meaning?
32. Can the lesson operate comfortably on phone/iPad?
33. Does the lesson prepare for historical Test 1-style selected-carbon hybridization without claiming the old question will repeat?

Any NO blocks production.

---

# 22. DEFINITION OF DONE FOR U1-05

The lesson is successful when a beginner can look at a fresh structure, select one carbon, and reason:

- which atoms are directly bonded to that carbon,
- whether any H is implied,
- why a double or triple bond to one neighbor still counts as one direction,
- whether the carbon has 4, 3, or 2 electron-group directions,
- whether that means tetrahedral, trigonal planar, or linear geometry,
- whether the carbon is `sp3`, `sp2`, or `sp`,
- and why a neighboring carbon may receive a different label,

then do the same on a fresh mixed structure without the teaching screen.

The standard is not:

> "She memorized single = sp3, double = sp2, triple = sp."

The standard is:

> **"She can derive the carbon's hybridization from its own local bonding geometry and explain the count that produced it."**
