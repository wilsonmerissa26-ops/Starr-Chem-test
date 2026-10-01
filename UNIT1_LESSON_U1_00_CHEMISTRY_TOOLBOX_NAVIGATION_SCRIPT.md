# UNIT 1 LESSON U1-00 - CHEMISTRY TOOLBOX + NAVIGATION
## Fully authored learner-support and return-context contract

**Status:** content draft for instructional review before runtime implementation.

**Parent curriculum:** `UNIT1_BEGINNER_TEACHING_CURRICULUM.md`

**Teaching-engine contract:** `DR_MERISSA_TEACHING_ENGINE_SPEC.md`

**Purpose of this file:** define the permanent chemistry reference layer and the exact navigation behavior that lets a learner open prerequisite help and return to the Unit 1/Test 1 task she was actually doing. This is not a chemistry-mastery lesson. It is infrastructure for reducing unnecessary memory load without contaminating cold evidence.

---

# 1. LEARNER GOAL

The learner should be able to:

1. open a chemistry toolbox without leaving the lesson,
2. use the periodic table and compact chemistry references during allowed learning states,
3. understand when a reference is allowed versus when opening it converts a cold item to supported practice,
4. open a prerequisite review from Unit 1 and return to the exact interrupted skill/item context,
5. distinguish `Back to Test 1 Support` from ordinary lesson navigation,
6. resume without losing completed work, scaffold state, or return destination.

The standard is not `the toolbox exists`.

The standard is:

> **The learner can get the smallest reference she needs, then return exactly where she came from without losing state or accidentally earning unsupported evidence.**

---

# 2. CHEMISTRY TOOLBOX CONTENT

## A. Periodic table

The toolbox must provide a local, phone/iPad-friendly periodic table.

Tap/selecting an element may show:
- element name,
- symbol,
- atomic number,
- group,
- main-group valence-electron count where pedagogically appropriate,
- common neutral bonding pattern for the early-organic elements when appropriate.

Priority elements for quick access:
- H,
- C,
- N,
- O,
- F,
- Cl,
- Br,
- I.

The interface may visually emphasize those elements, but the table should not falsely imply they are the only elements in chemistry.

## B. Bond-order reminder

Compact reference:
- single bond = bond order 1,
- double bond = bond order 2,
- triple bond = bond order 3.

This card may be available after bond-order notation has been established.

## C. Common valence/bonding reminder

After the relevant foundation is taught, a compact card may summarize common neutral early-organic patterns, for example:
- H usually 1 bond,
- C usually 4 total bond-order units,
- N commonly 3 bonds + 1 lone pair in the neutral introductory pattern,
- O commonly 2 bonds + 2 lone pairs in the neutral introductory pattern,
- halogens commonly 1 bond in the introductory neutral pattern.

This is a reference, not a claim that every charged/resonance structure follows the neutral pattern.

## D. Functional-group card

Do not show functional-group answers before U1-03 teaches them.

After U1-03 establishes a group, the toolbox may add a compact pattern card for that group.

Current Unit 1 set:
- alcohol,
- ether,
- ketone,
- carboxylic acid,
- amine,
- amide.

Each entry must show the **decisive local atom-and-bond pattern**, not merely the name.

## E. Geometry/hybridization card

Do not show before U1-05 establishes the mapping.

After teaching, allowed support may show:
- 4 directions -> tetrahedral -> sp3,
- 3 directions -> trigonal planar -> sp2,
- 2 directions -> linear -> sp.

## F. Scratch/notebook area

Available when the current scaffold/assessment permits it.

The system must distinguish:
- learner's own scratch work,
- system-provided answer-revealing hints.

Learner-created scratch work does not automatically contaminate evidence unless the assessment rules explicitly forbid notes.

---

# 3. REFERENCE ACCESS VS SUPPORT CONTAMINATION

The engine must know the current state before opening a toolbox panel.

## Teach / Watch / Build Together / Guided

Toolbox access is allowed unless the current micro-task intentionally checks retrieval of that exact reference fact.

Opening it logs reference use but does not create independent evidence anyway because these states are supported.

## Cold independent item

Before opening any potentially answer-revealing reference, show:

> **This is a cold check. Opening this reference will turn this question into supported practice. You can still learn from it, but this attempt will not count as independent evidence.**

Choices:
- Keep working without help
- Open reference and convert to practice

If learner opens it:
1. current item becomes supported,
2. independent-success eligibility for that item is false,
3. after repair/support, the engine must use a **different fresh item** for new evidence.

## Assessment-specific allowed references

If a future verified assessment explicitly allows a periodic table or other reference, the configuration may permit it without contamination.

Do not infer this from the historical Fall 2025 test having a periodic table printed on a page. Fall 2026 policy remains a separate fact to verify.

---

# 4. TOOLBOX OPEN/CLOSE BEHAVIOR

Required controls:
- `Chemistry Toolbox`
- `Close and return`

Opening the toolbox must not:
- navigate away from the course page,
- reset the current item,
- submit an answer,
- advance a lesson step,
- change the selected atom/bond unless the learner does so intentionally,
- lose typed scratch work.

On close, keyboard focus returns to the control/task that opened the toolbox.

---

# 5. PREREQUISITE REVIEW NAVIGATION CONTRACT

