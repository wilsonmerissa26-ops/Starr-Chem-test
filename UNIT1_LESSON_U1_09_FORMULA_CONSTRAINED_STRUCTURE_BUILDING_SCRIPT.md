# UNIT 1 LESSON U1-09 - BUILD CONSTITUTIONAL ISOMERS FROM FORMULA + REQUIRED FUNCTIONAL GROUP
## Fully authored beginner lesson script

**Status:** content draft for instructional review before runtime implementation.

**Purpose:** teach molecular-formula structure building as a constraint-satisfaction problem: inventory every atom, place the required functional-group pattern correctly, complete a legal carbon skeleton under normal valence, recount the formula, check charges/valence, and verify that multiple legal connectivities may exist.

Historical Test 1 is a style/coverage signal only; this lesson does not claim the same formula or question will repeat.

---

# 1. LESSON GOAL

A beginner should leave able to:

1. treat a molecular formula as a fixed atom inventory,
2. use every listed atom exactly once,
3. apply a required functional-group connectivity constraint before decorating the rest of the molecule,
4. distinguish `amine` from `amide` by whether nitrogen is directly attached to the carbonyl carbon,
5. complete a legal neutral early-organic structure using normal C/N/O/H valence patterns,
6. infer/check hidden hydrogens rather than forgetting them,
7. recount the final formula from the actual structure,
8. detect too many/few atoms,
9. detect impossible valence,
10. check nonzero formal charges if a proposed structure introduces them,
11. understand that one formula can have more than one valid connectivity,
12. build two constitutional isomers when requested,
13. explain why each produced structure satisfies both formula and functional-group constraint.

The standard is not `she drew something with C, H, N, O`.

The standard is:

> **Every atom is accounted for, every valence is legal, and the required local connectivity really exists.**

---

# 2. SCOPE BOUNDARY

This lesson uses neutral, introductory C/H/N/O structures and the functional-group patterns already established in U1-03.

Do not require:
- exhaustive enumeration of every possible isomer,
- advanced tautomerism,
- resonance contributor generation,
- stereoisomer enumeration,
- reaction prediction.

A degree-of-unsaturation/DBE check may be offered as a **secondary verification tool** only after the learner understands atom inventory and valence. Do not make an unverified course-specific DBE shortcut the foundation of the lesson.

If exact DBE instruction is enabled, use the standard neutral-organic formula and clearly label its scope/source; oxygen does not alter DBE count, N adds one H-equivalent, halogens replace H. DBE is a consistency check, not a substitute for drawing legal connectivity.

---

# 3. ORIENTATION

Screen title:
**A molecular formula is an inventory, not a finished structure**

Dr. Merissa:

> "A formula tells us how many of each atom we own, but it does not tell us exactly how those atoms are connected. Our job is to build a legal structure that spends every atom once and satisfies the required functional-group pattern."

Immediate check:

Show inventory tokens `C3 H7 N1 O1`.

Prompt:
**If your drawing uses four carbon atoms, can it still match C3H7NO just because the functional group looks right?**

Correct: **No**.

---

# 4. SMALLEST PREREQUISITE GATE

## P1 - functional-group constraint

Show:
- `C-N` with N not directly attached to C=O,
- `C(=O)-N`.

Ask which is amide connectivity.

Correct: C(=O)-N.

If missed, U1-03 micro-repair.

## P2 - hidden H / atom count

Give one small bond-line structure and ask total C/H.

If missed, U1-01 micro-repair.

## P3 - common neutral valence

Check:
- carbon total bond order 4,
- ordinary neutral O typically 2 bonds,
- ordinary neutral amine N typically 3 bonds + lone pair.

If missed, targeted foundation only.

---

# 5. THE BUILD ALGORITHM

Teach one repeatable sequence:

1. **Inventory** every atom from formula.
2. **Reserve** atoms needed for the required functional group.
3. **Connect** the remaining carbon skeleton legally.
4. **Complete valence** with remaining H atoms.
5. **Recount** C/H/N/O from the finished structure.
6. **Check** functional-group connectivity again.
7. **Check valence/formal charge**.
8. If asked for another constitutional isomer, change connectivity and repeat all checks.

