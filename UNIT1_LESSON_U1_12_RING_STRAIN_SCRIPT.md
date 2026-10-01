# UNIT 1 LESSON U1-12 - CYCLOALKANES AND RING STRAIN
## Fully authored beginner lesson script

**Status:** content draft for instructional review before runtime implementation.

**Parent curriculum:** `UNIT1_BEGINNER_TEACHING_CURRICULUM.md`

**Teaching-engine contract:** `DR_MERISSA_TEACHING_ENGINE_SPEC.md`

**Template standards:**
- `UNIT1_LESSON_U1_01_BOND_LINE_SCRIPT.md`
- `UNIT1_LESSON_U1_10_NEWMAN_PROJECTIONS_SCRIPT.md`
- `UNIT1_LESSON_U1_11_CONFORMATIONAL_ENERGY_DIAGRAMS_SCRIPT.md`
- `UNIT1_LESSON_U1_13_CYCLOHEXANE_CHAIRS_SCRIPT.md`

**Purpose of this file:** teach ring strain as a consequence of geometry and bond alignment, not as a memorized rule that "small rings are bad." The learner must distinguish angle strain from torsional strain, explain why cyclopropane is unusually high in energy, understand why nonplanar ring shapes can reduce some strain without fixing all of it, and compare common small cycloalkanes qualitatively.

Cold independent items in this file carry their own role-preserving scoring contracts from the start.

---

# 1. LESSON GOAL

A learner who begins with little or no usable ring-strain knowledge should leave able to:

1. explain that carbon in an unstrained tetrahedral environment prefers bond angles near 109.5 degrees,
2. define **angle strain** as the energetic penalty associated with forcing bond angles away from their preferred geometry,
3. define **torsional strain** as the energetic penalty associated with eclipsing or near-eclipsing bonds on adjacent atoms,
4. keep angle strain and torsional strain as separate causes,
5. explain why cyclopropane has severe angle strain,
6. explain why planar cyclopropane also has substantial torsional strain,
7. understand why cyclobutane puckers rather than remaining perfectly planar,
8. understand that cyclobutane puckering reduces torsional strain but does not remove its strong angle strain,
9. understand why cyclopentane also puckers even though its bond angles are much closer to tetrahedral,
10. understand qualitatively why chair cyclohexane has very low ring strain compared with smaller common rings,
11. reject the shortcut that ring size alone fully determines strain,
12. compare common ring structures by the actual geometric causes of strain,
13. solve a fresh ring-strain explanation problem without prompts.

This lesson is not complete because the learner can recite `cyclopropane is strained`. It is complete when she can point to the geometry that creates the strain and name the correct cause.

---

# 2. LEARNER-FACING ORIENTATION

## Screen title

**Ring strain: what happens when carbon is forced into an uncomfortable shape**

## Dr. Merissa narration

> "Closing a carbon chain into a ring can force the atoms into angles or bond alignments they would not choose in a more flexible structure. Ring strain is the extra energy that comes from those forced arrangements. We are going to look at the geometry and identify the reason instead of memorizing which ring is 'good' or 'bad.'"

## Immediate learner check

Visual: show two models using the same carbon token style:
- an open-chain carbon center with a tetrahedral 3D arrangement,
- a three-membered carbon ring drawn as a triangle.

Prompt:

**If closing the chain forces the carbon-carbon bonds into a much tighter angle, would you expect the ring to be more comfortable or more strained?**

Choices:
- More comfortable
- More strained
- I am not sure yet

Correct: **More strained**

If missed:

> "The key idea is not 'ring equals bad.' The key idea is that a ring can restrict geometry. If the ring forces carbon away from its preferred arrangement, that costs energy."

Orientation is instructional only, not mastery evidence.

---

# 3. SMALLEST PREREQUISITE GATE

Do not test all of hybridization or Newman projections again.

## Gate P1 - tetrahedral carbon geometry

Visual: one simple carbon with four single-bond directions.

Prompt:

**For a typical unstrained carbon with four single-bond directions, which approximate angle is closer to its preferred tetrahedral geometry: 60 degrees or 109.5 degrees?**

Correct: **109.5 degrees**

If missed:
- show four balloons/electron-group directions spreading apart in 3D,
- label the qualitative tetrahedral arrangement,
- ask a fresh 60 versus 109.5 item.

## Gate P2 - staggered versus eclipsed

Show one simple Newman pair from a generic C-C single bond.

Prompt:

**Which arrangement has front and back bonds lined up with one another: staggered or eclipsed?**

Correct: **eclipsed**

If missed, route only to the U1-10 staggered/eclipsed micro-repair, then return to a fresh gate item.

## Gate P3 - same molecule versus different conformation

Show one flexible four-carbon model before and after rotation about a single bond.

Prompt:

**If the connectivity stays the same and only a single bond rotates, did we create a new constitutional molecule?**

Correct: **No**

This matters because ring puckering changes conformation without changing which atoms are bonded.

Once the three ideas are usable, continue. Do not repeat passed prerequisites.

---

# 4. TEACH THE TWO SOURCES BEFORE THE RING EXAMPLES

## SOURCE STEP 1 - Angle strain

### Visual

Show a tetrahedral carbon model with one C-C-C angle labeled `about 109.5 degrees`.

Then slowly squeeze the two C-C directions toward one another.

### Dr. Merissa

> "Carbon with four single-bond directions prefers a tetrahedral arrangement. If a ring forces a carbon-carbon-carbon angle far away from that preferred geometry, the structure pays an energy penalty. Chemists call that **angle strain**."

### Interaction

Prompt:

**Which situation has more angle strain: a carbon angle near 109.5 degrees or one forced near 60 degrees?**

Correct: **near 60 degrees**

