# U1-10 NEWMAN PROJECTIONS — COLD EVIDENCE SCORING CONTRACT
## Normative companion to Section 10

**Status:** required instructional-scoring contract.

**Applies to:** `UNIT1_LESSON_U1_10_NEWMAN_PROJECTIONS_SCRIPT.md`, Section 10.

**Reason this companion exists:** the U1-10 lesson already requires role-preserving explanation grading in its formal Explain-Why section. Cold independent items NP-I2, NP-I4, NP-I5, NP-I6, and NP-I7 also require explanations or relationship assignments that contribute to independent/mastery evidence. Those items therefore need the same explicit accept/reject standard as the approved U1-01 Bond-Line template.

Until this contract is consolidated into the main U1-10 script, it is **normative**. An implementation of Section 10 that ignores this file does not satisfy the U1-10 release gate.

---

# 1. GLOBAL COLD-EXPLANATION RULE

Cold evidence must be graded by **role-preserving propositions**, not by presence of expected words.

A response may use natural learner language, synonyms, or a different sentence order and still pass if the required relationships are correct.

A response must fail when it:

- assigns a correct group to the wrong carbon,
- reverses front and back,
- reverses aligned and offset relationships,
- reverses anti and gauche angle relationships,
- reverses energy order or the cause of that order,
- treats rigid page rotation as bond rotation,
- contains a contradiction that changes the chemistry,
- or contains all expected keywords but attaches them to the wrong roles.

**Implementation guard:** keyword-only, unordered-token, bag-of-words, or `contains all required words` grading is not allowed.

For item-specific examples below, the concrete molecule/drawing is a **scoring example only**. It must not be reused as the learner's cold evidence item.

---

# 2. NP-I2 — SUBSTITUENT OWNERSHIP

## Cold task

The learner lists the three groups attached to the front carbon and the three groups attached to the back carbon, excluding the C—C viewing bond itself.

## Required propositions

1. The stated viewing direction determines which carbon is front and which is back.
2. Each listed group must remain attached to the carbon it is actually bonded to in the source structure.
3. Exactly three non-axis groups belong to the front carbon and exactly three non-axis groups belong to the back carbon.
4. Group **multiplicity** matters. Two H groups or two CH3 groups cannot be collapsed into one simply because the labels repeat.
5. A correct six-group inventory with the front/back ownership swapped does not pass.

## Scoring-only example

Suppose the source structure is a held-out example in which:

- front carbon groups are `CH3`, `H`, `H`,
- back carbon groups are `CH2CH3`, `CH3`, `H`.

### Accept

> "Front has CH3, H, and H. Back has CH2CH3, CH3, and H."

Why it passes: all six groups are preserved with the correct carbon ownership and multiplicity.

### Wrong-but-keyword-complete response that must fail

> "Front has CH2CH3, CH3, and H. Back has CH3, H, and H."

Why it fails: every expected group label appears, but the two carbon inventories have been swapped. Correct vocabulary does not rescue reversed ownership.

### Another failure mode

> "Front has CH3 and H. Back has CH2CH3, CH3, and H."

Why it fails: the learner collapsed two distinct front-carbon H attachments into one. A Newman carbon must still account for three non-axis bonds.

---

# 3. NP-I4 — STAGGERED VS ECLIPSED

## Cold task

The learner classifies fresh Newman projections and explains the visual relationship used.

## Required propositions

1. **Staggered** means the back-carbon bond directions are offset and lie between the front-carbon bond directions.
2. **Eclipsed** means front and back bond directions align in the viewing direction.
3. Classification comes from the **relative front/back bond alignment**, not from whether the picture looks neat, symmetric, crowded, or rotated on the page.

## Scoring-only example

Suppose projection A has offset front/back bonds and projection B has aligned front/back bonds.

### Accept

> "A is staggered because the back bonds sit between the front bonds. B is eclipsed because the front and back bond directions line up."

Why it passes: the labels are attached to the correct geometric relationships.

### Wrong-but-keyword-complete response that must fail

> "A is staggered because its front and back bonds line up, and B is eclipsed because its back bonds are offset between the front bonds."

Why it fails: it contains `staggered`, `eclipsed`, `line up`, `offset`, `front`, and `back`, but assigns the defining relationships to the wrong categories.

### Contradiction rule

A response such as `A is staggered because it is offset, but staggered means the bonds line up` does not pass. One correct clause cannot cancel a contradictory definition.

---

# 4. NP-I5 — ANTI VS GAUCHE

## Cold task

The learner classifies two specified groups in a **staggered** Newman projection as anti or gauche and explains the dihedral relationship.

## Required propositions

1. The learner must use the **two highlighted/specified groups**, not a convenient different pair.
2. The conformation must be staggered for the anti/gauche classification used in this lesson.
3. **Anti:** the specified groups are 180° apart.
4. **Gauche:** the specified groups are 60° apart.
5. The angle relationship and label cannot be reversed.

## Scoring-only example

Suppose the highlighted groups are opposite in a staggered Newman projection.

### Accept

