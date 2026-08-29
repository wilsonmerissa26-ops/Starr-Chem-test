# UNIT 1 LESSON U1-13 — CYCLOHEXANE CHAIRS, AXIAL/EQUATORIAL, AND CHAIR FLIPS
## Fully authored beginner lesson script

**Status:** content draft for instructional review before runtime implementation.

**Parent curriculum:** `UNIT1_BEGINNER_TEACHING_CURRICULUM.md`

**Teaching-engine contract:** `DR_MERISSA_TEACHING_ENGINE_SPEC.md`

**Template standards:**
- `UNIT1_LESSON_U1_01_BOND_LINE_SCRIPT.md`
- `UNIT1_LESSON_U1_10_NEWMAN_PROJECTIONS_SCRIPT.md`
- `UNIT1_LESSON_U1_10_NEWMAN_COLD_EVIDENCE_SCORING_CONTRACT.md`

**Purpose of this file:** teach cyclohexane chairs as a 3D tracking skill. The learner must preserve carbon identity, substituent up/down identity, cis/trans relationship, and axial/equatorial changes through a chair flip, then use those facts to reason about stability.

Cold independent items in this file carry their own role-preserving scoring contracts from the start.

---

# 1. LESSON GOAL

A learner who begins with little or no usable knowledge of cyclohexane chairs should leave able to:

1. understand why cyclohexane is represented as a non-flat chair,
2. number the same six carbons consistently through a chair drawing and chair flip,
3. distinguish **up/down** from **axial/equatorial**,
4. identify axial positions as alternating up/down around the ring,
5. identify the equatorial position at each carbon as opposite in up/down direction from that carbon's axial position,
6. place a substituent at the correct carbon while preserving whether it is up or down,
7. perform a chair flip without changing carbon numbering or substituent up/down identity,
8. understand that a chair flip swaps axial ↔ equatorial while preserving up/down,
9. use up/down relationships to preserve cis/trans identity,
10. explain why an axial substituent is usually less favorable than the same substituent equatorial because of 1,3-diaxial interactions,
11. compare two substituted-chair conformations by the number and importance of axial substituents,
12. recognize symmetric cases in which two chair conformations can be equal in energy,
13. solve a fresh cyclohexane-chair problem without prompts.

This lesson is not complete because the learner can copy a chair shape. It is complete when she can keep the same molecule intact while the chair flips and can explain why one conformation is lower in energy when a difference actually exists.

---

# 2. LEARNER-FACING ORIENTATION

## Screen title

**Cyclohexane chairs: the ring moves, but the molecule keeps its identity**

## Dr. Merissa narration

> "Cyclohexane is a six-carbon ring, but those six carbons do not prefer to sit in one flat hexagon. The ring folds into a three-dimensional chair shape. The tricky part is not drawing the chair. The tricky part is keeping track of which carbon is which and whether each substituent points up or down while the chair changes shape."

## Immediate learner check

Visual: show the same six numbered carbon tokens first arranged as a flat hexagon and then connected in a chair-like 3D shape.

Prompt:

**When the ring changes from a flat drawing to a chair drawing, did carbon 1 turn into a different carbon?**

Choices:
- Yes
- No, the same carbon moved to a new position in the drawing
- I am not sure yet

Correct: **No, the same carbon moved to a new position in the drawing**

If missed:

> "That is the first idea to lock down. The drawing changes shape, but carbon identity does not change. Carbon 1 stays carbon 1, carbon 2 stays carbon 2, and so on."

Orientation is not mastery evidence.

---

# 3. SMALLEST PREREQUISITE GATE

Do not test full ring strain or IUPAC naming here.

## Gate item P1 — ring adjacency

Visual: numbered cyclohexane ring 1-2-3-4-5-6.

Prompt:

**Which two carbons are directly bonded to carbon 1 in the ring?**

Correct: **C2 and C6**

If missed, trace the two ring bonds from C1 and repair only ring adjacency.

## Gate item P2 — up versus down

Visual: one carbon with two possible substituent arrows, one clearly above the ring reference and one below.

Prompt:

**If a substituent is labeled UP, does that describe which side of the ring it points toward, or whether it is axial/equatorial?**

Correct: **which side of the ring it points toward**

If missed:

> "Up/down and axial/equatorial are two different labels. Up/down tells us which face of the ring the substituent points toward. Axial/equatorial tells us which chair direction it occupies. A chair flip can change axial/equatorial without changing up/down."

## Gate item P3 — cis/trans from up/down

Prompt:

**Two substituents are both UP. Are they on the same face or opposite faces of the ring?**

Correct: **same face**

Then introduce only the needed term:

> "Same face is called cis. One up and one down are opposite faces, called trans."

If this is missed, show a top/bottom ring-face model and ask a new same-face/opposite-face item before continuing.

---

# 4. TEACHING SEQUENCE — I DO

## Core worked molecule

Use **methylcyclohexane** first, with the methyl group on C1 and labeled **UP**.

Use one canonical reference chair and keep numbering visible during instruction.

### Reference Chair A convention

For the teaching visual, define Chair A so that axial positions follow:

- C1 axial UP
- C2 axial DOWN
- C3 axial UP
- C4 axial DOWN
- C5 axial UP
- C6 axial DOWN