Wrong-answer repair:
If learner chooses 109.5, show the preferred tetrahedral overlay and ask which angle requires more distortion from that reference.

---

## SOURCE STEP 2 - Torsional strain

### Visual

Show a simple C-C bond in Newman view:
- staggered state,
- then rotate to eclipsed state.

Keep bond angle unchanged so only bond alignment changes.

### Dr. Merissa

> "A second source of strain does not come from the bond angle. It comes from how bonds on neighboring atoms line up. When those bonds eclipse one another, the arrangement is higher in energy. That penalty is called **torsional strain**."

### Interaction

Prompt:

**If two structures have the same bond angles but one has more eclipsing, which source of strain increased?**

Correct: **torsional strain**

### Explicit separation

Dr. Merissa:

> "Keep these two causes separate. Angle strain asks, 'Are the bond angles forced away from the preferred geometry?' Torsional strain asks, 'Are bonds on neighboring atoms eclipsing?' A ring can have one, the other, or both."

---

# 5. TEACHING SEQUENCE - I DO

## Core worked comparison

Use **cyclopropane versus propane** because this directly matches the kind of explanation required by the historical Test 1, without claiming the Fall 2026 test will repeat it.

No numerical strain energies are required.

---

## WATCH STEP 1 - Start with flexible propane

### Visual

Show propane as an open three-carbon chain. Make the central carbon's approximate tetrahedral geometry visible.

Show that the chain is not forced to close into a triangle.

### Dr. Merissa

> "Propane is flexible. Its carbon atoms are not forced into a three-membered ring, so the carbon-carbon-carbon angle can stay near the geometry an ordinary tetrahedral carbon prefers."

### Prediction

Prompt:

**Does propane have to squeeze its C-C-C angle down near 60 degrees?**

Correct: **No**

---

## WATCH STEP 2 - Close the same three-carbon idea into cyclopropane

### Visual

Bring the terminal carbon positions together until a triangle forms.

Overlay:
- preferred tetrahedral angle: about 109.5 degrees,
- ring angle: about 60 degrees.

Do not show a completed strain label yet.

### Dr. Merissa

> "A three-membered ring has to close into a triangle. That forces each carbon-carbon-carbon angle to about 60 degrees, far from the preferred tetrahedral angle near 109.5 degrees."

### Prediction before label

Prompt:

**Which strain source does this large angle distortion create?**

Correct: **angle strain**

Then reveal:

**Severe angle strain**

### Dr. Merissa

> "That is the first major reason cyclopropane is high in energy: severe angle strain."

---

## WATCH STEP 3 - Show that cyclopropane has a second problem

### Visual

Keep cyclopropane planar. Rotate the viewing camera to look down one C-C bond.

Show the C-H bonds on the two adjacent carbons lining up in an eclipsed relationship.

### Dr. Merissa

> "Now look down one carbon-carbon bond. Because the three-membered ring is planar and tightly locked, the bonds on neighboring carbons cannot simply rotate into a fully staggered arrangement. They are eclipsed."

### Interaction

Prompt:

**Which second strain source comes from these eclipsing bonds?**

Correct: **torsional strain**

Then reveal:

**Cyclopropane: angle strain + torsional strain**

### Dr. Merissa

> "Cyclopropane is not high in energy for only one reason. Its bond angles are severely compressed, and its adjacent bonds are eclipsed."

---

## WATCH STEP 4 - Reject the oversimplified answer

### Visual

Show two student explanations side by side.

A:
`Cyclopropane is strained because it is a small ring.`

B:
`Cyclopropane is strained because the ring forces C-C-C angles near 60 degrees instead of about 109.5 degrees, creating angle strain, and the planar ring also forces eclipsing interactions that create torsional strain.`

Prompt:

**Which answer explains the chemistry instead of only naming the observation?**

Correct: **B**

Dr. Merissa:

> "'Small ring' is a clue, not a cause. The cause is the geometry the small ring forces."

---

## WATCH STEP 5 - Introduce cyclobutane as a tradeoff

### Visual

Start with a hypothetical flat square cyclobutane.

Show:
- C-C-C angles near 90 degrees, still far below 109.5 degrees,
- many neighboring C-H bonds close to eclipsed if the ring were perfectly flat.

Then pucker the ring slightly out of plane.

### Dr. Merissa

> "Cyclobutane has more room than cyclopropane, but its ring angles are still much smaller than the tetrahedral preference. If it stayed perfectly flat, it would also have strong eclipsing interactions. So cyclobutane puckers out of the plane."

Vocabulary in context:

> "To **pucker** means the ring bends out of a flat plane."

### Prediction

Prompt:

**What can puckering reduce most directly here: angle strain, torsional strain, or both equally?**

Best answer: **torsional strain most directly**

### Dr. Merissa

> "Puckering reduces some eclipsing, so it relieves torsional strain. It does not magically restore ideal tetrahedral bond angles. Cyclobutane still has substantial angle strain."

Important nuance:

> "Cyclobutane's puckering is a compromise. The ring accepts a slightly imperfect geometry to reduce eclipsing. The molecule is balancing more than one source of strain at once."

---

## WATCH STEP 6 - Introduce cyclopentane: near-ideal angles do not mean zero strain

### Visual

Show a hypothetical flat five-membered ring.

Label the regular-pentagon interior angle only as a geometric reference:
`about 108 degrees`.

Overlay the tetrahedral reference:
`about 109.5 degrees`.

Then show that a flat ring would still have many eclipsing interactions.

Pucker into a simple envelope-like 3D shape.

### Dr. Merissa

> "A five-membered ring can keep its carbon angles much closer to the tetrahedral preference. That means angle strain is much smaller than in cyclopropane or cyclobutane. But a perfectly flat five-membered ring would still force unfavorable eclipsing. Cyclopentane puckers to reduce that torsional strain."