> "They are anti because the highlighted groups are 180 degrees apart in this staggered conformation."

Why it passes: it identifies the correct pair, the correct staggered context, and the correct 180° anti relationship.

### Wrong-but-keyword-complete response that must fail

> "They are gauche because they are 180 degrees apart; anti is the 60-degree staggered relationship."

Why it fails: it uses all of the expected terms and both expected angles but reverses which angle belongs to anti versus gauche.

### Wrong-pair response that must fail

> "The highlighted groups are anti because a different H and CH3 pair is 180 degrees apart."

Why it fails: the prompt asks about the specified pair. A correct angle for a different pair is not evidence for the requested relationship.

---

# 5. NP-I6 — RELATIVE STABILITY OF BUTANE CONFORMERS

## Cold task

The learner ranks fresh anti, gauche, and eclipsed butane conformations from lowest to highest energy and explains the main causes.

## Required propositions

For the specific three conformations shown:

1. anti staggered is lower than gauche staggered because the two methyl groups are farther apart in anti,
2. gauche is still staggered but has more methyl–methyl steric crowding than anti,
3. the shown eclipsed conformation is higher than the staggered conformations because eclipsing introduces torsional strain,
4. if the shown eclipsed view also places larger groups into stronger eclipsing/crowding interactions, that may raise its energy further,
5. torsional strain and steric crowding must not be swapped into the wrong causal roles.

No numerical energy value is required here.

## Scoring-only example

### Accept

> "Anti is lowest, then gauche, then the eclipsed conformation. Anti and gauche are both staggered, but anti keeps the methyl groups farther apart. Gauche has more steric crowding. The eclipsed one is higher because aligned bonds add torsional strain."

Why it passes: the order and the causes are attached to the correct conformations.

### Wrong-but-keyword-complete response that must fail

> "Eclipsed is lowest because torsional strain makes aligned bonds more stable. Gauche is lower than anti because 60-degree methyl groups have less steric crowding than methyl groups 180 degrees apart."

Why it fails: it contains the expected concepts (`eclipsed`, `torsional strain`, `gauche`, `anti`, `60`, `180`, `steric crowding`) but reverses both the energy relationships and their causes.

### Partial-but-contradictory response

> "Anti is lowest because the methyl groups are far apart, but eclipsed is also lower than staggered because torsional strain stabilizes it."

This does not pass. The correct anti statement is not enough when the same response contradicts the staggered/eclipsed energy relationship.

---

# 6. NP-I7 — PAGE ROTATION VS BOND ROTATION

## Cold task

The learner decides which before/after pair is a new conformation and which is only the same Newman drawing rotated rigidly on the page.

## Required propositions

1. A rigid page/drawing rotation moves the front and back spoke sets together.
2. Their relative dihedral relationships do not change, so the molecular conformation is the same.
3. Rotation about the C—C bond changes one carbon's attached groups **relative to** the other carbon's groups.
4. That relative-angle change creates a different conformation even though the C—C bond remains connected.
5. Screen orientation alone is not evidence of conformational change.

## Scoring-only example

Suppose pair A is a rigid 120° rotation of the whole Newman drawing and pair B keeps the front fixed while the back rotates 60° relative to it.

### Accept

> "A is the same conformation because the whole Newman rotated together and the relative angles stayed the same. B is a new conformation because the back groups moved relative to the front groups around the C-C bond."

Why it passes: it distinguishes screen rotation from a change in relative molecular geometry.

### Wrong-but-keyword-complete response that must fail

> "A is the new conformation because the Newman changed its angle on the page. B is the same conformation because the C-C bond stayed connected while the back carbon rotated."

Why it fails: it treats screen orientation as molecular change and treats true relative bond rotation as chemically irrelevant. Both roles are reversed even though the expected words are present.

---

# 7. EVIDENCE RECORDING RULE

For NP-I2, NP-I4, NP-I5, NP-I6, and NP-I7:

- the objective selection/drawing component and its explanation component are scored separately,
- an objectively correct choice with a role-reversed explanation does **not** create explanation evidence,
- a correct explanation attached to an objectively wrong classification does **not** turn the item into a clean independent success,
- contradictory explanations do not pass by keyword accumulation,
- help requested during the item converts the item to supported practice under the main U1-10 contract,
- after repair, explanation evidence must be collected on a **fresh** prompt rather than by asking the learner to repeat the corrected sentence.

---

# 8. TEMPLATE REQUIREMENT FOR REMAINING UNIT 1 LESSONS

The U1-01 rule is now explicit for all future lesson authoring:

> If a cold independent item asks the learner to explain, classify by relationship, assign roles, or justify a causal ranking, the cold item itself must define the role-preserving scoring contract. It is not enough for a later Explain-Why section to contain good examples.

Every such cold item must specify, at minimum:

1. required propositions/relationships,
2. at least one acceptable learner-language example,
3. at least one wrong-but-keyword-complete or relationship-reversed example,
4. why the reversed example fails,
5. contradiction handling when relevant.

This requirement prevents the same semantic-reversal failure from being copied into later lessons.