At each carbon, the equatorial direction has the **opposite up/down identity** from the axial direction at that same carbon.

This is a teaching coordinate convention, not a claim that only one page orientation of a chair is valid. A rigidly rotated equivalent drawing is acceptable if carbon identity and up/down relationships are preserved.

---

## WATCH STEP 1 — Fold the flat ring into a chair without renumbering

### Visual

Start with a numbered flat cyclohexane ring. Lift alternating carbons gradually until it becomes Chair A. Keep each number attached to its carbon throughout.

### Dr. Merissa

> "Watch the numbers, not the page position. Carbon 1 may move higher or lower on the screen, but it is still carbon 1 because its bonds to carbon 2 and carbon 6 never changed."

### Interaction

Prompt:

**Tap carbon 1 after the chair finishes folding.**

If learner taps by old screen position instead of identity, trace C1-C2 and C1-C6 from the flat ring into the chair.

---

## WATCH STEP 2 — Add axial directions first

### Visual

At each carbon, draw one roughly vertical bond direction. Add them one at a time around the ring:

C1 up, C2 down, C3 up, C4 down, C5 up, C6 down.

### Dr. Merissa

> "These roughly vertical positions are called axial. Axial directions alternate up, down, up, down as we move around this chair."

### Prediction

Prompt after C1-C3 are shown:

**If C3 axial is UP, should C4 axial be UP or DOWN?**

Correct: **DOWN**

If missed, animate the alternating pattern around the ring rather than just restating it.

---

## WATCH STEP 3 — Add equatorial directions as the opposite option at each carbon

### Visual

At C1, show axial UP and then add equatorial DOWN pointing outward. Repeat at C2: axial DOWN, equatorial UP. Continue around the ring.

### Dr. Merissa

> "Every carbon has one axial direction and one equatorial direction. At the same carbon, one points up and the other points down. So axial does not mean up, and equatorial does not mean down. The direction depends on which carbon we are standing on."

### Interaction

Select C2.

Prompt:

**C2 axial is DOWN. What is C2 equatorial: UP or DOWN?**

Correct: **UP**

Then select C3.

Prompt:

**C3 axial is UP. What is C3 equatorial?**

Correct: **DOWN**

---

## WATCH STEP 4 — Place C1-UP methyl in Chair A

### Visual

At C1, highlight both available directions:
- axial UP,
- equatorial DOWN.

Prompt before placement:

**Our methyl group is C1-UP. Which available C1 position is UP in Chair A?**

Correct: **axial**

Place `CH3` on C1 axial UP.

### Dr. Merissa

> "The molecule told us two things before we ever looked at the chair: carbon 1 and up. The chair tells us whether that up position happens to be axial or equatorial in this conformation. In Chair A, C1-UP is axial."

---

## WATCH STEP 5 — Perform the chair flip as a real ring motion

### Visual

Animate Chair A into Chair B. The six carbons move through the flip but remain connected and numbered. Do not rotate the whole page and call that a flip.

The methyl group remains bonded to C1 and remains visibly UP throughout the transformation.

### Dr. Merissa

> "A chair flip changes the shape of the ring. It does not detach the substituent, renumber the carbons, or push an up group through the ring to become down."

### Prediction pause

Before the final Chair B appears:

Prompt:

**C1 methyl started UP. After the chair flip, should it still be UP or become DOWN?**

Correct: **still UP**

If missed, freeze the animation halfway and keep an `UP face` reference plane visible while the substituent stays on that same face.

---

## WATCH STEP 6 — Show axial/equatorial swap explicitly

### Visual

In Chair B, at C1 show:
- axial DOWN,
- equatorial UP.

The same C1-UP methyl now occupies equatorial UP.

### Dr. Merissa

> "This is the chair-flip rule: axial becomes equatorial, and equatorial becomes axial. But up stays up, and down stays down. Our C1 methyl was axial-up in Chair A. It is equatorial-up in Chair B. Same carbon. Same up identity. Different chair direction."

### Interaction

Prompt:

**What changed?**

Choices:
- UP changed to DOWN
- C1 changed to C2
- axial changed to equatorial
- the methyl detached and reattached

Correct: **axial changed to equatorial**

---

## WATCH STEP 7 — Explain why equatorial methylcyclohexane is lower in energy

### Visual

Compare the two methylcyclohexane chairs side by side.

For axial C1-UP methyl, highlight its close same-side interactions with axial hydrogens on C3 and C5. Label them `1,3-diaxial interactions` only after the visual appears.

### Dr. Merissa

> "When the methyl group is axial, it points into the same vertical region as axial hydrogens farther around the ring, especially on carbons 3 and 5. Those close contacts make the axial arrangement less favorable. Chemists call these 1,3-diaxial interactions."

Then show the equatorial methyl pointing outward with those close contacts reduced.

> "When the same methyl group is equatorial, it points outward and avoids most of those 1,3-diaxial contacts. That is why equatorial methylcyclohexane is lower in energy than axial methylcyclohexane."

### Interaction

Prompt:

**Which C1-UP methylcyclohexane chair is lower in energy: the one where CH3 is axial or the one where CH3 is equatorial?**

Correct: **equatorial**

If wrong, replay only the side-by-side 1,3-diaxial contact comparison.

---

## WATCH STEP 8 — Introduce cis/trans without confusing it with axial/equatorial