### Interaction

Prompt:

**If the bond angles are already close to tetrahedral, why does cyclopentane still pucker?**

Correct idea:
- to reduce eclipsing/torsional strain.

Do not require the learner to memorize envelope versus half-chair conformer names in this lesson unless current course materials later require them.

---

## WATCH STEP 7 - Connect to cyclohexane without teaching chairs twice

### Visual

Show a flat hexagon only briefly, then morph it into a chair-shaped cyclohexane.

Do not introduce axial/equatorial or chair flips here; those belong to U1-13.

Overlay:
- bond angles near tetrahedral,
- neighboring bonds largely staggered in the chair.

### Dr. Merissa

> "Cyclohexane can fold into a chair shape that keeps its carbon angles near tetrahedral and its neighboring bonds largely staggered. That combination makes the chair form very low in ring strain compared with the common smaller rings we just examined."

### Interaction

Prompt:

**What two problems does the chair avoid at the same time?**

Correct:
- large bond-angle distortion,
- extensive eclipsing/torsional strain.

### Scope boundary

Dr. Merissa:

> "The next lesson handles how to draw chairs and track substituents. Here, the only point we need is why the chair shape is favorable."

---

# 6. QUICK CONCEPT CHECK BEFORE BUILD TOGETHER

Supported instruction only.

1. **Angle strain and torsional strain mean the same thing.** False.
2. **Cyclopropane's approximately 60-degree ring angles create angle strain.** True.
3. **Cyclopropane also has eclipsing interactions that contribute torsional strain.** True.
4. **Cyclobutane puckers mainly to reduce eclipsing/torsional strain.** True.
5. **Cyclobutane puckering removes all angle strain.** False.
6. **Cyclopentane can have little angle strain and still have torsional strain.** True.
7. **Chair cyclohexane is favorable because it combines near-tetrahedral angles with largely staggered bonds.** True.
8. **'Larger ring means less strain' is a universal rule for every cycloalkane.** False.

Any error returns only to the relevant visual relationship.

---

# 7. BUILD TOGETHER - WE DO

## Fresh supported system

Use **cyclobutane** as the build system. The learner will construct the strain explanation rather than receive it finished.

Start with:
- four carbon nodes,
- blank ring workspace,
- tetrahedral-angle reference card,
- no strain labels.

## Build step 1 - close the ring

Learner connects the four carbons into a ring.

Prompt:

**If we sketch it as a flat square first, are the C-C-C angles close to 109.5 degrees or much smaller?**

Correct: **much smaller, around 90 degrees**

## Build step 2 - identify the first strain source

Prompt:

**What does forcing the carbon angles far below the tetrahedral preference create?**

Correct: **angle strain**

## Build step 3 - inspect bond alignment

Rotate the model to a simple side/bond view of the hypothetical flat ring.

Prompt:

**If neighboring bonds are close to eclipsing, what second source of strain appears?**

Correct: **torsional strain**

## Build step 4 - let the ring pucker

Learner drags two opposite carbon nodes slightly out of the plane.

Visual shows some bond overlap/eclipsing reduced.

Prompt:

**Which problem improved most clearly when the ring puckered?**

Correct: **torsional strain**

## Build step 5 - check what remains

Keep the tetrahedral-angle ghost overlay visible.

Prompt:

**Did puckering make the ring angles perfectly tetrahedral?**

Correct: **No**

## Build Together explanation

Learner completes:

> "Cyclobutane puckers because ________. It still remains strained because ________."

Supported target meaning:
- puckering reduces eclipsing/torsional strain,
- small ring still forces strongly nonideal bond angles/angle strain.

Build Together logs supported success only.

---

# 8. GUIDED PRACTICE - YOU DO WITH SUPPORT

## Fresh guided system

Use **cyclopentane**.

Provide:
- a flat five-membered sketch,
- a tetrahedral-angle reference,
- an unlabeled 3D puckered version.

Do not provide the completed explanation.

## Guided task A - angle comparison

Prompt:

**The geometric five-membered angle is around 108 degrees, close to 109.5 degrees. Should angle strain be severe like cyclopropane, or much smaller?**

Correct: **much smaller**

## Guided task B - inspect the flat version

Show a bond-alignment overlay only if requested.

Prompt:

**If the ring stayed perfectly flat and several neighboring bonds eclipsed, which strain source would remain important?**

Correct: **torsional strain**

## Guided task C - explain puckering

Learner chooses or states:

**Cyclopentane puckers mainly to reduce ________.**

Correct: **torsional strain / eclipsing**

## Guided task D - compare with chair cyclohexane

Show a new chair cyclohexane silhouette beside the puckered cyclopentane, with no axial/equatorial labels.

Prompt:

**Which one can better combine near-tetrahedral angles with staggered bonds?**

Correct: **chair cyclohexane**

## Guided support fading

Two consecutive guided decisions without corrective reveal begin fading.

**What support fades means here:**
1. remove the numeric 109.5-degree reference first,
2. replace it with only `preferred tetrahedral geometry`,
3. remove automatic `eclipsed/staggered` badges,
4. require the learner to identify the visual evidence directly,
5. then replace step prompts with one task goal: `Explain which strain source the ring shape is reducing and which source may remain`,
6. hints remain learner-requested only,
7. the entire Guided item remains supported after fading,
8. any error restores only the minimum scaffold needed for that relationship and resets the two-success streak.

Do not move to cold evidence with unresolved confusion between angle and torsional strain.

---

# 9. MISCONCEPTION CONTRASTS

## M1 - "Small rings are strained because their bonds are weak"

### Representation switch