Dr. Merissa:
> "Do not call a structure finished until it passes every constraint again."

---

# 6. TEACHING SEQUENCE - I DO

## WATCH 1 - Start with inventory, not a guessed skeleton

Use supported formula **C3H7NO** with requirement **amide**.

Create tokens:
- C x3,
- H x7,
- N x1,
- O x1.

Do not draw structure yet.

---

## WATCH 2 - Reserve the amide pattern

U1-03 dependency:
`C(=O)-N`.

Reserve:
- one carbonyl C,
- one O,
- one N.

Dr. Merissa:
> "The word amide is a connectivity constraint. Nitrogen must be directly bonded to the carbonyl carbon. Seeing C=O and N somewhere in the same molecule is not enough."

Prediction:
**If N is two bonds away from the carbonyl carbon, is that an amide?**

Correct: No.

---

## WATCH 3 - Spend remaining carbons

Two carbon atoms remain after the carbonyl carbon.

Connect them into a chain on the carbonyl-carbon side to create a legal example equivalent to **propanamide**, `CH3CH2C(=O)NH2`.

Do not require the IUPAC name; structure is the target.

---

## WATCH 4 - Complete valence with hydrogen inventory

Explicitly count:
- terminal CH3 = 3 H,
- CH2 = 2 H,
- amide N-H2 = 2 H,
- total H = 7.

Formula matches C3H7NO.

Check normal valence:
- carbonyl C total bond order 4,
- O double-bonded,
- N three total bonds (C + 2H) with lone pair in the neutral introductory model.

---

## WATCH 5 - Same formula, amine constraint requires different local connectivity

Still use C3H7NO, now require **amine but not amide**.

Dr. Merissa:
> "If N cannot be directly attached to the carbonyl carbon, we must place the nitrogen somewhere else. The formula still contains only one oxygen and has fewer hydrogens than a fully saturated acyclic amino alcohol would, so our final structure still has to satisfy the atom inventory."

Build supported example:
`CH3-C(=O)-CH2-NH2`.

Check:
- C3,
- H = 3 + 2 + 2 = 7,
- N1,
- O1,
- nitrogen directly attached to CH2, **not** carbonyl carbon,
- therefore amine + ketone pattern, not amide.

No need to name the full molecule.

---

## WATCH 6 - Show a seductive invalid structure

Propose `CH3CH2CH2NH2` plus `OH` attached in a way that yields the wrong total H/formula or illegal O valence.

Make the learner audit rather than accept visual plausibility.

Prompt:
**Which check fails first: atom count, required connectivity, or valence?**

Teach that a chemically familiar-looking fragment is not enough.

---

## WATCH 7 - Prove non-uniqueness

For a supported formula where two valid amides are easy to show, use **C4H9NO** only as a demonstration if it is not reserved for the final cold Test-style item in the same learner episode. To avoid contamination in implementation, the default supported pair should instead use a different formula such as **C5H11NO** and show two branch/connectivity variants.

Core point:
Two structures can share formula and required group while differing connectivity -> constitutional isomers.

---

# 7. OPTIONAL DBE/SATURATION SANITY CHECK

This block is **verification**, not the first teaching representation.

Plain-language bridge:

> "A formula can also tell us whether the structure needs rings or multiple bonds somewhere. Chemists often summarize that with degree of unsaturation. It is a check that helps catch impossible guesses; it does not tell us exactly where to put the unsaturation."

If enabled for current course:
`DBE = (2C + 2 + N - H - X) / 2`
where X = halogens; O is omitted.

For C4H9NO:
`(8 + 2 + 1 - 9)/2 = 1`.

Interpretation:
- final structure needs one degree of unsaturation,
- an amide carbonyl supplies one,
- an amine-only constraint still needs that unsaturation somewhere else (for example a ketone C=O in a valid amino ketone),
- DBE does **not** decide the connectivity by itself.

If current course materials do not use DBE at this point, the runtime may hide the formula and rely on explicit atom/valence recounting. Do not claim a Mercer-specific DBE requirement without evidence.