### Visual

Show a disubstituted ring with two groups marked both UP, then one UP/one DOWN. Do not add axial/equatorial labels yet.

### Dr. Merissa

> "Cis and trans describe which face of the ring the substituents occupy. If both are up or both are down, they are on the same face: cis. If one is up and one is down, they are on opposite faces: trans."

### Prediction

Prompt:

**If two substituents are cis before a chair flip, can a chair flip make them trans?**

Correct: **No**

Feedback:

> "Right. A chair flip preserves each substituent's up/down identity, so it also preserves cis/trans identity."

---

## WATCH STEP 9 — Work a disubstituted stability example: trans-1,4-dimethylcyclohexane

### Visual

Use trans-1,4-dimethylcyclohexane with a specific assignment, for example:
- C1 methyl UP,
- C4 methyl DOWN.

Construct Chair A by checking each carbon's up/down slot. With the reference convention above:
- C1-UP is axial,
- C4-DOWN is axial,
so one chair is diaxial.

Flip to Chair B:
- C1-UP becomes equatorial,
- C4-DOWN becomes equatorial,
so the other chair is diequatorial.

### Dr. Merissa

> "We do not memorize 'trans-1,4 means diequatorial' as a magic phrase. We place each substituent from its carbon number and up/down identity, then we see what chair directions result. Here the flip converts both axial groups into equatorial groups while keeping C1 up and C4 down."

### Interaction

Prompt:

**Which trans-1,4-dimethyl chair is lower in energy?**

Correct: **the diequatorial chair**

Reason required during teaching:

> "Both methyl groups avoid axial 1,3-diaxial interactions in the diequatorial chair."

---

## WATCH STEP 10 — Show the equal-energy trap with cis-1,4-dimethylcyclohexane

### Visual

Use cis-1,4-dimethylcyclohexane with both methyl groups UP.

In Chair A:
- C1-UP is axial,
- C4-UP is equatorial.

After the flip:
- C1-UP is equatorial,
- C4-UP is axial.

Each chair has one axial methyl and one equatorial methyl.

### Dr. Merissa

> "A chair flip does not guarantee that one side wins. For cis-1,4-dimethylcyclohexane with identical methyl groups, each chair has one axial methyl and one equatorial methyl. The axial penalty simply moves from one methyl to the other. Because the substituents are identical and the environments are symmetry-related, these two chairs are equal in energy."

### Interaction

Prompt:

**Which chair is more stable here?**

Choices:
- Chair A
- Chair B
- They are equal in energy

Correct: **They are equal in energy**

If wrong, overlay `1 axial CH3 + 1 equatorial CH3` on both chairs and compare counts before revealing the equality.

---

# 5. QUICK CONCEPT CHECK BEFORE BUILD TOGETHER

Supported instruction only.

1. **Axial always means UP.** False.
2. **At one carbon, the axial and equatorial directions have opposite up/down identities.** True.
3. **A chair flip changes axial ↔ equatorial.** True.
4. **A chair flip changes UP ↔ DOWN.** False.
5. **A chair flip changes cis ↔ trans.** False.
6. **An axial substituent can be less favorable because of 1,3-diaxial interactions.** True.
7. **Every pair of chair conformations must have different energy.** False.

If any answer is wrong, revisit only the relevant visual step.

---

# 6. BUILD TOGETHER — WE DO

## Fresh molecule

Use **cis-1,3-dimethylcyclohexane**, both methyl groups UP.

Do not reuse methylcyclohexane, trans-1,4, or cis-1,4.

Start from a blank numbered chair workspace plus the molecule specification:
- C1-UP CH3
- C3-UP CH3

### Build step 1 — mark carbon numbers

Learner places C1-C6 on the reference chair.

System checks adjacency, not screen memorization alone.

### Build step 2 — mark axial directions

Learner completes alternating axial up/down markers.

### Build step 3 — derive equatorial directions

At each needed carbon, learner chooses the opposite up/down slot from axial.

### Build step 4 — place C1-UP methyl

Using Chair A, C1-UP is axial.

### Build step 5 — place C3-UP methyl

Using Chair A, C3-UP is axial.

The starting chair is therefore diaxial.

### Build step 6 — chair flip

Learner flips the chair while preserving:
- C1 remains C1,
- C3 remains C3,
- both methyl groups remain UP.

Both become equatorial in Chair B.

### Build step 7 — stability decision

Prompt:

**Which chair should be lower in energy?**

Correct: **diequatorial Chair B**

Required supported reasoning:
- both groups are methyl,
- both are equatorial in Chair B,
- axial 1,3-diaxial interactions are reduced relative to the diaxial chair.

Build Together logs supported success only.

---

# 7. GUIDED PRACTICE — YOU DO WITH SUPPORT

## Fresh molecule

Use **trans-1,2-dimethylcyclohexane** with:
- C1-UP methyl,
- C2-DOWN methyl.

This pattern is deliberate: the learner must preserve trans identity while deciding chair positions rather than reuse the 1,3 or 1,4 pattern.

### Guided task A — assign up/down before chair direction

Prompt:

**What must remain true through every valid chair drawing?**

Correct:
- C1 methyl remains UP,
- C2 methyl remains DOWN.

### Guided task B — place substituents in Chair A