Show:
- same C-C bond type in an open-chain model,
- same C-C bond type constrained inside a ring.

Overlay only geometry differences.

Dr. Merissa:

> "The important difference is not that a ring uses a mysterious weaker kind of C-C bond. The ring forces the atoms into less favorable geometry and bond alignment."

Repair: learner identifies angle distortion and/or eclipsing as the cause.

---

## M2 - "Angle strain means eclipsing"

### Representation switch

Show two independent sliders:
- slider A changes bond angle while keeping relative torsion fixed,
- slider B rotates about a bond while keeping bond angle fixed.

Dr. Merissa:

> "Angle strain changes when the bond angle is distorted. Torsional strain changes when neighboring bonds eclipse. They can change independently."

Repair: classify two fresh examples by source.

---

## M3 - "Torsional strain is just steric crowding"

### Representation switch

Use ethane:
- staggered H/H,
- eclipsed H/H.

Dr. Merissa:

> "Even small hydrogen bonds show an eclipsing penalty. Torsional strain is tied to eclipsing, not only to large groups colliding. Larger groups can add steric crowding, but the ideas are not identical."

Repair: identify the eclipsing penalty in ethane as torsional.

---

## M4 - "Cyclopropane strain is only angle strain"

### Representation switch

Split screen:
- left: triangle angle overlay,
- right: Newman-like view down a ring C-C bond showing eclipsing C-H relationships.

Dr. Merissa:

> "Cyclopropane has two major problems in this introductory model: severe angle distortion and extensive eclipsing."

Repair: learner names both sources.

---

## M5 - "Puckering fixes all ring strain"

### Representation switch

Use cyclobutane before and after puckering.

Overlay:
- eclipsing decreases,
- angle remains far from tetrahedral.

Dr. Merissa:

> "Puckering can relieve torsional strain while substantial angle strain remains. A molecule can improve one problem without solving every problem."

Repair: learner marks `improves` versus `still remains` for each strain source.

---

## M6 - "Cyclopentane should stay flat because 108 degrees is already close to 109.5 degrees"

### Representation switch

Hold bond-angle geometry nearly constant while toggling flat versus puckered bond alignment.

Dr. Merissa:

> "Near-ideal angles solve the angle problem well, but they do not guarantee staggered bonds. Cyclopentane puckers mainly to reduce torsional strain."

Repair: identify the remaining eclipsing problem in the flat model.

---

## M7 - "A flat hexagon should be ideal because a hexagon looks roomy"

### Representation switch

Compare:
- flat hexagon drawing,
- chair cyclohexane 3D model.

Dr. Merissa:

> "A flat polygon on paper is not automatically the lowest-energy 3D molecule. Cyclohexane folds into a chair so its carbon geometry is near tetrahedral and its bonds are largely staggered."

Repair: choose which visual better satisfies both conditions.

---

## M8 - "More carbons always means less ring strain"

### Representation switch

Show only C3, C4, C5, and chair C6 first.

Dr. Merissa:

> "From cyclopropane toward chair cyclohexane, the common rings gain more freedom to approach favorable geometry. But ring size by itself is not a universal strain formula. Larger rings can introduce other interactions outside this lesson."

Do not teach transannular strain in detail unless later course materials require it.

Repair: learner ranks only the evidence-supported C3/C4/C6 comparison and explains the geometry.

---

# 10. SIX-WAY "I DON'T KNOW" CONTENT ROUTING

The shared router remains authoritative.

## IDK 1 - "I don't understand what the question means"

Response:

> "First decide what the question is asking us to inspect: bond angle, bond alignment, ring shape, or overall strain comparison. We will do only that one job first."

Switch to a four-choice task-type view, then return to a fresh item.

## IDK 2 - "I understand it, I don't know how to start"

Response:

> "Start with two checks: Are the C-C-C angles far from tetrahedral? Are neighboring bonds eclipsing? Those two checks usually tell you where to begin."

Model one check only, then return to a fresh item.

## IDK 3 - "I forgot something I need"

Offer only targeted micro-reviews:
- tetrahedral carbon geometry,
- staggered versus eclipsed,
- angle strain,
- torsional strain,
- why puckering changes bond alignment.

Repair only the selected dependency.

## IDK 4 - "I started but got stuck"

Preserve work and ask where:
- deciding whether angles are distorted,
- recognizing eclipsing,
- naming the correct strain source,
- explaining why puckering helps,
- comparing two rings,
- separating cause from observation.

Repair only that step.

## IDK 5 - "I need to see an example"

Use a new supported ring rendering not used in cold evidence. Show only one strain source first, then add the second if needed.

Return to a fresh item afterward.

## IDK 6 - "This explanation isn't making sense"

Switch to **Flexible-Model Mode**:
1. show carbon nodes connected by flexible rods,
2. overlay ghost tetrahedral directions at each carbon,
3. let the learner close the chain into a three- or four-membered ring,
4. visually show how far the rod directions must bend from the ghost geometry,
5. then rotate the camera down one C-C bond,
6. reveal whether neighboring bonds are staggered or eclipsed,
7. allow a pucker control for C4/C5 so the learner can see which source changes.

If still unclear, use a spring-and-hinge analogy only as a bridge:

> "Imagine connected hinges that prefer one opening angle and also prefer not to line their arms directly behind one another. Closing them into a tight loop can force the hinges to bend and the arms to line up. Those are two different problems."

Immediately map back to carbon angle strain and torsional strain.

---

# 11. INDEPENDENT PRACTICE - COLD EVIDENCE BANK

Cold evidence gets:
- no tetrahedral ghost overlay,
- no automatic angle-strain or torsional-strain label,
- no pucker animation,
- no eclipsing highlight,
- no answer-revealing ring ranking,
- no hints,
- no completed comparison sentence.