---

# 8. BUILD TOGETHER - WE DO

Use **C4H9NO**, requirement **amide**, only if the implementation keeps the final historical-style cold item on a different exact prompt/structure set. Safer default supported formula: **C5H11NO**, amide.

Learner starts from tokens.

Steps:
1. reserve `C(=O)-N`,
2. place remaining four carbons legally,
3. complete hydrogens,
4. recount formula,
5. verify direct C(=O)-N,
6. check valence/charge,
7. create a second connectivity by branching the carbon skeleton,
8. prove the two are constitutional isomers by same formula + different connectivity.

No completed skeleton at start.

---

# 9. GUIDED PRACTICE

## Guided A - atom budget

Given **C4H9NO**, show an overbuilt 5-carbon proposal. Learner rejects by formula before deeper chemistry.

## Guided B - amine vs amide placement

Give C/N/O tokens and two partial skeletons; learner selects which keeps N not directly on carbonyl for an amine requirement.

## Guided C - valence audit

Show one almost-valid neutral structure with carbon having five bond-order units. Learner diagnoses valence failure.

## Guided D - second constitutional isomer

Give one valid structure for a support-only formula and ask learner to change connectivity while preserving formula/group.

### Fading

After two correct guided decisions:
1. remove atom tokens,
2. remove functional-group ghost template,
3. remove automatic H counter,
4. remove valence badges,
5. reduce prompt to `inventory -> group -> skeleton -> H -> recount -> valence`.

Guided remains supported.

---

# 10. MISCONCEPTIONS

## M1 - formula is a rough suggestion

Use physical atom tokens; extra/missing token remains visible.

## M2 - contains N + C=O means amide

Map adjacency: only direct C(=O)-N qualifies.

## M3 - amine means no other functional group may appear

Clarify requirement can mean molecule must contain an amine; another group such as ketone may also be needed/allowed unless prompt forbids it.

## M4 - hidden H do not count

Toggle bond-line to expanded formula.

## M5 - if valence looks close, structure is acceptable

Show carbon five-bond failure / oxygen three-bond neutral mismatch; legal valence is not optional.

## M6 - one valid answer means no other isomer exists

Show same formula/group with changed branch connectivity.

## M7 - DBE tells exact structure

If DBE enabled, show two different valid structures with same DBE.

## M8 - formal charge check can be skipped if formula matches

Show formula-correct but charge/valence-inconsistent proposal.

---

# 11. SIX IDK ROUTES

1. **Question meaning:** separate formula constraint from functional-group constraint.
2. **Don't know start:** make atom inventory only.
3. **Forgot prerequisite:** targeted U1-01/U1-03/Day2 valence/formal-charge review.
4. **Started/stuck:** preserve skeleton; identify whether issue is atoms, group adjacency, H count, valence, or second-isomer search.
5. **Need example:** use support-only formula not cold-reserved.
6. **Explanation unclear:** switch to **Atom-Token Constraint Board**: movable C/H/N/O tokens, functional-group lock zone, valence meters, then map back to bond-line.

Support contaminates current cold item.

---

# 12. COLD EVIDENCE BANK

Cold items start with formula + textual group constraint only, unless task is an audit item. No ghost skeleton, atom-use counter, DBE reveal, valence badge, or functional-group highlight.

## FSB-I1 - build one amide

Formula: **C3H7NO**.
Constraint: **must contain an amide**.

Prompt: draw one valid structure and prove formula/group.

One acceptable example: `CH3CH2C(=O)NH2`.

Contract:
1. exactly C3H7NO,
2. direct `C(=O)-N`,
3. legal neutral valence,
4. atom recount supplied,
5. alternative valid structure accepted if all constraints pass.

Wrong:
`CH3C(=O)CH2NH2` labeled amide.

Why fails: formula is C3H7NO and structure may be legal, but N is not directly attached to carbonyl carbon; it is amine + ketone, not amide.

---

## FSB-I2 - build one amine, not amide

Formula: **C3H7NO**.
Constraint: **must contain an amine; N may not be directly bonded to the carbonyl carbon**.