With reference Chair A:
- C1-UP is axial,
- C2-DOWN is axial.

So Chair A is diaxial.

If wrong, show only the selected carbon's axial/equatorial slots with up/down labels. Do not reveal the entire finished chair.

### Guided task C — perform the flip

Learner produces Chair B:
- C1-UP equatorial,
- C2-DOWN equatorial.

### Guided task D — choose lower-energy chair

Correct: Chair B diequatorial.

### Guided success criterion

Two consecutive guided decisions without corrective reveal begin scaffold fading.

**What support fades means here:**
1. remove preprinted axial up/down arrows first,
2. then remove the equatorial up/down helper labels,
3. keep carbon numbering visible until the learner has placed two substituents correctly on two different carbons,
4. then replace step prompts with the single task goal `Draw both chair conformations and identify the lower-energy one`,
5. hints remain learner-requested only,
6. the entire current Guided item remains supported even after labels fade,
7. an error restores only the smallest needed scaffold and resets the two-success streak.

Do not move to cold evidence with unresolved up/down, numbering, or flip errors.

---

# 8. MISCONCEPTION CONTRASTS

## M1 — "Axial means up; equatorial means down"

### Representation switch

Show C1 and C2 side by side:
- C1 axial UP / equatorial DOWN,
- C2 axial DOWN / equatorial UP.

Dr. Merissa:

> "Axial and equatorial describe chair directions. Up and down describe ring faces. The pairing changes from carbon to carbon."

Repair: learner labels all four slots at C1 and C2.

---

## M2 — "A chair flip makes up become down"

### Representation switch

Track one C1-UP substituent through the animated flip with a fixed `UP face` reference band.

Dr. Merissa:

> "The ring moves around the substituent's face identity. Up stays up. What changes is whether that up position is axial or equatorial."

Repair: predict C1-UP position before and after a fresh flip.

---

## M3 — "A chair flip means rotate the page"

### Representation switch

Side-by-side:
- A: rigidly rotate the entire chair drawing,
- B: perform a true chair flip with carbons moving relative to the page.

Overlay:
- rigid rotation: `axial/equatorial identities unchanged`,
- true flip: `axial ↔ equatorial at each carbon`.

Repair: identify which animation actually interconverts conformers.

---

## M4 — "Carbon numbers change when the chair flips"

### Representation switch

Anchor each carbon number to its two neighboring ring bonds during the entire flip.

Dr. Merissa:

> "Carbon identity comes from connectivity, not from which corner of the drawing it occupies. C1 stays bonded to C2 and C6 through the flip."

Repair: tap C1 before and after a fresh flip.

---

## M5 — "Cis means both equatorial; trans means one axial and one equatorial"

### Representation switch

Show:
- cis-1,3 diequatorial example,
- cis-1,4 one axial/one equatorial example,
- trans-1,4 diequatorial example.

Dr. Merissa:

> "Cis/trans comes from up/down face identity. Axial/equatorial depends on the particular chair. Do not use one label set to guess the other."

Repair: classify cis/trans from up/down only, ignoring axial/equatorial badges.

---

## M6 — "The chair with more groups pointing down must be lower energy"

### Representation switch

Compare two chairs with the same up/down pattern but different axial/equatorial placement.

Dr. Merissa:

> "Up versus down does not automatically decide stability. Axial crowding is the key comparison here."

Repair: count axial substituents, not up/down substituents.

---

## M7 — "Every chair pair has one lower-energy winner"

### Representation switch

Return to cis-1,4-dimethylcyclohexane: one axial methyl + one equatorial methyl in both chairs.

Dr. Merissa:

> "If identical substituents simply exchange equivalent axial and equatorial positions, the two chairs can be equal in energy."

Repair: compare a fresh symmetric one-axial/one-equatorial pair.

---

## M8 — "More equatorial groups is the only rule"

### Wrong idea

Learner treats stability as a blind count even when groups differ in size.

### Representation switch

Use a supported-only example with one ethyl and one methyl group where each chair has one axial and one equatorial substituent. Exclude that exact molecule/drawing from the cold bank.

Dr. Merissa:

> "When both chairs have the same number of axial groups, which group is axial matters. Larger groups usually pay a bigger crowding penalty when axial. So the more important goal is to keep the bulkier group equatorial when a fully diequatorial option is impossible."

Do not require numerical A-values in this lesson unless course materials later make them part of the assessment.

Repair: choose the chair with ethyl equatorial and methyl axial over the reverse, all else equivalent.

---

# 9. SIX-WAY "I DON'T KNOW" CONTENT ROUTING

The shared router remains authoritative.

## IDK 1 — "I don't understand what the question means"

Response:

> "We are not solving stability yet. First we are tracking one substituent: which carbon is it on, and is it up or down?"

Switch to carbon-number + face-only view. Return to a fresh chair item afterward.

## IDK 2 — "I understand it, I don't know how to start"

Response:

> "Start with the molecule facts before drawing the chair: write C-number + UP/DOWN for every substituent. Then use the chair to decide axial or equatorial."

Model only the first substituent, then return a fresh structure.

## IDK 3 — "I forgot something I need"

Offer targeted micro-reviews:
- ring numbering,
- axial versus equatorial,
- up versus down,
- cis versus trans,
- chair-flip rule,
- 1,3-diaxial interactions.