Because the chemistry target itself is a small finite set of ring sizes, a cold item may reuse a **ring size** that has appeared during teaching. It may not reuse the same annotated visual, same molecule-plus-view, same completed comparison, or same prompt structure from Teach, Watch, Build Together, Guided, misconception repairs, or IDK worked examples.

If help is requested, the current item converts to supported practice and cannot count as clean independent evidence.

---

## RS-I1 - Identify angle strain from a fresh three-membered-ring rendering

Show an unlabeled 3D **methylcyclopropane ring skeleton** with one ring C-C-C angle highlighted. Do not reuse the Watch triangle overlay.

Prompt:

**What strain source is created by forcing this ring angle close to 60 degrees instead of the preferred tetrahedral value, and why?**

### Scoring contract

Required propositions:
1. the highlighted angle is a C-C-C bond angle in a three-membered ring,
2. it is forced far below the tetrahedral reference near 109.5 degrees,
3. that geometric distortion creates angle strain,
4. do not call the angle distortion torsional strain merely because the molecule is a ring.

Accept example:
> "The ring forces the C-C-C angle near 60 degrees, far from the tetrahedral value, so this is angle strain."

Wrong-but-keyword-complete example that must fail:
> "The 60-degree angle is torsional strain because torsional strain is what happens when bond angles move away from 109.5 degrees."

Why it fails: it assigns the geometric role of angle strain to torsional strain.

---

## RS-I2 - Identify torsional strain from a fresh ring-bond view

Show a held-out view down one C-C bond of **ethylcyclopropane**, with the relevant adjacent ring C-H/C-substituent bonds shown aligned enough to identify the eclipsed relationship. Do not label it eclipsed.

Prompt:

**What strain source is represented by the aligned neighboring bonds in this view, and what visual evidence tells you?**

### Scoring contract

Required propositions:
1. the decision comes from relative bond alignment around the C-C viewing axis,
2. aligned/eclipsed neighboring bonds create torsional strain,
3. the answer must not use the ring's 60-degree bond angle as the reason for this specific view,
4. angle strain may also exist in the molecule, but it is not the feature being assessed here.

Accept example:
> "The bonds are eclipsed when viewed down the C-C bond, so this is torsional strain."

Wrong-but-keyword-complete example that must fail:
> "The bonds are eclipsed, so the ring has angle strain because eclipsing changes the C-C-C angle."

Why it fails: it notices the correct geometry but assigns it to the wrong strain source.

---

## RS-I3 - Explain why cyclobutane is strained relative to butane

Show a fresh unannotated puckered cyclobutane model beside a flexible butane model. Do not reuse the Build Together rendering.

Prompt:

**Why does cyclobutane have substantial ring strain compared with flexible butane? Name the relevant causes.**

### Scoring contract

Required propositions:
1. cyclobutane ring closure forces C-C-C angles far below tetrahedral preference, creating angle strain,
2. puckering reduces but does not eliminate unfavorable eclipsing/torsional interactions,
3. flexible butane is not locked into the same four-membered ring geometry and can adopt more favorable bond angles/rotations,
4. do not claim puckering eliminates all strain.

Accept example:
> "Cyclobutane still has strongly compressed ring angles, so it has angle strain. It puckers to reduce eclipsing, but some torsional strain remains. Butane is flexible and is not locked into those ring constraints."

Wrong-but-keyword-complete example that must fail:
> "Cyclobutane is less strained because puckering makes its angles tetrahedral and removes all torsional strain, while butane is more strained because it can rotate."

Why it fails: it reverses both the effect of puckering and the flexibility/strain relationship.

---

## RS-I4 - Diagnose why cyclopentane puckers

Show a fresh pair:
- hypothetical planar cyclopentane,
- a different held-out puckered cyclopentane rendering.

Prompt:

**The ring angles are already close to tetrahedral. Why does the real ring still prefer a puckered shape?**

### Scoring contract

Required propositions:
1. angle strain is relatively small compared with C3/C4 because the angles are near tetrahedral,
2. a flat arrangement would create more eclipsing between neighboring bonds,
3. puckering reduces torsional strain,
4. do not claim cyclopentane puckers mainly to fix a severe 60-degree angle problem.

Accept example:
> "Cyclopentane's angles are already close to tetrahedral, but a flat ring would have more eclipsing. Puckering reduces torsional strain."

Wrong-but-keyword-complete example that must fail:
> "Cyclopentane puckers because its 60-degree bond angles cause severe angle strain; puckering changes those angles to 180 degrees."

Why it fails: it assigns the wrong geometry and an impossible repair mechanism.

---

## RS-I5 - Compare cyclopentane with chair cyclohexane

Show fresh unannotated 3D models of **cyclopentane** and **chair cyclohexane**.

Prompt:

**Which has lower ring strain in this comparison, and what two geometric features support your answer?**

### Scoring contract

Required propositions:
1. chair cyclohexane is lower in ring strain in this introductory comparison,
2. its C-C-C angles are near tetrahedral,
3. its neighboring bonds are largely staggered,
4. cyclopentane has relatively favorable angles but retains more torsional strain than chair cyclohexane,
5. do not say cyclohexane is lower simply because six is a larger number than five.

Accept example:
> "Chair cyclohexane is lower in ring strain because its bond angles are near tetrahedral and its bonds can be largely staggered. Cyclopentane has good angles but more residual torsional strain."

Wrong-but-keyword-complete example that must fail:
> "Cyclopentane is lower because 108 degrees is closer to tetrahedral than cyclohexane, and chair cyclohexane is eclipsed around every bond."

Why it fails: it reverses the bond-alignment comparison and misuses the angle evidence.

---

## RS-I6 - Separate angle and torsional evidence in one mixed case