Acceptable example: `CH3C(=O)CH2NH2`.

Required:
- exact formula,
- N on CH2, not carbonyl C,
- legal valence,
- explains amine vs amide connectivity.

Wrong:
`CH3CH2C(=O)NH2`.

Why fails: exact formula is fine but group constraint is amide, not the required amine-not-amide relationship.

---

## FSB-I3 - catch atom-count error

Formula: **C4H9NO**.
Show a proposed legal-looking structure containing five carbons.

Prompt: **Does this satisfy the formula? Diagnose before naming groups.**

Required:
- count 5 carbons in proposal,
- formula allows 4,
- reject regardless of functional-group correctness.

Wrong:
> "Accept because it has an amide and all atoms have normal valence."

Why fails: functional group/valence cannot override atom inventory.

---

## FSB-I4 - catch adjacency error

Formula-compatible displayed structure has C=O and N separated by one carbon.

Prompt: **A classmate calls this an amide because it contains both C=O and N. Is that justified?**

Required:
- N must be directly bonded to carbonyl carbon for amide,
- nearby/separate N does not qualify,
- if N otherwise has amine connectivity, identify it as amine rather than amide within known scope.

Wrong:
> "Yes; any molecule with nitrogen and a carbonyl is an amide."

---

## FSB-I5 - valence audit

Provide formula-matching proposal where one carbon has five total bond-order units.

Required:
- reject structure,
- identify selected carbon valence violation,
- formula match alone insufficient.

Wrong:
> "Accept because every required atom appears exactly once."

---

## FSB-I6 - two amide constitutional isomers

Formula: **C4H9NO**.
Constraint: draw **two constitutional isomers that each contain an amide**.

Acceptable pair:
- butanamide `CH3CH2CH2C(=O)NH2`,
- 2-methylpropanamide `(CH3)2CHC(=O)NH2`.

Other valid pairs accepted if formula/group/connectivity criteria pass.

Required:
1. each C4H9NO,
2. each direct C(=O)-N,
3. legal valence,
4. different connectivity between pair,
5. not merely redraw/conformation.

Wrong:
Two redraws of butanamide.

Why fails: same molecule, not constitutional isomers.

---

## FSB-I7 - DBE sanity check if enabled

Formula: **C4H9NO**.

Prompt:
**A proposed acyclic structure contains only single bonds and no rings. Without deciding an exact structure, is that compatible with the formula?**

If DBE has been taught/enabled:
- C4H9NO gives DBE 1,
- all-single-bond acyclic proposal has DBE 0,
- therefore incompatible.

If DBE is not part of current course configuration, replace this cold item with an explicit H-count/valence audit rather than testing an untaught formula.

Wrong:
> "Compatible because oxygen does not count in DBE, so DBE must be zero."

Why fails: oxygen omission from formula does not erase the hydrogen deficiency; computed DBE is 1.

This item cannot count toward mastery if DBE was not taught.

---

## FSB-I8 - historical-style full production

Formula: **C4H9NO**.

Prompt:
**Draw two different constitutional isomers with this formula: one must contain an amine (not an amide at N), and one must contain an amide. Recount every atom and explain the group-defining connectivity in each.**

Held-out acceptable examples:
- amine-containing: `CH3C(=O)CH(NH2)CH3`,
- amide-containing: `CH3CH2C(=O)NHCH3`.

Required:
1. both C4H9NO,
2. amine example has N not directly attached to carbonyl C,
3. amide example has direct C(=O)-N,
4. both legal valence,
5. different connectivity,
6. atom recount for both,
7. explanation roles correct.

Alternative chemically valid structures accepted.

Wrong-but-keyword-complete:
> "The first is an amide because it has NH2 near C=O, and the second is an amine because its nitrogen is attached directly to C=O."

Why fails: the functional-group roles are reversed even if formulas happen to be correct.

Contradiction rule:
A structure that is objectively valid but accompanied by a reversed amine/amide explanation does not earn explanation evidence.

---

# 13. INDEPENDENT EVIDENCE RULE