Repair only the selected dependency.

## IDK 4 — "I started but got stuck"

Preserve work and ask where:
- numbering the chair,
- alternating axial directions,
- finding the equatorial direction,
- placing an up/down substituent,
- doing the flip,
- preserving cis/trans,
- comparing stability.

Repair only that step.

## IDK 5 — "I need to see an example"

Use a new monosubstituted or disubstituted example not in cold evidence. Keep full Watch controls. Return to a fresh item afterward.

## IDK 6 — "This explanation isn't making sense"

Switch to **Carbon-Tracker Mode**:
1. show six numbered physical carbon nodes joined in a ring,
2. attach a small UP or DOWN flag to each substituent independently of the chair shape,
3. animate the carbon nodes through the flip,
4. keep each flag attached to the same carbon and same face,
5. draw axial/equatorial guide rails only after the motion stops,
6. label which rail the unchanged flag now occupies.

If still unclear, use a folding-paper-ring analogy only as a bridge:

> "Imagine six labeled seats connected in a flexible ring. The ring can fold, but seat 1 does not become seat 2, and a flag taped to the top of seat 1 does not magically move underneath."

Immediately map back to the chemistry.

---

# 10. INDEPENDENT PRACTICE — COLD EVIDENCE BANK

Cold evidence gets no preprinted axial/equatorial guide labels, no chair-flip animation, no carbon tracker, no 1,3-diaxial overlay, no hints, and no stability badges.

Every concrete cold molecule/drawing must be held out from Teach, Watch, Build Together, Guided, misconception repairs, and IDK worked examples. A cold item may test a previously taught **relationship pattern**, but it must not reuse the same molecule-plus-assignment or the same completed visual.

If help is requested, the item converts to supported practice and cannot count as clean independent evidence.

## CC-I1 — Axial/equatorial + up/down at one carbon

Show a fresh numbered reference chair and highlight one carbon.

Prompt:

**Label the axial direction and equatorial direction at this carbon, including whether each is UP or DOWN.**

### Scoring contract

Required relationships:
1. axial/equatorial must be assigned to the correct physical directions for the shown chair,
2. the two positions at one carbon must have opposite up/down identities,
3. a correct UP/DOWN answer with axial/equatorial reversed does not pass.

Accept example:
> "At this carbon, axial is down and equatorial is up."

Wrong-but-keyword-complete example that must fail:
> "At this carbon, axial is up and equatorial is down," when the shown chair has axial down/equatorial up.

Why it fails: all expected labels appear, but each role is attached to the wrong chair direction.

---

## CC-I2 — Chair flip of a single substituent

Show a fresh monosubstituted chair, for example a C2-DOWN ethyl group that is axial-down in the shown held-out starting chair.

Prompt:

**Draw the flipped chair and state the substituent's carbon number, UP/DOWN identity, and axial/equatorial identity before and after the flip.**

### Scoring contract

Required propositions:
1. substituent remains on the same carbon,
2. UP/DOWN is preserved,
3. axial ↔ equatorial swaps,
4. ring numbering remains chemically consistent.

Accept example:
> "It stays on C2 and stays down. It changes from axial-down to equatorial-down."

Wrong-but-keyword-complete response that must fail:
> "It stays on C2, but axial-down flips to equatorial-up."

Why it fails: it correctly names the carbon and axial/equatorial swap but incorrectly reverses down to up.

Another failure:
> "The down substituent stays down but moves from C2 to C3 because the chair corner moved."

Why it fails: page position was mistaken for carbon identity.

---

## CC-I3 — Cis/trans preservation through a flip

Show a fresh disubstituted chair with one pair labeled by carbon number but no cis/trans label.

Prompt:

**Classify the pair as cis or trans, flip the chair, and explain why the relationship does or does not change.**

### Scoring contract

Required propositions:
1. cis = same face: both up or both down,
2. trans = opposite faces: one up and one down,
3. chair flip preserves each substituent's up/down identity,
4. therefore chair flip preserves cis/trans.

Accept example:
> "They are trans because one is up and one is down. After the flip each keeps that up/down direction, so they are still trans."

Wrong-but-keyword-complete example that must fail:
> "They are trans because one is up and one is down, but after the flip axial becomes equatorial so trans becomes cis."

Why it fails: it correctly identifies the starting relationship but incorrectly treats axial/equatorial change as a cis/trans change.

---

## CC-I4 — Monosubstituted stability

Use a held-out **ethylcyclohexane** example with the ethyl group on **C4-DOWN**, drawn in a chair orientation not used in Watch. Show both conformers, one with the C4-DOWN ethyl axial and one with it equatorial. Do not use the C1-UP methylcyclohexane teaching example.

Prompt:

**Which chair is lower in energy and why?**

### Scoring contract

Required propositions:
1. same molecule is being compared,
2. equatorial substituent avoids/reduces unfavorable 1,3-diaxial interactions relative to axial,
3. axial placement has closer same-side interactions with axial groups/hydrogens at the 1,3-related positions,
4. lower energy is assigned to the equatorial conformer for the ordinary substituent used here.

Accept example:
> "The equatorial chair is lower because the substituent avoids the 1,3-diaxial crowding it has when axial."