Show two abstract carbon-ring models:
- Model A has a strongly compressed C-C-C angle but staggered neighboring bonds,
- Model B has near-tetrahedral C-C-C angles but a clearly eclipsed C-C bond view.

Prompt:

**Which model shows more angle strain, and which shows more torsional strain? Explain each assignment.**

### Scoring contract

Required propositions:
1. Model A's compressed angle is evidence for angle strain,
2. Model B's eclipsing is evidence for torsional strain,
3. the two strain labels must not be swapped,
4. the learner must cite the deciding geometric feature for each.

Accept example:
> "A has more angle strain because its bond angle is badly compressed. B has more torsional strain because its neighboring bonds eclipse."

Wrong-but-keyword-complete example that must fail:
> "A has torsional strain because its angle is compressed, and B has angle strain because its bonds eclipse."

Why it fails: every expected word appears, but both cause-to-effect roles are reversed.

---

## RS-I7 - Qualitative ring-strain ranking

Show fresh unlabeled models of:
- cyclopropane,
- puckered cyclobutane,
- chair cyclohexane.

Prompt:

**Rank these from highest to lowest ring strain and justify the top and bottom choices from geometry.**

### Scoring contract

Required relationships:
1. cyclopropane is highest among these three because of severe angle strain plus extensive eclipsing/torsional strain,
2. cyclobutane remains substantially strained because angles are strongly compressed even after puckering reduces some torsion,
3. chair cyclohexane is lowest because angles are near tetrahedral and bonds are largely staggered,
4. expected qualitative ranking: cyclopropane > cyclobutane > chair cyclohexane,
5. ranking must be justified by geometry rather than ring-size number alone.

Accept example:
> "Cyclopropane is highest because it combines 60-degree angle distortion with eclipsing. Cyclobutane is next because puckering helps torsion but its angles are still far from tetrahedral. Chair cyclohexane is lowest because it has near-tetrahedral angles and mostly staggered bonds."

Wrong-but-keyword-complete example that must fail:
> "Cyclohexane is most strained because it has the most carbons, then cyclobutane, then cyclopropane because the smallest ring has the fewest bonds to strain."

Why it fails: the ranking and causal rule are reversed.

---

## RS-I8 - Test-style full explanation with a held-out comparison

Use **cyclobutane versus butane** in a new drawing orientation with no strain labels.

Prompt:

**A classmate says, 'Cyclobutane is higher in energy than butane just because it is cyclic.' Improve the explanation. Identify at least two structural reasons and explain what puckering changes.**

### Scoring contract

A clean success requires:
1. angle strain identified from the four-membered ring's strongly compressed C-C-C geometry,
2. torsional strain identified from unfavorable eclipsing/near-eclipsing interactions,
3. puckering correctly described as reducing torsional strain rather than eliminating angle strain,
4. flexible butane correctly described as not locked into the same ring geometry and able to adopt more favorable conformations,
5. `cyclic` or `small` alone is not accepted as the cause,
6. angle strain and torsional strain may not be role-reversed.

Accept example:
> "Cyclobutane is higher in energy because the four-membered ring forces its C-C-C angles far below tetrahedral, creating angle strain, and it also has torsional strain from unfavorable bond alignment. Puckering reduces some eclipsing, but the compressed ring angles remain. Butane is flexible and is not locked into those constraints."

Wrong-but-keyword-complete example that must fail:
> "Cyclobutane has torsional strain because its bond angles are about 90 degrees and angle strain because its bonds eclipse. Puckering fixes the angle strain completely, so the ring becomes more stable than butane."

Why it fails: it reverses the two strain sources and falsely states what puckering fixes.

Contradiction rule:
A response that correctly states `puckering reduces torsional strain` and later says `puckering removes all angle strain` does not pass explanation evidence until the contradiction is resolved on a fresh prompt.

---

# 12. INDEPENDENT EVIDENCE RULE

Independent evidence requires a cold fresh item completed without support.

Do not display `Mastered` after one correct strain label or one correct ranking.

To satisfy shared mastery, the engine must eventually record:

1. at least one cold item requiring the learner to distinguish angle strain from torsional strain,
2. one role-preserving causal explanation of a ring-strain comparison,
3. a second different cold success after a meaningful interval.

Recommended coverage before mixed Test 1 practice:
- one geometry-source classification,
- one small-ring explanation,
- one ring-shape/puckering explanation,
- one qualitative ranking,
- later fresh retrieval.

Objective correctness and explanation correctness are scored separately.

A lucky correct ranking with reversed strain causes does not create explanation evidence.

A correct explanation attached to the wrong ring model is not a clean independent success.

After support or correction, recollect explanation evidence on a fresh item rather than asking the learner to repeat the corrected sentence.

---

# 13. EXPLAIN-WHY PROMPTS - ROLE-PRESERVING SCORING

## E-W1 - Why does cyclopropane have severe angle strain?

Required propositions:
1. a three-membered ring geometrically forces C-C-C angles near 60 degrees,
2. tetrahedral carbon prefers an angle near 109.5 degrees,
3. the large deviation creates angle strain.

Accept:
> "Cyclopropane has to close into a triangle, so its C-C-C angles are near 60 degrees instead of near 109.5 degrees. That distortion creates angle strain."

Wrong-but-keyword-complete failure:
> "Cyclopropane has angle strain because its C-H bonds eclipse; angle strain is the energy from eclipsing."

Why it fails: eclipsing is evidence for torsional strain, not the bond-angle cause being asked about.

---

## E-W2 - Why does cyclopropane also have torsional strain?

Required propositions:
1. the planar three-membered ring locks neighboring bonds into eclipsed relationships,
2. eclipsing raises torsional energy,
3. this is separate from the 60-degree angle problem.