A learner may enter a prerequisite review from:
- a failed prerequisite gate,
- `Review this skill`,
- an IDK route,
- targeted repair after an error,
- Test 1 support.

Every such navigation must carry a **return context object**, not rely on browser history.

Minimum return context:
- source area (`unit1`, `test1-support`, etc.),
- source lesson/skill ID,
- source item/task ID when relevant,
- current workflow phase,
- return label,
- safe serialized learner state needed to resume,
- whether the interrupted item was already contaminated/supported.

Do not place sensitive learner data in an exposed query string if a safer local/session state mechanism is available.

---

# 6. REQUIRED RETURN CONTROLS

When a review was opened from Test 1 support, provide:

**Back to Test 1 Support**

When a review was opened from another Unit 1 skill, provide:

**Return to the skill I was working on**

If both are meaningful, the UI may show both with clear destination labels.

Do not use only:
- browser Back,
- uncontrolled new tabs,
- a generic `Home` button.

Those controls do not guarantee return to the interrupted task.

---

# 7. EXACT-RETURN RULE

Example:

`Test 1 support -> U1-04 boiling-point cold item -> prerequisite review U1-03 O-H vs O-C`

After the review, `Back to Test 1 Support` must restore the Unit 1/Test 1 support workflow at the point from which the learner left.

Important evidence rule:
If the learner left a cold item to review a prerequisite, that original item is now supported/contaminated. Returning may show the learner what happened, but **the system must not let the same item become clean evidence again**.

The engine should:
1. preserve the interrupted item's history,
2. mark it supported,
3. return the learner to the workflow,
4. give a fresh evidence item when she is ready to prove the skill cold.

---

# 8. RETURN-STATE FAILURE MODES

## N1 - Review sends learner to Day 1 and strands her there

Failure.

Required repair: explicit return destination persisted before navigation.

## N2 - Returning restarts Unit 1 from the beginning

Failure unless learner explicitly chose restart.

## N3 - Returning reuses the helped cold item as if it were fresh

Failure. Support contamination follows the item.

## N4 - Opening toolbox accidentally submits/clears work

Failure.

## N5 - Browser Back is the only return path

Failure.

## N6 - Multiple uncontrolled tabs are required

Failure on phone/iPad and inconsistent with the navigation contract.

---

# 9. ACCESSIBILITY + PHONE/IPAD REQUIREMENTS

1. Toolbox opens as a modal/drawer/sheet that fits portrait phone and iPad layouts.
2. No chemistry meaning may depend on color alone.
3. Periodic-table cells require readable text at zoom and keyboard/switch navigation where supported.
4. Focus is trapped appropriately while a modal is open and returns to the trigger on close.
5. `Esc` closes on keyboard-capable devices when appropriate, with an explicit close control always present.
6. Screen-reader labels identify element symbol/name and available detail action.
7. Large touch targets must not require tapping a tiny chemical symbol precisely.
8. Reduced-motion users receive no essential information only through animation.
9. Return controls state the destination in text.
10. Portrait layouts must not require horizontal scrolling for ordinary reference cards.

---

# 10. TELEMETRY CONTRACT

Suggested events:
- `TOOLBOX_OPEN`
- `TOOLBOX_CLOSE`
- `TOOLBOX_REFERENCE_VIEW`
- `TOOLBOX_COLD_CONTAMINATION_WARNING`
- `TOOLBOX_COLD_CONVERTED_TO_SUPPORT`
- `PREREQ_REVIEW_OPEN`
- `PREREQ_REVIEW_COMPLETE`
- `RETURN_CONTEXT_CREATED`
- `RETURN_CONTEXT_RESTORED`
- `RETURN_TO_TEST1`
- `RETURN_TO_SKILL`
- `RETURN_CONTEXT_FAILURE`

Useful fields:
- source lesson/item,
- destination review,
- workflow phase,
- reference opened,
- contamination status before/after,
- return success/failure.

Do not store answer text in telemetry unless the broader privacy/data contract explicitly requires and permits it.

---

# 11. RELEASE GATE

Before runtime release, answer YES to all:

1. Can the learner open/close the toolbox without losing task state?
2. Does the periodic table include the intended reference information without pretending neutral bonding patterns are universal?
3. Are functional-group/hybridization cards hidden until those concepts are taught?
4. Does cold reference access warn about contamination before revealing help?
5. Does helped cold work remain supported rather than silently becoming independent later?
6. Does a fresh item follow support before new independent evidence?
7. Can a prerequisite review preserve a precise return destination?
8. Can Test 1 support return to the exact workflow rather than the course home screen?
9. Is browser history not the sole navigation mechanism?
10. Are uncontrolled new tabs unnecessary?
11. Does return preserve learner state while preserving contamination history?
12. Does the design work on phone/iPad and with keyboard/screen reader/reduced motion?
13. Is Fall 2026 periodic-table policy treated as unverified until a current source confirms it?

Any NO blocks production.

---

# 12. DEFINITION OF DONE FOR U1-00

U1-00 is done when the learner can use allowed references efficiently, get targeted prerequisite help, and return exactly to her interrupted learning task without losing state or creating false mastery evidence.

This file does **not** award chemistry mastery by itself.