Wrong-but-keyword-complete example that must fail:
> "The axial chair is lower because 1,3-diaxial interactions stabilize the substituent by holding it close to the ring."

Why it fails: it uses the correct term but reverses the energetic effect.

---

## CC-I5 — Fresh diequatorial/diaxial comparison

Use a held-out molecule and face assignment, not an exact teaching example. One allowed cold-bank pattern is **trans-1,2-diethylcyclohexane with C1-DOWN and C2-UP**, drawn in an orientation not shown during Guided.

Prompt:

**Draw both chair conformations, identify each substituent as axial/equatorial and up/down, then choose the lower-energy chair.**

### Scoring contract

Required propositions:
1. carbon numbers preserved in both chairs,
2. each substituent's up/down identity preserved,
3. axial/equatorial swaps during flip,
4. if one conformer is diequatorial and the other diaxial for the shown identical substituents, diequatorial is lower,
5. explanation must connect the ranking to reduced axial crowding/1,3-diaxial interactions rather than to page orientation.

Accept example:
> "Both ethyl groups stay on the same carbons and keep their up/down directions. In the diequatorial chair both are equatorial, so that chair is lower because it avoids the two axial ethyl penalties."

Wrong-but-keyword-complete example that must fail:
> "The diequatorial chair is higher because two equatorial ethyl groups create more 1,3-diaxial strain than the diaxial chair."

Why it fails: it names the correct conformer categories but reverses the source and direction of the strain.

---

## CC-I6 — Equal-energy symmetric case: cis-1,4-diethylcyclohexane

This cold item deliberately uses **diethyl**, not the cis-1,4-dimethyl teaching example from Watch.

Prompt:

**Draw both chairs for cis-1,4-diethylcyclohexane with both ethyl groups on the same face. Compare their energies.**

### Scoring contract

Required propositions:
1. cis relationship is represented by both ethyl groups having the same up/down identity,
2. in each chair, one ethyl is axial and the other equatorial,
3. the flip exchanges which ethyl is axial/equatorial while preserving their face identity,
4. because the substituents are identical and the two chairs are symmetry-related, the conformers are equal in energy,
5. a blanket rule that one chair must be lower is rejected.

Accept example:
> "They are equal. Both chairs have one axial ethyl and one equatorial ethyl; the flip only switches which ethyl occupies which type of position."

Wrong-but-keyword-complete example that must fail:
> "Chair A is lower because it has one axial and one equatorial ethyl, while Chair B is higher because it also has one axial and one equatorial ethyl."

Why it fails: it lists the same energetic inventory for both chairs but claims a difference without a distinguishing cause.

Another failure:
> "They are equal because chair flipping makes both ethyl groups equatorial half the time."

Why it fails: neither cis-1,4 chair is diequatorial; equality comes from one axial + one equatorial identical ethyl in each symmetry-related conformer.

---

## CC-I7 — Same axial count, different substituent size

Show a fresh disubstituted cyclohexane where each chair has one axial and one equatorial substituent, but the groups differ, for example ethyl and methyl, using a molecule-plus-assignment that did not appear in M8.

Prompt:

**Which chair should be favored qualitatively and why?**

### Scoring contract

Required propositions:
1. both chairs have the same number of axial substituents,
2. group identity therefore matters,
3. the bulkier/larger group should be equatorial when comparing otherwise equivalent choices,
4. do not invent numerical energy values.

Accept example:
> "Both chairs have one axial group, so I compare which group is axial. The chair with ethyl equatorial and methyl axial is favored because the larger ethyl group avoids the bigger axial crowding penalty."

Wrong-but-keyword-complete example that must fail:
> "The chair with ethyl axial is favored because a larger group gets more stabilization from 1,3-diaxial contacts."

Why it fails: it reverses the effect of increased substituent size on axial crowding.

---

## CC-I8 — Full fresh production

Provide a new substituted cyclohexane specification by carbon number and cis/trans or explicit up/down assignment.

Prompt:

**Draw both chair conformations, label every substituent axial/equatorial and up/down, preserve cis/trans, and identify the lower-energy chair or state that they are equal if the evidence requires it. Explain your decision.**

### Scoring contract

A clean independent success requires all of the following:
1. correct carbon numbering/connectivity,
2. correct up/down assignment for every substituent,
3. correct axial/equatorial assignment in Chair A,
4. correct axial/equatorial swap in Chair B,
5. up/down preserved through the flip,
6. cis/trans preserved,
7. stability conclusion supported by the actual axial inventory and substituent identity,
8. no unsupported claim that one chair must always be lower.

Acceptable explanations may vary, but role-preserving relationships are mandatory.

Wrong-but-keyword-complete responses fail if they reverse any of:
- up/down,
- axial/equatorial,
- carbon identity,
- cis/trans,
- axial crowding and stability,
- equality versus a real energetic difference.

A correct final chair with a contradictory explanation does not create explanation evidence.

---

# 11. INDEPENDENT EVIDENCE RULE

Independent evidence requires a cold fresh item completed without support.

Do not display `Mastered` after one correct chair drawing.

To satisfy shared mastery, the engine must eventually record:

1. at least one cold independent chair construction or equivalent high-value item,
2. a role-preserving explanation of the chair flip and/or stability decision,
3. a second different cold success after a meaningful interval.