Accept:
> "Looking down a ring C-C bond, neighboring bonds are eclipsed, so cyclopropane has torsional strain in addition to angle strain."

Wrong-but-keyword-complete failure:
> "Cyclopropane's torsional strain comes from the 60-degree C-C-C angle, while eclipsing creates angle strain."

Why it fails: the two causal roles are reversed.

---

## E-W3 - Why does cyclobutane pucker?

Required propositions:
1. a flat four-membered ring would have strong eclipsing interactions,
2. puckering moves some bonds away from eclipsed alignment,
3. this reduces torsional strain,
4. substantial angle strain remains because the ring angles are still far from tetrahedral.

Accept:
> "Cyclobutane puckers to reduce eclipsing and therefore torsional strain, but its small ring angles still leave substantial angle strain."

Wrong-but-keyword-complete failure:
> "Cyclobutane puckers to make all of its 90-degree angles become 109.5 degrees, which removes angle strain; torsional strain is unchanged."

Why it fails: it reverses what puckering primarily improves and falsely claims complete angle repair.

---

## E-W4 - Why does cyclopentane pucker even though its angles are near tetrahedral?

Required propositions:
1. its bond angles are already much closer to tetrahedral than C3/C4,
2. a perfectly planar ring would still have unfavorable eclipsing,
3. puckering reduces torsional strain.

Accept:
> "Cyclopentane does not need severe angle correction, but a flat ring would have more eclipsing. Puckering reduces that torsional strain."

Wrong-but-keyword-complete failure:
> "Cyclopentane puckers because its angles are near 60 degrees, so angle strain is the only important problem."

Why it fails: it assigns the wrong angle geometry and erases the torsional reason for puckering.

---

## E-W5 - Why is chair cyclohexane low in ring strain?

Required propositions:
1. chair geometry keeps C-C-C angles near tetrahedral,
2. neighboring bonds are largely staggered,
3. therefore both angle strain and torsional strain are minimized relative to the smaller common rings discussed.

Accept:
> "The chair lets cyclohexane keep near-tetrahedral angles and mostly staggered bonds, so both major strain sources are small."

Wrong-but-keyword-complete failure:
> "Chair cyclohexane is low in strain because all of its bonds are eclipsed and its bond angles are near 60 degrees."

Why it fails: both geometric relationships are reversed.

---

# 14. TRANSFER TASKS

## Transfer RS-T1 - Diagnose a one-cause explanation

Show a student answer:

`Cyclopropane is strained only because its bond angles are 60 degrees.`

Prompt:

**What important second cause is missing?**

Required:
- torsional strain from eclipsed neighboring bonds.

This resembles the historical Test 1 explanation demand without copying a historical answer.

---

## Transfer RS-T2 - Predict whether flattening helps

Show puckered cyclobutane and ask what would happen if it were forced perfectly planar.

Required:
- more eclipsing,
- higher torsional strain,
- no claim that flattening repairs angle strain.

---

## Transfer RS-T3 - Separate geometry from ring-size shortcut

Show two abstract ring models with the same number of atoms but different 3D conformations.

Prompt:

**Why can the two conformations have different strain even though the ring size is identical?**

Required:
- bond angle and/or torsional alignment can differ,
- ring size alone does not specify the full geometry.

---

## Transfer RS-T4 - Connect U1-12 to U1-13

Show a flat cyclohexane sketch and a chair cyclohexane.

Prompt:

**Before learning axial/equatorial positions, what two strain reasons already tell you why the chair is preferred?**

Required:
- near-tetrahedral angles,
- largely staggered bonds / reduced torsional strain.

Do not introduce chair-flip mechanics here.

---

# 15. LATER RETRIEVAL

After at least one different lesson or meaningful activity, present a fresh ring-strain comparison.

Ask only:
1. identify the dominant angle-strain evidence,
2. identify any torsional-strain evidence,
3. state whether puckering can relieve one of those sources,
4. give one short causal explanation.

Do not reopen the full beginner lesson if retrieval is clean.

A later clean comparison plus explanation can satisfy the second-cold-item mastery component.

---

# 16. ADAPTIVE TEST-OUT PATH

Before full teaching, use a 3-item cold probe:

1. distinguish angle strain from torsional strain in two simple diagrams,
2. explain why cyclopropane is unusually strained,
3. explain why a ring such as cyclobutane or cyclopentane puckers.

### 3/3 clean

Skip full Teach/Watch. Give later confirmation plus any missing explanation evidence.

### 2/3

Teach only the failed subskill and verify with a fresh item.

### 0-1/3

Run the full lesson.

Any tetrahedral ghost overlay, eclipsing highlight, strain label, pucker animation, or completed explanation contaminates the probe item.

---

# 17. ACCESSIBILITY + PHONE/IPAD REQUIREMENTS

1. Angle strain versus torsional strain may not be communicated by color alone; use text labels, geometry markers, or distinct symbols.
2. Every 3D pucker animation requires a reduced-motion sequence with discrete flat/intermediate/puckered states.
3. The tetrahedral reference angle must have a text equivalent.
4. A selected C-C-C angle must be visually and textually identified for screen-reader users.
5. Bond eclipsing must be represented by more than overlap color; use alignment markers and text.
6. Learners must be able to replay only the pucker or camera-to-bond-view step without replaying the whole lesson.
7. Portrait mode may stack the ring model above the comparison panel, but ordinary tasks must not require horizontal scrolling.
8. Landscape may show side-by-side ring comparisons.
9. Tap targets for carbon nodes and bond-view controls must exceed the visual bond thickness.
10. Voice narration is optional; every causal explanation remains in text.
11. A reduced-motion user must still be able to compare flat versus puckered geometry and staggered versus eclipsed alignment.
12. Return destination to Test 1 support must be preserved.