Mastery requires shared-engine criteria:
1. cold scaffold-0 valid structure/audit,
2. explanation correctly verifies formula + required connectivity + valence,
3. second different cold success later.

A drawing corrected after an atom-count hint is supported.

A correct formula with wrong functional group is not clean success.

A correct group with wrong formula is not clean success.

---

# 14. EXPLAIN-WHY

E-W1: Why inventory first? -> formula fixes atom counts; extra/missing atoms invalidate structure.

E-W2: Why is direct C(=O)-N required for amide? -> group identity is local connectivity, not element proximity.

E-W3: Why recount after drawing? -> hidden H/branch changes can silently alter formula.

E-W4: Why can one formula have multiple answers? -> formula does not uniquely specify connectivity.

E-W5: Why is valence check separate from formula check? -> correct inventory can still be connected illegally.

---

# 15. TRANSFER

1. Diagnose an atom-count-correct but valence-wrong classmate drawing.
2. Convert expanded valid structure to bond-line, recount formula unchanged.
3. Given one valid isomer, create a second by changing connectivity, not page orientation.
4. Given amine/amide labels, prove each from direct connectivity.

---

# 16. TEST-OUT / RETRIEVAL

3-item probe:
1. inventory/group audit,
2. build one valid constrained structure,
3. determine whether two solutions are constitutional isomers or redraws.

3/3 clean -> skip full teach, later retrieval.
2/3 -> target failed constraint.
0-1/3 -> full lesson.

Later retrieval uses a new formula/group combination within taught scope.

---

# 17. ACCESSIBILITY + MOBILE

- atom tokens labeled textually, not color only,
- valence warnings provide text reason,
- drag-and-drop has tap/keyboard alternatives,
- bond-line structures have textual connectivity equivalents,
- portrait stacks inventory above builder,
- scratch area preserves atom recount,
- cold mode hides atom-use counters/valence auto-reveal unless learner converts to support.

---

# 18. TELEMETRY

Events:
`FORMULA_INVENTORY_RESULT`, `FORMULA_GROUP_CONSTRAINT_RESULT`, `FORMULA_VALENCE_RESULT`, `FORMULA_RECOUNT_RESULT`, `FORMULA_SECOND_ISOMER_RESULT`, `FORMULA_DBE_RESULT`, `FORMULA_MISCONCEPTION`, `FORMULA_REPRESENTATION_SWITCH`, `FORMULA_INDEPENDENT_ATTEMPT`, `FORMULA_INDEPENDENT_SUCCESS`, `FORMULA_EXPLAIN_RESULT`, `FORMULA_TRANSFER_RESULT`, `FORMULA_RETRIEVAL_RESULT`.

Codes:
`ATOM_INVENTORY_IGNORED`, `AMINE_AMIDE_ADJACENCY_REVERSED`, `HIDDEN_H_OMITTED`, `VALENCE_INVALID`, `ONE_ANSWER_MEANS_UNIQUE`, `REDRAW_AS_NEW_ISOMER`, `FORMULA_MATCH_OVERRIDES_GROUP`, `GROUP_MATCH_OVERRIDES_FORMULA`, `DBE_AS_EXACT_STRUCTURE`.

---

# 19. RELEASE GATE

Block production unless:
1. formula treated as exact inventory,
2. functional-group constraint applied by direct connectivity,
3. amine/amide distinction correct,
4. hidden H counted,
5. valence checked independently from formula,
6. Build starts from tokens/blank,
7. multiple valid solutions recognized,
8. constitutional isomer means connectivity change, not redraw,
9. DBE (if used) is verification rather than unsupported course-specific requirement,
10. cold items have explicit role-preserving contracts,
11. alternative valid structures can be accepted rather than hardcoding one answer,
12. support contaminates evidence,
13. objective/explanation separate,
14. historical C4H9NO style is not promised as Fall 2026 repeat,
15. accessibility/mobile requirements hold.

---

# 20. DEFINITION OF DONE

> **She can turn a formula plus functional-group requirement into a legal structure, prove every atom and bond is accounted for, and deliberately create a different connectivity when asked for a constitutional isomer.**