Recommended coverage before Test 1 mixed practice:
- one chair-flip item,
- one cis/trans preservation item,
- one stability comparison,
- one full two-chair production item,
- later fresh retrieval.

Objective correctness and explanation correctness are scored separately. A lucky correct choice with a reversed explanation is not explanation evidence. A correct explanation attached to a wrong chair is not a clean independent success.

---

# 12. EXPLAIN-WHY PROMPTS — ROLE-PRESERVING SCORING

## E-W1 — Why does up stay up during a chair flip?

Required propositions:
1. chair flip changes ring conformation,
2. substituent remains bonded to same carbon,
3. substituent remains on same face of ring,
4. axial/equatorial changes but up/down does not.

Accept:
> "The ring changes shape, but the substituent stays on the same carbon and same face. So axial can become equatorial while up stays up."

Wrong-but-keyword-complete failure:
> "Up becomes down because axial becomes equatorial during the flip."

Why it fails: it incorrectly couples axial/equatorial swap to face inversion.

## E-W2 — Why does carbon numbering not change during a chair flip?

Required propositions:
1. numbering follows carbon identity/connectivity,
2. each carbon retains the same two ring neighbors,
3. screen position changes do not create new carbon identities.

Wrong-but-keyword-complete failure:
> "C1 becomes C2 because the carbon moves into the corner where C2 used to be."

Why it fails: it uses page position rather than connectivity.

## E-W3 — Why is equatorial methylcyclohexane lower than axial?

Required propositions:
1. axial methyl experiences unfavorable 1,3-diaxial contacts,
2. equatorial points outward and reduces those contacts,
3. therefore equatorial is lower in energy.

Wrong-but-keyword-complete failure:
> "Axial is lower because 1,3-diaxial interactions stabilize methyl close to the ring."

Why it fails: it reverses the energetic effect.

## E-W4 — Why does a chair flip preserve cis/trans?

Required propositions:
1. cis/trans is defined by same face versus opposite faces,
2. flip preserves each substituent's up/down identity,
3. therefore same-face/opposite-face relationship is unchanged.

Wrong-but-keyword-complete failure:
> "Cis becomes trans because axial and equatorial swap during the flip."

Why it fails: it confuses chair direction with ring face.

## E-W5 — Why are the two cis-1,4-dimethyl chairs equal in energy?

Required propositions:
1. each chair has one axial methyl and one equatorial methyl,
2. the methyl groups are identical,
3. flip swaps which methyl is axial/equatorial,
4. no different axial penalty remains to distinguish the symmetry-related chairs.

Wrong-but-keyword-complete failure:
> "One chair is lower even though both have one axial and one equatorial methyl, because every chair pair must have a winner."

Why it fails: it asserts a difference without a chemically different energetic inventory.

---

# 13. TRANSFER TASKS

## Transfer CC-T1 — flat specification to both chairs

Provide a flat cyclohexane with wedge/dash or explicit UP/DOWN substituent labels.

Prompt:

**Convert the same molecule into both chair conformations.**

Required:
- carbon identity preserved,
- up/down interpreted correctly,
- cis/trans preserved,
- axial/equatorial assigned correctly in both chairs.

## Transfer CC-T2 — diagnose a classmate's flip

Show a student solution where a substituent changes from C2-UP axial to C2-DOWN equatorial.

Prompt:

**Identify the exact error and repair only that substituent.**

Required explanation:
- axial/equatorial should swap,
- up/down should not.

## Transfer CC-T3 — stability without blind counting

Show two chairs with one axial substituent in each, but different substituent identities.

Prompt:

**Explain why counting axial groups alone is insufficient here.**

Required:
- same axial count,
- substituent size/axial penalty differs,
- larger group should preferentially be equatorial when possible.

## Transfer CC-T4 — equality detection

Show a symmetric pair with the same axial/equatorial inventory in both chairs.

Prompt:

**Is there enough evidence to call one chair lower? Explain.**

Learner must be willing to answer **equal** when appropriate rather than force a winner.

---

# 14. LATER RETRIEVAL

After at least one different lesson or meaningful activity, present a fresh substituted cyclohexane.

Ask only:
1. draw the flipped chair,
2. preserve up/down and cis/trans,
3. identify the lower-energy chair or equality,
4. give one short causal explanation.

Do not reopen the full beginner lesson if retrieval is clean.

---

# 15. ADAPTIVE TEST-OUT PATH

Before full teaching, use a 3-item cold probe:

1. identify axial/equatorial + up/down at one carbon,
2. flip one substituted chair correctly,
3. compare two chair conformers for stability.

### 3/3 clean
Skip full Teach/Watch. Give later confirmation plus explanation if needed.

### 2/3
Teach only the failed subskill and verify with a fresh item.

### 0-1/3
Run the full lesson.

Any helper overlay, up/down guide, carbon tracker, flip animation, or stability hint contaminates the probe item.

---

# 16. ACCESSIBILITY + PHONE/IPAD REQUIREMENTS