---

# 18. CHEMISTRY TOOLBOX RULES

During Teach, Watch, Build Together, and Guided, the toolbox may include after the concept is taught:
- tetrahedral carbon reminder: about 109.5 degrees,
- angle strain = bond-angle distortion,
- torsional strain = eclipsing/near-eclipsing penalty,
- staggered/eclipsed reminder,
- compact ring-shape cards for C3-C6 after each has been introduced.

The toolbox must not show a completed target explanation or ranked answer.

During cold evidence these supports are hidden unless the assessment configuration explicitly allows them.

Opening a disallowed support during a cold item converts it to supported practice.

---

# 19. IMPLEMENTATION EVENT CONTRACT

Suggested events:
- `RING_STRAIN_PREREQ_PASS`
- `RING_STRAIN_PREREQ_REPAIR`
- `RING_STRAIN_ANGLE_RESULT`
- `RING_STRAIN_TORSIONAL_RESULT`
- `RING_STRAIN_SOURCE_CLASSIFIED`
- `RING_STRAIN_PUCKER_RESULT`
- `RING_STRAIN_COMPARE_RESULT`
- `RING_STRAIN_BUILD_TOGETHER_SUCCESS`
- `RING_STRAIN_GUIDED_SUCCESS`
- `RING_STRAIN_MISCONCEPTION` with code
- `RING_STRAIN_REPRESENTATION_SWITCH`
- `RING_STRAIN_INDEPENDENT_ATTEMPT`
- `RING_STRAIN_INDEPENDENT_SUCCESS`
- `RING_STRAIN_EXPLAIN_WHY_RESULT`
- `RING_STRAIN_TRANSFER_RESULT`
- `RING_STRAIN_RETRIEVAL_RESULT`

Suggested misconception codes:
- `RING_SIZE_AS_CAUSE`
- `WEAK_BOND_EXPLANATION`
- `ANGLE_TORSIONAL_REVERSED`
- `TORSIONAL_EQUALS_STERIC`
- `CYCLOPROPANE_ANGLE_ONLY`
- `PUCKERING_FIXES_ALL_STRAIN`
- `CYCLOPENTANE_SHOULD_BE_FLAT`
- `FLAT_HEXAGON_AS_IDEAL`
- `RING_SIZE_MONOTONIC_RULE`
- `ECLIPSING_IGNORED`

The content layer reports outcomes. It does not declare mastery.

---

# 20. BEGINNER-CLARITY RELEASE GATE

Before implementation, an auditor must answer YES to all:

1. Does the lesson begin from constrained geometry rather than a memorized ring ranking?
2. Is tetrahedral carbon geometry established before angle strain is named?
3. Is angle strain defined by bond-angle distortion?
4. Is torsional strain defined separately by eclipsing/near-eclipsing?
5. Can the learner distinguish the two causes in a fresh mixed example?
6. Is cyclopropane shown to have severe angle strain for the approximately 60-degree C-C-C geometry?
7. Is cyclopropane also shown to have torsional strain from eclipsing?
8. Does the lesson reject `small ring` as a sufficient causal explanation?
9. Is cyclobutane puckering shown as a torsional-strain tradeoff rather than a magical removal of all strain?
10. Does substantial cyclobutane angle strain remain after puckering?
11. Is cyclopentane taught as having near-tetrahedral angles but residual torsional strain that motivates puckering?
12. Is chair cyclohexane linked to near-tetrahedral angles and largely staggered bonds without duplicating the U1-13 chair lesson?
13. Does the lesson avoid claiming ring size alone universally determines strain?
14. Does Build Together start from blank rather than a completed cyclobutane explanation?
15. Does Guided use a different supported problem emphasis from Watch and Build Together?
16. Does scaffold fading specify exactly what disappears?
17. Are misconception repairs visual/relational rather than label repetition?
18. Does every IDK route return to a fresh item afterward?
19. Are cold items uncontaminated by strain labels, overlays, or completed comparisons?
20. Does every cold reasoning item carry its own role-preserving scoring contract?
21. Can keyword-complete reversals of angle/torsional cause, puckering effect, or ranking logic be rejected explicitly?
22. Are objective correctness and explanation correctness scored separately?
23. Does the cold bank avoid exact annotated-visual and exact completed-comparison reuse even where ring sizes necessarily recur?
24. Does reduced-motion preserve the geometry evidence needed to understand puckering?
25. Can the lesson operate comfortably on phone/iPad?
26. Does the lesson prepare for a Test 1-style `why is cyclopropane high energy?` explanation without claiming the historical question will repeat?
27. Does the lesson avoid unnecessary numerical strain energies unless verified course materials require them?
28. Does the lesson avoid over-teaching larger-ring/transannular chemistry outside current scope?

Any NO blocks production.

---

# 21. DEFINITION OF DONE FOR U1-12

The lesson is successful when a beginner can look at a fresh cycloalkane comparison and say, in her own reasoning:

- whether the C-C-C angles are strongly distorted from tetrahedral,
- whether neighboring bonds are eclipsed or near-eclipsed,
- which observation corresponds to angle strain,
- which observation corresponds to torsional strain,
- why cyclopropane has both,
- why cyclobutane and cyclopentane pucker,
- what puckering improves and what it may leave unresolved,
- why chair cyclohexane is comparatively low in ring strain,
- and why ring size alone is not a complete explanation,

then complete a fresh cold explanation without the teaching screen.

The standard is not:

> "She memorized cyclopropane > cyclobutane > cyclopentane > cyclohexane."

The standard is:

> **"She can inspect the ring geometry, identify the actual strain source, and explain why the molecule adopts the shape it does."**