1. Up/down cannot be communicated by color alone; use text labels, arrows, face markers, or shape cues.
2. Axial/equatorial cannot be communicated by color alone.
3. Every chair-flip animation needs a discrete reduced-motion sequence: Chair A → intermediate numbered ring state → Chair B.
4. Carbon numbers must remain readable during teaching transformations.
5. Learners must be able to replay only the flip without replaying the whole lesson.
6. Tap targets for carbon positions and substituent slots must be larger than the drawn bond endpoints.
7. Portrait mode may stack Chair A above Chair B, but both must be visible without horizontal scrolling for ordinary examples.
8. Landscape may compare both chairs side by side.
9. Voice narration is optional; all reasoning remains in text.
10. A rigid page-rotation control must never be presented as equivalent to a chair-flip control.
11. The return destination to Test 1 support must be preserved.

---

# 17. CHEMISTRY TOOLBOX RULES

During supported phases, toolbox may include:
- ring-numbering reminder,
- compact `flip: axial ↔ equatorial; up/down preserved` reminder after that rule has been taught,
- cis = same face; trans = opposite faces,
- optional axial/equatorial slot overlay,
- 1,3-diaxial interaction reminder after it has been taught.

Do not show a completed target chair as a toolbox answer key.

During cold evidence, these supports are hidden unless assessment configuration explicitly permits them.

---

# 18. IMPLEMENTATION EVENT CONTRACT

Suggested events:
- `CHAIR_PREREQ_PASS`
- `CHAIR_PREREQ_REPAIR`
- `CHAIR_NUMBERING_RESULT`
- `CHAIR_AXIAL_PATTERN_RESULT`
- `CHAIR_UP_DOWN_RESULT`
- `CHAIR_SUBSTITUENT_PLACEMENT_RESULT`
- `CHAIR_FLIP_RESULT`
- `CHAIR_CIS_TRANS_RESULT`
- `CHAIR_STABILITY_RESULT`
- `CHAIR_BUILD_TOGETHER_SUCCESS`
- `CHAIR_GUIDED_SUCCESS`
- `CHAIR_MISCONCEPTION` with code
- `CHAIR_REPRESENTATION_SWITCH`
- `CHAIR_INDEPENDENT_ATTEMPT`
- `CHAIR_INDEPENDENT_SUCCESS`
- `CHAIR_EXPLAIN_WHY_RESULT`
- `CHAIR_TRANSFER_RESULT`
- `CHAIR_RETRIEVAL_RESULT`

Suggested misconception codes:
- `AXIAL_EQUALS_UP`
- `EQUATORIAL_EQUALS_DOWN`
- `UP_DOWN_FLIPPED`
- `PAGE_ROTATION_AS_CHAIR_FLIP`
- `CARBON_RENUMBERED_ON_FLIP`
- `CIS_TRANS_FROM_AX_EQ`
- `STABILITY_FROM_UP_DOWN`
- `FORCED_WINNER_EQUAL_CASE`
- `AXIAL_COUNT_IGNORES_GROUP_SIZE`
- `DIAXIAL_STRAIN_REVERSED`

The content layer reports outcomes. It does not declare mastery.

---

# 19. BEGINNER-CLARITY RELEASE GATE

Before implementation, an auditor must answer YES to all:

1. Does the lesson begin from the same six carbons rather than a mysterious finished chair?
2. Is carbon numbering visibly preserved through flat-ring → chair and chair flip?
3. Are up/down and axial/equatorial introduced as separate dimensions?
4. Is axial alternation shown before being memorized as a rule?
5. Is the opposite up/down identity of equatorial at each carbon made explicit?
6. Does the learner place a substituent from carbon number + up/down before deciding axial/equatorial?
7. Does a true chair flip visibly differ from rigid page rotation?
8. Does chair flip preserve carbon number?
9. Does chair flip preserve up/down?
10. Does chair flip swap axial/equatorial?
11. Does the lesson preserve cis/trans through the flip?
12. Are 1,3-diaxial interactions shown visually before being used as a stability rule?
13. Does the learner compare a monosubstituted axial/equatorial pair?
14. Does the learner build a disubstituted example from blank?
15. Does Guided use a different substitution pattern from Watch and Build Together?
16. Does the lesson include a real equal-energy symmetric case rather than forcing a winner?
17. Does it explain why substituent size matters when axial counts tie?
18. Are cold items uncontaminated by overlays/hints?
19. Does every cold explanation item define its own role-preserving scoring contract?
20. Can keyword-complete reversals of up/down, axial/equatorial, cis/trans, or stability cause be rejected explicitly?
21. Are objective correctness and explanation correctness scored separately?
22. Does every IDK route return to a fresh item afterward?
23. Does reduced-motion preserve the essential chair-flip mapping?
24. Can the flow operate comfortably on phone/iPad?
25. Does the lesson prepare the learner for Test 1-style chair construction/stability without claiming historical questions will repeat?

Any NO blocks production.

---

# 20. DEFINITION OF DONE FOR U1-13

The lesson is successful when a beginner can take a fresh substituted cyclohexane and say, in her own reasoning:

- which carbon each substituent belongs to,
- whether each substituent is up or down,
- whether it is axial or equatorial in the first chair,
- what happens to it during a chair flip,
- why up/down and cis/trans do not change,
- which chair is lower in energy and why,
- or why two chairs are equal when the energetic inventory is genuinely equivalent,

and can then draw both chairs without the teaching screen.

The standard is not:

> "She memorized that axial is bad and equatorial is good."

The standard is:

> **"She can keep the molecule chemically identical through a chair flip and use the actual axial/equatorial consequences to reason about stability."**
